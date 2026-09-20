import * as cheerio from 'cheerio';

export class HtmlConverterEngine {
  static generateId() {
    return Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0') + Math.floor(Math.random() * 16).toString(16);
  }

  static convert(htmlContent, targetBuilder = 'elementor', options = {}) {
    const $ = cheerio.load(htmlContent);
    const title = options.title || $('title').text().trim() || 'Converted Theme Template';

    // Collect Sections
    let sectionEls = $('section, .rs-section, .elementor-section, .e-con, header, footer, main > div');
    if (sectionEls.length === 0) {
      sectionEls = $('body > div, body');
    }

    if (targetBuilder === 'divi') {
      return this.convertToDivi($, sectionEls, title);
    } else {
      return this.convertToElementor($, sectionEls, title);
    }
  }

  static convertToElementor($, sectionEls, title) {
    const rootContainers = [];

    sectionEls.each((idx, sec) => {
      const $sec = $(sec);
      // Skip empty or utility overlays
      if ($sec.is('script, style, noscript, #scrollUp, .rs-mouse, .preloader')) return;
      
      const secText = $sec.text().trim();
      const secImgs = $sec.find('img').length;
      if (!secText && secImgs === 0) return;

      const container = this.buildElementorContainer($, $sec, false);
      if (container && container.elements.length > 0) {
        rootContainers.push(container);
      }
    });

    return {
      version: '0.4',
      title,
      type: 'page',
      content: rootContainers,
      page_settings: {
        page_layout: 'elementor_header_footer'
      }
    };
  }

  static buildElementorContainer($, $el, isInner = true) {
    const elements = [];

    // Find headings, paragraphs, images, buttons inside
    $el.children().each((_, child) => {
      const $child = $(child);
      const tag = child.tagName.toLowerCase();

      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
        elements.push({
          id: this.generateId(),
          elType: 'widget',
          widgetType: 'heading',
          settings: {
            title: $child.text().trim(),
            header_size: tag
          },
          elements: []
        });
      } else if (tag === 'p') {
        const text = $child.text().trim();
        if (text) {
          elements.push({
            id: this.generateId(),
            elType: 'widget',
            widgetType: 'text-editor',
            settings: {
              editor: `<p>${text}</p>`
            },
            elements: []
          });
        }
      } else if (tag === 'img') {
        const src = $child.attr('src');
        if (src) {
          elements.push({
            id: this.generateId(),
            elType: 'widget',
            widgetType: 'image',
            settings: {
              image: { url: src }
            },
            elements: []
          });
        }
      } else if (tag === 'a' && ($child.hasClass('btn') || $child.text().trim().length < 35)) {
        elements.push({
          id: this.generateId(),
          elType: 'widget',
          widgetType: 'button',
          settings: {
            text: $child.text().trim() || 'Click Here',
            link: { url: $child.attr('href') || '#' }
          },
          elements: []
        });
      } else if ($child.children().length > 0) {
        // Recursive sub-container
        const subCon = this.buildElementorContainer($, $child, true);
        if (subCon && subCon.elements.length > 0) {
          elements.push(subCon);
        }
      } else {
        // Simple leaf with text
        const t = $child.text().trim();
        if (t && t.length > 2) {
          elements.push({
            id: this.generateId(),
            elType: 'widget',
            widgetType: 'text-editor',
            settings: {
              editor: `<p>${t}</p>`
            },
            elements: []
          });
        }
      }
    });

    return {
      id: this.generateId(),
      elType: 'container',
      isInner,
      settings: {
        container_type: 'flex',
        content_width: isInner ? 'full' : 'boxed',
        flex_direction: 'column'
      },
      elements
    };
  }

  static convertToDivi($, sectionEls, title) {
    const sections = [];

    sectionEls.each((idx, sec) => {
      const $sec = $(sec);
      if ($sec.is('script, style, noscript, #scrollUp, .rs-mouse, .preloader')) return;

      const rows = [
        {
          id: this.generateId(),
          type: 'row',
          attrs: { custom_padding: '30px|0px|30px|0px' },
          columns: [
            {
              id: this.generateId(),
              type: 'column',
              attrs: { type: '4_4' },
              modules: [
                {
                  id: this.generateId(),
                  type: 'et_pb_text',
                  attrs: {
                    content: `<h2>${$sec.find('h1, h2, h3').first().text().trim() || 'Section'}</h2><p>${$sec.find('p').first().text().trim() || ''}</p>`
                  }
                }
              ]
            }
          ]
        }
      ];

      sections.push({
        id: this.generateId(),
        type: 'section',
        attrs: { custom_padding: '60px|0px|60px|0px' },
        rows
      });
    });

    return {
      name: title,
      type: 'page',
      builder_version: '4.25.0',
      data: sections
    };
  }
}

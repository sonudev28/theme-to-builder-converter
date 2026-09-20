import * as cheerio from 'cheerio';

export class CleanConverterEngine {
  static generateId() {
    return Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0') + Math.floor(Math.random() * 16).toString(16);
  }

  static convert(htmlContent, targetBuilder = 'elementor', options = {}) {
    const $ = cheerio.load(htmlContent);
    const title = options.title || $('title').text().trim() || 'Converted Theme Template';

    // Cleanup noise
    $('script, style, noscript, svg, #wpadminbar, .preloader, #scrollUp, .progress-wrap, .elementor-screen-only').remove();

    // Identify sections
    let sections = [];
    $('section, header, footer, .elementor-top-section').each((_, el) => {
      const $el = $(el);
      const text = $el.text().trim();
      const imgs = $el.find('img').length;
      if (text.length > 5 || imgs > 0) {
        sections.push(el);
      }
    });

    if (sections.length === 0) {
      $('body > div, main > div').each((_, el) => {
        if ($(el).text().trim().length > 10) sections.push(el);
      });
    }

    if (targetBuilder === 'divi') {
      return this.convertToDivi($, sections, title);
    } else {
      return this.convertToElementor($, sections, title);
    }
  }

  static convertToElementor($, sections, title) {
    const rootContainers = [];

    for (const sec of sections) {
      const $sec = $(sec);
      const container = this.processSection($, $sec);
      if (container && container.elements.length > 0) {
        rootContainers.push(container);
      }
    }

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

  static processSection($, $sec) {
    const sectionContainer = {
      id: this.generateId(),
      elType: 'container',
      isInner: false,
      settings: {
        container_type: 'flex',
        content_width: 'boxed',
        flex_direction: 'column',
        padding: { unit: 'px', top: '60', right: '20', bottom: '60', left: '20', isLinked: false }
      },
      elements: []
    };

    // Extract all widgets directly inside section or in containers
    const widgets = [];
    this.extractWidgets($, $sec, widgets, 0);

    // Group into logical row containers if more than 1 widget
    if (widgets.length <= 4) {
      sectionContainer.elements = widgets;
    } else {
      // Chunk widgets into sensible rows
      let currentRow = {
        id: this.generateId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'column',
          margin: { unit: 'px', top: '0', right: '0', bottom: '20', left: '0', isLinked: false }
        },
        elements: []
      };

      for (const w of widgets) {
        if (w.widgetType === 'heading' && ['h1', 'h2'].includes(w.settings?.header_size) && currentRow.elements.length > 0) {
          sectionContainer.elements.push(currentRow);
          currentRow = {
            id: this.generateId(),
            elType: 'container',
            isInner: true,
            settings: {
              container_type: 'flex',
              content_width: 'full',
              flex_direction: 'column',
              margin: { unit: 'px', top: '0', right: '0', bottom: '20', left: '0', isLinked: false }
            },
            elements: []
          };
        }
        currentRow.elements.push(w);
      }
      if (currentRow.elements.length > 0) {
        sectionContainer.elements.push(currentRow);
      }
    }

    return sectionContainer;
  }

  static extractWidgets($, $node, widgetList, depth = 0) {
    if (depth > 6) return; // Prevent excessive nesting

    $node.children().each((_, child) => {
      const $child = $(child);
      const tag = child.tagName.toLowerCase();

      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
        const text = $child.text().trim();
        if (text) {
          widgetList.push({
            id: this.generateId(),
            elType: 'widget',
            widgetType: 'heading',
            settings: {
              title: text,
              header_size: tag
            },
            elements: []
          });
        }
      } else if (tag === 'p') {
        const text = $child.text().trim();
        if (text) {
          widgetList.push({
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
        if (src && !src.includes('data:image/svg')) {
          widgetList.push({
            id: this.generateId(),
            elType: 'widget',
            widgetType: 'image',
            settings: {
              image: { url: src }
            },
            elements: []
          });
        }
      } else if (tag === 'a' && ($child.hasClass('btn') || $child.hasClass('button') || $child.text().trim().length < 30)) {
        const text = $child.text().trim();
        if (text && text.length > 1) {
          widgetList.push({
            id: this.generateId(),
            elType: 'widget',
            widgetType: 'button',
            settings: {
              text: text,
              link: { url: $child.attr('href') || '#' }
            },
            elements: []
          });
        }
      } else if ($child.children().length > 0) {
        this.extractWidgets($, $child, widgetList, depth + 1);
      } else {
        const t = $child.text().trim();
        if (t && t.length > 25) {
          widgetList.push({
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
  }

  static convertToDivi($, sections, title) {
    const diviSections = [];

    for (const sec of sections) {
      const $sec = $(sec);
      const heading = $sec.find('h1, h2, h3, h4').first().text().trim() || 'Section';
      const desc = $sec.find('p').first().text().trim() || '';

      diviSections.push({
        id: this.generateId(),
        type: 'section',
        attrs: { custom_padding: '60px|0px|60px|0px' },
        rows: [
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
                      content: `<h2>${heading}</h2><p>${desc}</p>`
                    }
                  }
                ]
              }
            ]
          }
        ]
      });
    }

    return {
      name: title,
      type: 'page',
      builder_version: '4.25.0',
      data: diviSections
    };
  }
}

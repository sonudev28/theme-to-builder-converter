import * as cheerio from 'cheerio';

export class CleanConverterEngine {
  static generateId() {
    return Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0') + Math.floor(Math.random() * 16).toString(16);
  }

  /**
   * Fetches a live URL, unwraps ThemeForest preview iframes, inlines stylesheets,
   * converts relative URLs to absolute, and returns the consolidated HTML.
   */
  static async fetchAndConsolidate(targetUrl) {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
    
    console.log(`[CleanConverterEngine] Fetching live URL: ${targetUrl}`);
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch URL (${res.status} ${res.statusText})`);
    }

    let html = await res.text();
    let currentUrl = targetUrl;

    // Check for ThemeForest preview frame wrapper
    const $initial = cheerio.load(html);
    const iframeSrc = $initial('iframe#preview-frame, iframe[name="preview-frame"]').attr('src');
    if (iframeSrc && iframeSrc.startsWith('http')) {
      console.log(`[CleanConverterEngine] ThemeForest preview wrapper detected: ${iframeSrc}`);
      currentUrl = iframeSrc;
      const iframeRes = await fetch(iframeSrc, { headers: { 'User-Agent': userAgent } });
      if (iframeRes.ok) {
        html = await iframeRes.text();
      }
    }

    const $ = cheerio.load(html);

    // Make all relative image, link, and script URLs absolute
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      if (src && !src.startsWith('data:') && !src.startsWith('http')) {
        try { $(el).attr('src', new URL(src, currentUrl).href); } catch {}
      }
      const dataSrc = $(el).attr('data-src');
      if (dataSrc && !dataSrc.startsWith('data:') && !dataSrc.startsWith('http')) {
        try { $(el).attr('src', new URL(dataSrc, currentUrl).href); } catch {}
      }
    });

    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('javascript:')) {
        try { $(el).attr('href', new URL(href, currentUrl).href); } catch {}
      }
    });

    // Find all external CSS links
    const cssLinks = [];
    $('link[rel="stylesheet"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !href.includes('fonts.googleapis.com')) {
        try {
          cssLinks.push(new URL(href, currentUrl).href);
        } catch {}
      }
    });

    // Fetch up to 12 top stylesheets in parallel with a 4s timeout
    console.log(`[CleanConverterEngine] Inlining ${Math.min(cssLinks.length, 12)} stylesheets...`);
    const cssPromises = cssLinks.slice(0, 12).map(async (linkUrl) => {
      try {
        const cRes = await fetch(linkUrl, {
          headers: { 'User-Agent': userAgent },
          signal: AbortSignal.timeout(4000)
        });
        if (cRes.ok) return await cRes.text();
      } catch {}
      return '';
    });

    const cssContents = await Promise.all(cssPromises);
    const combinedCss = cssContents.join('\n');
    if (combinedCss.trim()) {
      $('head').append(`<style id="__t2b_inlined_styles">${combinedCss}</style>`);
    }

    return $.html();
  }

  /**
   * Main entry point to convert an HTML string into an Elementor or Divi template.
   */
  static convert(htmlContent, targetBuilder = 'elementor', options = {}) {
    const $ = cheerio.load(htmlContent);
    const title = options.title || $('title').text().trim() || 'Converted Theme Template';

    // Remove noise elements that interfere with templates
    $('script, noscript, #wpadminbar, .preloader, #preloader, #scrollUp, .progress-wrap, .elementor-screen-only, style#e-global-style, .cookie-notice').remove();

    // Collect all candidate sections
    const rawCandidates = [];
    $('section, header, footer, .elementor-top-section, [class*="slider-"], [class*="hero-"]').each((_, el) => {
      const $el = $(el);
      const cls = ($el.attr('class') || '').toLowerCase();
      const id = ($el.attr('id') || '').toLowerCase();

      // Skip offcanvas, modals, popups, and drawer widgets
      if (cls.includes('offcanvas') || cls.includes('modal') || cls.includes('search-popup') || cls.includes('cart-drawer') || id.includes('offcanvas') || id.includes('preloader')) {
        return;
      }

      const textLen = $el.text().trim().length;
      const imgLen = $el.find('img').length;
      if (textLen > 10 || imgLen > 0) {
        rawCandidates.push(el);
      }
    });

    // Filter to keep only TOP-LEVEL sections (no nested sections)
    const rootSections = rawCandidates.filter((el) => {
      return $(el).parents('section, header, footer').length === 0;
    });

    // Fallback if no clean sections found
    if (rootSections.length === 0) {
      $('body > div, main > div, #page > div').each((_, el) => {
        const $el = $(el);
        const cls = ($el.attr('class') || '').toLowerCase();
        if (!cls.includes('wrapper') && !cls.includes('page') && $el.text().trim().length > 30) {
          rootSections.push(el);
        }
      });
    }

    if (targetBuilder === 'divi') {
      return this.convertToDivi($, rootSections, title);
    } else {
      return this.convertToElementor($, rootSections, title, options);
    }
  }

  static convertToElementor($, rootSections, title, options = {}) {
    const rootContainers = [];

    for (const secEl of rootSections) {
      const $sec = $(secEl);
      const secContainer = this.buildSectionContainer($, $sec);
      if (secContainer && secContainer.elements.length > 0) {
        rootContainers.push(secContainer);
      }
    }

    return {
      version: '0.4',
      title,
      type: 'page',
      content: rootContainers,
      page_settings: {
        page_layout: 'elementor_canvas'
      }
    };
  }

  static buildSectionContainer($, $sec) {
    const cls = ($sec.attr('class') || '').toLowerCase();
    const styleAttr = $sec.attr('style') || '';

    // Detect background image
    let bgImage = null;
    const bgImgMatch = styleAttr.match(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/i);
    if (bgImgMatch) {
      bgImage = bgImgMatch[1];
    } else {
      const dataBg = $sec.attr('data-background') || $sec.attr('data-bg');
      if (dataBg) bgImage = dataBg;
    }

    const isDark = cls.includes('dark') || cls.includes('footer') || cls.includes('bg-dark') || styleAttr.includes('#1') || styleAttr.includes('#0');

    const rootSettings = {
      container_type: 'flex',
      content_width: 'boxed',
      flex_direction: 'column',
      padding: {
        unit: 'px',
        top: '80',
        right: '20',
        bottom: '80',
        left: '20',
        isLinked: false
      }
    };

    if (bgImage) {
      rootSettings.background_background = 'classic';
      rootSettings.background_image = { url: bgImage };
      rootSettings.background_size = 'cover';
      rootSettings.background_position = 'center center';
    } else if (isDark) {
      rootSettings.background_background = 'classic';
      rootSettings.background_color = '#0E131F';
    }

    const sectionContainer = {
      id: this.generateId(),
      elType: 'container',
      isInner: false,
      settings: rootSettings,
      elements: []
    };

    // 1. Process Title Block / Section Header
    const $titleBlock = $sec.find('.sec-title, .section-title, .title-box, .sec-title-one, .sec-title-two').first();
    if ($titleBlock.length > 0) {
      const headerContainer = this.buildTitleBlock($, $titleBlock, isDark);
      if (headerContainer) {
        sectionContainer.elements.push(headerContainer);
        $titleBlock.addClass('__t2b_processed');
      }
    }

    // 2. Identify Rows or Card Grids
    const rows = [];
    $sec.find('.row, .elementor-row, .swiper-wrapper, [class*="services-"]:has([class*="block"]), [class*="team-"]:has([class*="block"]), [class*="pricing-"]:has([class*="block"]), [class*="projects-"]:has([class*="block"])').each((_, rEl) => {
      const $r = $(rEl);
      if ($r.parents('.__t2b_processed').length > 0) return;
      rows.push($r);
    });

    if (rows.length > 0) {
      for (const $r of rows) {
        const rowContainer = this.buildRowContainer($, $r, isDark);
        if (rowContainer && rowContainer.elements.length > 0) {
          sectionContainer.elements.push(rowContainer);
          $r.addClass('__t2b_processed');
        }
      }
    } else {
      // Direct child cards or columns
      const cards = $sec.find('[class*="col-"], [class*="block"], [class*="card"], [class*="item"]').filter((_, el) => {
        return $(el).parents('.__t2b_processed').length === 0;
      });

      if (cards.length > 1) {
        const cardRow = this.buildCardGrid($, cards, isDark);
        if (cardRow) {
          sectionContainer.elements.push(cardRow);
        }
      } else {
        // Fallback linear content container
        const generalContainer = {
          id: this.generateId(),
          elType: 'container',
          isInner: true,
          settings: {
            container_type: 'flex',
            content_width: 'full',
            flex_direction: 'column'
          },
          elements: []
        };
        this.extractWidgetsFromNode($, $sec, generalContainer.elements, isDark);
        if (generalContainer.elements.length > 0) {
          sectionContainer.elements.push(generalContainer);
        }
      }
    }

    return sectionContainer;
  }

  static buildTitleBlock($, $titleBlock, isDark) {
    const subtitle = $titleBlock.find('.sec-title_title, .subtitle, .sub-title, .badge, .sub_title').first().text().trim();
    const heading = $titleBlock.find('h1, h2, h3, .sec-title_heading, .heading').first().text().trim();
    const desc = $titleBlock.find('p, .text, .sec-title_text').first().text().trim();
    const btn = $titleBlock.find('a.btn, a.theme-btn, a.button').first();

    const isCentered = $titleBlock.hasClass('centered') || $titleBlock.hasClass('text-center');

    const titleContainer = {
      id: this.generateId(),
      elType: 'container',
      isInner: true,
      settings: {
        container_type: 'flex',
        content_width: 'full',
        flex_direction: btn.length > 0 ? 'row' : 'column',
        flex_justify_content: btn.length > 0 ? 'space-between' : (isCentered ? 'center' : 'flex-start'),
        flex_align_items: btn.length > 0 ? 'flex-end' : (isCentered ? 'center' : 'flex-start'),
        margin: { unit: 'px', top: '0', right: '0', bottom: '40', left: '0', isLinked: false }
      },
      elements: []
    };

    const textGroup = {
      id: this.generateId(),
      elType: 'container',
      isInner: true,
      settings: {
        container_type: 'flex',
        content_width: 'full',
        flex_direction: 'column',
        flex_align_items: isCentered ? 'center' : 'flex-start'
      },
      elements: []
    };

    if (subtitle) {
      textGroup.elements.push({
        id: this.generateId(),
        elType: 'widget',
        widgetType: 'heading',
        settings: {
          title: subtitle.toUpperCase(),
          header_size: 'h6',
          align: isCentered ? 'center' : 'left',
          title_color: '#DD131A',
          typography_typography: 'custom',
          typography_font_size: { unit: 'px', size: 14 },
          typography_font_weight: '700',
          typography_letter_spacing: { unit: 'px', size: 1.5 }
        },
        elements: []
      });
    }

    if (heading) {
      textGroup.elements.push({
        id: this.generateId(),
        elType: 'widget',
        widgetType: 'heading',
        settings: {
          title: heading,
          header_size: 'h2',
          align: isCentered ? 'center' : 'left',
          title_color: isDark ? '#FFFFFF' : '#141B27',
          typography_typography: 'custom',
          typography_font_size: { unit: 'px', size: 36 },
          typography_font_weight: '700',
          typography_line_height: { unit: 'em', size: 1.25 }
        },
        elements: []
      });
    }

    if (desc) {
      textGroup.elements.push({
        id: this.generateId(),
        elType: 'widget',
        widgetType: 'text-editor',
        settings: {
          editor: `<p>${desc}</p>`,
          align: isCentered ? 'center' : 'left',
          text_color: isDark ? '#A0AEC0' : '#64748B'
        },
        elements: []
      });
    }

    titleContainer.elements.push(textGroup);

    if (btn.length > 0) {
      titleContainer.elements.push({
        id: this.generateId(),
        elType: 'widget',
        widgetType: 'button',
        settings: {
          text: btn.text().trim() || 'Learn More',
          link: { url: btn.attr('href') || '#' },
          background_color: '#DD131A',
          button_text_color: '#FFFFFF',
          border_radius: { unit: 'px', top: '6', right: '6', bottom: '6', left: '6', isLinked: true },
          padding: { unit: 'px', top: '14', right: '28', bottom: '14', left: '28', isLinked: false }
        },
        elements: []
      });
    }

    return titleContainer;
  }

  static buildRowContainer($, $r, isDark) {
    let cols = $r.children('[class*="col-"], .swiper-slide, [class*="block"], [class*="item"]').toArray();
    if (cols.length === 0) {
      cols = $r.children('div').toArray();
    }

    if (cols.length === 0) return null;

    const rowContainer = {
      id: this.generateId(),
      elType: 'container',
      isInner: true,
      settings: {
        container_type: 'flex',
        content_width: 'full',
        flex_direction: 'row',
        flex_wrap: 'wrap',
        gap: { unit: 'px', size: 24 },
        margin: { unit: 'px', top: '0', right: '0', bottom: '30', left: '0', isLinked: false }
      },
      elements: []
    };

    const totalCols = cols.length;
    for (const colEl of cols) {
      const $col = $(colEl);
      const colCls = ($col.attr('class') || '').toLowerCase();

      let widthPercent = 100;
      if (colCls.includes('col-lg-4') || colCls.includes('col-md-4') || colCls.includes('col-4')) {
        widthPercent = 33.333;
      } else if (colCls.includes('col-lg-6') || colCls.includes('col-md-6') || colCls.includes('col-6')) {
        widthPercent = 50;
      } else if (colCls.includes('col-lg-3') || colCls.includes('col-md-3') || colCls.includes('col-3')) {
        widthPercent = 25;
      } else if (colCls.includes('col-lg-8') || colCls.includes('col-md-8')) {
        widthPercent = 66.667;
      } else if (colCls.includes('col-lg-12') || colCls.includes('col-12')) {
        widthPercent = 100;
      } else if (totalCols === 3) {
        widthPercent = 33.333;
      } else if (totalCols === 4) {
        widthPercent = 25;
      } else if (totalCols === 2) {
        widthPercent = 50;
      }

      let calcWidth = widthPercent;
      if (widthPercent === 33.333) calcWidth = 31;
      else if (widthPercent === 25) calcWidth = 23;
      else if (widthPercent === 50) calcWidth = 48;

      const isCard = colCls.includes('block') || colCls.includes('card') || colCls.includes('item') || $col.find('[class*="block"], [class*="inner"]').length > 0;

      const colSettings = {
        container_type: 'flex',
        content_width: 'full',
        width: { unit: '%', size: calcWidth },
        flex_direction: 'column',
        padding: isCard ? { unit: 'px', top: '30', right: '25', bottom: '30', left: '25', isLinked: false } : undefined,
        background_background: isCard ? 'classic' : undefined,
        background_color: isCard ? (isDark ? '#141B27' : '#FFFFFF') : undefined,
        border_radius: isCard ? { unit: 'px', top: '12', right: '12', bottom: '12', left: '12', isLinked: true } : undefined,
        box_shadow_box_shadow_type: isCard ? 'yes' : undefined,
        box_shadow_box_shadow: isCard ? { horizontal: 0, vertical: 8, blur: 20, spread: 0, color: 'rgba(0, 0, 0, 0.05)' } : undefined
      };

      const colContainer = {
        id: this.generateId(),
        elType: 'container',
        isInner: true,
        settings: colSettings,
        elements: []
      };

      this.extractWidgetsFromNode($, $col, colContainer.elements, isDark);

      if (colContainer.elements.length > 0) {
        rowContainer.elements.push(colContainer);
      }
    }

    return rowContainer;
  }

  static buildCardGrid($, cards, isDark) {
    const rowContainer = {
      id: this.generateId(),
      elType: 'container',
      isInner: true,
      settings: {
        container_type: 'flex',
        content_width: 'full',
        flex_direction: 'row',
        flex_wrap: 'wrap',
        gap: { unit: 'px', size: 24 }
      },
      elements: []
    };

    const count = cards.length;
    let widthPercent = 31;
    if (count === 2) widthPercent = 48;
    if (count >= 4) widthPercent = 23;

    cards.each((_, el) => {
      const $card = $(el);
      const colContainer = {
        id: this.generateId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          width: { unit: '%', size: widthPercent },
          flex_direction: 'column',
          padding: { unit: 'px', top: '30', right: '25', bottom: '30', left: '25', isLinked: false },
          background_background: 'classic',
          background_color: isDark ? '#141B27' : '#FFFFFF',
          border_radius: { unit: 'px', top: '12', right: '12', bottom: '12', left: '12', isLinked: true }
        },
        elements: []
      };

      this.extractWidgetsFromNode($, $card, colContainer.elements, isDark);
      if (colContainer.elements.length > 0) {
        rowContainer.elements.push(colContainer);
      }
    });

    return rowContainer;
  }

  static extractWidgetsFromNode($, $node, widgetList, isDark, depth = 0) {
    if (depth > 6) return;

    // 1. Images
    $node.find('img').each((_, imgEl) => {
      const $img = $(imgEl);
      if ($img.hasClass('__t2b_done')) return;
      const src = $img.attr('src') || $img.attr('data-src');
      if (src && !src.includes('data:image/svg') && !src.includes('lazyload')) {
        widgetList.push({
          id: this.generateId(),
          elType: 'widget',
          widgetType: 'image',
          settings: {
            image: { url: src },
            image_size: 'full',
            align: 'center'
          },
          elements: []
        });
        $img.addClass('__t2b_done');
      }
    });

    // 2. Headings
    $node.find('h1, h2, h3, h4, h5, h6').each((_, hEl) => {
      const $h = $(hEl);
      if ($h.hasClass('__t2b_done') || $h.parents('.__t2b_processed').length > 0) return;
      const text = $h.text().trim();
      if (text && text.length > 1) {
        const tag = hEl.tagName.toLowerCase();
        let fontSize = 22;
        if (tag === 'h1') fontSize = 42;
        if (tag === 'h2') fontSize = 32;
        if (tag === 'h3') fontSize = 22;
        if (tag === 'h4') fontSize = 18;

        widgetList.push({
          id: this.generateId(),
          elType: 'widget',
          widgetType: 'heading',
          settings: {
            title: text,
            header_size: tag,
            title_color: isDark ? '#FFFFFF' : '#141B27',
            typography_typography: 'custom',
            typography_font_size: { unit: 'px', size: fontSize },
            typography_font_weight: '700'
          },
          elements: []
        });
        $h.addClass('__t2b_done');
      }
    });

    // 3. Paragraphs
    $node.find('p').each((_, pEl) => {
      const $p = $(pEl);
      if ($p.hasClass('__t2b_done') || $p.parents('.__t2b_processed').length > 0) return;
      const text = $p.text().trim();
      if (text && text.length > 4) {
        widgetList.push({
          id: this.generateId(),
          elType: 'widget',
          widgetType: 'text-editor',
          settings: {
            editor: `<p>${text}</p>`,
            text_color: isDark ? '#CBD5E1' : '#64748B'
          },
          elements: []
        });
        $p.addClass('__t2b_done');
      }
    });

    // 4. Buttons
    $node.find('a.btn, a.theme-btn, a.button, a[class*="btn-"], a[class*="button"]').each((_, aEl) => {
      const $a = $(aEl);
      if ($a.hasClass('__t2b_done')) return;
      const text = $a.text().trim();
      if (text && text.length > 1 && text.length < 40) {
        widgetList.push({
          id: this.generateId(),
          elType: 'widget',
          widgetType: 'button',
          settings: {
            text: text,
            link: { url: $a.attr('href') || '#' },
            background_color: '#DD131A',
            button_text_color: '#FFFFFF',
            border_radius: { unit: 'px', top: '6', right: '6', bottom: '6', left: '6', isLinked: true },
            padding: { unit: 'px', top: '12', right: '24', bottom: '12', left: '24', isLinked: false }
          },
          elements: []
        });
        $a.addClass('__t2b_done');
      }
    });
  }

  static convertToDivi($, rootSections, title) {
    const diviSections = [];

    for (const secEl of rootSections) {
      const $sec = $(secEl);
      const heading = $sec.find('h1, h2, h3, h4').first().text().trim() || 'Section';
      const desc = $sec.find('p').first().text().trim() || '';
      const img = $sec.find('img').first().attr('src') || '';

      const modules = [
        {
          id: this.generateId(),
          type: 'et_pb_text',
          attrs: { content: `<h2>${heading}</h2><p>${desc}</p>` }
        }
      ];

      if (img) {
        modules.push({
          id: this.generateId(),
          type: 'et_pb_image',
          attrs: { src: img }
        });
      }

      diviSections.push({
        id: this.generateId(),
        type: 'section',
        attrs: { custom_padding: '80px|0px|80px|0px' },
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
                modules
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

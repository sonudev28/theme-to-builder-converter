/**
 * Theme2Builder - Universal In-Browser Visual Geometry Engine (Compact High-Fidelity)
 * Zero AI Cost · 100% Native Elementor Flexbox JSON Compiler
 * Automatically flattens wrapper hell and snaps columns into tight, beautiful Flexbox rows.
 */

window.Theme2BuilderScanner = {
  scan: function(doc = document, win = window) {
    function parseColor(str) {
      if (!str || str === 'transparent' || str === 'rgba(0, 0, 0, 0)') return '';
      const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (!match) return str;
      const [_, r, g, b, a] = match;
      if (a !== undefined && parseFloat(a) < 1) {
        if (parseFloat(a) === 0) return '';
        return `rgba(${r}, ${g}, ${b}, ${parseFloat(a).toFixed(2)})`;
      }
      const hex = ((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b)).toString(16).slice(1);
      return `#${hex.toUpperCase()}`;
    }

    function parseBgImage(str) {
      if (!str || str === 'none') return '';
      const match = str.match(/url\(["']?([^"']+)["']?\)/);
      return match ? match[1] : '';
    }

    function generateId() {
      return Math.random().toString(36).substring(2, 9);
    }

    function getCleanText(el) {
      return el.textContent ? el.textContent.trim().replace(/\s+/g, ' ') : '';
    }

    // 1. Discover all structural page sections
    const rootNodes = [];

    // Header
    const header = doc.querySelector('header, .main-header');
    if (header && header.offsetHeight > 40) {
      rootNodes.push({ role: 'header', el: header });
    }

    // Content sections
    const elCont = doc.querySelector('.elementor');
    if (elCont && elCont.children.length > 2) {
      Array.from(elCont.children).forEach((c, i) => {
        if (c.offsetHeight > 50 && win.getComputedStyle(c).display !== 'none') {
          rootNodes.push({ role: 'section-' + (i + 1), el: c });
        }
      });
    } else {
      const pageWrap = doc.querySelector('.page-wrapper') || doc.querySelector('#page') || doc.querySelector('main') || doc.body;
      const candidates = pageWrap.querySelectorAll(':scope > section, :scope > div[class*="section"], :scope > div[class*="area"], :scope > div[class*="banner"]');
      if (candidates.length > 2) {
        candidates.forEach((c, i) => {
          if (c.offsetHeight > 50 && win.getComputedStyle(c).display !== 'none') {
            rootNodes.push({ role: 'section-' + (i + 1), el: c });
          }
        });
      } else {
        Array.from(pageWrap.children).forEach((c, i) => {
          const s = win.getComputedStyle(c);
          if (s.display !== 'none' && s.visibility !== 'hidden' && c.offsetHeight > 60 && c.offsetWidth > 300) {
            if (!['header', 'footer'].includes(c.tagName.toLowerCase())) {
              rootNodes.push({ role: 'section-' + (i + 1), el: c });
            }
          }
        });
      }
    }

    // Footer
    const footer = doc.querySelector('footer, .main-footer');
    if (footer && footer.offsetHeight > 40) {
      rootNodes.push({ role: 'footer', el: footer });
    }

    console.log(`[Theme2Builder] Discovered ${rootNodes.length} structural page sections.`);

    const elementorSections = [];

    for (const node of rootNodes) {
      const secEl = node.el;
      const s = win.getComputedStyle(secEl);

      // Extract section background
      let bgColor = parseColor(s.backgroundColor);
      let bgImg = parseBgImage(s.backgroundImage);

      const bgCandidates = [secEl, ...Array.from(secEl.querySelectorAll('section, div[class*="-one"], div[class*="-two"], div[class*="section"], .footer-bottom, .widgets-section'))];
      for (const b of bgCandidates) {
        const bs = win.getComputedStyle(b);
        if (!bgColor) {
          const c = parseColor(bs.backgroundColor);
          if (c && c !== '#FFFFFF') bgColor = c;
        }
        if (!bgImg) {
          const img = parseBgImage(bs.backgroundImage);
          if (img) bgImg = img;
        }
      }

      const pTop = parseInt(s.paddingTop) || (node.role === 'header' ? 15 : 60);
      const pBottom = parseInt(s.paddingBottom) || (node.role === 'header' ? 15 : 60);

      const rootContainer = {
        id: generateId(),
        elType: 'container',
        settings: {
          content_width: 'full',
          flex_direction: 'column',
          boxed_width: { unit: 'px', size: 1200 },
          padding: {
            unit: 'px',
            top: String(pTop),
            bottom: String(pBottom),
            left: '20',
            right: '20',
            isLinked: false
          }
        },
        elements: []
      };

      if (bgColor) {
        rootContainer.settings.background_background = 'classic';
        rootContainer.settings.background_color = bgColor;
      }
      if (bgImg) {
        rootContainer.settings.background_background = 'classic';
        rootContainer.settings.background_image = { url: bgImg, id: '' };
        rootContainer.settings.background_size = 'cover';
        rootContainer.settings.background_position = 'center center';
      }

      // Boxed inner content container
      const innerContainer = {
        id: generateId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'boxed',
          boxed_width: { unit: 'px', size: 1200 },
          flex_direction: 'column',
          gap: { unit: 'px', size: 28 }
        },
        elements: []
      };

      // Extract section layout using clean visual rows and cards
      compileSectionLayout(secEl, innerContainer, win, parseColor, parseBgImage, generateId, getCleanText);

      if (innerContainer.elements.length > 0) {
        rootContainer.elements.push(innerContainer);
        elementorSections.push(rootContainer);
      }
    }

    return {
      version: '0.4',
      title: doc.title ? doc.title.split(/[-|]/)[0].trim() : 'Converted Theme',
      type: 'page',
      content: elementorSections
    };
  }
};

function compileSectionLayout(secEl, innerContainer, win, parseColor, parseBgImage, generateId, getCleanText) {
  // If carousel/slider, target the active slide
  let targetRoot = secEl;
  if (secEl.querySelector('.swiper-slide')) {
    targetRoot = secEl.querySelector('.swiper-slide:not(.swiper-slide-duplicate)') || secEl.querySelector('.swiper-slide') || secEl;
  }

  // 1. Find section title / heading block at the top if present
  const sectionTitleBlock = targetRoot.querySelector('.sec-title, .title-box, [class*="section-title"], [class*="_title"], [class*="-title"]');
  if (sectionTitleBlock) {
    const titleWidgets = extractWidgetsFromContainer(sectionTitleBlock, win, parseColor, generateId, getCleanText);
    if (titleWidgets.length > 0) {
      const titleWrap = {
        id: generateId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'column',
          align_items: 'center',
          gap: { unit: 'px', size: 8 }
        },
        elements: titleWidgets
      };
      innerContainer.elements.push(titleWrap);
    }
  }

  // 2. Find all grid rows or multi-column containers
  const rows = targetRoot.querySelectorAll('.row, [class*="services-"], [class*="team-"], [class*="case-"], [class*="process-"]');
  const validRows = Array.from(rows).filter(r => {
    // Has multiple direct children or col-* children
    const cols = r.querySelectorAll(':scope > [class*="col-"], :scope > [class*="block"], :scope > [class*="item"]');
    return cols.length > 1 && win.getComputedStyle(r).display !== 'none';
  });

  if (validRows.length > 0) {
    for (const r of validRows) {
      const colElements = Array.from(r.querySelectorAll(':scope > [class*="col-"], :scope > [class*="block"], :scope > [class*="item"]'));
      if (colElements.length === 0) continue;

      const rowContainer = {
        id: generateId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'row',
          flex_wrap: 'wrap',
          justify_content: 'space-between',
          align_items: 'stretch',
          gap: { unit: 'px', size: 24 },
          width: { unit: '%', size: 100 },
          custom_css: 'selector { display: flex !important; flex-direction: row !important; flex-wrap: wrap !important; width: 100% !important; }'
        },
        elements: []
      };

      const colCount = colElements.length;
      let widthPercent = 31;
      if (colCount === 2) widthPercent = 48;
      else if (colCount === 4) widthPercent = 23;
      else if (colCount >= 3) widthPercent = 31; // 3 per row (e.g. 3 cards or 6 cards in 3x2)

      for (const col of colElements) {
        // Specific class overrides
        let actualWidth = widthPercent;
        if (col.className.includes('col-lg-5')) actualWidth = 40;
        else if (col.className.includes('col-lg-7')) actualWidth = 58;
        else if (col.className.includes('col-lg-8')) actualWidth = 64;
        else if (col.className.includes('col-lg-4')) actualWidth = 31;
        else if (col.className.includes('col-lg-6')) actualWidth = 48;

        const colContainer = compileColumnOrCard(col, actualWidth, win, parseColor, parseBgImage, generateId, getCleanText);
        rowContainer.elements.push(colContainer);
      }
      innerContainer.elements.push(rowContainer);
    }
  } else {
    // If no .row, use generic visual row groupings
    parseGenericBranch(targetRoot, innerContainer, win, parseColor, parseBgImage, generateId, getCleanText);
  }
}

function compileColumnOrCard(colEl, widthPercent, win, parseColor, parseBgImage, generateId, getCleanText) {
  const s = win.getComputedStyle(colEl);
  const bg = parseColor(s.backgroundColor);
  const br = parseInt(s.borderRadius) || 0;
  const shadow = s.boxShadow && s.boxShadow !== 'none';

  // Check if this column acts as a card
  const innerCard = colEl.querySelector('[class*="inner"], [class*="box"], [class*="single"], .card') || colEl;
  const ics = win.getComputedStyle(innerCard);
  const cardBg = parseColor(ics.backgroundColor) || bg;
  const cardBr = parseInt(ics.borderRadius) || br;
  const hasCardStyling = (cardBg && cardBg !== 'transparent') || cardBr >= 6 || (ics.boxShadow && ics.boxShadow !== 'none');

  const container = {
    id: generateId(),
    elType: 'container',
    isInner: true,
    settings: {
      container_type: 'flex',
      content_width: 'full',
      flex_direction: 'column',
      width: { unit: '%', size: widthPercent },
      _element_custom_width: { unit: '%', size: widthPercent },
      custom_css: `selector { width: ${widthPercent}% !important; max-width: ${widthPercent}% !important; flex: 0 0 ${widthPercent}% !important; }`,
      flex_grow: 0,
      flex_shrink: 0,
      gap: { unit: 'px', size: 16 }
    },
    elements: []
  };

  if (hasCardStyling) {
    if (cardBg && cardBg !== 'transparent') {
      container.settings.background_background = 'classic';
      container.settings.background_color = cardBg;
    }
    container.settings.border_radius = {
      unit: 'px',
      top: String(cardBr || 12),
      right: String(cardBr || 12),
      bottom: String(cardBr || 12),
      left: String(cardBr || 12)
    };
    container.settings.padding = {
      unit: 'px',
      top: '32',
      bottom: '32',
      left: '28',
      right: '28',
      isLinked: false
    };
    container.settings.box_shadow_box_shadow = {
      horizontal: 0,
      vertical: 10,
      blur: 30,
      spread: 0,
      color: 'rgba(0, 0, 0, 0.08)'
    };
  }

  // Extract all widgets directly inside this column/card
  const widgets = extractWidgetsFromContainer(colEl, win, parseColor, generateId, getCleanText);
  container.elements = widgets;

  return container;
}

function extractWidgetsFromContainer(parent, win, parseColor, generateId, getCleanText) {
  const widgets = [];

  // 1. Check for Image (single dominant image inside column)
  const imgEl = parent.querySelector('img');
  if (imgEl) {
    const src = imgEl.currentSrc || imgEl.src || imgEl.getAttribute('data-src') || imgEl.getAttribute('data-lazy-src') || imgEl.getAttribute('data-original');
    if (src && !src.startsWith('data:image/svg') && !src.endsWith('.svg')) {
      widgets.push({
        id: generateId(),
        elType: 'widget',
        widgetType: 'image',
        settings: {
          image: { url: src, id: '' },
          image_size: 'full',
          align: 'center'
        }
      });
    }
  }

  // 2. Check for Icon / Badge
  const iconEl = parent.querySelector('svg, i[class*="fa"], span[class*="icon"], [class*="icon"]');
  if (iconEl && !imgEl) {
    const is = win.getComputedStyle(iconEl);
    widgets.push({
      id: generateId(),
      elType: 'widget',
      widgetType: 'icon',
      settings: {
        selected_icon: { value: 'fas fa-shield-alt', library: 'fa-solid' },
        primary_color: parseColor(is.color) || '#DD131A',
        view: 'default'
      }
    });
  }

  // 3. Check for Headings
  const headings = parent.querySelectorAll('h1, h2, h3, h4, h5, h6, .title, .sub-title');
  headings.forEach(h => {
    if (h.closest('nav, .navigation, .main-menu, .navbar, .sub-menu, .submenu, .dropdown-menu, .menu-outer')) return;
    const text = getCleanText(h);
    if (!text || text.length > 120) return;
    const hs = win.getComputedStyle(h);
    widgets.push({
      id: generateId(),
      elType: 'widget',
      widgetType: 'heading',
      settings: {
        title: text,
        header_size: /^h[1-6]$/.test(h.tagName.toLowerCase()) ? h.tagName.toLowerCase() : 'h4',
        title_color: parseColor(hs.color) || '#111827',
        typography_typography: 'custom',
        typography_font_size: { unit: 'px', size: parseInt(hs.fontSize) || 20 },
        typography_font_weight: hs.fontWeight || '700',
        align: hs.textAlign === 'center' ? 'center' : 'left'
      }
    });
  });

  // 4. Check for Paragraph / Text
  const paragraphs = parent.querySelectorAll('p, li, .text, .desc');
  paragraphs.forEach(p => {
    // Skip navigation menus and dropdown submenus
    if (p.closest('nav, .navigation, .main-menu, .navbar, .sub-menu, .submenu, .dropdown-menu, .menu-outer')) return;
    const text = getCleanText(p);
    if (!text || text.length > 500) return;
    const ps = win.getComputedStyle(p);
    widgets.push({
      id: generateId(),
      elType: 'widget',
      widgetType: 'text-editor',
      settings: {
        editor: `<p>${p.innerHTML || text}</p>`,
        text_color: parseColor(ps.color) || '#6B7280',
        typography_typography: 'custom',
        typography_font_size: { unit: 'px', size: parseInt(ps.fontSize) || 15 },
        align: ps.textAlign === 'center' ? 'center' : 'left'
      }
    });
  });

  // 5. Check for Buttons
  const buttons = parent.querySelectorAll('a.theme-btn, a.btn, button, [role="button"], a[class*="link"], a[class*="btn"]');
  buttons.forEach(btn => {
    const text = getCleanText(btn);
    if (!text || text.length > 35) return;
    const bs = win.getComputedStyle(btn);
    widgets.push({
      id: generateId(),
      elType: 'widget',
      widgetType: 'button',
      settings: {
        text: text,
        link: { url: btn.getAttribute('href') || '#' },
        button_text_color: parseColor(bs.color) || '#FFFFFF',
        background_color: parseColor(bs.backgroundColor) || '#DD131A',
        border_radius: { unit: 'px', top: 6, right: 6, bottom: 6, left: 6 },
        align: bs.textAlign === 'center' ? 'center' : 'left'
      }
    });
  });

  // 6. Check for Form Inputs / Select / Search
  const inputs = parent.querySelectorAll('input:not([type="hidden"]), select, textarea');
  if (inputs.length > 0 && !parent.querySelector('h1, h2, h3, h4, h5, h6, img')) {
    const inputHtml = Array.from(inputs).map(inp => inp.outerHTML).join('\n');
    widgets.push({
      id: generateId(),
      elType: 'widget',
      widgetType: 'html',
      settings: {
        html: `<div style="width: 100%; display: flex; gap: 8px;">${inputHtml}</div>`
      }
    });
  }

  return widgets;
}

function parseGenericBranch(node, container, win, parseColor, parseBgImage, generateId, getCleanText) {
  const children = Array.from(node.children).filter(c => win.getComputedStyle(c).display !== 'none');
  for (const child of children) {
    const widgets = extractWidgetsFromContainer(child, win, parseColor, generateId, getCleanText);
    if (widgets.length > 0) {
      container.elements.push(...widgets);
    }
  }
}

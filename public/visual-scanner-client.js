/**
 * Theme2Builder - Universal In-Browser Visual Geometry Engine
 * Zero AI Cost · 100% Native Elementor Flexbox JSON Compiler
 * Recursively analyzes live rendered CSS, DOM geometry, and multi-column flex grids.
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

    // 1. Discover all root sections
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

      // Section Background Extraction (Inspect self and prominent children)
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
        settings: {
          content_width: 'boxed',
          boxed_width: { unit: 'px', size: 1200 },
          flex_direction: 'column',
          gap: { unit: 'px', size: 24 }
        },
        elements: []
      };

      // Unroll wrappers down to meaningful rows/grids
      parseSubtreeRecursive(secEl, innerContainer, win, parseColor, parseBgImage, generateId, getCleanText);

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

function parseSubtreeRecursive(node, targetContainer, win, parseColor, parseBgImage, generateId, getCleanText) {
  // If carousel/slider, target the active slide
  if (node.classList.contains('swiper-container') || node.querySelector('.swiper-wrapper')) {
    const activeSlide = node.querySelector('.swiper-slide:not(.swiper-slide-duplicate)') || node.querySelector('.swiper-slide');
    if (activeSlide) {
      parseSubtreeRecursive(activeSlide, targetContainer, win, parseColor, parseBgImage, generateId, getCleanText);
      return;
    }
  }

  // Filter valid visual children (exclude absolute background patterns with no text/images)
  const children = Array.from(node.children).filter(c => {
    const s = win.getComputedStyle(c);
    if (s.display === 'none' || s.visibility === 'hidden' || c.offsetHeight < 5) return false;
    // Skip background pattern divs
    if (s.position === 'absolute' && !c.querySelector('img, h1, h2, h3, h4, h5, h6, p, a, button')) {
      return false;
    }
    return true;
  });

  if (children.length === 0) return;

  // Check if this node is a single wrapper (e.g. .elementor-widget, .container, .row)
  if (children.length === 1 && !checkIsVisualCard(children[0], win.getComputedStyle(children[0]), parseColor)) {
    parseSubtreeRecursive(children[0], targetContainer, win, parseColor, parseBgImage, generateId, getCleanText);
    return;
  }

  // Check for multi-column row grouping
  const rows = groupChildrenIntoRows(children, win);

  for (const row of rows) {
    if (row.length > 1) {
      // Row container
      const rowContainer = {
        id: generateId(),
        elType: 'container',
        settings: {
          flex_direction: 'row',
          flex_wrap: 'wrap',
          justify_content: 'space-between',
          align_items: 'stretch',
          gap: { unit: 'px', size: 24 },
          width: { unit: '%', size: 100 }
        },
        elements: []
      };

      const parentWidth = node.getBoundingClientRect().width || 1200;

      for (const colItem of row) {
        const colRect = colItem.getBoundingClientRect();
        let colPercent = Math.min(100, Math.max(15, Math.round((colRect.width / parentWidth) * 100)));
        // Snap common percentages
        if (colPercent >= 45 && colPercent <= 55) colPercent = 50;
        else if (colPercent >= 30 && colPercent <= 36) colPercent = 33.333;
        else if (colPercent >= 22 && colPercent <= 27) colPercent = 25;
        else if (colPercent >= 64 && colPercent <= 69) colPercent = 66.666;

        const colContainer = buildFlexContainer(colItem, colPercent, win, parseColor, parseBgImage, generateId, getCleanText);
        rowContainer.elements.push(colContainer);
      }
      targetContainer.elements.push(rowContainer);
    } else {
      // Single element
      const single = row[0];
      const s = win.getComputedStyle(single);
      const isCard = checkIsVisualCard(single, s, parseColor);

      if (isCard) {
        const colContainer = buildFlexContainer(single, 100, win, parseColor, parseBgImage, generateId, getCleanText);
        targetContainer.elements.push(colContainer);
      } else {
        const leafWidget = buildLeafWidget(single, s, single.getBoundingClientRect(), win, parseColor, generateId, getCleanText);
        if (leafWidget) {
          targetContainer.elements.push(leafWidget);
        } else if (single.children.length > 0) {
          parseSubtreeRecursive(single, targetContainer, win, parseColor, parseBgImage, generateId, getCleanText);
        }
      }
    }
  }
}

function groupChildrenIntoRows(elements, win) {
  const rows = [];
  let currentRow = [];

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const rect = el.getBoundingClientRect();

    if (currentRow.length === 0) {
      currentRow.push(el);
    } else {
      const prev = currentRow[currentRow.length - 1];
      const prevRect = prev.getBoundingClientRect();

      // If top offsets are within 30px, they are horizontally aligned
      if (Math.abs(rect.top - prevRect.top) < 30 && rect.left > prevRect.left) {
        currentRow.push(el);
      } else {
        rows.push(currentRow);
        currentRow = [el];
      }
    }
  }
  if (currentRow.length > 0) rows.push(currentRow);
  return rows;
}

function checkIsVisualCard(el, s, parseColor) {
  const bg = parseColor(s.backgroundColor);
  const br = parseInt(s.borderRadius) || 0;
  const shadow = s.boxShadow && s.boxShadow !== 'none';
  const border = parseInt(s.borderWidth) > 0;
  const isBlock = el.className.includes('card') || el.className.includes('block') || el.className.includes('item') || el.className.includes('box');
  return (bg && bg !== 'transparent') || br >= 6 || shadow || border || (isBlock && el.children.length > 1);
}

function buildFlexContainer(el, widthPercent, win, parseColor, parseBgImage, generateId, getCleanText) {
  const s = win.getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  const bg = parseColor(s.backgroundColor);
  const bgImg = parseBgImage(s.backgroundImage);
  const br = parseInt(s.borderRadius) || 0;
  const pTop = parseInt(s.paddingTop) || 0;
  const pBottom = parseInt(s.paddingBottom) || 0;
  const pLeft = parseInt(s.paddingLeft) || 0;
  const pRight = parseInt(s.paddingRight) || 0;

  const container = {
    id: generateId(),
    elType: 'container',
    settings: {
      flex_direction: 'column',
      width: { unit: '%', size: widthPercent },
      gap: { unit: 'px', size: 16 }
    },
    elements: []
  };

  if (bg && bg !== 'transparent') {
    container.settings.background_background = 'classic';
    container.settings.background_color = bg;
  }
  if (bgImg) {
    container.settings.background_background = 'classic';
    container.settings.background_image = { url: bgImg, id: '' };
    container.settings.background_size = 'cover';
  }
  if (br > 0) {
    container.settings.border_radius = { unit: 'px', top: br, right: br, bottom: br, left: br };
  }
  if (pTop || pBottom || pLeft || pRight) {
    container.settings.padding = {
      unit: 'px',
      top: String(pTop),
      bottom: String(pBottom),
      left: String(pLeft),
      right: String(pRight),
      isLinked: false
    };
  }
  if (s.boxShadow && s.boxShadow !== 'none') {
    container.settings.box_shadow_box_shadow = {
      horizontal: 0,
      vertical: 8,
      blur: 24,
      spread: 0,
      color: 'rgba(0, 0, 0, 0.08)'
    };
  }

  // Check for floating badges and child content
  const children = Array.from(el.children).filter(c => win.getComputedStyle(c).display !== 'none');
  for (const child of children) {
    const cs = win.getComputedStyle(child);
    const cr = child.getBoundingClientRect();

    // Overlap badge detection (e.g. icon badge overlapping card top border)
    const isOverlapping = cr.top < (rect.top + 10) && cs.position === 'absolute';
    const widget = buildLeafWidget(child, cs, cr, win, parseColor, generateId, getCleanText);

    if (widget) {
      if (isOverlapping) {
        const overlapPx = Math.round(rect.top - cr.top);
        if (overlapPx > 10) {
          widget.settings.margin = {
            unit: 'px',
            top: String(-overlapPx),
            bottom: '0',
            left: '0',
            right: '0',
            isLinked: false
          };
        }
      }
      container.elements.push(widget);
    } else if (child.children.length > 0) {
      parseSubtreeRecursive(child, container, win, parseColor, parseBgImage, generateId, getCleanText);
    }
  }

  return container;
}

function buildLeafWidget(el, s, rect, win, parseColor, generateId, getCleanText) {
  const tag = el.tagName.toLowerCase();
  const text = getCleanText(el);
  const textColor = parseColor(s.color) || '#111827';
  const fontSize = parseInt(s.fontSize) || 16;
  const fontWeight = s.fontWeight || '400';

  // 1. Heading
  if (/^h[1-6]$/.test(tag) || (text.length > 0 && text.length < 90 && fontSize >= 20 && parseInt(fontWeight) >= 600)) {
    return {
      id: generateId(),
      elType: 'widget',
      widgetType: 'heading',
      settings: {
        title: text,
        header_size: /^h[1-6]$/.test(tag) ? tag : 'h3',
        title_color: textColor,
        typography_typography: 'custom',
        typography_font_size: { unit: 'px', size: fontSize },
        typography_font_weight: fontWeight,
        align: s.textAlign === 'center' ? 'center' : (s.textAlign === 'right' ? 'right' : 'left')
      }
    };
  }

  // 2. Button
  if (tag === 'button' || (tag === 'a' && (s.backgroundColor !== 'transparent' || el.className.includes('btn') || parseInt(s.paddingTop) >= 8))) {
    const bg = parseColor(s.backgroundColor) || '#DD131A';
    const br = parseInt(s.borderRadius) || 6;
    return {
      id: generateId(),
      elType: 'widget',
      widgetType: 'button',
      settings: {
        text: text || 'Explore More →',
        link: { url: el.getAttribute('href') || '#' },
        button_text_color: textColor || '#FFFFFF',
        background_color: bg,
        border_radius: { unit: 'px', top: br, right: br, bottom: br, left: br },
        align: s.textAlign === 'center' ? 'center' : 'left'
      }
    };
  }

  // 3. Image
  if (tag === 'img') {
    const src = el.src || el.getAttribute('src');
    if (src && !src.endsWith('.svg') && rect.width > 20 && rect.height > 20) {
      return {
        id: generateId(),
        elType: 'widget',
        widgetType: 'image',
        settings: {
          image: { url: src, id: '' },
          image_size: 'full'
        }
      };
    }
  }

  // 4. Circular Icon / Badge
  if (tag === 'svg' || el.className.includes('icon') || (rect.width <= 80 && rect.height <= 80 && (tag === 'i' || tag === 'span'))) {
    return {
      id: generateId(),
      elType: 'widget',
      widgetType: 'icon',
      settings: {
        selected_icon: { value: 'fas fa-shield-alt', library: 'fa-solid' },
        primary_color: textColor || '#DD131A',
        view: 'default'
      }
    };
  }

  // 5. Paragraph / Text
  if (tag === 'p' || tag === 'li' || (text.length > 0 && el.children.length === 0)) {
    return {
      id: generateId(),
      elType: 'widget',
      widgetType: 'text-editor',
      settings: {
        editor: `<p>${el.innerHTML || text}</p>`,
        text_color: textColor,
        typography_typography: 'custom',
        typography_font_size: { unit: 'px', size: fontSize },
        align: s.textAlign === 'center' ? 'center' : 'left'
      }
    };
  }

  return null;
}

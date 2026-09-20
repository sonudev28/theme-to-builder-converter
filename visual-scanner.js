/**
 * Visual Geometry & Computed Style Scanner
 * Runs in-browser (Bookmarklet, Iframe Sandbox, or Headless Browser)
 * Extracts real rendered CSS and DOM geometry to build 100% native Elementor Flexbox JSON
 */

export function runVisualGeometryScan(doc = document, win = window) {
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

  // Filter out noise elements
  const noiseSelectors = 'script, noscript, style, iframe, #wpadminbar, .preloader, #preloader, #scrollUp, .progress-wrap';
  doc.querySelectorAll(noiseSelectors).forEach(el => el.remove());

  // Find root sections
  const candidateSections = [];
  const bodyChildren = Array.from(doc.body.children);

  for (const el of bodyChildren) {
    const style = win.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    if (style.display === 'none' || style.visibility === 'hidden') continue;
    if (rect.height < 40 || rect.width < 250) continue;

    const tag = el.tagName.toLowerCase();
    if (['header', 'footer', 'section', 'main', 'nav'].includes(tag) || el.className.includes('section') || el.className.includes('area') || el.className.includes('banner')) {
      candidateSections.push(el);
    } else if (el.children.length > 0) {
      // Check if this container holds sections
      const innerSections = el.querySelectorAll(':scope > section, :scope > div[class*="section"], :scope > div[class*="area"], :scope > header, :scope > footer');
      if (innerSections.length > 0) {
        innerSections.forEach(s => candidateSections.push(s));
      } else {
        candidateSections.push(el);
      }
    }
  }

  console.log(`[VisualScanner] Discovered ${candidateSections.length} candidate root sections.`);

  const elementorSections = [];

  for (let sIdx = 0; sIdx < candidateSections.length; sIdx++) {
    const secEl = candidateSections[sIdx];
    const secStyle = win.getComputedStyle(secEl);
    const secRect = secEl.getBoundingClientRect();

    // Determine section background
    let bgColor = parseColor(secStyle.backgroundColor);
    let bgImg = parseBgImage(secStyle.backgroundImage);

    // If section has no bg, inspect first child
    if (!bgColor && !bgImg && secEl.firstElementChild) {
      const fcStyle = win.getComputedStyle(secEl.firstElementChild);
      const fcBg = parseColor(fcStyle.backgroundColor);
      const fcImg = parseBgImage(fcStyle.backgroundImage);
      if (fcBg) bgColor = fcBg;
      if (fcImg) bgImg = fcImg;
    }

    const secPaddingTop = parseInt(secStyle.paddingTop) || 60;
    const secPaddingBottom = parseInt(secStyle.paddingBottom) || 60;

    const rootContainer = {
      id: generateId(),
      elType: 'container',
      settings: {
        content_width: 'full',
        flex_direction: 'column',
        boxed_width: { unit: 'px', size: 1200 },
        padding: {
          unit: 'px',
          top: String(secPaddingTop),
          bottom: String(secPaddingBottom),
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

    // Inner container (Boxed content wrapper)
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

    // Analyze content hierarchy inside section
    parseSubtree(secEl, innerContainer, win, parseColor, parseBgImage, generateId, getCleanText);

    if (innerContainer.elements.length > 0) {
      rootContainer.elements.push(innerContainer);
      elementorSections.push(rootContainer);
    }
  }

  return {
    version: '0.4',
    title: doc.title || 'Visual Scanned Template',
    type: 'page',
    content: elementorSections
  };
}

function parseSubtree(parentEl, containerTarget, win, parseColor, parseBgImage, generateId, getCleanText) {
  // Find visual children
  const visualChildren = [];
  for (const child of Array.from(parentEl.children)) {
    const style = win.getComputedStyle(child);
    const rect = child.getBoundingClientRect();
    if (style.display === 'none' || style.visibility === 'hidden' || rect.height < 5) continue;
    visualChildren.push({ el: child, style, rect });
  }

  if (visualChildren.length === 0) return;

  // Check if children are arranged horizontally (Flex row)
  const rows = [];
  let currentRow = [];

  for (let i = 0; i < visualChildren.length; i++) {
    const item = visualChildren[i];
    if (currentRow.length === 0) {
      currentRow.push(item);
    } else {
      const prev = currentRow[currentRow.length - 1];
      // If top coordinates are within 25px and not overlapping vertically, they belong to the same row
      if (Math.abs(item.rect.top - prev.rect.top) < 25 && item.rect.left > prev.rect.left) {
        currentRow.push(item);
      } else {
        rows.push(currentRow);
        currentRow = [item];
      }
    }
  }
  if (currentRow.length > 0) rows.push(currentRow);

  for (const row of rows) {
    if (row.length > 1) {
      // Multi-column row container
      const totalWidth = row.reduce((acc, c) => acc + c.rect.width, 0);
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

      for (const colItem of row) {
        const colPercent = Math.min(100, Math.max(15, Math.round((colItem.rect.width / (parentEl.getBoundingClientRect().width || 1200)) * 100)));
        const colContainer = createContainerForElement(colItem, colPercent, win, parseColor, parseBgImage, generateId, getCleanText);
        rowContainer.elements.push(colContainer);
      }
      containerTarget.elements.push(rowContainer);
    } else {
      // Single element / column in this row
      const singleItem = row[0];
      const isCard = checkIsCard(singleItem.el, singleItem.style, parseColor);
      const hasMultipleChildren = singleItem.el.children.length > 1;

      if (isCard || hasMultipleChildren) {
        // Flatten wrapper if it's just a single wrapper with no styles
        if (!isCard && singleItem.el.children.length === 1) {
          parseSubtree(singleItem.el, containerTarget, win, parseColor, parseBgImage, generateId, getCleanText);
        } else {
          const colContainer = createContainerForElement(singleItem, 100, win, parseColor, parseBgImage, generateId, getCleanText);
          containerTarget.elements.push(colContainer);
        }
      } else {
        // Direct leaf widget
        const widget = createLeafWidget(singleItem.el, singleItem.style, singleItem.rect, win, parseColor, generateId, getCleanText);
        if (widget) containerTarget.elements.push(widget);
      }
    }
  }
}

function checkIsCard(el, style, parseColor) {
  const bg = parseColor(style.backgroundColor);
  const br = parseInt(style.borderRadius) || 0;
  const shadow = style.boxShadow && style.boxShadow !== 'none';
  const border = parseInt(style.borderWidth) > 0;
  return (bg && bg !== '#FFFFFF' && bg !== 'transparent') || br >= 6 || shadow || border || el.className.includes('card') || el.className.includes('item') || el.className.includes('box');
}

function createContainerForElement(item, widthPercent, win, parseColor, parseBgImage, generateId, getCleanText) {
  const el = item.el;
  const style = item.style;
  const rect = item.rect;

  const bg = parseColor(style.backgroundColor);
  const bgImg = parseBgImage(style.backgroundImage);
  const br = parseInt(style.borderRadius) || 0;
  const pTop = parseInt(style.paddingTop) || 0;
  const pBottom = parseInt(style.paddingBottom) || 0;
  const pLeft = parseInt(style.paddingLeft) || 0;
  const pRight = parseInt(style.paddingRight) || 0;

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

  if (bg) {
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
  if (style.boxShadow && style.boxShadow !== 'none') {
    container.settings.box_shadow_box_shadow = {
      horizontal: 0,
      vertical: 8,
      blur: 24,
      spread: 0,
      color: 'rgba(0, 0, 0, 0.08)'
    };
  }

  // Check for overlapping children (e.g. icon badge floating over the top border)
  const childElements = Array.from(el.children);
  for (const child of childElements) {
    const cStyle = win.getComputedStyle(child);
    const cRect = child.getBoundingClientRect();
    if (cStyle.display === 'none' || cStyle.visibility === 'hidden') continue;

    // Overlap detection
    const isOverlappingTop = cRect.top < (rect.top + 10);
    const widget = createLeafWidget(child, cStyle, cRect, win, parseColor, generateId, getCleanText);

    if (widget) {
      if (isOverlappingTop && cStyle.position === 'absolute') {
        const overlapDistance = Math.round(rect.top - cRect.top);
        if (overlapDistance > 10) {
          widget.settings.margin = {
            unit: 'px',
            top: String(-overlapDistance),
            bottom: '0',
            left: '0',
            right: '0',
            isLinked: false
          };
        }
      }
      container.elements.push(widget);
    } else if (child.children.length > 0) {
      parseSubtree(child, container, win, parseColor, parseBgImage, generateId, getCleanText);
    }
  }

  return container;
}

function createLeafWidget(el, style, rect, win, parseColor, generateId, getCleanText) {
  const tag = el.tagName.toLowerCase();
  const text = getCleanText(el);
  const textColor = parseColor(style.color) || '#111827';
  const fontSize = parseInt(style.fontSize) || 16;
  const fontWeight = style.fontWeight || '400';

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
        align: style.textAlign === 'center' ? 'center' : (style.textAlign === 'right' ? 'right' : 'left')
      }
    };
  }

  // 2. Button
  if (tag === 'button' || (tag === 'a' && (style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent' || el.className.includes('btn') || parseInt(style.paddingTop) >= 8))) {
    const bg = parseColor(style.backgroundColor) || '#3B82F6';
    const br = parseInt(style.borderRadius) || 6;
    return {
      id: generateId(),
      elType: 'widget',
      widgetType: 'button',
      settings: {
        text: text || 'Click Here',
        link: { url: el.getAttribute('href') || '#' },
        button_text_color: textColor || '#FFFFFF',
        background_color: bg,
        border_radius: { unit: 'px', top: br, right: br, bottom: br, left: br },
        align: style.textAlign === 'center' ? 'center' : 'left'
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

  // 4. SVG or Icon Badge
  if (tag === 'svg' || el.className.includes('icon') || (rect.width <= 70 && rect.height <= 70 && (tag === 'i' || tag === 'span'))) {
    return {
      id: generateId(),
      elType: 'widget',
      widgetType: 'icon',
      settings: {
        selected_icon: { value: 'fas fa-check-circle', library: 'fa-solid' },
        primary_color: textColor || '#D11E25',
        view: 'default'
      }
    };
  }

  // 5. Paragraph / Text Editor
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
        align: style.textAlign === 'center' ? 'center' : 'left'
      }
    };
  }

  return null;
}

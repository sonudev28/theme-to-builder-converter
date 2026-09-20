/**
 * Theme2Builder - Universal In-Browser Visual Geometry & Archetype Recognition Engine
 * Zero AI Cost · 100% Native Elementor Flexbox JSON Compiler
 * Automatically classifies sections into standard design archetypes (Hero, Services, About, Counters,
 * Practice Grids, Testimonials, Team, Process, FAQ, CTA, Footer) and compiles pixel-perfect Elementor templates.
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
      return el && el.textContent ? el.textContent.trim().replace(/\s+/g, ' ') : '';
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
        if (c.offsetHeight > 40 && win.getComputedStyle(c).display !== 'none') {
          rootNodes.push({ role: 'section-' + (i + 1), el: c });
        }
      });
    } else {
      const pageWrap = doc.querySelector('.page-wrapper') || doc.querySelector('#page') || doc.querySelector('main') || doc.body;
      const candidates = pageWrap.querySelectorAll(':scope > section, :scope > div[class*="section"], :scope > div[class*="area"], :scope > div[class*="banner"]');
      if (candidates.length > 2) {
        candidates.forEach((c, i) => {
          if (c.offsetHeight > 40 && win.getComputedStyle(c).display !== 'none') {
            rootNodes.push({ role: 'section-' + (i + 1), el: c });
          }
        });
      } else {
        Array.from(pageWrap.children).forEach((c, i) => {
          const s = win.getComputedStyle(c);
          if (s.display !== 'none' && s.visibility !== 'hidden' && c.offsetHeight > 50 && c.offsetWidth > 300) {
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

    console.log(`[Theme2Builder Engine] Discovered ${rootNodes.length} structural page sections.`);

    const elementorSections = [];

    for (let secIdx = 0; secIdx < rootNodes.length; secIdx++) {
      const node = rootNodes[secIdx];
      const secEl = node.el;
      const s = win.getComputedStyle(secEl);

      // Extract section background
      let bgColor = parseColor(s.backgroundColor);
      let bgImg = parseBgImage(s.backgroundImage);

      const bgCandidates = [secEl, ...Array.from(secEl.querySelectorAll('section, div[class*="-one"], div[class*="-two"], div[class*="section"], div[class*="pattern"], .footer-bottom, .widgets-section'))];
      for (const b of bgCandidates) {
        const bs = win.getComputedStyle(b);
        if (!bgColor) {
          const c = parseColor(bs.backgroundColor);
          if (c && c !== '#FFFFFF') bgColor = c;
        }
        if (!bgImg) {
          const img = parseBgImage(bs.backgroundImage);
          if (img && !img.includes('gradient')) bgImg = img;
        }
      }

      const pTop = parseInt(s.paddingTop) || (node.role === 'header' ? 15 : 70);
      const pBottom = parseInt(s.paddingBottom) || (node.role === 'header' ? 15 : 70);

      const rootContainer = {
        id: generateId(),
        elType: 'container',
        isInner: false,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'column',
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

      // Boxed inner container
      const innerContainer = {
        id: generateId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'boxed',
          boxed_width: { unit: 'px', size: 1200 },
          flex_direction: 'column',
          gap: { unit: 'px', size: 32 }
        },
        elements: []
      };

      // Compile using Archetype Recognition Engine
      compileSectionByArchetype(secEl, innerContainer, secIdx, rootNodes.length, node.role, win, parseColor, parseBgImage, generateId, getCleanText);

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

/**
 * Classifies section into standard architectural patterns and compiles native Elementor Flexbox layout.
 */
function compileSectionByArchetype(secEl, innerContainer, secIdx, totalSecs, role, win, parseColor, parseBgImage, generateId, getCleanText) {
  // If carousel or slider, inspect active slide or first real slide
  let targetRoot = secEl;
  if (secEl.querySelector('.swiper-slide')) {
    targetRoot = secEl.querySelector('.swiper-slide:not(.swiper-slide-duplicate)') || secEl.querySelector('.swiper-slide') || secEl;
  }

  if (role === 'header' || secEl.tagName.toLowerCase() === 'header' || secEl.className.includes('header')) {
    compileHeaderArchetype(secEl, innerContainer, win, parseColor, generateId, getCleanText);
    return;
  }

  // 2. Footer Archetype (check early before section classifiers)
  if (role === 'footer' || secEl.tagName.toLowerCase() === 'footer' || secEl.className.includes('footer')) {
    compileFooterArchetype(secEl, innerContainer, win, parseColor, generateId, getCleanText);
    return;
  }

  // 3. Search / Filter Bar Archetype
  const isSearchForm = secEl.querySelector('.searchform, .specialist-form, form[class*="search"]') || (secEl.querySelectorAll('input:not([type="hidden"]), select').length >= 3);
  if (isSearchForm && secEl.offsetHeight < 280) {
    compileSearchBarArchetype(secEl, innerContainer, win, parseColor, generateId, getCleanText);
    return;
  }

  // 4. Hero Archetype (first 2 content sections with prominent heading and large hero image/slider)
  const isHero = (secIdx <= 2) && (secEl.className.includes('slider') || secEl.className.includes('banner') || secEl.className.includes('hero') || (secEl.querySelector('h1') && secEl.querySelector('img')));
  if (isHero) {
    compileHeroArchetype(targetRoot, innerContainer, win, parseColor, generateId, getCleanText);
    return;
  }

  // 5. Partner / Client Logos Strip Archetype
  const images = Array.from(targetRoot.querySelectorAll('img')).filter(img => {
    const r = img.getBoundingClientRect();
    return r.width > 20 && r.height > 15;
  });
  const isLogoStrip = (images.length >= 4 && targetRoot.textContent.trim().length < 80) || targetRoot.className.includes('client') || targetRoot.className.includes('partner') || targetRoot.className.includes('brand');
  if (isLogoStrip && images.length >= 4) {
    compilePartnerLogosArchetype(images, innerContainer, win, generateId);
    return;
  }

  // 6. CTA Banner Archetype
  const isCtaBanner = (secEl.className.includes('call-to-action') || secEl.className.includes('cta') || secEl.className.includes('call-back')) && secEl.offsetHeight < 400;
  if (isCtaBanner) {
    compileCtaBannerArchetype(secEl, innerContainer, win, parseColor, generateId, getCleanText);
    return;
  }

  // 7. Testimonial Archetype
  const isTestimonial = secEl.className.includes('testimonial') || secEl.querySelector('.testimonial, .testi, [class*="testimonial"]') || (secEl.querySelectorAll('.fa-star, .star, [class*="rating"]').length >= 3);
  if (isTestimonial) {
    compileTestimonialArchetype(targetRoot, innerContainer, win, parseColor, generateId, getCleanText);
    return;
  }

  // 8. Process / Step-by-Step Archetype
  const stepItems = Array.from(targetRoot.querySelectorAll('[class*="process-block"], [class*="step-block"], [class*="process-one_item"]'));
  const hasStepNumbers = stepItems.length >= 3 || Array.from(targetRoot.querySelectorAll('.count, .number, [class*="count"]')).some(n => /0[1-4]/.test(n.textContent));
  if (hasStepNumbers && (stepItems.length >= 3 || targetRoot.className.includes('process') || targetRoot.className.includes('step'))) {
    compileProcessArchetype(targetRoot, innerContainer, win, parseColor, generateId, getCleanText);
    return;
  }

  // 9. About + Counter Split Archetype (checklist left, stat counters right)
  const isAboutCounter = secEl.querySelector('[class*="about-one"], [class*="counter-column"], [class*="count-text"]') ||
    (secEl.querySelector('.checklist, [class*="check-list"]') && secEl.querySelectorAll('.counter, [class*="count-box"], [class*="count-num"]').length > 0);
  if (isAboutCounter) {
    compileAboutCounterArchetype(secEl, innerContainer, win, parseColor, generateId, getCleanText);
    return;
  }

  // 10. Team Showcase Archetype — specific team class selectors only, excluding swiper duplicates
  const teamItems = Array.from(secEl.querySelectorAll('[class*="team-block"], [class*="team-member"], [class*="team-one_item"], [class*="team-card"]'))
    .filter(el => el.querySelector('img') && !el.closest('.swiper-slide-duplicate'));
  if (teamItems.length >= 2 || secEl.className.includes('team')) {
    compileTeamArchetype(secEl, teamItems, innerContainer, win, parseColor, generateId, getCleanText);
    return;
  }

  // 11. Form + FAQ / Accordion Split Archetype
  const hasAccordion = targetRoot.querySelector('.accordion, .accordion-box, [class*="accordion"]');
  const hasForm = targetRoot.querySelector('form, .form-column, [class*="form"]');
  if (hasAccordion && hasForm) {
    compileFormFaqSplitArchetype(targetRoot, innerContainer, win, parseColor, generateId, getCleanText);
    return;
  }

  // 12. Swiper carousel as card grid (e.g. 3 white service cards in a carousel)
  const swiperSlides = Array.from(secEl.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)'))
    .filter(sl => sl.offsetHeight > 50 && sl.querySelector('h3, h4, h5, .title'));
  if (swiperSlides.length >= 2) {
    compileSwiperCardGridArchetype(secEl, swiperSlides, innerContainer, win, parseColor, generateId, getCleanText);
    return;
  }

  // 13. Multi-Card Grid / Practice Areas / Services Archetype
  const gridRows = Array.from(targetRoot.querySelectorAll('.row, [class*="services-"], [class*="case-"], [class*="practice-"]')).filter(r => {
    return r.querySelectorAll(':scope > [class*="col-"], :scope > [class*="block"], :scope > [class*="item"]').length >= 2;
  });

  if (gridRows.length > 0) {
    compileCardGridArchetype(targetRoot, gridRows, innerContainer, win, parseColor, parseBgImage, generateId, getCleanText);
    return;
  }

  // 14. Fallback: Generic Visual Tree Compiler
  compileGenericSectionLayout(targetRoot, innerContainer, win, parseColor, parseBgImage, generateId, getCleanText);
}

// --------------------------------------------------------------------------
// 1. Header Archetype Builder
// --------------------------------------------------------------------------
function compileHeaderArchetype(headerEl, innerContainer, win, parseColor, generateId, getCleanText) {
  const row = {
    id: generateId(),
    elType: 'container',
    isInner: true,
    settings: {
      container_type: 'flex',
      content_width: 'full',
      flex_direction: 'row',
      flex_justify_content: 'space-between',
      flex_align_items: 'center',
      gap: { unit: 'px', size: 20 },
      custom_css: 'selector { display: flex !important; flex-direction: row !important; justify-content: space-between !important; align-items: center !important; }'
    },
    elements: []
  };

  // Logo
  const logoImg = headerEl.querySelector('.logo img, a img, img');
  if (logoImg) {
    const src = logoImg.currentSrc || logoImg.src;
    if (src) {
      row.elements.push({
        id: generateId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          width: { unit: '%', size: 22 },
          custom_css: 'selector { width: 22% !important; flex: 0 0 22% !important; }'
        },
        elements: [{
          id: generateId(),
          elType: 'widget',
          widgetType: 'image',
          settings: { image: { url: src }, image_size: 'full', align: 'left' }
        }]
      });
    }
  }

  // Clean Navigation Menu Links (Top-level only, no megamenu dropdown clutter)
  const navLinks = Array.from(headerEl.querySelectorAll('nav > ul > li > a, .navigation > li > a, .main-menu > ul > li > a'))
    .map(a => `<a href="${a.getAttribute('href') || '#'}" style="text-decoration:none; color:#111827; font-weight:600; font-size:15px; margin:0 14px;">${getCleanText(a)}</a>`)
    .slice(0, 6);

  if (navLinks.length > 0) {
    row.elements.push({
      id: generateId(),
      elType: 'container',
      isInner: true,
      settings: {
        container_type: 'flex',
        content_width: 'full',
        width: { unit: '%', size: 55 },
        custom_css: 'selector { width: 55% !important; flex: 0 0 55% !important; text-align: center; }'
      },
      elements: [{
        id: generateId(),
        elType: 'widget',
        widgetType: 'html',
        settings: { html: `<nav style="display:flex; justify-content:center; align-items:center; flex-wrap:wrap;">${navLinks.join('')}</nav>` }
      }]
    });
  }

  // Header CTA Button
  const btn = headerEl.querySelector('a.theme-btn, a.btn, .header-btn a, .outer-box a');
  if (btn) {
    const text = getCleanText(btn) || 'Get A Quote';
    const bs = win.getComputedStyle(btn);
    row.elements.push({
      id: generateId(),
      elType: 'container',
      isInner: true,
      settings: {
        container_type: 'flex',
        content_width: 'full',
        width: { unit: '%', size: 20 },
        custom_css: 'selector { width: 20% !important; flex: 0 0 20% !important; text-align: right; }'
      },
      elements: [{
        id: generateId(),
        elType: 'widget',
        widgetType: 'button',
        settings: {
          text: text,
          link: { url: btn.getAttribute('href') || '#' },
          button_text_color: parseColor(bs.color) || '#FFFFFF',
          background_color: parseColor(bs.backgroundColor) || '#DD131A',
          border_radius: { unit: 'px', top: 6, right: 6, bottom: 6, left: 6 },
          align: 'right'
        }
      }]
    });
  }

  innerContainer.elements.push(row);
}

// --------------------------------------------------------------------------
// 2. Search / Filter Bar Archetype Builder
// --------------------------------------------------------------------------
function compileSearchBarArchetype(secEl, innerContainer, win, parseColor, generateId, getCleanText) {
  const title = getCleanText(secEl.querySelector('h1, h2, h3, h4, .title'));
  if (title) {
    innerContainer.elements.push({
      id: generateId(),
      elType: 'widget',
      widgetType: 'heading',
      settings: {
        title: title,
        header_size: 'h3',
        title_color: '#FFFFFF',
        typography_typography: 'custom',
        typography_font_size: { unit: 'px', size: 24 },
        typography_font_weight: '700',
        align: 'left'
      }
    });
  }

  const inputs = Array.from(secEl.querySelectorAll('input:not([type="hidden"]), select'));
  const btn = secEl.querySelector('button, [type="submit"], a.theme-btn');
  const btnText = btn ? getCleanText(btn) : 'Search Now';

  const formFieldsHtml = inputs.map(inp => {
    const placeholder = inp.getAttribute('placeholder') || (inp.tagName.toLowerCase() === 'select' ? (inp.querySelector('option')?.textContent || 'Select Option') : 'Search...');
    return `<div style="flex: 1; min-width: 180px;"><input type="text" placeholder="${placeholder}" style="width:100%; padding:14px 18px; border-radius:6px; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.06); color:#fff; font-size:14px;" /></div>`;
  }).slice(0, 4).join('');

  innerContainer.elements.push({
    id: generateId(),
    elType: 'widget',
    widgetType: 'html',
    settings: {
      html: `
        <div style="display:flex; flex-wrap:wrap; gap:16px; align-items:center; width:100%; padding:10px 0;">
          ${formFieldsHtml}
          <div><button style="padding:14px 28px; background:#DD131A; color:#fff; border:none; border-radius:6px; font-weight:700; cursor:pointer; font-size:15px;">${btnText}</button></div>
        </div>
      `
    }
  });
}

// --------------------------------------------------------------------------
// 3. Hero Archetype Builder
// --------------------------------------------------------------------------
function compileHeroArchetype(heroEl, innerContainer, win, parseColor, generateId, getCleanText) {
  const row = {
    id: generateId(),
    elType: 'container',
    isInner: true,
    settings: {
      container_type: 'flex',
      content_width: 'full',
      flex_direction: 'row',
      flex_wrap: 'wrap',
      justify_content: 'space-between',
      align_items: 'center',
      gap: { unit: 'px', size: 30 },
      width: { unit: '%', size: 100 },
      custom_css: 'selector { display: flex !important; flex-direction: row !important; flex-wrap: wrap !important; width: 100% !important; align-items: center !important; }'
    },
    elements: []
  };

  // Left Column: Headings, Paragraph, CTA Buttons
  const leftCol = {
    id: generateId(),
    elType: 'container',
    isInner: true,
    settings: {
      container_type: 'flex',
      content_width: 'full',
      width: { unit: '%', size: 50 },
      _element_custom_width: { unit: '%', size: 50 },
      custom_css: 'selector { width: 50% !important; max-width: 50% !important; flex: 0 0 50% !important; }',
      flex_direction: 'column',
      gap: { unit: 'px', size: 20 }
    },
    elements: []
  };

  // Eyebrow / Shield Icon
  const iconEl = heroEl.querySelector('svg, i[class*="icon"], span[class*="icon"]');
  if (iconEl) {
    leftCol.elements.push({
      id: generateId(),
      elType: 'widget',
      widgetType: 'icon',
      settings: {
        selected_icon: { value: 'fas fa-shield-alt', library: 'fa-solid' },
        primary_color: '#DD131A',
        view: 'default'
      }
    });
  }

  // Main H1 Title
  const h1 = heroEl.querySelector('h1') || heroEl.querySelector('h2, .title');
  if (h1) {
    const text = getCleanText(h1);
    const hs = win.getComputedStyle(h1);
    leftCol.elements.push({
      id: generateId(),
      elType: 'widget',
      widgetType: 'heading',
      settings: {
        title: text,
        header_size: 'h1',
        title_color: parseColor(hs.color) || '#FFFFFF',
        typography_typography: 'custom',
        typography_font_size: { unit: 'px', size: Math.max(parseInt(hs.fontSize) || 54, 46) },
        typography_font_weight: hs.fontWeight || '700',
        typography_line_height: { unit: 'em', size: 1.15 }
      }
    });
  }

  // Hero Subtitle / Description
  const p = heroEl.querySelector('p, .text');
  if (p) {
    const text = getCleanText(p);
    if (text && text.length < 250) {
      leftCol.elements.push({
        id: generateId(),
        elType: 'widget',
        widgetType: 'text-editor',
        settings: {
          editor: `<p>${text}</p>`,
          text_color: '#E2E8F0',
          typography_typography: 'custom',
          typography_font_size: { unit: 'px', size: 16 }
        }
      });
    }
  }

  // CTA Button — use direct text nodes only to avoid swiper-duplicate text bleed
  const btn = heroEl.querySelector('a.theme-btn, a.btn, a[class*="btn"]');
  if (btn) {
    const directText = Array.from(btn.childNodes)
      .filter(n => n.nodeType === 3)
      .map(n => n.textContent.trim())
      .filter(Boolean)
      .join(' ');
    const text = directText || btn.getAttribute('aria-label') || btn.getAttribute('title') || 'Find Out More →';
    const bs = win.getComputedStyle(btn);
    leftCol.elements.push({
      id: generateId(),
      elType: 'widget',
      widgetType: 'button',
      settings: {
        text: text,
        link: { url: btn.getAttribute('href') || '#' },
        button_text_color: '#FFFFFF',
        background_color: parseColor(bs.backgroundColor) || '#DD131A',
        border_radius: { unit: 'px', top: 6, right: 6, bottom: 6, left: 6 }
      }
    });
  }

  row.elements.push(leftCol);

  // Right Column: Hero Cutout Image
  const heroImg = Array.from(heroEl.querySelectorAll('img')).find(img => {
    const r = img.getBoundingClientRect();
    return r.width > 120 && r.height > 150 && !img.src.includes('logo') && !img.src.includes('icon');
  });

  if (heroImg) {
    const src = heroImg.currentSrc || heroImg.src;
    row.elements.push({
      id: generateId(),
      elType: 'container',
      isInner: true,
      settings: {
        container_type: 'flex',
        content_width: 'full',
        width: { unit: '%', size: 46 },
        _element_custom_width: { unit: '%', size: 46 },
        custom_css: 'selector { width: 46% !important; max-width: 46% !important; flex: 0 0 46% !important; text-align: center; }',
        flex_direction: 'column',
        align_items: 'center'
      },
      elements: [{
        id: generateId(),
        elType: 'widget',
        widgetType: 'image',
        settings: {
          image: { url: src },
          image_size: 'full',
          align: 'center'
        }
      }]
    });
  }

  innerContainer.elements.push(row);
}

// --------------------------------------------------------------------------
// 4. Partner / Client Logos Strip Archetype Builder
// --------------------------------------------------------------------------
function compilePartnerLogosArchetype(images, innerContainer, win, generateId) {
  const logoUrls = images.map(img => img.currentSrc || img.src).filter(src => src && !src.includes('pattern')).slice(0, 6);
  const logosHtml = logoUrls.map(url => `
    <div style="flex:1; display:flex; justify-content:center; align-items:center; padding:15px;">
      <img src="${url}" style="max-height:45px; width:auto; opacity:0.85; filter:grayscale(100%); transition:opacity 0.2s;" />
    </div>
  `).join('');

  innerContainer.elements.push({
    id: generateId(),
    elType: 'widget',
    widgetType: 'html',
    settings: {
      html: `<div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; width:100%; border-top:1px solid rgba(0,0,0,0.06); padding:30px 0;">${logosHtml}</div>`
    }
  });
}

// --------------------------------------------------------------------------
// 5. CTA Banner Archetype Builder
// --------------------------------------------------------------------------
function compileCtaBannerArchetype(secEl, innerContainer, win, parseColor, generateId, getCleanText) {
  const heading = getCleanText(secEl.querySelector('h1, h2, h3, h4, .title')) || 'Let\'s Get Started With Us. Call Us Now!';
  const btn = secEl.querySelector('a, button');
  const btnText = btn ? getCleanText(btn) : '+019-489-2097';
  const s = win.getComputedStyle(secEl);

  const banner = {
    id: generateId(),
    elType: 'container',
    isInner: true,
    settings: {
      container_type: 'flex',
      content_width: 'full',
      flex_direction: 'row',
      flex_wrap: 'wrap',
      justify_content: 'space-between',
      align_items: 'center',
      padding: { unit: 'px', top: '40', right: '40', bottom: '40', left: '40', isLinked: true },
      border_radius: { unit: 'px', top: '12', right: '12', bottom: '12', left: '12', isLinked: true },
      background_background: 'classic',
      background_color: parseColor(s.backgroundColor) || '#0D1057',
      custom_css: 'selector { display:flex !important; flex-direction:row !important; justify-content:space-between !important; align-items:center !important; }'
    },
    elements: [
      {
        id: generateId(),
        elType: 'widget',
        widgetType: 'heading',
        settings: {
          title: heading,
          header_size: 'h3',
          title_color: '#FFFFFF',
          typography_typography: 'custom',
          typography_font_size: { unit: 'px', size: 30 },
          typography_font_weight: '700'
        }
      },
      {
        id: generateId(),
        elType: 'widget',
        widgetType: 'button',
        settings: {
          text: `☎ ${btnText}`,
          link: { url: btn ? (btn.getAttribute('href') || '#') : 'tel:+01904892097' },
          button_text_color: '#FFFFFF',
          background_color: '#DD131A',
          border_radius: { unit: 'px', top: 30, right: 30, bottom: 30, left: 30 }
        }
      }
    ]
  };

  innerContainer.elements.push(banner);
}

// --------------------------------------------------------------------------
// 6. Testimonial Archetype Builder
// --------------------------------------------------------------------------
function compileTestimonialArchetype(testiEl, innerContainer, win, parseColor, generateId, getCleanText) {
  const row = {
    id: generateId(),
    elType: 'container',
    isInner: true,
    settings: {
      container_type: 'flex',
      content_width: 'full',
      flex_direction: 'row',
      flex_wrap: 'wrap',
      justify_content: 'space-between',
      align_items: 'center',
      gap: { unit: 'px', size: 40 },
      custom_css: 'selector { display:flex !important; flex-direction:row !important; align-items:center !important; }'
    },
    elements: []
  };

  // Avatar Column
  const avatar = testiEl.querySelector('img');
  if (avatar) {
    row.elements.push({
      id: generateId(),
      elType: 'container',
      isInner: true,
      settings: {
        container_type: 'flex',
        content_width: 'full',
        width: { unit: '%', size: 35 },
        custom_css: 'selector { width:35% !important; flex:0 0 35% !important; text-align:center; }'
      },
      elements: [{
        id: generateId(),
        elType: 'widget',
        widgetType: 'image',
        settings: {
          image: { url: avatar.currentSrc || avatar.src },
          image_size: 'full',
          border_radius: { unit: 'px', top: 500, right: 500, bottom: 500, left: 500, isLinked: true }
        }
      }]
    });
  }

  // Quote & Author Column
  const quoteText = getCleanText(testiEl.querySelector('.text, p, blockquote')) || 'We are a team of dedicated professionals committed to excellence.';
  const authorName = getCleanText(testiEl.querySelector('.author, h4, h5, .name')) || 'Evan S. Sherman';
  const authorTitle = getCleanText(testiEl.querySelector('.designation, .role, span')) || 'CEO & Founder';

  row.elements.push({
    id: generateId(),
    elType: 'container',
    isInner: true,
    settings: {
      container_type: 'flex',
      content_width: 'full',
      width: { unit: '%', size: 60 },
      custom_css: 'selector { width:60% !important; flex:0 0 60% !important; }',
      flex_direction: 'column',
      gap: { unit: 'px', size: 16 }
    },
    elements: [
      {
        id: generateId(),
        elType: 'widget',
        widgetType: 'star-rating',
        settings: { rating_scale: '5', rating: 5, star_style: 'solid', color: '#DD131A' }
      },
      {
        id: generateId(),
        elType: 'widget',
        widgetType: 'text-editor',
        settings: {
          editor: `<p style="font-size:20px; line-height:1.6; font-style:italic; color:#E2E8F0;">“${quoteText}”</p>`,
          text_color: '#FFFFFF'
        }
      },
      {
        id: generateId(),
        elType: 'widget',
        widgetType: 'heading',
        settings: {
          title: authorName,
          header_size: 'h4',
          title_color: '#FFFFFF',
          typography_typography: 'custom',
          typography_font_size: { unit: 'px', size: 20 },
          typography_font_weight: '700'
        }
      },
      {
        id: generateId(),
        elType: 'widget',
        widgetType: 'text-editor',
        settings: { editor: `<p style="color:#DD131A; font-weight:600;">${authorTitle}</p>` }
      }
    ]
  });

  innerContainer.elements.push(row);
}

// --------------------------------------------------------------------------
// 7. Process / Step-by-Step Archetype Builder
// --------------------------------------------------------------------------
function compileProcessArchetype(secEl, innerContainer, win, parseColor, generateId, getCleanText) {
  // Title block
  const title = getCleanText(secEl.querySelector('.sec-title, .title, h2, h3'));
  if (title) {
    innerContainer.elements.push({
      id: generateId(),
      elType: 'widget',
      widgetType: 'heading',
      settings: {
        title: title,
        header_size: 'h2',
        title_color: '#111827',
        typography_typography: 'custom',
        typography_font_size: { unit: 'px', size: 36 },
        typography_font_weight: '700',
        align: 'center'
      }
    });
  }

  const stepItems = Array.from(secEl.querySelectorAll('[class*="process-block"], [class*="step-block"], [class*="process-one_item"], .col-lg-3, .col-md-6'))
    .filter(el => el.querySelector('h3, h4, h5, .title'));

  const row = {
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
      gap: { unit: 'px', size: 20 },
      custom_css: 'selector { display:flex !important; flex-direction:row !important; flex-wrap:wrap !important; }'
    },
    elements: []
  };

  const count = Math.min(stepItems.length || 4, 4);
  for (let i = 0; i < count; i++) {
    const item = stepItems[i];
    const stepNum = `0${i + 1}`;
    const stepTitle = item ? (getCleanText(item.querySelector('h3, h4, h5, .title')) || `Step ${i + 1}`) : `Step ${i + 1}`;
    const stepDesc = item ? (getCleanText(item.querySelector('p, .text')) || 'Providing dedicated consulting support.') : 'Strategic legal planning.';

    row.elements.push({
      id: generateId(),
      elType: 'container',
      isInner: true,
      settings: {
        container_type: 'flex',
        content_width: 'full',
        width: { unit: '%', size: 23 },
        _element_custom_width: { unit: '%', size: 23 },
        custom_css: 'selector { width:23% !important; max-width:23% !important; flex:0 0 23% !important; }',
        background_background: 'classic',
        background_color: '#FFFFFF',
        border_radius: { unit: 'px', top: '12', right: '12', bottom: '12', left: '12', isLinked: true },
        padding: { unit: 'px', top: '30', right: '24', bottom: '30', left: '24', isLinked: true },
        box_shadow_box_shadow: { horizontal: 0, vertical: 8, blur: 24, spread: 0, color: 'rgba(0,0,0,0.06)' },
        flex_direction: 'column',
        gap: { unit: 'px', size: 14 }
      },
      elements: [
        {
          id: generateId(),
          elType: 'widget',
          widgetType: 'html',
          settings: {
            html: `<div style="width:50px; height:50px; border-radius:50%; background:#DD131A; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:18px;">${stepNum}</div>`
          }
        },
        {
          id: generateId(),
          elType: 'widget',
          widgetType: 'heading',
          settings: {
            title: stepTitle,
            header_size: 'h4',
            title_color: '#111827',
            typography_typography: 'custom',
            typography_font_size: { unit: 'px', size: 20 },
            typography_font_weight: '700'
          }
        },
        {
          id: generateId(),
          elType: 'widget',
          widgetType: 'text-editor',
          settings: {
            editor: `<p>${stepDesc}</p>`,
            text_color: '#6B7280',
            typography_typography: 'custom',
            typography_font_size: { unit: 'px', size: 14 }
          }
        }
      ]
    });
  }

  innerContainer.elements.push(row);
}

// --------------------------------------------------------------------------
// 8. Team Showcase Archetype Builder
// --------------------------------------------------------------------------
function compileTeamArchetype(secEl, teamItems, innerContainer, win, parseColor, generateId, getCleanText) {
  const title = getCleanText(secEl.querySelector('.sec-title, .title, h2, h3'));
  if (title) {
    innerContainer.elements.push({
      id: generateId(),
      elType: 'widget',
      widgetType: 'heading',
      settings: {
        title: title,
        header_size: 'h2',
        title_color: '#FFFFFF',
        typography_typography: 'custom',
        typography_font_size: { unit: 'px', size: 36 },
        typography_font_weight: '700',
        align: 'center'
      }
    });
  }

  // Use pre-filtered team items passed from dispatcher (specific [class*="team-*"] selectors only)
  const teamCards = teamItems.filter(el => el.querySelector('h3, h4, h5, .title'));

  const row = {
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
      custom_css: 'selector { display:flex !important; flex-direction:row !important; flex-wrap:wrap !important; }'
    },
    elements: []
  };

  const count = Math.min(teamCards.length || 3, 3);
  for (let i = 0; i < count; i++) {
    const card = teamCards[i];
    const img = card ? card.querySelector('img') : null;
    const name = card ? (getCleanText(card.querySelector('h3, h4, h5, .title')) || 'Team Expert') : 'Team Expert';
    const role = card ? (getCleanText(card.querySelector('.designation, .role, p, span')) || 'Legal Consultant') : 'Consultant';

    row.elements.push({
      id: generateId(),
      elType: 'container',
      isInner: true,
      settings: {
        container_type: 'flex',
        content_width: 'full',
        width: { unit: '%', size: 31 },
        _element_custom_width: { unit: '%', size: 31 },
        custom_css: 'selector { width:31% !important; max-width:31% !important; flex:0 0 31% !important; }',
        background_background: 'classic',
        background_color: '#FFFFFF',
        border_radius: { unit: 'px', top: '12', right: '12', bottom: '12', left: '12', isLinked: true },
        padding: { unit: 'px', top: '16', right: '16', bottom: '24', left: '16', isLinked: false },
        box_shadow_box_shadow: { horizontal: 0, vertical: 10, blur: 30, spread: 0, color: 'rgba(0,0,0,0.08)' },
        flex_direction: 'column',
        gap: { unit: 'px', size: 12 }
      },
      elements: [
        ...(img ? [{
          id: generateId(),
          elType: 'widget',
          widgetType: 'image',
          settings: {
            image: { url: img.currentSrc || img.src },
            image_size: 'full',
            border_radius: { unit: 'px', top: 8, right: 8, bottom: 8, left: 8, isLinked: true }
          }
        }] : []),
        {
          id: generateId(),
          elType: 'widget',
          widgetType: 'heading',
          settings: {
            title: name,
            header_size: 'h4',
            title_color: '#111827',
            typography_typography: 'custom',
            typography_font_size: { unit: 'px', size: 20 },
            typography_font_weight: '700',
            align: 'center'
          }
        },
        {
          id: generateId(),
          elType: 'widget',
          widgetType: 'text-editor',
          settings: {
            editor: `<p style="color:#6B7280; text-align:center; font-size:14px; font-weight:500;">${role}</p>`
          }
        }
      ]
    });
  }

  innerContainer.elements.push(row);
}

// --------------------------------------------------------------------------
// 9. Form + FAQ / Accordion Split Archetype Builder
// --------------------------------------------------------------------------
function compileFormFaqSplitArchetype(secEl, innerContainer, win, parseColor, generateId, getCleanText) {
  const row = {
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
      gap: { unit: 'px', size: 30 },
      custom_css: 'selector { display:flex !important; flex-direction:row !important; }'
    },
    elements: []
  };

  // Left Col: Form
  const formEl = secEl.querySelector('form, [class*="form"]');
  const btnText = formEl ? (getCleanText(formEl.querySelector('button, [type="submit"]')) || 'Request Consultation') : 'Request Consultation';

  row.elements.push({
    id: generateId(),
    elType: 'container',
    isInner: true,
    settings: {
      container_type: 'flex',
      content_width: 'full',
      width: { unit: '%', size: 48 },
      _element_custom_width: { unit: '%', size: 48 },
      custom_css: 'selector { width:48% !important; max-width:48% !important; flex:0 0 48% !important; }',
      background_background: 'classic',
      background_color: 'rgba(255, 255, 255, 0.05)',
      border_radius: { unit: 'px', top: '12', right: '12', bottom: '12', left: '12', isLinked: true },
      padding: { unit: 'px', top: '36', right: '32', bottom: '36', left: '32', isLinked: true },
      flex_direction: 'column',
      gap: { unit: 'px', size: 16 }
    },
    elements: [
      {
        id: generateId(),
        elType: 'widget',
        widgetType: 'heading',
        settings: {
          title: 'Get a Free Consultation',
          header_size: 'h3',
          title_color: '#FFFFFF',
          typography_typography: 'custom',
          typography_font_size: { unit: 'px', size: 26 },
          typography_font_weight: '700'
        }
      },
      {
        id: generateId(),
        elType: 'widget',
        widgetType: 'html',
        settings: {
          html: `
            <div style="display:flex; flex-direction:column; gap:14px; width:100%;">
              <input type="text" placeholder="Your Name" style="width:100%; padding:14px 16px; border-radius:6px; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.06); color:#fff;" />
              <input type="email" placeholder="Your Email" style="width:100%; padding:14px 16px; border-radius:6px; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.06); color:#fff;" />
              <input type="text" placeholder="Phone Number" style="width:100%; padding:14px 16px; border-radius:6px; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.06); color:#fff;" />
              <textarea placeholder="Write a Message..." rows="4" style="width:100%; padding:14px 16px; border-radius:6px; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.06); color:#fff;"></textarea>
              <button style="padding:14px 28px; background:#DD131A; color:#fff; border:none; border-radius:6px; font-weight:700; font-size:16px; cursor:pointer;">${btnText} →</button>
            </div>
          `
        }
      }
    ]
  });

  // Right Col: FAQ Accordion
  const accordionItems = Array.from(secEl.querySelectorAll('.acc-btn, .accordion-title, [class*="accordion"] h4, [class*="accordion"] h5'));
  const faqTabs = accordionItems.slice(0, 4).map((item, idx) => ({
    tab_title: getCleanText(item) || `Legal Inquiry 0${idx + 1}`,
    tab_content: 'Our experienced patent and litigation attorneys provide end-to-end guidance customized to your requirements.'
  }));

  row.elements.push({
    id: generateId(),
    elType: 'container',
    isInner: true,
    settings: {
      container_type: 'flex',
      content_width: 'full',
      width: { unit: '%', size: 48 },
      _element_custom_width: { unit: '%', size: 48 },
      custom_css: 'selector { width:48% !important; max-width:48% !important; flex:0 0 48% !important; }',
      flex_direction: 'column',
      gap: { unit: 'px', size: 16 }
    },
    elements: [
      {
        id: generateId(),
        elType: 'widget',
        widgetType: 'accordion',
        settings: {
          tabs: faqTabs.length > 0 ? faqTabs : [
            { tab_title: 'IP Translations & International Filings', tab_content: 'Comprehensive multi-jurisdictional patent protection strategies.' },
            { tab_title: 'Trademark Infringement Arbitration', tab_content: 'Specialized arbitration and dispute resolution services.' },
            { tab_title: 'Licensing & Commercial Asset Agreements', tab_content: 'Structuring enforceable commercial licensing frameworks.' }
          ]
        }
      }
    ]
  });

  innerContainer.elements.push(row);
}

// --------------------------------------------------------------------------
// 10. Multi-Card Grid Archetype Builder (Services / Practice Areas)
// --------------------------------------------------------------------------
function compileCardGridArchetype(secEl, gridRows, innerContainer, win, parseColor, parseBgImage, generateId, getCleanText) {
  // Title block
  const titleEl = secEl.querySelector('.sec-title, .title-box, [class*="title"]');
  if (titleEl) {
    const titleText = getCleanText(titleEl.querySelector('h1, h2, h3, h4, .title')) || getCleanText(titleEl);
    if (titleText && titleText.length < 100) {
      innerContainer.elements.push({
        id: generateId(),
        elType: 'widget',
        widgetType: 'heading',
        settings: {
          title: titleText,
          header_size: 'h2',
          title_color: '#FFFFFF',
          typography_typography: 'custom',
          typography_font_size: { unit: 'px', size: 36 },
          typography_font_weight: '700',
          align: 'center'
        }
      });
    }
  }

  for (const r of gridRows) {
    const colElements = Array.from(r.querySelectorAll(':scope > [class*="col-"], :scope > [class*="block"], :scope > [class*="item"]'))
      .filter(c => win.getComputedStyle(c).display !== 'none');
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
        custom_css: 'selector { display:flex !important; flex-direction:row !important; flex-wrap:wrap !important; width:100% !important; }'
      },
      elements: []
    };

    const colCount = colElements.length;
    let widthPercent = 31;
    if (colCount === 2) widthPercent = 48;
    else if (colCount === 4) widthPercent = 23;
    else if (colCount >= 3) widthPercent = 31; // 3 per row (e.g. 3 cards or 6 cards in 3x2)

    for (const col of colElements) {
      const s = win.getComputedStyle(col);
      const innerCard = col.querySelector('[class*="inner"], [class*="box"], [class*="single"], .card') || col;
      const ics = win.getComputedStyle(innerCard);
      const cardBg = parseColor(ics.backgroundColor) || parseColor(s.backgroundColor) || 'rgba(255, 255, 255, 0.05)';
      const cardBr = parseInt(ics.borderRadius) || 12;

      const cardContainer = {
        id: generateId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'column',
          width: { unit: '%', size: widthPercent },
          _element_custom_width: { unit: '%', size: widthPercent },
          custom_css: `selector { width:${widthPercent}% !important; max-width:${widthPercent}% !important; flex:0 0 ${widthPercent}% !important; }`,
          background_background: 'classic',
          background_color: cardBg,
          border_radius: { unit: 'px', top: String(cardBr), right: String(cardBr), bottom: String(cardBr), left: String(cardBr), isLinked: true },
          padding: { unit: 'px', top: '32', right: '28', bottom: '32', left: '28', isLinked: false },
          box_shadow_box_shadow: { horizontal: 0, vertical: 10, blur: 30, spread: 0, color: 'rgba(0,0,0,0.08)' },
          gap: { unit: 'px', size: 16 }
        },
        elements: []
      };

      // Card Icon
      cardContainer.elements.push({
        id: generateId(),
        elType: 'widget',
        widgetType: 'icon',
        settings: {
          selected_icon: { value: 'fas fa-shield-alt', library: 'fa-solid' },
          primary_color: '#DD131A',
          view: 'default'
        }
      });

      // Card Heading
      const h = col.querySelector('h1, h2, h3, h4, h5, h6, .title');
      if (h) {
        cardContainer.elements.push({
          id: generateId(),
          elType: 'widget',
          widgetType: 'heading',
          settings: {
            title: getCleanText(h),
            header_size: 'h4',
            title_color: '#FFFFFF',
            typography_typography: 'custom',
            typography_font_size: { unit: 'px', size: 20 },
            typography_font_weight: '700'
          }
        });
      }

      // Card Paragraph
      const p = col.querySelector('p, .text');
      if (p) {
        cardContainer.elements.push({
          id: generateId(),
          elType: 'widget',
          widgetType: 'text-editor',
          settings: {
            editor: `<p>${getCleanText(p)}</p>`,
            text_color: '#94A3B8',
            typography_typography: 'custom',
            typography_font_size: { unit: 'px', size: 15 }
          }
        });
      }

      rowContainer.elements.push(cardContainer);
    }

    innerContainer.elements.push(rowContainer);
  }
}

// --------------------------------------------------------------------------
// 11a. About + Counter Split Archetype Builder
// --------------------------------------------------------------------------
function compileAboutCounterArchetype(secEl, innerContainer, win, parseColor, generateId, getCleanText) {
  const row = {
    id: generateId(),
    elType: 'container',
    isInner: true,
    settings: {
      container_type: 'flex',
      content_width: 'full',
      flex_direction: 'row',
      flex_wrap: 'wrap',
      justify_content: 'space-between',
      align_items: 'center',
      gap: { unit: 'px', size: 40 },
      custom_css: 'selector { display:flex !important; flex-direction:row !important; align-items:center !important; }'
    },
    elements: []
  };

  // Left Col: Section title, checklist items, experience badge
  const leftCol = {
    id: generateId(),
    elType: 'container',
    isInner: true,
    settings: {
      container_type: 'flex',
      content_width: 'full',
      width: { unit: '%', size: 48 },
      _element_custom_width: { unit: '%', size: 48 },
      custom_css: 'selector { width:48% !important; max-width:48% !important; flex:0 0 48% !important; }',
      flex_direction: 'column',
      gap: { unit: 'px', size: 16 }
    },
    elements: []
  };

  const secTitle = getCleanText(secEl.querySelector('.sec-title, [class*="title"] h2, h2, h3'));
  if (secTitle) {
    leftCol.elements.push({
      id: generateId(),
      elType: 'widget',
      widgetType: 'heading',
      settings: {
        title: secTitle,
        header_size: 'h2',
        title_color: '#111827',
        typography_typography: 'custom',
        typography_font_size: { unit: 'px', size: 36 },
        typography_font_weight: '700'
      }
    });
  }

  // Check list items
  const checkItems = Array.from(secEl.querySelectorAll('.checklist li, [class*="check-list"] li, [class*="list-item"]')).slice(0, 5);
  if (checkItems.length > 0) {
    const listHtml = checkItems.map(li => `<li style="display:flex; align-items:center; gap:10px; margin-bottom:10px; font-size:15px; color:#374151;"><span style="color:#DD131A; font-size:18px;">✓</span> ${getCleanText(li)}</li>`).join('');
    leftCol.elements.push({
      id: generateId(),
      elType: 'widget',
      widgetType: 'html',
      settings: { html: `<ul style="list-style:none; padding:0; margin:0;">${listHtml}</ul>` }
    });
  }

  // Experience badge (e.g. "10+ Years")
  const badgeEl = secEl.querySelector('[class*="about-one_box"], [class*="experience"], [class*="badge"]');
  if (badgeEl) {
    const badgeText = getCleanText(badgeEl);
    if (badgeText) {
      leftCol.elements.push({
        id: generateId(),
        elType: 'widget',
        widgetType: 'html',
        settings: {
          html: `<div style="display:inline-flex; align-items:center; gap:12px; background:#DD131A; color:#fff; padding:18px 24px; border-radius:12px; font-weight:800; font-size:28px;">${badgeText}</div>`
        }
      });
    }
  }

  row.elements.push(leftCol);

  // Right Col: Stat counters (980+, 820+, 760+)
  const rightCol = {
    id: generateId(),
    elType: 'container',
    isInner: true,
    settings: {
      container_type: 'flex',
      content_width: 'full',
      width: { unit: '%', size: 48 },
      _element_custom_width: { unit: '%', size: 48 },
      custom_css: 'selector { width:48% !important; max-width:48% !important; flex:0 0 48% !important; }',
      flex_direction: 'column',
      gap: { unit: 'px', size: 20 }
    },
    elements: []
  };

  const counterEls = Array.from(secEl.querySelectorAll('[class*="count-box"], [class*="counter-item"], [class*="fact-item"], [class*="counter-column"] > div, [class*="count-num"]')).slice(0, 3);
  if (counterEls.length > 0) {
    for (const c of counterEls) {
      const num = getCleanText(c.querySelector('.count-num, .counter, h3, h4, .number, strong')) || getCleanText(c).substring(0, 10);
      const label = getCleanText(c.querySelector('.count-text, p, span, .title, .desc')) || '';
      rightCol.elements.push({
        id: generateId(),
        elType: 'widget',
        widgetType: 'html',
        settings: {
          html: `<div style="border-left:4px solid #DD131A; padding:16px 20px; background:#F9FAFB; border-radius:8px;"><div style="font-size:40px; font-weight:900; color:#111827;">${num}</div><div style="font-size:15px; color:#6B7280; font-weight:500; margin-top:4px;">${label}</div></div>`
        }
      });
    }
  } else {
    // Fallback counters
    for (const c of [['980+', 'Cases Won'], ['820+', 'Clients Served'], ['760+', 'Successful Patents']]) {
      rightCol.elements.push({
        id: generateId(),
        elType: 'widget',
        widgetType: 'html',
        settings: {
          html: `<div style="border-left:4px solid #DD131A; padding:16px 20px; background:#F9FAFB; border-radius:8px;"><div style="font-size:40px; font-weight:900; color:#111827;">${c[0]}</div><div style="font-size:15px; color:#6B7280; font-weight:500; margin-top:4px;">${c[1]}</div></div>`
        }
      });
    }
  }

  row.elements.push(rightCol);
  innerContainer.elements.push(row);
}

// --------------------------------------------------------------------------
// 11b. Swiper Carousel → Card Grid Archetype Builder
// (e.g. 3 white service cards rotating in a swiper — render them as a static flex row)
// --------------------------------------------------------------------------
function compileSwiperCardGridArchetype(secEl, swiperSlides, innerContainer, win, parseColor, generateId, getCleanText) {
  // Section title
  const titleEl = secEl.querySelector('.sec-title, [class*="title-box"], [class*="section-title"]');
  if (titleEl) {
    const titleText = getCleanText(titleEl.querySelector('h2, h3, h4')) || getCleanText(titleEl);
    if (titleText && titleText.length < 100) {
      innerContainer.elements.push({
        id: generateId(),
        elType: 'widget',
        widgetType: 'heading',
        settings: {
          title: titleText,
          header_size: 'h2',
          title_color: '#111827',
          typography_typography: 'custom',
          typography_font_size: { unit: 'px', size: 36 },
          typography_font_weight: '700',
          align: 'center'
        }
      });
    }
  }

  const count = Math.min(swiperSlides.length, 4);
  const widthPercent = count === 2 ? 48 : count === 4 ? 23 : 31;

  const row = {
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
      custom_css: 'selector { display:flex !important; flex-direction:row !important; flex-wrap:wrap !important; }'
    },
    elements: []
  };

  for (let i = 0; i < count; i++) {
    const slide = swiperSlides[i];
    const cardInner = slide.querySelector('[class*="inner"], [class*="box"], [class*="single"]') || slide;
    const cs = win.getComputedStyle(cardInner);
    const cardBg = parseColor(cs.backgroundColor) || '#FFFFFF';

    const h = slide.querySelector('h3, h4, h5, .title');
    const p = slide.querySelector('p, .text, .desc');
    const img = slide.querySelector('img:not([src*="logo"]):not([src*="icon"])');
    const icon = slide.querySelector('i[class*="fa"], svg, span[class*="icon"]');

    const cardEl = {
      id: generateId(),
      elType: 'container',
      isInner: true,
      settings: {
        container_type: 'flex',
        content_width: 'full',
        flex_direction: 'column',
        width: { unit: '%', size: widthPercent },
        _element_custom_width: { unit: '%', size: widthPercent },
        custom_css: `selector { width:${widthPercent}% !important; max-width:${widthPercent}% !important; flex:0 0 ${widthPercent}% !important; }`,
        background_background: 'classic',
        background_color: cardBg,
        border_radius: { unit: 'px', top: '12', right: '12', bottom: '12', left: '12', isLinked: true },
        padding: { unit: 'px', top: '36', right: '28', bottom: '36', left: '28', isLinked: false },
        box_shadow_box_shadow: { horizontal: 0, vertical: 10, blur: 30, spread: 0, color: 'rgba(0,0,0,0.08)' },
        gap: { unit: 'px', size: 14 }
      },
      elements: []
    };

    // Icon or image
    if (img) {
      cardEl.elements.push({
        id: generateId(),
        elType: 'widget',
        widgetType: 'image',
        settings: { image: { url: img.currentSrc || img.src }, image_size: 'thumbnail', align: 'left' }
      });
    } else {
      cardEl.elements.push({
        id: generateId(),
        elType: 'widget',
        widgetType: 'icon',
        settings: { selected_icon: { value: 'fas fa-shield-alt', library: 'fa-solid' }, primary_color: '#DD131A', view: 'default' }
      });
    }

    if (h) {
      const hs = win.getComputedStyle(h);
      cardEl.elements.push({
        id: generateId(),
        elType: 'widget',
        widgetType: 'heading',
        settings: {
          title: getCleanText(h),
          header_size: 'h4',
          title_color: parseColor(hs.color) || '#111827',
          typography_typography: 'custom',
          typography_font_size: { unit: 'px', size: 20 },
          typography_font_weight: '700'
        }
      });
    }

    if (p) {
      cardEl.elements.push({
        id: generateId(),
        elType: 'widget',
        widgetType: 'text-editor',
        settings: {
          editor: `<p>${getCleanText(p)}</p>`,
          text_color: '#6B7280',
          typography_typography: 'custom',
          typography_font_size: { unit: 'px', size: 15 }
        }
      });
    }

    row.elements.push(cardEl);
  }

  innerContainer.elements.push(row);
}

// --------------------------------------------------------------------------
// 11c. Footer Multi-Column Archetype Builder
// --------------------------------------------------------------------------
function compileFooterArchetype(footerEl, innerContainer, win, parseColor, generateId, getCleanText) {
  const widgetCols = Array.from(footerEl.querySelectorAll('[class*="footer-widget"], [class*="footer-col"], .col-lg-3, .col-lg-4, .col-md-6'))
    .filter(c => c.offsetHeight > 20 && !c.closest('[class*="footer-bottom"], [class*="copyright"]'));

  const count = Math.min(widgetCols.length || 4, 4);
  const widthPercent = count === 3 ? 31 : count === 2 ? 48 : 23;

  const row = {
    id: generateId(),
    elType: 'container',
    isInner: true,
    settings: {
      container_type: 'flex',
      content_width: 'full',
      flex_direction: 'row',
      flex_wrap: 'wrap',
      justify_content: 'space-between',
      align_items: 'flex-start',
      gap: { unit: 'px', size: 30 },
      custom_css: 'selector { display:flex !important; flex-direction:row !important; flex-wrap:wrap !important; }'
    },
    elements: []
  };

  const colsToRender = widgetCols.length > 0 ? widgetCols.slice(0, count) : null;

  if (colsToRender && colsToRender.length > 0) {
    for (const col of colsToRender) {
      const colTitle = getCleanText(col.querySelector('h3, h4, h5, .widget-title, .footer-title'));
      const links = Array.from(col.querySelectorAll('a')).filter(a => {
        const t = getCleanText(a);
        return t && t.length > 1 && t.length < 60;
      }).slice(0, 6);
      const img = col.querySelector('img');
      const desc = col.querySelector('p, .desc, .text');

      const colEl = {
        id: generateId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'column',
          width: { unit: '%', size: widthPercent },
          _element_custom_width: { unit: '%', size: widthPercent },
          custom_css: `selector { width:${widthPercent}% !important; max-width:${widthPercent}% !important; flex:0 0 ${widthPercent}% !important; }`,
          gap: { unit: 'px', size: 12 }
        },
        elements: []
      };

      if (img) {
        colEl.elements.push({
          id: generateId(),
          elType: 'widget',
          widgetType: 'image',
          settings: { image: { url: img.currentSrc || img.src }, image_size: 'full', align: 'left' }
        });
      }

      if (colTitle) {
        colEl.elements.push({
          id: generateId(),
          elType: 'widget',
          widgetType: 'heading',
          settings: {
            title: colTitle,
            header_size: 'h4',
            title_color: '#FFFFFF',
            typography_typography: 'custom',
            typography_font_size: { unit: 'px', size: 18 },
            typography_font_weight: '700'
          }
        });
      }

      if (desc) {
        colEl.elements.push({
          id: generateId(),
          elType: 'widget',
          widgetType: 'text-editor',
          settings: { editor: `<p style="color:#9CA3AF; font-size:14px; line-height:1.6;">${getCleanText(desc)}</p>` }
        });
      }

      if (links.length > 0) {
        const linksHtml = links.map(a => `<li style="margin-bottom:8px;"><a href="${a.getAttribute('href') || '#'}" style="color:#9CA3AF; text-decoration:none; font-size:14px; transition:color 0.2s;">${getCleanText(a)}</a></li>`).join('');
        colEl.elements.push({
          id: generateId(),
          elType: 'widget',
          widgetType: 'html',
          settings: { html: `<ul style="list-style:none; padding:0; margin:0;">${linksHtml}</ul>` }
        });
      }

      row.elements.push(colEl);
    }
  } else {
    // Fallback: 4 placeholder footer columns
    const placeholders = ['Company', 'Practice Areas', 'Quick Links', 'Contact'];
    for (const title of placeholders) {
      row.elements.push({
        id: generateId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'column',
          width: { unit: '%', size: 23 },
          custom_css: 'selector { width:23% !important; max-width:23% !important; flex:0 0 23% !important; }',
          gap: { unit: 'px', size: 12 }
        },
        elements: [{
          id: generateId(),
          elType: 'widget',
          widgetType: 'heading',
          settings: { title: title, header_size: 'h4', title_color: '#FFFFFF', typography_font_size: { unit: 'px', size: 18 } }
        }]
      });
    }
  }

  innerContainer.elements.push(row);

  // Copyright bar
  const copyright = getCleanText(footerEl.querySelector('[class*="footer-bottom"], [class*="copyright"]')) || '';
  if (copyright) {
    innerContainer.elements.push({
      id: generateId(),
      elType: 'widget',
      widgetType: 'text-editor',
      settings: {
        editor: `<p style="text-align:center; color:#6B7280; font-size:13px; border-top:1px solid rgba(255,255,255,0.1); padding-top:20px; margin-top:10px;">${copyright}</p>`
      }
    });
  }
}

// --------------------------------------------------------------------------
// 12. Generic Tree Layout Compiler (Fallback)
// --------------------------------------------------------------------------
function compileGenericSectionLayout(targetRoot, innerContainer, win, parseColor, parseBgImage, generateId, getCleanText) {
  const children = Array.from(targetRoot.children).filter(c => win.getComputedStyle(c).display !== 'none');
  for (const child of children) {
    const headings = child.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(h => {
      const text = getCleanText(h);
      if (text && text.length < 120) {
        innerContainer.elements.push({
          id: generateId(),
          elType: 'widget',
          widgetType: 'heading',
          settings: {
            title: text,
            header_size: 'h3',
            title_color: '#111827',
            typography_typography: 'custom',
            typography_font_size: { unit: 'px', size: 26 },
            typography_font_weight: '700'
          }
        });
      }
    });

    const paragraphs = child.querySelectorAll('p');
    paragraphs.forEach(p => {
      if (p.closest('nav, .navigation, .main-menu')) return;
      const text = getCleanText(p);
      if (text && text.length > 10 && text.length < 500) {
        innerContainer.elements.push({
          id: generateId(),
          elType: 'widget',
          widgetType: 'text-editor',
          settings: {
            editor: `<p>${text}</p>`,
            text_color: '#6B7280',
            typography_typography: 'custom',
            typography_font_size: { unit: 'px', size: 15 }
          }
        });
      }
    });
  }
}

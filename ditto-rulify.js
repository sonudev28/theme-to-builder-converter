import fs from 'fs';
import path from 'path';

function genId() {
  return Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0') + Math.floor(Math.random() * 16).toString(16);
}

export function buildDittoRulifyTemplate() {
  const sections = [];

  // ==========================================
  // SECTION 1: Top Navigation Bar (#FFFFFF)
  // ==========================================
  sections.push({
    id: genId(),
    elType: 'container',
    isInner: false,
    settings: {
      container_type: 'flex',
      content_width: 'boxed',
      flex_direction: 'column',
      padding: { unit: 'px', top: '20', right: '20', bottom: '20', left: '20', isLinked: false },
      background_background: 'classic',
      background_color: '#FFFFFF'
    },
    elements: [
      {
        id: genId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'row',
          flex_justify_content: 'space-between',
          flex_align_items: 'center'
        },
        elements: [
          // Logo
          {
            id: genId(),
            elType: 'container',
            isInner: true,
            settings: { container_type: 'flex', content_width: 'full', width: { unit: '%', size: 20 }, flex_direction: 'column' },
            elements: [
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'image',
                settings: {
                  image: { url: 'https://demo.themeim.com/wp/rulify/wp-content/themes/lawlify/assets/images/logo.svg' },
                  image_size: 'full',
                  align: 'left'
                },
                elements: []
              }
            ]
          },
          // Menu Links
          {
            id: genId(),
            elType: 'container',
            isInner: true,
            settings: {
              container_type: 'flex',
              content_width: 'full',
              width: { unit: '%', size: 55 },
              flex_direction: 'row',
              flex_justify_content: 'center',
              gap: { unit: 'px', size: 28 }
            },
            elements: ['Home', 'About', 'Cases', 'Services', 'Blog', 'Contact'].map(link => ({
              id: genId(),
              elType: 'widget',
              widgetType: 'heading',
              settings: {
                title: link,
                header_size: 'span',
                title_color: link === 'Home' ? '#DD131A' : '#141B27',
                typography_typography: 'custom',
                typography_font_size: { unit: 'px', size: 15 },
                typography_font_weight: '600'
              },
              elements: []
            }))
          },
          // Action Button
          {
            id: genId(),
            elType: 'container',
            isInner: true,
            settings: { container_type: 'flex', content_width: 'full', width: { unit: '%', size: 20 }, flex_direction: 'column', flex_align_items: 'flex-end' },
            elements: [
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'button',
                settings: {
                  text: 'Get a Quote',
                  link: { url: '#contact' },
                  background_color: '#DD131A',
                  button_text_color: '#FFFFFF',
                  border_radius: { unit: 'px', top: '6', right: '6', bottom: '6', left: '6', isLinked: true },
                  padding: { unit: 'px', top: '12', right: '24', bottom: '12', left: '24', isLinked: false }
                },
                elements: []
              }
            ]
          }
        ]
      }
    ]
  });

  // ==========================================
  // SECTION 2: Hero Banner (#0B132A Deep Dark Blue)
  // ==========================================
  sections.push({
    id: genId(),
    elType: 'container',
    isInner: false,
    settings: {
      container_type: 'flex',
      content_width: 'boxed',
      flex_direction: 'column',
      padding: { unit: 'px', top: '90', right: '20', bottom: '0', left: '20', isLinked: false },
      background_background: 'classic',
      background_color: '#0B132A'
    },
    elements: [
      {
        id: genId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'row',
          flex_wrap: 'wrap',
          flex_justify_content: 'space-between',
          flex_align_items: 'center'
        },
        elements: [
          // Left Column (52%)
          {
            id: genId(),
            elType: 'container',
            isInner: true,
            settings: { container_type: 'flex', content_width: 'full', width: { unit: '%', size: 52 }, flex_direction: 'column' },
            elements: [
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'heading',
                settings: {
                  title: '✦ INTELLECTUAL PROPERTY LAW FIRM',
                  header_size: 'h6',
                  title_color: '#EF4444',
                  typography_typography: 'custom',
                  typography_font_size: { unit: 'px', size: 14 },
                  typography_font_weight: '700',
                  typography_letter_spacing: { unit: 'px', size: 1.5 }
                },
                elements: []
              },
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'heading',
                settings: {
                  title: 'Unveiling Patents, Trademarks & Copyrights',
                  header_size: 'h1',
                  title_color: '#FFFFFF',
                  typography_typography: 'custom',
                  typography_font_size: { unit: 'px', size: 52 },
                  typography_font_weight: '700',
                  typography_line_height: { unit: 'em', size: 1.15 },
                  margin: { unit: 'px', top: '15', right: '0', bottom: '20', left: '0', isLinked: false }
                },
                elements: []
              },
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'text-editor',
                settings: {
                  editor: '<p>A full glance into intellectual property rights, safeguarding your global innovations, creative assets, and trademark compliance.</p>',
                  text_color: '#CBD5E1',
                  typography_typography: 'custom',
                  typography_font_size: { unit: 'px', size: 16 },
                  margin: { unit: 'px', top: '0', right: '0', bottom: '35', left: '0', isLinked: false }
                },
                elements: []
              },
              // Button Group
              {
                id: genId(),
                elType: 'container',
                isInner: true,
                settings: {
                  container_type: 'flex',
                  content_width: 'full',
                  flex_direction: 'row',
                  gap: { unit: 'px', size: 20 },
                  flex_align_items: 'center'
                },
                elements: [
                  {
                    id: genId(),
                    elType: 'widget',
                    widgetType: 'button',
                    settings: {
                      text: 'Contact Us Now →',
                      link: { url: '#contact' },
                      background_color: '#DD131A',
                      button_text_color: '#FFFFFF',
                      border_radius: { unit: 'px', top: '6', right: '6', bottom: '6', left: '6', isLinked: true },
                      padding: { unit: 'px', top: '16', right: '32', bottom: '16', left: '32', isLinked: false }
                    },
                    elements: []
                  }
                ]
              }
            ]
          },
          // Right Column (45% Cutout Portrait)
          {
            id: genId(),
            elType: 'container',
            isInner: true,
            settings: {
              container_type: 'flex',
              content_width: 'full',
              width: { unit: '%', size: 45 },
              flex_direction: 'column',
              flex_align_items: 'center'
            },
            elements: [
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'image',
                settings: {
                  image: { url: 'https://demo.themeim.com/wp/rulify/wp-content/uploads/2024/09/image-s1.png' },
                  image_size: 'full',
                  align: 'center'
                },
                elements: []
              }
            ]
          }
        ]
      }
    ]
  });

  // ==========================================
  // SECTION 3: Why Choose Us / Services One (#FFFFFF)
  // ==========================================
  sections.push({
    id: genId(),
    elType: 'container',
    isInner: false,
    settings: {
      container_type: 'flex',
      content_width: 'boxed',
      flex_direction: 'column',
      padding: { unit: 'px', top: '90', right: '20', bottom: '90', left: '20', isLinked: false },
      background_background: 'classic',
      background_color: '#FFFFFF'
    },
    elements: [
      // Section Title Block
      {
        id: genId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'column',
          flex_align_items: 'center',
          margin: { unit: 'px', top: '0', right: '0', bottom: '50', left: '0', isLinked: false }
        },
        elements: [
          {
            id: genId(),
            elType: 'widget',
            widgetType: 'heading',
            settings: {
              title: 'WHY CHOSE US',
              header_size: 'h6',
              align: 'center',
              title_color: '#DD131A',
              typography_typography: 'custom',
              typography_font_size: { unit: 'px', size: 14 },
              typography_font_weight: '700',
              typography_letter_spacing: { unit: 'px', size: 1.5 }
            },
            elements: []
          },
          {
            id: genId(),
            elType: 'widget',
            widgetType: 'heading',
            settings: {
              title: 'Reason to Chose Us',
              header_size: 'h2',
              align: 'center',
              title_color: '#141B27',
              typography_typography: 'custom',
              typography_font_size: { unit: 'px', size: 38 },
              typography_font_weight: '700'
            },
            elements: []
          }
        ]
      },
      // 3 Service Cards Row
      {
        id: genId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'row',
          flex_wrap: 'wrap',
          gap: { unit: 'px', size: 24 }
        },
        elements: [
          { title: 'Corporate Compliance', desc: 'Our team comprises seasoned patent professionals with years of experience across industries.' },
          { title: 'Intellectual Property Law', desc: 'Comprehensive trademark and patent protections with dedicated counsel for corporate ventures.' },
          { title: 'Commercial Arbitration', desc: 'Strategic dispute resolution and intellectual property arbitration services for complex filings.' }
        ].map(card => ({
          id: genId(),
          elType: 'container',
          isInner: true,
          settings: {
            container_type: 'flex',
            content_width: 'full',
            width: { unit: '%', size: 31 },
            flex_direction: 'column',
            flex_align_items: 'center',
            padding: { unit: 'px', top: '40', right: '30', bottom: '40', left: '30', isLinked: false },
            background_background: 'classic',
            background_color: '#FFFFFF',
            border_radius: { unit: 'px', top: '16', right: '16', bottom: '16', left: '16', isLinked: true },
            box_shadow_box_shadow_type: 'yes',
            box_shadow_box_shadow: { horizontal: 0, vertical: 10, blur: 30, spread: 0, color: 'rgba(0, 0, 0, 0.06)' }
          },
          elements: [
            // Red circular icon container
            {
              id: genId(),
              elType: 'container',
              isInner: true,
              settings: {
                container_type: 'flex',
                content_width: 'full',
                width: { unit: 'px', size: 70 },
                padding: { unit: 'px', top: '18', right: '18', bottom: '18', left: '18', isLinked: true },
                background_background: 'classic',
                background_color: 'rgba(221, 19, 26, 0.08)',
                border_radius: { unit: 'px', top: '50', right: '50', bottom: '50', left: '50', isLinked: true },
                margin: { unit: 'px', top: '0', right: '0', bottom: '20', left: '0', isLinked: false },
                flex_justify_content: 'center',
                flex_align_items: 'center'
              },
              elements: [
                {
                  id: genId(),
                  elType: 'widget',
                  widgetType: 'heading',
                  settings: {
                    title: '⚖️',
                    header_size: 'span',
                    align: 'center',
                    typography_typography: 'custom',
                    typography_font_size: { unit: 'px', size: 28 }
                  },
                  elements: []
                }
              ]
            },
            {
              id: genId(),
              elType: 'widget',
              widgetType: 'heading',
              settings: {
                title: card.title,
                header_size: 'h3',
                align: 'center',
                title_color: '#141B27',
                typography_typography: 'custom',
                typography_font_size: { unit: 'px', size: 20 },
                typography_font_weight: '700',
                margin: { unit: 'px', top: '0', right: '0', bottom: '12', left: '0', isLinked: false }
              },
              elements: []
            },
            {
              id: genId(),
              elType: 'widget',
              widgetType: 'text-editor',
              settings: {
                editor: `<p>${card.desc}</p>`,
                align: 'center',
                text_color: '#64748B',
                margin: { unit: 'px', top: '0', right: '0', bottom: '20', left: '0', isLinked: false }
              },
              elements: []
            },
            {
              id: genId(),
              elType: 'widget',
              widgetType: 'button',
              settings: {
                text: 'Read More →',
                link: { url: '#' },
                background_color: 'transparent',
                button_text_color: '#DD131A',
                typography_typography: 'custom',
                typography_font_weight: '700',
                padding: { unit: 'px', top: '0', right: '0', bottom: '0', left: '0', isLinked: true }
              },
              elements: []
            }
          ]
        }))
      }
    ]
  });

  // ==========================================
  // SECTION 4: About Us (#FFFFFF)
  // ==========================================
  sections.push({
    id: genId(),
    elType: 'container',
    isInner: false,
    settings: {
      container_type: 'flex',
      content_width: 'boxed',
      flex_direction: 'column',
      padding: { unit: 'px', top: '80', right: '20', bottom: '80', left: '20', isLinked: false },
      background_background: 'classic',
      background_color: '#FFFFFF'
    },
    elements: [
      {
        id: genId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'row',
          flex_wrap: 'wrap',
          flex_justify_content: 'space-between',
          flex_align_items: 'center'
        },
        elements: [
          // Left Column (50%)
          {
            id: genId(),
            elType: 'container',
            isInner: true,
            settings: { container_type: 'flex', content_width: 'full', width: { unit: '%', size: 50 }, flex_direction: 'column' },
            elements: [
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'heading',
                settings: {
                  title: 'ABOUT US',
                  header_size: 'h6',
                  title_color: '#DD131A',
                  typography_typography: 'custom',
                  typography_font_size: { unit: 'px', size: 14 },
                  typography_font_weight: '700',
                  typography_letter_spacing: { unit: 'px', size: 1.5 }
                },
                elements: []
              },
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'heading',
                settings: {
                  title: 'Our Story in Intellectual Property',
                  header_size: 'h2',
                  title_color: '#141B27',
                  typography_typography: 'custom',
                  typography_font_size: { unit: 'px', size: 36 },
                  typography_font_weight: '700',
                  margin: { unit: 'px', top: '10', right: '0', bottom: '20', left: '0', isLinked: false }
                },
                elements: []
              },
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'text-editor',
                settings: {
                  editor: '<p>We are a team of dedicated patent professionals, united by our commitment to excellence in patent protection, trademark safeguarding, and licensing agreements worldwide.</p>',
                  text_color: '#64748B',
                  margin: { unit: 'px', top: '0', right: '0', bottom: '25', left: '0', isLinked: false }
                },
                elements: []
              },
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'text-editor',
                settings: {
                  editor: '<ul style="list-style:none; padding-left:0; line-height:2.2; color:#141B27; font-weight:600;"><li style="margin-bottom:8px;">✔ &nbsp; Strategic Patent Advisory & Filing</li><li style="margin-bottom:8px;">✔ &nbsp; Proven Record in Trademark Protection</li><li>✔ &nbsp; Multi-Jurisdictional IP Enforcement</li></ul>',
                  margin: { unit: 'px', top: '0', right: '0', bottom: '30', left: '0', isLinked: false }
                },
                elements: []
              },
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'button',
                settings: {
                  text: 'Discover More →',
                  link: { url: '#about' },
                  background_color: '#DD131A',
                  button_text_color: '#FFFFFF',
                  border_radius: { unit: 'px', top: '6', right: '6', bottom: '6', left: '6', isLinked: true },
                  padding: { unit: 'px', top: '14', right: '28', bottom: '14', left: '28', isLinked: false }
                },
                elements: []
              }
            ]
          },
          // Right Column (48% Image with Stat Badge)
          {
            id: genId(),
            elType: 'container',
            isInner: true,
            settings: { container_type: 'flex', content_width: 'full', width: { unit: '%', size: 48 }, flex_direction: 'column', flex_align_items: 'center' },
            elements: [
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'image',
                settings: {
                  image: { url: 'https://demo.themeim.com/wp/rulify/wp-content/uploads/2024/09/about-1.jpg' },
                  image_size: 'full',
                  border_radius: { unit: 'px', top: '16', right: '16', bottom: '16', left: '16', isLinked: true }
                },
                elements: []
              }
            ]
          }
        ]
      }
    ]
  });

  // ==========================================
  // SECTION 5: Practice Area (#0B132A Deep Dark Blue)
  // ==========================================
  sections.push({
    id: genId(),
    elType: 'container',
    isInner: false,
    settings: {
      container_type: 'flex',
      content_width: 'boxed',
      flex_direction: 'column',
      padding: { unit: 'px', top: '90', right: '20', bottom: '90', left: '20', isLinked: false },
      background_background: 'classic',
      background_color: '#0B132A'
    },
    elements: [
      // Title Block
      {
        id: genId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'column',
          flex_align_items: 'center',
          margin: { unit: 'px', top: '0', right: '0', bottom: '50', left: '0', isLinked: false }
        },
        elements: [
          {
            id: genId(),
            elType: 'widget',
            widgetType: 'heading',
            settings: {
              title: 'PRACTICE AREA',
              header_size: 'h6',
              align: 'center',
              title_color: '#DD131A',
              typography_typography: 'custom',
              typography_font_size: { unit: 'px', size: 14 },
              typography_font_weight: '700',
              typography_letter_spacing: { unit: 'px', size: 1.5 }
            },
            elements: []
          },
          {
            id: genId(),
            elType: 'widget',
            widgetType: 'heading',
            settings: {
              title: 'Explore Creative Legal Protections',
              header_size: 'h2',
              align: 'center',
              title_color: '#FFFFFF',
              typography_typography: 'custom',
              typography_font_size: { unit: 'px', size: 38 },
              typography_font_weight: '700'
            },
            elements: []
          }
        ]
      },
      // 6 Dark Cards Grid (2 rows of 3)
      {
        id: genId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'row',
          flex_wrap: 'wrap',
          gap: { unit: 'px', size: 24 }
        },
        elements: [
          { title: 'Corporate Compliance', desc: 'Ensuring your organizational operations comply with domestic and international intellectual regulatory frameworks.' },
          { title: 'Intellectual Property Law', desc: 'Safeguarding patents, industrial designs, trade secrets, and copyright properties globally.' },
          { title: 'Commercial Arbitration', desc: 'Resolving disputes outside court with binding, specialized commercial arbitration procedures.' },
          { title: 'Patent Prosecution', desc: 'Drafting, filing, and negotiating patent applications with regional and international IP offices.' },
          { title: 'Trademark Registration', desc: 'Comprehensive clearance searches, filing, monitoring, and defense of corporate brand identities.' },
          { title: 'Litigation & Enforcement', desc: 'Aggressive courtroom representation for infringement, unauthorized licensing, and counterfeit defense.' }
        ].map(card => ({
          id: genId(),
          elType: 'container',
          isInner: true,
          settings: {
            container_type: 'flex',
            content_width: 'full',
            width: { unit: '%', size: 31 },
            flex_direction: 'column',
            padding: { unit: 'px', top: '35', right: '30', bottom: '35', left: '30', isLinked: false },
            background_background: 'classic',
            background_color: '#121C38',
            border_radius: { unit: 'px', top: '14', right: '14', bottom: '14', left: '14', isLinked: true },
            border_border: 'solid',
            border_width: { unit: 'px', top: '1', right: '1', bottom: '1', left: '1', isLinked: true },
            border_color: 'rgba(255, 255, 255, 0.08)'
          },
          elements: [
            {
              id: genId(),
              elType: 'widget',
              widgetType: 'heading',
              settings: {
                title: '🛡️',
                header_size: 'span',
                typography_typography: 'custom',
                typography_font_size: { unit: 'px', size: 28 },
                margin: { unit: 'px', top: '0', right: '0', bottom: '16', left: '0', isLinked: false }
              },
              elements: []
            },
            {
              id: genId(),
              elType: 'widget',
              widgetType: 'heading',
              settings: {
                title: card.title,
                header_size: 'h4',
                title_color: '#FFFFFF',
                typography_typography: 'custom',
                typography_font_size: { unit: 'px', size: 20 },
                typography_font_weight: '700',
                margin: { unit: 'px', top: '0', right: '0', bottom: '12', left: '0', isLinked: false }
              },
              elements: []
            },
            {
              id: genId(),
              elType: 'widget',
              widgetType: 'text-editor',
              settings: {
                editor: `<p>${card.desc}</p>`,
                text_color: '#94A3B8',
                typography_typography: 'custom',
                typography_font_size: { unit: 'px', size: 14 },
                margin: { unit: 'px', top: '0', right: '0', bottom: '20', left: '0', isLinked: false }
              },
              elements: []
            },
            {
              id: genId(),
              elType: 'widget',
              widgetType: 'button',
              settings: {
                text: 'Read More →',
                link: { url: '#' },
                background_color: 'transparent',
                button_text_color: '#38BDF8',
                typography_typography: 'custom',
                typography_font_weight: '700',
                padding: { unit: 'px', top: '0', right: '0', bottom: '0', left: '0', isLinked: true }
              },
              elements: []
            }
          ]
        }))
      }
    ]
  });

  // ==========================================
  // SECTION 6: Testimonials (#0B132A Deep Dark Blue)
  // ==========================================
  sections.push({
    id: genId(),
    elType: 'container',
    isInner: false,
    settings: {
      container_type: 'flex',
      content_width: 'boxed',
      flex_direction: 'column',
      padding: { unit: 'px', top: '80', right: '20', bottom: '80', left: '20', isLinked: false },
      background_background: 'classic',
      background_color: '#0B132A'
    },
    elements: [
      {
        id: genId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'row',
          flex_wrap: 'wrap',
          flex_align_items: 'center',
          gap: { unit: 'px', size: 40 }
        },
        elements: [
          // Left: Circular portrait (35%)
          {
            id: genId(),
            elType: 'container',
            isInner: true,
            settings: { container_type: 'flex', content_width: 'full', width: { unit: '%', size: 30 }, flex_direction: 'column', flex_align_items: 'center' },
            elements: [
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'image',
                settings: {
                  image: { url: 'https://demo.themeim.com/wp/rulify/wp-content/uploads/2024/09/testimonial-1.jpg' },
                  image_size: 'full',
                  border_radius: { unit: 'px', top: '500', right: '500', bottom: '500', left: '500', isLinked: true }
                },
                elements: []
              }
            ]
          },
          // Right: Quote content (65%)
          {
            id: genId(),
            elType: 'container',
            isInner: true,
            settings: { container_type: 'flex', content_width: 'full', width: { unit: '%', size: 65 }, flex_direction: 'column' },
            elements: [
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'heading',
                settings: {
                  title: '★★★★★',
                  header_size: 'h6',
                  title_color: '#DD131A',
                  typography_typography: 'custom',
                  typography_font_size: { unit: 'px', size: 20 },
                  margin: { unit: 'px', top: '0', right: '0', bottom: '15', left: '0', isLinked: false }
                },
                elements: []
              },
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'text-editor',
                settings: {
                  editor: '<p style="font-size:22px; line-height:1.6; font-style:italic; color:#FFFFFF;">“Our commitment to protecting innovative creations and safeguarding patents drives everything we do. Rulify delivered unmatched legal precision when defending our global product portfolio.”</p>',
                  margin: { unit: 'px', top: '0', right: '0', bottom: '20', left: '0', isLinked: false }
                },
                elements: []
              },
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'heading',
                settings: {
                  title: 'Franklin D. Roosevelt',
                  header_size: 'h4',
                  title_color: '#FFFFFF',
                  typography_typography: 'custom',
                  typography_font_size: { unit: 'px', size: 18 },
                  typography_font_weight: '700'
                },
                elements: []
              },
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'heading',
                settings: {
                  title: 'Founder & CEO',
                  header_size: 'span',
                  title_color: '#DD131A',
                  typography_typography: 'custom',
                  typography_font_size: { unit: 'px', size: 14 }
                },
                elements: []
              }
            ]
          }
        ]
      }
    ]
  });

  // ==========================================
  // SECTION 7: Expert Team Members (#FFFFFF)
  // ==========================================
  sections.push({
    id: genId(),
    elType: 'container',
    isInner: false,
    settings: {
      container_type: 'flex',
      content_width: 'boxed',
      flex_direction: 'column',
      padding: { unit: 'px', top: '80', right: '20', bottom: '80', left: '20', isLinked: false },
      background_background: 'classic',
      background_color: '#FFFFFF'
    },
    elements: [
      // Top Split Header
      {
        id: genId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'row',
          flex_justify_content: 'space-between',
          flex_align_items: 'flex-end',
          margin: { unit: 'px', top: '0', right: '0', bottom: '40', left: '0', isLinked: false }
        },
        elements: [
          {
            id: genId(),
            elType: 'container',
            isInner: true,
            settings: { container_type: 'flex', content_width: 'full', flex_direction: 'column' },
            elements: [
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'heading',
                settings: {
                  title: 'OUR TEAM',
                  header_size: 'h6',
                  title_color: '#DD131A',
                  typography_typography: 'custom',
                  typography_font_size: { unit: 'px', size: 14 },
                  typography_font_weight: '700',
                  typography_letter_spacing: { unit: 'px', size: 1.5 }
                },
                elements: []
              },
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'heading',
                settings: {
                  title: 'expert team members',
                  header_size: 'h2',
                  title_color: '#141B27',
                  typography_typography: 'custom',
                  typography_font_size: { unit: 'px', size: 36 },
                  typography_font_weight: '700'
                },
                elements: []
              }
            ]
          },
          {
            id: genId(),
            elType: 'widget',
            widgetType: 'button',
            settings: {
              text: 'Find Out More →',
              link: { url: '#' },
              background_color: '#DD131A',
              button_text_color: '#FFFFFF',
              border_radius: { unit: 'px', top: '6', right: '6', bottom: '6', left: '6', isLinked: true },
              padding: { unit: 'px', top: '12', right: '24', bottom: '12', left: '24', isLinked: false }
            },
            elements: []
          }
        ]
      },
      // 3 Team Cards Row
      {
        id: genId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'row',
          flex_wrap: 'wrap',
          gap: { unit: 'px', size: 24 }
        },
        elements: [
          { name: 'Clara J. Winslow', role: 'Patent Attorney', img: 'https://demo.themeim.com/wp/rulify/wp-content/uploads/2024/09/team-3.jpg' },
          { name: 'Marget M. Hason', role: 'Senior Consultant', img: 'https://demo.themeim.com/wp/rulify/wp-content/uploads/2024/09/team-1.jpg' },
          { name: 'Nora L. Kendrix', role: 'IP Specialist', img: 'https://demo.themeim.com/wp/rulify/wp-content/uploads/2024/09/team-1.jpg' }
        ].map(member => ({
          id: genId(),
          elType: 'container',
          isInner: true,
          settings: {
            container_type: 'flex',
            content_width: 'full',
            width: { unit: '%', size: 31 },
            flex_direction: 'column',
            padding: { unit: 'px', top: '0', right: '0', bottom: '24', left: '0', isLinked: false },
            background_background: 'classic',
            background_color: '#F8FAFC',
            border_radius: { unit: 'px', top: '14', right: '14', bottom: '14', left: '14', isLinked: true }
          },
          elements: [
            {
              id: genId(),
              elType: 'widget',
              widgetType: 'image',
              settings: {
                image: { url: member.img },
                image_size: 'full',
                border_radius: { unit: 'px', top: '14', right: '14', bottom: '0', left: '0', isLinked: false }
              },
              elements: []
            },
            {
              id: genId(),
              elType: 'widget',
              widgetType: 'heading',
              settings: {
                title: member.name,
                header_size: 'h4',
                align: 'center',
                title_color: '#141B27',
                typography_typography: 'custom',
                typography_font_size: { unit: 'px', size: 18 },
                typography_font_weight: '700',
                margin: { unit: 'px', top: '16', right: '0', bottom: '4', left: '0', isLinked: false }
              },
              elements: []
            },
            {
              id: genId(),
              elType: 'widget',
              widgetType: 'heading',
              settings: {
                title: member.role,
                header_size: 'span',
                align: 'center',
                title_color: '#DD131A',
                typography_typography: 'custom',
                typography_font_size: { unit: 'px', size: 14 }
              },
              elements: []
            }
          ]
        }))
      }
    ]
  });

  // ==========================================
  // SECTION 8: Quote & FAQ Split (#F8FAFC)
  // ==========================================
  sections.push({
    id: genId(),
    elType: 'container',
    isInner: false,
    settings: {
      container_type: 'flex',
      content_width: 'boxed',
      flex_direction: 'column',
      padding: { unit: 'px', top: '90', right: '20', bottom: '90', left: '20', isLinked: false },
      background_background: 'classic',
      background_color: '#F8FAFC'
    },
    elements: [
      {
        id: genId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'row',
          flex_wrap: 'wrap',
          gap: { unit: 'px', size: 30 }
        },
        elements: [
          // Left: Dark Form Box (48%)
          {
            id: genId(),
            elType: 'container',
            isInner: true,
            settings: {
              container_type: 'flex',
              content_width: 'full',
              width: { unit: '%', size: 48 },
              flex_direction: 'column',
              padding: { unit: 'px', top: '40', right: '35', bottom: '40', left: '35', isLinked: false },
              background_background: 'classic',
              background_color: '#0B132A',
              border_radius: { unit: 'px', top: '16', right: '16', bottom: '16', left: '16', isLinked: true }
            },
            elements: [
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'heading',
                settings: {
                  title: 'Get A Free Quote',
                  header_size: 'h3',
                  title_color: '#FFFFFF',
                  typography_typography: 'custom',
                  typography_font_size: { unit: 'px', size: 28 },
                  typography_font_weight: '700',
                  margin: { unit: 'px', top: '0', right: '0', bottom: '24', left: '0', isLinked: false }
                },
                elements: []
              },
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'text-editor',
                settings: {
                  editor: '<div style="display:flex; flex-direction:column; gap:16px;"><input type="text" placeholder="Your Name" style="width:100%; padding:14px; background:#141F3D; border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#fff;"/><input type="email" placeholder="Email Address" style="width:100%; padding:14px; background:#141F3D; border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#fff;"/><input type="text" placeholder="Phone Number" style="width:100%; padding:14px; background:#141F3D; border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#fff;"/><textarea placeholder="Your Message" rows="3" style="width:100%; padding:14px; background:#141F3D; border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#fff;"></textarea></div>',
                  margin: { unit: 'px', top: '0', right: '0', bottom: '20', left: '0', isLinked: false }
                },
                elements: []
              },
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'button',
                settings: {
                  text: 'Submit Request →',
                  link: { url: '#' },
                  background_color: '#DD131A',
                  button_text_color: '#FFFFFF',
                  border_radius: { unit: 'px', top: '6', right: '6', bottom: '6', left: '6', isLinked: true },
                  padding: { unit: 'px', top: '16', right: '28', bottom: '16', left: '28', isLinked: false }
                },
                elements: []
              }
            ]
          },
          // Right: FAQ Box (48%)
          {
            id: genId(),
            elType: 'container',
            isInner: true,
            settings: {
              container_type: 'flex',
              content_width: 'full',
              width: { unit: '%', size: 48 },
              flex_direction: 'column',
              padding: { unit: 'px', top: '40', right: '35', bottom: '40', left: '35', isLinked: false },
              background_background: 'classic',
              background_color: '#FFFFFF',
              border_radius: { unit: 'px', top: '16', right: '16', bottom: '16', left: '16', isLinked: true },
              box_shadow_box_shadow_type: 'yes',
              box_shadow_box_shadow: { horizontal: 0, vertical: 10, blur: 25, spread: 0, color: 'rgba(0, 0, 0, 0.05)' }
            },
            elements: [
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'heading',
                settings: {
                  title: 'Frequently Asked Questions',
                  header_size: 'h3',
                  title_color: '#141B27',
                  typography_typography: 'custom',
                  typography_font_size: { unit: 'px', size: 26 },
                  typography_font_weight: '700',
                  margin: { unit: 'px', top: '0', right: '0', bottom: '24', left: '0', isLinked: false }
                },
                elements: []
              },
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'accordion',
                settings: {
                  tabs: [
                    { tab_title: 'How do I protect my intellectual property globally?', tab_content: 'Global patent protection typically begins with PCT international filings under WIPO, followed by national phase entries in designated jurisdictions.' },
                    { tab_title: 'What is the difference between a patent and trademark?', tab_content: 'A patent safeguards novel inventions, processes, and industrial designs, whereas a trademark protects brand names, symbols, slogans, and logos.' },
                    { tab_title: 'How long does a trademark registration take?', tab_content: 'Domestic trademark registration usually ranges from 6 to 14 months depending on opposition periods and jurisdictional office backlogs.' }
                  ]
                },
                elements: []
              }
            ]
          }
        ]
      }
    ]
  });

  // ==========================================
  // SECTION 9: Case Studies (#FFFFFF)
  // ==========================================
  sections.push({
    id: genId(),
    elType: 'container',
    isInner: false,
    settings: {
      container_type: 'flex',
      content_width: 'boxed',
      flex_direction: 'column',
      padding: { unit: 'px', top: '80', right: '20', bottom: '80', left: '20', isLinked: false },
      background_background: 'classic',
      background_color: '#FFFFFF'
    },
    elements: [
      {
        id: genId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'column',
          flex_align_items: 'center',
          margin: { unit: 'px', top: '0', right: '0', bottom: '45', left: '0', isLinked: false }
        },
        elements: [
          {
            id: genId(),
            elType: 'widget',
            widgetType: 'heading',
            settings: {
              title: 'CASE STUDIES',
              header_size: 'h6',
              align: 'center',
              title_color: '#DD131A',
              typography_typography: 'custom',
              typography_font_size: { unit: 'px', size: 14 },
              typography_font_weight: '700',
              typography_letter_spacing: { unit: 'px', size: 1.5 }
            },
            elements: []
          },
          {
            id: genId(),
            elType: 'widget',
            widgetType: 'heading',
            settings: {
              title: 'Explore Our Latest Case Studies',
              header_size: 'h2',
              align: 'center',
              title_color: '#141B27',
              typography_typography: 'custom',
              typography_font_size: { unit: 'px', size: 36 },
              typography_font_weight: '700'
            },
            elements: []
          }
        ]
      },
      // 3 Project Cards
      {
        id: genId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'row',
          flex_wrap: 'wrap',
          gap: { unit: 'px', size: 24 }
        },
        elements: [
          { title: 'Unveiling Innovation', cat: 'Patent Law', img: 'https://demo.themeim.com/wp/rulify/wp-content/uploads/2024/09/case-1.jpg' },
          { title: 'Innovative Narratives', cat: 'Trademark Clearance', img: 'https://demo.themeim.com/wp/rulify/wp-content/uploads/2024/09/case-2.jpg' },
          { title: 'Global Recognition', cat: 'Copyright Defense', img: 'https://demo.themeim.com/wp/rulify/wp-content/uploads/2024/09/case-3.jpg' }
        ].map(p => ({
          id: genId(),
          elType: 'container',
          isInner: true,
          settings: {
            container_type: 'flex',
            content_width: 'full',
            width: { unit: '%', size: 31 },
            flex_direction: 'column',
            border_radius: { unit: 'px', top: '14', right: '14', bottom: '14', left: '14', isLinked: true }
          },
          elements: [
            {
              id: genId(),
              elType: 'widget',
              widgetType: 'image',
              settings: {
                image: { url: p.img },
                image_size: 'full',
                border_radius: { unit: 'px', top: '14', right: '14', bottom: '14', left: '14', isLinked: true }
              },
              elements: []
            },
            {
              id: genId(),
              elType: 'widget',
              widgetType: 'heading',
              settings: {
                title: p.title,
                header_size: 'h4',
                title_color: '#141B27',
                typography_typography: 'custom',
                typography_font_size: { unit: 'px', size: 18 },
                typography_font_weight: '700',
                margin: { unit: 'px', top: '14', right: '0', bottom: '4', left: '0', isLinked: false }
              },
              elements: []
            },
            {
              id: genId(),
              elType: 'widget',
              widgetType: 'heading',
              settings: {
                title: p.cat,
                header_size: 'span',
                title_color: '#DD131A',
                typography_typography: 'custom',
                typography_font_size: { unit: 'px', size: 13 }
              },
              elements: []
            }
          ]
        }))
      }
    ]
  });

  // ==========================================
  // SECTION 10: Patent Acquisition Process (#F7F5F2)
  // ==========================================
  sections.push({
    id: genId(),
    elType: 'container',
    isInner: false,
    settings: {
      container_type: 'flex',
      content_width: 'boxed',
      flex_direction: 'column',
      padding: { unit: 'px', top: '90', right: '20', bottom: '90', left: '20', isLinked: false },
      background_background: 'classic',
      background_color: '#F7F5F2'
    },
    elements: [
      {
        id: genId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'column',
          flex_align_items: 'center',
          margin: { unit: 'px', top: '0', right: '0', bottom: '50', left: '0', isLinked: false }
        },
        elements: [
          {
            id: genId(),
            elType: 'widget',
            widgetType: 'heading',
            settings: {
              title: 'HOW ITS WORK',
              header_size: 'h6',
              align: 'center',
              title_color: '#DD131A',
              typography_typography: 'custom',
              typography_font_size: { unit: 'px', size: 14 },
              typography_font_weight: '700',
              typography_letter_spacing: { unit: 'px', size: 1.5 }
            },
            elements: []
          },
          {
            id: genId(),
            elType: 'widget',
            widgetType: 'heading',
            settings: {
              title: 'Our Patent Acquisition Process',
              header_size: 'h2',
              align: 'center',
              title_color: '#141B27',
              typography_typography: 'custom',
              typography_font_size: { unit: 'px', size: 36 },
              typography_font_weight: '700'
            },
            elements: []
          }
        ]
      },
      // 4 Step Cards
      {
        id: genId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'row',
          flex_wrap: 'wrap',
          gap: { unit: 'px', size: 20 }
        },
        elements: [
          { num: '01', title: 'Content Creation', desc: 'Detailed technical specification drafting and novelty verification.' },
          { num: '02', title: 'Registration', desc: 'Formal submission to patent offices with complete claim schedules.' },
          { num: '03', title: 'Monitoring', desc: 'Tracking examination status and responding to office actions.' },
          { num: '04', title: 'Protection', desc: 'Final patent issuance and proactive market enforcement.' }
        ].map(step => ({
          id: genId(),
          elType: 'container',
          isInner: true,
          settings: {
            container_type: 'flex',
            content_width: 'full',
            width: { unit: '%', size: 23 },
            flex_direction: 'column',
            flex_align_items: 'center',
            padding: { unit: 'px', top: '35', right: '20', bottom: '35', left: '20', isLinked: false },
            background_background: 'classic',
            background_color: '#FFFFFF',
            border_radius: { unit: 'px', top: '14', right: '14', bottom: '14', left: '14', isLinked: true }
          },
          elements: [
            {
              id: genId(),
              elType: 'container',
              isInner: true,
              settings: {
                container_type: 'flex',
                content_width: 'full',
                width: { unit: 'px', size: 60 },
                padding: { unit: 'px', top: '15', right: '15', bottom: '15', left: '15', isLinked: true },
                background_background: 'classic',
                background_color: 'rgba(221, 19, 26, 0.08)',
                border_radius: { unit: 'px', top: '50', right: '50', bottom: '50', left: '50', isLinked: true },
                margin: { unit: 'px', top: '0', right: '0', bottom: '18', left: '0', isLinked: false },
                flex_justify_content: 'center',
                flex_align_items: 'center'
              },
              elements: [
                {
                  id: genId(),
                  elType: 'widget',
                  widgetType: 'heading',
                  settings: {
                    title: step.num,
                    header_size: 'h4',
                    align: 'center',
                    title_color: '#DD131A',
                    typography_typography: 'custom',
                    typography_font_size: { unit: 'px', size: 20 },
                    typography_font_weight: '700'
                  },
                  elements: []
                }
              ]
            },
            {
              id: genId(),
              elType: 'widget',
              widgetType: 'heading',
              settings: {
                title: step.title,
                header_size: 'h4',
                align: 'center',
                title_color: '#141B27',
                typography_typography: 'custom',
                typography_font_size: { unit: 'px', size: 18 },
                typography_font_weight: '700',
                margin: { unit: 'px', top: '0', right: '0', bottom: '8', left: '0', isLinked: false }
              },
              elements: []
            },
            {
              id: genId(),
              elType: 'widget',
              widgetType: 'text-editor',
              settings: {
                editor: `<p>${step.desc}</p>`,
                align: 'center',
                text_color: '#64748B',
                typography_typography: 'custom',
                typography_font_size: { unit: 'px', size: 13 }
              },
              elements: []
            }
          ]
        }))
      }
    ]
  });

  // ==========================================
  // SECTION 11: Blog (#FFFFFF)
  // ==========================================
  sections.push({
    id: genId(),
    elType: 'container',
    isInner: false,
    settings: {
      container_type: 'flex',
      content_width: 'boxed',
      flex_direction: 'column',
      padding: { unit: 'px', top: '80', right: '20', bottom: '80', left: '20', isLinked: false },
      background_background: 'classic',
      background_color: '#FFFFFF'
    },
    elements: [
      {
        id: genId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'row',
          flex_justify_content: 'space-between',
          flex_align_items: 'flex-end',
          margin: { unit: 'px', top: '0', right: '0', bottom: '40', left: '0', isLinked: false }
        },
        elements: [
          {
            id: genId(),
            elType: 'container',
            isInner: true,
            settings: { container_type: 'flex', content_width: 'full', flex_direction: 'column' },
            elements: [
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'heading',
                settings: {
                  title: 'OUR BLOG',
                  header_size: 'h6',
                  title_color: '#DD131A',
                  typography_typography: 'custom',
                  typography_font_size: { unit: 'px', size: 14 },
                  typography_font_weight: '700',
                  typography_letter_spacing: { unit: 'px', size: 1.5 }
                },
                elements: []
              },
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'heading',
                settings: {
                  title: 'Latest News & Articles From The Blog',
                  header_size: 'h2',
                  title_color: '#141B27',
                  typography_typography: 'custom',
                  typography_font_size: { unit: 'px', size: 36 },
                  typography_font_weight: '700'
                },
                elements: []
              }
            ]
          },
          {
            id: genId(),
            elType: 'widget',
            widgetType: 'button',
            settings: {
              text: 'View All Posts →',
              link: { url: '#' },
              background_color: '#DD131A',
              button_text_color: '#FFFFFF',
              border_radius: { unit: 'px', top: '6', right: '6', bottom: '6', left: '6', isLinked: true },
              padding: { unit: 'px', top: '12', right: '24', bottom: '12', left: '24', isLinked: false }
            },
            elements: []
          }
        ]
      },
      // 2 Large Blog Cards
      {
        id: genId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'row',
          flex_wrap: 'wrap',
          gap: { unit: 'px', size: 24 }
        },
        elements: [
          {
            title: 'Patent War Iconic Legal Battles of That Protect Shaped lead.',
            date: '28 Sep 2024',
            img: 'https://demo.themeim.com/wp/rulify/wp-content/uploads/2024/09/newsdup-25-360x260.jpg'
          },
          {
            title: 'Code Clash: The Algorithms That Sparked Courtroom Chaos',
            date: '25 Sep 2024',
            img: 'https://demo.themeim.com/wp/rulify/wp-content/uploads/2024/09/news-2-360x260.jpg'
          }
        ].map(blog => ({
          id: genId(),
          elType: 'container',
          isInner: true,
          settings: {
            container_type: 'flex',
            content_width: 'full',
            width: { unit: '%', size: 48 },
            flex_direction: 'column',
            border_radius: { unit: 'px', top: '14', right: '14', bottom: '14', left: '14', isLinked: true }
          },
          elements: [
            {
              id: genId(),
              elType: 'widget',
              widgetType: 'image',
              settings: {
                image: { url: blog.img },
                image_size: 'full',
                border_radius: { unit: 'px', top: '14', right: '14', bottom: '14', left: '14', isLinked: true }
              },
              elements: []
            },
            {
              id: genId(),
              elType: 'widget',
              widgetType: 'heading',
              settings: {
                title: blog.date,
                header_size: 'span',
                title_color: '#DD131A',
                typography_typography: 'custom',
                typography_font_size: { unit: 'px', size: 13 },
                margin: { unit: 'px', top: '14', right: '0', bottom: '6', left: '0', isLinked: false }
              },
              elements: []
            },
            {
              id: genId(),
              elType: 'widget',
              widgetType: 'heading',
              settings: {
                title: blog.title,
                header_size: 'h4',
                title_color: '#141B27',
                typography_typography: 'custom',
                typography_font_size: { unit: 'px', size: 20 },
                typography_font_weight: '700',
                margin: { unit: 'px', top: '0', right: '0', bottom: '12', left: '0', isLinked: false }
              },
              elements: []
            },
            {
              id: genId(),
              elType: 'widget',
              widgetType: 'button',
              settings: {
                text: 'Read More →',
                link: { url: '#' },
                background_color: 'transparent',
                button_text_color: '#DD131A',
                typography_typography: 'custom',
                typography_font_weight: '700',
                padding: { unit: 'px', top: '0', right: '0', bottom: '0', left: '0', isLinked: true }
              },
              elements: []
            }
          ]
        }))
      }
    ]
  });

  // ==========================================
  // SECTION 12: Partner Logos (#FFFFFF)
  // ==========================================
  sections.push({
    id: genId(),
    elType: 'container',
    isInner: false,
    settings: {
      container_type: 'flex',
      content_width: 'boxed',
      flex_direction: 'column',
      padding: { unit: 'px', top: '40', right: '20', bottom: '40', left: '20', isLinked: false },
      background_background: 'classic',
      background_color: '#FFFFFF'
    },
    elements: [
      {
        id: genId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'row',
          flex_wrap: 'wrap',
          flex_justify_content: 'space-between',
          flex_align_items: 'center'
        },
        elements: [
          'https://demo.themeim.com/wp/rulify/wp-content/uploads/2024/09/client-1.png',
          'https://demo.themeim.com/wp/rulify/wp-content/uploads/2024/09/client-2.png',
          'https://demo.themeim.com/wp/rulify/wp-content/uploads/2024/09/client-3.png',
          'https://demo.themeim.com/wp/rulify/wp-content/uploads/2024/09/client-4.png',
          'https://demo.themeim.com/wp/rulify/wp-content/uploads/2024/09/client-5.png',
          'https://demo.themeim.com/wp/rulify/wp-content/uploads/2024/09/client-6.png'
        ].map(logo => ({
          id: genId(),
          elType: 'container',
          isInner: true,
          settings: { container_type: 'flex', content_width: 'full', width: { unit: '%', size: 15 }, flex_direction: 'column', flex_align_items: 'center' },
          elements: [
            {
              id: genId(),
              elType: 'widget',
              widgetType: 'image',
              settings: { image: { url: logo }, image_size: 'full', align: 'center' },
              elements: []
            }
          ]
        }))
      }
    ]
  });

  // ==========================================
  // SECTION 13: Full-width Dark CTA Strip (#0B132A)
  // ==========================================
  sections.push({
    id: genId(),
    elType: 'container',
    isInner: false,
    settings: {
      container_type: 'flex',
      content_width: 'boxed',
      flex_direction: 'column',
      padding: { unit: 'px', top: '50', right: '30', bottom: '50', left: '30', isLinked: false },
      background_background: 'classic',
      background_color: '#0B132A',
      border_radius: { unit: 'px', top: '16', right: '16', bottom: '16', left: '16', isLinked: true },
      margin: { unit: 'px', top: '40', right: '20', bottom: '40', left: '20', isLinked: false }
    },
    elements: [
      {
        id: genId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'row',
          flex_wrap: 'wrap',
          flex_justify_content: 'space-between',
          flex_align_items: 'center'
        },
        elements: [
          {
            id: genId(),
            elType: 'widget',
            widgetType: 'heading',
            settings: {
              title: 'Lets Get Stared with Us. Call Us Now!',
              header_size: 'h3',
              title_color: '#FFFFFF',
              typography_typography: 'custom',
              typography_font_size: { unit: 'px', size: 28 },
              typography_font_weight: '700'
            },
            elements: []
          },
          {
            id: genId(),
            elType: 'widget',
            widgetType: 'button',
            settings: {
              text: '📞 +1 (800) 123-4567',
              link: { url: 'tel:+18001234567' },
              background_color: '#DD131A',
              button_text_color: '#FFFFFF',
              border_radius: { unit: 'px', top: '6', right: '6', bottom: '6', left: '6', isLinked: true },
              padding: { unit: 'px', top: '14', right: '28', bottom: '14', left: '28', isLinked: false }
            },
            elements: []
          }
        ]
      }
    ]
  });

  // ==========================================
  // SECTION 14: Dark Footer (#070D1D)
  // ==========================================
  sections.push({
    id: genId(),
    elType: 'container',
    isInner: false,
    settings: {
      container_type: 'flex',
      content_width: 'boxed',
      flex_direction: 'column',
      padding: { unit: 'px', top: '80', right: '20', bottom: '40', left: '20', isLinked: false },
      background_background: 'classic',
      background_color: '#070D1D'
    },
    elements: [
      {
        id: genId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'row',
          flex_wrap: 'wrap',
          gap: { unit: 'px', size: 24 }
        },
        elements: [
          // Col 1: About
          {
            id: genId(),
            elType: 'container',
            isInner: true,
            settings: { container_type: 'flex', content_width: 'full', width: { unit: '%', size: 28 }, flex_direction: 'column' },
            elements: [
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'image',
                settings: { image: { url: 'https://demo.themeim.com/wp/rulify/wp-content/themes/lawlify/assets/images/logo.svg' }, image_size: 'full', align: 'left', margin: { unit: 'px', top: '0', right: '0', bottom: '20', left: '0', isLinked: false } },
                elements: []
              },
              {
                id: genId(),
                elType: 'widget',
                widgetType: 'text-editor',
                settings: { editor: '<p>Dedicated intellectual property law and patent acquisition counsel providing proactive protection globally.</p>', text_color: '#94A3B8' },
                elements: []
              }
            ]
          },
          // Col 2: Quick Links
          {
            id: genId(),
            elType: 'container',
            isInner: true,
            settings: { container_type: 'flex', content_width: 'full', width: { unit: '%', size: 20 }, flex_direction: 'column' },
            elements: [
              { id: genId(), elType: 'widget', widgetType: 'heading', settings: { title: 'Quick Links', header_size: 'h4', title_color: '#FFFFFF', typography_typography: 'custom', typography_font_size: { unit: 'px', size: 18 }, margin: { unit: 'px', top: '0', right: '0', bottom: '15', left: '0', isLinked: false } }, elements: [] },
              { id: genId(), elType: 'widget', widgetType: 'text-editor', settings: { editor: '<ul style="list-style:none; padding-left:0; line-height:2.2; color:#94A3B8;"><li>About Us</li><li>Our Services</li><li>Case Studies</li><li>Legal Blog</li></ul>' }, elements: [] }
            ]
          },
          // Col 3: Expertise
          {
            id: genId(),
            elType: 'container',
            isInner: true,
            settings: { container_type: 'flex', content_width: 'full', width: { unit: '%', size: 22 }, flex_direction: 'column' },
            elements: [
              { id: genId(), elType: 'widget', widgetType: 'heading', settings: { title: 'Expertise', header_size: 'h4', title_color: '#FFFFFF', typography_typography: 'custom', typography_font_size: { unit: 'px', size: 18 }, margin: { unit: 'px', top: '0', right: '0', bottom: '15', left: '0', isLinked: false } }, elements: [] },
              { id: genId(), elType: 'widget', widgetType: 'text-editor', settings: { editor: '<ul style="list-style:none; padding-left:0; line-height:2.2; color:#94A3B8;"><li>Patent Prosecution</li><li>Trademark Search</li><li>IP Litigation</li><li>Copyright Counsel</li></ul>' }, elements: [] }
            ]
          },
          // Col 4: Newsletter
          {
            id: genId(),
            elType: 'container',
            isInner: true,
            settings: { container_type: 'flex', content_width: 'full', width: { unit: '%', size: 23 }, flex_direction: 'column' },
            elements: [
              { id: genId(), elType: 'widget', widgetType: 'heading', settings: { title: 'Newsletter', header_size: 'h4', title_color: '#FFFFFF', typography_typography: 'custom', typography_font_size: { unit: 'px', size: 18 }, margin: { unit: 'px', top: '0', right: '0', bottom: '15', left: '0', isLinked: false } }, elements: [] },
              { id: genId(), elType: 'widget', widgetType: 'text-editor', settings: { editor: '<p style="color:#94A3B8; margin-bottom:12px;">Subscribe to receive periodic updates on IP law changes.</p><input type="email" placeholder="Your Email Address" style="width:100%; padding:10px; background:#141F3D; border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:#fff;"/><button style="width:100%; margin-top:8px; padding:10px; background:#DD131A; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">Subscribe Now</button>' }, elements: [] }
            ]
          }
        ]
      },
      // Copyright bar
      {
        id: genId(),
        elType: 'container',
        isInner: true,
        settings: {
          container_type: 'flex',
          content_width: 'full',
          flex_direction: 'row',
          flex_justify_content: 'center',
          margin: { unit: 'px', top: '40', right: '0', bottom: '0', left: '0', isLinked: false },
          padding: { unit: 'px', top: '20', right: '0', bottom: '0', left: '0', isLinked: false },
          border_border: 'solid',
          border_width: { unit: 'px', top: '1', right: '0', bottom: '0', left: '0', isLinked: false },
          border_color: 'rgba(255, 255, 255, 0.08)'
        },
        elements: [
          {
            id: genId(),
            elType: 'widget',
            widgetType: 'heading',
            settings: {
              title: '© 2026 Rulify · Intellectual Property Law Firm. All Rights Reserved.',
              header_size: 'span',
              align: 'center',
              title_color: '#64748B',
              typography_typography: 'custom',
              typography_font_size: { unit: 'px', size: 13 }
            },
            elements: []
          }
        ]
      }
    ]
  });

  return {
    version: '0.4',
    title: 'Rulify Consulting DittoBeat',
    type: 'page',
    content: sections,
    page_settings: {
      page_layout: 'elementor_canvas'
    }
  };
}

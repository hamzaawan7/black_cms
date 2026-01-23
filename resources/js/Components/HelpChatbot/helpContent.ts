// CMS Help Content - Complete documentation for each CMS section
// This file contains all the help text that powers the HelpChatbot

export interface HelpTopic {
  id: string;
  title: string;
  icon: string;
  shortDescription: string;
  link?: string; // Navigation link to the CMS section
  content: HelpSection[];
  relatedTopics?: string[];
}

export interface HelpSection {
  type: 'heading' | 'paragraph' | 'list' | 'code' | 'tip' | 'warning' | 'steps' | 'table';
  content: string | string[] | { header: string[]; rows: string[][] };
}

export interface HelpCategory {
  id: string;
  name: string;
  icon: string;
  link?: string; // Navigation link for the category
  topics: HelpTopic[];
}

export const helpCategories: HelpCategory[] = [
  // ============================================
  // GETTING STARTED
  // ============================================
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: 'rocket',
    link: '/dashboard',
    topics: [
      {
        id: 'dashboard-overview',
        title: 'Dashboard Overview',
        icon: 'layout-dashboard',
        shortDescription: 'Learn about the CMS dashboard and main features',
        link: '/dashboard',
        content: [
          {
            type: 'heading',
            content: 'Welcome to Hyve CMS! 🎉'
          },
          {
            type: 'paragraph',
            content: 'The Dashboard is your central hub for managing all website content. From here, you can quickly access all CMS features and see an overview of your website statistics.'
          },
          {
            type: 'heading',
            content: 'Dashboard Features'
          },
          {
            type: 'list',
            content: [
              '📊 **Quick Stats** - See total pages, services, testimonials, and FAQs at a glance',
              '🚀 **Quick Actions** - One-click access to common tasks like editing pages or adding services',
              '📝 **Recent Activity** - View recent changes made to your content',
              '🔗 **Shortcuts** - Fast links to frequently used sections'
            ]
          },
          {
            type: 'tip',
            content: 'Use the sidebar menu on the left to navigate to any section of the CMS. The menu stays visible on all pages for easy access.'
          }
        ],
        relatedTopics: ['page-builder', 'services-management']
      },
      {
        id: 'how-cms-works',
        title: 'How the CMS Works',
        icon: 'info',
        shortDescription: 'Understand the connection between CMS and your website',
        link: '/dashboard',
        content: [
          {
            type: 'heading',
            content: 'Understanding the CMS → Website Connection'
          },
          {
            type: 'paragraph',
            content: 'When you make changes in the CMS, they automatically appear on your live website. Here\'s how it works:'
          },
          {
            type: 'steps',
            content: [
              'You edit content in the CMS (this admin panel)',
              'Changes are saved to the database',
              'Your website fetches the latest content via API',
              'Visitors see the updated content on your website'
            ]
          },
          {
            type: 'heading',
            content: 'Key Concepts'
          },
          {
            type: 'list',
            content: [
              '**Pages** - Each page of your website (Home, About, Contact, etc.)',
              '**Sections** - Building blocks of each page (Hero, Services Grid, FAQ, etc.)',
              '**Content** - Text, images, and data that appear in sections',
              '**Styles** - Colors, spacing, and visual appearance',
              '**Settings** - Site-wide configurations (logo, contact info, etc.)'
            ]
          },
          {
            type: 'tip',
            content: 'Changes are instant! As soon as you save something in the CMS, it will appear on your website within seconds.'
          }
        ],
        relatedTopics: ['page-builder', 'settings']
      }
    ]
  },

  // ============================================
  // PAGE BUILDER
  // ============================================
  {
    id: 'page-builder',
    name: 'Page Builder',
    icon: 'layout',
    link: '/admin/pages',
    topics: [
      {
        id: 'page-builder-overview',
        title: 'Page Builder Overview',
        icon: 'layout-template',
        shortDescription: 'Learn how to build and edit pages visually',
        link: '/admin/pages',
        content: [
          {
            type: 'heading',
            content: 'What is the Page Builder?'
          },
          {
            type: 'paragraph',
            content: 'The Page Builder is a powerful visual editor that lets you create and modify website pages using drag-and-drop sections. No coding required!'
          },
          {
            type: 'heading',
            content: 'Key Features'
          },
          {
            type: 'list',
            content: [
              '🎯 **Drag & Drop** - Reorder sections by dragging them to new positions',
              '👁️ **Show/Hide** - Toggle section visibility without deleting',
              '📋 **Duplicate** - Create copies of sections quickly',
              '🎨 **Style Editor** - Customize colors, spacing, and fonts',
              '➕ **Add Sections** - Choose from 12+ pre-built section types'
            ]
          },
          {
            type: 'heading',
            content: 'How to Access'
          },
          {
            type: 'steps',
            content: [
              'Click "Pages" in the sidebar menu',
              'Select the page you want to edit (e.g., Home, About)',
              'Click "Edit" to open the Page Builder',
              'You\'ll see all sections of that page'
            ]
          }
        ],
        relatedTopics: ['editing-sections', 'adding-sections', 'section-types']
      },
      {
        id: 'editing-sections',
        title: 'Editing Sections',
        icon: 'pencil',
        shortDescription: 'How to edit content, styles, and settings',
        link: '/admin/pages',
        content: [
          {
            type: 'heading',
            content: 'Editing Section Content'
          },
          {
            type: 'paragraph',
            content: 'Each section has three tabs: Content, Styles, and Settings. Here\'s what each contains:'
          },
          {
            type: 'heading',
            content: '📝 Content Tab'
          },
          {
            type: 'list',
            content: [
              'Titles and headings',
              'Descriptions and body text',
              'Button text and links',
              'Images (upload or select from Media Library)'
            ]
          },
          {
            type: 'heading',
            content: '🎨 Styles Tab'
          },
          {
            type: 'list',
            content: [
              'Background color',
              'Text colors (headings, body)',
              'Padding (spacing above/below)',
              'Container width',
              'Custom CSS class (advanced)'
            ]
          },
          {
            type: 'heading',
            content: '⚙️ Settings Tab'
          },
          {
            type: 'paragraph',
            content: 'Settings vary by section type. Examples:'
          },
          {
            type: 'list',
            content: [
              'Hero: Autoplay speed, show badge',
              'Testimonials: Show ratings, autoplay',
              'FAQ: Default open item, show CTA'
            ]
          },
          {
            type: 'tip',
            content: 'Click the "Save" button after making changes. Your edits will appear on the website immediately!'
          }
        ],
        relatedTopics: ['page-builder-overview', 'section-types']
      },
      {
        id: 'section-types',
        title: 'Available Section Types',
        icon: 'layers',
        shortDescription: 'All 12 section types you can add to pages',
        link: '/admin/pages',
        content: [
          {
            type: 'heading',
            content: 'Section Types'
          },
          {
            type: 'paragraph',
            content: 'The CMS includes 12 pre-built section types that you can add to any page:'
          },
          {
            type: 'table',
            content: {
              header: ['Type', 'Name', 'Best For'],
              rows: [
                ['hero', 'Hero Section', 'Page headers with featured products slider'],
                ['services_grid', 'Services Grid', 'Display service categories in a grid'],
                ['team', 'Team Section', 'Showcase your team with images'],
                ['testimonials', 'Testimonials', 'Customer reviews and ratings'],
                ['faq', 'FAQ Section', 'Frequently asked questions'],
                ['contact', 'Contact Section', 'Contact information and form'],
                ['cta', 'Call to Action', 'Conversion-focused sections'],
                ['text_block', 'Text Block', 'Rich text content'],
                ['gallery', 'Image Gallery', 'Display multiple images'],
                ['stats', 'Statistics', 'Numbers and achievements'],
                ['pricing', 'Pricing Table', 'Service/product pricing'],
                ['newsletter', 'Newsletter', 'Email signup forms']
              ]
            }
          },
          {
            type: 'heading',
            content: 'Adding a New Section'
          },
          {
            type: 'steps',
            content: [
              'Open the Page Builder for any page',
              'Click the "Add Section" button',
              'Choose the section type from the list',
              'The new section will be added at the bottom',
              'Drag it to reorder if needed'
            ]
          }
        ],
        relatedTopics: ['page-builder-overview', 'hero-section']
      },
      {
        id: 'hero-section',
        title: 'Hero Section',
        icon: 'star',
        shortDescription: 'Configure the main header section with product slider',
        link: '/admin/pages',
        content: [
          {
            type: 'heading',
            content: 'Hero Section Overview'
          },
          {
            type: 'paragraph',
            content: 'The Hero section is the first thing visitors see. It includes a headline, description, CTA button, and a featured products slider.'
          },
          {
            type: 'heading',
            content: '🌐 Frontend Preview (What Visitors See)'
          },
          {
            type: 'list',
            content: [
              '**Full-width banner** - A large, eye-catching banner at the top of your homepage',
              '**Bold headline** - Your title displayed in prominent, stylized text',
              '**Call-to-action button** - A clickable button (e.g., "Explore Services")',
              '**Product slider** - Featured products rotating automatically on the side',
              '**Premium design** - Gold and dark color scheme for a luxury feel'
            ]
          },
          {
            type: 'heading',
            content: 'Editable Fields'
          },
          {
            type: 'list',
            content: [
              '**Pre-title** - Small text above the main title (e.g., "YOUR PREMIERE VIRTUAL HEALTH PROVIDER")',
              '**Title** - Main headline (e.g., "You deserve the very best.")',
              '**Badge Text** - Badge shown in slider (e.g., "HYVE RX VIRTUAL HEALTH")',
              '**CTA Text** - Button text (e.g., "EXPLORE SERVICES")',
              '**CTA Link** - Where the button goes (e.g., "/services")'
            ]
          },
          {
            type: 'heading',
            content: 'Featured Products Slider'
          },
          {
            type: 'paragraph',
            content: 'The slider shows featured products/services. To manage:'
          },
          {
            type: 'steps',
            content: [
              'Open the Hero section settings',
              'Click "Manage Featured Products"',
              'Select products to display in the slider',
              'Drag to reorder the products',
              'Save changes'
            ]
          },
          {
            type: 'tip',
            content: 'Use high-quality product images for the best visual impact. Recommended size: 400x400px or larger.'
          }
        ],
        relatedTopics: ['section-types', 'media-library']
      },
      {
        id: 'services-grid-block',
        title: 'Services Grid Block',
        icon: 'layout-grid',
        shortDescription: 'Display service categories in a beautiful grid layout',
        link: '/admin/pages',
        content: [
          {
            type: 'heading',
            content: 'Services Grid Block Overview'
          },
          {
            type: 'paragraph',
            content: 'The Services Grid displays your service categories as clickable cards. Each card shows the category image, name, and links to the services page.'
          },
          {
            type: 'heading',
            content: '🌐 Frontend Preview (What Visitors See)'
          },
          {
            type: 'list',
            content: [
              '**Service cards** - Each category displayed as a beautiful card with image',
              '**Hover effects** - Cards subtly zoom when mouse hovers over them',
              '**Clickable navigation** - Each card links to the services page',
              '**Grid layout** - Cards arranged in 2, 3, or 4 columns (customizable)',
              '**Category labels** - Category name displayed below each card image'
            ]
          },
          {
            type: 'heading',
            content: '📝 Content Fields'
          },
          {
            type: 'list',
            content: [
              '**Pre-title** - Small label above title (e.g., "OUR SERVICES")',
              '**Title** - Main heading (e.g., "What We Offer")',
              '**Description** - Brief intro text',
              '**CTA Text** - Button text (e.g., "View All Services")',
              '**CTA Link** - Button destination (e.g., "/services")'
            ]
          },
          {
            type: 'heading',
            content: '🎨 Style Options'
          },
          {
            type: 'list',
            content: [
              '**Background Color** - Section background',
              '**Columns** - 2, 3, or 4 columns',
              '**Card Style** - Minimal or elevated',
              '**Show Description** - Toggle category descriptions'
            ]
          },
          {
            type: 'heading',
            content: '📂 Data Source'
          },
          {
            type: 'paragraph',
            content: 'Categories are pulled automatically from the Service Categories section. To update:'
          },
          {
            type: 'steps',
            content: [
              'Go to Categories in sidebar',
              'Add/Edit category with name, image, description',
              'Categories appear automatically in this grid'
            ]
          },
          {
            type: 'tip',
            content: 'Use square images (400x400px) for best results. All category images should be consistent in style.'
          }
        ],
        relatedTopics: ['service-categories', 'section-types']
      },
      {
        id: 'team-block',
        title: 'Team Section Block',
        icon: 'users',
        shortDescription: 'Showcase your team with photos and descriptions',
        link: '/admin/pages',
        content: [
          {
            type: 'heading',
            content: 'Team Section Overview'
          },
          {
            type: 'paragraph',
            content: 'The Team section introduces your team to visitors with images and supporting text. It creates trust and connection with potential clients.'
          },
          {
            type: 'heading',
            content: '🌐 Frontend Preview (What Visitors See)'
          },
          {
            type: 'list',
            content: [
              '**Split layout** - Text content on one side, images on the other',
              '**Overlapping images** - Two photos with elegant overlap effect',
              '**Team introduction** - Your team description with professional styling',
              '**Learn More button** - Links to your About page for more details',
              '**Trust building** - Helps visitors connect with your professional team'
            ]
          },
          {
            type: 'heading',
            content: '📝 Content Fields'
          },
          {
            type: 'list',
            content: [
              '**Pre-title** - Label above title (e.g., "MEET THE TEAM")',
              '**Title** - Main heading (e.g., "Expert Care Providers")',
              '**Description** - Team introduction text',
              '**Primary Image** - Main team/facility photo',
              '**Secondary Image** - Supporting image',
              '**CTA Text** - Button text (e.g., "Learn More")',
              '**CTA Link** - Button destination (e.g., "/about")'
            ]
          },
          {
            type: 'heading',
            content: '🎨 Style Options'
          },
          {
            type: 'list',
            content: [
              '**Background Color** - Section background',
              '**Image Position** - Left or Right',
              '**Show CTA** - Toggle button visibility'
            ]
          },
          {
            type: 'tip',
            content: 'Use professional, high-quality team photos. Images should be at least 600x400px for best display.'
          }
        ],
        relatedTopics: ['team-management', 'section-types']
      },
      {
        id: 'testimonials-block',
        title: 'Testimonials Block',
        icon: 'message-square',
        shortDescription: 'Display customer reviews in a slider format',
        link: '/admin/pages',
        content: [
          {
            type: 'heading',
            content: 'Testimonials Block Overview'
          },
          {
            type: 'paragraph',
            content: 'Show customer reviews and ratings in an auto-rotating slider. Social proof that builds trust with new visitors.'
          },
          {
            type: 'heading',
            content: '🌐 Frontend Preview (What Visitors See)'
          },
          {
            type: 'list',
            content: [
              '**Review carousel** - Customer testimonials rotate automatically',
              '**Star ratings** - Golden 5-star rating display (⭐⭐⭐⭐⭐)',
              '**Customer photos** - Circular profile images (optional)',
              '**Quote styling** - Elegant quotation marks around reviews',
              '**Navigation dots** - Clickable dots to manually change slides',
              '**Auto-rotation** - Slides change every few seconds'
            ]
          },
          {
            type: 'heading',
            content: '📝 Content Fields'
          },
          {
            type: 'list',
            content: [
              '**Pre-title** - Label (e.g., "TESTIMONIALS")',
              '**Title** - Heading (e.g., "What Our Clients Say")',
              '**Description** - Optional intro text'
            ]
          },
          {
            type: 'heading',
            content: '⚙️ Settings'
          },
          {
            type: 'list',
            content: [
              '**Autoplay** - Enable/disable auto-rotation',
              '**Autoplay Speed** - Time between slides (ms)',
              '**Show Rating** - Display star ratings',
              '**Show Image** - Display customer photos'
            ]
          },
          {
            type: 'heading',
            content: '📂 Data Source'
          },
          {
            type: 'paragraph',
            content: 'Testimonials are pulled from the Testimonials section:'
          },
          {
            type: 'steps',
            content: [
              'Go to Testimonials in sidebar',
              'Add testimonials with name, text, rating, photo',
              'Mark as "Featured" to show on homepage',
              'Featured testimonials appear in this slider'
            ]
          },
          {
            type: 'tip',
            content: 'Keep testimonials concise (2-3 sentences). Include customer photos for authenticity.'
          }
        ],
        relatedTopics: ['testimonials-management', 'section-types']
      },
      {
        id: 'faq-block',
        title: 'FAQ Block',
        icon: 'help-circle',
        shortDescription: 'Accordion-style frequently asked questions',
        link: '/admin/pages',
        content: [
          {
            type: 'heading',
            content: 'FAQ Block Overview'
          },
          {
            type: 'paragraph',
            content: 'Display FAQs in an expandable accordion format. Helps answer common questions and reduces support inquiries.'
          },
          {
            type: 'heading',
            content: '🌐 Frontend Preview (What Visitors See)'
          },
          {
            type: 'list',
            content: [
              '**Accordion layout** - Questions listed with expandable answers',
              '**Plus/Minus icons** - Toggle icons indicating expand/collapse state',
              '**Smooth animations** - Answers expand with elegant animation',
              '**Support card** - "Still have questions? Contact us" card on the side',
              '**Clean design** - Easy to read with professional styling'
            ]
          },
          {
            type: 'heading',
            content: '📝 Content Fields'
          },
          {
            type: 'list',
            content: [
              '**Pre-title** - Label (e.g., "FAQ")',
              '**Title** - Heading (e.g., "Frequently Asked Questions")',
              '**Description** - Optional intro',
              '**CTA Title** - Support card title',
              '**CTA Description** - Support card text',
              '**CTA Text** - Support button text',
              '**CTA Link** - Support button destination'
            ]
          },
          {
            type: 'heading',
            content: '⚙️ Settings'
          },
          {
            type: 'list',
            content: [
              '**Default Open** - Which FAQ opens by default (0 = first)',
              '**Show CTA Card** - Display support card alongside FAQs'
            ]
          },
          {
            type: 'heading',
            content: '📂 Data Source'
          },
          {
            type: 'steps',
            content: [
              'Go to FAQs in sidebar',
              'Add questions and answers',
              'Drag to reorder FAQs',
              'Published FAQs appear in this section'
            ]
          },
          {
            type: 'tip',
            content: 'Put your most asked questions first. Keep answers clear and concise.'
          }
        ],
        relatedTopics: ['faq-management', 'section-types']
      },
      {
        id: 'contact-block',
        title: 'Contact Block',
        icon: 'phone',
        shortDescription: 'Display contact information and form',
        link: '/admin/pages',
        content: [
          {
            type: 'heading',
            content: 'Contact Block Overview'
          },
          {
            type: 'paragraph',
            content: 'Show contact information with phone, email, hours, and optionally a contact form or image.'
          },
          {
            type: 'heading',
            content: '🌐 Frontend Preview (What Visitors See)'
          },
          {
            type: 'list',
            content: [
              '**Contact cards** - Phone, Email, and Hours displayed in separate cards',
              '**Intuitive icons** - Relevant icons for each contact method (📞 ✉️ ⏰)',
              '**Clickable links** - Tap to call or email directly on mobile devices',
              '**Side image** - Optional decorative image alongside contact info',
              '**Professional layout** - Clean, easy-to-find contact information'
            ]
          },
          {
            type: 'heading',
            content: '📝 Content Fields'
          },
          {
            type: 'list',
            content: [
              '**Pre-title** - Label (e.g., "CONTACT US")',
              '**Title** - Heading (e.g., "Get In Touch")',
              '**Description** - Intro text',
              '**Phone** - Contact phone number',
              '**Phone Hours** - When phone is available',
              '**Email** - Contact email address',
              '**Email Response** - Expected response time',
              '**Hours** - Business hours',
              '**Hours Description** - Additional hours info',
              '**Image** - Side image/photo',
              '**Image Title** - Text overlay on image',
              '**Image Subtitle** - Subtitle on image'
            ]
          },
          {
            type: 'heading',
            content: '⚙️ Settings'
          },
          {
            type: 'list',
            content: [
              '**Show Form** - Display contact form',
              '**Show Map** - Display location map (if enabled)'
            ]
          },
          {
            type: 'tip',
            content: 'Keep contact info up-to-date. Include multiple ways to reach you (phone, email, hours).'
          }
        ],
        relatedTopics: ['section-types', 'site-settings']
      },
      {
        id: 'cta-block',
        title: 'Call to Action Block',
        icon: 'zap',
        shortDescription: 'Conversion-focused section with button',
        link: '/admin/pages',
        content: [
          {
            type: 'heading',
            content: 'CTA Block Overview'
          },
          {
            type: 'paragraph',
            content: 'A focused section designed to drive conversions. Use it to encourage visitors to take action like signing up, booking, or contacting you.'
          },
          {
            type: 'heading',
            content: '🌐 Frontend Preview (What Visitors See)'
          },
          {
            type: 'list',
            content: [
              '**Bold banner** - Eye-catching section with prominent messaging',
              '**Large headline** - Attention-grabbing text in large font',
              '**Action button** - Prominent gold button ("Book Now", "Get Started")',
              '**Contrasting colors** - Background stands out from other sections',
              '**Clear direction** - Visitors understand exactly what action to take'
            ]
          },
          {
            type: 'heading',
            content: '📝 Content Fields'
          },
          {
            type: 'list',
            content: [
              '**Title** - Main headline (e.g., "Ready to Transform Your Health?")',
              '**Description** - Supporting text',
              '**Button Text** - CTA button text (e.g., "Get Started Today")',
              '**Button Link** - Where button goes (e.g., "/contact")',
              '**Secondary Button Text** - Optional second button',
              '**Secondary Button Link** - Second button destination'
            ]
          },
          {
            type: 'heading',
            content: '🎨 Style Options'
          },
          {
            type: 'list',
            content: [
              '**Background Color** - Section background (use bold colors)',
              '**Text Color** - Heading/body text color',
              '**Button Style** - Primary or secondary style',
              '**Alignment** - Left, center, or right'
            ]
          },
          {
            type: 'tip',
            content: 'Use action words in your CTA (e.g., "Start", "Join", "Book", "Get"). Keep it short and compelling.'
          }
        ],
        relatedTopics: ['section-types', 'page-builder-overview']
      },
      {
        id: 'text-block',
        title: 'Text Block',
        icon: 'file-text',
        shortDescription: 'Rich text content section',
        link: '/admin/pages',
        content: [
          {
            type: 'heading',
            content: 'Text Block Overview'
          },
          {
            type: 'paragraph',
            content: 'A flexible section for adding rich text content. Great for paragraphs, lists, and formatted content.'
          },
          {
            type: 'heading',
            content: '🌐 Frontend Preview (What Visitors See)'
          },
          {
            type: 'list',
            content: [
              '**Formatted content** - Paragraphs, headings, and lists properly styled',
              '**Readable typography** - Proper spacing and line height for easy reading',
              '**Clickable links** - Hyperlinks displayed in accent color',
              '**Clean layout** - Simple, professional text presentation',
              '**Mobile responsive** - Content adapts beautifully to all screen sizes'
            ]
          },
          {
            type: 'heading',
            content: '📝 Content Fields'
          },
          {
            type: 'list',
            content: [
              '**Title** - Optional heading',
              '**Content** - Rich text editor with formatting:',
              '  - Bold, italic, underline',
              '  - Headings (H2, H3, H4)',
              '  - Bullet and numbered lists',
              '  - Links',
              '  - Images (inline)'
            ]
          },
          {
            type: 'heading',
            content: '🎨 Style Options'
          },
          {
            type: 'list',
            content: [
              '**Background Color** - Section background',
              '**Text Alignment** - Left, center, or justified',
              '**Container Width** - Narrow, default, or wide',
              '**Padding** - Spacing above/below'
            ]
          },
          {
            type: 'tip',
            content: 'Use text blocks for policies, about content, or any long-form text that needs formatting.'
          }
        ],
        relatedTopics: ['section-types', 'page-builder-overview']
      },
      {
        id: 'stats-block',
        title: 'Statistics Block',
        icon: 'bar-chart',
        shortDescription: 'Display numbers and achievements',
        link: '/admin/pages',
        content: [
          {
            type: 'heading',
            content: 'Stats Block Overview'
          },
          {
            type: 'paragraph',
            content: 'Showcase impressive numbers and achievements. Great for building credibility (e.g., customers served, years in business).'
          },
          {
            type: 'heading',
            content: '🌐 Frontend Preview (What Visitors See)'
          },
          {
            type: 'list',
            content: [
              '**Large numbers** - Impressive figures displayed in bold typography',
              '**Counter animation** - Numbers count up from zero when scrolled into view',
              '**Visual icons** - Each statistic accompanied by a relevant icon',
              '**Grid arrangement** - Stats displayed side-by-side in columns',
              '**Credibility boost** - Builds trust with visitors through social proof'
            ]
          },
          {
            type: 'heading',
            content: '📝 Content Fields'
          },
          {
            type: 'list',
            content: [
              '**Title** - Optional heading',
              '**Stats Array** - Each stat has:',
              '  - **Icon** - Visual icon',
              '  - **Value** - The number (e.g., "10,000+")',
              '  - **Label** - Description (e.g., "Happy Customers")',
              '  - **Prefix/Suffix** - Add $ or + signs'
            ]
          },
          {
            type: 'heading',
            content: '🎨 Style Options'
          },
          {
            type: 'list',
            content: [
              '**Columns** - 2, 3, or 4 stats per row',
              '**Background Color** - Section background',
              '**Animate** - Counter animation on scroll'
            ]
          },
          {
            type: 'tip',
            content: 'Use real, impressive numbers. Round numbers look cleaner (e.g., "10,000+" instead of "9,847").'
          }
        ],
        relatedTopics: ['section-types', 'page-builder-overview']
      },
      {
        id: 'gallery-block',
        title: 'Image Gallery Block',
        icon: 'images',
        shortDescription: 'Display multiple images in a grid',
        link: '/admin/pages',
        content: [
          {
            type: 'heading',
            content: 'Gallery Block Overview'
          },
          {
            type: 'paragraph',
            content: 'Show multiple images in a beautiful grid layout. Perfect for portfolios, before/after photos, or facility images.'
          },
          {
            type: 'heading',
            content: '🌐 Frontend Preview (What Visitors See)'
          },
          {
            type: 'list',
            content: [
              '**Image grid** - Multiple photos arranged in a structured grid',
              '**Hover effects** - Images subtly zoom on mouse hover',
              '**Lightbox popup** - Click any image to view full-size in overlay',
              '**Consistent sizing** - All images cropped to uniform dimensions',
              '**Masonry option** - Pinterest-style variable height layout available'
            ]
          },
          {
            type: 'heading',
            content: '📝 Content Fields'
          },
          {
            type: 'list',
            content: [
              '**Title** - Optional heading',
              '**Description** - Optional intro text',
              '**Images** - Select from Media Library:',
              '  - Each image has alt text',
              '  - Optional caption',
              '  - Drag to reorder'
            ]
          },
          {
            type: 'heading',
            content: '⚙️ Settings'
          },
          {
            type: 'list',
            content: [
              '**Columns** - 2, 3, or 4 columns',
              '**Lightbox** - Enable click-to-zoom',
              '**Aspect Ratio** - Square, landscape, or original',
              '**Gap** - Space between images'
            ]
          },
          {
            type: 'tip',
            content: 'Use consistent image sizes for a clean grid. Enable lightbox for detailed viewing.'
          }
        ],
        relatedTopics: ['media-library', 'section-types']
      },
      {
        id: 'reordering-sections',
        title: 'Reordering Sections',
        icon: 'grip-vertical',
        shortDescription: 'How to change the order of sections on a page',
        link: '/admin/pages',
        content: [
          {
            type: 'heading',
            content: 'Drag & Drop Reordering'
          },
          {
            type: 'paragraph',
            content: 'You can change the order of sections on any page using drag and drop:'
          },
          {
            type: 'steps',
            content: [
              'Open the Page Builder for the page',
              'Hover over the section you want to move',
              'Click and hold the drag handle (⋮⋮) on the left side',
              'Drag the section to its new position',
              'Release to drop it in place',
              'Changes are saved automatically!'
            ]
          },
          {
            type: 'heading',
            content: 'Quick Move Buttons'
          },
          {
            type: 'paragraph',
            content: 'Each section also has "Move Up" and "Move Down" buttons for quick adjustments without dragging.'
          },
          {
            type: 'tip',
            content: 'The section order in the Page Builder matches exactly how they appear on your website.'
          }
        ],
        relatedTopics: ['page-builder-overview', 'editing-sections']
      }
    ]
  },

  // ============================================
  // SERVICES MANAGEMENT
  // ============================================
  {
    id: 'services',
    name: 'Services',
    icon: 'briefcase',
    link: '/admin/services',
    topics: [
      {
        id: 'services-overview',
        title: 'Managing Services',
        icon: 'list',
        shortDescription: 'Create and manage your service offerings',
        link: '/admin/services',
        content: [
          {
            type: 'heading',
            content: 'Services Overview'
          },
          {
            type: 'paragraph',
            content: 'Services are the core offerings of your business. They are organized into categories and displayed on the Services page and throughout your website.'
          },
          {
            type: 'heading',
            content: 'Service Structure'
          },
          {
            type: 'list',
            content: [
              '**Categories** - Groups of related services (e.g., Weight Loss, Sexual Health)',
              '**Services** - Individual offerings within categories (e.g., Semaglutide, Tirzepatide)',
              '**Service Details** - Full descriptions, images, pricing'
            ]
          },
          {
            type: 'heading',
            content: 'Where Services Appear'
          },
          {
            type: 'list',
            content: [
              'Services Grid on Home page (shows categories)',
              'Services page (shows all categories and services)',
              'Service detail pages (individual service info)',
              'Header mega-menu dropdown',
              'Footer services links'
            ]
          }
        ],
        relatedTopics: ['service-categories', 'adding-services']
      },
      {
        id: 'service-categories',
        title: 'Service Categories',
        icon: 'folder',
        shortDescription: 'Organize services into categories',
        link: '/admin/service-categories',
        content: [
          {
            type: 'heading',
            content: 'Managing Categories'
          },
          {
            type: 'paragraph',
            content: 'Categories help organize your services into logical groups. Each category has:'
          },
          {
            type: 'list',
            content: [
              '**Name** - Category title (e.g., "Weight Loss")',
              '**Slug** - URL-friendly name (e.g., "weight-loss")',
              '**Description** - Short description for display',
              '**Image** - Category image shown in Services Grid',
              '**Order** - Display order (drag to reorder)'
            ]
          },
          {
            type: 'heading',
            content: 'Creating a Category'
          },
          {
            type: 'steps',
            content: [
              'Go to Services → Categories in the sidebar',
              'Click "Add Category" button',
              'Fill in the name, slug, and description',
              'Upload a category image',
              'Click "Save"'
            ]
          },
          {
            type: 'tip',
            content: 'Use clear, descriptive category names. The image should represent the category well - it appears on the home page Services Grid.'
          }
        ],
        relatedTopics: ['services-overview', 'adding-services']
      },
      {
        id: 'adding-services',
        title: 'Adding Services',
        icon: 'plus-circle',
        shortDescription: 'How to create new services',
        link: '/admin/services/create',
        content: [
          {
            type: 'heading',
            content: 'Creating a New Service'
          },
          {
            type: 'steps',
            content: [
              'Go to Services in the sidebar',
              'Click "Add Service" button',
              'Fill in the required fields:',
              '  - Name (service title)',
              '  - Slug (URL-friendly name)',
              '  - Category (select from dropdown)',
              '  - Description (short summary)',
              '  - Content (full description)',
              '  - Image (service image)',
              'Click "Save"'
            ]
          },
          {
            type: 'heading',
            content: 'Service Fields Explained'
          },
          {
            type: 'list',
            content: [
              '**Name** - Appears in navigation, lists, and as page title',
              '**Slug** - Creates the URL (e.g., /services/semaglutide)',
              '**Category** - Which category this service belongs to',
              '**Description** - Short text for lists and previews',
              '**Content** - Full service details (supports formatting)',
              '**Image** - Main service image',
              '**Is Popular** - Toggle to feature on home page',
              '**Is Published** - Toggle to show/hide on website'
            ]
          },
          {
            type: 'warning',
            content: 'Remember to set "Is Published" to ON for the service to appear on your website!'
          }
        ],
        relatedTopics: ['services-overview', 'service-categories']
      }
    ]
  },

  // ============================================
  // TESTIMONIALS
  // ============================================
  {
    id: 'testimonials',
    name: 'Testimonials',
    icon: 'message-square',
    link: '/admin/testimonials',
    topics: [
      {
        id: 'testimonials-management',
        title: 'Managing Testimonials',
        icon: 'star',
        shortDescription: 'Add and manage customer reviews',
        link: '/admin/testimonials',
        content: [
          {
            type: 'heading',
            content: 'Testimonials Overview'
          },
          {
            type: 'paragraph',
            content: 'Testimonials are customer reviews that appear in the Testimonials section of your website. They help build trust with potential customers.'
          },
          {
            type: 'heading',
            content: 'Adding a Testimonial'
          },
          {
            type: 'steps',
            content: [
              'Go to Testimonials in the sidebar',
              'Click "Add Testimonial"',
              'Fill in the fields:',
              '  - Author Name (customer name)',
              '  - Author Title (location or title)',
              '  - Content (the review text)',
              '  - Rating (1-5 stars)',
              '  - Author Image (optional photo)',
              'Toggle "Is Featured" to show on homepage',
              'Toggle "Is Published" to make visible',
              'Click "Save"'
            ]
          },
          {
            type: 'heading',
            content: 'Best Practices'
          },
          {
            type: 'list',
            content: [
              '✅ Use real customer names and photos when possible',
              '✅ Keep testimonials concise and impactful',
              '✅ Feature your best 3-5 testimonials',
              '✅ Include testimonials from different service types',
              '❌ Don\'t use fake reviews - it hurts credibility'
            ]
          },
          {
            type: 'tip',
            content: 'Testimonials marked as "Featured" will appear in the homepage slider. Others are available for the testimonials page.'
          }
        ],
        relatedTopics: ['page-builder-overview']
      }
    ]
  },

  // ============================================
  // FAQs
  // ============================================
  {
    id: 'faqs',
    name: 'FAQs',
    icon: 'help-circle',
    link: '/admin/faqs',
    topics: [
      {
        id: 'faq-management',
        title: 'Managing FAQs',
        icon: 'message-circle',
        shortDescription: 'Create and organize frequently asked questions',
        link: '/admin/faqs',
        content: [
          {
            type: 'heading',
            content: 'FAQ Overview'
          },
          {
            type: 'paragraph',
            content: 'FAQs (Frequently Asked Questions) help answer common customer questions. They appear in the FAQ section on your homepage and can help reduce support inquiries.'
          },
          {
            type: 'heading',
            content: 'Adding a FAQ'
          },
          {
            type: 'steps',
            content: [
              'Go to FAQs in the sidebar',
              'Click "Add FAQ"',
              'Enter the Question',
              'Enter the Answer (supports HTML for formatting)',
              'Select a Category (optional)',
              'Set the Order (drag to reorder later)',
              'Toggle "Is Published" to show on website',
              'Click "Save"'
            ]
          },
          {
            type: 'heading',
            content: 'Organizing FAQs'
          },
          {
            type: 'list',
            content: [
              '**Drag & Drop** - Reorder FAQs by dragging them',
              '**Categories** - Group related FAQs together',
              '**Publish/Unpublish** - Show or hide individual FAQs'
            ]
          },
          {
            type: 'tip',
            content: 'Put your most common questions first. The first FAQ is automatically expanded when visitors view the section.'
          }
        ],
        relatedTopics: ['page-builder-overview']
      }
    ]
  },

  // ============================================
  // TEAM
  // ============================================
  {
    id: 'team',
    name: 'Team',
    icon: 'users',
    link: '/admin/team',
    topics: [
      {
        id: 'team-management',
        title: 'Managing Team Members',
        icon: 'user-plus',
        shortDescription: 'Add and manage team member profiles',
        link: '/admin/team',
        content: [
          {
            type: 'heading',
            content: 'Team Section Overview'
          },
          {
            type: 'paragraph',
            content: 'The Team section showcases your team members with their photos, names, roles, and bios. This helps humanize your brand and build trust.'
          },
          {
            type: 'heading',
            content: 'Adding Team Members'
          },
          {
            type: 'steps',
            content: [
              'Go to Team in the sidebar',
              'Click "Add Team Member"',
              'Fill in the profile:',
              '  - Name (full name)',
              '  - Role/Title (e.g., "Medical Director")',
              '  - Bio (short description)',
              '  - Photo (professional headshot)',
              '  - Credentials (certifications, degrees)',
              'Click "Save"'
            ]
          },
          {
            type: 'heading',
            content: 'Best Practices'
          },
          {
            type: 'list',
            content: [
              '📸 Use professional, consistent photos',
              '✍️ Keep bios concise (2-3 sentences)',
              '🎓 Include relevant credentials',
              '📱 Photos should be square (400x400px works best)'
            ]
          }
        ],
        relatedTopics: ['media-library']
      }
    ]
  },

  // ============================================
  // MENUS
  // ============================================
  {
    id: 'menus',
    name: 'Menus',
    icon: 'menu',
    link: '/admin/menus',
    topics: [
      {
        id: 'menus-overview',
        title: 'Managing Menus',
        icon: 'navigation',
        shortDescription: 'Configure header, footer, and navigation menus',
        link: '/admin/menus',
        content: [
          {
            type: 'heading',
            content: 'Menu Locations'
          },
          {
            type: 'paragraph',
            content: 'Your website has several menu locations, each serving a different purpose:'
          },
          {
            type: 'table',
            content: {
              header: ['Location', 'Purpose', 'Where It Appears'],
              rows: [
                ['Header', 'Main navigation', 'Top of every page'],
                ['Footer Services', 'Quick service links', 'Footer column 1'],
                ['Footer About', 'About/Company links', 'Footer column 2'],
                ['Footer VIP', 'VIP/Membership links', 'Footer column 3'],
                ['Footer Legal', 'Policy links', 'Footer bottom'],
                ['Social', 'Social media links', 'Footer social icons']
              ]
            }
          },
          {
            type: 'heading',
            content: 'Editing Menu Items'
          },
          {
            type: 'steps',
            content: [
              'Go to Menus in the sidebar',
              'Select the menu location to edit',
              'Add, edit, or remove menu items',
              'Drag items to reorder',
              'Save changes'
            ]
          },
          {
            type: 'heading',
            content: 'Menu Item Fields'
          },
          {
            type: 'list',
            content: [
              '**Title** - Text shown in the menu',
              '**URL** - Where the link goes',
              '**Open in new tab** - Opens link in new browser tab',
              '**Children** - Submenu items (for dropdowns)'
            ]
          }
        ],
        relatedTopics: ['settings']
      }
    ]
  },

  // ============================================
  // MEDIA LIBRARY
  // ============================================
  {
    id: 'media',
    name: 'Media Library',
    icon: 'image',
    link: '/admin/media',
    topics: [
      {
        id: 'media-library',
        title: 'Using the Media Library',
        icon: 'upload',
        shortDescription: 'Upload and manage images and files',
        link: '/admin/media',
        content: [
          {
            type: 'heading',
            content: 'Media Library Overview'
          },
          {
            type: 'paragraph',
            content: 'The Media Library stores all your images, documents, and files. You can organize them into folders and use them throughout the CMS.'
          },
          {
            type: 'heading',
            content: 'Uploading Files'
          },
          {
            type: 'steps',
            content: [
              'Go to Media in the sidebar',
              'Click "Upload" button',
              'Select files from your computer (or drag & drop)',
              'Choose a folder (optional)',
              'Files are uploaded automatically'
            ]
          },
          {
            type: 'heading',
            content: 'Organizing Media'
          },
          {
            type: 'list',
            content: [
              '📁 **Folders** - Create folders to organize media',
              '🏷️ **Alt Text** - Add descriptions for accessibility',
              '🔍 **Search** - Find files by name',
              '📋 **Filter** - Filter by type (images, documents, etc.)'
            ]
          },
          {
            type: 'heading',
            content: 'Using Media in Content'
          },
          {
            type: 'paragraph',
            content: 'When editing sections or services, click "Select Image" to open the media picker. You can choose an existing file or upload a new one.'
          },
          {
            type: 'tip',
            content: 'For best performance, optimize images before uploading. Recommended max width: 1920px. Use JPEG for photos, PNG for graphics with transparency.'
          }
        ],
        relatedTopics: ['hero-section', 'adding-services']
      }
    ]
  },

  // ============================================
  // SETTINGS
  // ============================================
  {
    id: 'settings',
    name: 'Settings',
    icon: 'settings',
    link: '/admin/settings',
    topics: [
      {
        id: 'site-settings',
        title: 'Site Settings',
        icon: 'sliders',
        shortDescription: 'Configure logo, contact info, and branding',
        link: '/admin/settings',
        content: [
          {
            type: 'heading',
            content: 'Settings Overview'
          },
          {
            type: 'paragraph',
            content: 'Site Settings control global website configurations that appear throughout your site.'
          },
          {
            type: 'heading',
            content: 'Settings Categories'
          },
          {
            type: 'list',
            content: [
              '🏢 **General** - Site name, description, logo, favicon',
              '📞 **Contact** - Phone, email, address',
              '🔗 **Integrations** - Patient login URL, booking URL',
              '📱 **Social** - Social media profile links',
              '🎨 **Branding** - Colors, fonts (if supported)'
            ]
          },
          {
            type: 'heading',
            content: 'Changing the Logo'
          },
          {
            type: 'steps',
            content: [
              'Go to Settings in the sidebar',
              'Click the "Branding" tab',
              'Click "Upload" next to Logo',
              'Select your logo file (PNG or SVG recommended)',
              'Save changes'
            ]
          },
          {
            type: 'warning',
            content: 'Logo changes affect the entire website. Make sure your new logo looks good on both light and dark backgrounds.'
          }
        ],
        relatedTopics: ['menus-overview']
      }
    ]
  },

  // ============================================
  // FRONTEND DISPLAY
  // ============================================
  {
    id: 'frontend',
    name: 'Frontend Display',
    icon: 'monitor',
    link: '/admin/pages',
    topics: [
      {
        id: 'how-changes-appear',
        title: 'How Changes Appear',
        icon: 'refresh-cw',
        shortDescription: 'Understanding how CMS changes show on your website',
        link: '/admin/pages',
        content: [
          {
            type: 'heading',
            content: 'Real-Time Updates'
          },
          {
            type: 'paragraph',
            content: 'When you make changes in the CMS, they appear on your website almost instantly. Here\'s the flow:'
          },
          {
            type: 'steps',
            content: [
              '✏️ You edit content in the CMS',
              '💾 You click "Save"',
              '📡 Data is sent to the server',
              '🌐 Website fetches the new data',
              '✨ Visitors see the updated content'
            ]
          },
          {
            type: 'heading',
            content: 'What Updates Instantly'
          },
          {
            type: 'list',
            content: [
              '✅ Text content (titles, descriptions)',
              '✅ Images and media',
              '✅ Section visibility (show/hide)',
              '✅ Section order',
              '✅ Menu items',
              '✅ Settings (logo, contact info)'
            ]
          },
          {
            type: 'heading',
            content: 'Cache Considerations'
          },
          {
            type: 'paragraph',
            content: 'The website uses caching for performance. In rare cases, you may need to wait a few minutes or clear your browser cache to see changes.'
          },
          {
            type: 'tip',
            content: 'Use incognito/private browsing mode to see changes immediately without cache interference.'
          }
        ],
        relatedTopics: ['how-cms-works']
      },
      {
        id: 'home-page-sections',
        title: 'Home Page Sections',
        icon: 'home',
        shortDescription: 'Understanding home page layout and sections',
        link: '/admin/pages',
        content: [
          {
            type: 'heading',
            content: 'Home Page Structure'
          },
          {
            type: 'paragraph',
            content: 'The home page consists of 6 main sections, all manageable from the CMS:'
          },
          {
            type: 'table',
            content: {
              header: ['Section', 'Content From', 'What It Shows'],
              rows: [
                ['Hero', 'Page Builder', 'Welcome message + product slider'],
                ['Services Grid', 'Categories', 'Service category cards'],
                ['Team', 'Page Builder', 'Team intro with images'],
                ['Testimonials', 'Testimonials', 'Customer reviews slider'],
                ['FAQ', 'FAQs', 'Frequently asked questions'],
                ['Contact', 'Page Builder', 'Contact info and form']
              ]
            }
          },
          {
            type: 'heading',
            content: 'Editing Each Section'
          },
          {
            type: 'list',
            content: [
              '**Hero** → Pages → Home → Edit Hero Section',
              '**Services Grid** → Edit categories and their images',
              '**Team** → Pages → Home → Edit Team Section',
              '**Testimonials** → Testimonials menu → Add/edit testimonials',
              '**FAQ** → FAQs menu → Add/edit questions',
              '**Contact** → Pages → Home → Edit Contact Section'
            ]
          }
        ],
        relatedTopics: ['page-builder-overview', 'section-types']
      }
    ]
  }
];

// Search function for help content
export function searchHelpContent(query: string): HelpTopic[] {
  const lowerQuery = query.toLowerCase();
  const results: HelpTopic[] = [];

  helpCategories.forEach(category => {
    category.topics.forEach(topic => {
      const matchTitle = topic.title.toLowerCase().includes(lowerQuery);
      const matchDesc = topic.shortDescription.toLowerCase().includes(lowerQuery);
      const matchContent = topic.content.some(section => {
        if (typeof section.content === 'string') {
          return section.content.toLowerCase().includes(lowerQuery);
        }
        if (Array.isArray(section.content)) {
          return section.content.some(item => 
            typeof item === 'string' && item.toLowerCase().includes(lowerQuery)
          );
        }
        return false;
      });

      if (matchTitle || matchDesc || matchContent) {
        results.push(topic);
      }
    });
  });

  return results;
}

// Get topic by ID
export function getTopicById(topicId: string): HelpTopic | undefined {
  for (const category of helpCategories) {
    const topic = category.topics.find(t => t.id === topicId);
    if (topic) return topic;
  }
  return undefined;
}

// Get category by topic ID
export function getCategoryByTopicId(topicId: string): HelpCategory | undefined {
  for (const category of helpCategories) {
    if (category.topics.some(t => t.id === topicId)) {
      return category;
    }
  }
  return undefined;
}

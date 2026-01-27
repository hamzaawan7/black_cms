/**
 * Generic Block-Based Content System
 * 
 * This system allows any section to contain any combination of content blocks.
 * Instead of hardcoding fields per section type, we use flexible blocks.
 */

// ============================================
// Block Types
// ============================================

export type BlockType = 
  | 'heading'
  | 'text'
  | 'image'
  | 'image_gallery'
  | 'button'
  | 'button_group'
  | 'slider'
  | 'products_carousel'
  | 'services_carousel'
  | 'team_images'
  | 'testimonials_carousel'
  | 'faq_list'
  | 'contact_info'
  | 'about_hero'
  | 'mission_section'
  | 'values_cards'
  | 'process_steps'
  | 'cta_section'
  | 'services_hero'
  | 'services_categories'
  | 'services_grid'
  | 'services_cta'
  | 'contact_hero'
  | 'contact_form'
  | 'contact_info_cards'
  | 'contact_cta'
  | 'partner_login'
  | 'partner_signup_hero'
  | 'partner_signup_types'
  | 'partner_signup_benefits'
  | 'partner_signup_steps'
  | 'partner_signup_community'
  | 'partner_signup_cta'
  | 'legal_hero'
  | 'legal_content'
  | 'cards'
  | 'list'
  | 'stats'
  | 'form'
  | 'video'
  | 'spacer'
  | 'divider'
  | 'html'
  | 'icon';

// ============================================
// Block Data Interfaces
// ============================================

export interface HeadingBlockData {
  text: string;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'pretitle';
  alignment?: 'left' | 'center' | 'right';
}

export interface TextBlockData {
  content: string;
  alignment?: 'left' | 'center' | 'right';
  size?: 'small' | 'medium' | 'large';
}

export interface ImageBlockData {
  src: string;
  alt: string;
  caption?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  rounded?: boolean;
  shadow?: boolean;
}

export interface ImageGalleryBlockData {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  columns?: 2 | 3 | 4;
  gap?: 'small' | 'medium' | 'large';
}

export interface ButtonBlockData {
  text: string;
  link: string;
  style?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  openInNewTab?: boolean;
}

export interface ButtonGroupBlockData {
  buttons: ButtonBlockData[];
  alignment?: 'left' | 'center' | 'right';
}

export interface SliderItemData {
  image: string;
  title?: string;
  description?: string;
  link?: string;
}

export interface SliderBlockData {
  items: SliderItemData[];
  autoPlay?: boolean;
  interval?: number; // in ms
  showDots?: boolean;
  showArrows?: boolean;
}

// Products Carousel Block (for Hero section)
export interface ProductsCarouselItemData {
  name: string;
  slug: string;
  description: string;
  image: string;
}

export interface ProductsCarouselBlockData {
  products: ProductsCarouselItemData[];
  autoPlay?: boolean;
  interval?: number;
  showVialImage?: boolean;
  showProductCard?: boolean;
}

// Services Carousel Block (for Services Grid section)
export interface ServiceItemData {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  is_popular?: boolean;
  category_id?: number;
}

export interface ServiceCategoryData {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  services: ServiceItemData[];
}

export interface ServicesCarouselBlockData {
  categories: ServiceCategoryData[];
  showCategoryImages?: boolean;
  showServicesList?: boolean;
  columns?: 2 | 3 | 4;
}

// Team Images Block (for Team section)
export interface TeamImagesBlockData {
  primaryImage: string;
  primaryAlt?: string;
  secondaryImage: string;
  secondaryAlt?: string;
  badgeImage?: string;
  badgeAlt?: string;
  productImage?: string;
  productAlt?: string;
}

// Testimonials Carousel Block
export interface TestimonialItemData {
  name: string;
  role?: string;
  image?: string;
  quote: string;
  rating: number;
}

export interface TestimonialsCarouselBlockData {
  testimonials: TestimonialItemData[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showRating?: boolean;
}

// FAQ List Block
export interface FaqItemData {
  question: string;
  answer: string;
}

export interface FaqListBlockData {
  items: FaqItemData[];
  preTitle?: string;
  title?: string;
  description?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  ctaText?: string;
  ctaLink?: string;
}

// Contact Info Block
export interface ContactInfoBlockData {
  preTitle?: string;
  title?: string;
  description?: string;
  phone?: string;
  phoneHours?: string;
  email?: string;
  emailResponse?: string;
  hours?: string;
  hoursDescription?: string;
  image?: string;
  imageTitle?: string;
  imageSubtitle?: string;
}

// About Page Block Types
export interface AboutHeroBlockData {
  preTitle?: string;
  title?: string;
  description?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

export interface MissionPointData {
  text: string;
}

export interface MissionSectionBlockData {
  preTitle?: string;
  title?: string;
  description?: string;
  secondaryDescription?: string;
  image?: string;
  points: MissionPointData[];
}

export interface ValueItemData {
  icon?: string;
  title: string;
  description: string;
}

export interface ValuesCardsBlockData {
  preTitle?: string;
  title?: string;
  items: ValueItemData[];
}

export interface ProcessStepData {
  step: string;
  title: string;
  description: string[];
  image?: string;
}

export interface ProcessStepsBlockData {
  preTitle?: string;
  title?: string;
  description?: string;
  steps: ProcessStepData[];
}

export interface CtaSectionBlockData {
  preTitle?: string;
  title?: string;
  description?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

// Services Page Block Types
export interface ServicesCategoryItemData {
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface ServicesHeroBlockData {
  preTitle?: string;
  title?: string;
  titleHighlight?: string;
  description?: string;
  backgroundImage?: string;
}

export interface ServicesCategoriesBlockData {
  title?: string;
  description?: string;
  categories: ServicesCategoryItemData[];
  showImages?: boolean;
  columns?: number;
}

export interface ServicesCtaBlockData {
  preTitle?: string;
  title?: string;
  buttonText?: string;
  buttonLink?: string;
}

// Service Grid Item for Services Grid Block
export interface ServicesGridItemData {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  description?: string;
  headline?: string;
  pricing?: string;
  image?: string;
  isPopular?: boolean;
}

// Services Grid Block - for inline service management
export interface ServicesGridBlockData {
  title?: string;
  description?: string;
  services: ServicesGridItemData[];
  displayStyle?: 'grid' | 'list';
  columns?: 2 | 3 | 4;
}

// ============================================
// Contact Page Block Data Interfaces
// ============================================

export interface ContactHeroBlockData {
  preTitle?: string;
  title?: string;
  description?: string;
  backgroundImage?: string;
}

export interface ContactFormBlockData {
  title?: string;
  subtitle?: string;
  phone?: string;
  email?: string;
  address?: string;
  formTitle?: string;
  submitButtonText?: string;
  showMap?: boolean;
  mapEmbedUrl?: string;
  successTitle?: string;
  successMessage?: string;
  submitText?: string;
  fields?: {
    name?: { label?: string; placeholder?: string; required?: boolean };
    email?: { label?: string; placeholder?: string; required?: boolean };
    phone?: { label?: string; placeholder?: string; required?: boolean };
    message?: { label?: string; placeholder?: string; required?: boolean };
  };
}

export interface ContactInfoCardData {
  id: string;
  icon: 'phone' | 'email' | 'clock' | 'location';
  title: string;
  value: string;
  description?: string;
  link?: string;
}

export interface ContactInfoCardsBlockData {
  cards: ContactInfoCardData[];
  columns?: 2 | 3 | 4;
}

export interface ContactCtaBlockData {
  icon?: 'phone' | 'mail' | 'calendar' | 'message';
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
}

// Partner Login Block
export interface PartnerLoginBlockData {
  hero?: {
    icon_title?: string;
    title?: string;
    description?: string;
  };
  form?: {
    email_label?: string;
    email_placeholder?: string;
    password_label?: string;
    password_placeholder?: string;
    remember_me?: string;
    forgot_password_text?: string;
    forgot_password_link?: string;
    submit_text?: string;
    submitting_text?: string;
  };
  signup_cta?: {
    divider_text?: string;
    description?: string;
    button_text?: string;
    button_link?: string;
  };
  footer?: {
    help_text?: string;
    help_link_text?: string;
    help_link?: string;
    security_text?: string;
  };
  settings?: {
    logo?: string;
    redirect_url?: string;
  };
}

// Partner Signup Block - Separate Section Interfaces
export interface PartnerTypeItem {
  icon: string;
  title: string;
  description: string;
  gradient?: string;
}

export interface BenefitItem {
  icon: string;
  title: string;
  description: string;
}

export interface StepItem {
  number: string;
  title: string;
  description: string;
}

// Partner Signup Hero Block
export interface PartnerSignupHeroBlockData {
  pre_title?: string;
  title?: string;
  title_highlight?: string;
  description?: string;
  logo?: string;
}

// Partner Signup Types Block (Who We're Looking For)
export interface PartnerSignupTypesBlockData {
  title?: string;
  description?: string;
  items?: PartnerTypeItem[];
}

// Partner Signup Benefits Block (What You'll Get)
export interface PartnerSignupBenefitsBlockData {
  title?: string;
  items?: BenefitItem[];
}

// Partner Signup Steps Block (How It Works)
export interface PartnerSignupStepsBlockData {
  title?: string;
  steps?: StepItem[];
}

// Partner Signup Community Block
export interface PartnerSignupCommunityBlockData {
  title?: string;
  description?: string;
  stats?: { icon: string; text: string }[];
}

// Partner Signup CTA Block
export interface PartnerSignupCtaBlockData {
  title?: string;
  description?: string;
  button_text?: string;
  button_link?: string;
  login_text?: string;
  login_link_text?: string;
  login_link?: string;
}

export interface CardItemData {
  image?: string;
  icon?: string;
  title: string;
  description?: string;
  link?: string;
  badge?: string;
}

export interface CardsBlockData {
  items: CardItemData[];
  columns?: 2 | 3 | 4;
  style?: 'default' | 'bordered' | 'shadow' | 'minimal';
}

export interface ListItemData {
  title: string;
  content?: string;
  icon?: string;
}

export interface ListBlockData {
  items: ListItemData[];
  style?: 'bullet' | 'numbered' | 'checklist' | 'accordion' | 'faq';
  collapsible?: boolean;
}

export interface StatItemData {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  prefix?: string;
  suffix?: string;
}

export interface StatsBlockData {
  items: StatItemData[];
  columns?: 2 | 3 | 4;
  animated?: boolean;
}

export interface FormFieldData {
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  options?: string[]; // for select
}

export interface FormBlockData {
  fields: FormFieldData[];
  submitText?: string;
  successMessage?: string;
  endpoint?: string;
}

export interface VideoBlockData {
  url: string; // YouTube, Vimeo, or direct URL
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  poster?: string;
}

export interface SpacerBlockData {
  height: 'small' | 'medium' | 'large' | 'xlarge';
}

export interface DividerBlockData {
  style?: 'solid' | 'dashed' | 'gradient';
  width?: 'full' | 'half' | 'third';
}

export interface HtmlBlockData {
  content: string;
}

export interface IconBlockData {
  name: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

// ============================================
// Legal Page Block Data Interfaces
// ============================================

export interface LegalHeroBlockData {
  preTitle?: string;
  title?: string;
  description?: string;
  lastUpdated?: string;
}

export interface LegalContentSectionData {
  id: string;
  title: string;
  content: string;
}

export interface LegalContentBlockData {
  sections: LegalContentSectionData[];
}

// ============================================
// Union Type for Block Data
// ============================================

export type BlockData = 
  | HeadingBlockData
  | TextBlockData
  | ImageBlockData
  | ImageGalleryBlockData
  | ButtonBlockData
  | ButtonGroupBlockData
  | SliderBlockData
  | ProductsCarouselBlockData
  | ServicesCarouselBlockData
  | TeamImagesBlockData
  | TestimonialsCarouselBlockData
  | FaqListBlockData
  | ContactInfoBlockData
  | CardsBlockData
  | ListBlockData
  | StatsBlockData
  | FormBlockData
  | VideoBlockData
  | SpacerBlockData
  | DividerBlockData
  | HtmlBlockData
  | IconBlockData
  | AboutHeroBlockData
  | MissionSectionBlockData
  | ValuesCardsBlockData
  | ProcessStepsBlockData
  | CtaSectionBlockData
  | ServicesHeroBlockData
  | ServicesCategoriesBlockData
  | ServicesGridBlockData
  | ServicesCtaBlockData
  | ContactHeroBlockData
  | ContactFormBlockData
  | ContactInfoCardsBlockData
  | ContactCtaBlockData
  | PartnerLoginBlockData
  | PartnerSignupHeroBlockData
  | PartnerSignupTypesBlockData
  | PartnerSignupBenefitsBlockData
  | PartnerSignupStepsBlockData
  | PartnerSignupCommunityBlockData
  | PartnerSignupCtaBlockData
  | LegalHeroBlockData
  | LegalContentBlockData;

// ============================================
// Content Block Interface
// ============================================

export interface ContentBlock {
  id: string;
  type: BlockType;
  data: BlockData;
  settings?: {
    visibility?: 'visible' | 'hidden' | 'mobile-only' | 'desktop-only';
    animation?: 'none' | 'fade' | 'slide-up' | 'slide-left' | 'zoom';
    customClass?: string;
  };
}

// ============================================
// Section with Blocks
// ============================================

export interface SectionContent {
  blocks: ContentBlock[];
}

// ============================================
// Block Definitions for UI
// ============================================

export interface BlockDefinition {
  type: BlockType;
  name: string;
  description: string;
  icon: string;
  category: 'content' | 'media' | 'layout' | 'interactive' | 'advanced' | 'partner';
  defaultData: BlockData;
}

export const blockDefinitions: BlockDefinition[] = [
  // Content
  {
    type: 'heading',
    name: 'Heading',
    description: 'Title, subtitle, or pre-title text',
    icon: 'Type',
    category: 'content',
    defaultData: { text: 'Enter heading...', level: 'h2' } as HeadingBlockData,
  },
  {
    type: 'text',
    name: 'Text',
    description: 'Paragraph or rich text content',
    icon: 'AlignLeft',
    category: 'content',
    defaultData: { content: 'Enter your text here...', alignment: 'left' } as TextBlockData,
  },
  {
    type: 'list',
    name: 'List',
    description: 'Bullet points, FAQ, or accordion',
    icon: 'List',
    category: 'content',
    defaultData: { items: [{ title: 'Item 1', content: '' }], style: 'bullet' } as ListBlockData,
  },
  {
    type: 'stats',
    name: 'Stats',
    description: 'Numbers with labels',
    icon: 'BarChart3',
    category: 'content',
    defaultData: { items: [{ value: '100', label: 'Stat Label' }], columns: 4 } as StatsBlockData,
  },
  
  // Media
  {
    type: 'image',
    name: 'Image',
    description: 'Single image with optional caption',
    icon: 'Image',
    category: 'media',
    defaultData: { src: '', alt: 'Image description' } as ImageBlockData,
  },
  {
    type: 'image_gallery',
    name: 'Gallery',
    description: 'Multiple images in a grid',
    icon: 'Images',
    category: 'media',
    defaultData: { images: [], columns: 3 } as ImageGalleryBlockData,
  },
  {
    type: 'slider',
    name: 'Slider',
    description: 'Carousel of images or content',
    icon: 'Layers',
    category: 'media',
    defaultData: { items: [], autoPlay: true, interval: 4000, showDots: true } as SliderBlockData,
  },
  {
    type: 'products_carousel',
    name: 'Products Carousel',
    description: 'Rotating product showcase with vial image',
    icon: 'Package',
    category: 'media',
    defaultData: { products: [], autoPlay: true, interval: 4000, showVialImage: true, showProductCard: true } as ProductsCarouselBlockData,
  },
  {
    type: 'services_carousel',
    name: 'Services Carousel',
    description: 'Service categories with services list',
    icon: 'Grid3X3',
    category: 'media',
    defaultData: { categories: [], showCategoryImages: true, showServicesList: true, columns: 4 } as ServicesCarouselBlockData,
  },
  {
    type: 'team_images',
    name: 'Team Images',
    description: 'Team section images with overlapping layout',
    icon: 'Users',
    category: 'media',
    defaultData: { 
      primaryImage: '', 
      primaryAlt: 'Primary image',
      secondaryImage: '', 
      secondaryAlt: 'Secondary image',
      badgeImage: '',
      productImage: ''
    } as TeamImagesBlockData,
  },
  {
    type: 'testimonials_carousel',
    name: 'Testimonials',
    description: 'Customer testimonials carousel',
    icon: 'MessageCircle',
    category: 'interactive',
    defaultData: { 
      testimonials: [], 
      autoPlay: true, 
      interval: 5000, 
      showDots: true, 
      showRating: true 
    } as TestimonialsCarouselBlockData,
  },
  {
    type: 'faq_list',
    name: 'FAQ List',
    description: 'Frequently asked questions with expandable answers',
    icon: 'HelpCircle',
    category: 'interactive',
    defaultData: { 
      items: [],
      preTitle: 'GOT QUESTIONS?',
      title: 'Frequently Asked Questions',
      description: 'Find answers to common questions.',
      ctaTitle: 'Still have questions?',
      ctaDescription: 'Our support team is here to help.',
      ctaText: 'Contact Support',
      ctaLink: '/contact'
    } as FaqListBlockData,
  },
  {
    type: 'contact_info',
    name: 'Contact Info',
    description: 'Contact section with phone, email, and hours',
    icon: 'Phone',
    category: 'interactive',
    defaultData: { 
      preTitle: 'GET IN TOUCH',
      title: 'We Would Love To Hear From You',
      description: 'Have questions about our services?',
      phone: '1-800-HYVE-RX',
      phoneHours: 'Mon-Fri 8am to 8pm EST',
      email: 'support@hyverx.com',
      emailResponse: 'We\'ll respond within 24 hours',
      hours: '24/7 Support',
      hoursDescription: 'Always here when you need us',
      image: '',
      imageTitle: 'Start Your Journey Today',
      imageSubtitle: 'Personalized care, delivered to your door'
    } as ContactInfoBlockData,
  },
  
  // About Page Blocks
  {
    type: 'about_hero',
    name: 'About Hero',
    description: 'About page hero with title, description, and CTAs',
    icon: 'FileText',
    category: 'content',
    defaultData: { 
      preTitle: 'HERE TO SERVE',
      title: 'About Us',
      description: 'Pioneering the future of personalized telehealth with compassion, innovation, and unwavering commitment to your wellness.',
      primaryCtaText: 'OUR TEAM',
      primaryCtaLink: '#team',
      secondaryCtaText: 'WHAT TO EXPECT',
      secondaryCtaLink: '#what-to-expect'
    } as AboutHeroBlockData,
  },
  {
    type: 'mission_section',
    name: 'Mission Section',
    description: 'Mission statement with image and feature points',
    icon: 'Heart',
    category: 'content',
    defaultData: { 
      preTitle: 'OUR MISSION',
      title: 'Transforming Healthcare, One Patient at a Time',
      description: 'We launched Hyve Wellness with a simple ambition: Provide the highest quality virtual health services while maintaining exceptional individualized patient care.',
      secondaryDescription: 'Our founders believe everyone deserves to look and feel their best. We are committed to offering the best telehealth treatments, expert guidance, and personalized care to our patients nationwide.',
      image: '',
      points: [
        { text: 'Personalized Care' },
        { text: 'Licensed Providers' },
        { text: 'Fast Delivery' },
        { text: '24/7 Support' }
      ]
    } as MissionSectionBlockData,
  },
  {
    type: 'values_cards',
    name: 'Values Cards',
    description: 'Company values displayed as cards with icons',
    icon: 'Award',
    category: 'content',
    defaultData: { 
      preTitle: 'OUR VALUES',
      title: 'What Drives Us',
      items: [
        { icon: 'target', title: 'Patient-Centered', description: 'Your health goals guide everything we do' },
        { icon: 'zap', title: 'Innovation', description: 'Cutting-edge telehealth technology' },
        { icon: 'shield-check', title: 'Trust', description: 'Licensed providers you can rely on' },
        { icon: 'diamond', title: 'Excellence', description: 'Premium quality in every interaction' }
      ]
    } as ValuesCardsBlockData,
  },
  {
    type: 'process_steps',
    name: 'Process Steps',
    description: 'Step-by-step process with images',
    icon: 'ListOrdered',
    category: 'content',
    defaultData: { 
      preTitle: 'PLANNING YOUR VISIT',
      title: 'What to Expect',
      description: 'When you connect with us, you\'ll experience seamless virtual consultations with our expert team.',
      steps: [
        { step: '01', title: 'Intake', description: ['A short intake process', 'to assess your needs', 'and see if you\'re a good fit.'], image: '' },
        { step: '02', title: 'Review', description: ['Our medical team reviews', 'your intake form or, in some cases,', 'has a short consultation video call.'], image: '' },
        { step: '03', title: 'Ship', description: ['We send your medication', 'with 2-day shipping', 'straight to your doorstep.'], image: '' }
      ]
    } as ProcessStepsBlockData,
  },
  {
    type: 'cta_section',
    name: 'CTA Section',
    description: 'Call-to-action section with title, description, and buttons',
    icon: 'Megaphone',
    category: 'content',
    defaultData: { 
      preTitle: 'START YOUR JOURNEY',
      title: 'Ready to Start Your Transformation?',
      description: 'Join thousands of satisfied patients who have transformed their lives with Hyve Wellness.',
      primaryCtaText: 'GET STARTED TODAY',
      primaryCtaLink: '/services',
      secondaryCtaText: 'CONTACT US',
      secondaryCtaLink: '/contact'
    } as CtaSectionBlockData,
  },
  {
    type: 'video',
    name: 'Video',
    description: 'Embed video from URL',
    icon: 'Video',
    category: 'media',
    defaultData: { url: '', autoPlay: false } as VideoBlockData,
  },
  
  // Layout
  {
    type: 'button',
    name: 'Button',
    description: 'Call-to-action button',
    icon: 'MousePointerClick',
    category: 'layout',
    defaultData: { text: 'Click Me', link: '/', style: 'primary' } as ButtonBlockData,
  },
  {
    type: 'button_group',
    name: 'Button Group',
    description: 'Multiple buttons together',
    icon: 'LayoutGrid',
    category: 'layout',
    defaultData: { buttons: [], alignment: 'left' } as ButtonGroupBlockData,
  },
  {
    type: 'cards',
    name: 'Cards',
    description: 'Grid of cards with image/text',
    icon: 'LayoutDashboard',
    category: 'layout',
    defaultData: { items: [], columns: 3, style: 'default' } as CardsBlockData,
  },
  {
    type: 'spacer',
    name: 'Spacer',
    description: 'Vertical spacing',
    icon: 'MoveVertical',
    category: 'layout',
    defaultData: { height: 'medium' } as SpacerBlockData,
  },
  {
    type: 'divider',
    name: 'Divider',
    description: 'Horizontal line separator',
    icon: 'Minus',
    category: 'layout',
    defaultData: { style: 'solid', width: 'full' } as DividerBlockData,
  },
  
  // Interactive
  {
    type: 'form',
    name: 'Form',
    description: 'Contact or input form',
    icon: 'ClipboardList',
    category: 'interactive',
    defaultData: { fields: [], submitText: 'Submit' } as FormBlockData,
  },
  
  // Advanced
  {
    type: 'html',
    name: 'Custom HTML',
    description: 'Raw HTML/embed code',
    icon: 'Code',
    category: 'advanced',
    defaultData: { content: '' } as HtmlBlockData,
  },
  {
    type: 'icon',
    name: 'Icon',
    description: 'Decorative icon',
    icon: 'Sparkles',
    category: 'advanced',
    defaultData: { name: 'star', size: 'medium' } as IconBlockData,
  },

  // Services Page Blocks
  {
    type: 'services_hero',
    name: 'Services Hero',
    description: 'Hero text for services page',
    icon: 'LayoutList',
    category: 'layout',
    defaultData: {
      preTitle: 'OUR SERVICES',
      title: 'A renewing experience',
      titleHighlight: 'awaits you.',
      description: '',
    } as ServicesHeroBlockData,
  },
  {
    type: 'services_categories',
    name: 'Services Categories',
    description: 'Category filters for services page',
    icon: 'Tags',
    category: 'layout',
    defaultData: {
      categories: [
        { name: 'All', slug: 'all', description: 'View all services', image: '' },
        { name: 'Weight Loss', slug: 'weight-loss', description: 'Weight management treatments', image: '' },
        { name: 'Sexual Health', slug: 'sexual-health', description: 'Sexual wellness treatments', image: '' },
        { name: 'Longevity', slug: 'longevity', description: 'Anti-aging treatments', image: '' },
        { name: 'Hair', slug: 'hair', description: 'Hair restoration treatments', image: '' },
        { name: 'Skin', slug: 'skin', description: 'Skin care treatments', image: '' },
        { name: 'Brain & Mood', slug: 'brain-and-mood', description: 'Cognitive enhancement', image: '' },
        { name: 'Hormones', slug: 'hormones', description: 'Hormone therapy', image: '' },
      ],
    } as ServicesCategoriesBlockData,
  },
  {
    type: 'services_grid',
    name: 'Services Grid',
    description: 'Manage and display services with images',
    icon: 'LayoutGrid',
    category: 'layout',
    defaultData: {
      title: 'Our Treatments',
      description: 'Browse our comprehensive range of wellness treatments',
      services: [],
      displayStyle: 'grid',
      columns: 3,
    } as ServicesGridBlockData,
  },
  {
    type: 'services_cta',
    name: 'Services CTA',
    description: 'CTA bar for services page',
    icon: 'ArrowRightCircle',
    category: 'layout',
    defaultData: {
      preTitle: 'Have Questions?',
      title: "We're here to help",
      buttonText: 'CONTACT US',
      buttonLink: '/contact',
    } as ServicesCtaBlockData,
  },

  // Contact Page Blocks
  {
    type: 'contact_hero',
    name: 'Contact Hero',
    description: 'Hero section for contact page',
    icon: 'MessageCircle',
    category: 'layout',
    defaultData: {
      preTitle: 'GET IN TOUCH',
      title: 'Contact Us',
      description: 'Have questions about our services? We\'re here to help.',
    } as ContactHeroBlockData,
  },
  {
    type: 'contact_form',
    name: 'Contact Form',
    description: 'Contact form with customizable fields',
    icon: 'FileEdit',
    category: 'interactive',
    defaultData: {
      title: 'Send Us a Message',
      subtitle: 'We\'d love to hear from you',
      successTitle: 'Thank You!',
      successMessage: 'Your message has been received. Our team will review your inquiry and get back to you within 24-48 hours.',
      submitText: 'SEND MESSAGE',
      fields: {
        name: { label: 'Full Name', placeholder: 'John Doe', required: true },
        email: { label: 'Email Address', placeholder: 'john@example.com', required: true },
        phone: { label: 'Phone Number', placeholder: '(555) 123-4567', required: false },
        message: { label: 'How can we help you?', placeholder: 'Tell us about your questions...', required: true },
      },
    } as ContactFormBlockData,
  },
  {
    type: 'contact_info_cards',
    name: 'Contact Info Cards',
    description: 'Cards displaying contact information',
    icon: 'LayoutGrid',
    category: 'layout',
    defaultData: {
      cards: [
        { id: 'phone', icon: 'phone', title: 'Call Us', value: '1-800-HYVE-RX', description: 'Mon-Fri 8am-8pm EST' },
        { id: 'email', icon: 'email', title: 'Email Us', value: 'support@hyverx.com', description: 'We respond within 24 hours' },
        { id: 'hours', icon: 'clock', title: 'Hours', value: '24/7 Support', description: 'Always here when you need us' },
      ],
      columns: 3,
    } as ContactInfoCardsBlockData,
  },
  {
    type: 'contact_cta',
    name: 'Contact CTA',
    description: 'CTA section for contact page',
    icon: 'Phone',
    category: 'layout',
    defaultData: {
      icon: 'phone',
      title: 'Prefer to speak with someone now?',
      description: 'Our patient care team is available to answer your questions.',
      buttonText: 'Schedule a Call',
      buttonLink: '#',
    } as ContactCtaBlockData,
  },

  // Partner Login Block
  {
    type: 'partner_login',
    name: 'Partner Login',
    description: 'Partner portal login form with branding',
    icon: 'Lock',
    category: 'interactive',
    defaultData: {
      hero: {
        icon_title: 'Partner Portal',
        title: 'Partner Portal',
        description: 'Welcome back! Sign in to your account.',
      },
      form: {
        email_label: 'Email Address',
        email_placeholder: 'partner@example.com',
        password_label: 'Password',
        password_placeholder: '••••••••',
        remember_me: 'Remember me',
        forgot_password_text: 'Forgot password?',
        forgot_password_link: '#',
        submit_text: 'SIGN IN',
        submitting_text: 'SIGNING IN...',
      },
      signup_cta: {
        divider_text: 'New to Hyve Wellness?',
        description: 'Join our network of healthcare professionals',
        button_text: 'BECOME A PARTNER',
        button_link: '/partners/signup',
      },
      footer: {
        help_text: 'Need help?',
        help_link_text: 'Contact support',
        help_link: '/contact',
        security_text: 'Secured with 256-bit SSL encryption',
      },
      settings: {
        logo: '/images/hyve-20logo-20-20350-20x-20100-20-20charcoal.png',
        redirect_url: 'https://partner.hyverx.com/',
      },
    } as PartnerLoginBlockData,
  },

  // Partner Signup Hero Block
  {
    type: 'partner_signup_hero',
    name: 'Partner Signup Hero',
    description: 'Hero section for partner signup page',
    icon: 'Sparkles',
    category: 'partner',
    defaultData: {
      pre_title: 'WELLNESS PARTNERSHIP PROGRAM',
      title: 'Share Wellness.',
      title_highlight: 'Build Your Business.',
      description: 'Are you passionate about health and wellness? Join our community of wellness advocates, fitness professionals, influencers, and community leaders who are helping people access quality telehealth services while earning meaningful income.',
      logo: '/images/hyve-20logo-20-20350-20x-20100-20-20champagne-20gold.png',
    } as PartnerSignupHeroBlockData,
  },

  // Partner Signup Types Block
  {
    type: 'partner_signup_types',
    name: 'Partner Types',
    description: "Who We're Looking For section",
    icon: 'Users',
    category: 'partner',
    defaultData: {
      title: "Who We're Looking For",
      description: 'Our partnership program is designed for people who genuinely care about helping others live healthier lives.',
      items: [
        { icon: 'Users', title: 'Community Leaders', description: 'Coaches, mentors, and organizers with trusted networks', gradient: 'from-[#c9a962] to-[#d4c4a8]' },
        { icon: 'Heart', title: 'Wellness Professionals', description: 'Personal trainers, nutritionists, yoga instructors, and health coaches', gradient: 'from-[#9a8b7a] to-[#c9a962]' },
        { icon: 'TrendingUp', title: 'Content Creators', description: 'Health influencers and educators with engaged audiences', gradient: 'from-[#d4c4a8] to-[#9a8b7a]' },
      ],
    } as PartnerSignupTypesBlockData,
  },

  // Partner Signup Benefits Block
  {
    type: 'partner_signup_benefits',
    name: 'Partner Benefits',
    description: "What You'll Get section with benefit cards",
    icon: 'Gift',
    category: 'partner',
    defaultData: {
      title: "What You'll Get",
      items: [
        { icon: 'DollarSign', title: 'Competitive Commission Structure', description: 'Earn recurring income on every wellness membership you bring to Hyve Wellness.' },
        { icon: 'GraduationCap', title: 'Comprehensive Training', description: 'Access our health education library, sales training programs, and product knowledge courses.' },
        { icon: 'Headphones', title: 'Full Support System', description: 'Our dedicated partner success team provides medical expertise, marketing materials, and ongoing support.' },
        { icon: 'CheckCircle2', title: 'Low-Cost Pricing Model', description: 'Offer your community access to premium telehealth services at accessible price points.' },
      ],
    } as PartnerSignupBenefitsBlockData,
  },

  // Partner Signup Steps Block
  {
    type: 'partner_signup_steps',
    name: 'Partner Steps',
    description: 'How It Works section with numbered steps',
    icon: 'ListOrdered',
    category: 'partner',
    defaultData: {
      title: 'How It Works',
      steps: [
        { number: '1', title: 'Apply to Join', description: "Tell us about yourself and your passion for wellness. We'll review your application and schedule a call." },
        { number: '2', title: 'Get Trained & Certified', description: 'Complete our partner onboarding program. Learn about our treatments and membership options.' },
        { number: '3', title: 'Share With Your Community', description: 'Use your unique partner link and resources to introduce wellness memberships to your audience.' },
        { number: '4', title: 'Earn & Grow', description: 'Receive commissions on every membership. As your client base grows, so does your recurring income.' },
      ],
    } as PartnerSignupStepsBlockData,
  },

  // Partner Signup Community Block
  {
    type: 'partner_signup_community',
    name: 'Partner Community',
    description: 'Join Our Partner Community section',
    icon: 'Heart',
    category: 'partner',
    defaultData: {
      title: 'Join Our Partner Community',
      description: "When you become a Hyve Wellness partner, you're not just earning income - you're joining a supportive community of like-minded wellness advocates.",
      stats: [
        { icon: 'Shield', text: 'Trusted by 500+ partners' },
        { icon: 'Users', text: 'Active community support' },
      ],
    } as PartnerSignupCommunityBlockData,
  },

  // Partner Signup CTA Block
  {
    type: 'partner_signup_cta',
    name: 'Partner CTA',
    description: 'Call to action section for partner signup',
    icon: 'Zap',
    category: 'partner',
    defaultData: {
      title: 'Ready to Make an Impact?',
      description: 'Turn your passion for wellness into a rewarding opportunity. Help your community access quality healthcare while building a business you can be proud of.',
      button_text: 'APPLY NOW',
      button_link: '#',
      login_text: 'Already a partner?',
      login_link_text: 'Sign in to your portal',
      login_link: '/partners/login',
    } as PartnerSignupCtaBlockData,
  },
];

// Helper to get block definition
export function getBlockDefinition(type: BlockType): BlockDefinition | undefined {
  return blockDefinitions.find(b => b.type === type);
}

// Helper to create a new block with unique ID
export function createBlock(type: BlockType): ContentBlock {
  const definition = getBlockDefinition(type);
  return {
    id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    data: definition?.defaultData || {},
    settings: {
      visibility: 'visible',
      animation: 'none',
    },
  };
}

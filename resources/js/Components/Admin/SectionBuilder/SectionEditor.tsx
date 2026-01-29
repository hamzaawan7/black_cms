import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Save, Type, Image as ImageIcon, Link as LinkIcon, ToggleLeft, List, Palette, Hash, LayoutTemplate, Plus, Trash2, ChevronUp, ChevronDown, Upload, Package, Grid3X3, Folder, ExternalLink, RefreshCw, Blocks, Phone, Mail, Clock, MapPin, Calendar, MessageSquare, Copy, Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';
import type { Section, ComponentType } from './index';
import BlockEditor from '../BlockEditor';
import { ContentBlock } from '../BlockEditor/types';
import SectionPreview from './SectionPreview';

// Block types that have custom inline editors (no Quick Edit fields, use custom render)
const CUSTOM_BLOCK_TYPES = [
    'contact_hero',
    'contact_form', 
    'contact_info_cards',
    'contact_cta',
    'services_hero',
    'services_categories',
    'services_grid',
    'services_cta',
    'about_hero',
    'mission_section',
    'values_cards',
    'process_steps',
    'cta_section',
];

interface SectionEditorProps {
    section: Section;
    componentType?: ComponentType;
    onSave: (updates: Partial<Section>) => void;
    onClose: () => void;
}

// Field type definitions based on component type
const fieldDefinitions: Record<string, Record<string, { type: string; label: string; hint?: string }>> = {
    hero: {
        pre_title: { type: 'text', label: 'Pre-Title', hint: 'Small text above the main title' },
        title: { type: 'text', label: 'Title', hint: 'Main headline' },
        subtitle: { type: 'textarea', label: 'Subtitle', hint: 'Supporting text' },
        cta_text: { type: 'text', label: 'Button Text' },
        cta_link: { type: 'url', label: 'Button Link' },
        secondary_cta_text: { type: 'text', label: 'Secondary Button Text' },
        secondary_cta_link: { type: 'url', label: 'Secondary Button Link' },
        badge_text: { type: 'text', label: 'Badge Text', hint: 'Text for the floating badge' },
        background_image: { type: 'image', label: 'Background Image' },
        featured_products: { type: 'products_array', label: 'Featured Products', hint: 'Products shown in the hero slider' },
    },
    text: {
        content: { type: 'richtext', label: 'Content' },
        alignment: { type: 'select', label: 'Text Alignment' },
    },
    services_grid: {
        pre_title: { type: 'text', label: 'Pre-Title' },
        title: { type: 'text', label: 'Section Title' },
        description: { type: 'textarea', label: 'Description' },
        cta_text: { type: 'text', label: 'Button Text' },
        cta_link: { type: 'url', label: 'Button Link' },
        columns: { type: 'select', label: 'Columns' },
    },
    testimonials: {
        pre_title: { type: 'text', label: 'Pre-Title' },
        title: { type: 'text', label: 'Section Title' },
        description: { type: 'textarea', label: 'Description' },
        layout: { type: 'select', label: 'Layout Style' },
        max_items: { type: 'number', label: 'Max Items to Show' },
    },
    faq: {
        pre_title: { type: 'text', label: 'Pre-Title' },
        title: { type: 'text', label: 'Section Title' },
        description: { type: 'textarea', label: 'Description' },
        cta_title: { type: 'text', label: 'CTA Card Title' },
        cta_description: { type: 'textarea', label: 'CTA Card Description' },
        cta_text: { type: 'text', label: 'CTA Button Text' },
        cta_link: { type: 'url', label: 'CTA Button Link' },
    },
    team: {
        pre_title: { type: 'text', label: 'Pre-Title' },
        title: { type: 'text', label: 'Section Title' },
        description: { type: 'textarea', label: 'Description' },
        cta_text: { type: 'text', label: 'Button Text' },
        cta_link: { type: 'url', label: 'Button Link' },
        images: { type: 'team_images', label: 'Team Images', hint: 'Primary and secondary team images' },
    },
    contact: {
        pre_title: { type: 'text', label: 'Pre-Title' },
        title: { type: 'text', label: 'Section Title' },
        description: { type: 'textarea', label: 'Description' },
        phone: { type: 'text', label: 'Phone Number' },
        phone_hours: { type: 'text', label: 'Phone Hours' },
        email: { type: 'text', label: 'Email Address' },
        email_response: { type: 'text', label: 'Email Response Time' },
        hours: { type: 'text', label: 'Support Hours' },
        hours_description: { type: 'text', label: 'Hours Description' },
        image: { type: 'image', label: 'Featured Image' },
        image_title: { type: 'text', label: 'Image Title' },
        image_subtitle: { type: 'text', label: 'Image Subtitle' },
        show_form: { type: 'toggle', label: 'Show Contact Form' },
        show_map: { type: 'toggle', label: 'Show Map' },
    },
    cta: {
        title: { type: 'text', label: 'Headline' },
        subtitle: { type: 'textarea', label: 'Description' },
        button_text: { type: 'text', label: 'Button Text' },
        button_link: { type: 'url', label: 'Button Link' },
        background_color: { type: 'color', label: 'Background Color' },
        background_image: { type: 'image', label: 'Background Image' },
    },
    image_gallery: {
        title: { type: 'text', label: 'Gallery Title' },
        columns: { type: 'select', label: 'Columns' },
        images: { type: 'images', label: 'Gallery Images' },
    },
    custom: {
        html_content: { type: 'code', label: 'HTML Content' },
        css_content: { type: 'code', label: 'Custom CSS' },
    },
    // About page sections
    hero_about: {
        pre_title: { type: 'text', label: 'Pre-Title' },
        title: { type: 'text', label: 'Title' },
        description: { type: 'textarea', label: 'Description' },
        image: { type: 'image', label: 'Hero Image' },
    },
    stats: {
        title: { type: 'text', label: 'Section Title' },
        items: { type: 'stats_items', label: 'Statistics Items', hint: 'Add stats with icon, value and label' },
    },
    mission: {
        title: { type: 'text', label: 'Title' },
        description: { type: 'textarea', label: 'Description' },
        image: { type: 'image', label: 'Image' },
        points: { type: 'text_array', label: 'Key Points', hint: 'List of key points' },
    },
    // Services page sections
    services_hero: {
        pre_title: { type: 'text', label: 'Pre-Title' },
        title: { type: 'text', label: 'Title' },
        description: { type: 'textarea', label: 'Description' },
    },
    services_list: {
        title: { type: 'text', label: 'Section Title' },
        description: { type: 'textarea', label: 'Description' },
    },
    // Contact page sections
    contact_hero: {
        pre_title: { type: 'text', label: 'Pre-Title' },
        title: { type: 'text', label: 'Title' },
        description: { type: 'textarea', label: 'Description' },
    },
    contact_form: {
        title: { type: 'text', label: 'Form Title' },
        phone: { type: 'text', label: 'Phone' },
        email: { type: 'text', label: 'Email' },
        address: { type: 'textarea', label: 'Address' },
    },
};

const selectOptions: Record<string, Array<{ value: string; label: string }>> = {
    columns: [
        { value: '2', label: '2 Columns' },
        { value: '3', label: '3 Columns' },
        { value: '4', label: '4 Columns' },
    ],
    layout: [
        { value: 'carousel', label: 'Carousel' },
        { value: 'grid', label: 'Grid' },
        { value: 'masonry', label: 'Masonry' },
    ],
    alignment: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
    ],
};

// ============================================
// Custom Block Editor Component
// Shows message to use Blocks tab for block-based sections
// ============================================

interface CustomBlockEditorProps {
    componentType: string;
    content: Record<string, any>;
    onChange: (field: string, value: any) => void;
    onSwitchToBlocks?: () => void;
}

function CustomBlockEditor({ componentType, content, onChange, onSwitchToBlocks }: CustomBlockEditorProps) {
    // Get display name for the section type
    const sectionNames: Record<string, string> = {
        contact_hero: 'Contact Hero',
        contact_form: 'Contact Form',
        contact_info_cards: 'Contact Info Cards',
        contact_cta: 'Contact CTA',
        services_hero: 'Services Hero',
        services_categories: 'Services Categories',
        services_grid: 'Services Grid',
        services_cta: 'Services CTA',
        about_hero: 'About Hero',
        mission_section: 'Mission Section',
        values_cards: 'Values Cards',
        process_steps: 'Process Steps',
        cta_section: 'CTA Section',
    };

    const sectionName = sectionNames[componentType] || componentType;

    return (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c9a962]/20 to-[#d4c4a8]/20 flex items-center justify-center mx-auto mb-4">
                <Blocks className="h-8 w-8 text-[#c9a962]" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">{sectionName}</h4>
            <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto">
                This section uses the block-based editor for complete flexibility.
            </p>
            {onSwitchToBlocks && (
                <button
                    type="button"
                    onClick={onSwitchToBlocks}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#c9a962] hover:bg-[#b08d4a] text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <Blocks className="h-4 w-4" />
                    Go to Blocks Tab
                </button>
            )}
            <p className="text-xs text-gray-400 mt-4">
                Add blocks like Heading, Text, Form, Cards, etc.
            </p>
        </div>
    );
}

export default function SectionEditor({ section, componentType, onSave, onClose }: SectionEditorProps) {
    // Initialize with section data - ensure we have fresh data
    const [content, setContent] = useState<Record<string, any>>(() => {
        const initialContent = section.content || {};
        console.log('[SectionEditor] Initial content:', initialContent);
        return initialContent;
    });
    const [styles, setStyles] = useState<Record<string, any>>(() => {
        const initialStyles = section.styles || {};
        console.log('[SectionEditor] Initial styles:', initialStyles);
        return initialStyles;
    });
    // Tabs: content, blocks (new generic), styles, preview
    const [activeTab, setActiveTab] = useState<'content' | 'blocks' | 'styles' | 'preview'>('content');
    // Preview panel state
    const [showPreview, setShowPreview] = useState(false);
    const [previewFullscreen, setPreviewFullscreen] = useState(false);
    
    // Check if this is a hero section or services_grid section
    const isHeroSection = section.component_type === 'hero';
    const isServicesGridSection = section.component_type === 'services_grid';
    
    // Create a live preview section object with current edits
    const previewSection: Section = {
        ...section,
        content,
        styles,
    };
    // Helper function to auto-generate blocks from section content
    const generateAutoBlocks = (sectionContent: Record<string, any>, componentType: string): ContentBlock[] => {
        const existingBlocks = sectionContent.blocks || [];
        const featuredProducts = sectionContent.featured_products || [];
        const images = sectionContent.images || {};
        
        let autoBlocks: ContentBlock[] = [...existingBlocks];
        
        // Hero section - products carousel
        if (componentType === 'hero' && featuredProducts.length > 0) {
            const hasProductsCarousel = existingBlocks.some((b: ContentBlock) => b.type === 'products_carousel');
            if (!hasProductsCarousel) {
                autoBlocks.push({
                    id: `block_products_${Date.now()}`,
                    type: 'products_carousel',
                    data: {
                        products: featuredProducts.map((p: any) => ({
                            name: p.name || '',
                            slug: p.slug || '',
                            description: p.description || '',
                            image: p.image || '',
                        })),
                        autoPlay: true,
                        interval: 4000,
                        showVialImage: true,
                        showProductCard: true,
                    },
                    settings: { visibility: 'visible' },
                });
            }
        }
        // Services grid - services carousel
        else if (componentType === 'services_grid') {
            const hasServicesCarousel = existingBlocks.some((b: ContentBlock) => b.type === 'services_carousel');
            if (!hasServicesCarousel) {
                autoBlocks.push({
                    id: `block_services_${Date.now()}`,
                    type: 'services_carousel',
                    data: {
                        categories: [],
                        showCategoryImages: true,
                        showServicesList: true,
                        columns: 4,
                    },
                    settings: { visibility: 'visible' },
                });
            }
        }
        // Team section - team images
        else if (componentType === 'team' && (images.primary || images.secondary)) {
            const hasTeamImages = existingBlocks.some((b: ContentBlock) => b.type === 'team_images');
            if (!hasTeamImages) {
                autoBlocks.push({
                    id: `block_team_${Date.now()}`,
                    type: 'team_images',
                    data: {
                        primaryImage: images.primary || '',
                        primaryAlt: 'Team primary image',
                        secondaryImage: images.secondary || '',
                        secondaryAlt: 'Team secondary image',
                        badgeImage: '',
                        productImage: '',
                    },
                    settings: { visibility: 'visible' },
                });
            }
        }
        // Testimonials section
        else if (componentType === 'testimonials') {
            const hasTestimonials = existingBlocks.some((b: ContentBlock) => b.type === 'testimonials_carousel');
            if (!hasTestimonials) {
                autoBlocks.push({
                    id: `block_testimonials_${Date.now()}`,
                    type: 'testimonials_carousel',
                    data: {
                        testimonials: [],
                        autoPlay: true,
                        interval: 5000,
                        showDots: true,
                        showRating: true,
                    },
                    settings: { visibility: 'visible' },
                });
            }
        }
        // FAQ section
        else if (componentType === 'faq') {
            const hasFaqList = existingBlocks.some((b: ContentBlock) => b.type === 'faq_list');
            if (!hasFaqList) {
                autoBlocks.push({
                    id: `block_faq_${Date.now()}`,
                    type: 'faq_list',
                    data: {
                        items: [],
                        preTitle: sectionContent.pre_title || 'GOT QUESTIONS?',
                        title: sectionContent.title || 'Frequently Asked Questions',
                        description: sectionContent.description || '',
                        ctaTitle: sectionContent.cta_title || 'Still have questions?',
                        ctaDescription: sectionContent.cta_description || '',
                        ctaText: sectionContent.cta_text || 'Contact Support',
                        ctaLink: sectionContent.cta_link || '/contact',
                    },
                    settings: { visibility: 'visible' },
                });
            }
        }
        // Contact section
        else if (componentType === 'contact') {
            const hasContactInfo = existingBlocks.some((b: ContentBlock) => b.type === 'contact_info');
            if (!hasContactInfo) {
                autoBlocks.push({
                    id: `block_contact_${Date.now()}`,
                    type: 'contact_info',
                    data: {
                        preTitle: sectionContent.pre_title || 'GET IN TOUCH',
                        title: sectionContent.title || 'Contact Us',
                        description: sectionContent.description || '',
                        phone: sectionContent.phone || '',
                        phoneHours: sectionContent.phone_hours || '',
                        email: sectionContent.email || '',
                        emailResponse: sectionContent.email_response || '',
                        hours: sectionContent.hours || '',
                        hoursDescription: sectionContent.hours_description || '',
                        image: sectionContent.image || '',
                        imageTitle: sectionContent.image_title || '',
                        imageSubtitle: sectionContent.image_subtitle || '',
                    },
                    settings: { visibility: 'visible' },
                });
            }
        }
        // Contact Hero section
        else if (componentType === 'contact_hero') {
            const hasContactHero = existingBlocks.some((b: ContentBlock) => b.type === 'contact_hero');
            if (!hasContactHero) {
                autoBlocks.push({
                    id: `block_contact_hero_${Date.now()}`,
                    type: 'contact_hero',
                    data: {
                        preTitle: sectionContent.pre_title || 'CONTACT US',
                        title: sectionContent.title || 'Get In Touch',
                        description: sectionContent.description || '',
                        backgroundImage: sectionContent.background_image || '',
                    },
                    settings: { visibility: 'visible' },
                });
            }
        }
        // Contact Form section
        else if (componentType === 'contact_form') {
            const hasContactForm = existingBlocks.some((b: ContentBlock) => b.type === 'contact_form');
            if (!hasContactForm) {
                autoBlocks.push({
                    id: `block_contact_form_${Date.now()}`,
                    type: 'contact_form',
                    data: {
                        title: sectionContent.title || 'Send Us a Message',
                        phone: sectionContent.phone || '',
                        email: sectionContent.email || '',
                        address: sectionContent.address || '',
                        formTitle: sectionContent.form_title || 'Contact Form',
                        submitButtonText: sectionContent.submit_button_text || 'Send Message',
                        showMap: sectionContent.show_map ?? true,
                        mapEmbedUrl: sectionContent.map_embed_url || '',
                    },
                    settings: { visibility: 'visible' },
                });
            }
        }
        // Services Hero section
        else if (componentType === 'services_hero') {
            const hasServicesHero = existingBlocks.some((b: ContentBlock) => b.type === 'services_hero');
            if (!hasServicesHero) {
                autoBlocks.push({
                    id: `block_services_hero_${Date.now()}`,
                    type: 'services_hero',
                    data: {
                        preTitle: sectionContent.pre_title || 'OUR SERVICES',
                        title: sectionContent.title || 'What We Offer',
                        description: sectionContent.description || '',
                        backgroundImage: sectionContent.background_image || '',
                    },
                    settings: { visibility: 'visible' },
                });
            }
        }
        // Services List section
        else if (componentType === 'services_list') {
            const hasServicesList = existingBlocks.some((b: ContentBlock) => b.type === 'services_categories');
            if (!hasServicesList) {
                autoBlocks.push({
                    id: `block_services_list_${Date.now()}`,
                    type: 'services_categories',
                    data: {
                        title: sectionContent.title || 'Our Services',
                        description: sectionContent.description || '',
                        categories: [],
                        showImages: true,
                        columns: 3,
                    },
                    settings: { visibility: 'visible' },
                });
            }
        }
        // Legal Hero section (Privacy Policy, Terms, etc.)
        else if (componentType === 'legal_hero') {
            const hasLegalHero = existingBlocks.some((b: ContentBlock) => b.type === 'legal_hero');
            if (!hasLegalHero) {
                autoBlocks.push({
                    id: `block_legal_hero_${Date.now()}`,
                    type: 'legal_hero',
                    data: {
                        preTitle: sectionContent.pre_title || 'LEGAL',
                        title: sectionContent.title || 'Privacy Policy',
                        description: sectionContent.description || '',
                        lastUpdated: sectionContent.last_updated || '',
                    },
                    settings: { visibility: 'visible' },
                });
            }
        }
        // Legal Content section
        else if (componentType === 'legal_content') {
            const hasLegalContent = existingBlocks.some((b: ContentBlock) => b.type === 'legal_content');
            if (!hasLegalContent) {
                const sections = sectionContent.sections || [];
                autoBlocks.push({
                    id: `block_legal_content_${Date.now()}`,
                    type: 'legal_content',
                    data: {
                        sections: sections.map((s: any, idx: number) => ({
                            id: `section_${idx}_${Date.now()}`,
                            title: s.title || '',
                            content: s.content || '',
                        })),
                    },
                    settings: { visibility: 'visible' },
                });
            }
        }
        // About Hero section (supports both 'about_hero' and 'hero_about' component_types)
        else if (componentType === 'about_hero' || componentType === 'hero_about') {
            const hasAboutHero = existingBlocks.some((b: ContentBlock) => b.type === 'about_hero');
            if (!hasAboutHero) {
                autoBlocks.push({
                    id: `block_about_hero_${Date.now()}`,
                    type: 'about_hero',
                    data: {
                        preTitle: sectionContent.pre_title || 'ABOUT US',
                        title: sectionContent.title || 'Our Story',
                        description: sectionContent.description || '',
                        image: sectionContent.image || '',
                        imageAlt: sectionContent.image_alt || 'About image',
                        ctaText: sectionContent.cta_text || '',
                        ctaLink: sectionContent.cta_link || '',
                    },
                    settings: { visibility: 'visible' },
                });
            }
        }
        // Stats section
        else if (componentType === 'stats') {
            const hasStats = existingBlocks.some((b: ContentBlock) => b.type === 'stats');
            if (!hasStats) {
                const items = sectionContent.items || [];
                autoBlocks.push({
                    id: `block_stats_${Date.now()}`,
                    type: 'stats',
                    data: {
                        items: items.length > 0 ? items.map((item: any) => ({
                            icon: item.icon || 'Star',
                            value: item.value || '0',
                            label: item.label || 'Stat',
                        })) : [
                            { icon: 'Users', value: '50+', label: 'Team Members' },
                            { icon: 'Heart', value: '1000+', label: 'Happy Customers' },
                            { icon: 'Star', value: '4.9', label: 'Average Rating' },
                        ],
                        columns: sectionContent.columns || 4,
                    },
                    settings: { visibility: 'visible' },
                });
            }
        }
        // Mission section
        else if (componentType === 'mission') {
            const hasMission = existingBlocks.some((b: ContentBlock) => b.type === 'mission_section');
            if (!hasMission) {
                autoBlocks.push({
                    id: `block_mission_${Date.now()}`,
                    type: 'mission_section',
                    data: {
                        title: sectionContent.title || 'Our Mission',
                        description: sectionContent.description || '',
                        image: sectionContent.image || '',
                        imageAlt: sectionContent.image_alt || 'Mission image',
                        points: sectionContent.points || ['Quality Service', 'Expert Team', 'Fast Delivery'],
                        imagePosition: sectionContent.image_position || 'right',
                    },
                    settings: { visibility: 'visible' },
                });
            }
        }
        // Values section
        else if (componentType === 'values') {
            const hasValues = existingBlocks.some((b: ContentBlock) => b.type === 'values_cards');
            if (!hasValues) {
                const items = sectionContent.items || [];
                autoBlocks.push({
                    id: `block_values_${Date.now()}`,
                    type: 'values_cards',
                    data: {
                        title: sectionContent.title || 'Our Values',
                        description: sectionContent.description || '',
                        items: items.length > 0 ? items.map((item: any) => ({
                            icon: item.icon || 'Star',
                            title: item.title || 'Value',
                            description: item.description || '',
                        })) : [
                            { icon: 'Target', title: 'Customer-Centered', description: 'Your goals guide everything we do' },
                            { icon: 'Zap', title: 'Innovation', description: 'Cutting-edge solutions' },
                            { icon: 'Shield', title: 'Trust', description: 'Reliable service you can count on' },
                        ],
                        columns: sectionContent.columns || 3,
                    },
                    settings: { visibility: 'visible' },
                });
            }
        }
        // Process section (How it works)
        else if (componentType === 'process') {
            const hasProcess = existingBlocks.some((b: ContentBlock) => b.type === 'process_steps');
            if (!hasProcess) {
                const steps = sectionContent.steps || [];
                autoBlocks.push({
                    id: `block_process_${Date.now()}`,
                    type: 'process_steps',
                    data: {
                        title: sectionContent.title || 'How It Works',
                        description: sectionContent.description || '',
                        steps: steps.length > 0 ? steps.map((step: any) => ({
                            step: step.step || '01',
                            title: step.title || 'Step',
                            description: Array.isArray(step.description) ? step.description : [step.description || ''],
                            image: step.image || '',
                        })) : [
                            { step: '01', title: 'Intake', description: ['A short intake process', 'to assess your needs'], image: '' },
                            { step: '02', title: 'Review', description: ['Our team reviews', 'your request'], image: '' },
                            { step: '03', title: 'Deliver', description: ['We deliver your solution', 'straight to you'], image: '' },
                        ],
                    },
                    settings: { visibility: 'visible' },
                });
            }
        }
        // CTA section (supports both 'cta' and 'cta_about' component_types)
        else if (componentType === 'cta' || componentType === 'cta_about') {
            const hasCta = existingBlocks.some((b: ContentBlock) => b.type === 'cta_section');
            if (!hasCta) {
                autoBlocks.push({
                    id: `block_cta_${Date.now()}`,
                    type: 'cta_section',
                    data: {
                        preTitle: sectionContent.pre_title || '',
                        title: sectionContent.title || 'Ready to Get Started?',
                        description: sectionContent.description || '',
                        buttonText: sectionContent.button_text || 'GET STARTED',
                        buttonLink: sectionContent.button_link || '/contact',
                        secondaryButtonText: sectionContent.secondary_button_text || '',
                        secondaryButtonLink: sectionContent.secondary_button_link || '',
                        backgroundImage: sectionContent.background_image || '',
                        variant: sectionContent.variant || 'default',
                    },
                    settings: { visibility: 'visible' },
                });
            }
        }
        
        return autoBlocks;
    };
    
    // Block-based content (generic approach)
    // Auto-migrate content to appropriate blocks for each section type
    const [blocks, setBlocks] = useState<ContentBlock[]>(() => {
        const sectionContent = section.content || {};
        console.log('[SectionEditor] Blocks init - sectionContent:', sectionContent);
        console.log('[SectionEditor] Blocks init - component_type:', section.component_type);
        return generateAutoBlocks(sectionContent, section.component_type);
    });
    
    // Services data for services_grid section
    const [categories, setCategories] = useState<any[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
    const categoryFileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingCategoryId, setUploadingCategoryId] = useState<number | null>(null);
    const serviceFileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingServiceId, setUploadingServiceId] = useState<number | null>(null);

    // Load categories with services for services_grid and services_list sections
    const loadCategories = async () => {
        if (!isServicesGridSection && section.component_type !== 'services_list') return;
        setLoadingCategories(true);
        try {
            const response = await fetch('/admin/api/categories-with-services');
            if (response.ok) {
                const data = await response.json();
                const loadedCategories = data.data || data || [];
                setCategories(loadedCategories);
                
                // Update blocks with loaded categories data
                if (loadedCategories.length > 0) {
                    setBlocks(prevBlocks => {
                        // Check if services_carousel or services_categories block exists
                        const hasServicesCarousel = prevBlocks.some(b => b.type === 'services_carousel');
                        const hasServicesCategories = prevBlocks.some(b => b.type === 'services_categories');
                        
                        if (hasServicesCarousel) {
                            // Update existing block with categories
                            return prevBlocks.map(block => {
                                if (block.type === 'services_carousel') {
                                    return {
                                        ...block,
                                        data: {
                                            ...block.data,
                                            categories: loadedCategories.map((cat: any) => ({
                                                id: cat.id,
                                                name: cat.name,
                                                slug: cat.slug,
                                                description: cat.description,
                                                image: cat.image,
                                                services: (cat.services || []).map((s: any) => ({
                                                    id: s.id,
                                                    name: s.name,
                                                    slug: s.slug,
                                                    description: s.description,
                                                    image: s.image,
                                                    pricing: s.pricing,
                                                })),
                                            })),
                                        },
                                    };
                                }
                                return block;
                            });
                        } else if (hasServicesCategories) {
                            // Update services_categories block
                            return prevBlocks.map(block => {
                                if (block.type === 'services_categories') {
                                    return {
                                        ...block,
                                        data: {
                                            ...block.data,
                                            categories: loadedCategories.map((cat: any) => ({
                                                id: cat.id,
                                                name: cat.name,
                                                slug: cat.slug,
                                                description: cat.description,
                                                image: cat.image,
                                                services: (cat.services || []).map((s: any) => ({
                                                    id: s.id,
                                                    name: s.name,
                                                    slug: s.slug,
                                                    description: s.description,
                                                    image: s.image,
                                                    pricing: s.pricing,
                                                })),
                                            })),
                                        },
                                    };
                                }
                                return block;
                            });
                        } else {
                            // Create new services_carousel block
                            return [...prevBlocks, {
                                id: `block_services_${Date.now()}`,
                                type: 'services_carousel',
                                data: {
                                    categories: loadedCategories.map((cat: any) => ({
                                        id: cat.id,
                                        name: cat.name,
                                        slug: cat.slug,
                                        description: cat.description,
                                        image: cat.image,
                                        services: (cat.services || []).map((s: any) => ({
                                            id: s.id,
                                            name: s.name,
                                            slug: s.slug,
                                            description: s.description,
                                            image: s.image,
                                            pricing: s.pricing,
                                        })),
                                    })),
                                    showCategoryImages: true,
                                    showServicesList: true,
                                    columns: 4,
                                },
                                settings: { visibility: 'visible' },
                            }];
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
        setLoadingCategories(false);
    };

    // Re-sync when section prop changes (modal reopens with different section)
    useEffect(() => {
        console.log('[SectionEditor] Section prop changed:', section.id, section.content);
        setContent(section.content || {});
        setStyles(section.styles || {});
        
        // Re-initialize blocks using shared auto-migration function
        const sectionContent = section.content || {};
        setBlocks(generateAutoBlocks(sectionContent, section.component_type));
        
        // Load categories for services_grid or services_list section
        if (section.component_type === 'services_grid' || section.component_type === 'services_list') {
            loadCategories();
        }
    }, [section.id]);

    // Handle blocks change
    const handleBlocksChange = (newBlocks: ContentBlock[]) => {
        setBlocks(newBlocks);
        setContent(prev => ({ ...prev, blocks: newBlocks }));
    };

    // Filter fields for hero section - exclude featured_products from content tab
    const allFields = fieldDefinitions[section.component_type] || {};
    const fields = isHeroSection 
        ? Object.fromEntries(Object.entries(allFields).filter(([key]) => key !== 'featured_products'))
        : allFields;

    const handleContentChange = (field: string, value: any) => {
        setContent(prev => ({ ...prev, [field]: value }));
    };

    const handleStyleChange = (field: string, value: any) => {
        setStyles(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onSave({ content, styles });
    };

    const renderField = (fieldName: string, fieldConfig: { type: string; label: string; hint?: string }) => {
        const value = content[fieldName] || '';

        switch (fieldConfig.type) {
            case 'text':
                return (
                    <div key={fieldName}>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                            {fieldConfig.label}
                        </label>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => handleContentChange(fieldName, e.target.value)}
                            className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                            placeholder={fieldConfig.hint}
                        />
                    </div>
                );

            case 'textarea':
            case 'richtext':
                return (
                    <div key={fieldName}>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                            {fieldConfig.label}
                        </label>
                        <textarea
                            value={value}
                            onChange={(e) => handleContentChange(fieldName, e.target.value)}
                            rows={4}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 resize-none transition-all"
                            placeholder={fieldConfig.hint}
                        />
                    </div>
                );

            case 'number':
                return (
                    <div key={fieldName}>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                            {fieldConfig.label}
                        </label>
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => handleContentChange(fieldName, parseInt(e.target.value) || 0)}
                            className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                        />
                    </div>
                );

            case 'url':
            case 'image':
                return (
                    <div key={fieldName}>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                            {fieldConfig.label}
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => handleContentChange(fieldName, e.target.value)}
                                className="w-full h-11 rounded-xl border border-gray-200 px-4 pr-10 text-sm bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                placeholder={fieldConfig.type === 'image' ? '/images/example.jpg' : 'https://...'}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {fieldConfig.type === 'image' ? <ImageIcon className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                            </div>
                        </div>
                        {fieldConfig.type === 'image' && value && (
                            <div className="mt-2 rounded-xl bg-gray-100 p-2 inline-block">
                                <img src={value} alt="Preview" className="h-16 rounded-lg object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            </div>
                        )}
                    </div>
                );

            case 'select':
                const options = selectOptions[fieldName] || selectOptions.columns;
                return (
                    <div key={fieldName}>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                            {fieldConfig.label}
                        </label>
                        <select
                            value={value}
                            onChange={(e) => handleContentChange(fieldName, e.target.value)}
                            className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                        >
                            <option value="">Select...</option>
                            {options.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                );

            case 'toggle':
                return (
                    <div key={fieldName} className="flex items-center justify-between py-3 px-4 bg-white rounded-xl border border-gray-100">
                        <label className="text-sm font-medium text-gray-700">
                            {fieldConfig.label}
                        </label>
                        <button
                            type="button"
                            onClick={() => handleContentChange(fieldName, !value)}
                            className={`relative h-6 w-11 rounded-full transition-colors ${
                                value ? 'bg-[#c9a962]' : 'bg-gray-300'
                            }`}
                        >
                            <span
                                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                    value ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                );

            case 'color':
                return (
                    <div key={fieldName}>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                            {fieldConfig.label}
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={value || '#c9a962'}
                                onChange={(e) => handleContentChange(fieldName, e.target.value)}
                                className="h-11 w-14 rounded-xl border border-gray-200 cursor-pointer"
                            />
                            <input
                                type="text"
                                value={value || '#c9a962'}
                                onChange={(e) => handleContentChange(fieldName, e.target.value)}
                                className="flex-1 h-11 rounded-xl border border-gray-200 px-4 text-sm bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                            />
                        </div>
                    </div>
                );

            case 'code':
                return (
                    <div key={fieldName}>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                            {fieldConfig.label}
                        </label>
                        <textarea
                            value={value}
                            onChange={(e) => handleContentChange(fieldName, e.target.value)}
                            rows={8}
                            className="w-full rounded-xl border border-gray-700 px-4 py-3 text-sm font-mono bg-gray-900 text-green-400 focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 resize-none transition-all"
                            placeholder={fieldName === 'html_content' ? '<div class="custom">...</div>' : '.custom { ... }'}
                        />
                    </div>
                );

            case 'products_array':
                const products = Array.isArray(value) ? value : [];
                return (
                    <div key={fieldName} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                {fieldConfig.label}
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    const newProduct = {
                                        name: '',
                                        slug: '',
                                        description: '',
                                        image: '',
                                    };
                                    handleContentChange(fieldName, [...products, newProduct]);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#c9a962] bg-[#c9a962]/10 rounded-lg hover:bg-[#c9a962]/20 transition-colors"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add Product
                            </button>
                        </div>
                        {fieldConfig.hint && (
                            <p className="text-xs text-gray-400">{fieldConfig.hint}</p>
                        )}
                        <div className="space-y-3">
                            {products.map((product: any, idx: number) => (
                                <div key={idx} className="relative bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-gray-500">Product #{idx + 1}</span>
                                        <div className="flex items-center gap-1">
                                            {idx > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newProducts = [...products];
                                                        [newProducts[idx - 1], newProducts[idx]] = [newProducts[idx], newProducts[idx - 1]];
                                                        handleContentChange(fieldName, newProducts);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Move up"
                                                >
                                                    <ChevronUp className="h-4 w-4" />
                                                </button>
                                            )}
                                            {idx < products.length - 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newProducts = [...products];
                                                        [newProducts[idx], newProducts[idx + 1]] = [newProducts[idx + 1], newProducts[idx]];
                                                        handleContentChange(fieldName, newProducts);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Move down"
                                                >
                                                    <ChevronDown className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newProducts = products.filter((_: any, i: number) => i !== idx);
                                                    handleContentChange(fieldName, newProducts);
                                                }}
                                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remove product"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Product Name</label>
                                            <input
                                                type="text"
                                                value={product.name || ''}
                                                onChange={(e) => {
                                                    const newProducts = [...products];
                                                    newProducts[idx] = { ...product, name: e.target.value };
                                                    handleContentChange(fieldName, newProducts);
                                                }}
                                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm bg-white focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]/20"
                                                placeholder="Semaglutide + B12"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Slug</label>
                                            <input
                                                type="text"
                                                value={product.slug || ''}
                                                onChange={(e) => {
                                                    const newProducts = [...products];
                                                    newProducts[idx] = { ...product, slug: e.target.value };
                                                    handleContentChange(fieldName, newProducts);
                                                }}
                                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm bg-white focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]/20"
                                                placeholder="semaglutide-b12"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Description</label>
                                        <input
                                            type="text"
                                            value={product.description || ''}
                                            onChange={(e) => {
                                                const newProducts = [...products];
                                                newProducts[idx] = { ...product, description: e.target.value };
                                                handleContentChange(fieldName, newProducts);
                                            }}
                                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm bg-white focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]/20"
                                            placeholder="5.4 lbs. average loss per month"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Image URL</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={product.image || ''}
                                                onChange={(e) => {
                                                    const newProducts = [...products];
                                                    newProducts[idx] = { ...product, image: e.target.value };
                                                    handleContentChange(fieldName, newProducts);
                                                }}
                                                className="flex-1 h-9 rounded-lg border border-gray-200 px-3 text-sm bg-white focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]/20"
                                                placeholder="/storage/media/products/5.png"
                                            />
                                            {product.image && (
                                                <div className="h-9 w-9 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                                                    <img 
                                                        src={product.image} 
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {products.length === 0 && (
                                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <ImageIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">No products added yet</p>
                                    <p className="text-xs text-gray-400 mt-1">Click "Add Product" to add featured products to the hero slider</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'team_images':
                const teamImages = typeof value === 'object' && value !== null ? value : { primary: '', secondary: '' };
                return (
                    <div key={fieldName} className="space-y-4">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {fieldConfig.label}
                        </label>
                        {fieldConfig.hint && (
                            <p className="text-xs text-gray-400">{fieldConfig.hint}</p>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Primary Image</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={teamImages.primary || ''}
                                        onChange={(e) => handleContentChange(fieldName, { ...teamImages, primary: e.target.value })}
                                        className="flex-1 h-10 rounded-lg border border-gray-200 px-3 text-sm"
                                        placeholder="/storage/media/..."
                                    />
                                    {teamImages.primary && (
                                        <div className="h-10 w-10 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                                            <img src={teamImages.primary} alt="Primary" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Secondary Image</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={teamImages.secondary || ''}
                                        onChange={(e) => handleContentChange(fieldName, { ...teamImages, secondary: e.target.value })}
                                        className="flex-1 h-10 rounded-lg border border-gray-200 px-3 text-sm"
                                        placeholder="/storage/media/..."
                                    />
                                    {teamImages.secondary && (
                                        <div className="h-10 w-10 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                                            <img src={teamImages.secondary} alt="Secondary" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'stats_items':
                const statsItems = Array.isArray(value) ? value : [];
                return (
                    <div key={fieldName} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                {fieldConfig.label}
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    const newItem = { icon: 'Star', value: '', label: '' };
                                    handleContentChange(fieldName, [...statsItems, newItem]);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#c9a962] bg-[#c9a962]/10 rounded-lg hover:bg-[#c9a962]/20 transition-colors"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add Stat
                            </button>
                        </div>
                        {fieldConfig.hint && (
                            <p className="text-xs text-gray-400">{fieldConfig.hint}</p>
                        )}
                        <div className="space-y-3">
                            {statsItems.map((item: any, idx: number) => (
                                <div key={idx} className="relative bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-semibold text-gray-500">Stat #{idx + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newItems = statsItems.filter((_: any, i: number) => i !== idx);
                                                handleContentChange(fieldName, newItems);
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Icon</label>
                                            <select
                                                value={item.icon || 'Star'}
                                                onChange={(e) => {
                                                    const newItems = [...statsItems];
                                                    newItems[idx] = { ...item, icon: e.target.value };
                                                    handleContentChange(fieldName, newItems);
                                                }}
                                                className="w-full h-9 rounded-lg border border-gray-200 px-2 text-sm"
                                            >
                                                <option value="Users">Users</option>
                                                <option value="Heart">Heart</option>
                                                <option value="Star">Star</option>
                                                <option value="Shield">Shield</option>
                                                <option value="Award">Award</option>
                                                <option value="Clock">Clock</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Value</label>
                                            <input
                                                type="text"
                                                value={item.value || ''}
                                                onChange={(e) => {
                                                    const newItems = [...statsItems];
                                                    newItems[idx] = { ...item, value: e.target.value };
                                                    handleContentChange(fieldName, newItems);
                                                }}
                                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm"
                                                placeholder="50+"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Label</label>
                                            <input
                                                type="text"
                                                value={item.label || ''}
                                                onChange={(e) => {
                                                    const newItems = [...statsItems];
                                                    newItems[idx] = { ...item, label: e.target.value };
                                                    handleContentChange(fieldName, newItems);
                                                }}
                                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm"
                                                placeholder="Happy Customers"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {statsItems.length === 0 && (
                                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <Hash className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">No statistics added yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'text_array':
                const textItems = Array.isArray(value) ? value : [];
                return (
                    <div key={fieldName} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                {fieldConfig.label}
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    handleContentChange(fieldName, [...textItems, '']);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#c9a962] bg-[#c9a962]/10 rounded-lg hover:bg-[#c9a962]/20 transition-colors"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add Item
                            </button>
                        </div>
                        {fieldConfig.hint && (
                            <p className="text-xs text-gray-400">{fieldConfig.hint}</p>
                        )}
                        <div className="space-y-2">
                            {textItems.map((item: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => {
                                            const newItems = [...textItems];
                                            newItems[idx] = e.target.value;
                                            handleContentChange(fieldName, newItems);
                                        }}
                                        className="flex-1 h-10 rounded-lg border border-gray-200 px-3 text-sm"
                                        placeholder={`Item ${idx + 1}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newItems = textItems.filter((_: any, i: number) => i !== idx);
                                            handleContentChange(fieldName, newItems);
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            {textItems.length === 0 && (
                                <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <List className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">No items added yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            default:
                return (
                    <div key={fieldName}>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                            {fieldConfig.label}
                        </label>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => handleContentChange(fieldName, e.target.value)}
                            className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                        />
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300 ${
                showPreview ? 'max-w-6xl' : 'max-w-2xl'
            }`}>
                {/* Modal Header - Matching Menu Modal Design */}
                <div className="relative bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-8 py-6">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                    </div>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                                <LayoutTemplate className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    Edit {componentType?.name || section.component_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </h3>
                                <p className="text-sm text-white/60">
                                    {componentType?.description || 'Customize this section\'s content and styling'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Preview Toggle Button */}
                            <button
                                type="button"
                                onClick={() => setShowPreview(!showPreview)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    showPreview 
                                        ? 'bg-[#c9a962] text-white' 
                                        : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                                title={showPreview ? 'Hide Preview' : 'Show Preview'}
                            >
                                <Eye className="h-4 w-4" />
                                {showPreview ? 'Hide Preview' : 'Preview'}
                            </button>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                                <X className="h-5 w-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 bg-gray-50/50">
                    <div className="flex px-6 gap-1 overflow-x-auto scrollbar-hide">
                        <button
                            type="button"
                            onClick={() => setActiveTab('content')}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                                activeTab === 'content'
                                    ? 'border-[#c9a962] text-[#c9a962]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Type className="h-4 w-4" />
                            Quick Edit
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('blocks')}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                                activeTab === 'blocks'
                                    ? 'border-[#c9a962] text-[#c9a962]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Blocks className="h-4 w-4" />
                            Blocks
                            {blocks.length > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 text-xs bg-[#c9a962]/10 text-[#c9a962] rounded-full">
                                    {blocks.length}
                                </span>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('styles')}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                                activeTab === 'styles'
                                    ? 'border-[#c9a962] text-[#c9a962]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Palette className="h-4 w-4" />
                            Styles
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('preview')}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                                activeTab === 'preview'
                                    ? 'border-[#c9a962] text-[#c9a962]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Eye className="h-4 w-4" />
                            Preview
                        </button>
                    </div>
                </div>

                {/* Content Area with Optional Preview Panel */}
                <div className={`flex-1 overflow-hidden flex ${showPreview ? 'flex-row' : 'flex-col'}`}>
                    {/* Editor Panel */}
                    <div className={`overflow-y-auto p-8 ${showPreview ? 'w-1/2 border-r border-gray-200' : 'flex-1'}`}>
                        {activeTab === 'content' && (
                            <div className="space-y-6">
                                {/* Section Header */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-[#c9a962]/10 flex items-center justify-center">
                                            <Type className="h-3.5 w-3.5 text-[#c9a962]" />
                                        </span>
                                        Section Content
                                    </h4>
                                </div>
                                
                                {/* Custom Block Type Editors - Show redirect to Blocks tab */}
                                {CUSTOM_BLOCK_TYPES.includes(section.component_type) ? (
                                    <CustomBlockEditor
                                        componentType={section.component_type}
                                        content={content}
                                        onChange={handleContentChange}
                                        onSwitchToBlocks={() => setActiveTab('blocks')}
                                    />
                                ) : (
                                    /* Standard Content Fields */
                                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
                                        {Object.entries(fields).map(([fieldName, fieldConfig]) =>
                                            renderField(fieldName, fieldConfig)
                                        )}
                                    {Object.keys(fields).length === 0 && (
                                        <div className="text-center py-10 bg-white rounded-xl border-2 border-dashed border-gray-200">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                                <Type className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <p className="text-sm text-gray-500">No content fields defined for this component type.</p>
                                            <p className="text-xs text-gray-400 mt-2">Try the "Blocks" tab for a flexible content editor.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Blocks Tab - Generic Block Editor for any section */}
                    {activeTab === 'blocks' && (
                        <div className="space-y-6">
                            {/* Section Header */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-[#c9a962]/10 flex items-center justify-center">
                                        <Blocks className="h-3.5 w-3.5 text-[#c9a962]" />
                                    </span>
                                    Content Blocks
                                </h4>
                                <p className="text-sm text-gray-500">
                                    Build your section with flexible content blocks. Add headings, text, images, sliders, and more.
                                </p>
                            </div>
                            
                            {/* Block Editor */}
                            <BlockEditor
                                blocks={blocks}
                                onChange={handleBlocksChange}
                            />
                        </div>
                    )}

                    {activeTab === 'styles' && (
                        <div className="space-y-6">
                            {/* Section Header */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-[#c9a962]/10 flex items-center justify-center">
                                        <Palette className="h-3.5 w-3.5 text-[#c9a962]" />
                                    </span>
                                    Section Styling
                                </h4>
                            </div>
                            
                            {/* Colors Section */}
                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-bold text-gray-800">Colors</h4>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                            Background Color
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={styles.background_color || '#ffffff'}
                                                onChange={(e) => handleStyleChange('background_color', e.target.value)}
                                                className="h-11 w-14 rounded-xl border border-gray-200 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={styles.background_color || ''}
                                                onChange={(e) => handleStyleChange('background_color', e.target.value)}
                                                className="flex-1 h-11 rounded-xl border border-gray-200 px-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                                placeholder="#ffffff"
                                            />
                                            {styles.background_color && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleStyleChange('background_color', null)}
                                                    className="text-xs text-gray-400 hover:text-gray-600 px-2"
                                                >
                                                    Reset
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                            Text Color
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={styles.text_color || '#6b6b6b'}
                                                onChange={(e) => handleStyleChange('text_color', e.target.value)}
                                                className="h-11 w-14 rounded-xl border border-gray-200 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={styles.text_color || ''}
                                                onChange={(e) => handleStyleChange('text_color', e.target.value)}
                                                className="flex-1 h-11 rounded-xl border border-gray-200 px-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                                placeholder="#6b6b6b"
                                            />
                                            {styles.text_color && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleStyleChange('text_color', null)}
                                                    className="text-xs text-gray-400 hover:text-gray-600 px-2"
                                                >
                                                    Reset
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                            Heading Color
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={styles.heading_color || '#2d2d2d'}
                                                onChange={(e) => handleStyleChange('heading_color', e.target.value)}
                                                className="h-11 w-14 rounded-xl border border-gray-200 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={styles.heading_color || ''}
                                                onChange={(e) => handleStyleChange('heading_color', e.target.value)}
                                                className="flex-1 h-11 rounded-xl border border-gray-200 px-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                                placeholder="#2d2d2d"
                                            />
                                            {styles.heading_color && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleStyleChange('heading_color', null)}
                                                    className="text-xs text-gray-400 hover:text-gray-600 px-2"
                                                >
                                                    Reset
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Typography & Spacing Section */}
                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-bold text-gray-800">Typography & Spacing</h4>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                            Font Size
                                        </label>
                                        <select
                                            value={styles.font_size || 'base'}
                                            onChange={(e) => handleStyleChange('font_size', e.target.value)}
                                            className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                        >
                                            <option value="xs">Extra Small</option>
                                            <option value="sm">Small</option>
                                            <option value="base">Default</option>
                                            <option value="lg">Large</option>
                                            <option value="xl">Extra Large</option>
                                            <option value="2xl">2X Large</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                            Padding Top
                                        </label>
                                        <select
                                            value={styles.padding_top || 'lg'}
                                            onChange={(e) => handleStyleChange('padding_top', e.target.value)}
                                            className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                        >
                                            <option value="none">None</option>
                                            <option value="sm">Small</option>
                                            <option value="md">Medium</option>
                                            <option value="lg">Large</option>
                                            <option value="xl">Extra Large</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                            Padding Bottom
                                        </label>
                                        <select
                                            value={styles.padding_bottom || 'lg'}
                                            onChange={(e) => handleStyleChange('padding_bottom', e.target.value)}
                                            className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                        >
                                            <option value="none">None</option>
                                            <option value="sm">Small</option>
                                            <option value="md">Medium</option>
                                            <option value="lg">Large</option>
                                            <option value="xl">Extra Large</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Layout Section */}
                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-bold text-gray-800">Layout</h4>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                            Container Width
                                        </label>
                                        <select
                                            value={styles.container_width || 'default'}
                                            onChange={(e) => handleStyleChange('container_width', e.target.value)}
                                            className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                        >
                                            <option value="narrow">Narrow</option>
                                            <option value="default">Default</option>
                                            <option value="wide">Wide</option>
                                            <option value="full">Full Width</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                            Custom CSS Class
                                        </label>
                                        <input
                                            type="text"
                                            value={styles.custom_css_class || ''}
                                            onChange={(e) => handleStyleChange('custom_css_class', e.target.value)}
                                            className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                            placeholder="my-custom-class"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Row/Item Styles - For grid sections */}
                            {['services_grid', 'image_gallery', 'testimonials', 'faq'].includes(section.component_type) && (
                                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-bold text-gray-800">Row / Item Styling</h4>
                                        <span className="text-xs text-gray-400">Style specific rows differently</span>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                                    Styled Rows Count
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="20"
                                                    value={styles.styled_rows_count || 0}
                                                    onChange={(e) => handleStyleChange('styled_rows_count', parseInt(e.target.value) || 0)}
                                                    className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                                    placeholder="0"
                                                />
                                                <p className="text-xs text-gray-400 mt-1">Number of first rows to style differently</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                                    Items Per Row
                                                </label>
                                                <select
                                                    value={styles.items_per_row || 4}
                                                    onChange={(e) => handleStyleChange('items_per_row', parseInt(e.target.value))}
                                                    className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                                >
                                                    <option value={2}>2 items</option>
                                                    <option value={3}>3 items</option>
                                                    <option value={4}>4 items</option>
                                                    <option value={5}>5 items</option>
                                                    <option value={6}>6 items</option>
                                                </select>
                                                <p className="text-xs text-gray-400 mt-1">Items per row in grid</p>
                                            </div>
                                        </div>

                                        {(styles.styled_rows_count || 0) > 0 && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                                    First {styles.styled_rows_count} Row(s) Background Color
                                                </label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="color"
                                                        value={styles.row_background_color || '#f5f2eb'}
                                                        onChange={(e) => handleStyleChange('row_background_color', e.target.value)}
                                                        className="h-11 w-14 rounded-xl border border-gray-200 cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={styles.row_background_color || ''}
                                                        onChange={(e) => handleStyleChange('row_background_color', e.target.value)}
                                                        className="flex-1 h-11 rounded-xl border border-gray-200 px-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                                        placeholder="#f5f2eb"
                                                    />
                                                    {styles.row_background_color && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStyleChange('row_background_color', null)}
                                                            className="text-xs text-gray-400 hover:text-gray-600 px-2"
                                                        >
                                                            Reset
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    First {(styles.styled_rows_count || 0) * (styles.items_per_row || 4)} items will use this background
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Preview Tab Content */}
                    {activeTab === 'preview' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-[#c9a962]/10 flex items-center justify-center">
                                        <Eye className="h-3.5 w-3.5 text-[#c9a962]" />
                                    </span>
                                    Live Preview
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => setPreviewFullscreen(!previewFullscreen)}
                                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
                                >
                                    {previewFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                                    {previewFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                                </button>
                            </div>
                            <div className="bg-gray-100 rounded-xl p-4">
                                <SectionPreview section={previewSection} />
                            </div>
                            <p className="text-xs text-gray-400 text-center">
                                This is a preview of how the section will appear on the website. Edit content to see live changes.
                            </p>
                        </div>
                    )}
                    </div>

                    {/* Live Preview Side Panel (when enabled) */}
                    {showPreview && activeTab !== 'preview' && (
                        <div className="w-1/2 overflow-y-auto bg-gray-100 p-6">
                            <div className="sticky top-0 bg-gray-100 pb-4 mb-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Eye className="h-4 w-4 text-[#c9a962]" />
                                        Live Preview
                                    </h4>
                                    <span className="text-xs text-gray-400 px-2 py-1 bg-white rounded-full">
                                        Updates as you type
                                    </span>
                                </div>
                            </div>
                            <SectionPreview 
                                section={previewSection} 
                                className="transform-gpu"
                            />
                        </div>
                    )}
                </div>

                {/* Footer - Matching Menu Modal */}
                <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-8 py-4 bg-gray-50/50 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#c9a962] text-white text-sm font-semibold rounded-xl hover:bg-[#b08d4a] transition-colors shadow-sm"
                    >
                        <Save className="h-4 w-4" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Save, Type, Image as ImageIcon, Link as LinkIcon, ToggleLeft, List, Palette, Hash, LayoutTemplate, Plus, Trash2, ChevronUp, ChevronDown, Upload, Package, Grid3X3, Folder, ExternalLink, RefreshCw, Blocks, Phone, Mail, Clock, MapPin, Calendar, MessageSquare, Copy } from 'lucide-react';
import type { Section, ComponentType } from './index';
import BlockEditor from '../BlockEditor';
import { ContentBlock } from '../BlockEditor/types';

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
        primary_image: { type: 'image', label: 'Primary Image' },
        secondary_image: { type: 'image', label: 'Secondary Image' },
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
    },
    mission: {
        title: { type: 'text', label: 'Title' },
        description: { type: 'textarea', label: 'Description' },
        image: { type: 'image', label: 'Image' },
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
    // Tabs: content, blocks (new generic), styles
    const [activeTab, setActiveTab] = useState<'content' | 'blocks' | 'styles'>('content');
    
    // Check if this is a hero section or services_grid section
    const isHeroSection = section.component_type === 'hero';
    const isServicesGridSection = section.component_type === 'services_grid';
    
    // Block-based content (generic approach)
    // Auto-migrate featured_products to products_carousel block for hero sections
    // Auto-create services_carousel block for services_grid sections
    const [blocks, setBlocks] = useState<ContentBlock[]>(() => {
        // Use section.content directly since content state might not be initialized yet
        const sectionContent = section.content || {};
        const existingBlocks = sectionContent.blocks || [];
        const featuredProducts = sectionContent.featured_products || [];
        
        console.log('[SectionEditor] Blocks init - sectionContent:', sectionContent);
        console.log('[SectionEditor] Blocks init - existingBlocks:', existingBlocks);
        console.log('[SectionEditor] Blocks init - component_type:', section.component_type);
        
        // For hero sections, check if we need to migrate featured_products to a products_carousel block
        if (section.component_type === 'hero' && featuredProducts.length > 0) {
            // Check if there's already a products_carousel block
            const hasProductsCarousel = existingBlocks.some((b: ContentBlock) => b.type === 'products_carousel');
            
            if (!hasProductsCarousel) {
                // Create a products_carousel block from featured_products
                const productsCarouselBlock: ContentBlock = {
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
                };
                return [...existingBlocks, productsCarouselBlock];
            }
        }
        
        // For services_grid sections, check if we need to create a services_carousel block
        if (section.component_type === 'services_grid') {
            const hasServicesCarousel = existingBlocks.some((b: ContentBlock) => b.type === 'services_carousel');
            
            if (!hasServicesCarousel) {
                // Create a services_carousel block - categories will be loaded dynamically
                const servicesCarouselBlock: ContentBlock = {
                    id: `block_services_${Date.now()}`,
                    type: 'services_carousel',
                    data: {
                        categories: [], // Will be populated from API
                        showCategoryImages: true,
                        showServicesList: true,
                        columns: 4,
                    },
                    settings: { visibility: 'visible' },
                };
                return [...existingBlocks, servicesCarouselBlock];
            }
        }
        
        return existingBlocks;
    });
    
    // Helper function to create products carousel block from featured_products
    const createProductsCarouselBlock = (featuredProducts: any[]): ContentBlock => ({
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
    
    // Effect to sync blocks when section changes (for re-opening editor)
    useEffect(() => {
        const sectionContent = section.content || {};
        const existingBlocks = sectionContent.blocks || [];
        const featuredProducts = sectionContent.featured_products || [];
        
        if (section.component_type === 'hero' && featuredProducts.length > 0) {
            const hasProductsCarousel = existingBlocks.some((b: ContentBlock) => b.type === 'products_carousel');
            if (!hasProductsCarousel) {
                const productsCarouselBlock = createProductsCarouselBlock(featuredProducts);
                setBlocks([...existingBlocks, productsCarouselBlock]);
            }
        }
    }, [section.id]); // Re-run when section ID changes
    
    // Services data for services_grid section
    const [categories, setCategories] = useState<any[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
    const categoryFileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingCategoryId, setUploadingCategoryId] = useState<number | null>(null);
    const serviceFileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingServiceId, setUploadingServiceId] = useState<number | null>(null);

    // Load categories with services for services_grid section
    const loadCategories = async () => {
        if (!isServicesGridSection) return;
        setLoadingCategories(true);
        try {
            const response = await fetch('/admin/api/categories-with-services');
            if (response.ok) {
                const data = await response.json();
                setCategories(data.data || data || []);
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
        setBlocks(section.content?.blocks || []);
        if (section.component_type === 'services_grid') {
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
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <X className="h-5 w-5 text-white" />
                        </button>
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
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
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

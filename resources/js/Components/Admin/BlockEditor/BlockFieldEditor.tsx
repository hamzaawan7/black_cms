import React, { useState, useRef } from 'react';
import {
    X,
    Save,
    Type,
    Image as ImageIcon,
    Upload,
    Plus,
    Trash2,
    ChevronUp,
    ChevronDown,
    Settings,
    Eye,
    AlignLeft,
    AlignCenter,
    AlignRight,
    ExternalLink,
    Copy,
    Package,
} from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import {
    ContentBlock,
    BlockType,
    getBlockDefinition,
    HeadingBlockData,
    TextBlockData,
    ImageBlockData,
    ButtonBlockData,
    SliderBlockData,
    CardsBlockData,
    ListBlockData,
    StatsBlockData,
    VideoBlockData,
    SpacerBlockData,
    DividerBlockData,
    HtmlBlockData,
    ImageGalleryBlockData,
    ButtonGroupBlockData,
    FormBlockData,
} from './types';
import {
    styles,
    FieldLabel,
    TextInput,
    Textarea,
    Select,
    Checkbox,
    AlignmentSelector,
    AddItemButton,
    DeleteButton,
    MoveButtons,
    ListItemControls,
    SectionHeaderFields,
    ImageUploadBox,
    ListHeader,
    IconSelector,
    StarRating,
    FormField,
    ToggleOptionsRow,
    iconOptions,
} from './FormComponents';

interface BlockFieldEditorProps {
    block: ContentBlock;
    onSave: (block: ContentBlock) => void;
    onClose: () => void;
}

export default function BlockFieldEditor({ block, onSave, onClose }: BlockFieldEditorProps) {
    const [data, setData] = useState<any>(block.data);
    const [settings, setSettings] = useState(block.settings || {});
    const [activeTab, setActiveTab] = useState<'content' | 'settings'>('content');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    
    // Additional refs and state for nested image uploads
    const teamImageRef = useRef<HTMLInputElement>(null);
    const [uploadingField, setUploadingField] = useState<string | null>(null);
    const testimonialImageRef = useRef<HTMLInputElement>(null);
    const [uploadingTestimonialIdx, setUploadingTestimonialIdx] = useState<number | null>(null);
    const stepImageRef = useRef<HTMLInputElement>(null);
    const [uploadingStepIdx, setUploadingStepIdx] = useState<number | null>(null);

    const definition = getBlockDefinition(block.type);

    const handleSave = () => {
        onSave({
            ...block,
            data,
            settings,
        });
    };

    const updateData = (key: string, value: any) => {
        setData((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleImageUpload = async (file: File, callback: (url: string) => void) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/admin/media/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                const result = await response.json();
                const imageUrl = result.data?.url || result.data?.path || result.url || result.path;
                if (imageUrl) {
                    callback(imageUrl);
                }
            }
        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    // Render fields based on block type
    const renderContentFields = () => {
        switch (block.type) {
            case 'heading':
                return renderHeadingFields();
            case 'text':
                return renderTextFields();
            case 'image':
                return renderImageFields();
            case 'button':
                return renderButtonFields();
            case 'slider':
                return renderSliderFields();
            case 'products_carousel':
                return renderProductsCarouselFields();
            case 'services_carousel':
                return renderServicesCarouselFields();
            case 'team_images':
                return renderTeamImagesFields();
            case 'testimonials_carousel':
                return renderTestimonialsCarouselFields();
            case 'faq_list':
                return renderFaqListFields();
            case 'contact_info':
                return renderContactInfoFields();
            case 'about_hero':
                return renderAboutHeroFields();
            case 'mission_section':
                return renderMissionSectionFields();
            case 'values_cards':
                return renderValuesCardsFields();
            case 'process_steps':
                return renderProcessStepsFields();
            case 'cta_section':
                return renderCtaSectionFields();
            case 'services_hero':
                return renderServicesHeroFields();
            case 'services_categories':
                return renderServicesCategoriesFields();
            case 'services_grid':
                return renderServicesGridFields();
            case 'services_cta':
                return renderServicesCtaFields();
            case 'contact_hero':
                return renderContactHeroFields();
            case 'contact_form':
                return renderContactFormFields();
            case 'contact_info_cards':
                return renderContactInfoCardsFields();
            case 'contact_cta':
                return renderContactCtaFields();
            case 'partner_login':
                return renderPartnerLoginFields();
            case 'partner_signup_hero':
                return renderPartnerSignupHeroFields();
            case 'partner_signup_types':
                return renderPartnerSignupTypesFields();
            case 'partner_signup_benefits':
                return renderPartnerSignupBenefitsFields();
            case 'partner_signup_steps':
                return renderPartnerSignupStepsFields();
            case 'partner_signup_community':
                return renderPartnerSignupCommunityFields();
            case 'partner_signup_cta':
                return renderPartnerSignupCtaFields();
            case 'legal_hero':
                return renderLegalHeroFields();
            case 'legal_content':
                return renderLegalContentFields();
            case 'cards':
                return renderCardsFields();
            case 'list':
                return renderListFields();
            case 'stats':
                return renderStatsFields();
            case 'video':
                return renderVideoFields();
            case 'spacer':
                return renderSpacerFields();
            case 'divider':
                return renderDividerFields();
            case 'html':
                return renderHtmlFields();
            case 'image_gallery':
                return renderGalleryFields();
            case 'button_group':
                return renderButtonGroupFields();
            default:
                return <p className="text-sm text-gray-500">No editor available for this block type.</p>;
        }
    };

    // Heading Fields
    const renderHeadingFields = () => (
        <div className="space-y-4">
            <FormField label="Heading Text">
                <TextInput
                    value={data.text || ''}
                    onChange={(val) => updateData('text', val)}
                    placeholder="Enter heading..."
                />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
                <FormField label="Level">
                    <Select
                        value={data.level || 'h2'}
                        onChange={(val) => updateData('level', val)}
                        options={[
                            { value: 'pretitle', label: 'Pre-title (small)' },
                            { value: 'h1', label: 'H1 (largest)' },
                            { value: 'h2', label: 'H2' },
                            { value: 'h3', label: 'H3' },
                            { value: 'h4', label: 'H4' },
                            { value: 'h5', label: 'H5' },
                            { value: 'h6', label: 'H6 (smallest)' },
                        ]}
                    />
                </FormField>
                <FormField label="Alignment">
                    <AlignmentSelector
                        value={data.alignment || 'left'}
                        onChange={(val) => updateData('alignment', val)}
                    />
                </FormField>
            </div>
        </div>
    );

    // Text Fields - with WYSIWYG Editor
    const renderTextFields = () => (
        <div className="space-y-4">
            <FormField label="Text Content">
                <RichTextEditor
                    value={data.content || ''}
                    onChange={(val) => updateData('content', val)}
                    placeholder="Enter your text..."
                    minHeight="150px"
                />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
                <FormField label="Size">
                    <Select
                        value={data.size || 'medium'}
                        onChange={(val) => updateData('size', val)}
                        options={[
                            { value: 'small', label: 'Small' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'large', label: 'Large' },
                        ]}
                    />
                </FormField>
                <FormField label="Alignment">
                    <AlignmentSelector
                        value={data.alignment || 'left'}
                        onChange={(val) => updateData('alignment', val)}
                    />
                </FormField>
            </div>
        </div>
    );

    // Image Fields
    const renderImageFields = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                    Image
                </label>
                <div className="relative">
                    {data.src ? (
                        <div className="relative rounded-lg overflow-hidden border border-gray-200 group">
                            <img
                                src={data.src.startsWith('/') ? data.src : `/${data.src}`}
                                alt={data.alt || ''}
                                className="w-full h-48 object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = '/images/placeholder.png';
                                }}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                                >
                                    <Upload className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateData('src', '')}
                                    className="p-2 bg-white rounded-lg text-red-500 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-48 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 hover:border-[#c9a962] hover:bg-[#c9a962]/5 transition-colors flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[#c9a962]"
                        >
                            <Upload className="h-8 w-8" />
                            <span className="text-sm">Click to upload image</span>
                        </button>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                handleImageUpload(file, (url) => updateData('src', url));
                            }
                            e.target.value = '';
                        }}
                    />
                </div>
                <input
                    type="text"
                    value={data.src || ''}
                    onChange={(e) => updateData('src', e.target.value)}
                    className="w-full h-9 mt-2 rounded-lg border border-gray-200 px-3 text-xs focus:border-[#c9a962] focus:outline-none"
                    placeholder="Or enter image URL..."
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                    Alt Text
                </label>
                <input
                    type="text"
                    value={data.alt || ''}
                    onChange={(e) => updateData('alt', e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                    placeholder="Describe the image..."
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                        Size
                    </label>
                    <select
                        value={data.size || 'full'}
                        onChange={(e) => updateData('size', e.target.value)}
                        className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                    >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                        <option value="full">Full Width</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                        Options
                    </label>
                    <div className="flex gap-4 h-10 items-center">
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={data.rounded || false}
                                onChange={(e) => updateData('rounded', e.target.checked)}
                                className="rounded border-gray-300 text-[#c9a962] focus:ring-[#c9a962]"
                            />
                            Rounded
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={data.shadow || false}
                                onChange={(e) => updateData('shadow', e.target.checked)}
                                className="rounded border-gray-300 text-[#c9a962] focus:ring-[#c9a962]"
                            />
                            Shadow
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );

    // Button Fields
    const renderButtonFields = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                    Button Text
                </label>
                <input
                    type="text"
                    value={data.text || ''}
                    onChange={(e) => updateData('text', e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                    placeholder="Click Me"
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                    Link URL
                </label>
                <input
                    type="text"
                    value={data.link || ''}
                    onChange={(e) => updateData('link', e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                    placeholder="/contact or https://..."
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                        Style
                    </label>
                    <select
                        value={data.style || 'primary'}
                        onChange={(e) => updateData('style', e.target.value)}
                        className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                    >
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                        <option value="outline">Outline</option>
                        <option value="ghost">Ghost</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                        Size
                    </label>
                    <select
                        value={data.size || 'medium'}
                        onChange={(e) => updateData('size', e.target.value)}
                        className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                    >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                    </select>
                </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                    type="checkbox"
                    checked={data.openInNewTab || false}
                    onChange={(e) => updateData('openInNewTab', e.target.checked)}
                    className="rounded border-gray-300 text-[#c9a962] focus:ring-[#c9a962]"
                />
                Open in new tab
            </label>
        </div>
    );

    // Slider Fields
    const renderSliderFields = () => {
        const items = data.items || [];
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Slider Items ({items.length})
                    </label>
                    <button
                        type="button"
                        onClick={() => {
                            updateData('items', [...items, { image: '', title: '', description: '', link: '' }]);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-[#c9a962] rounded hover:bg-[#b08d4a]"
                    >
                        <Plus className="h-3 w-3" />
                        Add Slide
                    </button>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {items.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-start gap-3">
                                {/* Slide Image */}
                                <div className="w-20 flex-shrink-0">
                                    {item.image ? (
                                        <div className="relative w-20 h-20 rounded overflow-hidden group">
                                            <img
                                                src={item.image.startsWith('/') ? item.image : `/${item.image}`}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUploadingIndex(idx);
                                                    fileInputRef.current?.click();
                                                }}
                                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center"
                                            >
                                                <Upload className="h-4 w-4 text-white" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUploadingIndex(idx);
                                                fileInputRef.current?.click();
                                            }}
                                            className="w-20 h-20 rounded border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#c9a962] hover:border-[#c9a962]"
                                        >
                                            <Upload className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                                {/* Slide Details */}
                                <div className="flex-1 space-y-2">
                                    <input
                                        type="text"
                                        value={item.title || ''}
                                        onChange={(e) => {
                                            const newItems = [...items];
                                            newItems[idx] = { ...item, title: e.target.value };
                                            updateData('items', newItems);
                                        }}
                                        className="w-full h-8 rounded border border-gray-200 px-2 text-xs focus:border-[#c9a962] focus:outline-none"
                                        placeholder="Slide title"
                                    />
                                    <input
                                        type="text"
                                        value={item.description || ''}
                                        onChange={(e) => {
                                            const newItems = [...items];
                                            newItems[idx] = { ...item, description: e.target.value };
                                            updateData('items', newItems);
                                        }}
                                        className="w-full h-8 rounded border border-gray-200 px-2 text-xs focus:border-[#c9a962] focus:outline-none"
                                        placeholder="Description"
                                    />
                                </div>
                                {/* Delete */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        updateData('items', items.filter((_: any, i: number) => i !== idx));
                                    }}
                                    className="p-1 text-red-400 hover:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Settings */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                        <input
                            type="checkbox"
                            checked={data.autoPlay !== false}
                            onChange={(e) => updateData('autoPlay', e.target.checked)}
                            className="rounded border-gray-300 text-[#c9a962] focus:ring-[#c9a962]"
                        />
                        Auto-play
                    </label>
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                        <input
                            type="checkbox"
                            checked={data.showDots !== false}
                            onChange={(e) => updateData('showDots', e.target.checked)}
                            className="rounded border-gray-300 text-[#c9a962] focus:ring-[#c9a962]"
                        />
                        Show dots
                    </label>
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                        <input
                            type="checkbox"
                            checked={data.showArrows || false}
                            onChange={(e) => updateData('showArrows', e.target.checked)}
                            className="rounded border-gray-300 text-[#c9a962] focus:ring-[#c9a962]"
                        />
                        Show arrows
                    </label>
                </div>
                {/* Hidden file input for slider uploads */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && uploadingIndex !== null) {
                            handleImageUpload(file, (url) => {
                                const newItems = [...items];
                                newItems[uploadingIndex] = { ...newItems[uploadingIndex], image: url };
                                updateData('items', newItems);
                            });
                        }
                        setUploadingIndex(null);
                        e.target.value = '';
                    }}
                />
            </div>
        );
    };

    // Products Carousel Fields (for Hero section)
    const renderProductsCarouselFields = () => {
        const products = data.products || [];
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Products ({products.length})
                    </label>
                    <button
                        type="button"
                        onClick={() => {
                            updateData('products', [...products, { name: '', slug: '', description: '', image: '' }]);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-[#c9a962] rounded hover:bg-[#b08d4a]"
                    >
                        <Plus className="h-3 w-3" />
                        Add Product
                    </button>
                </div>
                <p className="text-xs text-gray-500">
                    Products will appear in the rotating carousel with vial images.
                </p>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {products.map((product: any, idx: number) => (
                        <div key={idx} className="relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            {/* Product Header */}
                            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
                                <span className="text-xs font-semibold text-gray-700">
                                    Product #{idx + 1} {product.name && `- ${product.name}`}
                                </span>
                                <div className="flex items-center gap-1">
                                    {idx > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newProducts = [...products];
                                                [newProducts[idx - 1], newProducts[idx]] = [newProducts[idx], newProducts[idx - 1]];
                                                updateData('products', newProducts);
                                            }}
                                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                            title="Move up"
                                        >
                                            <ChevronUp className="h-3 w-3" />
                                        </button>
                                    )}
                                    {idx < products.length - 1 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newProducts = [...products];
                                                [newProducts[idx], newProducts[idx + 1]] = [newProducts[idx + 1], newProducts[idx]];
                                                updateData('products', newProducts);
                                            }}
                                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                            title="Move down"
                                        >
                                            <ChevronDown className="h-3 w-3" />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            updateData('products', products.filter((_: any, i: number) => i !== idx));
                                        }}
                                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                                        title="Remove product"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                            {/* Product Body */}
                            <div className="p-3">
                                <div className="flex gap-3">
                                    {/* Image */}
                                    <div className="w-20 flex-shrink-0">
                                        {product.image ? (
                                            <div className="relative w-20 h-20 rounded-lg overflow-hidden group border border-gray-200">
                                                <img
                                                    src={product.image.startsWith('/') ? product.image : `/${product.image}`}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setUploadingIndex(idx);
                                                        fileInputRef.current?.click();
                                                    }}
                                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center"
                                                >
                                                    <Upload className="h-4 w-4 text-white" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUploadingIndex(idx);
                                                    fileInputRef.current?.click();
                                                }}
                                                className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#c9a962] hover:border-[#c9a962]"
                                            >
                                                <Upload className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                    {/* Fields */}
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            value={product.name || ''}
                                            onChange={(e) => {
                                                const newProducts = [...products];
                                                newProducts[idx] = { ...product, name: e.target.value };
                                                updateData('products', newProducts);
                                            }}
                                            className="w-full h-8 rounded border border-gray-200 px-2 text-xs focus:border-[#c9a962] focus:outline-none"
                                            placeholder="Product name"
                                        />
                                        <input
                                            type="text"
                                            value={product.slug || ''}
                                            onChange={(e) => {
                                                const newProducts = [...products];
                                                newProducts[idx] = { ...product, slug: e.target.value };
                                                updateData('products', newProducts);
                                            }}
                                            className="w-full h-8 rounded border border-gray-200 px-2 text-xs focus:border-[#c9a962] focus:outline-none"
                                            placeholder="slug-url"
                                        />
                                        <input
                                            type="text"
                                            value={product.description || ''}
                                            onChange={(e) => {
                                                const newProducts = [...products];
                                                newProducts[idx] = { ...product, description: e.target.value };
                                                updateData('products', newProducts);
                                            }}
                                            className="w-full h-8 rounded border border-gray-200 px-2 text-xs focus:border-[#c9a962] focus:outline-none"
                                            placeholder="Short description"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Settings */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                        <input
                            type="checkbox"
                            checked={data.showVialImage !== false}
                            onChange={(e) => updateData('showVialImage', e.target.checked)}
                            className="rounded border-gray-300 text-[#c9a962] focus:ring-[#c9a962]"
                        />
                        Show vial image
                    </label>
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                        <input
                            type="checkbox"
                            checked={data.showProductCard !== false}
                            onChange={(e) => updateData('showProductCard', e.target.checked)}
                            className="rounded border-gray-300 text-[#c9a962] focus:ring-[#c9a962]"
                        />
                        Show product card
                    </label>
                </div>
                {/* Hidden file input for product image uploads */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && uploadingIndex !== null) {
                            handleImageUpload(file, (url) => {
                                const newProducts = [...products];
                                newProducts[uploadingIndex] = { ...newProducts[uploadingIndex], image: url };
                                updateData('products', newProducts);
                            });
                        }
                        setUploadingIndex(null);
                        e.target.value = '';
                    }}
                />
            </div>
        );
    };

    // Services Carousel Fields (for Services Grid section)
    const renderServicesCarouselFields = () => {
        const categories = data.categories || [];
        
        return (
            <div className="space-y-4">
                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-700">
                        <strong>Note:</strong> Service categories and services are managed from the Categories & Services sections. 
                        This block displays the data from those sections.
                    </p>
                </div>
                
                {/* Display Settings */}
                <div className="space-y-4 border-t border-gray-100 pt-4">
                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Display Settings</h4>
                    
                    {/* Columns */}
                    <div>
                        <label className="block text-xs text-gray-500 mb-1.5">Columns</label>
                        <select
                            value={data.columns || 4}
                            onChange={(e) => updateData('columns', parseInt(e.target.value))}
                            className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm bg-white focus:border-[#c9a962] focus:outline-none"
                        >
                            <option value={2}>2 Columns</option>
                            <option value={3}>3 Columns</option>
                            <option value={4}>4 Columns</option>
                        </select>
                    </div>
                    
                    {/* Toggle Options */}
                    <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.showCategoryImages !== false}
                                onChange={(e) => updateData('showCategoryImages', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-[#c9a962] focus:ring-[#c9a962]"
                            />
                            <span className="text-sm text-gray-700">Show Category Images</span>
                        </label>
                        
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.showServicesList !== false}
                                onChange={(e) => updateData('showServicesList', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-[#c9a962] focus:ring-[#c9a962]"
                            />
                            <span className="text-sm text-gray-700">Show Services List</span>
                        </label>
                    </div>
                </div>
                
                {/* Preview of categories */}
                {categories.length > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
                            Categories Preview ({categories.length})
                        </h4>
                        <div className="space-y-2">
                            {categories.map((cat: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    {cat.image && (
                                        <img 
                                            src={cat.image.startsWith('/') ? cat.image : `/${cat.image}`}
                                            alt={cat.name}
                                            className="w-10 h-10 rounded-lg object-cover"
                                        />
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">{cat.name}</p>
                                        <p className="text-xs text-gray-500">{cat.services?.length || 0} services</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Team Images Fields (for Team section)
    const renderTeamImagesFields = () => {
        
        const handleTeamImageUpload = async (field: string, file: File) => {
            setUploadingField(field);
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('type', 'section');
                
                const response = await fetch('/admin/media/upload', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });
                
                if (response.ok) {
                    const result = await response.json();
                    updateData(field, result.path);
                }
            } catch (error) {
                console.error('Upload failed:', error);
            } finally {
                setUploadingField(null);
            }
        };
        
        const renderTeamImageCard = (
            field: string, 
            label: string, 
            altField: string, 
            description: string,
            position: 'left' | 'right' | 'badge' | 'product'
        ) => {
            const positionStyles = {
                left: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200',
                right: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200',
                badge: 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200',
                product: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200',
            };
            
            return (
                <div className={`relative rounded-xl border overflow-hidden ${positionStyles[position]}`}>
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-white/50">
                        <h4 className="text-sm font-semibold text-gray-800">{label}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                    </div>
                    
                    {/* Body */}
                    <div className="p-4">
                        <div className="flex gap-4">
                            {/* Image Preview */}
                            <div className="w-32 flex-shrink-0">
                                {data[field] ? (
                                    <div className="relative group">
                                        <img
                                            src={data[field].startsWith('/') ? data[field] : `/${data[field]}`}
                                            alt={data[altField] || label}
                                            className="w-32 h-32 object-cover rounded-lg shadow-md border border-white"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                            <label className="p-2 bg-white rounded-full cursor-pointer hover:bg-gray-100 shadow-md">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleTeamImageUpload(field, file);
                                                    }}
                                                />
                                                <Upload className="w-4 h-4 text-gray-700" />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => updateData(field, '')}
                                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {uploadingField === field && (
                                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                                                <span className="text-sm text-gray-600">Uploading...</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-32 h-32 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#c9a962] hover:bg-amber-50/50 transition-all shadow-sm">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleTeamImageUpload(field, file);
                                            }}
                                        />
                                        {uploadingField === field ? (
                                            <span className="text-xs text-gray-500">Uploading...</span>
                                        ) : (
                                            <>
                                                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                                <span className="text-xs text-gray-500 text-center px-2">Click to upload</span>
                                            </>
                                        )}
                                    </label>
                                )}
                            </div>
                            
                            {/* Fields */}
                            <div className="flex-1 space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
                                    <input
                                        type="text"
                                        value={data[field] || ''}
                                        onChange={(e) => updateData(field, e.target.value)}
                                        className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm bg-white focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]/20"
                                        placeholder="/images/team-image.png"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Alt Text (SEO)</label>
                                    <input
                                        type="text"
                                        value={data[altField] || ''}
                                        onChange={(e) => updateData(altField, e.target.value)}
                                        className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm bg-white focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]/20"
                                        placeholder="Describe the image for accessibility"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };
        
        return (
            <div className="space-y-4">
                {/* Preview Card - Shows how images will look */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Layout Preview</h4>
                    <div className="relative h-48 bg-[#f5f4f0] rounded-lg overflow-hidden">
                        {/* Top-left image preview */}
                        {data.primaryImage && (
                            <div className="absolute top-2 left-2 w-20 h-20 rounded-lg overflow-hidden shadow-lg border-2 border-white">
                                <img 
                                    src={data.primaryImage.startsWith('/') ? data.primaryImage : `/${data.primaryImage}`} 
                                    alt="Primary" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        {/* Bottom-right image preview */}
                        {data.secondaryImage && (
                            <div className="absolute bottom-2 right-2 w-24 h-28 rounded-lg overflow-hidden shadow-lg border-2 border-white">
                                <img 
                                    src={data.secondaryImage.startsWith('/') ? data.secondaryImage : `/${data.secondaryImage}`} 
                                    alt="Secondary" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        {/* Badge preview */}
                        {data.badgeImage && (
                            <div className="absolute top-2 left-24 w-12 h-12 rounded-full overflow-hidden shadow-lg border-2 border-white">
                                <img 
                                    src={data.badgeImage.startsWith('/') ? data.badgeImage : `/${data.badgeImage}`} 
                                    alt="Badge" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        {!data.primaryImage && !data.secondaryImage && (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                Upload images to see preview
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Image Cards */}
                <div className="grid grid-cols-1 gap-4">
                    {renderTeamImageCard(
                        'primaryImage', 
                        'Primary Image', 
                        'primaryAlt', 
                        'Top-left overlapping card (e.g., consultation image)',
                        'left'
                    )}
                    
                    {renderTeamImageCard(
                        'secondaryImage', 
                        'Secondary Image', 
                        'secondaryAlt', 
                        'Bottom-right main card (e.g., team photo)',
                        'right'
                    )}
                    
                    {renderTeamImageCard(
                        'badgeImage', 
                        'Badge/Logo', 
                        'badgeAlt', 
                        'Optional badge or logo overlay',
                        'badge'
                    )}
                    
                    {renderTeamImageCard(
                        'productImage', 
                        'Product Image', 
                        'productAlt', 
                        'Optional product vial or item image',
                        'product'
                    )}
                </div>
            </div>
        );
    };

    // Testimonials Carousel Fields (for Happy Customers section)
    const renderTestimonialsCarouselFields = () => {
        const testimonials = data.testimonials || [];
        
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Testimonials ({testimonials.length})
                    </label>
                    <button
                        type="button"
                        onClick={() => {
                            updateData('testimonials', [...testimonials, { 
                                name: '', 
                                role: '', 
                                quote: '', 
                                rating: 5, 
                                image: '' 
                            }]);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-[#c9a962] rounded hover:bg-[#b08d4a]"
                    >
                        <Plus className="h-3 w-3" />
                        Add Testimonial
                    </button>
                </div>
                <p className="text-xs text-gray-500">
                    Customer testimonials displayed in a carousel on the frontend.
                </p>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {testimonials.map((testimonial: any, idx: number) => (
                        <div key={idx} className="relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            {/* Testimonial Header */}
                            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
                                <span className="text-xs font-semibold text-gray-700">
                                    #{idx + 1} {testimonial.name && `- ${testimonial.name}`}
                                </span>
                                <div className="flex items-center gap-1">
                                    {idx > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newItems = [...testimonials];
                                                [newItems[idx - 1], newItems[idx]] = [newItems[idx], newItems[idx - 1]];
                                                updateData('testimonials', newItems);
                                            }}
                                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                            title="Move up"
                                        >
                                            <ChevronUp className="h-3 w-3" />
                                        </button>
                                    )}
                                    {idx < testimonials.length - 1 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newItems = [...testimonials];
                                                [newItems[idx], newItems[idx + 1]] = [newItems[idx + 1], newItems[idx]];
                                                updateData('testimonials', newItems);
                                            }}
                                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                            title="Move down"
                                        >
                                            <ChevronDown className="h-3 w-3" />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            updateData('testimonials', testimonials.filter((_: any, i: number) => i !== idx));
                                        }}
                                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                                        title="Remove"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                            {/* Testimonial Body */}
                            <div className="p-3">
                                <div className="flex gap-3">
                                    {/* Image */}
                                    <div className="w-16 flex-shrink-0">
                                        {testimonial.image ? (
                                            <div className="relative w-16 h-16 rounded-full overflow-hidden group border border-gray-200">
                                                <img
                                                    src={testimonial.image.startsWith('/') ? testimonial.image : `/${testimonial.image}`}
                                                    alt={testimonial.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setUploadingTestimonialIdx(idx);
                                                        testimonialImageRef.current?.click();
                                                    }}
                                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center"
                                                >
                                                    <Upload className="h-4 w-4 text-white" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUploadingTestimonialIdx(idx);
                                                    testimonialImageRef.current?.click();
                                                }}
                                                className="w-16 h-16 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#c9a962] hover:border-[#c9a962]"
                                            >
                                                <Upload className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    {/* Fields */}
                                    <div className="flex-1 space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                value={testimonial.name || ''}
                                                onChange={(e) => {
                                                    const newItems = [...testimonials];
                                                    newItems[idx] = { ...testimonial, name: e.target.value };
                                                    updateData('testimonials', newItems);
                                                }}
                                                className="w-full h-8 rounded border border-gray-200 px-2 text-xs focus:border-[#c9a962] focus:outline-none"
                                                placeholder="Customer name"
                                            />
                                            <input
                                                type="text"
                                                value={testimonial.role || ''}
                                                onChange={(e) => {
                                                    const newItems = [...testimonials];
                                                    newItems[idx] = { ...testimonial, role: e.target.value };
                                                    updateData('testimonials', newItems);
                                                }}
                                                className="w-full h-8 rounded border border-gray-200 px-2 text-xs focus:border-[#c9a962] focus:outline-none"
                                                placeholder="Role/Program"
                                            />
                                        </div>
                                        <textarea
                                            value={testimonial.quote || ''}
                                            onChange={(e) => {
                                                const newItems = [...testimonials];
                                                newItems[idx] = { ...testimonial, quote: e.target.value };
                                                updateData('testimonials', newItems);
                                            }}
                                            className="w-full h-16 rounded border border-gray-200 px-2 py-1 text-xs resize-none focus:border-[#c9a962] focus:outline-none"
                                            placeholder="Testimonial quote..."
                                        />
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">Rating:</span>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => {
                                                            const newItems = [...testimonials];
                                                            newItems[idx] = { ...testimonial, rating: star };
                                                            updateData('testimonials', newItems);
                                                        }}
                                                        className={`text-lg ${star <= (testimonial.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}`}
                                                    >
                                                        ★
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Settings */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                        <input
                            type="checkbox"
                            checked={data.autoPlay !== false}
                            onChange={(e) => updateData('autoPlay', e.target.checked)}
                            className="rounded border-gray-300 text-[#c9a962] focus:ring-[#c9a962]"
                        />
                        Auto-play
                    </label>
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                        <input
                            type="checkbox"
                            checked={data.showRating !== false}
                            onChange={(e) => updateData('showRating', e.target.checked)}
                            className="rounded border-gray-300 text-[#c9a962] focus:ring-[#c9a962]"
                        />
                        Show ratings
                    </label>
                </div>
                {/* Hidden file input */}
                <input
                    ref={testimonialImageRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && uploadingTestimonialIdx !== null) {
                            handleImageUpload(file, (url) => {
                                const newItems = [...testimonials];
                                newItems[uploadingTestimonialIdx] = { ...newItems[uploadingTestimonialIdx], image: url };
                                updateData('testimonials', newItems);
                            });
                        }
                        setUploadingTestimonialIdx(null);
                        e.target.value = '';
                    }}
                />
            </div>
        );
    };

    // FAQ List Fields
    const renderFaqListFields = () => {
        const items = data.items || [];
        
        const swapItems = (idx1: number, idx2: number) => {
            const newItems = [...items];
            [newItems[idx1], newItems[idx2]] = [newItems[idx2], newItems[idx1]];
            updateData('items', newItems);
        };
        
        return (
            <div className="space-y-6">
                {/* Section Header Fields */}
                <SectionHeaderFields
                    preTitle={data.preTitle || ''}
                    preTitlePlaceholder="GOT QUESTIONS?"
                    title={data.title || ''}
                    titlePlaceholder="Frequently Asked Questions"
                    description={data.description || ''}
                    descriptionPlaceholder="Find answers to common questions..."
                    onPreTitleChange={(val) => updateData('preTitle', val)}
                    onTitleChange={(val) => updateData('title', val)}
                    onDescriptionChange={(val) => updateData('description', val)}
                    variant="amber"
                />

                {/* FAQ Items */}
                <div className="space-y-3">
                    <ListHeader
                        label="FAQ Items"
                        count={items.length}
                        onAdd={() => updateData('items', [...items, { question: '', answer: '' }])}
                        addLabel="Add FAQ"
                    />
                    
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {items.map((item: any, idx: number) => (
                            <div key={idx} className={styles.itemCard}>
                                <div className="flex items-start gap-2">
                                    <ListItemControls
                                        index={idx}
                                        total={items.length}
                                        onMoveUp={() => swapItems(idx, idx - 1)}
                                        onMoveDown={() => swapItems(idx, idx + 1)}
                                        onDelete={() => updateData('items', items.filter((_: any, i: number) => i !== idx))}
                                        layout="sidebar"
                                    />
                                    <div className="flex-1 space-y-2">
                                        <TextInput
                                            value={item.question || ''}
                                            onChange={(val) => {
                                                const newItems = [...items];
                                                newItems[idx] = { ...item, question: val };
                                                updateData('items', newItems);
                                            }}
                                            size="compact"
                                            placeholder="Question"
                                            className="font-medium"
                                        />
                                        <Textarea
                                            value={item.answer || ''}
                                            onChange={(val) => {
                                                const newItems = [...items];
                                                newItems[idx] = { ...item, answer: val };
                                                updateData('items', newItems);
                                            }}
                                            size="xs"
                                            rows={2}
                                            placeholder="Answer"
                                        />
                                    </div>
                                    <DeleteButton onClick={() => updateData('items', items.filter((_: any, i: number) => i !== idx))} />
                                </div>
                            </div>
                        ))}
                        {items.length === 0 && (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                No FAQ items yet. Click "Add FAQ" to create one.
                            </div>
                        )}
                    </div>
                </div>

                {/* CTA Section */}
                <SectionHeaderFields
                    preTitle={data.ctaTitle || ''}
                    preTitlePlaceholder="Still have questions?"
                    title={data.ctaDescription || ''}
                    titlePlaceholder="Our support team is here to help."
                    onPreTitleChange={(val) => updateData('ctaTitle', val)}
                    onTitleChange={(val) => updateData('ctaDescription', val)}
                    variant="blue"
                    headerTitle="Call to Action"
                    showDescription={false}
                />
                <div className="grid grid-cols-2 gap-3 -mt-3">
                    <FormField label="Button Text">
                        <TextInput
                            value={data.ctaText || ''}
                            onChange={(val) => updateData('ctaText', val)}
                            size="small"
                            placeholder="Contact Support"
                        />
                    </FormField>
                    <FormField label="Button Link">
                        <TextInput
                            value={data.ctaLink || ''}
                            onChange={(val) => updateData('ctaLink', val)}
                            size="small"
                            placeholder="/contact"
                        />
                    </FormField>
                </div>
            </div>
        );
    };

    // Contact Info Fields
    const renderContactInfoFields = () => {
        const contactImageRef = useRef<HTMLInputElement>(null);
        
        return (
            <div className="space-y-6">
                {/* Section Header */}
                <div className="space-y-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <h4 className="text-sm font-semibold text-green-800">Section Header</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Pre-Title
                            </label>
                            <input
                                type="text"
                                value={data.preTitle || ''}
                                onChange={(e) => updateData('preTitle', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="GET IN TOUCH"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Title
                            </label>
                            <input
                                type="text"
                                value={data.title || ''}
                                onChange={(e) => updateData('title', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="We Would Love To Hear From You"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Description
                        </label>
                        <textarea
                            value={data.description || ''}
                            onChange={(e) => updateData('description', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#c9a962] focus:outline-none resize-none"
                            rows={2}
                            placeholder="Have questions about our services?"
                        />
                    </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <h4 className="text-sm font-semibold text-blue-800">Contact Details</h4>
                    
                    {/* Phone */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                value={data.phone || ''}
                                onChange={(e) => updateData('phone', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="1-800-HYVE-RX"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Phone Hours
                            </label>
                            <input
                                type="text"
                                value={data.phoneHours || ''}
                                onChange={(e) => updateData('phoneHours', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="Mon-Fri 8am to 8pm EST"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={data.email || ''}
                                onChange={(e) => updateData('email', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="support@hyverx.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Email Response Time
                            </label>
                            <input
                                type="text"
                                value={data.emailResponse || ''}
                                onChange={(e) => updateData('emailResponse', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="We'll respond within 24 hours"
                            />
                        </div>
                    </div>

                    {/* Hours */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Support Hours
                            </label>
                            <input
                                type="text"
                                value={data.hours || ''}
                                onChange={(e) => updateData('hours', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="24/7 Support"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Hours Description
                            </label>
                            <input
                                type="text"
                                value={data.hoursDescription || ''}
                                onChange={(e) => updateData('hoursDescription', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="Always here when you need us"
                            />
                        </div>
                    </div>
                </div>

                {/* Image Section */}
                <div className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <h4 className="text-sm font-semibold text-purple-800">Featured Image</h4>
                    
                    <div className="flex gap-4">
                        {/* Image Preview */}
                        <div className="w-32 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
                            {data.image ? (
                                <img
                                    src={data.image}
                                    alt="Contact section"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <ImageIcon className="h-8 w-8" />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1 space-y-2">
                            <button
                                type="button"
                                onClick={() => contactImageRef.current?.click()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#c9a962] rounded-lg hover:bg-[#b08d4a]"
                            >
                                <Upload className="h-3 w-3" />
                                Upload Image
                            </button>
                            <div className="grid grid-cols-1 gap-2">
                                <input
                                    type="text"
                                    value={data.imageTitle || ''}
                                    onChange={(e) => updateData('imageTitle', e.target.value)}
                                    className="w-full h-8 rounded border border-gray-200 px-2 text-xs focus:border-[#c9a962] focus:outline-none"
                                    placeholder="Image title (e.g. Start Your Journey Today)"
                                />
                                <input
                                    type="text"
                                    value={data.imageSubtitle || ''}
                                    onChange={(e) => updateData('imageSubtitle', e.target.value)}
                                    className="w-full h-8 rounded border border-gray-200 px-2 text-xs focus:border-[#c9a962] focus:outline-none"
                                    placeholder="Image subtitle"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <input
                        ref={contactImageRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                handleImageUpload(file, (url) => {
                                    updateData('image', url);
                                });
                            }
                            e.target.value = '';
                        }}
                    />
                </div>
            </div>
        );
    };

    // About Hero Fields
    const renderAboutHeroFields = () => {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="space-y-4 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-800">Hero Content</h4>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Pre-Title
                        </label>
                        <input
                            type="text"
                            value={data.preTitle || ''}
                            onChange={(e) => updateData('preTitle', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            placeholder="HERE TO SERVE"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Title
                        </label>
                        <input
                            type="text"
                            value={data.title || ''}
                            onChange={(e) => updateData('title', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            placeholder="About Us"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Description
                        </label>
                        <textarea
                            value={data.description || ''}
                            onChange={(e) => updateData('description', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#c9a962] focus:outline-none resize-none"
                            rows={3}
                            placeholder="Pioneering the future of personalized telehealth..."
                        />
                    </div>
                </div>

                {/* CTAs */}
                <div className="space-y-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                    <h4 className="text-sm font-semibold text-amber-800">Call to Action Buttons</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Primary Button Text
                            </label>
                            <input
                                type="text"
                                value={data.primaryCtaText || ''}
                                onChange={(e) => updateData('primaryCtaText', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="OUR TEAM"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Primary Button Link
                            </label>
                            <input
                                type="text"
                                value={data.primaryCtaLink || ''}
                                onChange={(e) => updateData('primaryCtaLink', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="#team"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Secondary Button Text
                            </label>
                            <input
                                type="text"
                                value={data.secondaryCtaText || ''}
                                onChange={(e) => updateData('secondaryCtaText', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="WHAT TO EXPECT"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Secondary Button Link
                            </label>
                            <input
                                type="text"
                                value={data.secondaryCtaLink || ''}
                                onChange={(e) => updateData('secondaryCtaLink', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="#what-to-expect"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Mission Section Fields
    const renderMissionSectionFields = () => {
        const missionImageRef = useRef<HTMLInputElement>(null);
        const points = data.points || [];

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="space-y-4 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-100">
                    <h4 className="text-sm font-semibold text-rose-800">Mission Content</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Pre-Title
                            </label>
                            <input
                                type="text"
                                value={data.preTitle || ''}
                                onChange={(e) => updateData('preTitle', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="OUR MISSION"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Title
                            </label>
                            <input
                                type="text"
                                value={data.title || ''}
                                onChange={(e) => updateData('title', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="Transforming Healthcare..."
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Primary Description
                        </label>
                        <textarea
                            value={data.description || ''}
                            onChange={(e) => updateData('description', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#c9a962] focus:outline-none resize-none"
                            rows={3}
                            placeholder="We launched Hyve Wellness with a simple ambition..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Secondary Description
                        </label>
                        <textarea
                            value={data.secondaryDescription || ''}
                            onChange={(e) => updateData('secondaryDescription', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#c9a962] focus:outline-none resize-none"
                            rows={3}
                            placeholder="Our founders believe everyone deserves..."
                        />
                    </div>
                </div>

                {/* Image */}
                <div className="space-y-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                    <h4 className="text-sm font-semibold text-purple-800">Mission Image</h4>
                    <div className="flex gap-4">
                        <div className="w-32 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
                            {data.image ? (
                                <img src={data.image} alt="Mission" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <ImageIcon className="h-8 w-8" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <button
                                type="button"
                                onClick={() => missionImageRef.current?.click()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#c9a962] rounded-lg hover:bg-[#b08d4a]"
                            >
                                <Upload className="h-3 w-3" />
                                Upload Image
                            </button>
                        </div>
                    </div>
                    <input
                        ref={missionImageRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                handleImageUpload(file, (url) => updateData('image', url));
                            }
                            e.target.value = '';
                        }}
                    />
                </div>

                {/* Feature Points */}
                <div className="space-y-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-green-800">Feature Points ({points.length})</h4>
                        <button
                            type="button"
                            onClick={() => updateData('points', [...points, { text: '' }])}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
                        >
                            <Plus className="h-3 w-3" />
                            Add Point
                        </button>
                    </div>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {points.map((point: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                                <span className="text-green-600 text-sm">✓</span>
                                <input
                                    type="text"
                                    value={point.text || ''}
                                    onChange={(e) => {
                                        const newPoints = [...points];
                                        newPoints[idx] = { text: e.target.value };
                                        updateData('points', newPoints);
                                    }}
                                    className="flex-1 h-8 rounded border border-gray-200 px-2 text-sm focus:border-[#c9a962] focus:outline-none"
                                    placeholder="Feature point text"
                                />
                                <button
                                    type="button"
                                    onClick={() => updateData('points', points.filter((_: any, i: number) => i !== idx))}
                                    className="p-1 text-red-400 hover:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Values Cards Fields
    const renderValuesCardsFields = () => {
        const items = data.items || [];

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="space-y-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                    <h4 className="text-sm font-semibold text-amber-800">Section Header</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Pre-Title
                            </label>
                            <input
                                type="text"
                                value={data.preTitle || ''}
                                onChange={(e) => updateData('preTitle', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="OUR VALUES"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Title
                            </label>
                            <input
                                type="text"
                                value={data.title || ''}
                                onChange={(e) => updateData('title', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="What Drives Us"
                            />
                        </div>
                    </div>
                </div>

                {/* Value Cards */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Value Cards ({items.length})
                        </label>
                        <button
                            type="button"
                            onClick={() => updateData('items', [...items, { icon: 'star', title: '', description: '' }])}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-[#c9a962] rounded hover:bg-[#b08d4a]"
                        >
                            <Plus className="h-3 w-3" />
                            Add Value
                        </button>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {items.map((item: any, idx: number) => (
                            <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-start gap-2">
                                    <div className="flex flex-col gap-1 mt-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (idx === 0) return;
                                                const newItems = [...items];
                                                [newItems[idx], newItems[idx - 1]] = [newItems[idx - 1], newItems[idx]];
                                                updateData('items', newItems);
                                            }}
                                            disabled={idx === 0}
                                            className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                        >
                                            <ChevronUp className="h-3 w-3" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (idx === items.length - 1) return;
                                                const newItems = [...items];
                                                [newItems[idx], newItems[idx + 1]] = [newItems[idx + 1], newItems[idx]];
                                                updateData('items', newItems);
                                            }}
                                            disabled={idx === items.length - 1}
                                            className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                        >
                                            <ChevronDown className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="relative">
                                                <select
                                                    value={item.icon || 'star'}
                                                    onChange={(e) => {
                                                        const newItems = [...items];
                                                        newItems[idx] = { ...item, icon: e.target.value };
                                                        updateData('items', newItems);
                                                    }}
                                                    className="h-8 w-full rounded border border-gray-200 px-2 text-sm focus:border-[#c9a962] focus:outline-none appearance-none bg-white"
                                                >
                                                    <option value="target">🎯 Target</option>
                                                    <option value="zap">⚡ Zap</option>
                                                    <option value="shield-check">🛡️ Shield Check</option>
                                                    <option value="diamond">💎 Diamond</option>
                                                    <option value="star">⭐ Star</option>
                                                    <option value="heart">❤️ Heart</option>
                                                    <option value="award">🏆 Award</option>
                                                    <option value="users">👥 Users</option>
                                                    <option value="clock">⏰ Clock</option>
                                                    <option value="check-circle">✅ Check Circle</option>
                                                    <option value="thumbs-up">👍 Thumbs Up</option>
                                                    <option value="trending-up">📈 Trending Up</option>
                                                    <option value="gift">🎁 Gift</option>
                                                    <option value="sparkles">✨ Sparkles</option>
                                                    <option value="lightbulb">💡 Lightbulb</option>
                                                    <option value="rocket">🚀 Rocket</option>
                                                    <option value="globe">🌍 Globe</option>
                                                    <option value="lock">🔒 Lock</option>
                                                    <option value="medal">🏅 Medal</option>
                                                    <option value="crown">👑 Crown</option>
                                                </select>
                                            </div>
                                            <input
                                                type="text"
                                                value={item.title || ''}
                                                onChange={(e) => {
                                                    const newItems = [...items];
                                                    newItems[idx] = { ...item, title: e.target.value };
                                                    updateData('items', newItems);
                                                }}
                                                className="h-8 rounded border border-gray-200 px-2 text-sm font-medium focus:border-[#c9a962] focus:outline-none"
                                                placeholder="Title"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            value={item.description || ''}
                                            onChange={(e) => {
                                                const newItems = [...items];
                                                newItems[idx] = { ...item, description: e.target.value };
                                                updateData('items', newItems);
                                            }}
                                            className="w-full h-8 rounded border border-gray-200 px-2 text-xs focus:border-[#c9a962] focus:outline-none"
                                            placeholder="Description"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => updateData('items', items.filter((_: any, i: number) => i !== idx))}
                                        className="p-1 text-red-400 hover:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Process Steps Fields
    const renderProcessStepsFields = () => {
        const steps = data.steps || [];

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                    <h4 className="text-sm font-semibold text-blue-800">Section Header</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Pre-Title
                            </label>
                            <input
                                type="text"
                                value={data.preTitle || ''}
                                onChange={(e) => updateData('preTitle', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="PLANNING YOUR VISIT"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Title
                            </label>
                            <input
                                type="text"
                                value={data.title || ''}
                                onChange={(e) => updateData('title', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="What to Expect"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Description
                        </label>
                        <textarea
                            value={data.description || ''}
                            onChange={(e) => updateData('description', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#c9a962] focus:outline-none resize-none"
                            rows={2}
                            placeholder="When you connect with us..."
                        />
                    </div>
                </div>

                {/* Process Steps */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Steps ({steps.length})
                        </label>
                        <button
                            type="button"
                            onClick={() => updateData('steps', [...steps, { step: String(steps.length + 1).padStart(2, '0'), title: '', description: ['', '', ''], image: '' }])}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-[#c9a962] rounded hover:bg-[#b08d4a]"
                        >
                            <Plus className="h-3 w-3" />
                            Add Step
                        </button>
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {steps.map((step: any, idx: number) => (
                            <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-start gap-3">
                                    {/* Step Image */}
                                    <div 
                                        className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0 cursor-pointer hover:border-[#c9a962] transition-colors"
                                        onClick={() => {
                                            setUploadingStepIdx(idx);
                                            stepImageRef.current?.click();
                                        }}
                                    >
                                        {step.image ? (
                                            <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <ImageIcon className="h-6 w-6" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={step.step || ''}
                                                onChange={(e) => {
                                                    const newSteps = [...steps];
                                                    newSteps[idx] = { ...step, step: e.target.value };
                                                    updateData('steps', newSteps);
                                                }}
                                                className="w-16 h-8 rounded border border-gray-200 px-2 text-sm text-center font-bold focus:border-[#c9a962] focus:outline-none"
                                                placeholder="01"
                                            />
                                            <input
                                                type="text"
                                                value={step.title || ''}
                                                onChange={(e) => {
                                                    const newSteps = [...steps];
                                                    newSteps[idx] = { ...step, title: e.target.value };
                                                    updateData('steps', newSteps);
                                                }}
                                                className="flex-1 h-8 rounded border border-gray-200 px-2 text-sm font-medium focus:border-[#c9a962] focus:outline-none"
                                                placeholder="Step title"
                                            />
                                        </div>
                                        <textarea
                                            value={Array.isArray(step.description) ? step.description.join('\n') : step.description || ''}
                                            onChange={(e) => {
                                                const newSteps = [...steps];
                                                newSteps[idx] = { ...step, description: e.target.value.split('\n') };
                                                updateData('steps', newSteps);
                                            }}
                                            className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs focus:border-[#c9a962] focus:outline-none resize-none"
                                            rows={3}
                                            placeholder="Description (one line per row)"
                                        />
                                    </div>
                                    
                                    <button
                                        type="button"
                                        onClick={() => updateData('steps', steps.filter((_: any, i: number) => i !== idx))}
                                        className="p-1 text-red-400 hover:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <input
                    ref={stepImageRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && uploadingStepIdx !== null) {
                            handleImageUpload(file, (url) => {
                                const newSteps = [...steps];
                                newSteps[uploadingStepIdx] = { ...newSteps[uploadingStepIdx], image: url };
                                updateData('steps', newSteps);
                            });
                        }
                        setUploadingStepIdx(null);
                        e.target.value = '';
                    }}
                />
            </div>
        );
    };

    // CTA Section Fields
    const renderCtaSectionFields = () => {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="space-y-4 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-800">CTA Content</h4>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Pre-Title
                        </label>
                        <input
                            type="text"
                            value={data.preTitle || ''}
                            onChange={(e) => updateData('preTitle', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            placeholder="START YOUR JOURNEY"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Title
                        </label>
                        <input
                            type="text"
                            value={data.title || ''}
                            onChange={(e) => updateData('title', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            placeholder="Ready to Start Your Transformation?"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Description
                        </label>
                        <textarea
                            value={data.description || ''}
                            onChange={(e) => updateData('description', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#c9a962] focus:outline-none resize-none"
                            rows={2}
                            placeholder="Join thousands of satisfied patients..."
                        />
                    </div>
                </div>

                {/* CTAs */}
                <div className="space-y-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                    <h4 className="text-sm font-semibold text-amber-800">Action Buttons</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Primary Button Text
                            </label>
                            <input
                                type="text"
                                value={data.primaryCtaText || ''}
                                onChange={(e) => updateData('primaryCtaText', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="GET STARTED TODAY"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Primary Button Link
                            </label>
                            <input
                                type="text"
                                value={data.primaryCtaLink || ''}
                                onChange={(e) => updateData('primaryCtaLink', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="/services"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Secondary Button Text
                            </label>
                            <input
                                type="text"
                                value={data.secondaryCtaText || ''}
                                onChange={(e) => updateData('secondaryCtaText', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="CONTACT US"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Secondary Button Link
                            </label>
                            <input
                                type="text"
                                value={data.secondaryCtaLink || ''}
                                onChange={(e) => updateData('secondaryCtaLink', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="/contact"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Services Hero Fields
    const renderServicesHeroFields = () => {
        return (
            <div className="space-y-6">
                {/* Header Content */}
                <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <h4 className="text-sm font-semibold text-blue-800">Hero Content</h4>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Pre-Title
                        </label>
                        <input
                            type="text"
                            value={data.preTitle || ''}
                            onChange={(e) => updateData('preTitle', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            placeholder="OUR SERVICES"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Title
                            </label>
                            <input
                                type="text"
                                value={data.title || ''}
                                onChange={(e) => updateData('title', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="A renewing experience"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Title Highlight
                            </label>
                            <input
                                type="text"
                                value={data.titleHighlight || ''}
                                onChange={(e) => updateData('titleHighlight', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="awaits you."
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Description (optional)
                        </label>
                        <textarea
                            value={data.description || ''}
                            onChange={(e) => updateData('description', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#c9a962] focus:outline-none resize-none"
                            rows={2}
                            placeholder="Optional description text..."
                        />
                    </div>
                </div>
            </div>
        );
    };

    // Services Categories Fields
    const renderServicesCategoriesFields = () => {
        const categories = data.categories || [];

        return (
            <div className="space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Service Categories ({categories.length})
                        </label>
                        <button
                            type="button"
                            onClick={() => updateData('categories', [...categories, { name: '', slug: '', description: '', image: '' }])}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-[#c9a962] rounded hover:bg-[#b08d4a]"
                        >
                            <Plus className="h-3 w-3" />
                            Add Category
                        </button>
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {categories.map((cat: any, idx: number) => (
                            <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-xs font-medium text-gray-400">Category {idx + 1}</span>
                                    <button
                                        type="button"
                                        onClick={() => updateData('categories', categories.filter((_: any, i: number) => i !== idx))}
                                        className="p-1 text-red-400 hover:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={cat.name || ''}
                                            onChange={(e) => {
                                                const newCats = [...categories];
                                                newCats[idx] = { ...cat, name: e.target.value };
                                                updateData('categories', newCats);
                                            }}
                                            className="w-full h-8 rounded border border-gray-200 px-2 text-sm focus:border-[#c9a962] focus:outline-none"
                                            placeholder="Category Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Slug</label>
                                        <input
                                            type="text"
                                            value={cat.slug || ''}
                                            onChange={(e) => {
                                                const newCats = [...categories];
                                                newCats[idx] = { ...cat, slug: e.target.value };
                                                updateData('categories', newCats);
                                            }}
                                            className="w-full h-8 rounded border border-gray-200 px-2 text-sm focus:border-[#c9a962] focus:outline-none"
                                            placeholder="category-slug"
                                        />
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="block text-xs text-gray-500 mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={cat.description || ''}
                                        onChange={(e) => {
                                            const newCats = [...categories];
                                            newCats[idx] = { ...cat, description: e.target.value };
                                            updateData('categories', newCats);
                                        }}
                                        className="w-full h-8 rounded border border-gray-200 px-2 text-sm focus:border-[#c9a962] focus:outline-none"
                                        placeholder="Category description..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Image URL (optional)</label>
                                    <input
                                        type="text"
                                        value={cat.image || ''}
                                        onChange={(e) => {
                                            const newCats = [...categories];
                                            newCats[idx] = { ...cat, image: e.target.value };
                                            updateData('categories', newCats);
                                        }}
                                        className="w-full h-8 rounded border border-gray-200 px-2 text-sm focus:border-[#c9a962] focus:outline-none"
                                        placeholder="/images/category.jpg"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400">
                        First category should be "All" with slug "all" to show all services. Categories filter the services list.
                    </p>
                </div>
            </div>
        );
    };

    // Services Grid Fields - for inline service management
    const renderServicesGridFields = () => {
        const services = data.services || [];
        const categories = [
            { name: 'All', slug: 'all' },
            { name: 'Weight Loss', slug: 'weight-loss' },
            { name: 'Sexual Health', slug: 'sexual-health' },
            { name: 'Longevity', slug: 'longevity' },
            { name: 'Hair', slug: 'hair' },
            { name: 'Skin', slug: 'skin' },
            { name: 'Brain & Mood', slug: 'brain-and-mood' },
            { name: 'Hormones', slug: 'hormones' },
        ];

        // Get active category from component state (stored in data for persistence)
        const activeCategory = data._activeCategory || 'all';
        
        // Filter services by category
        const filteredServices = activeCategory === 'all' 
            ? services 
            : services.filter((s: any) => s.categorySlug === activeCategory);
        
        // Get service count per category
        const getCategoryCount = (slug: string) => {
            if (slug === 'all') return services.length;
            return services.filter((s: any) => s.categorySlug === slug).length;
        };

        const generateId = () => `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const setActiveCategory = (slug: string) => {
            updateData('_activeCategory', slug);
        };

        const addService = () => {
            const newCategorySlug = activeCategory === 'all' ? 'weight-loss' : activeCategory;
            const newCategory = categories.find(c => c.slug === newCategorySlug);
            updateData('services', [
                ...services,
                {
                    id: generateId(),
                    name: '',
                    slug: '',
                    category: newCategory?.name || 'Weight Loss',
                    categorySlug: newCategorySlug,
                    description: '',
                    headline: '',
                    pricing: '',
                    image: '',
                    isPopular: false,
                    getStartedUrl: '',
                }
            ]);
        };

        const updateService = (serviceId: string, field: string, value: any) => {
            const newServices = services.map((s: any) => {
                if (s.id !== serviceId) return s;
                const updated = { ...s, [field]: value };
                
                // Auto-generate slug from name
                if (field === 'name' && typeof value === 'string') {
                    updated.slug = generateSlug(value);
                }
                
                // Update category name when slug changes
                if (field === 'categorySlug') {
                    const cat = categories.find(c => c.slug === value);
                    if (cat) {
                        updated.category = cat.name;
                    }
                }
                
                return updated;
            });
            updateData('services', newServices);
        };

        const removeService = (serviceId: string) => {
            updateData('services', services.filter((s: any) => s.id !== serviceId));
        };

        const duplicateService = (serviceId: string) => {
            const serviceToCopy = services.find((s: any) => s.id === serviceId);
            if (!serviceToCopy) return;
            
            const newService = { 
                ...serviceToCopy, 
                id: generateId(), 
                name: `${serviceToCopy.name} (copy)` 
            };
            newService.slug = generateSlug(newService.name);
            
            const idx = services.findIndex((s: any) => s.id === serviceId);
            const newServices = [...services];
            newServices.splice(idx + 1, 0, newService);
            updateData('services', newServices);
        };

        // Handle image upload
        const handleImageUpload = async (serviceId: string, file: File) => {
            // Create FormData for upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'services');

            try {
                const response = await fetch('/api/media/upload', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });

                if (response.ok) {
                    const result = await response.json();
                    updateService(serviceId, 'image', result.url || result.path);
                } else {
                    // Fallback: use local URL
                    const localUrl = URL.createObjectURL(file);
                    updateService(serviceId, 'image', localUrl);
                }
            } catch (error) {
                // Fallback: use local URL for preview
                const localUrl = URL.createObjectURL(file);
                updateService(serviceId, 'image', localUrl);
            }
        };

        return (
            <div className="space-y-6">
                {/* Section Header */}
                <div className="space-y-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                    <h4 className="text-sm font-semibold text-emerald-800">Section Settings</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Title</label>
                            <input
                                type="text"
                                value={data.title || ''}
                                onChange={(e) => updateData('title', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="Our Treatments"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Display Style</label>
                            <select
                                value={data.displayStyle || 'grid'}
                                onChange={(e) => updateData('displayStyle', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            >
                                <option value="grid">Grid</option>
                                <option value="list">List</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Description</label>
                        <textarea
                            value={data.description || ''}
                            onChange={(e) => updateData('description', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#c9a962] focus:outline-none resize-none"
                            rows={2}
                            placeholder="Browse our treatments..."
                        />
                    </div>
                </div>

                {/* Category Filter Tabs */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Filter by Category
                        </label>
                        <span className="text-xs text-gray-400">
                            Total: {services.length} services
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => {
                            const count = getCategoryCount(cat.slug);
                            const isActive = activeCategory === cat.slug;
                            return (
                                <button
                                    key={cat.slug}
                                    type="button"
                                    onClick={() => setActiveCategory(cat.slug)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                                        isActive
                                            ? 'bg-[#c9a962] text-white border-[#c9a962]'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-[#c9a962] hover:text-[#c9a962]'
                                    }`}
                                >
                                    {cat.name}
                                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                                        isActive ? 'bg-white/20' : 'bg-gray-100'
                                    }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Services List */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {activeCategory === 'all' ? 'All Services' : categories.find(c => c.slug === activeCategory)?.name} ({filteredServices.length})
                        </label>
                        <button
                            type="button"
                            onClick={addService}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#c9a962] rounded-lg hover:bg-[#b08d4a]"
                        >
                            <Plus className="h-3 w-3" />
                            Add Service
                        </button>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                        {filteredServices.map((service: any, idx: number) => (
                            <div key={service.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                {/* Service Header with Image Preview */}
                                <div className="flex items-start gap-3 mb-3 pb-3 border-b border-gray-100">
                                    {/* Image Preview */}
                                    <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0 relative group">
                                        {service.image ? (
                                            <>
                                                <img
                                                    src={service.image}
                                                    alt={service.name}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/images/placeholder.png';
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <label className="cursor-pointer p-1 bg-white rounded-full">
                                                        <Upload className="w-3 h-3 text-gray-600" />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) handleImageUpload(service.id, file);
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                            </>
                                        ) : (
                                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100">
                                                <Upload className="w-4 h-4 text-gray-400 mb-1" />
                                                <span className="text-[10px] text-gray-400">Upload</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleImageUpload(service.id, file);
                                                    }}
                                                />
                                            </label>
                                        )}
                                    </div>
                                    
                                    {/* Service Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-gray-700 truncate">
                                                {service.name || 'New Service'}
                                            </span>
                                            {service.isPopular && (
                                                <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">Popular</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span className="px-2 py-0.5 bg-gray-100 rounded">{service.category || 'No category'}</span>
                                            {service.pricing && <span>{service.pricing}</span>}
                                        </div>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => duplicateService(service.id)}
                                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"
                                            title="Duplicate"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeService(service.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Row 1: Name, Category, Popular */}
                                <div className="grid grid-cols-12 gap-2 mb-2">
                                    <div className="col-span-5">
                                        <label className="block text-xs text-gray-500 mb-1">Name *</label>
                                        <input
                                            type="text"
                                            value={service.name || ''}
                                            onChange={(e) => updateService(service.id, 'name', e.target.value)}
                                            className="w-full h-8 rounded border border-gray-200 px-2 text-sm focus:border-[#c9a962] focus:outline-none"
                                            placeholder="Semaglutide + B12"
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <label className="block text-xs text-gray-500 mb-1">Category</label>
                                        <select
                                            value={service.categorySlug || 'weight-loss'}
                                            onChange={(e) => updateService(service.id, 'categorySlug', e.target.value)}
                                            className="w-full h-8 rounded border border-gray-200 px-2 text-sm focus:border-[#c9a962] focus:outline-none"
                                        >
                                            {categories.filter(c => c.slug !== 'all').map(cat => (
                                                <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-3 flex items-end">
                                        <label className="flex items-center gap-2 h-8 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={service.isPopular || false}
                                                onChange={(e) => updateService(service.id, 'isPopular', e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 text-[#c9a962] focus:ring-[#c9a962]"
                                            />
                                            <span className="text-xs text-gray-600">Popular</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Row 2: Slug, Pricing */}
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Slug</label>
                                        <input
                                            type="text"
                                            value={service.slug || ''}
                                            onChange={(e) => updateService(service.id, 'slug', e.target.value)}
                                            className="w-full h-8 rounded border border-gray-200 px-2 text-sm text-gray-500 bg-gray-50 focus:border-[#c9a962] focus:outline-none"
                                            placeholder="auto-generated"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Pricing</label>
                                        <input
                                            type="text"
                                            value={service.pricing || ''}
                                            onChange={(e) => updateService(service.id, 'pricing', e.target.value)}
                                            className="w-full h-8 rounded border border-gray-200 px-2 text-sm focus:border-[#c9a962] focus:outline-none"
                                            placeholder="$299/month"
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Image URL with Upload */}
                                <div className="mb-2">
                                    <label className="block text-xs text-gray-500 mb-1">Image</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={service.image || ''}
                                            onChange={(e) => updateService(service.id, 'image', e.target.value)}
                                            className="flex-1 h-8 rounded border border-gray-200 px-2 text-sm focus:border-[#c9a962] focus:outline-none"
                                            placeholder="/images/service.png or upload"
                                        />
                                        <label className="inline-flex items-center gap-1 px-3 h-8 text-xs font-medium text-gray-600 bg-gray-100 rounded border border-gray-200 hover:bg-gray-200 cursor-pointer">
                                            <Upload className="h-3 w-3" />
                                            Upload
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleImageUpload(service.id, file);
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Row 4: Headline */}
                                <div className="mb-2">
                                    <label className="block text-xs text-gray-500 mb-1">Headline</label>
                                    <input
                                        type="text"
                                        value={service.headline || ''}
                                        onChange={(e) => updateService(service.id, 'headline', e.target.value)}
                                        className="w-full h-8 rounded border border-gray-200 px-2 text-sm focus:border-[#c9a962] focus:outline-none"
                                        placeholder="GLP-1 receptor agonist combined with essential vitamin support"
                                    />
                                </div>

                                {/* Row 5: Description */}
                                <div className="mb-2">
                                    <label className="block text-xs text-gray-500 mb-1">Description</label>
                                    <textarea
                                        value={service.description || ''}
                                        onChange={(e) => updateService(service.id, 'description', e.target.value)}
                                        className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:border-[#c9a962] focus:outline-none resize-none"
                                        rows={2}
                                        placeholder="Service description..."
                                    />
                                </div>

                                {/* Row 6: Get Started URL */}
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Get Started URL</label>
                                    <input
                                        type="text"
                                        value={service.getStartedUrl || ''}
                                        onChange={(e) => updateService(service.id, 'getStartedUrl', e.target.value)}
                                        className="w-full h-8 rounded border border-gray-200 px-2 text-sm focus:border-[#c9a962] focus:outline-none"
                                        placeholder="https://intake.hyvewellness.com/service-name (leave empty for default)"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredServices.length === 0 && (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">
                                {activeCategory === 'all' 
                                    ? 'No services added yet' 
                                    : `No services in ${categories.find(c => c.slug === activeCategory)?.name || 'this category'}`
                                }
                            </p>
                            <button
                                type="button"
                                onClick={addService}
                                className="mt-2 text-xs text-[#c9a962] hover:text-[#b08d4a] font-medium"
                            >
                                + Add {activeCategory === 'all' ? 'your first' : 'a'} service
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Services CTA Fields
    const renderServicesCtaFields = () => {
        return (
            <div className="space-y-6">
                <div className="space-y-4 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-800">CTA Bar Content</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Pre-Title
                            </label>
                            <input
                                type="text"
                                value={data.preTitle || ''}
                                onChange={(e) => updateData('preTitle', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="Have Questions?"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Title
                            </label>
                            <input
                                type="text"
                                value={data.title || ''}
                                onChange={(e) => updateData('title', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="We're here to help"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Button Text
                            </label>
                            <input
                                type="text"
                                value={data.buttonText || ''}
                                onChange={(e) => updateData('buttonText', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="CONTACT US"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Button Link
                            </label>
                            <input
                                type="text"
                                value={data.buttonLink || ''}
                                onChange={(e) => updateData('buttonLink', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="/contact"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ============================================
    // Contact Page Block Fields
    // ============================================

    // Contact Hero Fields
    const renderContactHeroFields = () => {
        return (
            <div className="space-y-6">
                <div className="space-y-4 p-4 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl border border-cyan-100">
                    <h4 className="text-sm font-semibold text-cyan-800">Contact Hero Content</h4>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Pre-Title
                        </label>
                        <input
                            type="text"
                            value={data.preTitle || ''}
                            onChange={(e) => updateData('preTitle', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            placeholder="GET IN TOUCH"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Title
                        </label>
                        <input
                            type="text"
                            value={data.title || ''}
                            onChange={(e) => updateData('title', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            placeholder="Contact Us"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Description
                        </label>
                        <textarea
                            value={data.description || ''}
                            onChange={(e) => updateData('description', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#c9a962] focus:outline-none resize-none"
                            rows={3}
                            placeholder="Have questions about our services? We're here to help."
                        />
                    </div>
                </div>
            </div>
        );
    };

    // Contact Form Fields
    const renderContactFormFields = () => {
        const fields = data.fields || {};
        
        const updateField = (fieldName: string, prop: string, value: any) => {
            updateData('fields', {
                ...fields,
                [fieldName]: {
                    ...fields[fieldName],
                    [prop]: value,
                }
            });
        };

        return (
            <div className="space-y-6">
                {/* Form Title Section */}
                <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <h4 className="text-sm font-semibold text-blue-800">Form Settings</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Form Title
                            </label>
                            <input
                                type="text"
                                value={data.title || ''}
                                onChange={(e) => updateData('title', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="Send Us a Message"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Subtitle
                            </label>
                            <input
                                type="text"
                                value={data.subtitle || ''}
                                onChange={(e) => updateData('subtitle', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="We'd love to hear from you"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Submit Button Text
                        </label>
                        <input
                            type="text"
                            value={data.submitText || ''}
                            onChange={(e) => updateData('submitText', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            placeholder="SEND MESSAGE"
                        />
                    </div>
                </div>

                {/* Success Message */}
                <div className="space-y-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <h4 className="text-sm font-semibold text-green-800">Success Message</h4>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Success Title
                        </label>
                        <input
                            type="text"
                            value={data.successTitle || ''}
                            onChange={(e) => updateData('successTitle', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            placeholder="Thank You!"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Success Message
                        </label>
                        <textarea
                            value={data.successMessage || ''}
                            onChange={(e) => updateData('successMessage', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#c9a962] focus:outline-none resize-none"
                            rows={2}
                            placeholder="Your message has been received..."
                        />
                    </div>
                </div>

                {/* Form Fields Configuration */}
                <div className="space-y-4 p-4 bg-white rounded-xl border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-800">Form Fields</h4>
                    
                    {/* Name Field */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Name Field</span>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={fields.name?.required !== false}
                                    onChange={(e) => updateField('name', 'required', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-[#c9a962]"
                                />
                                <span className="text-xs text-gray-500">Required</span>
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                value={fields.name?.label || ''}
                                onChange={(e) => updateField('name', 'label', e.target.value)}
                                className="h-8 rounded border border-gray-200 px-2 text-sm"
                                placeholder="Label: Full Name"
                            />
                            <input
                                type="text"
                                value={fields.name?.placeholder || ''}
                                onChange={(e) => updateField('name', 'placeholder', e.target.value)}
                                className="h-8 rounded border border-gray-200 px-2 text-sm"
                                placeholder="Placeholder: John Doe"
                            />
                        </div>
                    </div>

                    {/* Email Field */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Email Field</span>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={fields.email?.required !== false}
                                    onChange={(e) => updateField('email', 'required', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-[#c9a962]"
                                />
                                <span className="text-xs text-gray-500">Required</span>
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                value={fields.email?.label || ''}
                                onChange={(e) => updateField('email', 'label', e.target.value)}
                                className="h-8 rounded border border-gray-200 px-2 text-sm"
                                placeholder="Label: Email Address"
                            />
                            <input
                                type="text"
                                value={fields.email?.placeholder || ''}
                                onChange={(e) => updateField('email', 'placeholder', e.target.value)}
                                className="h-8 rounded border border-gray-200 px-2 text-sm"
                                placeholder="Placeholder: john@example.com"
                            />
                        </div>
                    </div>

                    {/* Phone Field */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Phone Field</span>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={fields.phone?.required === true}
                                    onChange={(e) => updateField('phone', 'required', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-[#c9a962]"
                                />
                                <span className="text-xs text-gray-500">Required</span>
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                value={fields.phone?.label || ''}
                                onChange={(e) => updateField('phone', 'label', e.target.value)}
                                className="h-8 rounded border border-gray-200 px-2 text-sm"
                                placeholder="Label: Phone Number"
                            />
                            <input
                                type="text"
                                value={fields.phone?.placeholder || ''}
                                onChange={(e) => updateField('phone', 'placeholder', e.target.value)}
                                className="h-8 rounded border border-gray-200 px-2 text-sm"
                                placeholder="Placeholder: (555) 123-4567"
                            />
                        </div>
                    </div>

                    {/* Message Field */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Message Field</span>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={fields.message?.required !== false}
                                    onChange={(e) => updateField('message', 'required', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-[#c9a962]"
                                />
                                <span className="text-xs text-gray-500">Required</span>
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                value={fields.message?.label || ''}
                                onChange={(e) => updateField('message', 'label', e.target.value)}
                                className="h-8 rounded border border-gray-200 px-2 text-sm"
                                placeholder="Label: How can we help?"
                            />
                            <input
                                type="text"
                                value={fields.message?.placeholder || ''}
                                onChange={(e) => updateField('message', 'placeholder', e.target.value)}
                                className="h-8 rounded border border-gray-200 px-2 text-sm"
                                placeholder="Placeholder: Tell us..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Contact Info Cards Fields
    const renderContactInfoCardsFields = () => {
        const cards = data.cards || [];
        const iconOptions = [
            { value: 'phone', label: 'Phone' },
            { value: 'email', label: 'Email' },
            { value: 'clock', label: 'Clock/Hours' },
            { value: 'location', label: 'Location' },
        ];

        const generateId = () => `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const addCard = () => {
            updateData('cards', [
                ...cards,
                { id: generateId(), icon: 'phone', title: 'New Card', value: '', description: '' }
            ]);
        };

        const updateCard = (cardId: string, field: string, value: any) => {
            const newCards = cards.map((c: any) => 
                c.id === cardId ? { ...c, [field]: value } : c
            );
            updateData('cards', newCards);
        };

        const removeCard = (cardId: string) => {
            updateData('cards', cards.filter((c: any) => c.id !== cardId));
        };

        return (
            <div className="space-y-6">
                <div className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-purple-800">Contact Info Cards</h4>
                        <select
                            value={data.columns || 3}
                            onChange={(e) => updateData('columns', parseInt(e.target.value))}
                            className="h-8 rounded border border-gray-200 px-2 text-xs"
                        >
                            <option value={2}>2 Columns</option>
                            <option value={3}>3 Columns</option>
                            <option value={4}>4 Columns</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Cards ({cards.length})
                        </label>
                        <button
                            type="button"
                            onClick={addCard}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#c9a962] rounded-lg hover:bg-[#b08d4a]"
                        >
                            <Plus className="h-3 w-3" />
                            Add Card
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                        {cards.map((card: any, idx: number) => (
                            <div key={card.id || idx} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                                        <span className="text-sm font-medium text-gray-700">{card.title || 'Untitled'}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeCard(card.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Icon</label>
                                        <select
                                            value={card.icon || 'phone'}
                                            onChange={(e) => updateCard(card.id, 'icon', e.target.value)}
                                            className="w-full h-8 rounded border border-gray-200 px-2 text-sm"
                                        >
                                            {iconOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Title</label>
                                        <input
                                            type="text"
                                            value={card.title || ''}
                                            onChange={(e) => updateCard(card.id, 'title', e.target.value)}
                                            className="w-full h-8 rounded border border-gray-200 px-2 text-sm"
                                            placeholder="Call Us"
                                        />
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <label className="block text-xs text-gray-500 mb-1">Value (Main Text)</label>
                                    <input
                                        type="text"
                                        value={card.value || ''}
                                        onChange={(e) => updateCard(card.id, 'value', e.target.value)}
                                        className="w-full h-8 rounded border border-gray-200 px-2 text-sm"
                                        placeholder="1-800-HYVE-RX"
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="block text-xs text-gray-500 mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={card.description || ''}
                                        onChange={(e) => updateCard(card.id, 'description', e.target.value)}
                                        className="w-full h-8 rounded border border-gray-200 px-2 text-sm"
                                        placeholder="Mon-Fri 8am-8pm EST"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Link (optional)</label>
                                    <input
                                        type="text"
                                        value={card.link || ''}
                                        onChange={(e) => updateCard(card.id, 'link', e.target.value)}
                                        className="w-full h-8 rounded border border-gray-200 px-2 text-sm"
                                        placeholder="tel:1-800-HYVE-RX"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {cards.length === 0 && (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <p className="text-sm text-gray-400">No cards added yet</p>
                            <button
                                type="button"
                                onClick={addCard}
                                className="mt-2 text-xs text-[#c9a962] hover:text-[#b08d4a] font-medium"
                            >
                                + Add your first card
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Contact CTA Fields
    const renderContactCtaFields = () => {
        const iconOptions = [
            { value: 'phone', label: 'Phone' },
            { value: 'mail', label: 'Mail' },
            { value: 'calendar', label: 'Calendar' },
            { value: 'message', label: 'Message' },
        ];

        return (
            <div className="space-y-6">
                <div className="space-y-4 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-800">Contact CTA Content</h4>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Icon
                        </label>
                        <select
                            value={data.icon || 'phone'}
                            onChange={(e) => updateData('icon', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                        >
                            {iconOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Title
                        </label>
                        <input
                            type="text"
                            value={data.title || ''}
                            onChange={(e) => updateData('title', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            placeholder="Prefer to speak with someone now?"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Description
                        </label>
                        <textarea
                            value={data.description || ''}
                            onChange={(e) => updateData('description', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#c9a962] focus:outline-none resize-none"
                            rows={2}
                            placeholder="Our patient care team is available..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Button Text
                            </label>
                            <input
                                type="text"
                                value={data.buttonText || ''}
                                onChange={(e) => updateData('buttonText', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="Schedule a Call"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Button Link
                            </label>
                            <input
                                type="text"
                                value={data.buttonLink || ''}
                                onChange={(e) => updateData('buttonLink', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="#"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Partner Login Fields
    const renderPartnerLoginFields = () => {
        const hero = data.hero || {};
        const form = data.form || {};
        const signupCta = data.signup_cta || {};
        const footer = data.footer || {};
        const settings = data.settings || {};

        const updateNestedField = (section: string, field: string, value: any) => {
            const currentSection = data[section] || {};
            updateData(section, { ...currentSection, [field]: value });
        };

        return (
            <div className="space-y-6">
                {/* Hero Section */}
                <div className="space-y-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <h4 className="text-sm font-semibold text-indigo-800">Hero Section</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Icon Title
                            </label>
                            <input
                                type="text"
                                value={hero.icon_title || ''}
                                onChange={(e) => updateNestedField('hero', 'icon_title', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="Partner Portal"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Title
                            </label>
                            <input
                                type="text"
                                value={hero.title || ''}
                                onChange={(e) => updateNestedField('hero', 'title', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="Partner Portal"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Description
                        </label>
                        <input
                            type="text"
                            value={hero.description || ''}
                            onChange={(e) => updateNestedField('hero', 'description', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            placeholder="Welcome back! Sign in to your account."
                        />
                    </div>
                </div>

                {/* Form Settings */}
                <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                    <h4 className="text-sm font-semibold text-blue-800">Form Fields</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Email Label
                            </label>
                            <input
                                type="text"
                                value={form.email_label || ''}
                                onChange={(e) => updateNestedField('form', 'email_label', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="Email Address"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Email Placeholder
                            </label>
                            <input
                                type="text"
                                value={form.email_placeholder || ''}
                                onChange={(e) => updateNestedField('form', 'email_placeholder', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="partner@example.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Password Label
                            </label>
                            <input
                                type="text"
                                value={form.password_label || ''}
                                onChange={(e) => updateNestedField('form', 'password_label', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="Password"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Password Placeholder
                            </label>
                            <input
                                type="text"
                                value={form.password_placeholder || ''}
                                onChange={(e) => updateNestedField('form', 'password_placeholder', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Remember Me Text
                            </label>
                            <input
                                type="text"
                                value={form.remember_me || ''}
                                onChange={(e) => updateNestedField('form', 'remember_me', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="Remember me"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Submit Button Text
                            </label>
                            <input
                                type="text"
                                value={form.submit_text || ''}
                                onChange={(e) => updateNestedField('form', 'submit_text', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="SIGN IN"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Forgot Password Text
                            </label>
                            <input
                                type="text"
                                value={form.forgot_password_text || ''}
                                onChange={(e) => updateNestedField('form', 'forgot_password_text', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="Forgot password?"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Forgot Password Link
                            </label>
                            <input
                                type="text"
                                value={form.forgot_password_link || ''}
                                onChange={(e) => updateNestedField('form', 'forgot_password_link', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="#"
                            />
                        </div>
                    </div>
                </div>

                {/* Signup CTA */}
                <div className="space-y-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <h4 className="text-sm font-semibold text-green-800">Signup CTA</h4>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Divider Text
                        </label>
                        <input
                            type="text"
                            value={signupCta.divider_text || ''}
                            onChange={(e) => updateNestedField('signup_cta', 'divider_text', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            placeholder="New to Hyve Wellness?"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Description
                        </label>
                        <input
                            type="text"
                            value={signupCta.description || ''}
                            onChange={(e) => updateNestedField('signup_cta', 'description', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            placeholder="Join our network of healthcare professionals"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Button Text
                            </label>
                            <input
                                type="text"
                                value={signupCta.button_text || ''}
                                onChange={(e) => updateNestedField('signup_cta', 'button_text', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="BECOME A PARTNER"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Button Link
                            </label>
                            <input
                                type="text"
                                value={signupCta.button_link || ''}
                                onChange={(e) => updateNestedField('signup_cta', 'button_link', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="/partners/signup"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="space-y-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-800">Footer</h4>
                    
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Help Text
                            </label>
                            <input
                                type="text"
                                value={footer.help_text || ''}
                                onChange={(e) => updateNestedField('footer', 'help_text', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="Need help?"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Help Link Text
                            </label>
                            <input
                                type="text"
                                value={footer.help_link_text || ''}
                                onChange={(e) => updateNestedField('footer', 'help_link_text', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="Contact support"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Help Link
                            </label>
                            <input
                                type="text"
                                value={footer.help_link || ''}
                                onChange={(e) => updateNestedField('footer', 'help_link', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="/contact"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Security Text
                        </label>
                        <input
                            type="text"
                            value={footer.security_text || ''}
                            onChange={(e) => updateNestedField('footer', 'security_text', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            placeholder="Secured with 256-bit SSL encryption"
                        />
                    </div>
                </div>

                {/* Settings */}
                <div className="space-y-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                    <h4 className="text-sm font-semibold text-amber-800">Settings</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Logo URL
                            </label>
                            <input
                                type="text"
                                value={settings.logo || ''}
                                onChange={(e) => updateNestedField('settings', 'logo', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="/images/logo.png"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                                Redirect URL (after login)
                            </label>
                            <input
                                type="text"
                                value={settings.redirect_url || ''}
                                onChange={(e) => updateNestedField('settings', 'redirect_url', e.target.value)}
                                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                                placeholder="https://partner.hyverx.com/"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Partner Signup Hero Fields
    const renderPartnerSignupHeroFields = () => {
        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                        Pre-Title
                    </label>
                    <input
                        type="text"
                        value={data.pre_title || ''}
                        onChange={(e) => updateData('pre_title', e.target.value)}
                        className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                        placeholder="WELLNESS PARTNERSHIP PROGRAM"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Title
                        </label>
                        <input
                            type="text"
                            value={data.title || ''}
                            onChange={(e) => updateData('title', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            placeholder="Share Wellness."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Title Highlight
                        </label>
                        <input
                            type="text"
                            value={data.title_highlight || ''}
                            onChange={(e) => updateData('title_highlight', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            placeholder="Build Your Business."
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                        Description
                    </label>
                    <textarea
                        value={data.description || ''}
                        onChange={(e) => updateData('description', e.target.value)}
                        className="w-full h-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#c9a962] focus:outline-none resize-none"
                        placeholder="Are you passionate about health and wellness?..."
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                        Logo URL
                    </label>
                    <input
                        type="text"
                        value={data.logo || ''}
                        onChange={(e) => updateData('logo', e.target.value)}
                        className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                        placeholder="/images/logo.png"
                    />
                </div>
            </div>
        );
    };

    // Partner Signup Types Fields
    const renderPartnerSignupTypesFields = () => {
        const items = data.items || [];

        const addItem = () => {
            updateData('items', [...items, { icon: 'Users', title: '', description: '', gradient: 'from-[#c9a962] to-[#d4c4a8]' }]);
        };

        const updateItem = (index: number, field: string, value: string) => {
            const newItems = [...items];
            newItems[index] = { ...newItems[index], [field]: value };
            updateData('items', newItems);
        };

        const removeItem = (index: number) => {
            const newItems = items.filter((_: unknown, i: number) => i !== index);
            updateData('items', newItems);
        };

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Section Title
                        </label>
                        <input
                            type="text"
                            value={data.title || ''}
                            onChange={(e) => updateData('title', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            placeholder="Who We're Looking For"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Section Description
                        </label>
                        <input
                            type="text"
                            value={data.description || ''}
                            onChange={(e) => updateData('description', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            placeholder="Our partnership program..."
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">Partner Type Cards ({items.length})</span>
                        <button type="button" onClick={addItem} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600">
                            <Plus className="h-3 w-3" /> Add Type
                        </button>
                    </div>
                    {items.map((item: { icon?: string; title?: string; description?: string; gradient?: string }, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-500">Type {index + 1}</span>
                                <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <input type="text" value={item.icon || ''} onChange={(e) => updateItem(index, 'icon', e.target.value)} className="h-8 rounded border border-gray-200 px-2 text-xs" placeholder="Icon" />
                                <input type="text" value={item.title || ''} onChange={(e) => updateItem(index, 'title', e.target.value)} className="h-8 rounded border border-gray-200 px-2 text-xs" placeholder="Title" />
                                <input type="text" value={item.gradient || ''} onChange={(e) => updateItem(index, 'gradient', e.target.value)} className="h-8 rounded border border-gray-200 px-2 text-xs" placeholder="Gradient" />
                            </div>
                            <textarea value={item.description || ''} onChange={(e) => updateItem(index, 'description', e.target.value)} className="w-full h-12 rounded border border-gray-200 px-2 py-1 text-xs resize-none" placeholder="Description" />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Partner Signup Benefits Fields
    const renderPartnerSignupBenefitsFields = () => {
        const items = data.items || [];

        const addItem = () => {
            updateData('items', [...items, { icon: 'CheckCircle2', title: '', description: '' }]);
        };

        const updateItem = (index: number, field: string, value: string) => {
            const newItems = [...items];
            newItems[index] = { ...newItems[index], [field]: value };
            updateData('items', newItems);
        };

        const removeItem = (index: number) => {
            const newItems = items.filter((_: unknown, i: number) => i !== index);
            updateData('items', newItems);
        };

        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                        Section Title
                    </label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateData('title', e.target.value)}
                        className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                        placeholder="What You'll Get"
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">Benefit Cards ({items.length})</span>
                        <button type="button" onClick={addItem} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600">
                            <Plus className="h-3 w-3" /> Add Benefit
                        </button>
                    </div>
                    {items.map((item: { icon?: string; title?: string; description?: string }, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-500">Benefit {index + 1}</span>
                                <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="text" value={item.icon || ''} onChange={(e) => updateItem(index, 'icon', e.target.value)} className="h-8 rounded border border-gray-200 px-2 text-xs" placeholder="Icon (DollarSign, etc.)" />
                                <input type="text" value={item.title || ''} onChange={(e) => updateItem(index, 'title', e.target.value)} className="h-8 rounded border border-gray-200 px-2 text-xs" placeholder="Title" />
                            </div>
                            <textarea value={item.description || ''} onChange={(e) => updateItem(index, 'description', e.target.value)} className="w-full h-16 rounded border border-gray-200 px-2 py-1 text-xs resize-none" placeholder="Description" />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Partner Signup Steps Fields
    const renderPartnerSignupStepsFields = () => {
        const steps = data.steps || [];

        const addStep = () => {
            updateData('steps', [...steps, { number: String(steps.length + 1), title: '', description: '' }]);
        };

        const updateStep = (index: number, field: string, value: string) => {
            const newSteps = [...steps];
            newSteps[index] = { ...newSteps[index], [field]: value };
            updateData('steps', newSteps);
        };

        const removeStep = (index: number) => {
            const newSteps = steps.filter((_: unknown, i: number) => i !== index);
            updateData('steps', newSteps);
        };

        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                        Section Title
                    </label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateData('title', e.target.value)}
                        className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                        placeholder="How It Works"
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">Steps ({steps.length})</span>
                        <button type="button" onClick={addStep} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-orange-500 rounded hover:bg-orange-600">
                            <Plus className="h-3 w-3" /> Add Step
                        </button>
                    </div>
                    {steps.map((step: { number?: string; title?: string; description?: string }, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-500">Step {index + 1}</span>
                                <button type="button" onClick={() => removeStep(index)} className="text-red-500 hover:text-red-700">
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="text" value={step.number || ''} onChange={(e) => updateStep(index, 'number', e.target.value)} className="h-8 rounded border border-gray-200 px-2 text-xs" placeholder="Number" />
                                <input type="text" value={step.title || ''} onChange={(e) => updateStep(index, 'title', e.target.value)} className="h-8 rounded border border-gray-200 px-2 text-xs" placeholder="Title" />
                            </div>
                            <textarea value={step.description || ''} onChange={(e) => updateStep(index, 'description', e.target.value)} className="w-full h-12 rounded border border-gray-200 px-2 py-1 text-xs resize-none" placeholder="Description" />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Partner Signup Community Fields
    const renderPartnerSignupCommunityFields = () => {
        const stats = data.stats || [];

        const addStat = () => {
            updateData('stats', [...stats, { icon: 'Shield', text: '' }]);
        };

        const updateStat = (index: number, field: string, value: string) => {
            const newStats = [...stats];
            newStats[index] = { ...newStats[index], [field]: value };
            updateData('stats', newStats);
        };

        const removeStat = (index: number) => {
            const newStats = stats.filter((_: unknown, i: number) => i !== index);
            updateData('stats', newStats);
        };

        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                        Title
                    </label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateData('title', e.target.value)}
                        className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                        placeholder="Join Our Partner Community"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                        Description
                    </label>
                    <textarea
                        value={data.description || ''}
                        onChange={(e) => updateData('description', e.target.value)}
                        className="w-full h-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#c9a962] focus:outline-none resize-none"
                        placeholder="When you become a Hyve Wellness partner..."
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">Stats ({stats.length})</span>
                        <button type="button" onClick={addStat} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-pink-500 rounded hover:bg-pink-600">
                            <Plus className="h-3 w-3" /> Add Stat
                        </button>
                    </div>
                    {stats.map((stat: { icon?: string; text?: string }, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex gap-2 items-center">
                            <input type="text" value={stat.icon || ''} onChange={(e) => updateStat(index, 'icon', e.target.value)} className="h-8 w-24 rounded border border-gray-200 px-2 text-xs" placeholder="Icon" />
                            <input type="text" value={stat.text || ''} onChange={(e) => updateStat(index, 'text', e.target.value)} className="h-8 flex-1 rounded border border-gray-200 px-2 text-xs" placeholder="Text" />
                            <button type="button" onClick={() => removeStat(index)} className="text-red-500 hover:text-red-700">
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Partner Signup CTA Fields
    const renderPartnerSignupCtaFields = () => {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Title
                        </label>
                        <input
                            type="text"
                            value={data.title || ''}
                            onChange={(e) => updateData('title', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            placeholder="Ready to Make an Impact?"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Button Text
                        </label>
                        <input
                            type="text"
                            value={data.button_text || ''}
                            onChange={(e) => updateData('button_text', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            placeholder="APPLY NOW"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                        Description
                    </label>
                    <textarea
                        value={data.description || ''}
                        onChange={(e) => updateData('description', e.target.value)}
                        className="w-full h-16 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#c9a962] focus:outline-none resize-none"
                        placeholder="Turn your passion for wellness..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Button Link
                        </label>
                        <input
                            type="text"
                            value={data.button_link || ''}
                            onChange={(e) => updateData('button_link', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            placeholder="#apply-form"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Login Text
                        </label>
                        <input
                            type="text"
                            value={data.login_text || ''}
                            onChange={(e) => updateData('login_text', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            placeholder="Already a partner?"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Login Link Text
                        </label>
                        <input
                            type="text"
                            value={data.login_link_text || ''}
                            onChange={(e) => updateData('login_link_text', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            placeholder="Sign in to your portal"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            Login Link
                        </label>
                        <input
                            type="text"
                            value={data.login_link || ''}
                            onChange={(e) => updateData('login_link', e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                            placeholder="/partners/login"
                        />
                    </div>
                </div>
            </div>
        );
    };

    // Legal Hero Fields
    const renderLegalHeroFields = () => {
        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                        Pre-Title
                    </label>
                    <input
                        type="text"
                        value={data.preTitle || ''}
                        onChange={(e) => updateData('preTitle', e.target.value)}
                        className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                        placeholder="LEGAL"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                        Title
                    </label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateData('title', e.target.value)}
                        className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                        placeholder="Privacy Policy"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                        Description
                    </label>
                    <textarea
                        value={data.description || ''}
                        onChange={(e) => updateData('description', e.target.value)}
                        className="w-full h-20 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#c9a962] focus:outline-none resize-none"
                        placeholder="Your privacy is important to us..."
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                        Last Updated
                    </label>
                    <input
                        type="text"
                        value={data.lastUpdated || ''}
                        onChange={(e) => updateData('lastUpdated', e.target.value)}
                        className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                        placeholder="January 27, 2026"
                    />
                </div>
            </div>
        );
    };

    // Legal Content Fields
    const renderLegalContentFields = () => {
        const sections = data.sections || [];

        const addSection = () => {
            const newSection = {
                id: `section_${Date.now()}`,
                title: '',
                content: '',
            };
            updateData('sections', [...sections, newSection]);
        };

        const updateSection = (index: number, field: string, value: string) => {
            const updated = sections.map((s: any, i: number) => 
                i === index ? { ...s, [field]: value } : s
            );
            updateData('sections', updated);
        };

        const removeSection = (index: number) => {
            const updated = sections.filter((_: any, i: number) => i !== index);
            updateData('sections', updated);
        };

        const moveSection = (index: number, direction: 'up' | 'down') => {
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= sections.length) return;
            const updated = [...sections];
            [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
            updateData('sections', updated);
        };

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Content Sections ({sections.length})
                    </label>
                    <button
                        type="button"
                        onClick={addSection}
                        className="text-xs bg-[#c9a962] text-white px-3 py-1.5 rounded-lg hover:bg-[#b89952] transition-colors"
                    >
                        + Add Section
                    </button>
                </div>

                {sections.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                        No sections yet. Click "Add Section" to create one.
                    </p>
                ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {sections.map((section: any, index: number) => (
                            <div key={section.id || index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-gray-600">Section {index + 1}</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => moveSection(index, 'up')}
                                            disabled={index === 0}
                                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveSection(index, 'down')}
                                            disabled={index === sections.length - 1}
                                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeSection(index)}
                                            className="p-1 text-red-400 hover:text-red-600"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={section.title || ''}
                                        onChange={(e) => updateSection(index, 'title', e.target.value)}
                                        className="w-full h-8 rounded border border-gray-200 px-2 text-sm focus:border-[#c9a962] focus:outline-none"
                                        placeholder="Section Title (e.g., 1. Information We Collect)"
                                    />
                                    <RichTextEditor
                                        value={section.content || ''}
                                        onChange={(val) => updateSection(index, 'content', val)}
                                        placeholder="Enter section content..."
                                        minHeight="120px"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Cards Fields (simplified)
    const renderCardsFields = () => {
        const items = data.items || [];
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Cards ({items.length})
                    </label>
                    <button
                        type="button"
                        onClick={() => {
                            updateData('items', [...items, { image: '', title: '', description: '', link: '' }]);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-[#c9a962] rounded hover:bg-[#b08d4a]"
                    >
                        <Plus className="h-3 w-3" />
                        Add Card
                    </button>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {items.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-start gap-3">
                                <div className="flex-1 space-y-2">
                                    <input
                                        type="text"
                                        value={item.title || ''}
                                        onChange={(e) => {
                                            const newItems = [...items];
                                            newItems[idx] = { ...item, title: e.target.value };
                                            updateData('items', newItems);
                                        }}
                                        className="w-full h-8 rounded border border-gray-200 px-2 text-sm font-medium focus:border-[#c9a962] focus:outline-none"
                                        placeholder="Card title"
                                    />
                                    <input
                                        type="text"
                                        value={item.description || ''}
                                        onChange={(e) => {
                                            const newItems = [...items];
                                            newItems[idx] = { ...item, description: e.target.value };
                                            updateData('items', newItems);
                                        }}
                                        className="w-full h-8 rounded border border-gray-200 px-2 text-xs focus:border-[#c9a962] focus:outline-none"
                                        placeholder="Description"
                                    />
                                    <input
                                        type="text"
                                        value={item.link || ''}
                                        onChange={(e) => {
                                            const newItems = [...items];
                                            newItems[idx] = { ...item, link: e.target.value };
                                            updateData('items', newItems);
                                        }}
                                        className="w-full h-8 rounded border border-gray-200 px-2 text-xs focus:border-[#c9a962] focus:outline-none"
                                        placeholder="Link URL (optional)"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        updateData('items', items.filter((_: any, i: number) => i !== idx));
                                    }}
                                    className="p-1 text-red-400 hover:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                        Columns
                    </label>
                    <select
                        value={data.columns || 3}
                        onChange={(e) => updateData('columns', parseInt(e.target.value))}
                        className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                    >
                        <option value={2}>2 Columns</option>
                        <option value={3}>3 Columns</option>
                        <option value={4}>4 Columns</option>
                    </select>
                </div>
            </div>
        );
    };

    // List Fields
    const renderListFields = () => {
        const items = data.items || [];
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        List Items ({items.length})
                    </label>
                    <button
                        type="button"
                        onClick={() => {
                            updateData('items', [...items, { title: '', content: '' }]);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-[#c9a962] rounded hover:bg-[#b08d4a]"
                    >
                        <Plus className="h-3 w-3" />
                        Add Item
                    </button>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {items.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={item.title || ''}
                                        onChange={(e) => {
                                            const newItems = [...items];
                                            newItems[idx] = { ...item, title: e.target.value };
                                            updateData('items', newItems);
                                        }}
                                        className="flex-1 h-8 rounded border border-gray-200 px-2 text-sm font-medium focus:border-[#c9a962] focus:outline-none"
                                        placeholder="Item title / Question"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            updateData('items', items.filter((_: any, i: number) => i !== idx));
                                        }}
                                        className="p-1 text-red-400 hover:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                {(data.style === 'accordion' || data.style === 'faq') && (
                                    <textarea
                                        value={item.content || ''}
                                        onChange={(e) => {
                                            const newItems = [...items];
                                            newItems[idx] = { ...item, content: e.target.value };
                                            updateData('items', newItems);
                                        }}
                                        rows={2}
                                        className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs focus:border-[#c9a962] focus:outline-none resize-none"
                                        placeholder="Content / Answer"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                        Style
                    </label>
                    <select
                        value={data.style || 'bullet'}
                        onChange={(e) => updateData('style', e.target.value)}
                        className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                    >
                        <option value="bullet">Bullet Points</option>
                        <option value="numbered">Numbered</option>
                        <option value="checklist">Checklist</option>
                        <option value="accordion">Accordion</option>
                        <option value="faq">FAQ (Q&A)</option>
                    </select>
                </div>
            </div>
        );
    };

    // Stats Fields
    const renderStatsFields = () => {
        const items = data.items || [];
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Stats ({items.length})
                    </label>
                    <button
                        type="button"
                        onClick={() => {
                            updateData('items', [...items, { value: '', label: '', description: '' }]);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-[#c9a962] rounded hover:bg-[#b08d4a]"
                    >
                        <Plus className="h-3 w-3" />
                        Add Stat
                    </button>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {items.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="grid grid-cols-3 gap-2">
                                <input
                                    type="text"
                                    value={item.value || ''}
                                    onChange={(e) => {
                                        const newItems = [...items];
                                        newItems[idx] = { ...item, value: e.target.value };
                                        updateData('items', newItems);
                                    }}
                                    className="h-8 rounded border border-gray-200 px-2 text-sm font-bold text-center focus:border-[#c9a962] focus:outline-none"
                                    placeholder="100+"
                                />
                                <input
                                    type="text"
                                    value={item.label || ''}
                                    onChange={(e) => {
                                        const newItems = [...items];
                                        newItems[idx] = { ...item, label: e.target.value };
                                        updateData('items', newItems);
                                    }}
                                    className="col-span-2 h-8 rounded border border-gray-200 px-2 text-sm focus:border-[#c9a962] focus:outline-none"
                                    placeholder="Label"
                                />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <input
                                    type="text"
                                    value={item.description || ''}
                                    onChange={(e) => {
                                        const newItems = [...items];
                                        newItems[idx] = { ...item, description: e.target.value };
                                        updateData('items', newItems);
                                    }}
                                    className="flex-1 h-7 rounded border border-gray-200 px-2 text-xs focus:border-[#c9a962] focus:outline-none"
                                    placeholder="Description (optional)"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        updateData('items', items.filter((_: any, i: number) => i !== idx));
                                    }}
                                    className="p-1 text-red-400 hover:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Video Fields
    const renderVideoFields = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                    Video URL
                </label>
                <input
                    type="text"
                    value={data.url || ''}
                    onChange={(e) => updateData('url', e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                    placeholder="YouTube, Vimeo, or direct video URL"
                />
            </div>
            <div className="grid grid-cols-3 gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                        type="checkbox"
                        checked={data.autoPlay || false}
                        onChange={(e) => updateData('autoPlay', e.target.checked)}
                        className="rounded border-gray-300 text-[#c9a962] focus:ring-[#c9a962]"
                    />
                    Auto-play
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                        type="checkbox"
                        checked={data.muted || false}
                        onChange={(e) => updateData('muted', e.target.checked)}
                        className="rounded border-gray-300 text-[#c9a962] focus:ring-[#c9a962]"
                    />
                    Muted
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                        type="checkbox"
                        checked={data.loop || false}
                        onChange={(e) => updateData('loop', e.target.checked)}
                        className="rounded border-gray-300 text-[#c9a962] focus:ring-[#c9a962]"
                    />
                    Loop
                </label>
            </div>
        </div>
    );

    // Spacer Fields
    const renderSpacerFields = () => (
        <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                Spacer Height
            </label>
            <select
                value={data.height || 'medium'}
                onChange={(e) => updateData('height', e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
            >
                <option value="small">Small (16px)</option>
                <option value="medium">Medium (32px)</option>
                <option value="large">Large (64px)</option>
                <option value="xlarge">Extra Large (96px)</option>
            </select>
        </div>
    );

    // Divider Fields
    const renderDividerFields = () => (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                    Style
                </label>
                <select
                    value={data.style || 'solid'}
                    onChange={(e) => updateData('style', e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="gradient">Gradient</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                    Width
                </label>
                <select
                    value={data.width || 'full'}
                    onChange={(e) => updateData('width', e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                >
                    <option value="full">Full Width</option>
                    <option value="half">Half Width</option>
                    <option value="third">One Third</option>
                </select>
            </div>
        </div>
    );

    // HTML Fields
    const renderHtmlFields = () => (
        <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                Custom HTML
            </label>
            <textarea
                value={data.content || ''}
                onChange={(e) => updateData('content', e.target.value)}
                rows={10}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:border-[#c9a962] focus:outline-none resize-none"
                placeholder="<div>Your custom HTML...</div>"
            />
            <p className="text-xs text-amber-600 mt-2">⚠️ Be careful with custom HTML - invalid code may break the page.</p>
        </div>
    );

    // Gallery Fields (simplified)
    const renderGalleryFields = () => (
        <div className="space-y-4">
            <p className="text-sm text-gray-500">Gallery editor - add multiple images</p>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                    Columns
                </label>
                <select
                    value={data.columns || 3}
                    onChange={(e) => updateData('columns', parseInt(e.target.value))}
                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                >
                    <option value={2}>2 Columns</option>
                    <option value={3}>3 Columns</option>
                    <option value={4}>4 Columns</option>
                </select>
            </div>
        </div>
    );

    // Button Group Fields (simplified)
    const renderButtonGroupFields = () => (
        <div className="space-y-4">
            <p className="text-sm text-gray-500">Button group editor - multiple buttons</p>
        </div>
    );

    // Settings Fields
    const renderSettingsFields = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                    Visibility
                </label>
                <select
                    value={settings.visibility || 'visible'}
                    onChange={(e) => setSettings({ ...settings, visibility: e.target.value as 'visible' | 'hidden' | 'mobile-only' | 'desktop-only' })}
                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                >
                    <option value="visible">Always Visible</option>
                    <option value="hidden">Hidden</option>
                    <option value="mobile-only">Mobile Only</option>
                    <option value="desktop-only">Desktop Only</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                    Animation
                </label>
                <select
                    value={settings.animation || 'none'}
                    onChange={(e) => setSettings({ ...settings, animation: e.target.value as 'none' | 'fade' | 'slide-up' | 'slide-left' | 'zoom' })}
                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                >
                    <option value="none">None</option>
                    <option value="fade">Fade In</option>
                    <option value="slide-up">Slide Up</option>
                    <option value="slide-left">Slide Left</option>
                    <option value="zoom">Zoom In</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                    Custom CSS Class
                </label>
                <input
                    type="text"
                    value={settings.customClass || ''}
                    onChange={(e) => setSettings({ ...settings, customClass: e.target.value })}
                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none"
                    placeholder="my-custom-class"
                />
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                                <Type className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">
                                    Edit {definition?.name || block.type}
                                </h3>
                                <p className="text-xs text-white/60">{definition?.description}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <X className="h-4 w-4 text-white" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-6 bg-gray-50/50">
                    <button
                        type="button"
                        onClick={() => setActiveTab('content')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'content'
                                ? 'border-[#c9a962] text-[#c9a962]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Content
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'settings'
                                ? 'border-[#c9a962] text-[#c9a962]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <Settings className="h-3.5 w-3.5" />
                            Settings
                        </span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'content' ? renderContentFields() : renderSettingsFields()}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#c9a962] rounded-lg hover:bg-[#b08d4a] transition-colors"
                    >
                        <Save className="h-4 w-4" />
                        Save Block
                    </button>
                </div>
            </div>
        </div>
    );
}

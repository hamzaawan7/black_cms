import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { Save, Palette, Type, Globe, Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Twitter, Link2, RotateCcw, Youtube, ExternalLink, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useState, useRef } from 'react';
import { useSweetAlert } from '@/hooks/useSweetAlert';

interface SettingsData {
    // Branding (general group)
    site_name: string;
    site_tagline: string;
    site_description: string;
    site_logo: string;
    site_favicon: string;
    
    // Colors (appearance group)
    primary_color: string;
    secondary_color: string;
    background_color: string;
    
    // Typography (appearance group)
    font_heading: string;
    font_body: string;
    
    // Contact (contact group)
    contact_email: string;
    contact_phone: string;
    contact_address: string;
    business_hours: string;
    
    // Social (social group)
    social_facebook: string;
    social_instagram: string;
    social_linkedin: string;
    social_twitter: string;
    social_youtube: string;
    
    // SEO (seo group)
    seo_title: string;
    seo_description: string;
    seo_keywords: string;
    google_analytics_id: string;
    
    // Integrations (integrations group)
    workflow_base_url: string;
    patient_login_url: string;
    get_started_url: string;
    chat_widget_enabled: string;
}

interface SettingsIndexProps {
    settings: Partial<SettingsData>;
}

const tabs = [
    { id: 'branding', name: 'Branding', icon: Palette },
    { id: 'colors', name: 'Colors', icon: Palette },
    { id: 'typography', name: 'Typography', icon: Type },
    { id: 'contact', name: 'Contact', icon: Phone },
    { id: 'social', name: 'Social Media', icon: Globe },
    { id: 'seo', name: 'SEO', icon: Globe },
    { id: 'integrations', name: 'Integrations', icon: Link2 },
];

const fontOptions = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Playfair Display', label: 'Playfair Display' },
    { value: 'Cormorant Garamond', label: 'Cormorant Garamond' },
];

// Default settings that match the seeder
const defaultSettings: SettingsData = {
    site_name: 'Hyve Wellness',
    site_tagline: 'Premium Peptide Therapy & Telehealth',
    site_description: 'Experience personalized peptide therapy from the comfort of your home. Weight loss, anti-aging, hormone optimization and more.',
    site_logo: '/images/logo.png',
    site_favicon: '/images/favicon.ico',
    primary_color: '#9a8b7a',
    secondary_color: '#3d3d3d',
    background_color: '#f5f2eb',
    font_heading: 'Playfair Display',
    font_body: 'Inter',
    contact_email: 'hello@hyvewellness.com',
    contact_phone: '1-800-HYVE-RX',
    contact_address: '123 Wellness Street, Suite 100, Austin, TX 78701',
    business_hours: 'Mon-Fri: 9am-6pm CST',
    social_facebook: 'https://facebook.com/hyvewellness',
    social_instagram: 'https://instagram.com/hyvewellness',
    social_linkedin: 'https://linkedin.com/company/hyvewellness',
    social_twitter: 'https://twitter.com/hyvewellness',
    social_youtube: 'https://youtube.com/@hyvewellness',
    seo_title: 'Hyve Wellness - Premium Peptide Therapy & Telehealth',
    seo_description: 'Experience personalized peptide therapy from the comfort of your home. FDA-approved treatments for weight loss, anti-aging, hormone optimization and more.',
    seo_keywords: 'peptide therapy, semaglutide, tirzepatide, weight loss, telehealth, anti-aging, hormone optimization',
    google_analytics_id: '',
    workflow_base_url: 'https://intake.hyvewellness.com',
    patient_login_url: 'https://hyve.tryvitalcare.com/login',
    get_started_url: 'https://hyve.tryvitalcare.com/get-started',
    chat_widget_enabled: 'true',
};

export default function Index({ settings = {} }: SettingsIndexProps) {
    const [activeTab, setActiveTab] = useState('branding');
    const [processing, setProcessing] = useState(false);
    const [resetting, setResetting] = useState(false);
    const { successNotification, errorNotification, confirm, Swal } = useSweetAlert();

    const [data, setData] = useState<SettingsData>({
        site_name: settings.site_name || '',
        site_tagline: settings.site_tagline || '',
        site_description: settings.site_description || '',
        site_logo: settings.site_logo || '',
        site_favicon: settings.site_favicon || '',
        primary_color: settings.primary_color || '#9a8b7a',
        secondary_color: settings.secondary_color || '#3d3d3d',
        background_color: settings.background_color || '#f5f2eb',
        font_heading: settings.font_heading || 'Playfair Display',
        font_body: settings.font_body || 'Inter',
        contact_email: settings.contact_email || '',
        contact_phone: settings.contact_phone || '',
        contact_address: settings.contact_address || '',
        business_hours: settings.business_hours || '',
        social_facebook: settings.social_facebook || '',
        social_instagram: settings.social_instagram || '',
        social_linkedin: settings.social_linkedin || '',
        social_twitter: settings.social_twitter || '',
        social_youtube: settings.social_youtube || '',
        seo_title: settings.seo_title || '',
        seo_description: settings.seo_description || '',
        seo_keywords: settings.seo_keywords || '',
        google_analytics_id: settings.google_analytics_id || '',
        workflow_base_url: settings.workflow_base_url || '',
        patient_login_url: settings.patient_login_url || '',
        get_started_url: settings.get_started_url || '',
        chat_widget_enabled: settings.chat_widget_enabled || 'true',
    });

    // Map fields to their groups (matching the seeder)
    const fieldGroups: Record<string, string> = {
        site_name: 'general',
        site_tagline: 'general',
        site_description: 'general',
        site_logo: 'general',
        site_favicon: 'general',
        primary_color: 'appearance',
        secondary_color: 'appearance',
        background_color: 'appearance',
        font_heading: 'appearance',
        font_body: 'appearance',
        contact_email: 'contact',
        contact_phone: 'contact',
        contact_address: 'contact',
        business_hours: 'contact',
        social_facebook: 'social',
        social_instagram: 'social',
        social_linkedin: 'social',
        social_twitter: 'social',
        social_youtube: 'social',
        seo_title: 'seo',
        seo_description: 'seo',
        seo_keywords: 'seo',
        google_analytics_id: 'seo',
        workflow_base_url: 'integrations',
        patient_login_url: 'integrations',
        get_started_url: 'integrations',
        chat_widget_enabled: 'integrations',
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        // Convert data to settings array format
        const settingsArray = Object.entries(data).map(([key, value]) => ({
            key,
            value: value || '',
            group: fieldGroups[key] || 'general',
        }));

        router.put('/admin/settings', { settings: settingsArray }, {
            preserveScroll: true,
            onSuccess: () => {
                setProcessing(false);
                successNotification('Settings updated successfully!');
            },
            onError: () => {
                setProcessing(false);
                errorNotification('Failed to update settings');
            },
        });
    };

    const handleReset = async () => {
        const result = await confirm({
            title: 'Reset to Default Settings',
            text: 'This will reset all settings to their default values. This action cannot be undone.',
            icon: 'warning',
            confirmButtonText: 'Yes, reset settings',
        });
        
        if (!result.isConfirmed) return;

        setResetting(true);

        // Convert default settings to array format
        const settingsArray = Object.entries(defaultSettings).map(([key, value]) => ({
            key,
            value: value || '',
            group: fieldGroups[key] || 'general',
        }));

        router.put('/admin/settings', { settings: settingsArray }, {
            preserveScroll: true,
            onSuccess: () => {
                setData(defaultSettings);
                setResetting(false);
                successNotification('Settings reset to defaults!');
            },
            onError: () => {
                setResetting(false);
                errorNotification('Failed to reset settings');
            },
        });
    };

    // Helper to update individual fields
    const updateField = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    return (
        <AdminLayout header="Settings">
            <Head title="Settings" />

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Tabs sidebar */}
                    <div className="lg:w-56 shrink-0">
                        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-[#c9a962] text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                        
                        {/* Reset Button */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={resetting}
                                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                                <RotateCcw className={`h-4 w-4 ${resetting ? 'animate-spin' : ''}`} />
                                Reset to Defaults
                            </button>
                        </div>
                    </div>

                    {/* Settings content */}
                    <div className="flex-1 rounded-lg bg-white shadow">
                        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {tabs.find(t => t.id === activeTab)?.name}
                            </h2>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-lg bg-[#c9a962] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b08d4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="h-4 w-4" />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Branding */}
                            {activeTab === 'branding' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Site Name
                                        </label>
                                        <input
                                            type="text"
                                            value={data.site_name}
                                            onChange={(e) => updateField('site_name', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                            placeholder="Hyve Wellness"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tagline
                                        </label>
                                        <input
                                            type="text"
                                            value={data.site_tagline}
                                            onChange={(e) => updateField('site_tagline', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                            placeholder="Premium Peptide Therapy & Telehealth"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Site Description
                                        </label>
                                        <textarea
                                            value={data.site_description}
                                            onChange={(e) => updateField('site_description', e.target.value)}
                                            rows={3}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                            placeholder="Describe your site in a few sentences..."
                                        />
                                    </div>
                                    
                                    {/* Logo Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Site Logo
                                        </label>
                                        <div className="flex items-start gap-4">
                                            {/* Logo Preview */}
                                            <div className="w-40 h-24 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden relative group">
                                                {data.site_logo ? (
                                                    <>
                                                        <img 
                                                            src={data.site_logo} 
                                                            alt="Site Logo" 
                                                            className="max-w-full max-h-full object-contain p-2"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <label className="p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-100">
                                                                <Upload className="w-4 h-4 text-gray-600" />
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            const formData = new FormData();
                                                                            formData.append('file', file);
                                                                            formData.append('folder', 'branding');
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
                                                                                    updateField('site_logo', result.url || result.path);
                                                                                }
                                                                            } catch (error) {
                                                                                console.error('Upload failed:', error);
                                                                            }
                                                                        }
                                                                    }}
                                                                />
                                                            </label>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateField('site_logo', '')}
                                                                className="p-2 bg-white rounded-lg hover:bg-red-50"
                                                            >
                                                                <X className="w-4 h-4 text-red-500" />
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                                                        <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                                                        <span className="text-xs text-gray-400">Upload Logo</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const formData = new FormData();
                                                                    formData.append('file', file);
                                                                    formData.append('folder', 'branding');
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
                                                                            updateField('site_logo', result.url || result.path);
                                                                        }
                                                                    } catch (error) {
                                                                        console.error('Upload failed:', error);
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                            {/* URL Input */}
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={data.site_logo}
                                                    onChange={(e) => updateField('site_logo', e.target.value)}
                                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                                    placeholder="/images/logo.png or upload an image"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Upload an image or enter a URL. Recommended: PNG with transparent background, 200x60px
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Favicon Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Favicon
                                        </label>
                                        <div className="flex items-start gap-4">
                                            {/* Favicon Preview */}
                                            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden relative group">
                                                {data.site_favicon ? (
                                                    <>
                                                        <img 
                                                            src={data.site_favicon} 
                                                            alt="Favicon" 
                                                            className="max-w-full max-h-full object-contain p-1"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <label className="p-1.5 bg-white rounded-lg cursor-pointer hover:bg-gray-100">
                                                                <Upload className="w-3 h-3 text-gray-600" />
                                                                <input
                                                                    type="file"
                                                                    accept="image/*,.ico"
                                                                    className="hidden"
                                                                    onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            const formData = new FormData();
                                                                            formData.append('file', file);
                                                                            formData.append('folder', 'branding');
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
                                                                                    updateField('site_favicon', result.url || result.path);
                                                                                }
                                                                            } catch (error) {
                                                                                console.error('Upload failed:', error);
                                                                            }
                                                                        }
                                                                    }}
                                                                />
                                                            </label>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                                                        <ImageIcon className="w-5 h-5 text-gray-300 mb-1" />
                                                        <span className="text-[10px] text-gray-400">Upload</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*,.ico"
                                                            className="hidden"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const formData = new FormData();
                                                                    formData.append('file', file);
                                                                    formData.append('folder', 'branding');
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
                                                                            updateField('site_favicon', result.url || result.path);
                                                                        }
                                                                    } catch (error) {
                                                                        console.error('Upload failed:', error);
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                            {/* URL Input */}
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={data.site_favicon}
                                                    onChange={(e) => updateField('site_favicon', e.target.value)}
                                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                                    placeholder="/images/favicon.ico or upload"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Browser tab icon. Recommended: 32x32px ICO or PNG
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Colors */}
                            {activeTab === 'colors' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Primary Color
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={data.primary_color}
                                                onChange={(e) => updateField('primary_color', e.target.value)}
                                                className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={data.primary_color}
                                                onChange={(e) => updateField('primary_color', e.target.value)}
                                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Used for buttons, links, and accent elements
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Secondary Color
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={data.secondary_color}
                                                onChange={(e) => updateField('secondary_color', e.target.value)}
                                                className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={data.secondary_color}
                                                onChange={(e) => updateField('secondary_color', e.target.value)}
                                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Used for headers, footers, and dark sections
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Background Color
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={data.background_color}
                                                onChange={(e) => updateField('background_color', e.target.value)}
                                                className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={data.background_color}
                                                onChange={(e) => updateField('background_color', e.target.value)}
                                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Used for page backgrounds
                                        </p>
                                    </div>

                                    {/* Color preview */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
                                        <div className="flex gap-4">
                                            <div
                                                className="w-24 h-24 rounded-lg shadow-sm flex items-center justify-center text-white text-xs font-medium"
                                                style={{ backgroundColor: data.primary_color }}
                                            >
                                                Primary
                                            </div>
                                            <div
                                                className="w-24 h-24 rounded-lg shadow-sm flex items-center justify-center text-white text-xs font-medium"
                                                style={{ backgroundColor: data.secondary_color }}
                                            >
                                                Secondary
                                            </div>
                                            <div
                                                className="w-24 h-24 rounded-lg shadow-sm flex items-center justify-center text-gray-700 text-xs font-medium border"
                                                style={{ backgroundColor: data.background_color }}
                                            >
                                                Background
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Typography */}
                            {activeTab === 'typography' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Heading Font
                                        </label>
                                        <select
                                            value={data.font_heading}
                                            onChange={(e) => updateField('font_heading', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                        >
                                            {fontOptions.map((font) => (
                                                <option key={font.value} value={font.value}>
                                                    {font.label}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                                            <p
                                                className="text-2xl"
                                                style={{ fontFamily: data.font_heading }}
                                            >
                                                The quick brown fox jumps over the lazy dog
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Body Font
                                        </label>
                                        <select
                                            value={data.font_body}
                                            onChange={(e) => updateField('font_body', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                        >
                                            {fontOptions.map((font) => (
                                                <option key={font.value} value={font.value}>
                                                    {font.label}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                                            <p style={{ fontFamily: data.font_body }}>
                                                The quick brown fox jumps over the lazy dog. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Contact */}
                            {activeTab === 'contact' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <Mail className="inline-block h-4 w-4 mr-1" />
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={data.contact_email}
                                            onChange={(e) => updateField('contact_email', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                            placeholder="hello@hyvewellness.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <Phone className="inline-block h-4 w-4 mr-1" />
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={data.contact_phone}
                                            onChange={(e) => updateField('contact_phone', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                            placeholder="1-800-HYVE-RX"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <MapPin className="inline-block h-4 w-4 mr-1" />
                                            Address
                                        </label>
                                        <textarea
                                            value={data.contact_address}
                                            onChange={(e) => updateField('contact_address', e.target.value)}
                                            rows={2}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                            placeholder="123 Wellness Street, Suite 100, Austin, TX 78701"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Business Hours
                                        </label>
                                        <input
                                            type="text"
                                            value={data.business_hours}
                                            onChange={(e) => updateField('business_hours', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                            placeholder="Mon-Fri: 9am-6pm CST"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Social */}
                            {activeTab === 'social' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <Facebook className="inline-block h-4 w-4 mr-1" />
                                            Facebook URL
                                        </label>
                                        <input
                                            type="url"
                                            value={data.social_facebook}
                                            onChange={(e) => updateField('social_facebook', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                            placeholder="https://facebook.com/hyvewellness"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <Instagram className="inline-block h-4 w-4 mr-1" />
                                            Instagram URL
                                        </label>
                                        <input
                                            type="url"
                                            value={data.social_instagram}
                                            onChange={(e) => updateField('social_instagram', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                            placeholder="https://instagram.com/hyvewellness"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <Linkedin className="inline-block h-4 w-4 mr-1" />
                                            LinkedIn URL
                                        </label>
                                        <input
                                            type="url"
                                            value={data.social_linkedin}
                                            onChange={(e) => updateField('social_linkedin', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                            placeholder="https://linkedin.com/company/hyvewellness"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <Twitter className="inline-block h-4 w-4 mr-1" />
                                            Twitter/X URL
                                        </label>
                                        <input
                                            type="url"
                                            value={data.social_twitter}
                                            onChange={(e) => updateField('social_twitter', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                            placeholder="https://twitter.com/hyvewellness"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <Youtube className="inline-block h-4 w-4 mr-1" />
                                            YouTube URL
                                        </label>
                                        <input
                                            type="url"
                                            value={data.social_youtube}
                                            onChange={(e) => updateField('social_youtube', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                            placeholder="https://youtube.com/@hyvewellness"
                                        />
                                    </div>
                                </>
                            )}

                            {/* SEO */}
                            {activeTab === 'seo' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Default Meta Title
                                        </label>
                                        <input
                                            type="text"
                                            value={data.seo_title}
                                            onChange={(e) => updateField('seo_title', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                            placeholder="Hyve Wellness - Premium Peptide Therapy & Telehealth"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            {data.seo_title.length}/60 characters recommended
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Default Meta Description
                                        </label>
                                        <textarea
                                            value={data.seo_description}
                                            onChange={(e) => updateField('seo_description', e.target.value)}
                                            rows={3}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                            placeholder="Experience personalized peptide therapy from the comfort of your home..."
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            {data.seo_description.length}/160 characters recommended
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            SEO Keywords
                                        </label>
                                        <input
                                            type="text"
                                            value={data.seo_keywords}
                                            onChange={(e) => updateField('seo_keywords', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                            placeholder="peptide therapy, semaglutide, weight loss, telehealth"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Comma-separated keywords
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Google Analytics ID
                                        </label>
                                        <input
                                            type="text"
                                            value={data.google_analytics_id}
                                            onChange={(e) => updateField('google_analytics_id', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                            placeholder="G-XXXXXXXXXX"
                                        />
                                    </div>

                                    {/* SEO Preview */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                                            Google Search Preview
                                        </h4>
                                        <div className="p-4 bg-gray-50 rounded-lg max-w-xl">
                                            <p className="text-blue-600 text-lg hover:underline cursor-pointer truncate">
                                                {data.seo_title || 'Page Title'}
                                            </p>
                                            <p className="text-green-700 text-sm">
                                                https://yourdomain.com
                                            </p>
                                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                                {data.seo_description || 'Meta description will appear here...'}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Integrations */}
                            {activeTab === 'integrations' && (
                                <>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                        <h4 className="text-sm font-medium text-blue-900 mb-1">Integration Settings</h4>
                                        <p className="text-sm text-blue-700">
                                            Configure URLs for patient portal, intake forms, and other integrations.
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <ExternalLink className="inline-block h-4 w-4 mr-1" />
                                            Workflow/Intake Base URL
                                        </label>
                                        <input
                                            type="url"
                                            value={data.workflow_base_url}
                                            onChange={(e) => updateField('workflow_base_url', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                            placeholder="https://intake.hyvewellness.com"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Base URL for intake forms and workflows
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <ExternalLink className="inline-block h-4 w-4 mr-1" />
                                            Patient Login URL
                                        </label>
                                        <input
                                            type="url"
                                            value={data.patient_login_url}
                                            onChange={(e) => updateField('patient_login_url', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                            placeholder="https://hyve.tryvitalcare.com/login"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            URL for the patient portal login page
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <ExternalLink className="inline-block h-4 w-4 mr-1" />
                                            Get Started URL
                                        </label>
                                        <input
                                            type="url"
                                            value={data.get_started_url}
                                            onChange={(e) => updateField('get_started_url', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                                            placeholder="https://hyve.tryvitalcare.com/get-started"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            URL for the main "Get Started" CTA buttons
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Chat Widget
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={data.chat_widget_enabled === 'true'}
                                                    onChange={(e) => updateField('chat_widget_enabled', e.target.checked ? 'true' : 'false')}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#c9a962]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c9a962]"></div>
                                            </label>
                                            <span className="text-sm text-gray-600">
                                                {data.chat_widget_enabled === 'true' ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Enable or disable the chat widget on the frontend
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}

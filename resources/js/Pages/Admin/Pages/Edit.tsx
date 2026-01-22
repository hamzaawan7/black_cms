import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Save, Trash2, LayoutTemplate } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, SlugInput, Textarea, Switch, MediaUploader } from '@/Components/Admin';
import SectionBuilder from '@/Components/Admin/SectionBuilder';
import { useSweetAlert } from '@/hooks/useSweetAlert';

interface SectionData {
    id: number;
    component_type: string;
    order: number;
    is_visible: boolean;
    content: Record<string, any>;
    styles: Record<string, any>;
    settings: Record<string, any>;
}

interface ComponentType {
    name: string;
    description: string;
    fields: string[];
}

interface Page {
    id: number;
    title: string;
    slug: string;
    meta: {
        title: string | null;
        description: string | null;
        keywords: string | null;
        og_image: string | null;
    };
    is_published: boolean;
    order: number;
    sections?: SectionData[];
    created_at: string;
    updated_at: string;
}

interface Template {
    id: number;
    name: string;
}

interface EditProps {
    page: Page | { data: Page };
    templates: Template[];
    componentTypes?: Record<string, ComponentType>;
}

export default function Edit({ page: pageProp, templates = [], componentTypes = {} }: EditProps) {
    // Handle wrapped resource data
    const page = 'data' in pageProp ? pageProp.data : pageProp;
    const { confirmDelete, showDeletedSuccess, errorNotification } = useSweetAlert();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    // Default component types if not provided
    const defaultComponentTypes: Record<string, ComponentType> = {
        // === HOME PAGE BLOCKS ===
        hero: { name: 'Hero Section', description: 'Full-width hero with background image and text', fields: ['title', 'subtitle', 'background_image', 'cta_text', 'cta_link'] },
        text: { name: 'Text Block', description: 'Rich text content section', fields: ['content'] },
        services_grid: { name: 'Services Grid', description: 'Grid display of services', fields: ['title', 'subtitle', 'columns', 'show_popular'] },
        testimonials: { name: 'Testimonials', description: 'Customer testimonials carousel', fields: ['title', 'layout'] },
        faq: { name: 'FAQ Section', description: 'Frequently asked questions accordion', fields: ['title', 'category'] },
        team: { name: 'Team Section', description: 'Team members grid', fields: ['title', 'subtitle', 'columns'] },
        contact: { name: 'Contact Section', description: 'Contact form and information', fields: ['title', 'subtitle', 'show_form', 'show_map'] },
        cta: { name: 'Call to Action', description: 'Call to action banner', fields: ['title', 'subtitle', 'button_text', 'button_link', 'background'] },
        image_gallery: { name: 'Image Gallery', description: 'Image gallery grid', fields: ['title', 'columns', 'images'] },
        custom: { name: 'Custom HTML', description: 'Custom HTML/CSS content', fields: ['html_content', 'css_content'] },
        
        // === ABOUT PAGE BLOCKS ===
        about_hero: { name: 'About Hero', description: 'Hero section for about page', fields: ['preTitle', 'title', 'titleHighlight', 'description'] },
        about_mission: { name: 'About Mission', description: 'Mission statement section', fields: ['preTitle', 'title', 'description', 'items'] },
        about_story: { name: 'About Story', description: 'Company story section', fields: ['preTitle', 'title', 'description', 'image', 'button'] },
        about_values: { name: 'About Values', description: 'Core values grid', fields: ['preTitle', 'title', 'description', 'values'] },
        about_team: { name: 'About Team', description: 'Team members section', fields: ['preTitle', 'title', 'description', 'team'] },
        about_cta: { name: 'About CTA', description: 'About page call to action', fields: ['title', 'description', 'buttonText', 'buttonLink'] },
        
        // === SERVICES PAGE BLOCKS ===
        services_hero: { name: 'Services Hero', description: 'Hero section for services page', fields: ['preTitle', 'title', 'titleHighlight', 'description'] },
        services_categories: { name: 'Services Categories', description: 'Category filter tabs', fields: ['categories'] },
        services_cta: { name: 'Services CTA', description: 'Services page call to action bar', fields: ['preTitle', 'title', 'buttonText', 'buttonLink'] },
        
        // === CONTACT PAGE BLOCKS ===
        contact_hero: { name: 'Contact Hero', description: 'Hero section for contact page', fields: ['preTitle', 'title', 'description'] },
        contact_form: { name: 'Contact Form', description: 'Contact form with customizable fields', fields: ['title', 'subtitle', 'submitText', 'fields'] },
        contact_info_cards: { name: 'Contact Info Cards', description: 'Contact information cards (phone, email, hours)', fields: ['cards', 'columns'] },
        contact_cta: { name: 'Contact CTA', description: 'Contact page call to action', fields: ['icon', 'title', 'description', 'buttonText', 'buttonLink'] },
    };
    
    const mergedComponentTypes = { ...defaultComponentTypes, ...componentTypes };

    const { data, setData, put, processing, errors } = useForm({
        title: page.title || '',
        slug: page.slug || '',
        meta_title: page.meta?.title || '',
        meta_description: page.meta?.description || '',
        meta_keywords: page.meta?.keywords || '',
        og_image: page.meta?.og_image || '',
        is_published: page.is_published ?? false,
        order: page.order ?? 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/pages/${page.id}`, {
            preserveScroll: true,
        });
    };

    const handleDelete = async () => {
        const result = await confirmDelete(page.title);
        if (result.isConfirmed) {
            router.delete(`/admin/pages/${page.id}`, {
                onSuccess: () => {
                    showDeletedSuccess(page.title);
                    router.visit('/admin/pages');
                },
                onError: () => errorNotification('Failed to delete page'),
            });
        }
    };



    return (
        <AdminLayout header={`Edit Page: ${page.title}`}>
            <Head title={`Edit Page: ${page.title}`} />

            <div className="max-w-4xl mx-auto">
                {/* Back button */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        href="/admin/pages"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Pages
                    </Link>
                    <Button
                        variant="danger"
                        onClick={() => setShowDeleteModal(true)}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Page
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                label="Page Title"
                                name="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                error={errors.title}
                                required
                            />
                            <SlugInput
                                label="Slug"
                                name="slug"
                                value={data.slug}
                                sourceValue={data.title}
                                onChange={(value) => setData('slug', value)}
                                error={errors.slug}
                                hint="URL-friendly identifier (auto-generated from title)"
                                autoGenerate={!data.slug}
                            />

                            <Input
                                label="Display Order"
                                name="order"
                                type="number"
                                value={data.order}
                                onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                error={errors.order}
                            />
                        </CardContent>
                    </Card>

                    {/* SEO Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>SEO Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                label="Meta Title"
                                name="meta_title"
                                value={data.meta_title}
                                onChange={(e) => setData('meta_title', e.target.value)}
                                error={errors.meta_title}
                                hint="If empty, page title will be used"
                            />

                            <Textarea
                                label="Meta Description"
                                name="meta_description"
                                value={data.meta_description}
                                onChange={(e) => setData('meta_description', e.target.value)}
                                error={errors.meta_description}
                                rows={3}
                                hint="Brief description for search engines (150-160 characters recommended)"
                            />

                            <Input
                                label="Meta Keywords"
                                name="meta_keywords"
                                value={data.meta_keywords}
                                onChange={(e) => setData('meta_keywords', e.target.value)}
                                error={errors.meta_keywords}
                                hint="Comma-separated keywords"
                            />

                            <MediaUploader
                                label="OG Image"
                                value={data.og_image}
                                onChange={(value) => setData('og_image', value as string || '')}
                                accept="image/*"
                                hint="Social media sharing image"
                            />
                        </CardContent>
                    </Card>

                    {/* Sections Builder */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LayoutTemplate className="h-5 w-5 text-[#c9a962]" />
                                Page Sections
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SectionBuilder
                                pageId={page.id}
                                sections={page.sections || []}
                                componentTypes={mergedComponentTypes}
                            />
                        </CardContent>
                    </Card>

                    {/* Publishing */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Publishing</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Switch
                                label="Published"
                                name="is_published"
                                checked={data.is_published}
                                onChange={(checked) => setData('is_published', checked)}
                            />
                            <p className="text-sm text-gray-500 mt-1">Make this page visible on the website</p>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <Link
                            href="/admin/pages"
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Page</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{page.title}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="danger"
                                onClick={handleDelete}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

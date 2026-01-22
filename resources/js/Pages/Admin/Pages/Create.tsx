import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, SlugInput, Textarea, Switch, MediaUploader } from '@/Components/Admin';
import { FormEventHandler } from 'react';

interface Template {
    id: number;
    name: string;
}

interface CreateProps {
    templates: Template[];
}

export default function Create({ templates = [] }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        slug: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        og_image: '',
        is_published: false,
        order: 0,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/admin/pages');
    };


    return (
        <AdminLayout header="Create Page">
            <Head title="Create Page" />

            <div className="max-w-4xl mx-auto">
                {/* Back button */}
                <Link
                    href="/admin/pages"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Pages
                </Link>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    autoGenerate={true}
                                />
                            </div>

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
                            {processing ? 'Creating...' : 'Create Page'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

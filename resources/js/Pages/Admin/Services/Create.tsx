import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, SlugInput, Textarea, Select, Switch, MediaUploader } from '@/Components/Admin';
import { FormEventHandler } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface CreateProps {
    categories: Category[];
}

export default function Create({ categories = [] }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        description: '',
        short_description: '',
        headline: '',
        pricing: '',
        get_started_url: '',
        category_id: '',
        image: '',
        secondary_image: '',
        vial_image: '',
        content: '',
        what_is: '',
        benefits: '',
        stats: '',
        is_published: false,
        is_popular: false,
        order: 0,
    });

    const categoryOptions = categories.map((cat) => ({
        value: cat.id,
        label: cat.name,
    }));

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/admin/services');
    };


    return (
        <AdminLayout header="Create Service">
            <Head title="Create Service" />

            <div className="max-w-4xl mx-auto">
                {/* Back button */}
                <Link
                    href="/admin/services"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Services
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
                                    label="Service Name"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    error={errors.name}
                                    required
                                />
                                <SlugInput
                                    label="Slug"
                                    name="slug"
                                    value={data.slug}
                                    sourceValue={data.name}
                                    onChange={(value) => setData('slug', value)}
                                    error={errors.slug}
                                    hint="URL-friendly identifier (auto-generated from name)"
                                    autoGenerate={true}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select
                                    label="Category"
                                    name="category_id"
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    options={categoryOptions}
                                    placeholder="Select a category"
                                    error={errors.category_id}
                                    required
                                />
                                <Input
                                    label="Pricing"
                                    name="pricing"
                                    value={data.pricing}
                                    onChange={(e) => setData('pricing', e.target.value)}
                                    error={errors.pricing}
                                    placeholder="e.g., Starting at $299"
                                />
                            </div>

                            <Input
                                label="Headline"
                                name="headline"
                                value={data.headline}
                                onChange={(e) => setData('headline', e.target.value)}
                                error={errors.headline}
                                hint="A short catchy headline for the service"
                            />

                            <Textarea
                                label="Short Description"
                                name="short_description"
                                value={data.short_description}
                                onChange={(e) => setData('short_description', e.target.value)}
                                error={errors.short_description}
                                rows={2}
                                hint="Brief description shown on service cards and grids"
                            />

                            <Textarea
                                label="Full Description"
                                name="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                error={errors.description}
                                rows={3}
                                hint="Detailed description for the service page"
                            />

                            <Input
                                label="Get Started URL"
                                name="get_started_url"
                                value={data.get_started_url}
                                onChange={(e) => setData('get_started_url', e.target.value)}
                                error={errors.get_started_url}
                                placeholder="https://intake.hyvewellness.com/service-name"
                                hint="Custom URL for the 'Get Started' button (leave empty for default)"
                            />
                        </CardContent>
                    </Card>

                    {/* Images */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Images</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <MediaUploader
                                    label="Main Image"
                                    value={data.image}
                                    onChange={(value) => setData('image', value as string || '')}
                                    accept="image/*"
                                    error={errors.image}
                                />
                                <MediaUploader
                                    label="Secondary Image"
                                    value={data.secondary_image}
                                    onChange={(value) => setData('secondary_image', value as string || '')}
                                    accept="image/*"
                                    error={errors.secondary_image}
                                />
                                <MediaUploader
                                    label="Vial Image"
                                    value={data.vial_image}
                                    onChange={(value) => setData('vial_image', value as string || '')}
                                    accept="image/*"
                                    error={errors.vial_image}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Content */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Content</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                label="What Is It?"
                                name="what_is"
                                value={data.what_is}
                                onChange={(e) => setData('what_is', e.target.value)}
                                error={errors.what_is}
                                rows={4}
                                hint="Explain what this service is"
                            />
                            <Textarea
                                label="Benefits"
                                name="benefits"
                                value={data.benefits}
                                onChange={(e) => setData('benefits', e.target.value)}
                                error={errors.benefits}
                                rows={4}
                                hint="JSON array of benefits or comma-separated list"
                            />
                            <Textarea
                                label="Stats"
                                name="stats"
                                value={data.stats}
                                onChange={(e) => setData('stats', e.target.value)}
                                error={errors.stats}
                                rows={4}
                                hint="JSON array of statistics"
                            />
                            <Textarea
                                label="Full Content"
                                name="content"
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                error={errors.content}
                                rows={6}
                                hint="Rich content for the service page (supports HTML)"
                            />
                        </CardContent>
                    </Card>

                    {/* Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
                                <Switch
                                    label="Published"
                                    description="Make this service visible on the website"
                                    checked={data.is_published}
                                    onChange={(checked) => setData('is_published', checked)}
                                />
                                <Switch
                                    label="Popular"
                                    description="Show in popular services section"
                                    checked={data.is_popular}
                                    onChange={(checked) => setData('is_popular', checked)}
                                />
                            </div>
                            <Input
                                label="Display Order"
                                name="order"
                                type="number"
                                value={data.order}
                                onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                error={errors.order}
                                className="max-w-[150px]"
                            />
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <Link
                            href="/admin/services"
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                        >
                            Cancel
                        </Link>
                        <Button
                            type="submit"
                            loading={processing}
                            icon={<Save className="h-4 w-4" />}
                        >
                            Create Service
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

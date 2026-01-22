import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Save, FolderTree } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, SlugInput, Textarea, Switch, MediaUploader } from '@/Components/Admin';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        description: '',
        icon: '',
        image: '',
        order: 0,
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/service-categories');
    };

    return (
        <AdminLayout header="Create Category">
            <Head title="Create Category" />

            <div className="max-w-2xl mx-auto">
                {/* Back button */}
                <div className="mb-6">
                    <Link
                        href="/admin/service-categories"
                        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Categories
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FolderTree className="h-5 w-5 text-[#c9a962]" />
                                Category Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                label="Category Name"
                                name="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                                required
                                placeholder="e.g., Peptide Therapy"
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

                            <Textarea
                                label="Description"
                                name="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                error={errors.description}
                                rows={3}
                                placeholder="Brief description of this category..."
                            />

                            <Input
                                label="Icon (Emoji or Icon Code)"
                                name="icon"
                                value={data.icon}
                                onChange={(e) => setData('icon', e.target.value)}
                                error={errors.icon}
                                hint="Enter an emoji (e.g., 💊) or icon code"
                                placeholder="💊"
                            />

                            <MediaUploader
                                label="Category Image"
                                value={data.image}
                                onChange={(value) => setData('image', value as string || '')}
                                accept="image/*"
                                hint="Optional image for the category"
                            />

                            <Input
                                label="Display Order"
                                name="order"
                                type="number"
                                value={data.order}
                                onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                error={errors.order}
                                hint="Lower numbers appear first"
                            />
                        </CardContent>
                    </Card>

                    {/* Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Switch
                                label="Active"
                                name="is_active"
                                checked={data.is_active}
                                onChange={(checked) => setData('is_active', checked)}
                            />
                            <p className="text-sm text-slate-500 mt-1">
                                Active categories are visible on the website
                            </p>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <Link
                            href="/admin/service-categories"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Creating...' : 'Create Category'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

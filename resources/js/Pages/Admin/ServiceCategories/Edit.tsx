import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Save, Trash2, FolderTree } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, SlugInput, Textarea, Switch, MediaUploader } from '@/Components/Admin';
import { useSweetAlert } from '@/hooks/useSweetAlert';

interface ServiceCategory {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    image: string | null;
    order: number;
    is_active: boolean;
}

interface EditProps {
    category: ServiceCategory | { data: ServiceCategory };
}

export default function Edit({ category: categoryProp }: EditProps) {
    // Handle wrapped resource data
    const category = 'data' in categoryProp ? categoryProp.data : categoryProp;
    const { confirmDelete, showDeletedSuccess, errorNotification, successNotification } = useSweetAlert();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        icon: category.icon || '',
        image: category.image || '',
        order: category.order ?? 0,
        is_active: category.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/service-categories/${category.id}`, {
            preserveScroll: true,
            onSuccess: () => successNotification('Category updated successfully!'),
            onError: () => errorNotification('Failed to update category'),
        });
    };

    const handleDelete = async () => {
        const result = await confirmDelete(category.name);
        if (result.isConfirmed) {
            router.delete(`/admin/service-categories/${category.id}`, {
                onSuccess: () => {
                    showDeletedSuccess(category.name);
                    router.visit('/admin/service-categories');
                },
                onError: () => errorNotification('Failed to delete category'),
            });
        }
    };


    return (
        <AdminLayout header={`Edit Category: ${category.name}`}>
            <Head title={`Edit Category: ${category.name}`} />

            <div className="max-w-2xl mx-auto">
                {/* Header with back and delete */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        href="/admin/service-categories"
                        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Categories
                    </Link>
                    <Button
                        variant="danger"
                        onClick={() => setShowDeleteModal(true)}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
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
                            />
                            
                            <SlugInput
                                label="Slug"
                                name="slug"
                                value={data.slug}
                                sourceValue={data.name}
                                onChange={(value) => setData('slug', value)}
                                error={errors.slug}
                                hint="URL-friendly identifier (auto-generated from name)"
                                autoGenerate={!data.slug}
                            />

                            <Textarea
                                label="Description"
                                name="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                error={errors.description}
                                rows={3}
                            />

                            <Input
                                label="Icon (Emoji or Icon Code)"
                                name="icon"
                                value={data.icon}
                                onChange={(e) => setData('icon', e.target.value)}
                                error={errors.icon}
                                hint="Enter an emoji (e.g., 💊) or icon code"
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
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Category</h3>
                        <p className="text-slate-600 mb-6">
                            Are you sure you want to delete "{category.name}"? Services in this category will be uncategorized. This action cannot be undone.
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
                                Delete Category
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

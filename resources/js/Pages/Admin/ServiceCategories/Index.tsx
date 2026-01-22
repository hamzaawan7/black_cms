import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, FolderTree, Package, GripVertical } from 'lucide-react';
import { useState } from 'react';
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
    services_count?: number;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface IndexProps {
    categories: ServiceCategory[] | PaginatedData<ServiceCategory>;
}

export default function Index({ categories: categoriesProp }: IndexProps) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    
    // Handle both array and paginated data
    const categories = Array.isArray(categoriesProp)
        ? categoriesProp
        : categoriesProp?.data || [];

    const { confirmDelete, showDeletedSuccess, errorNotification } = useSweetAlert();

    const handleDelete = async (id: number, name: string) => {
        const result = await confirmDelete(name);
        if (result.isConfirmed) {
            setDeletingId(id);
            router.delete(`/admin/service-categories/${id}`, {
                onFinish: () => setDeletingId(null),
                onSuccess: () => showDeletedSuccess(name),
                onError: () => errorNotification('Failed to delete category'),
            });
        }
    };

    const handleToggleActive = (category: ServiceCategory) => {
        router.put(`/admin/service-categories/${category.id}`, {
            ...category,
            is_active: !category.is_active,
        }, {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout header="Service Categories">
            <Head title="Service Categories" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-slate-600">
                        Organize your services into categories for easier navigation.
                    </p>
                </div>
                <Link
                    href="/admin/service-categories/create"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#c9a962] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#b08d4a] transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Add Category
                </Link>
            </div>

            {/* Categories Grid */}
            {categories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                        >
                            {/* Gradient Bar */}
                            <div className={`h-1.5 ${category.is_active ? 'bg-gradient-to-r from-[#c9a962] via-[#d4b978] to-[#c9a962]' : 'bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300'}`} />
                            
                            {/* Category Image/Icon Header */}
                            <div className="relative h-32 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                                {category.image ? (
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#c9a962]/10">
                                        {category.icon ? (
                                            <span className="text-3xl">{category.icon}</span>
                                        ) : (
                                            <FolderTree className="h-8 w-8 text-[#c9a962]" />
                                        )}
                                    </div>
                                )}
                                
                                {/* Order Badge */}
                                <div className="absolute top-3 left-3">
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-white/90 backdrop-blur-sm px-2 py-1 text-xs font-medium text-gray-600 shadow-sm">
                                        <GripVertical className="h-3 w-3" />
                                        {category.order}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                {/* Header with Toggle */}
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                                            {category.name}
                                        </h3>
                                        <code className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                            /{category.slug}
                                        </code>
                                    </div>
                                    {/* Toggle Switch */}
                                    <button
                                        onClick={() => handleToggleActive(category)}
                                        className={`relative w-11 h-6 rounded-full transition-colors ${category.is_active ? 'bg-[#c9a962]' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${category.is_active ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>

                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                    {category.description || 'No description provided'}
                                </p>
                                
                                {/* Stats */}
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl mb-4">
                                    <Package className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">
                                        {category.services_count ?? 0} services
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                    <Link
                                        href={`/admin/service-categories/${category.id}/edit`}
                                        className="flex-1 h-9 rounded-xl bg-[#c9a962]/10 text-xs font-semibold text-[#c9a962] hover:bg-[#c9a962]/20 transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(category.id, category.name)}
                                        disabled={deletingId === category.id}
                                        className="h-9 w-9 rounded-xl bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50 flex items-center justify-center"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                    <div className="py-16 px-8 text-center">
                        <div className="mx-auto h-16 w-16 rounded-2xl bg-[#c9a962]/10 flex items-center justify-center mb-4">
                            <FolderTree className="h-8 w-8 text-[#c9a962]" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories yet</h3>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                            Categories help organize your services. Create your first category to get started.
                        </p>
                        <Link
                            href="/admin/service-categories/create"
                            className="inline-flex items-center gap-2 h-11 rounded-xl bg-[#c9a962] px-5 text-sm font-semibold text-white shadow-lg shadow-[#c9a962]/20 hover:bg-[#b08d4a] transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Create First Category
                        </Link>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

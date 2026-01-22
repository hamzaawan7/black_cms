import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Component, ToggleLeft, ToggleRight, Lock, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { useSweetAlert } from '@/hooks/useSweetAlert';

interface Field {
    name: string;
    label: string;
    type: string;
    required?: boolean;
    placeholder?: string;
    default?: any;
    options?: Record<string, string>;
}

interface ComponentTypeData {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    fields: Field[];
    is_active: boolean;
    is_system: boolean;
    order: number;
}

interface IndexProps {
    componentTypes: ComponentTypeData[];
    fieldTypes: Record<string, string>;
}

export default function Index({ componentTypes, fieldTypes }: IndexProps) {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { confirmDelete, showDeletedSuccess, errorNotification, error: showError, Swal } = useSweetAlert();

    const handleDelete = async (id: number, name: string, isSystem: boolean) => {
        if (isSystem) {
            showError('Cannot Delete', 'System component types cannot be deleted.');
            return;
        }
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You won't be able to revert this! "${name}" will be permanently deleted. Existing sections using this type may not render correctly.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        });
        if (result.isConfirmed) {
            setDeletingId(id);
            router.delete(`/admin/component-types/${id}`, {
                onFinish: () => setDeletingId(null),
                onSuccess: () => showDeletedSuccess(name),
                onError: () => errorNotification('Failed to delete component type'),
            });
        }
    };

    const handleToggleActive = (componentType: ComponentTypeData) => {
        router.post(`/admin/component-types/${componentType.id}/toggle-active`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout header="Component Types">
            <Head title="Component Types" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-slate-600">
                        Manage the section types available when building pages. Create custom components with your own fields.
                    </p>
                </div>
                <Link
                    href="/admin/component-types/create"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#c9a962] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#b08d4a] transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Add Component Type
                </Link>
            </div>

            {/* Component Types Cards */}
            {componentTypes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {componentTypes.map((componentType) => (
                        <div
                            key={componentType.id}
                            className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                        >
                            {/* Gradient Bar */}
                            <div className={`h-1.5 ${componentType.is_active ? 'bg-gradient-to-r from-[#c9a962] via-[#d4b978] to-[#c9a962]' : 'bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300'}`} />
                            
                            <div className="p-5">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c9a962]/10">
                                            <Component className="h-5 w-5 text-[#c9a962]" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900">{componentType.name}</h3>
                                                {componentType.is_system && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                                                        <Lock className="h-3 w-3" />
                                                        System
                                                    </span>
                                                )}
                                            </div>
                                            <code className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                {componentType.slug}
                                            </code>
                                        </div>
                                    </div>
                                    {/* Toggle Switch */}
                                    <button
                                        onClick={() => handleToggleActive(componentType)}
                                        className={`relative w-11 h-6 rounded-full transition-colors ${componentType.is_active ? 'bg-[#c9a962]' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${componentType.is_active ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* Description */}
                                {componentType.description && (
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                        {componentType.description}
                                    </p>
                                )}

                                {/* Fields */}
                                <div className="mb-4">
                                    <p className="text-xs font-medium text-gray-500 mb-2">Fields ({componentType.fields.length})</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {componentType.fields.slice(0, 4).map((field) => (
                                            <span
                                                key={field.name}
                                                className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700"
                                            >
                                                {field.label}
                                            </span>
                                        ))}
                                        {componentType.fields.length > 4 && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                                                +{componentType.fields.length - 4} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                    <Link
                                        href={`/admin/component-types/${componentType.id}/edit`}
                                        className="flex-1 h-9 rounded-xl bg-[#c9a962]/10 text-xs font-semibold text-[#c9a962] hover:bg-[#c9a962]/20 transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit
                                    </Link>
                                    {!componentType.is_system && (
                                        <button
                                            onClick={() => handleDelete(componentType.id, componentType.name, componentType.is_system)}
                                            disabled={deletingId === componentType.id}
                                            className="h-9 w-9 rounded-xl bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50 flex items-center justify-center"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
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
                            <Component className="h-8 w-8 text-[#c9a962]" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No component types</h3>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                            Get started by creating a new component type.
                        </p>
                        <Link
                            href="/admin/component-types/create"
                            className="inline-flex items-center gap-2 h-11 rounded-xl bg-[#c9a962] px-5 text-sm font-semibold text-white shadow-lg shadow-[#c9a962]/20 hover:bg-[#b08d4a] transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Create Component Type
                        </Link>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

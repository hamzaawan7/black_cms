import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Edit, Trash2, Package, X, Search, Building2, Eye } from 'lucide-react';
import { useState } from 'react';
import { useSweetAlert } from '@/hooks/useSweetAlert';

interface Template {
    id: number;
    name: string;
    slug: string;
    preview_image?: string;
    description?: string;
    version?: string;
    supported_components?: string[];
    is_active: boolean;
    tenants_count: number;
    created_at: string;
}

interface PaginatedTemplates {
    data: Template[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
}

interface TemplatesIndexProps {
    templates: PaginatedTemplates;
    filters: {
        search?: string;
    };
}

export default function Index({ templates, filters = {} }: TemplatesIndexProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const { confirmDelete, showDeletedSuccess, errorNotification, successNotification } = useSweetAlert();

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        slug: '',
        preview_image: '',
        description: '',
        version: '1.0.0',
        is_active: true,
    });

    const openCreateModal = () => {
        reset();
        setEditingTemplate(null);
        setIsModalOpen(true);
    };

    const openEditModal = (template: Template) => {
        setEditingTemplate(template);
        setData({
            name: template.name,
            slug: template.slug,
            preview_image: template.preview_image || '',
            description: template.description || '',
            version: template.version || '1.0.0',
            is_active: template.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTemplate) {
            put(`/admin/templates/${editingTemplate.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    successNotification('Template updated successfully!');
                },
                onError: () => errorNotification('Failed to update template'),
            });
        } else {
            post('/admin/templates', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    successNotification('Template created successfully!');
                },
                onError: () => errorNotification('Failed to create template'),
            });
        }
    };

    const handleDelete = async (id: number, name: string) => {
        const result = await confirmDelete(name);
        if (result.isConfirmed) {
            router.delete(`/admin/templates/${id}`, {
                onSuccess: () => showDeletedSuccess(name),
                onError: () => errorNotification('Failed to delete template'),
            });
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/templates', { search }, { preserveState: true });
    };

    const toggleActive = (template: Template) => {
        router.post(`/admin/templates/${template.id}/toggle-active`);
    };

    return (
        <AdminLayout header="Templates">
            <Head title="Templates" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <p className="text-gray-600">
                    Manage website templates and themes.
                </p>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#c9a962] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b08d4a] transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Add Template
                </button>
            </div>

            {/* Filters */}
            <div className="mb-6">
                <form onSubmit={handleSearch} className="max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search templates..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                        />
                    </div>
                </form>
            </div>

            {/* Templates grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {templates.data.length > 0 ? (
                    templates.data.map((template) => (
                        <div
                            key={template.id}
                            className="group relative rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                        >
                            {/* Top gradient bar */}
                            <div className={`h-1.5 ${template.is_active ? 'bg-gradient-to-r from-[#c9a962] via-[#d4b978] to-[#c9a962]' : 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300'}`} />
                            
                            {/* Preview image */}
                            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-50 relative">
                                {template.preview_image ? (
                                    <>
                                        <img
                                            src={template.preview_image}
                                            alt={template.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => setPreviewImage(template.preview_image || null)}
                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                        >
                                            <Eye className="h-8 w-8 text-white" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <Package className="h-16 w-16 text-gray-200" />
                                    </div>
                                )}
                                {/* Version badge */}
                                {template.version && (
                                    <span className="absolute top-3 left-3 text-xs bg-black/50 text-white px-2 py-1 rounded-lg backdrop-blur-sm">
                                        v{template.version}
                                    </span>
                                )}
                            </div>

                            <div className="p-5">
                                {/* Title and Toggle */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0 pr-3">
                                        <h3 className="font-semibold text-lg text-gray-900 truncate">{template.name}</h3>
                                        <p className="text-sm text-gray-500 font-mono truncate">{template.slug}</p>
                                    </div>
                                    
                                    {/* Toggle Switch */}
                                    <button
                                        onClick={() => toggleActive(template)}
                                        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#c9a962] focus:ring-offset-2"
                                        style={{ backgroundColor: template.is_active ? '#c9a962' : '#d1d5db' }}
                                        role="switch"
                                        aria-checked={template.is_active}
                                    >
                                        <span className="sr-only">Toggle template status</span>
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                template.is_active ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {template.description && (
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {template.description}
                                    </p>
                                )}

                                {/* Tenants using */}
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 mb-4">
                                    <Building2 className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-700">{template.tenants_count}</span>
                                    <span className="text-sm text-blue-600">tenant{template.tenants_count !== 1 ? 's' : ''} using</span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => openEditModal(template)}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(template.id, template.name)}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={template.tenants_count > 0}
                                        title={template.tenants_count > 0 ? 'Cannot delete template in use' : ''}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full rounded-2xl bg-white shadow-sm border border-gray-100 p-12 text-center">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                            <Package className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No templates yet</h3>
                        <p className="text-sm text-gray-500 mb-4">Get started by creating your first template.</p>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#c9a962] hover:bg-[#b08d4a] rounded-xl transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Create Template
                        </button>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {templates.last_page > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-gray-700">
                        Showing page {templates.current_page} of {templates.last_page} ({templates.total} total)
                    </p>
                    <div className="flex gap-2">
                        {templates.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`px-3 py-1 rounded text-sm ${
                                    link.active
                                        ? 'bg-[#c9a962] text-white'
                                        : link.url
                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                    onClick={() => setPreviewImage(null)}
                >
                    <img
                        src={previewImage}
                        alt="Template preview"
                        className="max-w-[90vw] max-h-[90vh] object-contain"
                    />
                    <button
                        onClick={() => setPreviewImage(null)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300"
                    >
                        <X className="h-8 w-8" />
                    </button>
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center px-4 py-8">
                        <div
                            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                            {/* Modal Header */}
                            <div className="relative bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-8 py-6">
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                                </div>
                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                                            <Package className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">
                                                {editingTemplate ? 'Edit Template' : 'Create New Template'}
                                            </h3>
                                            <p className="text-sm text-white/60">
                                                {editingTemplate ? 'Update template details' : 'Set up a new website template'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                    >
                                        <X className="h-5 w-5 text-white" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                                <div className="p-8 space-y-6">
                                    {/* Basic Info */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-lg bg-[#c9a962]/10 flex items-center justify-center">
                                                <Package className="h-3.5 w-3.5 text-[#c9a962]" />
                                            </span>
                                            Basic Information
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                                    Template Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                                    placeholder="Modern Wellness"
                                                    required
                                                />
                                                {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                                    Slug
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.slug}
                                                    onChange={(e) => setData('slug', e.target.value)}
                                                    className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm font-mono bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                                    placeholder="auto-generated"
                                                />
                                                {errors.slug && <p className="mt-1.5 text-xs text-red-500">{errors.slug}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                                    Version
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.version}
                                                    onChange={(e) => setData('version', e.target.value)}
                                                    className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                                    placeholder="1.0.0"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                                    Preview Image URL
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.preview_image}
                                                    onChange={(e) => setData('preview_image', e.target.value)}
                                                    className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                                    placeholder="/images/templates/preview.png"
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                                    Description
                                                </label>
                                                <textarea
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    rows={3}
                                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all resize-none"
                                                    placeholder="A modern and elegant template for wellness businesses..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Toggle */}
                                    <div className="pt-4 border-t border-gray-100">
                                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-6 rounded-full relative transition-colors ${data.is_active ? 'bg-[#c9a962]' : 'bg-gray-300'}`}>
                                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${data.is_active ? 'right-1' : 'left-1'}`} />
                                                </div>
                                                <div>
                                                    <span className="text-sm font-semibold text-gray-700 block">Active Status</span>
                                                    <span className="text-xs text-gray-500">Template will be available for tenants</span>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                className="sr-only"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 h-12 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-white hover:border-gray-300 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 h-12 rounded-xl bg-[#c9a962] text-sm font-bold text-white hover:bg-[#b08d4a] disabled:opacity-50 transition-all shadow-lg shadow-[#c9a962]/20"
                                    >
                                        {processing ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

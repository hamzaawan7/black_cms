import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Edit, Trash2, Building2, X, Search, Users, Globe, Image as ImageIcon, LayoutTemplate, Copy } from 'lucide-react';
import { useState } from 'react';
import { useSweetAlert } from '@/hooks/useSweetAlert';

interface Template {
    id: number;
    name: string;
    preview_image?: string;
    description?: string;
}

interface Tenant {
    id: number;
    name: string;
    slug: string;
    domain?: string;
    logo?: string;
    favicon?: string;
    active_template_id?: number;
    active_template?: Template;
    settings?: Record<string, any>;
    is_active: boolean;
    users_count: number;
    created_at: string;
}

interface PaginatedTenants {
    data: Tenant[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
}

interface TenantsIndexProps {
    tenants: PaginatedTenants;
    filters: {
        search?: string;
    };
    templates?: Template[];
}

export default function Index({ tenants, filters = {}, templates = [] }: TenantsIndexProps) {
    const { confirmDelete, showDeletedSuccess, errorNotification, successNotification, Swal } = useSweetAlert();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    
    // Duplicate modal state
    const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
    const [duplicatingTenant, setDuplicatingTenant] = useState<Tenant | null>(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        slug: '',
        domain: '',
        logo: '',
        favicon: '',
        active_template_id: '' as string | number,
        is_active: true,
    });

    // Duplicate form
    const { 
        data: duplicateData, 
        setData: setDuplicateData, 
        post: postDuplicate, 
        processing: duplicateProcessing, 
        reset: resetDuplicate, 
        errors: duplicateErrors 
    } = useForm({
        name: '',
        domain: '',
    });

    const openCreateModal = () => {
        reset();
        setEditingTenant(null);
        setIsModalOpen(true);
    };

    const openEditModal = (tenant: Tenant) => {
        setEditingTenant(tenant);
        setData({
            name: tenant.name,
            slug: tenant.slug,
            domain: tenant.domain || '',
            logo: tenant.logo || '',
            favicon: tenant.favicon || '',
            active_template_id: tenant.active_template_id || '',
            is_active: tenant.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTenant) {
            put(`/admin/tenants/${editingTenant.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    successNotification('Tenant updated successfully!');
                },
                onError: () => errorNotification('Failed to update tenant'),
            });
        } else {
            post('/admin/tenants', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    successNotification('Tenant created successfully!');
                },
                onError: () => errorNotification('Failed to create tenant'),
            });
        }
    };

    const handleDelete = async (id: number, name: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You won't be able to revert this! "${name}" will be permanently deleted.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        });
        if (result.isConfirmed) {
            router.delete(`/admin/tenants/${id}`, {
                onSuccess: () => showDeletedSuccess(name),
                onError: () => errorNotification('Failed to delete tenant'),
            });
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/tenants', { search }, { preserveState: true });
    };

    const toggleActive = (tenant: Tenant) => {
        router.post(`/admin/tenants/${tenant.id}/toggle-active`);
    };

    // Duplicate handlers
    const openDuplicateModal = (tenant: Tenant) => {
        setDuplicatingTenant(tenant);
        setDuplicateData({
            name: `${tenant.name} (Copy)`,
            domain: '',
        });
        setIsDuplicateModalOpen(true);
    };

    const closeDuplicateModal = () => {
        setIsDuplicateModalOpen(false);
        setDuplicatingTenant(null);
        resetDuplicate();
    };

    const handleDuplicate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!duplicatingTenant) return;
        
        postDuplicate(`/admin/tenants/${duplicatingTenant.id}/duplicate`, {
            onSuccess: () => {
                closeDuplicateModal();
                successNotification('Tenant duplicated successfully! All settings, pages, and content have been copied.');
            },
            onError: () => errorNotification('Failed to duplicate tenant'),
        });
    };

    return (
        <AdminLayout header="Tenants">
            <Head title="Tenants" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <p className="text-gray-600">
                    Manage tenant organizations and their configurations.
                </p>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#c9a962] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b08d4a] transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Add Tenant
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
                            placeholder="Search tenants..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                        />
                    </div>
                </form>
            </div>

            {/* Tenants grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {tenants.data.length > 0 ? (
                    tenants.data.map((tenant) => (
                        <div
                            key={tenant.id}
                            className="group relative rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                        >
                            {/* Top gradient bar */}
                            <div className={`h-1.5 ${tenant.is_active ? 'bg-gradient-to-r from-[#c9a962] via-[#d4b978] to-[#c9a962]' : 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300'}`} />
                            
                            {/* Header with logo */}
                            <div className="relative h-28 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center overflow-hidden">
                                {/* Background pattern */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                                </div>
                                
                                {tenant.logo ? (
                                    <img
                                        src={tenant.logo}
                                        alt={tenant.name}
                                        className="h-14 object-contain relative z-10 drop-shadow-lg"
                                    />
                                ) : (
                                    <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                                        <Building2 className="h-8 w-8 text-white/70" />
                                    </div>
                                )}
                                
                                {/* Favicon badge */}
                                {tenant.favicon && (
                                    <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                                        <img src={tenant.favicon} alt="favicon" className="w-4 h-4 object-contain" />
                                    </div>
                                )}
                            </div>

                            <div className="p-5">
                                {/* Title and Toggle */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 min-w-0 pr-3">
                                        <h3 className="font-semibold text-lg text-gray-900 truncate">{tenant.name}</h3>
                                        <p className="text-sm text-gray-500 font-mono truncate">{tenant.slug}</p>
                                    </div>
                                    
                                    {/* Toggle Switch */}
                                    <button
                                        onClick={() => toggleActive(tenant)}
                                        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#c9a962] focus:ring-offset-2"
                                        style={{ backgroundColor: tenant.is_active ? '#c9a962' : '#d1d5db' }}
                                        role="switch"
                                        aria-checked={tenant.is_active}
                                    >
                                        <span className="sr-only">Toggle tenant status</span>
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                tenant.is_active ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Info cards */}
                                <div className="space-y-2 mb-4">
                                    {tenant.domain && (
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
                                            <Globe className="h-4 w-4 text-[#c9a962]" />
                                            <span className="text-sm text-gray-700 truncate">{tenant.domain}</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
                                            <Users className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-700">{tenant.users_count}</span>
                                            <span className="text-sm text-blue-600">users</span>
                                        </div>
                                        
                                        {tenant.active_template && (
                                            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 border border-purple-100">
                                                <LayoutTemplate className="h-4 w-4 text-purple-600" />
                                                <span className="text-sm font-medium text-purple-700 truncate">{tenant.active_template.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Status badge */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                        tenant.is_active 
                                            ? 'bg-green-100 text-green-700 ring-1 ring-green-200' 
                                            : 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${tenant.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                        {tenant.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        Created {new Date(tenant.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => openEditModal(tenant)}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => openDuplicateModal(tenant)}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                                        title="Duplicate this tenant"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tenant.id, tenant.name)}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
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
                            <Building2 className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No tenants yet</h3>
                        <p className="text-sm text-gray-500 mb-4">Get started by creating your first tenant organization.</p>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#c9a962] hover:bg-[#b08d4a] rounded-xl transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Create Tenant
                        </button>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {tenants.last_page > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-gray-700">
                        Showing page {tenants.current_page} of {tenants.last_page} ({tenants.total} total)
                    </p>
                    <div className="flex gap-2">
                        {tenants.links.map((link, index) => (
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

            {/* Modal */}
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
                                            <Building2 className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">
                                                {editingTenant ? 'Edit Tenant' : 'Create New Tenant'}
                                            </h3>
                                            <p className="text-sm text-white/60">
                                                {editingTenant ? 'Update tenant configuration' : 'Set up a new organization'}
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

                            {/* Modal Body - Scrollable */}
                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                                <div className="p-8 space-y-6">
                                    {/* Basic Info Section */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-lg bg-[#c9a962]/10 flex items-center justify-center">
                                                <Building2 className="h-3.5 w-3.5 text-[#c9a962]" />
                                            </span>
                                            Basic Information
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                                    Tenant Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                                    placeholder="Acme Corporation"
                                                    required
                                                />
                                                {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
                                            </div>

                                            <div className="col-span-2 sm:col-span-1">
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

                                            <div className="col-span-2">
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                                    Domain
                                                </label>
                                                <div className="relative">
                                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        value={data.domain}
                                                        onChange={(e) => setData('domain', e.target.value)}
                                                        className="w-full h-11 rounded-xl border border-gray-200 pl-11 pr-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                                        placeholder="acme.example.com"
                                                    />
                                                </div>
                                                {errors.domain && <p className="mt-1.5 text-xs text-red-500">{errors.domain}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Branding Section */}
                                    <div className="pt-4 border-t border-gray-100">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                                                <ImageIcon className="h-3.5 w-3.5 text-purple-600" />
                                            </span>
                                            Branding
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                                    Logo URL
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.logo}
                                                    onChange={(e) => setData('logo', e.target.value)}
                                                    className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                                    placeholder="/images/logo.png"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                                    Favicon URL
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.favicon}
                                                    onChange={(e) => setData('favicon', e.target.value)}
                                                    className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                                    placeholder="/images/favicon.ico"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Template Selection */}
                                    <div className="pt-4 border-t border-gray-100">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <LayoutTemplate className="h-3.5 w-3.5 text-blue-600" />
                                            </span>
                                            Template
                                        </h4>
                                        {templates.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                {templates.map((template) => (
                                                    <label
                                                        key={template.id}
                                                        className={`relative flex flex-col rounded-xl border-2 cursor-pointer transition-all overflow-hidden ${
                                                            data.active_template_id === template.id
                                                                ? 'border-[#c9a962] ring-2 ring-[#c9a962]/20'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="active_template_id"
                                                            value={template.id}
                                                            checked={data.active_template_id === template.id}
                                                            onChange={() => setData('active_template_id', template.id)}
                                                            className="sr-only"
                                                        />
                                                        {template.preview_image ? (
                                                            <img
                                                                src={template.preview_image}
                                                                alt={template.name}
                                                                className="w-full h-24 object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-24 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                                                                <LayoutTemplate className="h-8 w-8 text-gray-300" />
                                                            </div>
                                                        )}
                                                        <div className="p-3 bg-white">
                                                            <span className="text-sm font-semibold text-gray-900 block">{template.name}</span>
                                                            {template.description && (
                                                                <span className="text-xs text-gray-500 line-clamp-1 mt-0.5 block">{template.description}</span>
                                                            )}
                                                        </div>
                                                        {data.active_template_id === template.id && (
                                                            <div className="absolute top-2 right-2 w-6 h-6 bg-[#c9a962] rounded-full flex items-center justify-center shadow-lg">
                                                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                <LayoutTemplate className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                                <p className="text-sm text-gray-500">No templates available</p>
                                                <p className="text-xs text-gray-400">Create templates first</p>
                                            </div>
                                        )}
                                        {errors.active_template_id && <p className="mt-2 text-xs text-red-500">{errors.active_template_id}</p>}
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
                                                    <span className="text-xs text-gray-500">Tenant will be accessible</span>
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
                                        {processing ? 'Saving...' : editingTenant ? 'Update Tenant' : 'Create Tenant'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Duplicate Tenant Modal */}
            {isDuplicateModalOpen && duplicatingTenant && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={closeDuplicateModal} />
                        <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
                            {/* Modal Header */}
                            <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 px-8 pt-8 pb-6 text-white overflow-hidden">
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                                </div>
                                <button
                                    onClick={closeDuplicateModal}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-4 shadow-lg">
                                        <Copy className="h-7 w-7" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Duplicate Tenant</h2>
                                    <p className="text-blue-100 mt-1 text-sm">Create a copy of "{duplicatingTenant.name}" with all settings, pages, and content.</p>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleDuplicate}>
                                <div className="p-8 space-y-6">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            New Tenant Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={duplicateData.name}
                                            onChange={(e) => setDuplicateData('name', e.target.value)}
                                            className={`w-full px-4 h-12 rounded-xl border ${duplicateErrors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'} focus:ring-1 focus:outline-none transition-colors`}
                                            placeholder="Enter tenant name"
                                            required
                                        />
                                        {duplicateErrors.name && <p className="mt-2 text-xs text-red-500">{duplicateErrors.name}</p>}
                                    </div>

                                    {/* Domain (optional) */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Domain <span className="text-gray-400 text-xs">(optional)</span>
                                        </label>
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={duplicateData.domain}
                                                onChange={(e) => setDuplicateData('domain', e.target.value)}
                                                className={`w-full pl-12 pr-4 h-12 rounded-xl border ${duplicateErrors.domain ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'} focus:ring-1 focus:outline-none transition-colors`}
                                                placeholder="example.com"
                                            />
                                        </div>
                                        {duplicateErrors.domain && <p className="mt-2 text-xs text-red-500">{duplicateErrors.domain}</p>}
                                        <p className="mt-1 text-xs text-gray-500">Leave empty if you want to set domain later</p>
                                    </div>

                                    {/* Info box */}
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                        <h4 className="text-sm font-semibold text-blue-800 mb-2">What will be duplicated:</h4>
                                        <ul className="text-xs text-blue-700 space-y-1">
                                            <li>• All settings (appearance, contact info, SEO)</li>
                                            <li>• Pages and sections</li>
                                            <li>• Services and categories</li>
                                            <li>• FAQs, testimonials, team members</li>
                                            <li>• Navigation menus</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={closeDuplicateModal}
                                        className="flex-1 h-12 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-white hover:border-gray-300 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={duplicateProcessing}
                                        className="flex-1 h-12 rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20"
                                    >
                                        {duplicateProcessing ? 'Duplicating...' : 'Duplicate Tenant'}
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

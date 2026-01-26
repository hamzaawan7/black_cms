import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Edit, Trash2, Users as UsersIcon, X, Search, Shield, Building2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useSweetAlert } from '@/hooks/useSweetAlert';

interface Tenant {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: 'super_admin' | 'tenant_admin' | 'editor';
    tenant_id: number | null;
    tenant?: Tenant;
    avatar?: string;
    is_active: boolean;
    created_at: string;
}

interface PaginatedUsers {
    data: User[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
}

interface UsersIndexProps {
    users: PaginatedUsers;
    tenants: Tenant[];
    filters: {
        search?: string;
        role?: string;
        tenant_id?: string;
    };
}

const roleLabels: Record<string, { label: string; color: string }> = {
    super_admin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-700' },
    tenant_admin: { label: 'Tenant Admin', color: 'bg-blue-100 text-blue-700' },
    editor: { label: 'Editor', color: 'bg-gray-100 text-gray-700' },
};

export default function Index({ users, tenants = [], filters = {} }: UsersIndexProps) {
    const { confirmDelete, showDeletedSuccess, errorNotification, successNotification } = useSweetAlert();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [loadingMessage, setLoadingMessage] = useState('');

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'editor' as 'super_admin' | 'tenant_admin' | 'editor',
        tenant_id: '' as string | number,
        is_active: true,
    });

    const openCreateModal = () => {
        reset();
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            tenant_id: user.tenant_id || '',
            is_active: user.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            setLoadingMessage('Updating user...');
            put(`/admin/users/${editingUser.id}`, {
                onSuccess: () => {
                    setLoadingMessage('');
                    setIsModalOpen(false);
                    reset();
                    successNotification('User updated successfully!');
                },
                onError: () => {
                    setLoadingMessage('');
                    errorNotification('Failed to update user');
                },
            });
        } else {
            setLoadingMessage('Creating user & setting up tenant files...');
            post('/admin/users', {
                onSuccess: () => {
                    setLoadingMessage('');
                    setIsModalOpen(false);
                    reset();
                    successNotification('User created successfully! Tenant files have been set up.');
                },
                onError: () => {
                    setLoadingMessage('');
                    errorNotification('Failed to create user. Please try again.');
                },
            });
        }
    };

    const handleDelete = async (id: number, name: string) => {
        const result = await confirmDelete(name);
        if (result.isConfirmed) {
            router.delete(`/admin/users/${id}`, {
                onSuccess: () => showDeletedSuccess(name),
                onError: () => errorNotification('Failed to delete user'),
            });
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/users', { search }, { preserveState: true });
    };

    const toggleActive = (user: User) => {
        router.post(`/admin/users/${user.id}/toggle-active`);
    };

    return (
        <AdminLayout header="Users">
            <Head title="Users" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <p className="text-gray-600">
                    Manage users and their access permissions.
                </p>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#c9a962] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b08d4a] transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Add User
                </button>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search users..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                        />
                    </div>
                </form>
            </div>

            {/* Users table */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/80">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Tenant
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.data.length > 0 ? (
                            users.data.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.name}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <UsersIcon className="h-5 w-5 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${roleLabels[user.role]?.color || 'bg-gray-100 text-gray-700'}`}>
                                            <Shield className="h-3 w-3" />
                                            {roleLabels[user.role]?.label || user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.tenant ? (
                                            <span className="inline-flex items-center gap-1 text-sm text-gray-900">
                                                <Building2 className="h-4 w-4 text-gray-400" />
                                                {user.tenant.name}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => toggleActive(user)}
                                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                user.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className="text-[#c9a962] hover:text-[#b08d4a] mr-3"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id, user.name)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <UsersIcon className="mx-auto h-12 w-12 text-gray-300" />
                                    <p className="mt-2 text-sm text-gray-500">No users found</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-sm text-gray-700">
                            Showing page {users.current_page} of {users.last_page} ({users.total} total)
                        </p>
                        <div className="flex gap-2">
                            {users.links.map((link, index) => (
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
            </div>

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
                                            <UsersIcon className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">
                                                {editingUser ? 'Edit User' : 'Create New User'}
                                            </h3>
                                            <p className="text-sm text-white/60">
                                                {editingUser ? 'Update user details and permissions' : 'Add a new user to the system'}
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
                                                <UsersIcon className="h-3.5 w-3.5 text-[#c9a962]" />
                                            </span>
                                            User Information
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                                    Full Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                                    required
                                                />
                                                {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                                    Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                                    required
                                                />
                                                {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                                    Password {editingUser && '(leave blank to keep current)'}
                                                </label>
                                                <input
                                                    type="password"
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                                    required={!editingUser}
                                                />
                                                {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Role & Tenant */}
                                    <div className="pt-4 border-t border-gray-100">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                                                <Shield className="h-3.5 w-3.5 text-purple-600" />
                                            </span>
                                            Permissions
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                                    Role
                                                </label>
                                                <select
                                                    value={data.role}
                                                    onChange={(e) => setData('role', e.target.value as any)}
                                                    className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                                >
                                                    <option value="editor">Editor</option>
                                                    <option value="tenant_admin">Tenant Admin</option>
                                                    <option value="super_admin">Super Admin</option>
                                                </select>
                                            </div>

                                            {data.role !== 'super_admin' && (
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                                        Tenant
                                                    </label>
                                                    <select
                                                        value={data.tenant_id}
                                                        onChange={(e) => setData('tenant_id', e.target.value)}
                                                        className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                                    >
                                                        <option value="">Select a tenant</option>
                                                        {tenants.map((tenant) => (
                                                            <option key={tenant.id} value={tenant.id}>
                                                                {tenant.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
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
                                                    <span className="text-xs text-gray-500">User will be able to log in</span>
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
                                {/* Loading Overlay */}
                                {processing && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-2xl">
                                        <Loader2 className="h-10 w-10 text-[#c9a962] animate-spin mb-4" />
                                        <p className="text-sm font-medium text-gray-700">{loadingMessage || 'Please wait...'}</p>
                                        <p className="text-xs text-gray-500 mt-1">Setting up tenant data & files</p>
                                    </div>
                                )}

                                <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        disabled={processing}
                                        className="flex-1 h-12 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-white hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 h-12 rounded-xl bg-[#c9a962] text-sm font-bold text-white hover:bg-[#b08d4a] disabled:opacity-50 transition-all shadow-lg shadow-[#c9a962]/20 flex items-center justify-center gap-2"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Processing...</span>
                                            </>
                                        ) : editingUser ? 'Update User' : 'Create User'}
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

import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Users, X, Facebook, Instagram, Linkedin, Twitter, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useSweetAlert } from '@/hooks/useSweetAlert';

interface TeamMember {
    id: number;
    name: string;
    title: string;
    bio?: string;
    image?: string;
    credentials?: string;
    social_links?: {
        facebook?: string;
        instagram?: string;
        linkedin?: string;
        twitter?: string;
    };
    is_published: boolean;
    order: number;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface TeamIndexProps {
    teamMembers: PaginatedData<TeamMember> | TeamMember[];
}

export default function Index({ teamMembers }: TeamIndexProps) {
    // Handle both paginated and array data
    const teamMembersData = Array.isArray(teamMembers) ? teamMembers : (teamMembers?.data ?? []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const { confirmDelete, showDeletedSuccess, errorNotification, successNotification } = useSweetAlert();

    const { data, setData, post, put, processing, reset } = useForm({
        name: '',
        title: '',
        bio: '',
        image: '',
        social_links: {
            facebook: '',
            instagram: '',
            linkedin: '',
            twitter: '',
        },
        is_published: true,
    });

    const openCreateModal = () => {
        reset();
        setEditingMember(null);
        setIsModalOpen(true);
    };

    const openEditModal = (member: TeamMember) => {
        setEditingMember(member);
        setData({
            name: member.name,
            title: member.title,
            bio: member.bio || '',
            image: member.image || '',
            social_links: {
                facebook: member.social_links?.facebook || '',
                instagram: member.social_links?.instagram || '',
                linkedin: member.social_links?.linkedin || '',
                twitter: member.social_links?.twitter || '',
            },
            is_published: member.is_published,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingMember) {
            put(`/admin/team/${editingMember.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    successNotification('Team member updated successfully!');
                },
                onError: () => errorNotification('Failed to update team member'),
            });
        } else {
            post('/admin/team', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    successNotification('Team member created successfully!');
                },
                onError: () => errorNotification('Failed to create team member'),
            });
        }
    };

    const handleDelete = async (id: number, name: string) => {
        const result = await confirmDelete(name);
        if (result.isConfirmed) {
            router.delete(`/admin/team/${id}`, {
                onSuccess: () => showDeletedSuccess(name),
                onError: () => errorNotification('Failed to delete team member'),
            });
        }
    };

    const updateSocialLink = (platform: keyof typeof data.social_links, value: string) => {
        setData('social_links', {
            ...data.social_links,
            [platform]: value,
        });
    };

    return (
        <AdminLayout header="Team">
            <Head title="Team" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                    Manage your team members displayed on the website.
                </p>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#c9a962] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b08d4a] transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Add Team Member
                </button>
            </div>

            {/* Team grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {teamMembersData.length > 0 ? (
                    teamMembersData.map((member) => (
                        <div
                            key={member.id}
                            className="group rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300"
                        >
                            {/* Gradient bar */}
                            <div className="h-1.5 bg-gradient-to-r from-[#c9a962] via-[#d4b87a] to-[#c9a962]" />
                            
                            {/* Image */}
                            <div className="aspect-square bg-gray-50 relative">
                                {member.image ? (
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#c9a962]/20 to-[#c9a962]/10 flex items-center justify-center">
                                            <Users className="h-10 w-10 text-[#c9a962]" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <h3 className="text-sm font-bold text-gray-900">
                                        {member.name}
                                    </h3>
                                    {/* Toggle Switch */}
                                    <button
                                        type="button"
                                        onClick={() => router.patch(`/admin/team/${member.id}`, { is_published: !member.is_published })}
                                        className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                                        style={{ backgroundColor: member.is_published ? '#c9a962' : '#d1d5db' }}
                                        role="switch"
                                        aria-checked={member.is_published}
                                        title={member.is_published ? 'Published - Click to unpublish' : 'Draft - Click to publish'}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                member.is_published ? 'translate-x-4' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>
                                <p className="text-xs text-[#c9a962] font-semibold mb-2">
                                    {member.title}
                                </p>
                                {member.bio && (
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                                        {member.bio}
                                    </p>
                                )}

                                {/* Social links */}
                                {member.social_links && Object.values(member.social_links).some(Boolean) && (
                                    <div className="flex items-center gap-2">
                                        {member.social_links.facebook && (
                                            <a
                                                href={member.social_links.facebook}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                            >
                                                <Facebook className="h-3.5 w-3.5" />
                                            </a>
                                        )}
                                        {member.social_links.instagram && (
                                            <a
                                                href={member.social_links.instagram}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                                            >
                                                <Instagram className="h-3.5 w-3.5" />
                                            </a>
                                        )}
                                        {member.social_links.linkedin && (
                                            <a
                                                href={member.social_links.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                            >
                                                <Linkedin className="h-3.5 w-3.5" />
                                            </a>
                                        )}
                                        {member.social_links.twitter && (
                                            <a
                                                href={member.social_links.twitter}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-sky-50 hover:text-sky-500 transition-colors"
                                            >
                                                <Twitter className="h-3.5 w-3.5" />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 border-t border-gray-100 px-4 py-3 bg-gray-50/50">
                                <button
                                    onClick={() => openEditModal(member)}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:border-[#c9a962]/30 hover:text-[#c9a962] transition-all duration-200"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(member.id, member.name)}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-16">
                        <div className="flex flex-col items-center">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#c9a962] to-[#d4b87a] flex items-center justify-center mb-4 shadow-lg shadow-[#c9a962]/30">
                                <Users className="h-8 w-8 text-white" />
                            </div>
                            <p className="text-base font-semibold text-gray-900 mb-1">
                                No team members yet
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                Add your first team member to get started.
                            </p>
                            <button
                                onClick={openCreateModal}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#c9a962] to-[#d4b87a] rounded-xl hover:shadow-lg hover:shadow-[#c9a962]/30 transition-all"
                            >
                                <Plus className="h-4 w-4" />
                                Add your first team member
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
                        {/* Dark gradient header */}
                        <div className="relative bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-6 py-5 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#c9a962]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#c9a962]/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a962] to-[#d4b87a] flex items-center justify-center shadow-lg">
                                        <UserPlus className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">
                                            {editingMember ? 'Edit Team Member' : 'Add Team Member'}
                                        </h3>
                                        <p className="text-sm text-gray-300">
                                            {editingMember ? 'Update team member details' : 'Add a new team member to your website'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
                            <div className="p-6 space-y-5">
                                {/* Basic Info Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <div className="w-6 h-6 rounded-lg bg-[#c9a962]/10 flex items-center justify-center">
                                            <Users className="h-3.5 w-3.5 text-[#c9a962]" />
                                        </div>
                                        Basic Information
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                                className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50/50 px-4 focus:border-[#c9a962] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Title/Role *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                required
                                                className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50/50 px-4 focus:border-[#c9a962] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                                placeholder="e.g., Lead Therapist"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Bio
                                        </label>
                                        <textarea
                                            value={data.bio}
                                            onChange={(e) => setData('bio', e.target.value)}
                                            rows={3}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 focus:border-[#c9a962] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Image URL
                                        </label>
                                        <input
                                            type="text"
                                            value={data.image}
                                            onChange={(e) => setData('image', e.target.value)}
                                            className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50/50 px-4 focus:border-[#c9a962] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                {/* Social links section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <div className="w-6 h-6 rounded-lg bg-[#c9a962]/10 flex items-center justify-center">
                                            <Instagram className="h-3.5 w-3.5 text-[#c9a962]" />
                                        </div>
                                        Social Links
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                            <Facebook className="h-4 w-4 text-blue-600" />
                                            <input
                                                type="url"
                                                value={data.social_links.facebook}
                                                onChange={(e) => updateSocialLink('facebook', e.target.value)}
                                                className="flex-1 bg-transparent border-none text-sm focus:outline-none"
                                                placeholder="Facebook URL"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                            <Instagram className="h-4 w-4 text-pink-600" />
                                            <input
                                                type="url"
                                                value={data.social_links.instagram}
                                                onChange={(e) => updateSocialLink('instagram', e.target.value)}
                                                className="flex-1 bg-transparent border-none text-sm focus:outline-none"
                                                placeholder="Instagram URL"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                            <Linkedin className="h-4 w-4 text-blue-700" />
                                            <input
                                                type="url"
                                                value={data.social_links.linkedin}
                                                onChange={(e) => updateSocialLink('linkedin', e.target.value)}
                                                className="flex-1 bg-transparent border-none text-sm focus:outline-none"
                                                placeholder="LinkedIn URL"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                            <Twitter className="h-4 w-4 text-sky-500" />
                                            <input
                                                type="url"
                                                value={data.social_links.twitter}
                                                onChange={(e) => updateSocialLink('twitter', e.target.value)}
                                                className="flex-1 bg-transparent border-none text-sm focus:outline-none"
                                                placeholder="Twitter/X URL"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Status Toggle */}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Published</p>
                                        <p className="text-xs text-gray-500">Visible on website</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setData('is_published', !data.is_published)}
                                        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                                        style={{ backgroundColor: data.is_published ? '#c9a962' : '#d1d5db' }}
                                        role="switch"
                                        aria-checked={data.is_published}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                data.is_published ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#c9a962] to-[#d4b87a] px-4 text-sm font-semibold text-white hover:shadow-lg hover:shadow-[#c9a962]/30 disabled:opacity-50 transition-all"
                                >
                                    {processing ? 'Saving...' : editingMember ? 'Update Member' : 'Add Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

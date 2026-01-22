import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Star, X, Quote } from 'lucide-react';
import { useState } from 'react';
import { useSweetAlert } from '@/hooks/useSweetAlert';

interface Testimonial {
    id: number;
    author_name: string;
    author_title?: string;
    content: string;
    author_image?: string;
    rating: number;
    is_published: boolean;
    is_featured: boolean;
    order: number;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface TestimonialsIndexProps {
    testimonials: PaginatedData<Testimonial> | Testimonial[];
}

export default function Index({ testimonials }: TestimonialsIndexProps) {
    // Handle both paginated and array data
    const testimonialsData = Array.isArray(testimonials) ? testimonials : (testimonials?.data ?? []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
    const { confirmDelete, showDeletedSuccess, errorNotification, successNotification } = useSweetAlert();

    const { data, setData, post, put, processing, reset, errors } = useForm({
        author_name: '',
        author_title: '',
        content: '',
        author_image: '',
        rating: 5,
        is_published: true,
    });

    const openCreateModal = () => {
        reset();
        setEditingTestimonial(null);
        setIsModalOpen(true);
    };

    const openEditModal = (testimonial: Testimonial) => {
        setEditingTestimonial(testimonial);
        setData({
            author_name: testimonial.author_name,
            author_title: testimonial.author_title || '',
            content: testimonial.content,
            author_image: testimonial.author_image || '',
            rating: testimonial.rating,
            is_published: testimonial.is_published,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTestimonial) {
            put(`/admin/testimonials/${editingTestimonial.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    successNotification('Testimonial updated successfully!');
                },
                onError: () => errorNotification('Failed to update testimonial'),
            });
        } else {
            post('/admin/testimonials', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    successNotification('Testimonial created successfully!');
                },
                onError: () => errorNotification('Failed to create testimonial'),
            });
        }
    };

    const handleDelete = async (id: number, name: string) => {
        const result = await confirmDelete(name);
        if (result.isConfirmed) {
            router.delete(`/admin/testimonials/${id}`, {
                onSuccess: () => showDeletedSuccess(name),
                onError: () => errorNotification('Failed to delete testimonial'),
            });
        }
    };

    return (
        <AdminLayout header="Testimonials">
            <Head title="Testimonials" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                    Manage customer testimonials displayed on your website.
                </p>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#c9a962] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b08d4a] transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Add Testimonial
                </button>
            </div>

            {/* Testimonials list */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonialsData.length > 0 ? (
                    testimonialsData.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="group rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300"
                        >
                            {/* Gradient bar */}
                            <div className="h-1.5 bg-gradient-to-r from-[#c9a962] via-[#d4b87a] to-[#c9a962]" />
                            
                            <div className="p-5">
                                {/* Header with rating and toggle */}
                                <div className="flex items-center justify-between mb-4">
                                    {/* Rating */}
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`h-4 w-4 ${
                                                    star <= testimonial.rating
                                                        ? 'text-[#c9a962] fill-current'
                                                        : 'text-gray-200'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    {/* Toggle Switch */}
                                    <button
                                        type="button"
                                        onClick={() => router.patch(`/admin/testimonials/${testimonial.id}`, { is_published: !testimonial.is_published })}
                                        className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                                        style={{ backgroundColor: testimonial.is_published ? '#c9a962' : '#d1d5db' }}
                                        role="switch"
                                        aria-checked={testimonial.is_published}
                                        title={testimonial.is_published ? 'Published - Click to unpublish' : 'Draft - Click to publish'}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                testimonial.is_published ? 'translate-x-4' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Quote icon and content */}
                                <div className="relative mb-4">
                                    <Quote className="absolute -top-1 -left-1 h-6 w-6 text-[#c9a962]/20" />
                                    <p className="text-gray-600 text-sm line-clamp-3 pl-4">
                                        {testimonial.content}
                                    </p>
                                </div>

                                {/* Author */}
                                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                                    {testimonial.author_image ? (
                                        <img
                                            src={testimonial.author_image}
                                            alt={testimonial.author_name}
                                            className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#c9a962] to-[#d4b87a] flex items-center justify-center text-white font-bold text-sm shadow-md">
                                            {testimonial.author_name?.charAt(0) || '?'}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {testimonial.author_name}
                                        </p>
                                        {testimonial.author_title && (
                                            <p className="text-xs text-gray-500 truncate">{testimonial.author_title}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                                <button
                                    onClick={() => openEditModal(testimonial)}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:border-[#c9a962]/30 hover:text-[#c9a962] transition-all duration-200"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(testimonial.id, testimonial.author_name)}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
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
                                <Star className="h-8 w-8 text-white" />
                            </div>
                            <p className="text-base font-semibold text-gray-900 mb-1">
                                No testimonials yet
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                Add your first customer testimonial.
                            </p>
                            <button
                                onClick={openCreateModal}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#c9a962] to-[#d4b87a] rounded-xl hover:shadow-lg hover:shadow-[#c9a962]/30 transition-all"
                            >
                                <Plus className="h-4 w-4" />
                                Add your first testimonial
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
                                        <Quote className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">
                                            {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
                                        </h3>
                                        <p className="text-sm text-gray-300">
                                            {editingTestimonial ? 'Update testimonial details' : 'Add a new customer testimonial'}
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
                                {/* Author Info Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <div className="w-6 h-6 rounded-lg bg-[#c9a962]/10 flex items-center justify-center">
                                            <Star className="h-3.5 w-3.5 text-[#c9a962]" />
                                        </div>
                                        Author Information
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.author_name}
                                                onChange={(e) => setData('author_name', e.target.value)}
                                                required
                                                className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50/50 px-4 focus:border-[#c9a962] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Title/Role
                                            </label>
                                            <input
                                                type="text"
                                                value={data.author_title}
                                                onChange={(e) => setData('author_title', e.target.value)}
                                                className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50/50 px-4 focus:border-[#c9a962] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                                placeholder="e.g., CEO, Regular Customer"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Image URL
                                        </label>
                                        <input
                                            type="text"
                                            value={data.author_image}
                                            onChange={(e) => setData('author_image', e.target.value)}
                                            className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50/50 px-4 focus:border-[#c9a962] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                {/* Testimonial Content Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <div className="w-6 h-6 rounded-lg bg-[#c9a962]/10 flex items-center justify-center">
                                            <Quote className="h-3.5 w-3.5 text-[#c9a962]" />
                                        </div>
                                        Testimonial Content
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Testimonial *
                                        </label>
                                        <textarea
                                            value={data.content}
                                            onChange={(e) => setData('content', e.target.value)}
                                            required
                                            rows={4}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 focus:border-[#c9a962] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Rating
                                        </label>
                                        <div className="flex items-center gap-1.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setData('rating', star)}
                                                    className="p-1 hover:scale-110 transition-transform"
                                                >
                                                    <Star
                                                        className={`h-7 w-7 ${
                                                            star <= data.rating
                                                                ? 'text-[#c9a962] fill-current'
                                                                : 'text-gray-200'
                                                        }`}
                                                    />
                                                </button>
                                            ))}
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
                                    {processing ? 'Saving...' : editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

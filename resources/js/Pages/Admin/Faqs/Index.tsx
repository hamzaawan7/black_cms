import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, HelpCircle, X, GripVertical, MessageCircleQuestion } from 'lucide-react';
import { useState } from 'react';
import { useSweetAlert } from '@/hooks/useSweetAlert';

interface Faq {
    id: number;
    question: string;
    answer: string;
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

interface FaqsIndexProps {
    faqs: PaginatedData<Faq> | Faq[];
}

export default function Index({ faqs }: FaqsIndexProps) {
    // Handle both paginated and array data
    const faqsData = Array.isArray(faqs) ? faqs : (faqs?.data ?? []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
    const { confirmDelete, showDeletedSuccess, errorNotification, successNotification } = useSweetAlert();

    const { data, setData, post, put, processing, reset } = useForm({
        question: '',
        answer: '',
        is_published: true,
    });

    const openCreateModal = () => {
        reset();
        setEditingFaq(null);
        setIsModalOpen(true);
    };

    const openEditModal = (faq: Faq) => {
        setEditingFaq(faq);
        setData({
            question: faq.question,
            answer: faq.answer,
            is_published: faq.is_published,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingFaq) {
            put(`/admin/faqs/${editingFaq.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    successNotification('FAQ updated successfully!');
                },
                onError: () => errorNotification('Failed to update FAQ'),
            });
        } else {
            post('/admin/faqs', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    successNotification('FAQ created successfully!');
                },
                onError: () => errorNotification('Failed to create FAQ'),
            });
        }
    };

    const handleDelete = async (id: number, question: string) => {
        const result = await confirmDelete(question.substring(0, 50) + '...');
        if (result.isConfirmed) {
            router.delete(`/admin/faqs/${id}`, {
                onSuccess: () => showDeletedSuccess('FAQ'),
                onError: () => errorNotification('Failed to delete FAQ'),
            });
        }
    };

    return (
        <AdminLayout header="FAQs">
            <Head title="FAQs" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                    Manage frequently asked questions for your website.
                </p>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#c9a962] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b08d4a] transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Add FAQ
                </button>
            </div>

            {/* FAQs list - 2 columns like menus */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {faqsData.length > 0 ? (
                    faqsData.map((faq, index) => (
                        <div
                            key={faq.id}
                            className="group rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300"
                        >
                            {/* Gradient bar */}
                            <div className="h-1.5 bg-gradient-to-r from-[#c9a962] via-[#d4b87a] to-[#c9a962]" />
                            
                            <div className="p-5">
                                {/* Header with number and toggle */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[#c9a962] to-[#d4b87a] text-white text-sm font-bold shrink-0 shadow-md">
                                            {index + 1}
                                        </div>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${faq.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {faq.is_published ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                    {/* Toggle Switch */}
                                    <button
                                        type="button"
                                        onClick={() => router.post(`/admin/faqs/${faq.id}/toggle-published`)}
                                        className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                                        style={{ backgroundColor: faq.is_published ? '#c9a962' : '#d1d5db' }}
                                        role="switch"
                                        aria-checked={faq.is_published}
                                        title={faq.is_published ? 'Published - Click to unpublish' : 'Draft - Click to publish'}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${faq.is_published ? 'translate-x-4' : 'translate-x-0'}`}
                                        />
                                    </button>
                                </div>
                                
                                {/* Content */}
                                <div className="mb-4">
                                    <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2">
                                        {faq.question}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-3">
                                        {faq.answer}
                                    </p>
                                </div>
                                
                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => openEditModal(faq)}
                                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:border-[#c9a962]/30 hover:text-[#c9a962] transition-all duration-200"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(faq.id, faq.question)}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-16">
                        <div className="flex flex-col items-center">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#c9a962] to-[#d4b87a] flex items-center justify-center mb-4 shadow-lg shadow-[#c9a962]/30">
                                <MessageCircleQuestion className="h-8 w-8 text-white" />
                            </div>
                            <p className="text-base font-semibold text-gray-900 mb-1">
                                No FAQs yet
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                Add your first frequently asked question.
                            </p>
                            <button
                                onClick={openCreateModal}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#c9a962] to-[#d4b87a] rounded-xl hover:shadow-lg hover:shadow-[#c9a962]/30 transition-all"
                            >
                                <Plus className="h-4 w-4" />
                                Add your first FAQ
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
                                        <MessageCircleQuestion className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">
                                            {editingFaq ? 'Edit FAQ' : 'Add FAQ'}
                                        </h3>
                                        <p className="text-sm text-gray-300">
                                            {editingFaq ? 'Update FAQ details' : 'Add a new frequently asked question'}
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
                                {/* Question & Answer Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <div className="w-6 h-6 rounded-lg bg-[#c9a962]/10 flex items-center justify-center">
                                            <HelpCircle className="h-3.5 w-3.5 text-[#c9a962]" />
                                        </div>
                                        FAQ Content
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Question *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.question}
                                            onChange={(e) => setData('question', e.target.value)}
                                            required
                                            className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50/50 px-4 focus:border-[#c9a962] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                            placeholder="e.g., What are your opening hours?"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Answer *
                                        </label>
                                        <textarea
                                            value={data.answer}
                                            onChange={(e) => setData('answer', e.target.value)}
                                            required
                                            rows={4}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 focus:border-[#c9a962] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all resize-none"
                                        />
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
                                    {processing ? 'Saving...' : editingFaq ? 'Update FAQ' : 'Add FAQ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

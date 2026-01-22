import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Eye, Search, FileText, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useSweetAlert } from '@/hooks/useSweetAlert';

interface Page {
    id: number;
    title: string;
    slug: string;
    meta_title?: string;
    is_published: boolean;
    order: number;
    created_at: string;
    updated_at: string;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface PagesIndexProps {
    pages: PaginatedData<Page> | Page[];
}

export default function Index({ pages }: PagesIndexProps) {
    // Handle both paginated and array data
    const pagesData = Array.isArray(pages) ? pages : (pages?.data ?? []);
    const [searchQuery, setSearchQuery] = useState('');
    const { confirmDelete, showDeletedSuccess, errorNotification } = useSweetAlert();

    const filteredPages = pagesData.filter(page =>
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: number, title: string) => {
        const result = await confirmDelete(title);
        if (result.isConfirmed) {
            router.delete(`/admin/pages/${id}`, {
                onSuccess: () => showDeletedSuccess(title),
                onError: () => errorNotification('Failed to delete page'),
            });
        }
    };

    return (
        <AdminLayout header="Pages">
            <Head title="Pages" />

            {/* Header actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search pages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                    />
                </div>
                <Link
                    href="/admin/pages/create"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#c9a962] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b08d4a] transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    New Page
                </Link>
            </div>

            {/* Pages table */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/80">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Slug
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Updated
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPages.length > 0 ? (
                            filteredPages.map((page) => (
                                <tr key={page.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-900">{page.title}</div>
                                        {page.meta_title && (
                                            <div className="text-xs text-gray-500">{page.meta_title}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <code className="text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                            /{page.slug}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                page.is_published
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                            }`}
                                        >
                                            {page.is_published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(page.updated_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-1">
                                            <a
                                                href={`/${page.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                                                title="Preview"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                            <Link
                                                href={`/admin/pages/${page.id}/edit`}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-amber-50 hover:text-amber-600 transition-all duration-200"
                                                title="Edit"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(page.id, page.title)}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                                            <FileText className="h-8 w-8 text-white" />
                                        </div>
                                        <p className="text-base font-medium text-gray-900 mb-1">
                                            {searchQuery ? 'No pages found' : 'No pages yet'}
                                        </p>
                                        <p className="text-sm text-gray-500 mb-4">
                                            {searchQuery ? 'Try adjusting your search terms.' : 'Create your first page to get started.'}
                                        </p>
                                        {!searchQuery && (
                                            <Link
                                                href="/admin/pages/create"
                                                className="inline-flex items-center gap-2 rounded-lg bg-[#c9a962] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b08d4a] transition-colors"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Create Page
                                            </Link>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}

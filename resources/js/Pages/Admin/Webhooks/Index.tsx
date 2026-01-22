import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Webhook, CheckCircle, XCircle, Send, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useSweetAlert } from '@/hooks/useSweetAlert';

interface WebhookType {
    id: number;
    name: string;
    url: string;
    events: string[];
    is_active: boolean;
    last_triggered_at: string | null;
    last_status: 'success' | 'failed' | null;
    last_error: string | null;
    created_at: string;
}

interface IndexProps {
    webhooks: WebhookType[];
    availableEvents: string[];
}

export default function Index({ webhooks, availableEvents }: IndexProps) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [testingId, setTestingId] = useState<number | null>(null);

    const { confirmDelete, showDeletedSuccess, errorNotification } = useSweetAlert();

    const handleDelete = async (id: number, name: string) => {
        const result = await confirmDelete(name);
        if (result.isConfirmed) {
            setDeletingId(id);
            router.delete(`/admin/webhooks/${id}`, {
                onFinish: () => setDeletingId(null),
                onSuccess: () => showDeletedSuccess(name),
                onError: () => errorNotification('Failed to delete webhook'),
            });
        }
    };

    const handleTest = (id: number) => {
        setTestingId(id);
        router.post(`/admin/webhooks/${id}/test`, {}, {
            onFinish: () => setTestingId(null),
            preserveScroll: true,
        });
    };

    const handleToggleActive = (webhook: WebhookType) => {
        router.put(`/admin/webhooks/${webhook.id}`, {
            ...webhook,
            is_active: !webhook.is_active,
        }, {
            preserveScroll: true,
        });
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleString();
    };

    return (
        <AdminLayout header="Webhooks">
            <Head title="Webhooks" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-slate-600">
                        Configure webhooks to notify external services when content changes.
                    </p>
                </div>
                <Link
                    href="/admin/webhooks/create"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#c9a962] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#b08d4a] transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Add Webhook
                </Link>
            </div>

            {/* Webhooks Cards */}
            {webhooks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {webhooks.map((webhook) => (
                        <div
                            key={webhook.id}
                            className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                        >
                            {/* Gradient Bar */}
                            <div className={`h-1.5 ${webhook.is_active ? 'bg-gradient-to-r from-[#c9a962] via-[#d4b978] to-[#c9a962]' : 'bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300'}`} />
                            
                            <div className="p-5">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100">
                                            <Webhook className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{webhook.name}</h3>
                                            <p className="text-xs text-gray-500 max-w-[180px] truncate">
                                                {webhook.url}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Toggle Switch */}
                                    <button
                                        onClick={() => handleToggleActive(webhook)}
                                        className={`relative w-11 h-6 rounded-full transition-colors ${webhook.is_active ? 'bg-[#c9a962]' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${webhook.is_active ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* Events */}
                                <div className="mb-4">
                                    <p className="text-xs font-medium text-gray-500 mb-2">Events</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {webhook.events.slice(0, 3).map((event) => (
                                            <span
                                                key={event}
                                                className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700"
                                            >
                                                {event}
                                            </span>
                                        ))}
                                        {webhook.events.length > 3 && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                                                +{webhook.events.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Last Triggered */}
                                <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
                                    {webhook.last_status === 'success' && (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    )}
                                    {webhook.last_status === 'failed' && (
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                    )}
                                    {!webhook.last_status && (
                                        <Clock className="h-4 w-4 text-gray-400" />
                                    )}
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500">Last triggered</p>
                                        <p className="text-sm font-medium text-gray-700">
                                            {formatDate(webhook.last_triggered_at)}
                                        </p>
                                    </div>
                                </div>
                                {webhook.last_error && (
                                    <p className="text-xs text-red-500 mb-4 p-2 bg-red-50 rounded-lg truncate" title={webhook.last_error}>
                                        {webhook.last_error}
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleTest(webhook.id)}
                                        disabled={testingId === webhook.id}
                                        className="flex-1 h-9 rounded-xl bg-blue-50 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                                    >
                                        <Send className={`h-3.5 w-3.5 ${testingId === webhook.id ? 'animate-pulse' : ''}`} />
                                        Test
                                    </button>
                                    <Link
                                        href={`/admin/webhooks/${webhook.id}/edit`}
                                        className="flex-1 h-9 rounded-xl bg-[#c9a962]/10 text-xs font-semibold text-[#c9a962] hover:bg-[#c9a962]/20 transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(webhook.id, webhook.name)}
                                        disabled={deletingId === webhook.id}
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
                        <div className="mx-auto h-16 w-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
                            <Webhook className="h-8 w-8 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No webhooks configured</h3>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                            Add webhooks to notify your frontend or external services when content is updated.
                        </p>
                        <Link
                            href="/admin/webhooks/create"
                            className="inline-flex items-center gap-2 h-11 rounded-xl bg-[#c9a962] px-5 text-sm font-semibold text-white shadow-lg shadow-[#c9a962]/20 hover:bg-[#b08d4a] transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Add First Webhook
                        </Link>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

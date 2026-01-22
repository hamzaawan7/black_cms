import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Webhook, RefreshCw, Key } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface WebhookType {
    id: number;
    name: string;
    url: string;
    secret: string | null;
    events: string[];
    is_active: boolean;
    last_triggered_at: string | null;
    last_status: 'success' | 'failed' | null;
}

interface EditProps {
    webhook: WebhookType;
    availableEvents: string[];
}

export default function Edit({ webhook, availableEvents }: EditProps) {
    const [regenerateSecret, setRegenerateSecret] = useState(false);
    
    const { data, setData, put, processing, errors } = useForm({
        name: webhook.name,
        url: webhook.url,
        secret: webhook.secret || '',
        events: webhook.events,
        is_active: webhook.is_active,
        regenerate_secret: false,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setData('regenerate_secret', regenerateSecret);
        put(`/admin/webhooks/${webhook.id}`);
    };

    const toggleEvent = (event: string) => {
        const newEvents = data.events.includes(event)
            ? data.events.filter(e => e !== event)
            : [...data.events, event];
        setData('events', newEvents);
    };

    const selectAllEvents = () => {
        setData('events', availableEvents);
    };

    const clearAllEvents = () => {
        setData('events', []);
    };

    // Group events by category
    const eventGroups = {
        Pages: availableEvents.filter(e => e.startsWith('page.')),
        Services: availableEvents.filter(e => e.startsWith('service.')),
        Sections: availableEvents.filter(e => e.startsWith('section.')),
        Cache: availableEvents.filter(e => e.startsWith('cache.')),
    };

    return (
        <AdminLayout header={`Edit: ${webhook.name}`}>
            <Head title={`Edit Webhook: ${webhook.name}`} />

            {/* Back Link */}
            <div className="mb-6">
                <Link
                    href="/admin/webhooks"
                    className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#c9a962] transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Webhooks
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="max-w-3xl space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                                <Webhook className="h-5 w-5 text-purple-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900">Webhook Details</h2>
                        </div>

                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962] transition-colors"
                                    placeholder="My Frontend Cache Invalidation"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* URL */}
                            <div>
                                <label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-1">
                                    Webhook URL <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="url"
                                    id="url"
                                    value={data.url}
                                    onChange={e => setData('url', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962] transition-colors"
                                    placeholder="https://your-site.com/api/webhook"
                                />
                                {errors.url && (
                                    <p className="mt-1 text-sm text-red-600">{errors.url}</p>
                                )}
                            </div>

                            {/* Secret */}
                            <div>
                                <label htmlFor="secret" className="block text-sm font-medium text-slate-700 mb-1">
                                    Secret (for signature verification)
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            id="secret"
                                            value={regenerateSecret ? '••••••••••••••••••••••••••••••••' : data.secret}
                                            onChange={e => setData('secret', e.target.value)}
                                            disabled={regenerateSecret}
                                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962] transition-colors disabled:bg-slate-100"
                                            placeholder="Optional secret key"
                                        />
                                        {webhook.secret && !regenerateSecret && (
                                            <Key className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setRegenerateSecret(!regenerateSecret)}
                                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                                            regenerateSecret
                                                ? 'bg-orange-100 text-orange-700'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        {regenerateSecret ? 'Will Regenerate' : 'Regenerate'}
                                    </button>
                                </div>
                                <p className="mt-1 text-xs text-slate-500">
                                    The secret is used to sign webhook payloads (X-Webhook-Signature header).
                                </p>
                                {errors.secret && (
                                    <p className="mt-1 text-sm text-red-600">{errors.secret}</p>
                                )}
                            </div>

                            {/* Active */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={e => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-[#c9a962] focus:ring-[#c9a962]"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                                    Webhook is active
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Events */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-900">Events</h2>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={selectAllEvents}
                                    className="text-sm text-[#c9a962] hover:text-[#b08d4a]"
                                >
                                    Select All
                                </button>
                                <span className="text-slate-300">|</span>
                                <button
                                    type="button"
                                    onClick={clearAllEvents}
                                    className="text-sm text-slate-600 hover:text-slate-800"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-4">
                            Select which events should trigger this webhook.
                        </p>

                        <div className="space-y-6">
                            {Object.entries(eventGroups).map(([group, events]) => (
                                events.length > 0 && (
                                    <div key={group}>
                                        <h3 className="text-sm font-medium text-slate-700 mb-2">{group}</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {events.map((event) => (
                                                <label
                                                    key={event}
                                                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                                                        data.events.includes(event)
                                                            ? 'border-[#c9a962] bg-[#c9a962]/5'
                                                            : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={data.events.includes(event)}
                                                        onChange={() => toggleEvent(event)}
                                                        className="h-4 w-4 rounded border-slate-300 text-[#c9a962] focus:ring-[#c9a962]"
                                                    />
                                                    <span className="text-sm text-slate-700">{event}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>

                        {errors.events && (
                            <p className="mt-4 text-sm text-red-600">{errors.events}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href="/admin/webhooks"
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-[#c9a962] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#b08d4a] disabled:opacity-50 transition-colors"
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}

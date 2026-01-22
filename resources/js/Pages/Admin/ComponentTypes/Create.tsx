import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2, GripVertical, Component } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Field {
    name: string;
    label: string;
    type: string;
    required: boolean;
    placeholder?: string;
    default?: any;
    options?: Record<string, string>;
}

interface CreateProps {
    fieldTypes: Record<string, string>;
}

const emptyField: Field = {
    name: '',
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
};

export default function Create({ fieldTypes }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        description: '',
        icon: '',
        fields: [{ ...emptyField }] as Field[],
        is_active: true,
        order: 0,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/component-types');
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_|_$/g, '')
            .replace(/__+/g, '_');
    };

    const handleNameChange = (name: string) => {
        setData((prev) => ({
            ...prev,
            name,
            slug: prev.slug === '' || prev.slug === generateSlug(prev.name) ? generateSlug(name) : prev.slug,
        }));
    };

    const addField = () => {
        setData('fields', [...data.fields, { ...emptyField }]);
    };

    const removeField = (index: number) => {
        if (data.fields.length <= 1) return;
        setData('fields', data.fields.filter((_, i) => i !== index));
    };

    const updateField = (index: number, updates: Partial<Field>) => {
        const newFields = [...data.fields];
        newFields[index] = { ...newFields[index], ...updates };
        
        // Auto-generate field name from label if name is empty
        if (updates.label && !newFields[index].name) {
            newFields[index].name = updates.label
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '_')
                .replace(/^_|_$/g, '');
        }
        
        setData('fields', newFields);
    };

    return (
        <AdminLayout header="Create Component Type">
            <Head title="Create Component Type" />

            {/* Back Link */}
            <div className="mb-6">
                <Link
                    href="/admin/component-types"
                    className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#c9a962] transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Component Types
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="max-w-4xl space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#c9a962]/10">
                                <Component className="h-5 w-5 text-[#c9a962]" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900">Component Details</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                                    Display Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={e => handleNameChange(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962] transition-colors"
                                    placeholder="Hero Section"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            {/* Slug */}
                            <div>
                                <label htmlFor="slug" className="block text-sm font-medium text-slate-700 mb-1">
                                    Slug <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="slug"
                                    value={data.slug}
                                    onChange={e => setData('slug', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962] transition-colors font-mono"
                                    placeholder="hero_section"
                                />
                                <p className="mt-1 text-xs text-slate-500">Lowercase letters, numbers, and underscores only</p>
                                {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
                            </div>

                            {/* Description */}
                            <div className="col-span-2">
                                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    id="description"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962] transition-colors"
                                    placeholder="A brief description of this component"
                                />
                            </div>

                            {/* Icon */}
                            <div>
                                <label htmlFor="icon" className="block text-sm font-medium text-slate-700 mb-1">
                                    Icon (Lucide icon name)
                                </label>
                                <input
                                    type="text"
                                    id="icon"
                                    value={data.icon}
                                    onChange={e => setData('icon', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962] transition-colors"
                                    placeholder="layout-template"
                                />
                                <p className="mt-1 text-xs text-slate-500">
                                    <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-[#c9a962] hover:underline">
                                        Browse Lucide icons →
                                    </a>
                                </p>
                            </div>

                            {/* Order */}
                            <div>
                                <label htmlFor="order" className="block text-sm font-medium text-slate-700 mb-1">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    id="order"
                                    value={data.order}
                                    onChange={e => setData('order', parseInt(e.target.value) || 0)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962] transition-colors"
                                    min={0}
                                />
                            </div>

                            {/* Active */}
                            <div className="col-span-2">
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={e => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-[#c9a962] focus:ring-[#c9a962]"
                                    />
                                    <span className="text-sm font-medium text-slate-700">Active (available for use in page builder)</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Fields */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-slate-900">Field Definitions</h2>
                            <button
                                type="button"
                                onClick={addField}
                                className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                Add Field
                            </button>
                        </div>

                        <div className="space-y-4">
                            {data.fields.map((field, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 bg-slate-50"
                                >
                                    <div className="text-slate-300 mt-2">
                                        <GripVertical className="h-5 w-5" />
                                    </div>

                                    <div className="flex-1 grid grid-cols-4 gap-3">
                                        {/* Field Label */}
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Label</label>
                                            <input
                                                type="text"
                                                value={field.label}
                                                onChange={e => updateField(index, { label: e.target.value })}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962]"
                                                placeholder="Title"
                                            />
                                        </div>

                                        {/* Field Name */}
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Field Name</label>
                                            <input
                                                type="text"
                                                value={field.name}
                                                onChange={e => updateField(index, { name: e.target.value })}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 font-mono focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962]"
                                                placeholder="title"
                                            />
                                        </div>

                                        {/* Field Type */}
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                                            <select
                                                value={field.type}
                                                onChange={e => updateField(index, { type: e.target.value })}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962]"
                                            >
                                                {Object.entries(fieldTypes).map(([value, label]) => (
                                                    <option key={value} value={value}>{label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Required */}
                                        <div className="flex items-end gap-2">
                                            <label className="flex items-center gap-2 pb-2">
                                                <input
                                                    type="checkbox"
                                                    checked={field.required}
                                                    onChange={e => updateField(index, { required: e.target.checked })}
                                                    className="h-4 w-4 rounded border-slate-300 text-[#c9a962] focus:ring-[#c9a962]"
                                                />
                                                <span className="text-sm text-slate-600">Required</span>
                                            </label>
                                        </div>

                                        {/* Placeholder */}
                                        <div className="col-span-3">
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Placeholder (optional)</label>
                                            <input
                                                type="text"
                                                value={field.placeholder || ''}
                                                onChange={e => updateField(index, { placeholder: e.target.value })}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962]"
                                                placeholder="Enter placeholder text..."
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeField(index)}
                                        disabled={data.fields.length <= 1}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {errors.fields && (
                            <p className="mt-4 text-sm text-red-600">{errors.fields}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href="/admin/component-types"
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-[#c9a962] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#b08d4a] disabled:opacity-50 transition-colors"
                        >
                            {processing ? 'Creating...' : 'Create Component Type'}
                        </button>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}

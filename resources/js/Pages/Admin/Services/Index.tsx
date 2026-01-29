import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Search, Package, Star, LayoutGrid, List, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useSweetAlert } from '@/hooks/useSweetAlert';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Service {
    id: number;
    name: string;
    slug: string;
    short_description?: string;
    image?: string;
    is_popular: boolean;
    is_active: boolean;
    order: number;
    category?: Category;
    category_id?: number;
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

interface ServicesIndexProps {
    services: PaginatedData<Service> | Service[];
    categories: Category[];
}

export default function Index({ services, categories = [] }: ServicesIndexProps) {
    const servicesData = Array.isArray(services) ? services : (services?.data ?? []);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [viewMode, setViewMode] = useState<'grid' | 'grouped'>('grouped');
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set(categories.map(c => c.id)));
    const { confirmDelete, showDeletedSuccess, errorNotification } = useSweetAlert();

    const filteredServices = servicesData.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.short_description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !categoryFilter || service.category?.id.toString() === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const groupedServices = useMemo(() => {
        const grouped = new Map<number, { category: Category; services: Service[] }>();
        categories.forEach(cat => {
            grouped.set(cat.id, { category: cat, services: [] });
        });
        grouped.set(0, { category: { id: 0, name: 'Uncategorized', slug: 'uncategorized' }, services: [] });
        filteredServices.forEach(service => {
            const catId = service.category?.id || 0;
            const group = grouped.get(catId);
            if (group) {
                group.services.push(service);
            } else {
                grouped.get(0)?.services.push(service);
            }
        });
        return Array.from(grouped.values())
            .filter(g => g.services.length > 0 || !categoryFilter)
            .sort((a, b) => a.category.name.localeCompare(b.category.name));
    }, [filteredServices, categories, categoryFilter]);

    const handleDelete = async (id: number, name: string) => {
        const result = await confirmDelete(name);
        if (result.isConfirmed) {
            router.delete(`/admin/services/${id}`, {
                onSuccess: () => showDeletedSuccess(name),
                onError: () => errorNotification('Failed to delete service'),
            });
        }
    };

    const togglePopular = (service: Service) => {
        router.post(`/admin/services/${service.id}/toggle-popular`, {}, { preserveScroll: true });
    };

    const toggleActive = (service: Service) => {
        router.post(`/admin/services/${service.id}/toggle-published`, {}, { preserveScroll: true });
    };

    const toggleCategoryExpanded = (categoryId: number) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(categoryId)) next.delete(categoryId);
            else next.add(categoryId);
            return next;
        });
    };

    return (
        <AdminLayout header="Services">
            <Head title="Services" />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search services..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]" />
                    </div>
                    {categories.length > 0 && (
                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-lg border border-gray-300 py-2 px-3 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]">
                            <option value="">All Categories</option>
                            {categories.map((category) => (<option key={category.id} value={category.id}>{category.name}</option>))}
                        </select>
                    )}
                    <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                        <button onClick={() => setViewMode('grouped')} className={`px-3 py-2 flex items-center gap-1.5 text-sm ${viewMode === 'grouped' ? 'bg-[#c9a962] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`} title="Grouped view"><List className="h-4 w-4" /></button>
                        <button onClick={() => setViewMode('grid')} className={`px-3 py-2 flex items-center gap-1.5 text-sm ${viewMode === 'grid' ? 'bg-[#c9a962] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`} title="Grid view"><LayoutGrid className="h-4 w-4" /></button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/service-categories" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Manage Categories</Link>
                    <Link href="/admin/services/create" className="inline-flex items-center gap-2 rounded-lg bg-[#c9a962] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b08d4a] transition-colors"><Plus className="h-5 w-5" />New Service</Link>
                </div>
            </div>

            {viewMode === 'grouped' && (
                <div className="space-y-4">
                    {groupedServices.map(({ category, services: categoryServices }) => (
                        <div key={category.id} className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                            <button onClick={() => toggleCategoryExpanded(category.id)} className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a962] to-[#d4b87a] flex items-center justify-center shadow-sm"><Package className="h-5 w-5 text-white" /></div>
                                    <div className="text-left"><h3 className="text-base font-bold text-gray-900">{category.name}</h3><p className="text-xs text-gray-500">{categoryServices.length} service{categoryServices.length !== 1 ? 's' : ''}</p></div>
                                </div>
                                {expandedCategories.has(category.id) ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                            </button>
                            {expandedCategories.has(category.id) && (
                                <div className="border-t border-gray-100">
                                    {categoryServices.length > 0 ? (
                                        <div className="divide-y divide-gray-50">
                                            {categoryServices.map((service, index) => (
                                                <div key={service.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-500 text-xs font-bold shrink-0">{index + 1}</div>
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                                        {service.image ? <img src={service.image} alt={service.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="h-5 w-5 text-gray-300" /></div>}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-semibold text-gray-900 truncate">{service.name}</h4>
                                                            {service.is_popular && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#c9a962] text-[10px] font-semibold text-white"><Star className="h-2.5 w-2.5 fill-current" />Popular</span>}
                                                        </div>
                                                        {service.short_description && <p className="text-xs text-gray-500 truncate mt-0.5">{service.short_description}</p>}
                                                    </div>
                                                    <button type="button" onClick={() => toggleActive(service)} className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none" style={{ backgroundColor: service.is_active ? '#c9a962' : '#d1d5db' }} role="switch" aria-checked={service.is_active} title={service.is_active ? 'Active' : 'Inactive'}>
                                                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${service.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                                                    </button>
                                                    <button onClick={() => togglePopular(service)} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${service.is_popular ? 'bg-[#c9a962]/10 text-[#c9a962]' : 'text-gray-400 hover:text-[#c9a962] hover:bg-[#c9a962]/10'}`} title={service.is_popular ? 'Remove from popular' : 'Mark as popular'}>
                                                        <Star className={`h-3.5 w-3.5 ${service.is_popular ? 'fill-current' : ''}`} />
                                                    </button>
                                                    <div className="flex items-center gap-1">
                                                        <Link href={`/admin/services/${service.id}/edit`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-[#c9a962]/10 hover:text-[#c9a962] transition-all duration-200" title="Edit"><Pencil className="h-4 w-4" /></Link>
                                                        <button onClick={() => handleDelete(service.id, service.name)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200" title="Delete"><Trash2 className="h-4 w-4" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-6 text-center"><p className="text-sm text-gray-500">No services in this category</p><Link href="/admin/services/create" className="inline-flex items-center gap-1 mt-2 text-sm text-[#c9a962] hover:underline"><Plus className="h-4 w-4" />Add service</Link></div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {groupedServices.length === 0 && (
                        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-16"><div className="flex flex-col items-center"><div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#c9a962] to-[#d4b87a] flex items-center justify-center mb-4 shadow-lg shadow-[#c9a962]/30"><Package className="h-8 w-8 text-white" /></div><p className="text-base font-semibold text-gray-900 mb-1">No services found</p><p className="text-sm text-gray-500 mb-4">Try adjusting your filters.</p></div></div>
                    )}
                </div>
            )}

            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {filteredServices.length > 0 ? (
                        filteredServices.map((service) => (
                            <div key={service.id} className="group relative rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300">
                                <div className="h-1.5 bg-gradient-to-r from-[#c9a962] via-[#d4b87a] to-[#c9a962]" />
                                <div className="aspect-video bg-gray-50 relative">
                                    {service.image ? <img src={service.image} alt={service.name} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full"><div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#c9a962]/20 to-[#c9a962]/10 flex items-center justify-center"><Package className="h-7 w-7 text-[#c9a962]" /></div></div>}
                                    {service.is_popular && <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#c9a962] to-[#d4b87a] px-2.5 py-1 text-xs font-semibold text-white shadow-lg shadow-[#c9a962]/30"><Star className="h-3 w-3 fill-current" />Popular</span>}
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{service.name}</h3>
                                        <button type="button" onClick={() => toggleActive(service)} className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none" style={{ backgroundColor: service.is_active ? '#c9a962' : '#d1d5db' }} role="switch" aria-checked={service.is_active} title={service.is_active ? 'Active' : 'Inactive'}>
                                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${service.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                    {service.short_description && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{service.short_description}</p>}
                                    {service.category && <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">{service.category.name}</span>}
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 bg-gray-50/50">
                                    <button onClick={() => togglePopular(service)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${service.is_popular ? 'bg-[#c9a962]/10 text-[#c9a962]' : 'text-gray-400 hover:text-[#c9a962] hover:bg-[#c9a962]/10'}`} title={service.is_popular ? 'Remove from popular' : 'Mark as popular'}><Star className={`h-3.5 w-3.5 ${service.is_popular ? 'fill-current' : ''}`} />{service.is_popular ? 'Popular' : 'Set Popular'}</button>
                                    <div className="flex items-center gap-1">
                                        <Link href={`/admin/services/${service.id}/edit`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-[#c9a962]/10 hover:text-[#c9a962] transition-all duration-200" title="Edit"><Pencil className="h-4 w-4" /></Link>
                                        <button onClick={() => handleDelete(service.id, service.name)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200" title="Delete"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-16"><div className="flex flex-col items-center"><div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#c9a962] to-[#d4b87a] flex items-center justify-center mb-4 shadow-lg shadow-[#c9a962]/30"><Package className="h-8 w-8 text-white" /></div><p className="text-base font-semibold text-gray-900 mb-1">{searchQuery || categoryFilter ? 'No services found' : 'No services yet'}</p><p className="text-sm text-gray-500 mb-4">{searchQuery || categoryFilter ? 'Try adjusting your filters.' : 'Create your first service to get started.'}</p>{!searchQuery && !categoryFilter && <Link href="/admin/services/create" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#c9a962] to-[#d4b87a] rounded-xl hover:shadow-lg hover:shadow-[#c9a962]/30 transition-all"><Plus className="h-4 w-4" />Create your first service</Link>}</div></div>
                    )}
                </div>
            )}
        </AdminLayout>
    );
}
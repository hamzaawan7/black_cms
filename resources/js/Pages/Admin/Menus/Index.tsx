import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Edit, Trash2, Navigation, X, GripVertical, ExternalLink, FileText, Package, ChevronDown, ChevronUp, Globe, Link2, LayoutGrid, Share2, Save } from 'lucide-react';
import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useSweetAlert } from '@/hooks/useSweetAlert';

interface MenuItem {
    id: string;
    label?: string;
    title?: string;
    url: string;
    target?: '_blank' | '_self';
    order: number;
    is_active?: boolean;
    children?: MenuItem[];
}

interface Menu {
    id: number;
    name: string;
    location: string;
    items: MenuItem[];
    is_active: boolean;
}

interface LinkOption {
    label: string;
    url: string;
    type: 'page' | 'service';
}

interface LinkOptions {
    pages: LinkOption[];
    services: LinkOption[];
}

interface MenusIndexProps {
    menus?: { data: Menu[] } | Menu[];
    linkOptions?: LinkOptions;
}

type TabType = 'header' | 'footer' | 'other';

// Separate isolated component for each menu item row
const MenuItemRow = memo(function MenuItemRow({
    item,
    index,
    onUpdate,
    onRemove,
    linkOptions,
    openDropdownId,
    setOpenDropdownId,
}: {
    item: MenuItem;
    index: number;
    onUpdate: (field: keyof MenuItem, value: string) => void;
    onRemove: () => void;
    linkOptions?: LinkOptions;
    openDropdownId: string | null;
    setOpenDropdownId: (id: string | null) => void;
}) {
    // Local state for each field - completely isolated
    const [localLabel, setLocalLabel] = useState(item.label || '');
    const [localUrl, setLocalUrl] = useState(item.url || '');
    const [localTarget, setLocalTarget] = useState(item.target || '_self');

    return (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#c9a962] text-white text-xs font-bold shrink-0 mt-1.5">
                    {index + 1}
                </div>
                <div className="flex-1 space-y-2">
                    {/* Label + Target Row */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={localLabel}
                            onChange={(e) => {
                                setLocalLabel(e.target.value);
                                onUpdate('label', e.target.value);
                            }}
                            className="flex-1 h-9 rounded-md border border-gray-200 px-3 text-sm bg-white focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]/30"
                            placeholder="Menu item label"
                        />
                        <select
                            value={localTarget}
                            onChange={(e) => {
                                setLocalTarget(e.target.value as '_self' | '_blank');
                                onUpdate('target', e.target.value);
                            }}
                            className="w-[100px] h-9 rounded-md border border-gray-200 px-2 text-xs bg-white focus:border-[#c9a962] focus:outline-none"
                        >
                            <option value="_self">Same tab</option>
                            <option value="_blank">New tab</option>
                        </select>
                    </div>
                    {/* URL Row */}
                    <div className="relative">
                        <input
                            type="text"
                            value={localUrl}
                            onChange={(e) => {
                                setLocalUrl(e.target.value);
                                onUpdate('url', e.target.value);
                            }}
                            className="w-full h-9 rounded-md border border-gray-200 px-3 pr-9 text-sm font-mono text-gray-500 bg-white focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]/30"
                            placeholder="/page-url or https://..."
                        />
                        <button
                            type="button"
                            onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-[#c9a962] rounded"
                        >
                            <ChevronDown className={`h-4 w-4 transition-transform ${openDropdownId === item.id ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {/* Dropdown */}
                        {openDropdownId === item.id && linkOptions && (
                            <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-xl overflow-hidden">
                                <div className="max-h-40 overflow-y-auto">
                                    {linkOptions.pages && linkOptions.pages.length > 0 && (
                                        <div>
                                            <div className="px-3 py-1.5 bg-gray-50 text-[10px] font-semibold text-gray-500 uppercase tracking-wide sticky top-0">
                                                Pages
                                            </div>
                                            {linkOptions.pages.map((link, i) => (
                                                <button
                                                    key={`page-${i}`}
                                                    type="button"
                                                    onClick={() => {
                                                        setLocalUrl(link.url);
                                                        onUpdate('url', link.url);
                                                        if (!localLabel) {
                                                            setLocalLabel(link.label);
                                                            onUpdate('label', link.label);
                                                        }
                                                        setOpenDropdownId(null);
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#c9a962]/10 flex items-center justify-between"
                                                >
                                                    <span className="text-gray-700">{link.label}</span>
                                                    <span className="text-[10px] text-gray-400 font-mono">{link.url}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {linkOptions.services && linkOptions.services.length > 0 && (
                                        <div>
                                            <div className="px-3 py-1.5 bg-gray-50 text-[10px] font-semibold text-gray-500 uppercase tracking-wide sticky top-0">
                                                Services
                                            </div>
                                            {linkOptions.services.map((link, i) => (
                                                <button
                                                    key={`service-${i}`}
                                                    type="button"
                                                    onClick={() => {
                                                        setLocalUrl(link.url);
                                                        onUpdate('url', link.url);
                                                        if (!localLabel) {
                                                            setLocalLabel(link.label);
                                                            onUpdate('label', link.label);
                                                        }
                                                        setOpenDropdownId(null);
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#c9a962]/10 flex items-center justify-between"
                                                >
                                                    <span className="text-gray-700">{link.label}</span>
                                                    <span className="text-[10px] text-gray-400 font-mono">{link.url}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onRemove}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
});

export default function Index({ menus, linkOptions }: MenusIndexProps) {
    let menuList: Menu[] = [];
    if (menus) {
        if (Array.isArray(menus)) {
            menuList = menus;
        } else if (menus.data && Array.isArray(menus.data)) {
            menuList = menus.data;
        }
    }
    
    const { confirmDelete, showDeletedSuccess, errorNotification, successNotification } = useSweetAlert();
    const [activeTab, setActiveTab] = useState<TabType>('header');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    
    // Add Item Modal State
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [newItemLabel, setNewItemLabel] = useState('');
    const [newItemUrl, setNewItemUrl] = useState('');
    const [newItemTarget, setNewItemTarget] = useState<'_self' | '_blank'>('_self');
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    
    // Children/Submenu State
    const [itemChildren, setItemChildren] = useState<MenuItem[]>([]);
    const [hasSubmenu, setHasSubmenu] = useState(false);
    const [itemModalTab, setItemModalTab] = useState<'basic' | 'submenu'>('basic');
    const [editingChildId, setEditingChildId] = useState<string | null>(null);
    const [childLabel, setChildLabel] = useState('');
    const [childUrl, setChildUrl] = useState('');

    // Filter menus by tab
    const headerMenus = menuList.filter(m => m.location === 'header' || m.location === 'mobile');
    const footerMenus = menuList.filter(m => m.location.startsWith('footer') || m.location === 'social');
    const otherMenus = menuList.filter(m => 
        !m.location.startsWith('footer') && 
        m.location !== 'header' && 
        m.location !== 'mobile' && 
        m.location !== 'social'
    );

    const currentMenus = activeTab === 'header' ? headerMenus : activeTab === 'footer' ? footerMenus : otherMenus;

    const { data, setData, post, put, processing, reset } = useForm({
        name: '',
        location: 'header' as string,
        is_active: true,
    });

    const openCreateModal = () => {
        reset();
        // Set default location based on active tab
        const defaultLocation = activeTab === 'header' ? 'header' : activeTab === 'footer' ? 'footer-services' : 'services';
        setData('location', defaultLocation);
        setMenuItems([]);
        setEditingMenu(null);
        setOpenDropdownId(null);
        setIsModalOpen(true);
    };

    // Helper function to normalize children items
    const normalizeChildren = (children: MenuItem[], parentIndex: number, menuId: number): MenuItem[] => {
        if (!children || !Array.isArray(children)) return [];
        return children.map((child, childIndex) => ({
            id: child.id || `child-${menuId}-${parentIndex}-${childIndex}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            label: child.label || child.title || '',
            title: child.title || child.label || '',
            url: child.url || '',
            target: child.target || '_self',
            order: child.order ?? childIndex,
            is_active: child.is_active ?? true,
            children: [], // Children don't have nested children
        }));
    };

    const openEditModal = (menu: Menu) => {
        setEditingMenu(menu);
        setOpenDropdownId(null);
        // Always generate unique IDs to prevent React key conflicts
        const normalizedItems = (menu.items || []).map((item, index) => ({
            id: `edit-${menu.id}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            label: item.label || item.title || '',
            url: item.url || '',
            target: item.target || '_self',
            order: item.order ?? index,
            is_active: item.is_active ?? true,
            // Preserve and normalize children for dropdown menus
            children: normalizeChildren(item.children || [], index, menu.id),
        }));
        setMenuItems([...normalizedItems]);
        setData({
            name: menu.name,
            location: menu.location,
            is_active: menu.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...data,
            items: JSON.stringify(menuItems),
        };
        
        if (editingMenu) {
            router.put(`/admin/menus/${editingMenu.id}`, payload, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    successNotification('Menu updated successfully!');
                },
                onError: (errors) => {
                    const errorMessages = Object.values(errors).join(', ');
                    errorNotification(errorMessages || 'Failed to update menu');
                },
            });
        } else {
            router.post('/admin/menus', payload, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    successNotification('Menu created successfully!');
                },
                onError: (errors) => {
                    const errorMessages = Object.values(errors).join(', ');
                    errorNotification(errorMessages || 'Failed to create menu');
                },
            });
        }
    };

    const handleDelete = async (id: number, name: string) => {
        const result = await confirmDelete(name);
        if (result.isConfirmed) {
            router.delete(`/admin/menus/${id}`, {
                onSuccess: () => showDeletedSuccess(name),
                onError: () => errorNotification('Failed to delete menu'),
            });
        }
    };

    const addMenuItem = () => {
        // Open the add item modal instead of inline add
        setNewItemLabel('');
        setNewItemUrl('');
        setNewItemTarget('_self');
        setEditingItemId(null);
        setItemChildren([]);
        setHasSubmenu(false);
        setItemModalTab('basic');
        setEditingChildId(null);
        setChildLabel('');
        setChildUrl('');
        setIsAddItemModalOpen(true);
    };

    const openEditItemModal = (item: MenuItem) => {
        setNewItemLabel(item.label || '');
        setNewItemUrl(item.url || '');
        setNewItemTarget(item.target || '_self');
        setEditingItemId(item.id);
        setItemChildren(item.children || []);
        setHasSubmenu((item.children && item.children.length > 0) || false);
        setItemModalTab('basic');
        setEditingChildId(null);
        setChildLabel('');
        setChildUrl('');
        setIsAddItemModalOpen(true);
    };

    const handleAddItemSubmit = () => {
        if (!newItemLabel.trim() || !newItemUrl.trim()) {
            errorNotification('Please fill in both label and URL');
            return;
        }

        const childrenToSave = hasSubmenu ? itemChildren : [];

        if (editingItemId) {
            // Update existing item
            setMenuItems(
                menuItems.map((item) =>
                    item.id === editingItemId 
                        ? { ...item, label: newItemLabel, url: newItemUrl, target: newItemTarget, children: childrenToSave } 
                        : item
                )
            );
        } else {
            // Add new item
            setMenuItems([
                ...menuItems,
                {
                    id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    label: newItemLabel,
                    url: newItemUrl,
                    target: newItemTarget,
                    order: menuItems.length,
                    is_active: true,
                    children: childrenToSave,
                },
            ]);
        }
        
        setIsAddItemModalOpen(false);
        setNewItemLabel('');
        setNewItemUrl('');
        setNewItemTarget('_self');
        setEditingItemId(null);
        setItemChildren([]);
        setHasSubmenu(false);
    };

    const updateMenuItem = (id: string, field: keyof MenuItem, value: string | number) => {
        setMenuItems(
            menuItems.map((item) =>
                item.id === id 
                    ? { ...item, [field]: value, children: item.children || [] } 
                    : { ...item, children: item.children || [] }
            )
        );
    };

    const removeMenuItem = (id: string) => {
        setMenuItems(menuItems.filter((item) => item.id !== id));
    };

    const toggleMenuItemActive = (id: string) => {
        setMenuItems(
            menuItems.map((item) =>
                item.id === id 
                    ? { 
                        ...item, 
                        is_active: !(item.is_active ?? true),
                        children: item.children || []
                    } 
                    : { ...item, children: item.children || [] }
            )
        );
    };

    const moveMenuItemUp = (index: number) => {
        if (index === 0) return;
        const newItems = [...menuItems];
        [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
        // Update order and preserve children
        newItems.forEach((item, i) => {
            item.order = i;
            item.children = item.children || [];
        });
        setMenuItems(newItems);
    };

    const moveMenuItemDown = (index: number) => {
        if (index === menuItems.length - 1) return;
        const newItems = [...menuItems];
        [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
        // Update order and preserve children
        newItems.forEach((item, i) => {
            item.order = i;
            item.children = item.children || [];
        });
        setMenuItems(newItems);
    };

    const getLocationLabel = (location: string) => {
        const labels: Record<string, string> = {
            'header': 'Header',
            'footer': 'Footer',
            'footer-services': 'Services',
            'footer-about': 'About',
            'footer-vip': 'VIP',
            'footer-legal': 'Legal',
            'mobile': 'Mobile',
            'social': 'Social',
            'services': 'Services',
            'sidebar': 'Sidebar',
        };
        return labels[location] || location;
    };

    const getLocationOptions = () => {
        // When editing, show the full location list based on the menu's current location
        if (editingMenu) {
            // Show all options when editing
            return [
                { value: 'header', label: 'Header Navigation' },
                { value: 'mobile', label: 'Mobile Menu' },
                { value: 'footer', label: 'Footer Main' },
                { value: 'footer-services', label: 'Footer - Services' },
                { value: 'footer-about', label: 'Footer - About' },
                { value: 'footer-vip', label: 'Footer - VIP' },
                { value: 'footer-legal', label: 'Footer - Legal' },
                { value: 'social', label: 'Social Links' },
                { value: 'services', label: 'Services Menu' },
                { value: 'sidebar', label: 'Sidebar Navigation' },
            ];
        }
        // When creating, filter by active tab
        if (activeTab === 'header') {
            return [
                { value: 'header', label: 'Header Navigation' },
                { value: 'mobile', label: 'Mobile Menu' },
            ];
        } else if (activeTab === 'footer') {
            return [
                { value: 'footer', label: 'Footer Main' },
                { value: 'footer-services', label: 'Footer - Services' },
                { value: 'footer-about', label: 'Footer - About' },
                { value: 'footer-vip', label: 'Footer - VIP' },
                { value: 'footer-legal', label: 'Footer - Legal' },
                { value: 'social', label: 'Social Links' },
            ];
        } else {
            return [
                { value: 'services', label: 'Services Menu' },
                { value: 'sidebar', label: 'Sidebar Navigation' },
            ];
        }
    };

    const toggleMenuActive = (menu: Menu) => {
        router.post(`/admin/menus/${menu.id}/toggle-active`);
    };

    const MenuCard = ({ menu }: { menu: Menu }) => {
        const getLocationIcon = (location: string) => {
            if (location === 'header' || location === 'mobile') return Globe;
            if (location.startsWith('footer')) return LayoutGrid;
            if (location === 'social') return Share2;
            return Navigation;
        };
        const LocationIcon = getLocationIcon(menu.location);
        
        return (
            <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#c9a962]/30 transition-all duration-300 overflow-hidden">
                {/* Gradient Header Bar */}
                <div className={`h-1.5 ${menu.is_active ? 'bg-gradient-to-r from-[#c9a962] via-[#d4b978] to-[#c9a962]' : 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300'}`} />
                
                {/* Card Content */}
                <div className="p-5">
                    {/* Top Section */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${menu.is_active ? 'bg-gradient-to-br from-[#c9a962]/20 to-[#c9a962]/5' : 'bg-gradient-to-br from-gray-200/50 to-gray-100/50'}`}>
                                <LocationIcon className={`h-5 w-5 ${menu.is_active ? 'text-[#c9a962]' : 'text-gray-400'}`} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-base group-hover:text-[#c9a962] transition-colors">
                                    {menu.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                                        {getLocationLabel(menu.location)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Toggle Switch */}
                        <button
                            onClick={() => toggleMenuActive(menu)}
                            className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#c9a962] focus:ring-offset-2"
                            style={{ backgroundColor: menu.is_active ? '#c9a962' : '#d1d5db' }}
                            role="switch"
                            aria-checked={menu.is_active}
                            title={menu.is_active ? 'Click to deactivate' : 'Click to activate'}
                        >
                            <span className="sr-only">Toggle menu status</span>
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    menu.is_active ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>

                    {/* Menu Items */}
                    {menu.items && menu.items.length > 0 ? (
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                    {menu.items.length} Menu Item{menu.items.length > 1 ? 's' : ''}
                                </span>
                                <div className="flex-1 h-px bg-gray-100" />
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {menu.items.slice(0, 5).map((item, index) => (
                                    <span
                                        key={item.id || index}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg border border-gray-100 hover:bg-[#c9a962]/5 hover:border-[#c9a962]/20 hover:text-[#c9a962] transition-colors"
                                    >
                                        {item.label || item.title}
                                        {item.target === '_blank' && (
                                            <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                                        )}
                                    </span>
                                ))}
                                {menu.items.length > 5 && (
                                    <span className="inline-flex items-center px-2.5 py-1 bg-[#c9a962]/10 text-[#c9a962] text-xs font-semibold rounded-lg">
                                        +{menu.items.length - 5} more
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="mb-4 py-3 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-xs text-gray-400 text-center">No menu items added yet</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                        <button
                            onClick={() => openEditModal(menu)}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-[#c9a962] hover:text-white rounded-xl transition-all duration-200"
                        >
                            <Edit className="h-4 w-4" />
                            Edit Menu
                        </button>
                        <button
                            onClick={() => handleDelete(menu.id, menu.name)}
                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                            title="Delete"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AdminLayout header="Menus">
            <Head title="Menus" />

            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 mt-1">
                            Manage navigation menus for your website header and footer.
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#c9a962] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#b08d4a] transition-all shadow-lg shadow-[#c9a962]/20"
                    >
                        <Plus className="h-4 w-4" />
                        Create Menu
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('header')}
                        className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
                            activeTab === 'header'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Globe className="h-4 w-4" />
                        Header Menus
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                            activeTab === 'header' ? 'bg-[#c9a962]/10 text-[#c9a962]' : 'bg-gray-200 text-gray-500'
                        }`}>
                            {headerMenus.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('footer')}
                        className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
                            activeTab === 'footer'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <LayoutGrid className="h-4 w-4" />
                        Footer Menus
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                            activeTab === 'footer' ? 'bg-[#c9a962]/10 text-[#c9a962]' : 'bg-gray-200 text-gray-500'
                        }`}>
                            {footerMenus.length}
                        </span>
                    </button>
                    {otherMenus.length > 0 && (
                        <button
                            onClick={() => setActiveTab('other')}
                            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
                                activeTab === 'other'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Share2 className="h-4 w-4" />
                            Other
                            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                                activeTab === 'other' ? 'bg-[#c9a962]/10 text-[#c9a962]' : 'bg-gray-200 text-gray-500'
                            }`}>
                                {otherMenus.length}
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {/* Menus List */}
            {currentMenus.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
                    {currentMenus.map((menu) => (
                        <MenuCard key={menu.id} menu={menu} />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 px-6 py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <Navigation className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        No {activeTab === 'header' ? 'Header' : activeTab === 'footer' ? 'Footer' : 'Other'} Menus
                    </h3>
                    <p className="text-gray-500 mb-4">
                        Create a menu to add navigation links.
                    </p>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#c9a962] hover:text-[#b08d4a]"
                    >
                        <Plus className="h-4 w-4" />
                        Create your first {activeTab} menu
                    </button>
                </div>
            )}

            {/* Main Menu Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
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
                                        <Navigation className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">
                                            {editingMenu ? 'Edit Menu' : 'Create New Menu'}
                                        </h3>
                                        <p className="text-sm text-white/60">
                                            {editingMenu ? 'Modify your menu configuration' : 'Set up a new navigation menu'}
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
                                {/* Menu Name & Location */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-[#c9a962]/10 flex items-center justify-center">
                                            <Navigation className="h-3.5 w-3.5 text-[#c9a962]" />
                                        </span>
                                        Menu Settings
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                                Menu Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                                className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                                placeholder="e.g., Main Navigation"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                                Location
                                            </label>
                                            <select
                                                value={data.location}
                                                onChange={(e) => setData('location', e.target.value)}
                                                className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-gray-50/50 focus:bg-white focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                            >
                                                {getLocationOptions().map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items Section */}
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-800">Menu Items</h4>
                                                <p className="text-xs text-gray-500 mt-0.5">{menuItems.length} item{menuItems.length !== 1 ? 's' : ''} configured</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={addMenuItem}
                                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#c9a962] text-white text-sm font-semibold rounded-xl hover:bg-[#b08d4a] transition-colors shadow-sm"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add Item
                                            </button>
                                        </div>

                                        <div className="space-y-2 max-h-[280px] overflow-y-auto">
                                        {menuItems.length === 0 ? (
                                            <div className="text-center py-10 bg-white rounded-xl border-2 border-dashed border-gray-200">
                                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                                    <Navigation className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <p className="text-sm text-gray-500 mb-2">No menu items yet</p>
                                                <button
                                                    type="button"
                                                    onClick={addMenuItem}
                                                    className="text-sm font-semibold text-[#c9a962] hover:text-[#b08d4a]"
                                                >
                                                    + Add your first item
                                                </button>
                                            </div>
                                        ) : (
                                            menuItems.map((item, index) => (
                                                <div 
                                                    key={item.id} 
                                                    className={`flex items-center gap-3 p-3 bg-white rounded-xl border transition-all group ${
                                                        item.is_active === false 
                                                            ? 'border-gray-200 opacity-60' 
                                                            : 'border-gray-100 hover:border-[#c9a962]/30 hover:shadow-sm'
                                                    }`}
                                                >
                                                    {/* Order Controls */}
                                                    <div className="flex flex-col gap-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => moveMenuItemUp(index)}
                                                            disabled={index === 0}
                                                            className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                            title="Move up"
                                                        >
                                                            <ChevronUp className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => moveMenuItemDown(index)}
                                                            disabled={index === menuItems.length - 1}
                                                            className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                            title="Move down"
                                                        >
                                                            <ChevronDown className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                    
                                                    <div className={`flex items-center justify-center w-7 h-7 rounded-lg text-white text-xs font-bold shrink-0 ${
                                                        item.is_active === false ? 'bg-gray-400' : 'bg-[#c9a962]'
                                                    }`}>
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`font-semibold text-sm truncate ${
                                                                item.is_active === false ? 'text-gray-400' : 'text-gray-800'
                                                            }`}>
                                                                {item.label || 'Untitled'}
                                                            </span>
                                                            {item.target === '_blank' && (
                                                                <ExternalLink className="h-3 w-3 text-gray-400 shrink-0" />
                                                            )}
                                                            {item.is_active === false && (
                                                                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Hidden</span>
                                                            )}
                                                            {item.children && item.children.length > 0 && (
                                                                <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                                    <ChevronDown className="h-2.5 w-2.5" />
                                                                    {item.children.length} submenu
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-gray-400 font-mono truncate block">
                                                            {item.url || 'No URL'}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Toggle Switch */}
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleMenuItemActive(item.id)}
                                                        className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                                                        style={{ backgroundColor: item.is_active !== false ? '#c9a962' : '#d1d5db' }}
                                                        role="switch"
                                                        aria-checked={item.is_active !== false}
                                                        title={item.is_active !== false ? 'Click to hide' : 'Click to show'}
                                                    >
                                                        <span
                                                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                                item.is_active !== false ? 'translate-x-4' : 'translate-x-0'
                                                            }`}
                                                        />
                                                    </button>
                                                    
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditItemModal(item)}
                                                            className="p-2 text-gray-400 hover:text-[#c9a962] hover:bg-[#c9a962]/10 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeMenuItem(item.id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        </div>
                                    </div>
                                </div>

                                {/* Active Toggle */}
                                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-6 rounded-full relative transition-colors ${data.is_active ? 'bg-[#c9a962]' : 'bg-gray-300'}`}>
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${data.is_active ? 'right-1' : 'left-1'}`} />
                                        </div>
                                        <div>
                                            <span className="text-sm font-semibold text-gray-700 block">Active Status</span>
                                            <span className="text-xs text-gray-500">Menu will be visible on the website</span>
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
                                    {processing ? 'Saving...' : editingMenu ? 'Update Menu' : 'Create Menu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add/Edit Item Modal */}
            {isAddItemModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsAddItemModalOpen(false)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#c9a962]/10 flex items-center justify-center">
                                        <Plus className="h-5 w-5 text-[#c9a962]" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {editingItemId ? 'Edit Menu Item' : 'Add Menu Item'}
                                        </h3>
                                        <p className="text-xs text-gray-500">Configure the link details</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsAddItemModalOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="px-6 border-b border-gray-100">
                            <div className="flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => setItemModalTab('basic')}
                                    className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                                        itemModalTab === 'basic'
                                            ? 'border-[#c9a962] text-[#c9a962]'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Basic Info
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setItemModalTab('submenu')}
                                    className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                                        itemModalTab === 'submenu'
                                            ? 'border-[#c9a962] text-[#c9a962]'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Submenu
                                    {itemChildren.length > 0 && (
                                        <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-600 rounded-full">
                                            {itemChildren.length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5 max-h-[400px] overflow-y-auto">
                            {/* Basic Info Tab */}
                            {itemModalTab === 'basic' && (
                                <>
                                    {/* Label */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Label <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={newItemLabel}
                                            onChange={(e) => setNewItemLabel(e.target.value)}
                                            className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                            placeholder="e.g., About Us"
                                            autoFocus
                                        />
                                    </div>

                                    {/* URL */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            URL / Link <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={newItemUrl}
                                                onChange={(e) => setNewItemUrl(e.target.value)}
                                                className="w-full h-12 rounded-xl border border-gray-200 px-4 pr-10 text-sm font-mono focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20 transition-all"
                                                placeholder="/about or https://..."
                                            />
                                            <Link2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                        
                                        {/* Quick Links */}
                                        {linkOptions && (linkOptions.pages?.length > 0 || linkOptions.services?.length > 0) && (
                                            <div className="mt-3">
                                                <p className="text-xs font-medium text-gray-500 mb-2">Quick select:</p>
                                                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                                                    {linkOptions.pages?.map((link, i) => (
                                                        <button
                                                            key={`page-${i}`}
                                                            type="button"
                                                            onClick={() => {
                                                                setNewItemUrl(link.url);
                                                                if (!newItemLabel) setNewItemLabel(link.label);
                                                            }}
                                                            className="px-2.5 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-[#c9a962]/10 hover:text-[#c9a962] transition-colors"
                                                        >
                                                            {link.label}
                                                        </button>
                                                    ))}
                                                    {linkOptions.services?.map((link, i) => (
                                                        <button
                                                            key={`service-${i}`}
                                                            type="button"
                                                            onClick={() => {
                                                                setNewItemUrl(link.url);
                                                                if (!newItemLabel) setNewItemLabel(link.label);
                                                            }}
                                                            className="px-2.5 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                        >
                                                            {link.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Target */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Open In
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setNewItemTarget('_self')}
                                                className={`h-12 rounded-xl border-2 text-sm font-medium transition-all ${
                                                    newItemTarget === '_self'
                                                        ? 'border-[#c9a962] bg-[#c9a962]/5 text-[#c9a962]'
                                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                }`}
                                            >
                                                Same Tab
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNewItemTarget('_blank')}
                                                className={`h-12 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                                                    newItemTarget === '_blank'
                                                        ? 'border-[#c9a962] bg-[#c9a962]/5 text-[#c9a962]'
                                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                }`}
                                            >
                                                New Tab
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Submenu Tab */}
                            {itemModalTab === 'submenu' && (
                                <div className="space-y-4">
                                    {/* Info */}
                                    <div className="p-3 bg-blue-50 rounded-xl">
                                        <p className="text-xs text-blue-700">
                                            Add dropdown items that will appear when hovering over this menu item.
                                        </p>
                                    </div>

                                    {/* List of children */}
                                    {itemChildren.length > 0 ? (
                                        <div className="space-y-2">
                                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Submenu Items ({itemChildren.length})
                                            </div>
                                            <div className="space-y-2">
                                                {itemChildren.map((child, index) => (
                                                    <div
                                                        key={child.id}
                                                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-colors"
                                                    >
                                                        <div className="w-6 h-6 rounded-lg bg-[#c9a962]/10 flex items-center justify-center text-xs font-bold text-[#c9a962]">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                                {child.label}
                                                            </div>
                                                            <div className="text-xs text-gray-500 truncate font-mono">
                                                                {child.url}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setEditingChildId(child.id);
                                                                    setChildLabel(child.label || '');
                                                                    setChildUrl(child.url || '');
                                                                }}
                                                                className="p-2 text-gray-400 hover:text-[#c9a962] hover:bg-[#c9a962]/10 rounded-lg transition-all"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setItemChildren(itemChildren.filter((_, i) => i !== index));
                                                                }}
                                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 bg-gray-50 rounded-xl">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                                                <Navigation className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <p className="text-sm text-gray-500">No submenu items yet</p>
                                        </div>
                                    )}
                                    
                                    {/* Add/Edit child form */}
                                    <div className={`p-4 border-2 rounded-xl ${editingChildId ? 'border-[#c9a962] bg-[#c9a962]/5' : 'border-dashed border-gray-200 bg-white'}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="text-xs font-semibold text-gray-700">
                                                {editingChildId ? 'Edit Submenu Item' : 'Add New Submenu Item'}
                                            </div>
                                            {editingChildId && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingChildId(null);
                                                        setChildLabel('');
                                                        setChildUrl('');
                                                    }}
                                                    className="text-xs text-gray-500 hover:text-gray-700"
                                                >
                                                    Cancel Edit
                                                </button>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                placeholder="Label (e.g., Partner Login)"
                                                value={childLabel}
                                                onChange={(e) => setChildLabel(e.target.value)}
                                                className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20"
                                            />
                                            <input
                                                type="text"
                                                placeholder="URL (e.g., /partners/login)"
                                                value={childUrl}
                                                onChange={(e) => setChildUrl(e.target.value)}
                                                className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm font-mono focus:border-[#c9a962] focus:outline-none focus:ring-2 focus:ring-[#c9a962]/20"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const label = childLabel.trim();
                                                    const url = childUrl.trim();
                                                    
                                                    if (label && url) {
                                                        if (editingChildId) {
                                                            // Update existing child
                                                            setItemChildren(
                                                                itemChildren.map((child) =>
                                                                    child.id === editingChildId
                                                                        ? { ...child, label, url }
                                                                        : child
                                                                )
                                                            );
                                                            setEditingChildId(null);
                                                        } else {
                                                            // Add new child
                                                            setItemChildren([
                                                                ...itemChildren,
                                                                {
                                                                    id: `child-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                                                    label,
                                                                    url,
                                                                    target: '_self',
                                                                    order: itemChildren.length,
                                                                    is_active: true,
                                                                }
                                                            ]);
                                                        }
                                                        setChildLabel('');
                                                        setChildUrl('');
                                                    }
                                                }}
                                                className={`w-full h-11 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                                                    editingChildId 
                                                        ? 'bg-[#c9a962] text-white hover:bg-[#b08d4a]' 
                                                        : 'bg-[#c9a962]/10 text-[#c9a962] hover:bg-[#c9a962]/20'
                                                }`}
                                            >
                                                {editingChildId ? (
                                                    <>
                                                        <Save className="h-4 w-4" />
                                                        Update Submenu Item
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="h-4 w-4" />
                                                        Add Submenu Item
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsAddItemModalOpen(false)}
                                className="flex-1 h-11 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleAddItemSubmit}
                                className="flex-1 h-11 rounded-xl bg-[#c9a962] text-sm font-bold text-white hover:bg-[#b08d4a] transition-colors"
                            >
                                {editingItemId ? 'Update Item' : 'Add Item'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

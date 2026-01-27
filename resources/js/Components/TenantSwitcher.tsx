import { useState, useEffect, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Building2, ChevronDown, Check, RefreshCw } from 'lucide-react';
import { PageProps } from '@/types';

interface Tenant {
    id: number;
    name: string;
    slug: string;
    domain: string | null;
    is_active: boolean;
}

export default function TenantSwitcher() {
    const { auth } = usePage<PageProps>().props;
    const [isOpen, setIsOpen] = useState(false);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [activeTenantId, setActiveTenantId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [isSwitched, setIsSwitched] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Only show for super_admin
    if (auth.user.role !== 'super_admin') {
        return null;
    }

    // Fetch tenants on mount
    useEffect(() => {
        fetchTenants();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchTenants = async () => {
        try {
            const response = await fetch('/admin/tenant-switcher');
            if (response.ok) {
                const data = await response.json();
                setTenants(data.data.tenants);
                setActiveTenantId(data.data.active_tenant_id);
                
                // Check if switched
                const currentResponse = await fetch('/admin/tenant-switcher/current');
                if (currentResponse.ok) {
                    const currentData = await currentResponse.json();
                    setIsSwitched(currentData.data.is_switched);
                }
            }
        } catch (error) {
            console.error('Failed to fetch tenants:', error);
        }
    };

    const handleSwitch = async (tenantId: number) => {
        if (tenantId === activeTenantId) {
            setIsOpen(false);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/admin/tenant-switcher/switch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ tenant_id: tenantId }),
            });

            if (response.ok) {
                setActiveTenantId(tenantId);
                setIsSwitched(true);
                setIsOpen(false);
                // Reload page to reflect tenant change
                router.reload();
            }
        } catch (error) {
            console.error('Failed to switch tenant:', error);
        }
        setLoading(false);
    };

    const handleReset = async () => {
        setLoading(true);
        try {
            const response = await fetch('/admin/tenant-switcher/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setActiveTenantId(data.data.tenant?.id || auth.user.tenant_id);
                setIsSwitched(false);
                setIsOpen(false);
                router.reload();
            }
        } catch (error) {
            console.error('Failed to reset tenant:', error);
        }
        setLoading(false);
    };

    const activeTenant = tenants.find(t => t.id === activeTenantId);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 h-10 px-3 text-sm rounded-xl border transition-all ${
                    isSwitched
                        ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
            >
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline font-medium max-w-[120px] truncate">
                    {activeTenant?.name || 'Select Tenant'}
                </span>
                {isSwitched && (
                    <span className="hidden sm:inline text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-medium">
                        Viewing
                    </span>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Switch Tenant</p>
                        <p className="text-xs text-gray-400 mt-0.5">View data as different tenant</p>
                    </div>

                    <div className="max-h-64 overflow-y-auto py-1">
                        {tenants.map((tenant) => (
                            <button
                                key={tenant.id}
                                onClick={() => handleSwitch(tenant.id)}
                                disabled={loading}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                                    tenant.id === activeTenantId ? 'bg-[#c9a962]/10' : ''
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                                    tenant.is_active ? 'bg-gradient-to-br from-[#c9a962] to-[#d4b87a]' : 'bg-gray-400'
                                }`}>
                                    {tenant.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{tenant.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{tenant.domain || tenant.slug}</p>
                                </div>
                                {tenant.id === activeTenantId && (
                                    <Check className="h-4 w-4 text-[#c9a962]" />
                                )}
                                {!tenant.is_active && (
                                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Inactive</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {isSwitched && (
                        <div className="border-t border-gray-100 pt-1 mt-1">
                            <button
                                onClick={handleReset}
                                disabled={loading}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                <span>Reset to My Tenant</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

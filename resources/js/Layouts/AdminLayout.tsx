import { useState, PropsWithChildren, ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import FlashMessages from '@/Components/FlashMessages';
import { HelpChatbot } from '@/Components/HelpChatbot';
import {
    LayoutDashboard,
    FileText,
    Package,
    Users,
    Image,
    MessageSquare,
    Settings,
    Menu,
    X,
    ChevronDown,
    LogOut,
    Building2,
    HelpCircle,
    Star,
    Navigation,
    Webhook,
    FolderTree,
    Component,
    ChevronRight,
    Bell,
    Search,
    Sparkles,
    Shield,
    Crown,
} from 'lucide-react';

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    current?: boolean;
    children?: { name: string; href: string }[];
}

const superAdminNavigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tenants', href: '/admin/tenants', icon: Building2 },
    { name: 'Templates', href: '/admin/templates', icon: Package },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Pages', href: '/admin/pages', icon: FileText },
    { name: 'Services', href: '/admin/services', icon: Package },
    { name: 'Categories', href: '/admin/service-categories', icon: FolderTree },
    { name: 'Media Library', href: '/admin/media', icon: Image },
    { name: 'Testimonials', href: '/admin/testimonials', icon: Star },
    { name: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
    { name: 'Team', href: '/admin/team', icon: Users },
    { name: 'Menus', href: '/admin/menus', icon: Navigation },
    { name: 'Webhooks', href: '/admin/webhooks', icon: Webhook },
    { name: 'Component Types', href: '/admin/component-types', icon: Component },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const tenantNavigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Pages', href: '/admin/pages', icon: FileText },
    { name: 'Services', href: '/admin/services', icon: Package },
    { name: 'Categories', href: '/admin/service-categories', icon: FolderTree },
    { name: 'Media Library', href: '/admin/media', icon: Image },
    { name: 'Testimonials', href: '/admin/testimonials', icon: Star },
    { name: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
    { name: 'Team', href: '/admin/team', icon: Users },
    { name: 'Menus', href: '/admin/menus', icon: Navigation },
    { name: 'Webhooks', href: '/admin/webhooks', icon: Webhook },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function AdminLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = auth.user.role === 'super_admin' ? superAdminNavigation : tenantNavigation;
    const currentPath = window.location.pathname;

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo Section */}
            <div className="flex h-20 shrink-0 items-center justify-center px-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#c9a962] via-[#d4b87a] to-[#c9a962] flex items-center justify-center shadow-xl shadow-[#c9a962]/30 rotate-3 hover:rotate-0 transition-transform duration-300">
                            <span className="text-white font-black text-xl">H</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#1a1a2e] flex items-center justify-center">
                            <Sparkles className="w-2 h-2 text-white" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-white tracking-tight">Hyve</span>
                            <span className="text-2xl font-light text-[#c9a962] tracking-tight">CMS</span>
                        </div>
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Admin Panel</span>
                    </div>
                </div>
            </div>

            {/* Navigation - Scrollable */}
            <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4">
                {/* Main Section */}
                <div className="mb-4">
                    <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#c9a962' }}>Main Menu</p>
                    <div className="space-y-1">
                        {navigation.slice(0, 1).map((item) => {
                            const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="group flex items-center gap-x-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 hover:bg-white/10"
                                    style={{ 
                                        color: '#ffffff',
                                        background: isActive ? 'linear-gradient(to right, #c9a962, #d4b87a)' : 'transparent',
                                        boxShadow: isActive ? '0 10px 15px -3px rgba(201, 169, 98, 0.25)' : 'none'
                                    }}
                                >
                                    <div 
                                        className="p-2 rounded-lg transition-colors"
                                        style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)' }}
                                    >
                                        <item.icon 
                                            className="h-4 w-4 shrink-0 transition-colors"
                                            style={{ color: isActive ? '#ffffff' : '#c9a962' }}
                                        />
                                    </div>
                                    <span className="flex-1">{item.name}</span>
                                    {isActive && (
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ffffff', boxShadow: '0 0 4px rgba(255,255,255,0.5)' }} />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Content Section */}
                <div className="mb-4">
                    <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#c9a962' }}>Content</p>
                    <div className="space-y-0.5">
                        {navigation.slice(1, -1).map((item) => {
                            const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="group flex items-center gap-x-3 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-white/10"
                                    style={{ 
                                        color: '#ffffff',
                                        background: isActive ? 'linear-gradient(to right, #c9a962, #d4b87a)' : 'transparent',
                                        boxShadow: isActive ? '0 10px 15px -3px rgba(201, 169, 98, 0.25)' : 'none'
                                    }}
                                >
                                    <item.icon 
                                        className="h-4 w-4 shrink-0 transition-colors"
                                        style={{ color: isActive ? '#ffffff' : '#c9a962' }}
                                    />
                                    <span className="flex-1">{item.name}</span>
                                    {isActive && (
                                        <ChevronRight className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.7)' }} />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Settings Section */}
                <div className="pb-2">
                    <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#c9a962' }}>System</p>
                    <div className="space-y-0.5">
                        {navigation.slice(-1).map((item) => {
                            const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="group flex items-center gap-x-3 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-white/10"
                                    style={{ 
                                        color: '#ffffff',
                                        background: isActive ? 'linear-gradient(to right, #c9a962, #d4b87a)' : 'transparent',
                                        boxShadow: isActive ? '0 10px 15px -3px rgba(201, 169, 98, 0.25)' : 'none'
                                    }}
                                >
                                    <item.icon 
                                        className="h-4 w-4 shrink-0 transition-colors"
                                        style={{ color: isActive ? '#ffffff' : '#c9a962' }}
                                    />
                                    <span className="flex-1">{item.name}</span>
                                    {isActive && (
                                        <ChevronRight className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.7)' }} />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* User Section - Fixed at bottom */}
            <div className="shrink-0 mt-auto p-3 border-t border-white/10">
                <div className="relative overflow-hidden rounded-2xl p-4" style={{ background: 'linear-gradient(to bottom right, rgba(255,255,255,0.1), rgba(255,255,255,0.05))' }}>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: 'rgba(201,169,98,0.1)' }} />
                    <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full translate-y-1/2 -translate-x-1/2" style={{ backgroundColor: 'rgba(201,169,98,0.05)' }} />
                    
                    <div className="relative flex items-center gap-x-3">
                        <div className="relative">
                            <div className="h-11 w-11 rounded-2xl flex items-center justify-center font-bold text-lg" style={{ background: 'linear-gradient(to bottom right, #c9a962, #d4b87a, #c9a962)', color: '#ffffff', boxShadow: '0 10px 15px -3px rgba(201,169,98,0.3)' }}>
                                {auth.user.name.charAt(0).toUpperCase()}
                            </div>
                            {auth.user.role === 'super_admin' && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(to right, #fbbf24, #f59e0b)', border: '2px solid #1a1a2e' }}>
                                    <Crown className="w-2.5 h-2.5" style={{ color: '#ffffff' }} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-bold" style={{ color: '#ffffff' }}>{auth.user.name}</p>
                            <div className="flex items-center gap-1.5">
                                <Shield className="w-3 h-3" style={{ color: '#c9a962' }} />
                                <p className="truncate text-xs capitalize font-medium" style={{ color: '#c9a962' }}>{auth.user.role.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Quick actions */}
                    <div className="relative flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <Link
                            href={route('profile.edit')}
                            className="flex-1 text-center py-2 px-3 text-xs font-semibold rounded-xl transition-all hover:bg-white/10"
                            style={{ color: '#e0e0e0' }}
                        >
                            Profile
                        </Link>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="flex-1 text-center py-2 px-3 text-xs font-semibold rounded-xl transition-all hover:bg-red-500/10"
                            style={{ color: '#f87171' }}
                        >
                            Sign Out
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <div
                className={classNames(
                    'fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex flex-col h-full relative overflow-hidden" style={{ backgroundColor: '#1a1a2e' }}>
                    {/* Subtle decorative gradient overlay */}
                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(201,169,98,0.03) 0%, transparent 30%, transparent 70%, rgba(15,52,96,0.3) 100%)' }} />
                    
                    <button
                        type="button"
                        className="absolute top-6 right-4 text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all z-10"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <SidebarContent />
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                <div className="flex grow flex-col relative overflow-hidden" style={{ backgroundColor: '#1a1a2e' }}>
                    {/* Subtle decorative gradient overlay */}
                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(201,169,98,0.03) 0%, transparent 30%, transparent 70%, rgba(15,52,96,0.3) 100%)' }} />
                    
                    <SidebarContent />
                </div>
            </div>

            {/* Main content area */}
            <div className="lg:pl-72">
                {/* Top header bar */}
                <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-100 bg-white/80 backdrop-blur-xl px-4 sm:gap-x-6 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        className="-m-2.5 p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    {/* Separator */}
                    <div className="h-6 w-px bg-gray-200 lg:hidden" />

                    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                        <div className="flex flex-1 items-center gap-4">
                            {header && (
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200/50">
                                        <Sparkles className="h-5 w-5 text-[#c9a962]" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold text-gray-900">{header}</h1>
                                        <p className="hidden sm:block text-xs text-gray-500">Manage your content</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-x-2 lg:gap-x-3">
                            {/* Search button */}
                            <button className="hidden sm:flex items-center gap-2 h-10 px-4 text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200/50 transition-all">
                                <Search className="h-4 w-4" />
                                <span className="text-gray-400">Search...</span>
                                <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-gray-200 bg-white px-1.5 font-mono text-[10px] font-medium text-gray-400">
                                    ⌘K
                                </kbd>
                            </button>
                            
                            {/* Notifications */}
                            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
                            </button>

                            {/* Divider */}
                            <div className="hidden lg:block h-8 w-px bg-gray-200" />

                            {/* Profile section */}
                            <div className="flex items-center gap-3">
                                <Link
                                    href={route('profile.edit')}
                                    className="hidden lg:flex items-center gap-3 py-1.5 px-3 rounded-xl hover:bg-gray-50 transition-all group"
                                >
                                    <div className="relative">
                                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#c9a962] to-[#d4b87a] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[#c9a962]/20">
                                            {auth.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-gray-900 group-hover:text-[#c9a962] transition-colors">{auth.user.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{auth.user.role.replace('_', ' ')}</p>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                </Link>
                            </div>
                            
                            {/* Logout button */}
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                title="Sign out"
                            >
                                <LogOut className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="py-8 bg-gradient-to-br from-gray-50 via-white to-gray-50/50 min-h-[calc(100vh-4rem)]">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <FlashMessages />
                        {children}
                    </div>
                </main>
            </div>

            {/* Help Chatbot - Available on all admin pages */}
            <HelpChatbot />
        </div>
    );
}

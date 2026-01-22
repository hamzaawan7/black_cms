import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import {
    FileText,
    Package,
    Image,
    Users,
    Star,
    HelpCircle,
    ArrowUpRight,
    Pencil,
    Plus,
    Settings,
    Upload,
    Zap,
    Activity,
    Clock,
    TrendingUp,
    BarChart3,
    PieChart,
    Layers,
    CheckCircle,
    FileEdit,
    FolderOpen,
} from 'lucide-react';

interface DashboardProps {
    stats: {
        pages: number;
        services: number;
        media: number;
        testimonials: number;
        faqs: number;
        team_members: number;
        categories?: number;
        published_pages?: number;
        draft_pages?: number;
        active_services?: number;
    };
    recentPages: Array<{
        id: number;
        title: string;
        slug: string;
        updated_at: string;
        is_published: boolean;
    }>;
    recentServices: Array<{
        id: number;
        name: string;
        slug: string;
        is_active: boolean;
    }>;
    contentDistribution?: Array<{
        name: string;
        value: number;
        color: string;
    }>;
    servicesByCategory?: Array<{
        name: string;
        count: number;
    }>;
    monthlyActivity?: Array<{
        month: string;
        pages: number;
        services: number;
        media: number;
    }>;
}

// Premium color scheme with gold accent
const statCards = [
    { name: 'Pages', key: 'pages', icon: FileText, href: '/admin/pages', gradient: 'from-slate-700 to-slate-800', iconBg: 'bg-[#c9a962]', shadow: 'shadow-slate-500/20' },
    { name: 'Services', key: 'services', icon: Package, href: '/admin/services', gradient: 'from-slate-700 to-slate-800', iconBg: 'bg-[#c9a962]', shadow: 'shadow-slate-500/20' },
    { name: 'Media Files', key: 'media', icon: Image, href: '/admin/media', gradient: 'from-slate-700 to-slate-800', iconBg: 'bg-[#c9a962]', shadow: 'shadow-slate-500/20' },
    { name: 'Testimonials', key: 'testimonials', icon: Star, href: '/admin/testimonials', gradient: 'from-slate-700 to-slate-800', iconBg: 'bg-[#c9a962]', shadow: 'shadow-slate-500/20' },
    { name: 'FAQs', key: 'faqs', icon: HelpCircle, href: '/admin/faqs', gradient: 'from-slate-700 to-slate-800', iconBg: 'bg-[#c9a962]', shadow: 'shadow-slate-500/20' },
    { name: 'Team Members', key: 'team_members', icon: Users, href: '/admin/team', gradient: 'from-slate-700 to-slate-800', iconBg: 'bg-[#c9a962]', shadow: 'shadow-slate-500/20' },
];

// Donut Chart Component
function DonutChart({ data, size = 180 }: { data: Array<{ name: string; value: number; color: string }>; size?: number }) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
        return (
            <div className="flex items-center justify-center" style={{ width: size, height: size }}>
                <p className="text-sm text-slate-400">No data</p>
            </div>
        );
    }
    
    const radius = size / 2 - 10;
    const innerRadius = radius * 0.6;
    let currentAngle = -90;
    
    const paths = data.map((item, index) => {
        const percentage = (item.value / total) * 100;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;
        
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        
        const x1 = size / 2 + radius * Math.cos(startRad);
        const y1 = size / 2 + radius * Math.sin(startRad);
        const x2 = size / 2 + radius * Math.cos(endRad);
        const y2 = size / 2 + radius * Math.sin(endRad);
        
        const x3 = size / 2 + innerRadius * Math.cos(endRad);
        const y3 = size / 2 + innerRadius * Math.sin(endRad);
        const x4 = size / 2 + innerRadius * Math.cos(startRad);
        const y4 = size / 2 + innerRadius * Math.sin(startRad);
        
        const largeArc = angle > 180 ? 1 : 0;
        
        const d = `
            M ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
            L ${x3} ${y3}
            A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
            Z
        `;
        
        return (
            <path
                key={index}
                d={d}
                fill={item.color}
                className="transition-all duration-300 hover:opacity-80"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
            />
        );
    });
    
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {paths}
            <text
                x={size / 2}
                y={size / 2 - 8}
                textAnchor="middle"
                className="fill-slate-800 text-2xl font-bold"
            >
                {total}
            </text>
            <text
                x={size / 2}
                y={size / 2 + 12}
                textAnchor="middle"
                className="fill-slate-500 text-xs"
            >
                Total Items
            </text>
        </svg>
    );
}

// Bar Chart Component
function BarChart({ data, maxHeight = 120 }: { data: Array<{ name: string; count: number }>; maxHeight?: number }) {
    const maxValue = Math.max(...data.map(d => d.count), 1);
    
    return (
        <div className="relative h-full">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-xs text-slate-400">
                <span>{maxValue}</span>
                <span>{Math.floor(maxValue / 2)}</span>
                <span>0</span>
            </div>
            
            {/* Chart area */}
            <div className="ml-10 h-full flex items-end gap-2 pb-6">
                {data.map((item, index) => {
                    const height = (item.count / maxValue) * maxHeight;
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div 
                                className="w-full bg-gradient-to-t from-[#c9a962] to-[#d4c28a] rounded-t-lg transition-all duration-500 hover:from-[#b08d4a] hover:to-[#c9a962] relative group"
                                style={{ height: `${height}px`, minHeight: item.count > 0 ? '20px' : '4px' }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {item.count} services
                                </div>
                            </div>
                            <span className="text-xs text-slate-500 text-center truncate w-full" title={item.name}>
                                {item.name.length > 8 ? item.name.substring(0, 8) + '...' : item.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Line Chart / Area Chart Component
function ActivityChart({ data }: { data: Array<{ month: string; pages: number; services: number; media: number }> }) {
    const allValues = data.flatMap(d => [d.pages, d.services, d.media]);
    const maxValue = Math.max(...allValues, 1);
    const chartWidth = 100;
    const chartHeight = 100;
    const padding = 5;
    
    const getPoints = (key: 'pages' | 'services' | 'media') => {
        return data.map((d, i) => {
            const x = padding + (i / (data.length - 1)) * (chartWidth - 2 * padding);
            const y = chartHeight - padding - ((d[key] / maxValue) * (chartHeight - 2 * padding));
            return `${x},${y}`;
        }).join(' ');
    };
    
    const getAreaPath = (key: 'pages' | 'services' | 'media') => {
        const points = data.map((d, i) => {
            const x = padding + (i / (data.length - 1)) * (chartWidth - 2 * padding);
            const y = chartHeight - padding - ((d[key] / maxValue) * (chartHeight - 2 * padding));
            return { x, y };
        });
        
        let path = `M ${points[0].x} ${chartHeight - padding}`;
        points.forEach(p => {
            path += ` L ${p.x} ${p.y}`;
        });
        path += ` L ${points[points.length - 1].x} ${chartHeight - padding} Z`;
        return path;
    };
    
    return (
        <div className="relative">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`} className="w-full h-48">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map(y => (
                    <line
                        key={y}
                        x1={padding}
                        y1={chartHeight - padding - (y / 100) * (chartHeight - 2 * padding)}
                        x2={chartWidth - padding}
                        y2={chartHeight - padding - (y / 100) * (chartHeight - 2 * padding)}
                        stroke="#e5e7eb"
                        strokeWidth="0.5"
                    />
                ))}
                
                {/* Area fills */}
                <path d={getAreaPath('media')} fill="#e5e7eb" opacity="0.5" />
                <path d={getAreaPath('services')} fill="#3d3d3d" opacity="0.3" />
                <path d={getAreaPath('pages')} fill="#c9a962" opacity="0.4" />
                
                {/* Lines */}
                <polyline
                    points={getPoints('media')}
                    fill="none"
                    stroke="#9ca3af"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <polyline
                    points={getPoints('services')}
                    fill="none"
                    stroke="#3d3d3d"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <polyline
                    points={getPoints('pages')}
                    fill="none"
                    stroke="#c9a962"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                
                {/* Dots */}
                {data.map((d, i) => {
                    const x = padding + (i / (data.length - 1)) * (chartWidth - 2 * padding);
                    return (
                        <g key={i}>
                            <circle
                                cx={x}
                                cy={chartHeight - padding - ((d.pages / maxValue) * (chartHeight - 2 * padding))}
                                r="3"
                                fill="#c9a962"
                                stroke="white"
                                strokeWidth="1.5"
                            />
                        </g>
                    );
                })}
                
                {/* X-axis labels */}
                {data.map((d, i) => {
                    const x = padding + (i / (data.length - 1)) * (chartWidth - 2 * padding);
                    return (
                        <text
                            key={i}
                            x={x}
                            y={chartHeight + 12}
                            textAnchor="middle"
                            className="fill-slate-400 text-[8px]"
                        >
                            {d.month}
                        </text>
                    );
                })}
            </svg>
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#c9a962]" />
                    <span className="text-xs text-slate-600">Pages</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#3d3d3d]" />
                    <span className="text-xs text-slate-600">Services</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#9ca3af]" />
                    <span className="text-xs text-slate-600">Media</span>
                </div>
            </div>
        </div>
    );
}

// Progress Ring Component
function ProgressRing({ value, max, label, color = '#c9a962', size = 80 }: { value: number; max: number; label: string; color?: string; size?: number }) {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth={strokeWidth}
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-slate-800">{value}</span>
                </div>
            </div>
            <span className="text-xs text-slate-500 mt-2">{label}</span>
        </div>
    );
}

export default function Dashboard({ 
    stats, 
    recentPages = [], 
    recentServices = [],
    contentDistribution = [],
    servicesByCategory = [],
    monthlyActivity = [],
}: DashboardProps) {
    // Default stats if not provided
    const defaultStats: DashboardProps['stats'] = {
        pages: stats?.pages ?? 0,
        services: stats?.services ?? 0,
        media: stats?.media ?? 0,
        testimonials: stats?.testimonials ?? 0,
        faqs: stats?.faqs ?? 0,
        team_members: stats?.team_members ?? 0,
        categories: stats?.categories ?? 0,
        published_pages: stats?.published_pages ?? 0,
        draft_pages: stats?.draft_pages ?? 0,
        active_services: stats?.active_services ?? 0,
    };

    const totalContent = defaultStats.pages + defaultStats.services + defaultStats.media + defaultStats.faqs + defaultStats.testimonials;

    return (
        <AdminLayout header="Dashboard">
            <Head title="Dashboard" />

            {/* Welcome Banner */}
            <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 p-8">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <Activity className="h-5 w-5 text-[#c9a962]" />
                        <span className="text-sm font-medium text-[#c9a962]">Dashboard Overview</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Welcome back!</h1>
                    <p className="text-slate-300 max-w-2xl">Manage your content, services, and site settings all in one place. Here's a quick overview of your website.</p>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#c9a962]/10 to-transparent" />
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#c9a962]/10 blur-3xl" />
                <div className="absolute -right-5 -bottom-10 h-32 w-32 rounded-full bg-[#c9a962]/5 blur-2xl" />
                
                {/* Quick Stats in Banner */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex items-center gap-8">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-white">{totalContent}</p>
                        <p className="text-xs text-slate-400">Total Content</p>
                    </div>
                    <div className="w-px h-12 bg-slate-600" />
                    <div className="text-center">
                        <p className="text-3xl font-bold text-[#c9a962]">{defaultStats.published_pages}</p>
                        <p className="text-xs text-slate-400">Published</p>
                    </div>
                    <div className="w-px h-12 bg-slate-600" />
                    <div className="text-center">
                        <p className="text-3xl font-bold text-emerald-400">{defaultStats.active_services}</p>
                        <p className="text-xs text-slate-400">Active Services</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {statCards.map((stat) => (
                    <Link
                        key={stat.key}
                        href={stat.href}
                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 p-5 border border-slate-200/60 hover:border-[#c9a962]/40 hover:shadow-xl hover:shadow-[#c9a962]/10 transition-all duration-300"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.name}</p>
                                <p className="text-3xl font-bold text-slate-800 mt-1">
                                    {defaultStats[stat.key as keyof typeof defaultStats]}
                                </p>
                            </div>
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                <stat.icon className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1 text-xs">
                            <span className="font-medium text-[#c9a962] group-hover:text-[#b08d4a] transition-colors">View</span>
                            <ArrowUpRight className="h-3 w-3 text-[#c9a962] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Charts Section */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Content Distribution Pie Chart */}
                <div className="rounded-2xl bg-white border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
                            <PieChart className="h-5 w-5 text-[#c9a962]" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-slate-800">Content Distribution</h3>
                            <p className="text-xs text-slate-500">Overview of all content types</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <DonutChart data={contentDistribution} size={180} />
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-2">
                        {contentDistribution.slice(0, 4).map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-xs text-slate-600">{item.name}</span>
                                <span className="text-xs font-semibold text-slate-800 ml-auto">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Monthly Activity Line Chart */}
                <div className="rounded-2xl bg-white border border-slate-200 p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
                                <TrendingUp className="h-5 w-5 text-[#c9a962]" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-slate-800">Content Activity</h3>
                                <p className="text-xs text-slate-500">Last 6 months activity trends</p>
                            </div>
                        </div>
                    </div>
                    {monthlyActivity.length > 0 ? (
                        <ActivityChart data={monthlyActivity} />
                    ) : (
                        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                            No activity data available
                        </div>
                    )}
                </div>
            </div>

            {/* Second Row Charts */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Services by Category Bar Chart */}
                <div className="rounded-2xl bg-white border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
                            <BarChart3 className="h-5 w-5 text-[#c9a962]" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-slate-800">Services by Category</h3>
                            <p className="text-xs text-slate-500">Distribution across categories</p>
                        </div>
                    </div>
                    <div className="h-[180px]">
                        {servicesByCategory.length > 0 ? (
                            <BarChart data={servicesByCategory} maxHeight={140} />
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                                No category data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Status */}
                <div className="rounded-2xl bg-white border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
                            <Layers className="h-5 w-5 text-[#c9a962]" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-slate-800">Content Status</h3>
                            <p className="text-xs text-slate-500">Published vs Draft content</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-around py-4">
                        <ProgressRing 
                            value={defaultStats.published_pages || 0} 
                            max={defaultStats.pages} 
                            label="Published Pages" 
                            color="#c9a962"
                        />
                        <ProgressRing 
                            value={defaultStats.draft_pages || 0} 
                            max={defaultStats.pages} 
                            label="Draft Pages" 
                            color="#9ca3af"
                        />
                        <ProgressRing 
                            value={defaultStats.active_services || 0} 
                            max={defaultStats.services} 
                            label="Active Services" 
                            color="#10b981"
                        />
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="flex items-center justify-center gap-1 text-emerald-600">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-lg font-bold">{defaultStats.published_pages || 0}</span>
                                </div>
                                <p className="text-xs text-slate-500">Live</p>
                            </div>
                            <div>
                                <div className="flex items-center justify-center gap-1 text-amber-600">
                                    <FileEdit className="h-4 w-4" />
                                    <span className="text-lg font-bold">{defaultStats.draft_pages || 0}</span>
                                </div>
                                <p className="text-xs text-slate-500">Drafts</p>
                            </div>
                            <div>
                                <div className="flex items-center justify-center gap-1 text-blue-600">
                                    <FolderOpen className="h-4 w-4" />
                                    <span className="text-lg font-bold">{defaultStats.categories || 0}</span>
                                </div>
                                <p className="text-xs text-slate-500">Categories</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
                <div className="flex items-center gap-2 mb-5">
                    <Zap className="h-5 w-5 text-[#c9a962]" />
                    <h2 className="text-lg font-semibold text-slate-800">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Link
                        href="/admin/pages/create"
                        className="group flex items-center gap-4 rounded-xl bg-white border border-slate-200 p-5 hover:border-[#c9a962]/50 hover:shadow-lg hover:shadow-[#c9a962]/5 transition-all duration-300"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 group-hover:bg-[#c9a962] transition-colors duration-300">
                            <Plus className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <span className="font-semibold text-slate-800">New Page</span>
                            <p className="text-xs text-slate-500">Create a new page</p>
                        </div>
                    </Link>
                    <Link
                        href="/admin/services/create"
                        className="group flex items-center gap-4 rounded-xl bg-white border border-slate-200 p-5 hover:border-[#c9a962]/50 hover:shadow-lg hover:shadow-[#c9a962]/5 transition-all duration-300"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 group-hover:bg-[#c9a962] transition-colors duration-300">
                            <Plus className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <span className="font-semibold text-slate-800">New Service</span>
                            <p className="text-xs text-slate-500">Add a service</p>
                        </div>
                    </Link>
                    <Link
                        href="/admin/media"
                        className="group flex items-center gap-4 rounded-xl bg-white border border-slate-200 p-5 hover:border-[#c9a962]/50 hover:shadow-lg hover:shadow-[#c9a962]/5 transition-all duration-300"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 group-hover:bg-[#c9a962] transition-colors duration-300">
                            <Upload className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <span className="font-semibold text-slate-800">Upload Media</span>
                            <p className="text-xs text-slate-500">Add images & files</p>
                        </div>
                    </Link>
                    <Link
                        href="/admin/settings"
                        className="group flex items-center gap-4 rounded-xl bg-white border border-slate-200 p-5 hover:border-[#c9a962]/50 hover:shadow-lg hover:shadow-[#c9a962]/5 transition-all duration-300"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 group-hover:bg-[#c9a962] transition-colors duration-300">
                            <Settings className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <span className="font-semibold text-slate-800">Site Settings</span>
                            <p className="text-xs text-slate-500">Configure your site</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Recent Pages */}
                <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
                                <FileText className="h-5 w-5 text-[#c9a962]" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-slate-800">Recent Pages</h3>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Latest updates
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/admin/pages"
                            className="inline-flex items-center gap-1 text-sm font-medium text-[#c9a962] hover:text-[#b08d4a] transition-colors"
                        >
                            View all
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <ul className="divide-y divide-slate-100">
                        {recentPages.length > 0 ? (
                            recentPages.map((page) => (
                                <li key={page.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                                            <FileText className="h-4 w-4 text-slate-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{page.title}</p>
                                            <p className="text-xs text-slate-500">/{page.slug}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                                page.is_published
                                                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                                    : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                                            }`}
                                        >
                                            {page.is_published ? 'Published' : 'Draft'}
                                        </span>
                                        <Link
                                            href={`/admin/pages/${page.id}/edit`}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-[#c9a962] hover:text-white transition-all duration-200"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="px-6 py-12 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 mx-auto mb-4">
                                    <FileText className="h-7 w-7 text-slate-400" />
                                </div>
                                <p className="text-sm text-slate-500 mb-3">No pages created yet.</p>
                                <Link href="/admin/pages/create" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#c9a962] hover:text-[#b08d4a] transition-colors">
                                    <Plus className="h-4 w-4" />
                                    Create your first page
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Recent Services */}
                <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
                                <Package className="h-5 w-5 text-[#c9a962]" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-slate-800">Recent Services</h3>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Latest updates
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/admin/services"
                            className="inline-flex items-center gap-1 text-sm font-medium text-[#c9a962] hover:text-[#b08d4a] transition-colors"
                        >
                            View all
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <ul className="divide-y divide-slate-100">
                        {recentServices.length > 0 ? (
                            recentServices.map((service) => (
                                <li key={service.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                                            <Package className="h-4 w-4 text-slate-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{service.name}</p>
                                            <p className="text-xs text-slate-500">/{service.slug}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                                service.is_active
                                                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                                    : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                                            }`}
                                        >
                                            {service.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                        <Link
                                            href={`/admin/services/${service.id}/edit`}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-[#c9a962] hover:text-white transition-all duration-200"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="px-6 py-12 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 mx-auto mb-4">
                                    <Package className="h-7 w-7 text-slate-400" />
                                </div>
                                <p className="text-sm text-slate-500 mb-3">No services created yet.</p>
                                <Link href="/admin/services/create" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#c9a962] hover:text-[#b08d4a] transition-colors">
                                    <Plus className="h-4 w-4" />
                                    Create your first service
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </AdminLayout>
    );
}

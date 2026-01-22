import { ReactNode, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface Column<T> {
    key: string;
    header: string;
    sortable?: boolean;
    render?: (item: T, index: number) => ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    searchable?: boolean;
    searchPlaceholder?: string;
    searchKeys?: string[];
    pagination?: boolean;
    perPage?: number;
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
    loading?: boolean;
    actions?: (item: T) => ReactNode;
}

export function DataTable<T extends { id: number | string }>({
    data,
    columns,
    searchable = false,
    searchPlaceholder = 'Search...',
    searchKeys = [],
    pagination = true,
    perPage = 10,
    onRowClick,
    emptyMessage = 'No data found',
    loading = false,
    actions,
}: DataTableProps<T>) {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Filter data
    const filteredData = useMemo(() => {
        if (!search || searchKeys.length === 0) return data;

        return data.filter((item) =>
            searchKeys.some((key) => {
                const value = key.split('.').reduce((obj, k) => (obj as any)?.[k], item);
                return String(value).toLowerCase().includes(search.toLowerCase());
            })
        );
    }, [data, search, searchKeys]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortKey) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = sortKey.split('.').reduce((obj, k) => (obj as any)?.[k], a);
            const bValue = sortKey.split('.').reduce((obj, k) => (obj as any)?.[k], b);

            if (aValue === bValue) return 0;
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            const comparison = aValue < bValue ? -1 : 1;
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [filteredData, sortKey, sortDirection]);

    // Paginate data
    const paginatedData = useMemo(() => {
        if (!pagination) return sortedData;

        const start = (currentPage - 1) * perPage;
        return sortedData.slice(start, start + perPage);
    }, [sortedData, currentPage, perPage, pagination]);

    const totalPages = Math.ceil(sortedData.length / perPage);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        if (sortKey !== columnKey) {
            return <ChevronDown className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />;
        }
        return sortDirection === 'asc' ? (
            <ChevronUp className="h-4 w-4 text-[#c9a962]" />
        ) : (
            <ChevronDown className="h-4 w-4 text-[#c9a962]" />
        );
    };

    return (
        <div className="space-y-4">
            {/* Search */}
            {searchable && (
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                    />
                </div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        scope="col"
                                        className={`
                                            px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500
                                            ${column.sortable ? 'cursor-pointer select-none group' : ''}
                                            ${column.className || ''}
                                        `}
                                        onClick={() => column.sortable && handleSort(column.key)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {column.header}
                                            {column.sortable && <SortIcon columnKey={column.key} />}
                                        </div>
                                    </th>
                                ))}
                                {actions && (
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#c9a962] border-t-transparent" />
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center text-gray-500">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className={`
                                            ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                                            transition-colors
                                        `}
                                        onClick={() => onRowClick?.(item)}
                                    >
                                        {columns.map((column) => (
                                            <td
                                                key={column.key}
                                                className={`whitespace-nowrap px-6 py-4 text-sm text-gray-900 ${column.className || ''}`}
                                            >
                                                {column.render
                                                    ? column.render(item, index)
                                                    : String(column.key.split('.').reduce((obj, k) => (obj as any)?.[k], item) ?? '')
                                                }
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                {actions(item)}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-3">
                        <p className="text-sm text-gray-500">
                            Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, sortedData.length)} of {sortedData.length} results
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="px-3 py-1 text-sm text-gray-700">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

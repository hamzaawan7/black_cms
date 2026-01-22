import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { Upload, Image, Trash2, Search, Grid, List, X, Copy, Check, File, Video, Music } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useSweetAlert } from '@/hooks/useSweetAlert';

interface MediaFile {
    id: number;
    filename: string;
    original_filename: string;
    path: string;
    url: string;
    type: string;
    mime_type: string;
    size: number;
    meta?: {
        width?: number;
        height?: number;
    };
    created_at: string;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface MediaIndexProps {
    media: PaginatedData<MediaFile>;
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(type: string) {
    switch (type) {
        case 'image':
            return Image;
        case 'video':
            return Video;
        case 'audio':
            return Music;
        default:
            return File;
    }
}

export default function Index({ media }: MediaIndexProps) {
    const mediaItems = media?.data ?? [];
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const filteredMedia = mediaItems.filter(file =>
        file.original_filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.type?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const { confirmDelete, showDeletedSuccess, errorNotification } = useSweetAlert();

    const handleDelete = async (id: number, filename: string) => {
        const result = await confirmDelete(filename);
        if (result.isConfirmed) {
            router.delete(`/admin/media/${id}`, {
                onSuccess: () => {
                    showDeletedSuccess(filename);
                    if (selectedFile?.id === id) {
                        setSelectedFile(null);
                    }
                },
                onError: () => errorNotification('Failed to delete file'),
            });
        }
    };

    const copyToClipboard = async (url: string) => {
        await navigator.clipboard.writeText(url);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            const formData = new FormData();
            files.forEach((file, index) => {
                formData.append(`files[${index}]`, file);
            });
            router.post('/admin/media', formData);
        }
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const formData = new FormData();
            Array.from(files).forEach((file, index) => {
                formData.append(`files[${index}]`, file);
            });
            router.post('/admin/media', formData);
        }
    };

    return (
        <AdminLayout header="Media Library">
            <Head title="Media Library" />

            <div className="flex gap-6">
                {/* Main content */}
                <div className="flex-1 min-w-0">
                    {/* Header actions */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search files..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center rounded-lg border border-gray-300 p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                                >
                                    <Grid className="h-4 w-4 text-gray-600" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                                >
                                    <List className="h-4 w-4 text-gray-600" />
                                </button>
                            </div>
                            <label className="inline-flex items-center gap-2 rounded-lg bg-[#c9a962] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b08d4a] transition-colors cursor-pointer">
                                <Upload className="h-5 w-5" />
                                Upload
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                                    onChange={handleFileInput}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Drop zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`mb-6 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                            isDragging
                                ? 'border-[#c9a962] bg-[#c9a962]/5'
                                : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                        <Upload className={`mx-auto h-10 w-10 ${isDragging ? 'text-[#c9a962]' : 'text-gray-400'}`} />
                        <p className="mt-2 text-sm text-gray-600">
                            Drag and drop files here, or{' '}
                            <label className="text-[#c9a962] hover:text-[#b08d4a] cursor-pointer">
                                browse
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                                    onChange={handleFileInput}
                                    className="hidden"
                                />
                            </label>
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                            Images, videos, audio, and documents up to 10MB
                        </p>
                    </div>

                    {/* Media grid/list */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {filteredMedia.length > 0 ? (
                                filteredMedia.map((file) => {
                                    const FileIcon = getFileIcon(file.type);
                                    return (
                                        <div
                                            key={file.id}
                                            onClick={() => setSelectedFile(file)}
                                            className={`group relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                                                selectedFile?.id === file.id
                                                    ? 'border-[#c9a962] ring-2 ring-[#c9a962]/20'
                                                    : 'border-transparent hover:border-gray-300'
                                            }`}
                                        >
                                            {file.type === 'image' ? (
                                                <img
                                                    src={file.url}
                                                    alt={file.original_filename}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full bg-gray-100">
                                                    <FileIcon className="h-12 w-12 text-gray-400" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(file.id, file.original_filename);
                                                    }}
                                                    className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                                <p className="text-xs text-white truncate">{file.original_filename}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full rounded-lg bg-white shadow px-6 py-12 text-center">
                                    <Image className="mx-auto h-12 w-12 text-gray-300" />
                                    <p className="mt-3 text-sm text-gray-500">
                                        {searchQuery ? 'No files found.' : 'No files uploaded yet.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="rounded-lg bg-white shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            File
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Size
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Uploaded
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredMedia.map((file) => {
                                        const FileIcon = getFileIcon(file.type);
                                        return (
                                            <tr
                                                key={file.id}
                                                onClick={() => setSelectedFile(file)}
                                                className={`cursor-pointer hover:bg-gray-50 ${
                                                    selectedFile?.id === file.id ? 'bg-[#c9a962]/5' : ''
                                                }`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        {file.type === 'image' ? (
                                                            <img
                                                                src={file.url}
                                                                alt=""
                                                                className="h-10 w-10 rounded object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                                                                <FileIcon className="h-5 w-5 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <span className="text-sm text-gray-900 truncate max-w-xs">
                                                            {file.original_filename}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                    {file.type}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatFileSize(file.size)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(file.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(file.id, file.original_filename);
                                                        }}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Sidebar - File details */}
                {selectedFile && (
                    <div className="hidden lg:block w-80 shrink-0">
                        <div className="sticky top-24 rounded-lg bg-white shadow overflow-hidden">
                            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                                <h3 className="font-medium text-gray-900">File Details</h3>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            
                            {/* Preview */}
                            <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                {selectedFile.type === 'image' ? (
                                    <img
                                        src={selectedFile.url}
                                        alt={selectedFile.original_filename}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                ) : (
                                    (() => {
                                        const FileIcon = getFileIcon(selectedFile.type);
                                        return <FileIcon className="h-16 w-16 text-gray-400" />;
                                    })()
                                )}
                            </div>

                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Filename</label>
                                    <p className="text-sm text-gray-900 break-all">
                                        {selectedFile.original_filename}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Type</label>
                                    <p className="text-sm text-gray-900 capitalize">{selectedFile.type}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Size</label>
                                    <p className="text-sm text-gray-900">{formatFileSize(selectedFile.size)}</p>
                                </div>
                                {selectedFile.meta?.width && selectedFile.meta?.height && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Dimensions</label>
                                        <p className="text-sm text-gray-900">
                                            {selectedFile.meta.width} × {selectedFile.meta.height}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <label className="text-xs font-medium text-gray-500">URL</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <input
                                            type="text"
                                            value={selectedFile.url}
                                            readOnly
                                            className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1.5"
                                        />
                                        <button
                                            onClick={() => copyToClipboard(selectedFile.url)}
                                            className="p-1.5 rounded border border-gray-200 hover:bg-gray-50"
                                            title="Copy URL"
                                        >
                                            {copiedUrl ? (
                                                <Check className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <Copy className="h-4 w-4 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(selectedFile.id, selectedFile.original_filename)}
                                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete File
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

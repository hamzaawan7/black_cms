import { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, FileText, Film } from 'lucide-react';

interface MediaUploaderProps {
    // URL-based API (for uploaded files)
    value?: string | string[];
    onChange?: (value: string | string[] | null) => void;
    // File-based API (for direct file handling)
    onUpload?: (files: File[]) => void;
    onRemove?: () => void;
    preview?: string | null;
    // Common props
    multiple?: boolean;
    accept?: string | Record<string, string[]>;
    maxSize?: number; // in MB or bytes depending on usage
    maxFiles?: number;
    uploadUrl?: string;
    className?: string;
    label?: string;
    error?: string;
    hint?: string;
}

interface UploadedFile {
    id: number;
    url: string;
    filename: string;
    type: string;
}

export function MediaUploader({
    value,
    onChange,
    onUpload,
    onRemove,
    preview,
    multiple = false,
    accept = 'image/*',
    maxSize = 2, // PHP default upload limit is 2MB
    maxFiles,
    uploadUrl = '/admin/media/upload',
    className = '',
    label,
    error,
    hint,
}: MediaUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Normalize accept to string format for input element
    const acceptString = typeof accept === 'string' ? accept : Object.keys(accept).join(',');
    
    // Normalize maxSize to MB if it's in bytes (> 100 means likely bytes)
    const maxSizeMB = maxSize > 100 ? maxSize / (1024 * 1024) : maxSize;

    const values = Array.isArray(value) ? value : value ? [value] : [];
    
    // Determine if we're using file-based or URL-based API
    const isFileBased = !!onUpload;

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const uploadFile = async (file: File): Promise<UploadedFile | null> => {
        // Validate file size
        if (file.size > maxSizeMB * 1024 * 1024) {
            setUploadError(`File size must be less than ${maxSizeMB}MB`);
            return null;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();
            
            if (!response.ok) {
                const errorMessage = data.message || data.errors?.file?.[0] || 'Upload failed';
                throw new Error(errorMessage);
            }

            return data.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
            setUploadError(errorMessage);
            console.error('Upload error:', err);
            return null;
        }
    };

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        setUploadError(null);

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        const filesToProcess = multiple ? files : [files[0]];

        // File-based API: just call onUpload with the files
        if (isFileBased && onUpload) {
            onUpload(filesToProcess);
            return;
        }

        // URL-based API: upload files and return URLs
        if (onChange) {
            setIsUploading(true);
            setUploadProgress(0);

            const uploadedUrls: string[] = [];

            for (let i = 0; i < filesToProcess.length; i++) {
                const result = await uploadFile(filesToProcess[i]);
                if (result) {
                    uploadedUrls.push(result.url);
                }
                setUploadProgress(((i + 1) / filesToProcess.length) * 100);
            }

            setIsUploading(false);

            if (uploadedUrls.length > 0) {
                if (multiple) {
                    onChange([...values, ...uploadedUrls]);
                } else {
                    onChange(uploadedUrls[0]);
                }
            }
        }
    }, [multiple, values, onChange, onUpload, isFileBased, uploadUrl, maxSizeMB]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploadError(null);
        const filesToProcess = multiple ? files : [files[0]];

        // File-based API: just call onUpload with the files
        if (isFileBased && onUpload) {
            onUpload(filesToProcess);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        // URL-based API: upload files and return URLs
        if (onChange) {
            setIsUploading(true);
            setUploadProgress(0);

            const uploadedUrls: string[] = [];

            for (let i = 0; i < filesToProcess.length; i++) {
                const result = await uploadFile(filesToProcess[i]);
                if (result) {
                    uploadedUrls.push(result.url);
                }
                setUploadProgress(((i + 1) / filesToProcess.length) * 100);
            }

            setIsUploading(false);

            if (uploadedUrls.length > 0) {
                if (multiple) {
                    onChange([...values, ...uploadedUrls]);
                } else {
                    onChange(uploadedUrls[0]);
                }
            }
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (index: number) => {
        // File-based API: call onRemove
        if (isFileBased && onRemove) {
            onRemove();
            return;
        }
        
        // URL-based API
        if (onChange) {
            if (multiple) {
                const newValues = [...values];
                newValues.splice(index, 1);
                onChange(newValues.length > 0 ? newValues : null);
            } else {
                onChange(null);
            }
        }
    };

    const getFileIcon = (url: string) => {
        const ext = url.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
            return <ImageIcon className="h-8 w-8 text-gray-400" />;
        }
        if (['mp4', 'webm', 'ogg', 'mov'].includes(ext || '')) {
            return <Film className="h-8 w-8 text-gray-400" />;
        }
        return <FileText className="h-8 w-8 text-gray-400" />;
    };

    const isImage = (url: string) => {
        const ext = url.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            {/* Upload area */}
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                    transition-colors duration-200
                    ${isDragging
                        ? 'border-[#c9a962] bg-[#c9a962]/5'
                        : 'border-gray-300 hover:border-gray-400'
                    }
                    ${error ? 'border-red-300' : ''}
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptString}
                    multiple={multiple}
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {isUploading ? (
                    <div className="space-y-2">
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#c9a962] transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <p className="text-sm text-gray-500">Uploading... {Math.round(uploadProgress)}%</p>
                    </div>
                ) : (
                    <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                            <span className="font-medium text-[#c9a962]">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                            {acceptString.includes('image') ? 'PNG, JPG, GIF, WebP' : 'Any file type'} up to {maxSizeMB}MB
                        </p>
                    </>
                )}
            </div>

            {/* Preview for file-based API */}
            {isFileBased && preview && (
                <div className="mt-4">
                    <div className="relative inline-block group rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-32 h-32 object-cover"
                        />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeFile(0);
                            }}
                            className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Preview for URL-based API */}
            {!isFileBased && values.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {values.map((url, index) => (
                        <div
                            key={index}
                            className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                        >
                            {isImage(url) ? (
                                <img
                                    src={url}
                                    alt=""
                                    className="w-full h-24 object-cover"
                                />
                            ) : (
                                <div className="w-full h-24 flex items-center justify-center">
                                    {getFileIcon(url)}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(index);
                                }}
                                className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {hint && !error && !uploadError && (
                <p className="text-xs text-gray-500">{hint}</p>
            )}
            {(error || uploadError) && (
                <p className="text-xs text-red-600">{error || uploadError}</p>
            )}
        </div>
    );
}

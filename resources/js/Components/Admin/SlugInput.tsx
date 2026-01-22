import { InputHTMLAttributes, forwardRef, useState, useEffect } from 'react';
import { RefreshCw, Check, AlertCircle, Link2 } from 'lucide-react';

interface SlugInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    label?: string;
    error?: string;
    hint?: string;
    sourceValue?: string; // The value to generate slug from (e.g., name or title)
    onChange?: (value: string) => void;
    value?: string;
    autoGenerate?: boolean; // Whether to auto-generate on source change
    separator?: '-' | '_'; // The separator to use (hyphen for URLs, underscore for code)
}

/**
 * Generates a URL-friendly slug from a string
 */
export function generateSlug(text: string, separator: '-' | '_' = '-'): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, separator) // Replace spaces with separator
        .replace(new RegExp(`${separator}+`, 'g'), separator) // Replace multiple separators with single
        .replace(new RegExp(`^${separator}|${separator}$`, 'g'), ''); // Remove leading/trailing separators
}

/**
 * Validates if a string is a valid slug
 */
export function isValidSlug(slug: string, separator: '-' | '_' = '-'): boolean {
    if (!slug) return false;
    // Valid slug: lowercase letters, numbers, and separator only
    const slugPattern = separator === '-' 
        ? /^[a-z0-9]+(?:-[a-z0-9]+)*$/
        : /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
    return slugPattern.test(slug);
}

const SlugInput = forwardRef<HTMLInputElement, SlugInputProps>(
    ({ 
        className = '', 
        label = 'Slug', 
        error, 
        hint, 
        id, 
        sourceValue = '',
        onChange,
        value = '',
        autoGenerate = false,
        separator = '-',
        ...props 
    }, ref) => {
        const inputId = id || props.name || 'slug';
        const [hasManualEdit, setHasManualEdit] = useState(false);
        const [isValid, setIsValid] = useState(true);

        // Auto-generate slug from source when source changes (if not manually edited)
        useEffect(() => {
            if (autoGenerate && !hasManualEdit && sourceValue) {
                const newSlug = generateSlug(sourceValue, separator);
                if (newSlug !== value) {
                    onChange?.(newSlug);
                }
            }
        }, [sourceValue, autoGenerate, hasManualEdit, separator]);

        // Validate slug on change
        useEffect(() => {
            if (value) {
                setIsValid(isValidSlug(value, separator));
            } else {
                setIsValid(true); // Empty is not invalid (just incomplete)
            }
        }, [value, separator]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setHasManualEdit(true);
            // Auto-format input to be slug-friendly based on separator
            const allowedChars = separator === '-' ? /[^a-z0-9-]/g : /[^a-z0-9_]/g;
            const formatted = e.target.value
                .toLowerCase()
                .replace(allowedChars, separator)
                .replace(new RegExp(`${separator}+`, 'g'), separator);
            onChange?.(formatted);
        };

        const handleRegenerate = () => {
            if (sourceValue) {
                const newSlug = generateSlug(sourceValue, separator);
                onChange?.(newSlug);
                setHasManualEdit(false);
            }
        };

        const showValidation = value.length > 0;
        const validationError = !isValid && showValidation;

        return (
            <div className="space-y-1">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-700"
                    >
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative flex gap-2">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Link2 className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            ref={ref}
                            id={inputId}
                            type="text"
                            value={value}
                            onChange={handleChange}
                            className={`
                                block w-full rounded-lg border pl-10 pr-10 py-2.5 text-sm
                                font-mono tracking-wide
                                transition-colors duration-200
                                focus:outline-none focus:ring-2 focus:ring-offset-0
                                disabled:bg-gray-100 disabled:cursor-not-allowed
                                ${error || validationError
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                    : isValid && showValidation
                                        ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                                        : 'border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]/20'
                                }
                                ${className}
                            `}
                            placeholder="url-friendly-slug"
                            {...props}
                        />
                        {showValidation && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                {isValid ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Regenerate button */}
                    <button
                        type="button"
                        onClick={handleRegenerate}
                        disabled={!sourceValue}
                        className={`
                            inline-flex items-center justify-center px-3 py-2 
                            rounded-lg border text-sm font-medium
                            transition-colors duration-200
                            ${sourceValue
                                ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-[#c9a962]'
                                : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            }
                        `}
                        title="Regenerate from title/name"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </div>
                
                {/* Hint and validation messages */}
                <div className="flex items-center justify-between">
                    <div>
                        {hint && !error && !validationError && (
                            <p className="text-xs text-gray-500">{hint}</p>
                        )}
                        {error && (
                            <p className="text-xs text-red-600">{error}</p>
                        )}
                        {validationError && !error && (
                            <p className="text-xs text-red-600">
                                {separator === '-' 
                                    ? 'Only lowercase letters, numbers, and hyphens allowed (e.g., "my-page-name")'
                                    : 'Only lowercase letters, numbers, and underscores allowed (e.g., "my_component_type")'
                                }
                            </p>
                        )}
                        {isValid && showValidation && !error && (
                            <p className="text-xs text-green-600">
                                Valid slug format ✓
                            </p>
                        )}
                    </div>
                    
                    {/* Preview */}
                    {value && isValid && separator === '-' && (
                        <p className="text-xs text-gray-400">
                            URL: /{value}
                        </p>
                    )}
                </div>
            </div>
        );
    }
);

SlugInput.displayName = 'SlugInput';

export { SlugInput };

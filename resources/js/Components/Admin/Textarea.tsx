import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className = '', label, error, hint, id, ...props }, ref) => {
        const textareaId = id || props.name;

        return (
            <div className="space-y-1">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="block text-sm font-medium text-gray-700"
                    >
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={`
                        block w-full rounded-lg border px-4 py-2.5 text-sm
                        transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-offset-0
                        disabled:bg-gray-100 disabled:cursor-not-allowed
                        resize-y min-h-[100px]
                        ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]/20'
                        }
                        ${className}
                    `}
                    {...props}
                />
                {hint && !error && (
                    <p className="text-xs text-gray-500">{hint}</p>
                )}
                {error && (
                    <p className="text-xs text-red-600">{error}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export { Textarea };

import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectOption {
    value: string | number;
    label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    hint?: string;
    options: SelectOption[];
    placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className = '', label, error, hint, options, placeholder, id, ...props }, ref) => {
        const selectId = id || props.name;

        return (
            <div className="space-y-1">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium text-gray-700"
                    >
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    className={`
                        block w-full rounded-lg border px-4 py-2.5 text-sm
                        transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-offset-0
                        disabled:bg-gray-100 disabled:cursor-not-allowed
                        ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-gray-300 focus:border-[#c9a962] focus:ring-[#c9a962]/20'
                        }
                        ${className}
                    `}
                    {...props}
                >
                    {placeholder && (
                        <option value="">{placeholder}</option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
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

Select.displayName = 'Select';

export { Select, type SelectOption };

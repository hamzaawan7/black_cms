import { forwardRef, InputHTMLAttributes } from 'react';

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
    label?: string;
    description?: string;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
    ({ className = '', label, description, checked, onChange, id, ...props }, ref) => {
        const switchId = id || props.name || 'switch';

        return (
            <div className={`flex items-start gap-3 ${className}`}>
                <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    onClick={() => onChange?.(!checked)}
                    className={`
                        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full 
                        border-2 border-transparent transition-colors duration-200 ease-in-out
                        focus:outline-none focus:ring-2 focus:ring-[#c9a962] focus:ring-offset-2
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${checked ? 'bg-[#c9a962]' : 'bg-gray-200'}
                    `}
                    disabled={props.disabled}
                >
                    <span
                        className={`
                            pointer-events-none inline-block h-5 w-5 transform rounded-full 
                            bg-white shadow ring-0 transition duration-200 ease-in-out
                            ${checked ? 'translate-x-5' : 'translate-x-0'}
                        `}
                    />
                </button>
                <input
                    ref={ref}
                    type="checkbox"
                    id={switchId}
                    checked={checked}
                    onChange={(e) => onChange?.(e.target.checked)}
                    className="sr-only"
                    {...props}
                />
                {(label || description) && (
                    <div className="flex flex-col">
                        {label && (
                            <label
                                htmlFor={switchId}
                                className="text-sm font-medium text-gray-900 cursor-pointer"
                            >
                                {label}
                            </label>
                        )}
                        {description && (
                            <span className="text-sm text-gray-500">{description}</span>
                        )}
                    </div>
                )}
            </div>
        );
    }
);

Switch.displayName = 'Switch';

export { Switch };

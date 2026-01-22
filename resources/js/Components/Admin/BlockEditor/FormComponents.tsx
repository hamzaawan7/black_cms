import React, { useRef } from 'react';
import {
    Upload,
    Plus,
    Trash2,
    ChevronUp,
    ChevronDown,
    AlignLeft,
    AlignCenter,
    AlignRight,
} from 'lucide-react';

// ============================================
// Shared Styles (CSS Classes)
// ============================================
export const styles = {
    label: "block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide",
    input: "w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]/20",
    inputSmall: "w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-[#c9a962] focus:outline-none",
    inputCompact: "w-full h-8 rounded border border-gray-200 px-2 text-sm focus:border-[#c9a962] focus:outline-none",
    inputXs: "w-full h-8 rounded border border-gray-200 px-2 text-xs focus:border-[#c9a962] focus:outline-none",
    textarea: "w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#c9a962] focus:outline-none focus:ring-1 focus:ring-[#c9a962]/20 resize-none",
    textareaSmall: "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#c9a962] focus:outline-none resize-none",
    textareaXs: "w-full rounded border border-gray-200 px-2 py-1.5 text-xs focus:border-[#c9a962] focus:outline-none resize-none",
    select: "w-full h-10 rounded-lg border border-gray-200 px-3 text-sm bg-white focus:border-[#c9a962] focus:outline-none",
    selectSmall: "w-full h-9 rounded-lg border border-gray-200 px-3 text-sm bg-white focus:border-[#c9a962] focus:outline-none",
    selectCompact: "h-8 rounded border border-gray-200 px-2 text-sm focus:border-[#c9a962] focus:outline-none appearance-none bg-white",
    checkbox: "rounded border-gray-300 text-[#c9a962] focus:ring-[#c9a962]",
    checkboxLabel: "flex items-center gap-2 text-xs text-gray-600",
    checkboxLabelLg: "flex items-center gap-3 text-sm text-gray-700 cursor-pointer",
    addButton: "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-[#c9a962] rounded hover:bg-[#b08d4a]",
    deleteButton: "p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded",
    moveButton: "p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded",
    moveButtonSm: "p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30",
    itemCard: "p-3 bg-gray-50 rounded-lg border border-gray-100",
    itemCardHeader: "flex items-center justify-between gap-2 mb-3 pb-2 border-b border-gray-200",
    sectionHeader: "space-y-4 p-4 bg-gradient-to-r rounded-xl border",
    sectionHeaderAmber: "from-amber-50 to-yellow-50 border-amber-100",
    sectionHeaderBlue: "from-blue-50 to-cyan-50 border-blue-100",
    sectionHeaderGreen: "from-green-50 to-emerald-50 border-green-100",
    sectionHeaderPurple: "from-purple-50 to-violet-50 border-purple-100",
    sectionHeaderOrange: "from-amber-50 to-orange-50 border-amber-100",
};

// ============================================
// Field Label Component
// ============================================
interface FieldLabelProps {
    children: React.ReactNode;
    className?: string;
}

export function FieldLabel({ children, className = '' }: FieldLabelProps) {
    return (
        <label className={`${styles.label} ${className}`}>
            {children}
        </label>
    );
}

// ============================================
// Text Input Component
// ============================================
interface TextInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    size?: 'default' | 'small' | 'compact' | 'xs';
    className?: string;
    type?: 'text' | 'email' | 'url' | 'number';
}

export function TextInput({ 
    value, 
    onChange, 
    placeholder, 
    size = 'default',
    className = '',
    type = 'text'
}: TextInputProps) {
    const sizeStyles = {
        default: styles.input,
        small: styles.inputSmall,
        compact: styles.inputCompact,
        xs: styles.inputXs,
    };
    
    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${sizeStyles[size]} ${className}`}
            placeholder={placeholder}
        />
    );
}

// ============================================
// Textarea Component
// ============================================
interface TextareaProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    size?: 'default' | 'small' | 'xs';
    className?: string;
}

export function Textarea({ 
    value, 
    onChange, 
    placeholder, 
    rows = 3,
    size = 'default',
    className = ''
}: TextareaProps) {
    const sizeStyles = {
        default: styles.textarea,
        small: styles.textareaSmall,
        xs: styles.textareaXs,
    };
    
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            className={`${sizeStyles[size]} ${className}`}
            placeholder={placeholder}
        />
    );
}

// ============================================
// Select Component
// ============================================
interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    size?: 'default' | 'small' | 'compact';
    className?: string;
}

export function Select({ 
    value, 
    onChange, 
    options,
    size = 'default',
    className = ''
}: SelectProps) {
    const sizeStyles = {
        default: styles.select,
        small: styles.selectSmall,
        compact: styles.selectCompact,
    };
    
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${sizeStyles[size]} ${className}`}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    );
}

// ============================================
// Checkbox Component
// ============================================
interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    size?: 'default' | 'large';
}

export function Checkbox({ 
    checked, 
    onChange, 
    label,
    size = 'default'
}: CheckboxProps) {
    return (
        <label className={size === 'large' ? styles.checkboxLabelLg : styles.checkboxLabel}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className={`${styles.checkbox} ${size === 'large' ? 'w-4 h-4' : ''}`}
            />
            {label}
        </label>
    );
}

// ============================================
// Alignment Selector Component
// ============================================
interface AlignmentSelectorProps {
    value: 'left' | 'center' | 'right';
    onChange: (value: 'left' | 'center' | 'right') => void;
}

export function AlignmentSelector({ value, onChange }: AlignmentSelectorProps) {
    return (
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            {(['left', 'center', 'right'] as const).map((align) => (
                <button
                    key={align}
                    type="button"
                    onClick={() => onChange(align)}
                    className={`flex-1 p-2 rounded-md transition-colors ${
                        value === align ? 'bg-white shadow text-[#c9a962]' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    {align === 'left' && <AlignLeft className="h-4 w-4 mx-auto" />}
                    {align === 'center' && <AlignCenter className="h-4 w-4 mx-auto" />}
                    {align === 'right' && <AlignRight className="h-4 w-4 mx-auto" />}
                </button>
            ))}
        </div>
    );
}

// ============================================
// Add Item Button Component
// ============================================
interface AddItemButtonProps {
    onClick: () => void;
    label: string;
}

export function AddItemButton({ onClick, label }: AddItemButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={styles.addButton}
        >
            <Plus className="h-3 w-3" />
            {label}
        </button>
    );
}

// ============================================
// Delete Button Component
// ============================================
interface DeleteButtonProps {
    onClick: () => void;
    title?: string;
    size?: 'default' | 'small';
}

export function DeleteButton({ onClick, title = 'Remove', size = 'default' }: DeleteButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={styles.deleteButton}
            title={title}
        >
            <Trash2 className={size === 'small' ? 'h-3 w-3' : 'h-4 w-4'} />
        </button>
    );
}

// ============================================
// Move Buttons Component (Up/Down)
// ============================================
interface MoveButtonsProps {
    index: number;
    total: number;
    onMoveUp: () => void;
    onMoveDown: () => void;
    size?: 'default' | 'small';
    direction?: 'horizontal' | 'vertical';
}

export function MoveButtons({ 
    index, 
    total, 
    onMoveUp, 
    onMoveDown, 
    size = 'default',
    direction = 'vertical'
}: MoveButtonsProps) {
    const buttonClass = size === 'small' ? styles.moveButtonSm : styles.moveButton;
    const iconClass = size === 'small' ? 'h-3 w-3' : 'h-3 w-3';
    const containerClass = direction === 'vertical' ? 'flex flex-col gap-1' : 'flex gap-1';
    
    return (
        <div className={containerClass}>
            {index > 0 && (
                <button
                    type="button"
                    onClick={onMoveUp}
                    className={buttonClass}
                    title="Move up"
                >
                    <ChevronUp className={iconClass} />
                </button>
            )}
            {index < total - 1 && (
                <button
                    type="button"
                    onClick={onMoveDown}
                    className={buttonClass}
                    title="Move down"
                >
                    <ChevronDown className={iconClass} />
                </button>
            )}
        </div>
    );
}

// ============================================
// List Item Controls (Move + Delete)
// ============================================
interface ListItemControlsProps {
    index: number;
    total: number;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onDelete: () => void;
    layout?: 'header' | 'sidebar';
}

export function ListItemControls({
    index,
    total,
    onMoveUp,
    onMoveDown,
    onDelete,
    layout = 'header'
}: ListItemControlsProps) {
    if (layout === 'sidebar') {
        return (
            <div className="flex flex-col gap-1 mt-1">
                <button
                    type="button"
                    onClick={onMoveUp}
                    disabled={index === 0}
                    className={styles.moveButtonSm}
                >
                    <ChevronUp className="h-3 w-3" />
                </button>
                <button
                    type="button"
                    onClick={onMoveDown}
                    disabled={index >= total - 1}
                    className={styles.moveButtonSm}
                >
                    <ChevronDown className="h-3 w-3" />
                </button>
            </div>
        );
    }
    
    return (
        <div className="flex items-center gap-1">
            {index > 0 && (
                <button type="button" onClick={onMoveUp} className={styles.moveButton} title="Move up">
                    <ChevronUp className="h-3 w-3" />
                </button>
            )}
            {index < total - 1 && (
                <button type="button" onClick={onMoveDown} className={styles.moveButton} title="Move down">
                    <ChevronDown className="h-3 w-3" />
                </button>
            )}
            <button type="button" onClick={onDelete} className={styles.deleteButton} title="Remove">
                <Trash2 className="h-3 w-3" />
            </button>
        </div>
    );
}

// ============================================
// Section Header Component
// ============================================
interface SectionHeaderProps {
    preTitle?: string;
    preTitlePlaceholder?: string;
    title?: string;
    titlePlaceholder?: string;
    description?: string;
    descriptionPlaceholder?: string;
    onPreTitleChange?: (value: string) => void;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    variant?: 'amber' | 'blue' | 'green' | 'purple' | 'orange';
    headerTitle?: string;
    showDescription?: boolean;
}

export function SectionHeaderFields({
    preTitle = '',
    preTitlePlaceholder = 'PRE-TITLE',
    title = '',
    titlePlaceholder = 'Section Title',
    description = '',
    descriptionPlaceholder = 'Description...',
    onPreTitleChange,
    onTitleChange,
    onDescriptionChange,
    variant = 'amber',
    headerTitle = 'Section Header',
    showDescription = true,
}: SectionHeaderProps) {
    const variantStyles = {
        amber: 'from-amber-50 to-yellow-50 border-amber-100',
        blue: 'from-blue-50 to-cyan-50 border-blue-100',
        green: 'from-green-50 to-emerald-50 border-green-100',
        purple: 'from-purple-50 to-violet-50 border-purple-100',
        orange: 'from-amber-50 to-orange-50 border-amber-100',
    };
    
    const headerColors = {
        amber: 'text-amber-800',
        blue: 'text-blue-800',
        green: 'text-green-800',
        purple: 'text-purple-800',
        orange: 'text-amber-800',
    };
    
    return (
        <div className={`space-y-4 p-4 bg-gradient-to-r rounded-xl border ${variantStyles[variant]}`}>
            <h4 className={`text-sm font-semibold ${headerColors[variant]}`}>{headerTitle}</h4>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <FieldLabel>Pre-Title</FieldLabel>
                    <TextInput
                        value={preTitle}
                        onChange={onPreTitleChange || (() => {})}
                        placeholder={preTitlePlaceholder}
                        size="small"
                    />
                </div>
                <div>
                    <FieldLabel>Title</FieldLabel>
                    <TextInput
                        value={title}
                        onChange={onTitleChange || (() => {})}
                        placeholder={titlePlaceholder}
                        size="small"
                    />
                </div>
            </div>
            {showDescription && (
                <div>
                    <FieldLabel>Description</FieldLabel>
                    <Textarea
                        value={description}
                        onChange={onDescriptionChange || (() => {})}
                        placeholder={descriptionPlaceholder}
                        size="small"
                        rows={2}
                    />
                </div>
            )}
        </div>
    );
}

// ============================================
// Image Upload Box Component
// ============================================
interface ImageUploadBoxProps {
    src?: string;
    alt?: string;
    onUpload: () => void;
    onRemove?: () => void;
    size?: 'small' | 'medium' | 'large';
    shape?: 'square' | 'rounded' | 'circle';
    className?: string;
}

export function ImageUploadBox({
    src,
    alt = '',
    onUpload,
    onRemove,
    size = 'medium',
    shape = 'rounded',
    className = '',
}: ImageUploadBoxProps) {
    const sizeClasses = {
        small: 'w-16 h-16',
        medium: 'w-20 h-20',
        large: 'w-full h-48',
    };
    
    const shapeClasses = {
        square: 'rounded-lg',
        rounded: 'rounded-lg',
        circle: 'rounded-full',
    };
    
    const resolvedSrc = src ? (src.startsWith('/') ? src : `/${src}`) : '';
    
    if (src) {
        return (
            <div className={`relative ${sizeClasses[size]} ${shapeClasses[shape]} overflow-hidden group border border-gray-200 ${className}`}>
                <img
                    src={resolvedSrc}
                    alt={alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.currentTarget.src = '/images/placeholder.png';
                    }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={onUpload}
                        className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                        <Upload className="h-4 w-4" />
                    </button>
                    {onRemove && (
                        <button
                            type="button"
                            onClick={onRemove}
                            className="p-2 bg-white rounded-lg text-red-500 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        );
    }
    
    return (
        <button
            type="button"
            onClick={onUpload}
            className={`${sizeClasses[size]} ${shapeClasses[shape]} border-2 border-dashed border-gray-200 bg-gray-50 hover:border-[#c9a962] hover:bg-[#c9a962]/5 transition-colors flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[#c9a962] ${className}`}
        >
            <Upload className={size === 'large' ? 'h-8 w-8' : 'h-5 w-5'} />
            {size === 'large' && <span className="text-sm">Click to upload image</span>}
        </button>
    );
}

// ============================================
// List Header Component
// ============================================
interface ListHeaderProps {
    label: string;
    count: number;
    onAdd: () => void;
    addLabel: string;
}

export function ListHeader({ label, count, onAdd, addLabel }: ListHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <label className={styles.label}>
                {label} ({count})
            </label>
            <AddItemButton onClick={onAdd} label={addLabel} />
        </div>
    );
}

// ============================================
// Icon Selector Component
// ============================================
interface IconSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

export const iconOptions = [
    { value: 'target', label: '🎯 Target' },
    { value: 'zap', label: '⚡ Zap' },
    { value: 'shield-check', label: '🛡️ Shield Check' },
    { value: 'diamond', label: '💎 Diamond' },
    { value: 'star', label: '⭐ Star' },
    { value: 'heart', label: '❤️ Heart' },
    { value: 'award', label: '🏆 Award' },
    { value: 'users', label: '👥 Users' },
    { value: 'clock', label: '⏰ Clock' },
    { value: 'check-circle', label: '✅ Check Circle' },
    { value: 'thumbs-up', label: '👍 Thumbs Up' },
    { value: 'trending-up', label: '📈 Trending Up' },
    { value: 'gift', label: '🎁 Gift' },
    { value: 'sparkles', label: '✨ Sparkles' },
    { value: 'lightbulb', label: '💡 Lightbulb' },
    { value: 'rocket', label: '🚀 Rocket' },
    { value: 'globe', label: '🌍 Globe' },
    { value: 'lock', label: '🔒 Lock' },
    { value: 'medal', label: '🏅 Medal' },
    { value: 'crown', label: '👑 Crown' },
];

export function IconSelector({ value, onChange }: IconSelectorProps) {
    return (
        <Select
            value={value}
            onChange={onChange}
            options={iconOptions}
            size="compact"
        />
    );
}

// ============================================
// Star Rating Component
// ============================================
interface StarRatingProps {
    value: number;
    onChange: (value: number) => void;
    max?: number;
}

export function StarRating({ value, onChange, max = 5 }: StarRatingProps) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Rating:</span>
            <div className="flex gap-1">
                {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className={`text-lg ${star <= value ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                        ★
                    </button>
                ))}
            </div>
        </div>
    );
}

// ============================================
// Form Field Group Component
// ============================================
interface FormFieldProps {
    label: string;
    children: React.ReactNode;
    className?: string;
}

export function FormField({ label, children, className = '' }: FormFieldProps) {
    return (
        <div className={className}>
            <FieldLabel>{label}</FieldLabel>
            {children}
        </div>
    );
}

// ============================================
// Toggle Options Row Component
// ============================================
interface ToggleOption {
    key: string;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

interface ToggleOptionsRowProps {
    options: ToggleOption[];
    columns?: 2 | 3 | 4;
}

export function ToggleOptionsRow({ options, columns = 2 }: ToggleOptionsRowProps) {
    return (
        <div className={`grid grid-cols-${columns} gap-3 pt-2 border-t border-gray-100`}>
            {options.map((opt) => (
                <Checkbox
                    key={opt.key}
                    checked={opt.checked}
                    onChange={opt.onChange}
                    label={opt.label}
                />
            ))}
        </div>
    );
}

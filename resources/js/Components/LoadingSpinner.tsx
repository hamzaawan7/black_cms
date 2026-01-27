import { Loader2 } from 'lucide-react';
import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    text?: string;
    fullScreen?: boolean;
    overlay?: boolean;
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    className = '',
    text,
    fullScreen = false,
    overlay = false,
}) => {
    const spinner = (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <Loader2 className={`animate-spin text-amber-600 ${sizeClasses[size]}`} />
            {text && <p className="text-sm text-gray-600 animate-pulse">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
                {spinner}
            </div>
        );
    }

    if (overlay) {
        return (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                {spinner}
            </div>
        );
    }

    return spinner;
};

// Button with loading state
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    loadingText?: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
    loading = false,
    loadingText,
    children,
    disabled,
    variant = 'primary',
    className = '',
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
        primary: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
        secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        ghost: 'text-gray-600 hover:bg-gray-100',
    };

    return (
        <button
            {...props}
            disabled={disabled || loading}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading && loadingText ? loadingText : children}
        </button>
    );
};

// Page loading overlay for Inertia navigations
export const PageLoadingOverlay: React.FC<{ show: boolean }> = ({ show }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm transition-opacity duration-300">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-amber-200"></div>
                    <div className="absolute top-0 h-16 w-16 rounded-full border-4 border-amber-600 border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-600 font-medium animate-pulse">Loading...</p>
            </div>
        </div>
    );
};

// Skeleton loader for content
interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'text',
    width,
    height,
}) => {
    const baseClasses = 'animate-pulse bg-gray-200';
    
    const variantClasses = {
        text: 'rounded h-4',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    const style: React.CSSProperties = {
        width: width || (variant === 'circular' ? '40px' : '100%'),
        height: height || (variant === 'circular' ? '40px' : variant === 'text' ? '1rem' : '100px'),
    };

    return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} style={style} />;
};

// Card skeleton for loading states
export const CardSkeleton: React.FC = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <Skeleton variant="text" height={24} width="60%" />
        <Skeleton variant="text" height={16} width="80%" />
        <Skeleton variant="text" height={16} width="40%" />
        <div className="flex gap-2 pt-2">
            <Skeleton variant="rectangular" width={80} height={32} />
            <Skeleton variant="rectangular" width={80} height={32} />
        </div>
    </div>
);

// Table skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
    rows = 5, 
    columns = 4 
}) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 p-4 border-b">
            <div className="flex gap-4">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} variant="text" height={16} width={`${100 / columns}%`} />
                ))}
            </div>
        </div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="p-4 border-b last:border-b-0">
                <div className="flex gap-4">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton key={colIndex} variant="text" height={16} width={`${100 / columns}%`} />
                    ))}
                </div>
            </div>
        ))}
    </div>
);

export default LoadingSpinner;

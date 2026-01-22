import { ReactNode, forwardRef } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
}

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

interface CardTitleProps {
    children: ReactNode;
    className?: string;
}

interface CardDescriptionProps {
    children: ReactNode;
    className?: string;
}

interface CardContentProps {
    children: ReactNode;
    className?: string;
}

interface CardFooterProps {
    children: ReactNode;
    className?: string;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className = '', children }, ref) => (
        <div
            ref={ref}
            className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
        >
            {children}
        </div>
    )
);
Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ className = '', children }, ref) => (
        <div
            ref={ref}
            className={`flex flex-col space-y-1.5 p-6 ${className}`}
        >
            {children}
        </div>
    )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLParagraphElement, CardTitleProps>(
    ({ className = '', children }, ref) => (
        <h3
            ref={ref}
            className={`text-lg font-semibold leading-none tracking-tight text-gray-900 ${className}`}
        >
            {children}
        </h3>
    )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
    ({ className = '', children }, ref) => (
        <p
            ref={ref}
            className={`text-sm text-gray-500 ${className}`}
        >
            {children}
        </p>
    )
);
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
    ({ className = '', children }, ref) => (
        <div ref={ref} className={`p-6 pt-0 ${className}`}>
            {children}
        </div>
    )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
    ({ className = '', children }, ref) => (
        <div
            ref={ref}
            className={`flex items-center p-6 pt-0 ${className}`}
        >
            {children}
        </div>
    )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };

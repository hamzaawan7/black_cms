import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { router } from '@inertiajs/react';
import { PageLoadingOverlay } from '@/Components/LoadingSpinner';

interface LoadingContextType {
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
    loadingMessage: string;
    setLoadingMessage: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};

interface LoadingProviderProps {
    children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Loading...');

    useEffect(() => {
        // Listen to Inertia navigation events
        const startHandler = () => {
            setIsLoading(true);
            setLoadingMessage('Loading...');
        };
        
        const finishHandler = () => {
            setIsLoading(false);
        };

        // Subscribe to Inertia events
        router.on('start', startHandler);
        router.on('finish', finishHandler);

        return () => {
            // Cleanup - Inertia v1 uses different cleanup
        };
    }, []);

    const setLoading = (loading: boolean) => {
        setIsLoading(loading);
    };

    return (
        <LoadingContext.Provider value={{ isLoading, setLoading, loadingMessage, setLoadingMessage }}>
            {children}
            <PageLoadingOverlay show={isLoading} />
        </LoadingContext.Provider>
    );
};

export default LoadingProvider;

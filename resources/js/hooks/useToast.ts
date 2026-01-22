import toast, { ToastOptions } from 'react-hot-toast';

const defaultOptions: ToastOptions = {
    duration: 4000,
    position: 'top-right',
};

const successStyle = {
    style: {
        background: '#10B981',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
    },
    iconTheme: {
        primary: '#fff',
        secondary: '#10B981',
    },
};

const errorStyle = {
    style: {
        background: '#EF4444',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
    },
    iconTheme: {
        primary: '#fff',
        secondary: '#EF4444',
    },
};

const warningStyle = {
    style: {
        background: '#F59E0B',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
    },
};

const infoStyle = {
    style: {
        background: '#3B82F6',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
    },
};

export const useToast = () => {
    const success = (message: string, options?: ToastOptions) => {
        toast.success(message, { ...defaultOptions, ...successStyle, ...options });
    };

    const error = (message: string, options?: ToastOptions) => {
        toast.error(message, { ...defaultOptions, ...errorStyle, ...options });
    };

    const warning = (message: string, options?: ToastOptions) => {
        toast(message, { ...defaultOptions, ...warningStyle, icon: '⚠️', ...options });
    };

    const info = (message: string, options?: ToastOptions) => {
        toast(message, { ...defaultOptions, ...infoStyle, icon: 'ℹ️', ...options });
    };

    const loading = (message: string) => {
        return toast.loading(message, {
            ...defaultOptions,
            style: {
                padding: '16px',
                borderRadius: '8px',
            },
        });
    };

    const dismiss = (toastId?: string) => {
        if (toastId) {
            toast.dismiss(toastId);
        } else {
            toast.dismiss();
        }
    };

    return { success, error, warning, info, loading, dismiss };
};

export default useToast;

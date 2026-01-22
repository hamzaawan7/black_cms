import Swal, { SweetAlertResult } from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// Create React-enhanced SweetAlert instance
const MySwal = withReactContent(Swal);

interface ConfirmOptions {
    title?: string;
    text?: string;
    icon?: 'warning' | 'error' | 'success' | 'info' | 'question';
    confirmButtonText?: string;
    cancelButtonText?: string;
    showCancelButton?: boolean;
}

export const useSweetAlert = () => {
    // Delete confirmation with blue/red buttons
    const confirmDelete = (
        itemName?: string,
        customOptions?: ConfirmOptions
    ): Promise<SweetAlertResult> => {
        return MySwal.fire({
            title: 'Are you sure?',
            text: itemName 
                ? `You won't be able to revert this! "${itemName}" will be permanently deleted.`
                : "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            ...customOptions,
        });
    };

    // Show deleted success popup
    const showDeletedSuccess = (itemName?: string) => {
        return MySwal.fire({
            title: 'Deleted!',
            text: itemName ? `"${itemName}" has been deleted.` : 'Your item has been deleted.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
        });
    };

    // Success notification (top-end toast)
    const successNotification = (title: string = 'Success!') => {
        return MySwal.fire({
            position: 'top-end',
            icon: 'success',
            title: title,
            showConfirmButton: false,
            timer: 1500,
            toast: true,
        });
    };

    // Error notification
    const errorNotification = (text: string = 'Something went wrong!', title: string = 'Oops...') => {
        return MySwal.fire({
            icon: 'error',
            title: title,
            text: text,
        });
    };

    // General confirmation
    const confirm = (options: ConfirmOptions): Promise<SweetAlertResult> => {
        return MySwal.fire({
            title: options.title || 'Are you sure?',
            text: options.text || '',
            icon: options.icon || 'question',
            showCancelButton: options.showCancelButton !== false,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: options.confirmButtonText || 'Confirm',
            cancelButtonText: options.cancelButtonText || 'Cancel',
        });
    };

    // Toast notification
    const toast = (message: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') => {
        return MySwal.fire({
            position: 'top-end',
            icon: icon,
            title: message,
            showConfirmButton: false,
            timer: 1500,
            toast: true,
        });
    };

    // Success alert
    const success = (title: string, text?: string): Promise<SweetAlertResult> => {
        return MySwal.fire({
            title,
            text,
            icon: 'success',
        });
    };

    // Error alert
    const error = (title: string, text?: string): Promise<SweetAlertResult> => {
        return MySwal.fire({
            icon: 'error',
            title,
            text,
        });
    };

    // Warning alert
    const warning = (title: string, text?: string): Promise<SweetAlertResult> => {
        return MySwal.fire({
            icon: 'warning',
            title,
            text,
        });
    };

    // Info alert
    const info = (title: string, text?: string): Promise<SweetAlertResult> => {
        return MySwal.fire({
            icon: 'info',
            title,
            text,
        });
    };

    // Loading popup
    const loading = (title: string = 'Processing...', text?: string) => {
        return MySwal.fire({
            title,
            text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                MySwal.showLoading();
            },
        });
    };

    // Close any open Swal
    const close = () => {
        MySwal.close();
    };

    return {
        confirmDelete,
        showDeletedSuccess,
        successNotification,
        errorNotification,
        confirm,
        success,
        error,
        warning,
        info,
        toast,
        loading,
        close,
        Swal: MySwal,
    };
};

export default useSweetAlert;

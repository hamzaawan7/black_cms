import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useSweetAlert } from '@/hooks/useSweetAlert';

interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export default function FlashMessages() {
    const { flash } = usePage().props as { flash?: FlashMessages };
    const { successNotification, errorNotification, warning, info } = useSweetAlert();

    useEffect(() => {
        if (flash?.success) {
            successNotification(flash.success);
        }
        if (flash?.error) {
            errorNotification(flash.error);
        }
        if (flash?.warning) {
            warning('Warning', flash.warning);
        }
        if (flash?.info) {
            info('Info', flash.info);
        }
    }, [flash]);

    return null;
}

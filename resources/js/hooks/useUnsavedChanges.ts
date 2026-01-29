import { useEffect, useCallback, useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';

/**
 * Hook to warn users about unsaved changes before leaving the page
 * 
 * Usage:
 * const { setHasChanges, hasChanges } = useUnsavedChanges();
 * 
 * // In your form onChange:
 * onChange={(e) => {
 *   setData('name', e.target.value);
 *   setHasChanges(true);
 * }}
 * 
 * // Before submitting form:
 * markAsSaved(); // Call BEFORE router.put/post
 */
export function useUnsavedChanges(initialState = false) {
    const [hasChanges, setHasChanges] = useState(initialState);
    const hasChangesRef = useRef(initialState); // Sync ref for immediate checks
    const isNavigatingRef = useRef(false);

    // Keep ref in sync with state
    useEffect(() => {
        hasChangesRef.current = hasChanges;
    }, [hasChanges]);

    // Handle browser/tab close
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasChangesRef.current) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    // Handle Inertia navigation with SweetAlert
    useEffect(() => {
        const removeListener = router.on('before', (event) => {
            // Use ref for immediate check (not stale state)
            if (hasChangesRef.current && !isNavigatingRef.current) {
                event.preventDefault();
                
                Swal.fire({
                    title: 'Unsaved Changes',
                    text: 'You have unsaved changes. Are you sure you want to leave?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#c9a962',
                    cancelButtonColor: '#6b7280',
                    confirmButtonText: 'Yes, leave page',
                    cancelButtonText: 'Stay on page',
                }).then((result) => {
                    if (result.isConfirmed) {
                        isNavigatingRef.current = true;
                        hasChangesRef.current = false;
                        setHasChanges(false);
                        // Re-trigger the navigation
                        if (event.detail?.visit) {
                            router.visit(event.detail.visit.url, event.detail.visit);
                        }
                    }
                });
            }
        });

        return () => removeListener();
    }, []);

    const markAsChanged = useCallback(() => {
        hasChangesRef.current = true;
        setHasChanges(true);
    }, []);
    
    const markAsSaved = useCallback(() => {
        hasChangesRef.current = false; // Immediate sync update
        setHasChanges(false);
    }, []);

    // Wrapper to update ref immediately when setting hasChanges
    const setHasChangesWithRef = useCallback((value: boolean) => {
        hasChangesRef.current = value;
        setHasChanges(value);
    }, []);

    return {
        hasChanges,
        setHasChanges: setHasChangesWithRef,
        markAsChanged,
        markAsSaved,
    };
}

/**
 * Hook to track form changes automatically
 * 
 * Usage:
 * const { trackChange, resetTracking, hasChanges } = useFormChangeTracker(initialData);
 * 
 * // In your form:
 * onChange={(e) => {
 *   setData('name', e.target.value);
 *   trackChange('name', e.target.value);
 * }}
 */
export function useFormChangeTracker<T extends Record<string, any>>(initialData: T) {
    const [originalData] = useState<T>(JSON.parse(JSON.stringify(initialData)));
    const [currentData, setCurrentData] = useState<T>(JSON.parse(JSON.stringify(initialData)));
    const [hasChanges, setHasChanges] = useState(false);

    const trackChange = useCallback((field: keyof T, value: any) => {
        setCurrentData(prev => {
            const updated = { ...prev, [field]: value };
            // Deep comparison would be better for complex objects
            const changed = JSON.stringify(updated) !== JSON.stringify(originalData);
            setHasChanges(changed);
            return updated;
        });
    }, [originalData]);

    const resetTracking = useCallback(() => {
        setCurrentData(JSON.parse(JSON.stringify(originalData)));
        setHasChanges(false);
    }, [originalData]);

    // Handle browser/tab close
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasChanges) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasChanges]);

    // Handle Inertia navigation with SweetAlert
    useEffect(() => {
        const removeListener = router.on('before', (event) => {
            if (hasChanges) {
                event.preventDefault();
                
                Swal.fire({
                    title: 'Unsaved Changes',
                    text: 'You have unsaved changes. Are you sure you want to leave?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#c9a962',
                    cancelButtonColor: '#6b7280',
                    confirmButtonText: 'Yes, leave page',
                    cancelButtonText: 'Stay on page',
                }).then((result) => {
                    if (result.isConfirmed) {
                        setHasChanges(false);
                        if (event.detail?.visit) {
                            router.visit(event.detail.visit.url, event.detail.visit);
                        }
                    }
                });
            }
        });

        return () => removeListener();
    }, [hasChanges]);

    return {
        trackChange,
        resetTracking,
        hasChanges,
        setHasChanges,
    };
}

export default useUnsavedChanges;

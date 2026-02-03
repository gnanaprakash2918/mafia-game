import { useEffect, useRef, useState } from 'react';

export const useWakeLock = () => {
    const wakeLockRef = useRef(null);
    const [isLocked, setIsLocked] = useState(false);

    const requestWakeLock = async () => {
        if ('wakeLock' in navigator) {
            try {
                const lock = await navigator.wakeLock.request('screen');
                wakeLockRef.current = lock;
                setIsLocked(true);

                lock.addEventListener('release', () => {
                    setIsLocked(false);
                    wakeLockRef.current = null;
                });
            } catch (err) {
                console.warn(`Wake Lock failed: ${err.name}, ${err.message}`);
                setIsLocked(false);
            }
        }
    };

    const releaseWakeLock = async () => {
        if (wakeLockRef.current) {
            try {
                await wakeLockRef.current.release();
                wakeLockRef.current = null;
                setIsLocked(false);
            } catch (err) {
                console.error(err);
            }
        }
    };

    useEffect(() => {
        // Request lock on mount
        requestWakeLock();

        // Re-request lock if visibility changes (e.g., user switches tabs and comes back)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            releaseWakeLock();
        };
    }, []);

    return { isLocked, requestWakeLock, releaseWakeLock };
};

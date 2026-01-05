import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (initialSeconds, unlimited = false, onComplete) => {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);

    const start = useCallback(() => {
        if (unlimited) {
            setIsRunning(true);
            return;
        }
        setIsRunning(true);
    }, [unlimited]);

    const pause = useCallback(() => {
        setIsRunning(false);
    }, []);

    const reset = useCallback((newSeconds) => {
        setIsRunning(false);
        setTimeLeft(newSeconds);
    }, []);

    useEffect(() => {
        if (isRunning && !unlimited && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current);
                        setIsRunning(false);
                        if (onComplete) onComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(intervalRef.current);
    }, [isRunning, unlimited, timeLeft, onComplete]);

    // Format time as MM:SS
    const formattedTime = unlimited
        ? "∞"
        : `${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;

    return { timeLeft, isRunning, start, pause, reset, formattedTime };
};

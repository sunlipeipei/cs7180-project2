import { useState, useEffect, useRef, useCallback } from 'react';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface TimerSettings {
    workMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    accThreshold: number;
}

export function useTimer(settings: TimerSettings, accMinutes: number, onSessionEnd: (mode: TimerMode) => void) {
    const [mode, setMode] = useState<TimerMode>('focus');
    const [running, setRunning] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const endTimeRef = useRef<number | null>(null);

    const getTotalSeconds = useCallback(() => {
        if (mode === 'focus') {
            return settings.workMinutes * 60;
        } else if (mode === 'longBreak') {
            return settings.longBreakMinutes * 60;
        } else {
            return settings.shortBreakMinutes * 60;
        }
    }, [mode, settings]);

    const totalSeconds = getTotalSeconds();
    const currentSeconds = secondsLeft ?? totalSeconds;
    const progress = 1 - currentSeconds / Math.max(totalSeconds, 1);

    const handleSessionEnd = useCallback(() => {
        setRunning(false);
        setSecondsLeft(null);
        endTimeRef.current = null;
        onSessionEnd(mode);
    }, [mode, onSessionEnd]);

    useEffect(() => {
        if (!running || !endTimeRef.current) {
            return;
        }

        const intervalId = setInterval(() => {
            const now = Date.now();
            const next = Math.max(0, Math.ceil((endTimeRef.current! - now) / 1000));
            
            if (next <= 0) {
                setSecondsLeft(0);
                handleSessionEnd();
            } else {
                setSecondsLeft(next);
            }
        }, 100);

        return () => {
            clearInterval(intervalId);
        };
    }, [running, handleSessionEnd]); 
    // currentSeconds is used for initial endTimeRef calculation if needed.
    // Note: If we use 100ms interval, re-running effect might be okay, 
    // but ideally we only want to start the interval when running changes.
    // If currentSeconds changes while running, we don't necessarily want to reset the interval.

    // Let's refine the effect to avoid unnecessary restarts.
    
    /* 
    Revised effect logic:
    useEffect(() => {
        if (!running) { ... }
        if (!endTimeRef.current) { endTimeRef.current = Date.now() + (secondsLeft ?? totalSeconds) * 1000; }
        const id = setInterval(() => { ... }, 100);
        return () => clearInterval(id);
    }, [running]); // Only depend on running
    */

    const toggleTimer = () => {
        if (secondsLeft === 0) {
            setSecondsLeft(null);
            endTimeRef.current = Date.now() + totalSeconds * 1000;
            setRunning(true);
            return;
        }
        
        setRunning((r) => {
            const next = !r;
            if (next) {
                endTimeRef.current = Date.now() + currentSeconds * 1000;
            } else {
                endTimeRef.current = null;
            }
            return next;
        });
    };

    const resetTimer = () => {
        setRunning(false);
        setSecondsLeft(null);
        endTimeRef.current = null;
    };

    const switchMode = (newMode: TimerMode) => {
        setRunning(false);
        setMode(newMode);
        setSecondsLeft(null);
        endTimeRef.current = null;
    };

    const toggleFocusBreak = () => {
        if (mode === 'focus') {
            if (accMinutes >= settings.accThreshold) {
                switchMode('longBreak');
            } else {
                switchMode('shortBreak');
            }
        } else {
            switchMode('focus');
        }
    };

    return {
        mode,
        running,
        secondsLeft: currentSeconds,
        totalSeconds,
        progress,
        toggleTimer,
        resetTimer,
        switchMode,
        toggleFocusBreak
    };
}

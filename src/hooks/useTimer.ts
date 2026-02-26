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
        onSessionEnd(mode);
    }, [mode, onSessionEnd]);

    useEffect(() => {
        if (!running) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            return;
        }

        intervalRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
                const next = (prev ?? totalSeconds) - 1;
                if (next <= 0) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    handleSessionEnd();
                    return 0;
                }
                return next;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [running, totalSeconds, handleSessionEnd]);

    const toggleTimer = () => {
        if (secondsLeft === 0) {
            setSecondsLeft(null);
            setRunning(true);
            return;
        }
        setRunning((r) => !r);
    };

    const resetTimer = () => {
        setRunning(false);
        setSecondsLeft(null);
    };

    const switchMode = (newMode: TimerMode) => {
        setRunning(false);
        setMode(newMode);
        setSecondsLeft(null);
    };

    const toggleFocusBreak = () => {
        if (mode === 'focus') {
            // Determine which break to take
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

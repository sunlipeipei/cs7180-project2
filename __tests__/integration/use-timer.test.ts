import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from '@/hooks/useTimer';

const defaultSettings = {
    workMinutes: 45,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    accThreshold: 100,
};

describe('useTimer', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('initialises with focus mode, not running, correct totalSeconds', () => {
        const { result } = renderHook(() =>
            useTimer(defaultSettings, 0, vi.fn())
        );
        expect(result.current.mode).toBe('focus');
        expect(result.current.running).toBe(false);
        expect(result.current.totalSeconds).toBe(45 * 60);
        expect(result.current.progress).toBe(0);
    });

    it('toggleTimer starts the timer', () => {
        const { result } = renderHook(() =>
            useTimer(defaultSettings, 0, vi.fn())
        );
        act(() => { result.current.toggleTimer(); });
        expect(result.current.running).toBe(true);
    });

    it('toggleTimer pauses a running timer', () => {
        const { result } = renderHook(() =>
            useTimer(defaultSettings, 0, vi.fn())
        );
        act(() => { result.current.toggleTimer(); });
        act(() => { result.current.toggleTimer(); });
        expect(result.current.running).toBe(false);
    });

    it('resetTimer stops and resets secondsLeft', () => {
        const { result } = renderHook(() =>
            useTimer(defaultSettings, 0, vi.fn())
        );
        act(() => { result.current.toggleTimer(); });
        act(() => { vi.advanceTimersByTime(5000); });
        act(() => { result.current.resetTimer(); });
        expect(result.current.running).toBe(false);
        expect(result.current.secondsLeft).toBe(defaultSettings.workMinutes * 60);
    });

    it('countdown ticks every second', () => {
        const { result } = renderHook(() =>
            useTimer(defaultSettings, 0, vi.fn())
        );
        act(() => { result.current.toggleTimer(); });
        act(() => { vi.advanceTimersByTime(3000); });
        expect(result.current.secondsLeft).toBe(defaultSettings.workMinutes * 60 - 3);
    });

    it('calls onSessionEnd and stops running when countdown reaches zero', () => {
        const onSessionEnd = vi.fn();
        const shortSettings = { ...defaultSettings, workMinutes: 0.05 }; // 3 seconds
        const { result } = renderHook(() =>
            useTimer(shortSettings, 0, onSessionEnd)
        );
        act(() => { result.current.toggleTimer(); });
        act(() => { vi.advanceTimersByTime(3000); });
        expect(onSessionEnd).toHaveBeenCalledWith('focus');
        expect(result.current.running).toBe(false);
    });

    it('toggleTimer restarts when secondsLeft is 0', () => {
        const onSessionEnd = vi.fn();
        const shortSettings = { ...defaultSettings, workMinutes: 0.05 };
        const { result } = renderHook(() =>
            useTimer(shortSettings, 0, onSessionEnd)
        );
        act(() => { result.current.toggleTimer(); });
        act(() => { vi.advanceTimersByTime(4000); });
        // secondsLeft should be 0 now, toggling again should restart
        act(() => { result.current.toggleTimer(); });
        expect(result.current.running).toBe(true);
    });

    it('switchMode changes mode and resets timer', () => {
        const { result } = renderHook(() =>
            useTimer(defaultSettings, 0, vi.fn())
        );
        act(() => { result.current.switchMode('shortBreak'); });
        expect(result.current.mode).toBe('shortBreak');
        expect(result.current.running).toBe(false);
        expect(result.current.totalSeconds).toBe(defaultSettings.shortBreakMinutes * 60);
    });

    it('switchMode to longBreak gives correct totalSeconds', () => {
        const { result } = renderHook(() =>
            useTimer(defaultSettings, 0, vi.fn())
        );
        act(() => { result.current.switchMode('longBreak'); });
        expect(result.current.totalSeconds).toBe(defaultSettings.longBreakMinutes * 60);
    });

    it('toggleFocusBreak switches focus → shortBreak when acc < threshold', () => {
        const { result } = renderHook(() =>
            useTimer(defaultSettings, 50, vi.fn()) // 50 < 100 threshold
        );
        act(() => { result.current.toggleFocusBreak(); });
        expect(result.current.mode).toBe('shortBreak');
    });

    it('toggleFocusBreak switches focus → longBreak when acc >= threshold', () => {
        const { result } = renderHook(() =>
            useTimer(defaultSettings, 100, vi.fn()) // 100 >= 100 threshold
        );
        act(() => { result.current.toggleFocusBreak(); });
        expect(result.current.mode).toBe('longBreak');
    });

    it('toggleFocusBreak switches break → focus', () => {
        const { result } = renderHook(() =>
            useTimer(defaultSettings, 50, vi.fn())
        );
        act(() => { result.current.switchMode('shortBreak'); });
        act(() => { result.current.toggleFocusBreak(); });
        expect(result.current.mode).toBe('focus');
    });

    it('progress increases as timer counts down', () => {
        const { result } = renderHook(() =>
            useTimer(defaultSettings, 0, vi.fn())
        );
        act(() => { result.current.toggleTimer(); });
        act(() => { vi.advanceTimersByTime(1000); });
        expect(result.current.progress).toBeGreaterThan(0);
    });
});

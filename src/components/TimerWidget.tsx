'use client';

import React, { useState } from 'react';
import { useTimer, TimerSettings, TimerMode } from '@/hooks/useTimer';
import { CircularTimer } from '@/components/CircularTimer';

const fmt = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return { m, sec };
};

export function TimerWidget() {
    const [settings, setSettings] = useState<TimerSettings>({
        workMinutes: 45,
        shortBreakMinutes: 10,
        longBreakMinutes: 20,
        accThreshold: 100,
    });

    const [showSettings, setShowSettings] = useState(false);
    const [sessionTag, setSessionTag] = useState('');
    const [accMinutes, setAccMinutes] = useState(0);
    const [notification, setNotification] = useState<string | null>(null);

    const notify = (msg: string, duration = 4000) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), duration);
    };

    const handleSessionEnd = (completedMode: TimerMode) => {
        if (completedMode === 'focus') {
            setAccMinutes(prev => prev + settings.workMinutes);
            notify('Session complete. Take a break when you are ready.');
        } else {
            notify('Break over. Ready to focus?');
        }
    };

    const {
        mode,
        running,
        secondsLeft,
        progress,
        toggleTimer,
        resetTimer,
        toggleFocusBreak
    } = useTimer(settings, accMinutes, handleSessionEnd);

    const { m, sec } = fmt(secondsLeft);

    const changeSetting = (key: keyof TimerSettings, val: number) => {
        setSettings(s => ({ ...s, [key]: val }));
    };

    return (
        <div className="flex flex-col items-center gap-8 justify-center min-h-screen">

            {/* settings modal */}
            {showSettings && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in"
                    onClick={() => setShowSettings(false)}
                >
                    <div
                        className="bg-[#141210] border border-[#2e2b25] rounded-xl p-8 w-80 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="font-serif text-2xl mb-6 text-[#e8e0d0]">Settings</h2>

                        {([
                            { label: 'Work Duration', key: 'workMinutes', unit: 'min', min: 1, max: 120 },
                            { label: 'Short Break', key: 'shortBreakMinutes', unit: 'min', min: 1, max: 30 },
                            { label: 'Long Break', key: 'longBreakMinutes', unit: 'min', min: 5, max: 60 },
                        ] as const).map(({ label, key, unit, min, max }) => (
                            <div key={key} className="mb-5">
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm text-[#7a7060]">{label}</label>
                                    <span className="font-mono text-sm text-[#c8843a]">{settings[key]} {unit}</span>
                                </div>
                                <input
                                    type="range" min={min} max={max} value={settings[key]}
                                    onChange={e => changeSetting(key, +e.target.value)}
                                    className="w-full accent-[#c8843a] h-1 cursor-pointer"
                                />
                            </div>
                        ))}

                        <button
                            onClick={() => setShowSettings(false)}
                            className="w-full mt-4 p-3 bg-[#c8843a] text-[#1a1208] rounded-md font-mono text-xs tracking-widest hover:opacity-85 transition-opacity"
                        >
                            SAVE (Takes effect next session)
                        </button>
                    </div>
                </div>
            )}

            {/* notification toast */}
            {notification && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-[#222019] border border-[#2e2b25] rounded-md px-5 py-3 text-sm text-[#7a7060] z-50 animate-in slide-in-from-top-4">
                    {notification}
                </div>
            )}

            {/* top bar controls */}
            <div className="fixed top-0 left-0 right-0 p-4 flex justify-end">
                <button
                    onClick={() => setShowSettings(true)}
                    className="text-[#7a7060] hover:text-[#e8e0d0] font-mono text-xs tracking-widest transition-colors"
                >
                    SETTINGS
                </button>
            </div>

            <div className="relative flex items-center justify-center">
                <CircularTimer
                    progress={progress}
                    radius={140}
                    isBreak={mode !== 'focus'}
                    running={running}
                />
                <div className="absolute flex flex-col items-center justify-center">
                    <div className="flex items-baseline gap-1 mt-4">
                        <span className="font-mono text-7xl font-light text-[#e8e0d0] tracking-tighter leading-none">{m}</span>
                        <span className={`font-mono text-7xl font-light text-[#7a7060] leading-none ${running ? 'animate-pulse' : ''}`}>:</span>
                        <span className="font-mono text-7xl font-light text-[#e8e0d0] tracking-tighter leading-none">{sec}</span>
                    </div>
                    <span className={`text-xs tracking-[0.2em] uppercase mt-4 ${mode !== 'focus' ? 'text-[#6a9a6a]' : 'text-[#8a5a26]'}`}>
                        {mode === 'focus' ? 'deep focus' : 'resting'}
                    </span>
                </div>
            </div>

            <div className="flex gap-4 items-center">
                <button
                    onClick={toggleTimer}
                    className={`px-8 py-3 rounded-md font-mono text-xs tracking-widest border transition-all ${mode !== 'focus'
                            ? 'border-[#6a9a6a] text-[#1a1208] bg-[#6a9a6a]'
                            : 'border-[#c8843a] text-[#1a1208] bg-[#c8843a]'
                        } hover:bg-transparent hover:text-white`}
                >
                    {running ? 'PAUSE' : 'START'}
                </button>
                <button
                    onClick={resetTimer}
                    className="px-8 py-3 rounded-md font-mono text-xs tracking-widest border border-[#2e2b25] text-[#7a7060] hover:text-[#e8e0d0]"
                >
                    RESET
                </button>
                <button
                    onClick={toggleFocusBreak}
                    className={`px-8 py-3 rounded-md font-mono text-xs tracking-widest border transition-all ${mode !== 'focus'
                            ? 'bg-[#1a2e1a] border-[#6a9a6a] text-[#9ab09a]'
                            : 'border-[#2e2b25] text-[#7a7060] hover:text-[#9ab09a]'
                        }`}
                >
                    {mode === 'focus' ? 'BREAK' : 'FOCUS'}
                </button>
            </div>

        </div>
    );
}

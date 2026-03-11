'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTimer, TimerSettings, TimerMode } from '@/hooks/useTimer';
import { CircularTimer } from '@/components/CircularTimer';
import { AccumulatedBar } from '@/components/AccumulatedBar';
import { BreakSuggestion, randomSuggestion } from '@/components/BreakSuggestion';

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
    const [tagSuggestions, setTagSuggestions] = useState<{ _id: string, count: number }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [user, setUser] = useState<{ email: string, name?: string, settings?: Record<string, number> } | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const router = useRouter();

    // Create a ref for the dropdown to handle outside clicks
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [accMinutes, setAccMinutes] = useState(0);
    const [notification, setNotification] = useState<string | null>(null);
    const [breakSuggestion, setBreakSuggestion] = useState<string | null>(null);

    const fetchAccumulated = () => {
        fetch('/api/v1/accumulated')
            .then(res => { if (res.ok) return res.json(); return null; })
            .then(data => { if (data?.data?.minutes !== undefined) setAccMinutes(data.data.minutes); })
            .catch(err => console.error('Failed to fetch accumulated:', err));
    };

    // Fetch user, tags, and accumulated on mount
    useEffect(() => {
        fetch('/api/v1/auth/me')
            .then(res => {
                if (res.ok) return res.json();
                return null;
            })
            .then(data => {
                if (data && data.data) {
                    setUser(data.data);
                    if (data.data.settings) {
                        setSettings({
                            workMinutes: data.data.settings.workDuration ?? 45,
                            shortBreakMinutes: data.data.settings.shortBreakDuration ?? 10,
                            longBreakMinutes: data.data.settings.longBreakDuration ?? 20,
                            accThreshold: data.data.settings.dailyFocusThreshold ?? 100,
                        });
                    }
                    fetchAccumulated(); // only makes sense if logged in
                }
            })
            .catch(err => console.error('Failed to get user:', err))
            .finally(() => setIsInitialLoad(false));

        fetch('/api/v1/tags')
            .then(res => res.json())
            .then(data => {
                if (data.tags) setTagSuggestions(data.tags);
            })
            .catch(err => console.error('Failed to load tags:', err));
    }, []);

    // Handle clicks outside the dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const notify = (msg: string, duration = 4000) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), duration);
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/v1/auth/logout', { method: 'POST' });
            setUser(null);
            setSettings({
                workMinutes: 45,
                shortBreakMinutes: 10,
                longBreakMinutes: 20,
                accThreshold: 100,
            });
            router.refresh();
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    const handleSessionEnd = (completedMode: TimerMode) => {
        if (completedMode === 'focus') {
            notify('Session complete. Take a break when you are ready.');
            setBreakSuggestion(randomSuggestion());

            // Persist the focus session, then refresh accumulated total from server
            fetch('/api/v1/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    duration: settings.workMinutes * 60,
                    mode: 'focus',
                    tag: sessionTag
                })
            })
                .then(() => fetchAccumulated())
                .catch(err => console.error('Failed to save session:', err));

        } else {
            notify('Break over. Ready to focus?');
            setBreakSuggestion(null); // auto-dismiss when break ends

            // After a long break, reset accumulated so short breaks are available again
            if (completedMode === 'longBreak') {
                setAccMinutes(0);
            }

            // Persist the break session
            const duration = completedMode === 'shortBreak'
                ? settings.shortBreakMinutes * 60
                : settings.longBreakMinutes * 60;

            fetch('/api/v1/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    duration,
                    mode: completedMode
                })
            }).catch(err => console.error('Failed to save session:', err));
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

    const saveSettings = async () => {
        setShowSettings(false);
        if (!user) return; // Only save to server if logged in

        try {
            await fetch('/api/v1/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workDuration: settings.workMinutes,
                    shortBreakDuration: settings.shortBreakMinutes,
                    longBreakDuration: settings.longBreakMinutes,
                    dailyFocusThreshold: settings.accThreshold,
                }),
            });
        } catch (err) {
            console.error('Failed to save settings:', err);
        }
    };

    if (isInitialLoad) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="flex items-center gap-2 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-amber shadow-[0_0_8px_var(--color-amber)]" />
                    <span className="font-serif text-lg italic tracking-[0.02em] text-text">DeepWork</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-8 justify-center min-h-screen fade-in animate-in">

            {/* settings modal */}
            {showSettings && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center animate-in fade-in"
                    onClick={() => setShowSettings(false)}
                >
                    <div
                        className="bg-bg2/90 backdrop-blur-xl border border-border rounded-xl p-8 w-80 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="font-serif text-2xl mb-6 text-text">Settings</h2>

                        {([
                            { label: 'Work Duration', key: 'workMinutes', unit: 'min', min: 1, max: 120 },
                            { label: 'Short Break', key: 'shortBreakMinutes', unit: 'min', min: 1, max: 30 },
                            { label: 'Long Break', key: 'longBreakMinutes', unit: 'min', min: 5, max: 60 },
                            { label: 'Focus Threshold', key: 'accThreshold', unit: 'min', min: 25, max: 300 },
                        ] as const).map(({ label, key, unit, min, max }) => (
                            <div key={key} className="mb-5">
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm text-text-dim">{label}</label>
                                    <span className="font-mono text-sm text-amber">{settings[key]} {unit}</span>
                                </div>
                                <input
                                    type="range" min={min} max={max} value={settings[key]}
                                    onChange={e => changeSetting(key, +e.target.value)}
                                    className="w-full accent-amber h-1 cursor-pointer"
                                />
                            </div>
                        ))}

                        <button
                            onClick={saveSettings}
                            className="w-full mt-4 p-3 bg-amber text-[#1a1208] rounded-md font-mono text-xs tracking-widest hover:bg-amber/90 transition-colors"
                        >
                            SAVE (Takes effect next session)
                        </button>
                    </div>
                </div>
            )}

            {/* notification toast */}
            {notification && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur-sm border border-border rounded-md px-5 py-3 text-sm text-text-dim z-50 animate-in slide-in-from-top-4 shadow-lg">
                    {notification}
                </div>
            )}

            {/* top bar controls */}
            {/* top bar controls */}
            <div
                className="fixed top-0 left-0 right-0 px-4 sm:px-6 pb-3 sm:pb-4 flex items-center justify-between border-b border-border bg-bg/80 backdrop-blur-md z-30 transition-colors duration-300"
                style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
            >
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber ${running ? 'animate-pulse shadow-[0_0_8px_var(--color-amber)]' : ''}`} />
                    <span className="font-serif text-base sm:text-lg italic tracking-[0.02em] text-text mt-0.5">DeepWork</span>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-4">
                    <button
                        onClick={() => {
                            if (user) router.push('/dashboard');
                            else router.push('/auth');
                        }}
                        className="text-text-dim hover:text-text font-mono text-[10px] sm:text-xs tracking-[0.1em] transition-colors"
                    >
                        History
                    </button>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="text-text-dim hover:text-text font-mono text-[10px] sm:text-xs tracking-[0.1em] transition-colors"
                    >
                        Settings
                    </button>

                    <div className="w-[1px] h-3.5 bg-border mx-0.5 sm:mx-1" />

                    {user ? (
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-amber-dim border border-amber flex items-center justify-center font-mono text-xs sm:text-sm text-[#141210] font-medium leading-none m-0 p-0 mb-[1px]">
                                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-amber hover:text-amber/80 font-mono text-[9px] sm:text-[10px] tracking-[0.15em] transition-colors"
                            >
                                SIGN OUT
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => router.push('/auth')}
                            className="bg-amber text-[#141210] px-3 sm:px-4 py-1 sm:py-1.5 rounded-md font-mono text-[9px] sm:text-[10px] tracking-[0.15em] hover:bg-amber/90 transition-colors"
                        >
                            SIGN IN
                        </button>
                    )}
                </div>
            </div>



            <div className="relative flex items-center justify-center -mt-4">
                <CircularTimer
                    progress={progress}
                    radius={140}
                    isBreak={mode !== 'focus'}
                    running={running}
                />
                <div className="absolute flex flex-col items-center justify-center">
                    <div className="flex items-baseline gap-1 mt-4">
                        <span className="font-mono text-7xl font-light text-text tracking-tighter leading-none">{m}</span>
                        <span className={`font-mono text-7xl font-light text-text-dim leading-none ${running ? 'animate-pulse' : ''}`}>:</span>
                        <span className="font-mono text-7xl font-light text-text tracking-tighter leading-none">{sec}</span>
                    </div>
                    <span className={`text-xs tracking-[0.2em] uppercase mt-4 ${mode !== 'focus' ? 'text-green' : 'text-amber-dim'}`}>
                        {mode === 'focus' ? 'deep focus' : 'resting'}
                    </span>
                </div>
            </div>

            <div className="flex gap-4 items-center">
                <button
                    onClick={toggleTimer}
                    className={`px-8 py-3 rounded-md font-mono text-xs tracking-widest border transition-all ${mode !== 'focus'
                        ? 'border-green text-[#1a1208] bg-green'
                        : 'border-amber text-[#1a1208] bg-amber'
                        } hover:bg-transparent hover:text-white`}
                >
                    {running ? 'PAUSE' : 'START'}
                </button>
                <button
                    onClick={resetTimer}
                    className="px-8 py-3 rounded-md font-mono text-xs tracking-widest border border-border text-text-dim hover:text-text hover:border-text-dim transition-colors"
                >
                    RESET
                </button>
                <button
                    onClick={toggleFocusBreak}
                    className={`px-8 py-3 rounded-md font-mono text-xs tracking-widest border transition-all ${mode !== 'focus'
                        ? 'bg-green/10 border-green text-green/80 hover:bg-green/20'
                        : 'border-border text-text-dim hover:text-green/80 hover:border-green/50 hover:bg-green/5'
                        }`}
                >
                    {mode === 'focus' ? 'BREAK' : 'FOCUS'}
                </button>
            </div>

            {/* Accumulated focus bar — only shown when logged in */}
            {user && (
                <div className="w-full max-w-[360px]">
                    <AccumulatedBar minutes={accMinutes} threshold={settings.accThreshold} />
                </div>
            )}

            {/* Break suggestion card */}
            {breakSuggestion && (
                <BreakSuggestion
                    suggestion={breakSuggestion}
                    onDismiss={() => setBreakSuggestion(null)}
                    onRefresh={() => setBreakSuggestion(randomSuggestion())}
                />
            )}

            {/* Tag autocomplete input */}
            {mode === 'focus' && (
                <div className="relative w-full max-w-[320px] z-10" ref={dropdownRef}>
                    <div className="flex items-center gap-2 bg-surface border border-border rounded-md px-3 py-2 transition-colors duration-200 focus-within:border-amber/50">
                        <span className="text-text-dim text-xs">⬡</span>
                        <input
                            type="text"
                            placeholder="Tag this session…"
                            value={sessionTag}
                            onChange={(e) => {
                                setSessionTag(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            disabled={running}
                            className={`w-full bg-transparent border-none outline-none font-sans text-[13px] text-text tracking-[0.02em] transition-colors
                                placeholder:text-text-muted ${running ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                    </div>

                    {showSuggestions && !running && (
                        <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-bg3 border border-border rounded-md overflow-hidden z-10 shadow-xl backdrop-blur-md">
                            {tagSuggestions
                                .filter(t => t._id.toLowerCase().includes(sessionTag.toLowerCase()) && t._id !== sessionTag)
                                .slice(0, 5)
                                .map(tag => (
                                    <button
                                        key={tag._id}
                                        className="w-full text-left px-3 py-2 font-sans text-[13px] text-text-dim hover:text-text hover:bg-surface border-none transition-colors flex justify-between cursor-pointer"
                                        onClick={() => {
                                            setSessionTag(tag._id);
                                            setShowSuggestions(false);
                                        }}
                                    >
                                        <span className="truncate">{tag._id}</span>
                                    </button>
                                ))
                            }
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}

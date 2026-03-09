'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTimer, TimerSettings, TimerMode } from '@/hooks/useTimer';
import { CircularTimer } from '@/components/CircularTimer';
import { AccumulatedBar } from '@/components/AccumulatedBar';
import { BreakSuggestion, randomSuggestion } from '@/components/BreakSuggestion';
import { useAuth } from '@/contexts/AuthContext';

const fmt = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return { m, sec };
};

export function TimerWidget() {
    const { user: authUser, updateSettings, loading, logout } = useAuth();

    const [settings, setSettings] = useState<TimerSettings>({
        workMinutes: authUser?.settings?.workDuration ?? 45,
        shortBreakMinutes: authUser?.settings?.shortBreakDuration ?? 10,
        longBreakMinutes: authUser?.settings?.longBreakDuration ?? 20,
        accThreshold: authUser?.settings?.dailyFocusThreshold ?? 100,
    });

    const [showSettings, setShowSettings] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [sessionTag, setSessionTag] = useState('');
    const [tagSuggestions, setTagSuggestions] = useState<{ _id: string, count: number }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const router = useRouter();

    // Sync timer settings whenever authUser changes (e.g. login, logout)
    useEffect(() => {
        if (authUser?.settings) {
            setSettings({
                workMinutes: authUser.settings.workDuration,
                shortBreakMinutes: authUser.settings.shortBreakDuration,
                longBreakMinutes: authUser.settings.longBreakDuration,
                accThreshold: authUser.settings.dailyFocusThreshold,
            });
        } else {
            // Revert to defaults on logout
            setSettings({
                workMinutes: 45,
                shortBreakMinutes: 10,
                longBreakMinutes: 20,
                accThreshold: 100,
            });
        }
    }, [authUser]);

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

    // Fetch tags and accumulated
    useEffect(() => {
        if (authUser) {
            fetchAccumulated(); // only makes sense if logged in
        }

        fetch('/api/v1/tags')
            .then(res => res.json())
            .then(data => {
                if (data.tags) setTagSuggestions(data.tags);
            })
            .catch(err => console.error('Failed to load tags:', err));
    }, [authUser]);

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
            await logout();
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#0e0d0b]">
                <div className="w-8 h-8 border-2 border-[#c8843a] border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="font-mono text-xs text-[#7a7060] tracking-[0.2em] uppercase">Loading DeepWork...</div>
            </div>
        );
    }

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
                            { label: 'Focus Threshold', key: 'accThreshold', unit: 'min', min: 25, max: 300 },
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
                            disabled={savingSettings}
                            onClick={async () => {
                                setSavingSettings(true);
                                try {
                                    await updateSettings({
                                        workDuration: settings.workMinutes,
                                        shortBreakDuration: settings.shortBreakMinutes,
                                        longBreakDuration: settings.longBreakMinutes,
                                        dailyFocusThreshold: settings.accThreshold,
                                    });
                                } catch {
                                    // silent — optimistic update already applied
                                } finally {
                                    setSavingSettings(false);
                                    setShowSettings(false);
                                }
                            }}
                            className="w-full mt-4 p-3 bg-[#c8843a] text-[#1a1208] rounded-md font-mono text-xs tracking-widest hover:opacity-85 transition-opacity disabled:opacity-50"
                        >
                            {savingSettings ? 'SAVING...' : 'SAVE'}
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
            <div className="fixed top-0 left-0 right-0 py-4 px-6 flex items-center justify-between border-b border-[#2e2b25] bg-[#0e0d0b]/80 backdrop-blur-md z-30">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-[#c8843a] ${running ? 'animate-pulse shadow-[0_0_8px_#c8843a]' : ''}`} />
                    <span className="font-serif text-lg italic tracking-[0.02em] text-[#e8e0d0]">DeepWork</span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            if (authUser) router.push('/dashboard');
                            else router.push('/auth');
                        }}
                        className="text-[#7a7060] hover:text-[#e8e0d0] font-mono text-xs tracking-[0.1em] transition-colors"
                    >
                        History
                    </button>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="text-[#7a7060] hover:text-[#e8e0d0] font-mono text-xs tracking-[0.1em] transition-colors"
                    >
                        Settings
                    </button>

                    <div className="w-[1px] h-3.5 bg-[#2e2b25] mx-1" />

                    {authUser ? (
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#8a5a26] border border-[#c8843a] flex items-center justify-center font-mono text-sm text-[#141210] font-medium leading-none m-0 p-0 mb-[1px]">
                                {authUser.name ? authUser.name.charAt(0).toUpperCase() : authUser.email.charAt(0).toUpperCase()}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-[#c8843a] hover:opacity-80 font-mono text-[10px] tracking-[0.15em] transition-opacity"
                            >
                                SIGN OUT
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => router.push('/auth')}
                            className="bg-[#c8843a] text-[#141210] px-4 py-1.5 rounded-md font-mono text-[10px] tracking-[0.15em] hover:opacity-85 transition-opacity"
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

            {/* Accumulated focus bar — only shown when logged in */}
            {authUser && (
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
                    <div className="flex items-center gap-2 bg-[#222019] border border-[#2e2b25] rounded-md px-3 py-2">
                        <span className="text-[#7a7060] text-xs">⬡</span>
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
                            className={`w-full bg-transparent border-none outline-none font-sans text-[13px] text-[#e8e0d0] tracking-[0.02em] transition-colors
                                placeholder:text-[#5a5040] ${running ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                    </div>

                    {showSuggestions && !running && (
                        <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-[#1c1916] border border-[#2e2b25] rounded-md overflow-hidden z-10 shadow-xl">
                            {tagSuggestions
                                .filter(t => t._id.toLowerCase().includes(sessionTag.toLowerCase()) && t._id !== sessionTag)
                                .slice(0, 5)
                                .map(tag => (
                                    <button
                                        key={tag._id}
                                        className="w-full text-left px-3 py-2 font-sans text-[13px] text-[#7a7060] hover:bg-[#222019] transition-colors flex justify-between cursor-pointer"
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

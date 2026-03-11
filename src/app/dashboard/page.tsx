'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const PAGE_SIZE = 4;

interface TodayStats {
    minutes: number;
    sessionCount: number;
    avgMinutes: number;
}

interface DayData {
    date: string;
    label: string;
    minutes: number;
    count: number;
}

interface TagData {
    tag: string;
    minutes: number;
}

interface SessionData {
    _id: string;
    tag?: string;
    duration: number;
    mode: string;
    createdAt: string;
}

interface AnalyticsData {
    todayStats: TodayStats;
    last7Days: DayData[];
    byTag: TagData[];
    recentSessions: SessionData[];
}

const fmtDuration = (totalMinutes: number): string => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
};

const TODAY = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
});

export default function DashboardPage() {
    const router = useRouter();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Day filter — YYYY-MM-DD UTC string from last7Days
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    // Inline tag edit
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingTag, setEditingTag] = useState('');

    useEffect(() => {
        fetch('/api/v1/auth/me')
            .then(res => {
                if (!res.ok) {
                    console.log('TEST DEBUG: Auth check failed, redirecting');
                    router.replace('/auth');
                    return null;
                }
                return res.json();
            })
            .then(authData => {
                if (!authData) return;
                return fetch('/api/v1/analytics')
                    .then(res => {
                        if (!res.ok) throw new Error('Failed to load analytics');
                        return res.json();
                    })
                    .then(json => setData(json.data));
            })
            .catch(err => {
                console.log('TEST DEBUG: Catch block hit', err);
                setError('Failed to load analytics data.');
            })
            .finally(() => setLoading(false));
    }, [router]);

    const saveTag = (sessionId: string) => {
        const trimmed = editingTag.trim();
        setEditingId(null);
        setData(prev => {
            if (!prev) return prev;
            const updatedSessions = prev.recentSessions.map(s =>
                s._id === sessionId ? { ...s, tag: trimmed || undefined } : s
            );
            // Recompute byTag from updated sessions so Time by Project stays in sync
            const tagMap: Record<string, number> = {};
            updatedSessions.forEach(s => {
                const key = s.tag ?? 'Untitled';
                tagMap[key] = (tagMap[key] || 0) + Math.round(s.duration / 60);
            });
            const newByTag = Object.entries(tagMap)
                .map(([tag, minutes]) => ({ tag, minutes }))
                .sort((a, b) => b.minutes - a.minutes);
            return { ...prev, recentSessions: updatedSessions, byTag: newByTag };
        });
        fetch(`/api/v1/sessions/${sessionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tag: trimmed }),
        }).catch(() => console.error('Failed to update tag'));
    };

    const handleDayClick = (date: string, hasData: boolean) => {
        if (!hasData) return;
        setSelectedDate(prev => prev === date ? null : date);
        setPage(1);
    };

    if (loading) return (
        <div className="min-h-screen bg-bg flex items-center justify-center">
            <span className="font-mono text-xs text-text-dim tracking-[0.1em]">Loading…</span>
        </div>
    );

    if (error || !data) return (
        <div className="min-h-screen bg-bg flex items-center justify-center">
            <span className="font-sans text-[13px] text-red">{error ?? 'No data available.'}</span>
        </div>
    );

    const { todayStats, last7Days, byTag: allByTag, recentSessions } = data;
    const maxDay = Math.max(...last7Days.map(d => d.minutes), 1);
    const todayUTC = new Date().toISOString().slice(0, 10);

    // Client-side filtering by selected date (match UTC date string of createdAt)
    const filteredSessions = selectedDate
        ? recentSessions.filter(s => new Date(s.createdAt).toISOString().slice(0, 10) === selectedDate)
        : recentSessions;

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredSessions.length / PAGE_SIZE));
    const pagedSessions = filteredSessions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Stats for selected day (computed client-side) vs today (from server)
    const filteredMinutes = selectedDate
        ? Math.round(filteredSessions.reduce((sum, s) => sum + s.duration, 0) / 60)
        : todayStats.minutes;
    const filteredCount = selectedDate ? filteredSessions.length : todayStats.sessionCount;
    const filteredAvg = selectedDate
        ? (filteredCount > 0 ? Math.round(filteredMinutes / filteredCount) : 0)
        : todayStats.avgMinutes;

    // Stat card label
    const selectedDay = last7Days.find(d => d.date === selectedDate);
    const statLabel = selectedDate
        ? (selectedDate === todayUTC ? 'Today' : selectedDay?.label ?? selectedDate)
        : "Today's Focus";

    // byTag: use filtered sessions when day selected, otherwise server result
    const displayByTag: TagData[] = selectedDate
        ? (() => {
            const map: Record<string, number> = {};
            filteredSessions.forEach(s => {
                const key = s.tag ?? 'Untitled';
                map[key] = (map[key] || 0) + Math.round(s.duration / 60);
            });
            return Object.entries(map)
                .map(([tag, minutes]) => ({ tag, minutes }))
                .sort((a, b) => b.minutes - a.minutes);
        })()
        : allByTag;
    const maxTag = Math.max(...displayByTag.map(t => t.minutes), 1);

    return (
        <div className="min-h-screen bg-bg py-10 px-6 animate-[fade-in_0.3s_ease]">
            <div className="max-w-[600px] mx-auto">

                {/* Header */}
                <div className="flex items-center gap-4 mb-12">
                    <button
                        onClick={() => router.push('/')}
                        className="bg-transparent border border-border text-text-dim px-3.5 py-1.5 rounded-md cursor-pointer font-mono text-[11px] tracking-[0.1em] transition-all duration-200 hover:border-amber hover:text-amber"
                    >← back</button>
                    <div>
                        <h1 className="font-serif text-[28px] font-normal text-text m-0 leading-tight">Focus History</h1>
                        <p className="font-sans text-xs text-text-dim mt-0.5 tracking-[0.06em] m-0">{TODAY}</p>
                    </div>
                </div>

                {/* Stat cards — reactive to selected day */}
                <div className="mb-2">
                    <div className="flex items-center justify-between mb-3">
                        <p className="font-sans text-[11px] text-text-dim tracking-[0.12em] uppercase m-0">
                            {statLabel}
                        </p>
                        {selectedDate && (
                            <button
                                onClick={() => { setSelectedDate(null); setPage(1); }}
                                className="bg-transparent border-none cursor-pointer font-mono text-[10px] text-text-muted tracking-[0.1em] underline"
                            >clear filter</button>
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-10">
                        {[
                            { label: 'Focus Time', value: fmtDuration(filteredMinutes) },
                            { label: 'Sessions', value: String(filteredCount) },
                            { label: 'Avg Session', value: filteredCount > 0 ? fmtDuration(filteredAvg) : '—' },
                        ].map(({ label, value }) => (
                            <div key={label} className={`bg-surface border rounded-lg py-4 px-4 transition-colors duration-300 ${selectedDate ? 'border-amber-dim' : 'border-border'}`}>
                                <p className="font-sans text-[10px] text-text-dim tracking-[0.14em] uppercase mb-2 m-0">{label}</p>
                                <p className="font-mono text-[22px] text-amber font-normal m-0">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 7-day bar chart — clickable */}
                <div className="mb-10">
                    <p className="font-sans text-[11px] text-text-dim tracking-[0.12em] uppercase mb-1.5 m-0">Last 7 Days</p>
                    <p className="font-sans text-[11px] text-text-muted mb-4 tracking-[0.04em] m-0">Click a day to filter</p>
                    <div className="flex items-end gap-2 h-[88px]">
                        {last7Days.map(({ label, minutes, date, count }) => {
                            const h = maxDay > 0 ? (minutes / maxDay) * 72 : 0;
                            const isToday = date === todayUTC;
                            const isSelected = selectedDate === date;
                            const hasData = minutes > 0;
                            return (
                                <div
                                    key={date}
                                    onClick={() => handleDayClick(date, hasData)}
                                    className={`flex-1 flex flex-col items-center gap-1.5 ${hasData ? 'cursor-pointer' : 'cursor-default'}`}
                                >
                                    {/* session count badge */}
                                    <span className={`font-mono text-[9px] tracking-[0.06em] h-3 ${isSelected ? 'text-amber' : 'text-transparent'}`}>
                                        {count > 0 ? count : ''}
                                    </span>
                                    <div className="w-full h-[72px] flex items-end">
                                        <div
                                            style={{ height: `${Math.max(h, hasData ? 4 : 0)}px` }}
                                            className={`w-full rounded-t-[3px] transition-all duration-300 ease-out border ${isSelected
                                                    ? 'bg-amber border-amber shadow-[0_0_14px_var(--color-amber-glow)]'
                                                    : isToday
                                                        ? 'bg-amber-dim border-amber-dim shadow-[0_0_8px_#8a5a2633]'
                                                        : 'bg-bg3 border-border shadow-none'
                                                }`}
                                        />
                                    </div>
                                    <span className={`font-mono text-[9px] tracking-[0.08em] ${isSelected ? 'text-amber' : isToday ? 'text-amber-dim' : 'text-text-muted'}`}>
                                        {label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Time by Project — scoped to filter */}
                {displayByTag.length > 0 && (
                    <div className="mb-10">
                        <p className="font-sans text-[11px] text-text-dim tracking-[0.12em] uppercase mb-4 m-0">
                            Time by Project {selectedDate && selectedDay ? `· ${statLabel}` : ''}
                        </p>
                        <div className="flex flex-col gap-2.5">
                            {displayByTag.map(({ tag, minutes }) => (
                                <div key={tag}>
                                    <div className="flex justify-between mb-1">
                                        <span className="font-sans text-[13px] text-text">{tag}</span>
                                        <span className="font-mono text-[12px] text-text-dim">{fmtDuration(minutes)}</span>
                                    </div>
                                    <div className="h-[3px] bg-surface rounded-[2px] overflow-hidden">
                                        <div
                                            style={{ width: `${(minutes / maxTag) * 100}%` }}
                                            className="h-full bg-gradient-to-r from-amber-dim to-amber rounded-[2px] transition-[width] duration-500 ease-out"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Session Log with pagination */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <p className="font-sans text-[11px] text-text-dim tracking-[0.12em] uppercase m-0">Session Log</p>
                        <span className="font-mono text-[11px] text-text-muted">
                            {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
                            {selectedDate && selectedDay ? ` · ${statLabel}` : ''}
                        </span>
                    </div>

                    {pagedSessions.length === 0 ? (
                        <p className="font-sans text-[13px] text-text-muted py-5 tracking-[0.04em] m-0">
                            No sessions recorded for this day.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-[1px]">
                            {pagedSessions.map(s => (
                                <div key={s._id} className="flex justify-between items-center py-[13px] border-b border-border animate-[fade-in_0.25s_ease]">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {editingId === s._id ? (
                                            <input
                                                autoFocus
                                                value={editingTag}
                                                maxLength={50}
                                                onChange={e => setEditingTag(e.target.value)}
                                                onBlur={() => saveTag(s._id)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') saveTag(s._id);
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                                className="bg-surface border border-amber rounded-[4px] px-2 py-0.5 font-sans text-[13px] text-text outline-none w-full max-w-[220px]"
                                            />
                                        ) : (
                                            <button
                                                onClick={() => { setEditingId(s._id); setEditingTag(s.tag ?? ''); }}
                                                title="Click to edit tag"
                                                className={`bg-transparent border-none cursor-text font-sans text-[13px] p-0 text-left ${s.tag ? 'text-text' : 'text-text-muted'}`}
                                            >
                                                {s.tag ?? 'Untitled Session'}
                                            </button>
                                        )}
                                        <span className="font-mono text-[10px] text-text-muted shrink-0">
                                            {selectedDate
                                                ? new Date(s.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                                                : new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                            }
                                        </span>
                                    </div>
                                    <span className="font-mono text-[13px] text-amber shrink-0 ml-3">
                                        {fmtDuration(Math.round(s.duration / 60))}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-5">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="bg-transparent border border-border rounded-[4px] px-4 py-1.5 font-mono text-[11px] tracking-[0.1em] transition-all duration-200 hover:border-amber disabled:opacity-40 disabled:hover:border-border disabled:cursor-default"
                            >← prev</button>

                            <div className="flex gap-1.5">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-7 h-7 rounded-[4px] border-none cursor-pointer font-mono text-[11px] transition-all duration-200 ${page === i + 1 ? 'bg-amber text-[#1a1208]' : 'bg-surface text-text-dim hover:bg-surface/80'}`}
                                    >{i + 1}</button>
                                ))}
                            </div>

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="bg-transparent border border-border rounded-[4px] px-4 py-1.5 font-mono text-[11px] tracking-[0.1em] transition-all duration-200 hover:border-amber disabled:opacity-40 disabled:hover:border-border disabled:cursor-default"
                            >next →</button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

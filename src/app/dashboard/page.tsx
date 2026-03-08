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
                if (!res.ok) { router.replace('/auth'); return null; }
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
            .catch(() => setError('Failed to load analytics data.'))
            .finally(() => setLoading(false));
    }, [router]);

    const saveTag = (sessionId: string) => {
        const trimmed = editingTag.trim();
        setEditingId(null);
        setData(prev => prev ? ({
            ...prev,
            recentSessions: prev.recentSessions.map(s =>
                s._id === sessionId ? { ...s, tag: trimmed || undefined } : s
            ),
        }) : prev);
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
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>Loading…</span>
        </div>
    );

    if (error || !data) return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--red)' }}>{error ?? 'No data available.'}</span>
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
        <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 24px', animation: 'fade-in 0.3s ease' }}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
                    <button
                        onClick={() => router.push('/')}
                        style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '6px 14px', borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--amber)'; e.currentTarget.style.color = 'var(--amber)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-dim)'; }}
                    >← back</button>
                    <div>
                        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, color: 'var(--text)' }}>Focus History</h1>
                        <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text-dim)', marginTop: 2, letterSpacing: '0.06em' }}>{TODAY}</p>
                    </div>
                </div>

                {/* Stat cards — reactive to selected day */}
                <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                            {statLabel}
                        </p>
                        {selectedDate && (
                            <button
                                onClick={() => { setSelectedDate(null); setPage(1); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textDecoration: 'underline' }}
                            >clear filter</button>
                        )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 40 }}>
                        {[
                            { label: 'Focus Time', value: fmtDuration(filteredMinutes) },
                            { label: 'Sessions', value: String(filteredCount) },
                            { label: 'Avg Session', value: filteredCount > 0 ? fmtDuration(filteredAvg) : '—' },
                        ].map(({ label, value }) => (
                            <div key={label} style={{ background: 'var(--surface)', border: `1px solid ${selectedDate ? 'var(--amber-dim)' : 'var(--border)'}`, borderRadius: 8, padding: '16px 18px', transition: 'border-color 0.3s' }}>
                                <p style={{ fontFamily: 'var(--sans)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</p>
                                <p style={{ fontFamily: 'var(--mono)', fontSize: 22, color: 'var(--amber)', fontWeight: 400 }}>{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 7-day bar chart — clickable */}
                <div style={{ marginBottom: 40 }}>
                    <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Last 7 Days</p>
                    <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 16, letterSpacing: '0.04em' }}>Click a day to filter</p>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 88 }}>
                        {last7Days.map(({ label, minutes, date, count }) => {
                            const h = maxDay > 0 ? (minutes / maxDay) * 72 : 0;
                            const isToday = date === todayUTC;
                            const isSelected = selectedDate === date;
                            const hasData = minutes > 0;
                            return (
                                <div
                                    key={date}
                                    onClick={() => handleDayClick(date, hasData)}
                                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: hasData ? 'pointer' : 'default' }}
                                >
                                    {/* session count badge */}
                                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: isSelected ? 'var(--amber)' : 'transparent', letterSpacing: '0.06em', height: 12 }}>
                                        {count > 0 ? count : ''}
                                    </span>
                                    <div style={{ width: '100%', height: 72, display: 'flex', alignItems: 'flex-end' }}>
                                        <div style={{
                                            width: '100%',
                                            height: `${Math.max(h, hasData ? 4 : 0)}px`,
                                            background: isSelected ? 'var(--amber)' : isToday ? 'var(--amber-dim)' : 'var(--bg3)',
                                            border: `1px solid ${isSelected ? 'var(--amber)' : isToday ? 'var(--amber-dim)' : 'var(--border)'}`,
                                            borderRadius: '3px 3px 0 0',
                                            transition: 'all 0.25s ease',
                                            boxShadow: isSelected ? '0 0 14px var(--amber-glow)' : isToday ? '0 0 8px #8a5a2633' : 'none',
                                        }} />
                                    </div>
                                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: isSelected ? 'var(--amber)' : isToday ? 'var(--amber-dim)' : 'var(--text-muted)', letterSpacing: '0.08em' }}>
                                        {label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Time by Project — scoped to filter */}
                {displayByTag.length > 0 && (
                    <div style={{ marginBottom: 40 }}>
                        <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
                            Time by Project {selectedDate && selectedDay ? `· ${statLabel}` : ''}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {displayByTag.map(({ tag, minutes }) => (
                                <div key={tag}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                        <span style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text)' }}>{tag}</span>
                                        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-dim)' }}>{fmtDuration(minutes)}</span>
                                    </div>
                                    <div style={{ height: 3, background: 'var(--surface)', borderRadius: 2, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${(minutes / maxTag) * 100}%`, background: 'linear-gradient(90deg, var(--amber-dim), var(--amber))', borderRadius: 2, transition: 'width 0.5s ease' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Session Log with pagination */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <p style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Session Log</p>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                            {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
                            {selectedDate && selectedDay ? ` · ${statLabel}` : ''}
                        </span>
                    </div>

                    {pagedSessions.length === 0 ? (
                        <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text-muted)', padding: '20px 0', letterSpacing: '0.04em' }}>
                            No sessions recorded for this day.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {pagedSessions.map(s => (
                                <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: '1px solid var(--border)', animation: 'fade-in 0.25s ease' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
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
                                                style={{ background: 'var(--surface)', border: '1px solid var(--amber)', borderRadius: 4, padding: '2px 8px', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text)', outline: 'none', width: '100%', maxWidth: 220 }}
                                            />
                                        ) : (
                                            <button
                                                onClick={() => { setEditingId(s._id); setEditingTag(s.tag ?? ''); }}
                                                title="Click to edit tag"
                                                style={{ background: 'none', border: 'none', cursor: 'text', fontFamily: 'var(--sans)', fontSize: 13, color: s.tag ? 'var(--text)' : 'var(--text-muted)', padding: 0, textAlign: 'left' }}
                                            >
                                                {s.tag ?? 'Untitled Session'}
                                            </button>
                                        )}
                                        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                                            {selectedDate
                                                ? new Date(s.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                                                : new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                            }
                                        </span>
                                    </div>
                                    <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--amber)', flexShrink: 0, marginLeft: 12 }}>
                                        {fmtDuration(Math.round(s.duration / 60))}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 16px', cursor: page === 1 ? 'default' : 'pointer', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', color: page === 1 ? 'var(--text-muted)' : 'var(--text-dim)', opacity: page === 1 ? 0.4 : 1, transition: 'all 0.2s' }}
                                onMouseEnter={e => { if (page !== 1) e.currentTarget.style.borderColor = 'var(--amber)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                            >← prev</button>

                            <div style={{ display: 'flex', gap: 6 }}>
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i + 1)}
                                        style={{ width: 28, height: 28, borderRadius: 4, border: 'none', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 11, background: page === i + 1 ? 'var(--amber)' : 'var(--surface)', color: page === i + 1 ? '#1a1208' : 'var(--text-dim)', transition: 'all 0.2s' }}
                                    >{i + 1}</button>
                                ))}
                            </div>

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 16px', cursor: page === totalPages ? 'default' : 'pointer', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', color: page === totalPages ? 'var(--text-muted)' : 'var(--text-dim)', opacity: page === totalPages ? 0.4 : 1, transition: 'all 0.2s' }}
                                onMouseEnter={e => { if (page !== totalPages) e.currentTarget.style.borderColor = 'var(--amber)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                            >next →</button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

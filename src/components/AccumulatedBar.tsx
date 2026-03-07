'use client';

interface AccumulatedBarProps {
    minutes: number;
    threshold: number;
}

const fmtDuration = (totalMinutes: number): string => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
};

export function AccumulatedBar({ minutes, threshold }: AccumulatedBarProps) {
    const pct = Math.min((minutes / Math.max(threshold, 1)) * 100, 100);
    const segments = Math.floor(threshold / 25);
    const isComplete = pct >= 100;

    return (
        <div style={{ width: '100%', maxWidth: 360 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{
                    fontFamily: 'var(--mono)', fontSize: 11,
                    color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase',
                }}>
                    Accumulated Focus
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--amber)' }}>
                    {fmtDuration(minutes)} / {fmtDuration(threshold)}
                </span>
            </div>

            {/* bar track */}
            <div style={{
                position: 'relative', height: 6,
                background: 'var(--surface)', borderRadius: 3, overflow: 'hidden',
            }}>
                {/* fill */}
                <div style={{
                    position: 'absolute', left: 0, top: 0, height: '100%',
                    width: `${pct}%`,
                    background: isComplete
                        ? 'var(--green)'
                        : 'linear-gradient(90deg, var(--amber-dim), var(--amber))',
                    borderRadius: 3,
                    transition: 'width 1s ease',
                    boxShadow: pct > 0 ? '0 0 8px var(--amber-glow)' : 'none',
                }} />

                {/* segment markers (every 25 min) */}
                {segments > 1 && Array.from({ length: segments - 1 }).map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute', top: 0, bottom: 0,
                        left: `${((i + 1) / segments) * 100}%`,
                        width: 1, background: 'var(--bg2)',
                    }} />
                ))}
            </div>

            {isComplete && (
                <p style={{
                    marginTop: 6, fontFamily: 'var(--sans)', fontSize: 11,
                    color: 'var(--green)', letterSpacing: '0.08em',
                }}>
                    ✦ Time for a meaningful break
                </p>
            )}
        </div>
    );
}

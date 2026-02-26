import React from 'react';

interface CircularTimerProps {
    progress: number;
    radius?: number;
    isBreak?: boolean;
    running?: boolean;
}

export function CircularTimer({
    progress,
    radius = 140,
    isBreak = false,
    running = false,
}: CircularTimerProps) {
    const circumference = 2 * Math.PI * radius;
    const dash = circumference * (1 - progress);

    return (
        <svg
            width={radius * 2 + 40}
            height={radius * 2 + 40}
            style={{ overflow: 'visible' }}
        >
            {/* glow */}
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <filter id="soft-glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            {/* track */}
            <circle
                cx={radius + 20}
                cy={radius + 20}
                r={radius}
                fill="none"
                stroke="#1e1c18"
                strokeWidth="2"
            />
            {/* tick marks */}
            {Array.from({ length: 60 }).map((_, i) => {
                const angle = (i / 60) * 360 - 90;
                const rad = (angle * Math.PI) / 180;
                const inner = radius - (i % 5 === 0 ? 10 : 5);
                const outer = radius;
                const cx = radius + 20;
                const cy = radius + 20;
                return (
                    <line
                        key={i}
                        x1={Number((cx + inner * Math.cos(rad)).toFixed(4))}
                        y1={Number((cy + inner * Math.sin(rad)).toFixed(4))}
                        x2={Number((cx + outer * Math.cos(rad)).toFixed(4))}
                        y2={Number((cy + outer * Math.sin(rad)).toFixed(4))}
                        stroke={i % 5 === 0 ? '#2e2b25' : '#1e1c18'}
                        strokeWidth={i % 5 === 0 ? 1.5 : 0.8}
                    />
                );
            })}
            {/* progress arc */}
            <circle
                cx={radius + 20}
                cy={radius + 20}
                r={radius}
                fill="none"
                stroke={isBreak ? '#6a9a6a' : '#c8843a'}
                strokeWidth="2.5"
                strokeDasharray={circumference.toFixed(4)}
                strokeDashoffset={dash.toFixed(4)}
                strokeLinecap="round"
                transform={`rotate(-90 ${radius + 20} ${radius + 20})`}
                style={{
                    transition: 'stroke-dashoffset 0.5s ease',
                    filter: running ? 'url(#soft-glow)' : 'none',
                }}
            />
            {/* pulse dot */}
            {running && (
                <circle
                    cx={Number(
                        (radius +
                            20 +
                            radius * Math.cos(((progress * 360 - 90) * Math.PI) / 180)).toFixed(4)
                    )}
                    cy={Number(
                        (radius +
                            20 +
                            radius * Math.sin(((progress * 360 - 90) * Math.PI) / 180)).toFixed(4)
                    )}
                    r="5"
                    fill={isBreak ? '#6a9a6a' : '#c8843a'}
                    filter="url(#glow)"
                    style={{ animation: 'pulse-ring 2s ease-in-out infinite' }}
                />
            )}
        </svg>
    );
}

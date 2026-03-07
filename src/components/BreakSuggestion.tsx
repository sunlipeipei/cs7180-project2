'use client';

export const BREAK_SUGGESTIONS = [
    'Drink a full glass of water',
    'Step outside for 2 minutes',
    'Roll your shoulders back 10 times',
    'Look 20 feet away for 20 seconds',
    'Take 5 slow, deep breaths',
    'Stand up and stretch your spine',
];

export function randomSuggestion(): string {
    return BREAK_SUGGESTIONS[Math.floor(Math.random() * BREAK_SUGGESTIONS.length)];
}

interface BreakSuggestionProps {
    suggestion: string;
    onDismiss: () => void;
    onRefresh: () => void;
}

export function BreakSuggestion({ suggestion, onDismiss, onRefresh }: BreakSuggestionProps) {
    return (
        <div style={{
            background: 'var(--surface)',
            border: '1px solid #2e3a2e',
            borderRadius: 8,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            animation: 'slide-up 0.4s ease',
            width: '100%',
            maxWidth: 360,
        }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🌿</span>
            <span style={{
                fontFamily: 'var(--sans)',
                fontSize: 13,
                color: '#9ab09a',
                letterSpacing: '0.02em',
                flex: 1,
            }}>
                {suggestion}
            </span>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                    onClick={onRefresh}
                    title="Another suggestion"
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--mono)', fontSize: 11,
                        color: '#6a7a6a', letterSpacing: '0.08em',
                        padding: '2px 4px', transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#9ab09a')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#6a7a6a')}
                    aria-label="Another suggestion"
                >
                    ↺
                </button>
                <button
                    onClick={onDismiss}
                    title="Dismiss"
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--mono)', fontSize: 11,
                        color: '#6a7a6a', letterSpacing: '0.08em',
                        padding: '2px 4px', transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#9ab09a')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#6a7a6a')}
                    aria-label="Dismiss"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}

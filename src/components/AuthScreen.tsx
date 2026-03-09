'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthScreen({ onAuth, onBack }: { onAuth?: (user: { email: string; name: string }) => void, onBack?: () => void }) {
    const router = useRouter();
    const { login } = useAuth();
    const [tab, setTab] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setError('');
        if (!email || !password) { setError('Please fill in all fields.'); return; }
        if (tab === 'signup' && !name) { setError('Please enter your name.'); return; }
        setLoading(true);

        const endpoint = tab === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register';
        const body = tab === 'login' ? { email, password } : { email, password, name };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            setLoading(false);

            if (res.ok) {
                const data = await res.json();
                if (data.user) {
                    login(data.user);
                }

                if (onAuth) {
                    onAuth({ email, name: name || email.split('@')[0] });
                } else {
                    router.push('/');
                }
            } else {
                const data = await res.json();
                setError(data.error?.message || data.error || 'Authentication failed.');
            }
        } catch (err: unknown) {
            setLoading(false);
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        }
    };

    const inputStyle = {
        width: '100%', padding: '11px 14px',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 6, outline: 'none',
        fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--text)',
        letterSpacing: '0.02em',
        transition: 'border-color 0.2s',
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(ellipse 70% 60% at 50% 30%, #1a1710 0%, var(--bg) 70%)',
            padding: 24, animation: 'fade-in 0.5s ease',
        }}>
            {/* wordmark */}
            <div style={{ marginBottom: 48, textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--amber)', boxShadow: '0 0 12px var(--amber)' }} />
                    <span style={{ fontFamily: 'var(--serif)', fontSize: 28, fontStyle: 'italic', color: 'var(--text)' }}>DeepWork</span>
                </div>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                    Focus, logged.
                </p>
            </div>

            {/* card */}
            <div style={{
                width: '100%', maxWidth: 360,
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '32px 28px',
            }}>
                {/* tab switcher */}
                <div style={{
                    display: 'flex', gap: 2, marginBottom: 28,
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 6, padding: 3,
                }}>
                    {(['login', 'signup'] as const).map(t => (
                        <button key={t} onClick={() => { setTab(t); setError(''); }} style={{
                            flex: 1, padding: '7px', borderRadius: 4, border: 'none', cursor: 'pointer',
                            fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
                            background: tab === t ? 'var(--amber)' : 'transparent',
                            color: tab === t ? '#1a1208' : 'var(--text-muted)',
                            transition: 'all 0.2s',
                        }}>{t}</button>
                    ))}
                </div>

                {/* fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {tab === 'signup' && (
                        <input
                            placeholder="Your name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            style={inputStyle}
                            onFocus={e => (e.currentTarget.style.borderColor = 'var(--amber-dim)')}
                            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                        />
                    )}
                    <input
                        type="email" placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={inputStyle}
                        onFocus={e => (e.currentTarget.style.borderColor = 'var(--amber-dim)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                    />
                    <input
                        type="password" placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        style={inputStyle}
                        onFocus={e => (e.currentTarget.style.borderColor = 'var(--amber-dim)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                    />
                </div>

                {/* error */}
                {error && (
                    <p style={{ marginTop: 10, fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--red)', letterSpacing: '0.02em' }}>
                        {error}
                    </p>
                )}

                {/* submit */}
                <button onClick={handleSubmit} disabled={loading} style={{
                    width: '100%', marginTop: 20, padding: '12px',
                    background: loading ? 'var(--amber-dim)' : 'var(--amber)',
                    border: 'none', borderRadius: 6, cursor: loading ? 'default' : 'pointer',
                    fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.14em',
                    color: '#1a1208', transition: 'background 0.2s',
                }}>
                    {loading ? '…' : tab === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                </button>
            </div>

            <p style={{ marginTop: 24, fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                Session history syncs across devices via JWT.
            </p>
            {onBack && (
                <button
                    onClick={onBack}
                    style={{
                        marginTop: 16, background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)',
                        letterSpacing: '0.1em', textDecoration: 'underline',
                        transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                    Continue without signing in →
                </button>
            )}
        </div>
    );
}

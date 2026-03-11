'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthScreen({ onAuth, onBack }: { onAuth?: (user: { email: string; name: string }) => void, onBack?: () => void }) {
    const router = useRouter();
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



    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_70%_60%_at_50%_30%,#1a1710_0%,var(--color-bg)_70%)] animate-[fade-in_0.5s_ease]">
            {/* wordmark */}
            <div className="mb-12 text-center">
                <div className="flex items-center justify-center gap-2.5 mb-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber shadow-[0_0_12px_var(--color-amber)]" />
                    <span className="font-serif text-2xl italic text-text">DeepWork</span>
                </div>
                <p className="font-sans text-xs text-text-muted tracking-[0.16em] uppercase">
                    Focus, logged.
                </p>
            </div>

            {/* card */}
            <div className="w-full max-w-[360px] bg-bg2/80 backdrop-blur-md border border-border rounded-xl p-7 shadow-2xl">
                {/* tab switcher */}
                <div className="flex gap-0.5 mb-7 bg-surface border border-border rounded-md p-[3px]">
                    {(['login', 'signup'] as const).map(t => (
                        <button key={t} onClick={() => { setTab(t); setError(''); }} className={`flex-1 p-[7px] rounded text-center border-none cursor-pointer font-mono text-[11px] tracking-[0.12em] uppercase transition-all duration-200 ${tab === t ? 'bg-amber text-[#1a1208]' : 'bg-transparent text-text-muted hover:text-text-dim'}`}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* fields */}
                <div className="flex flex-col gap-3">
                    {tab === 'signup' && (
                        <input
                            placeholder="Your name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            onFocus={e => (e.currentTarget.style.borderColor = 'var(--amber-dim)')}
                            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                            className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-md outline-none font-mono text-sm text-text tracking-[0.02em] transition-colors duration-200 focus:border-amber-dim placeholder:text-text-muted hover:border-border/80"
                        />
                    )}
                    <input
                        type="email" placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={e => (e.currentTarget.style.borderColor = 'var(--amber-dim)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                        className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-md outline-none font-mono text-sm text-text tracking-[0.02em] transition-colors duration-200 focus:border-amber-dim placeholder:text-text-muted hover:border-border/80"
                    />
                    <input
                        type="password" placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        onFocus={e => (e.currentTarget.style.borderColor = 'var(--amber-dim)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                        className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-md outline-none font-mono text-sm text-text tracking-[0.02em] transition-colors duration-200 focus:border-amber-dim placeholder:text-text-muted hover:border-border/80"
                    />
                </div>

                {/* error */}
                {error && (
                    <p className="mt-2.5 font-sans text-xs text-red tracking-[0.02em] animate-[fade-in_0.2s_ease]">
                        {error}
                    </p>
                )}

                {/* submit */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`w-full mt-5 p-3 rounded-md border-none font-mono text-xs tracking-[0.14em] transition-all duration-200 ${loading ? 'bg-amber-dim text-[#1a1208] cursor-default' : 'bg-amber text-[#1a1208] cursor-pointer hover:bg-amber/90 active:scale-[0.98]'}`}
                >
                    {loading ? '…' : tab === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                </button>
            </div>

            <p className="mt-6 font-sans text-[11px] text-text-muted tracking-[0.06em]">
                Session history syncs across devices via JWT.
            </p>
            {onBack && (
                <button
                    onClick={onBack}
                    className="mt-4 bg-transparent border-none cursor-pointer font-mono text-[11px] text-text-muted tracking-[0.1em] underline transition-colors duration-200 hover:text-text-dim"
                >
                    Continue without signing in →
                </button>
            )}
        </div>
    );
}

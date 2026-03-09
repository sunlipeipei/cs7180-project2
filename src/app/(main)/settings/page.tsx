'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { user, loading, updateSettings } = useAuth();
    const router = useRouter();

    const [formState, setFormState] = useState({
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        dailyFocusThreshold: 100,
    });

    // Track saving state to display saving indicator
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth');
        } else if (user?.settings) {
            setFormState(user.settings);
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return <div className="p-8 text-center text-textLighter animate-pulse">Loading settings...</div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0;
        setFormState((prev) => ({
            ...prev,
            [e.target.name]: value,
        }));
        setSaved(false);
        setError('');
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            await updateSettings(formState);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch {
            setError('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-6">
            <div className="mb-8">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="mb-6 text-sm text-textLighter hover:text-text transition-colors flex items-center gap-2 group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span>
                    Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold mb-2">Settings</h1>
                <p className="text-textLighter">Customize your focus routines and break requirements.</p>
            </div>

            <div className="space-y-8 bg-bgElevated rounded-2xl p-8 border border-border/50 shadow-sm">

                {/* Durations Section */}
                <div className="space-y-6 border-b border-border/50 pb-8">
                    <h2 className="text-xl font-semibold">Durations (Minutes)</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-textLighter">Focus Time</label>
                            <input
                                type="number"
                                name="workDuration"
                                value={formState.workDuration || ''}
                                onChange={handleChange}
                                min={1}
                                className="w-full bg-bg border border-border rounded-lg px-4 py-2 focus:ring-1 focus:ring-amber focus:border-amber outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-textLighter">Short Break</label>
                            <input
                                type="number"
                                name="shortBreakDuration"
                                value={formState.shortBreakDuration || ''}
                                onChange={handleChange}
                                min={1}
                                className="w-full bg-bg border border-border rounded-lg px-4 py-2 focus:ring-1 focus:ring-amber focus:border-amber outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-textLighter">Long Break</label>
                            <input
                                type="number"
                                name="longBreakDuration"
                                value={formState.longBreakDuration || ''}
                                onChange={handleChange}
                                min={1}
                                className="w-full bg-bg border border-border rounded-lg px-4 py-2 focus:ring-1 focus:ring-amber focus:border-amber outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Goals Section */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Daily Goals</h2>
                    <div className="space-y-2 max-w-[240px]">
                        <label className="block text-sm font-medium text-textLighter">Focus Threshold (Minutes)</label>
                        <p className="text-xs text-textLighter mb-2">Triggers your long break suggestion.</p>
                        <input
                            type="number"
                            name="dailyFocusThreshold"
                            value={formState.dailyFocusThreshold || ''}
                            onChange={handleChange}
                            min={1}
                            className="w-full bg-bg border border-border rounded-lg px-4 py-2 focus:ring-1 focus:ring-amber focus:border-amber outline-none transition-all"
                        />
                    </div>
                </div>

                {error && <p className="text-sm font-medium text-red-500 mt-4">{error}</p>}

                {/* Actions */}
                <div className="pt-6 flex items-center justify-end gap-4 border-t border-border/50">
                    {saved && <span className="text-sm text-green-500 font-medium">Saved successfully</span>}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 bg-amber text-bg rounded-lg font-medium shadow-md shadow-amber/20 hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

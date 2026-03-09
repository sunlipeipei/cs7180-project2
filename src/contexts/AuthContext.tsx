'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface UserSettings {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    dailyFocusThreshold: number;
}

export interface User {
    id: string;
    email: string;
    name?: string;
    settings: UserSettings;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (user: User) => void;
    logout: () => void;
    updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Fetch user context on initial load
        fetch('/api/v1/auth/me')
            .then(res => {
                if (res.ok) {
                    return res.json();
                }
                throw new Error('Not authenticated');
            })
            .then(data => {
                setUser(data.data);
                setLoading(false);
            })
            .catch(() => {
                setUser(null);
                setLoading(false);
            });
    }, []);

    const login = (newUser: User) => {
        setUser(newUser);
    };

    const logout = async () => {
        await fetch('/api/v1/auth/logout', { method: 'POST' });
        setUser(null);
        router.push('/auth');
    };

    const updateSettings = async (newSettings: Partial<UserSettings>) => {
        if (!user) return;

        // Optimistic UI update
        const originalUser = { ...user };
        setUser({
            ...user,
            settings: { ...user.settings, ...newSettings }
        });

        try {
            const res = await fetch('/api/v1/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings),
            });

            if (!res.ok) {
                // Revert on failure
                setUser(originalUser);
                throw new Error('Failed to save settings');
            }

            // Sync confirmed state from server response
            const data = await res.json();
            if (data.user) {
                setUser(prev => prev ? { ...prev, settings: data.user.settings } : prev);
            }
        } catch (error) {
            setUser(originalUser);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateSettings }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

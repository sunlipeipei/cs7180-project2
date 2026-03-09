import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Setup Next Router Mock
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        back: vi.fn(),
    }),
}));

import { AuthProvider } from '@/contexts/AuthContext';

describe('Settings UI Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        global.fetch = vi.fn().mockImplementation(async (url) => {
            if (url === '/api/v1/auth/me') {
                return {
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({
                        data: {
                            id: 'user1',
                            email: 'test@example.com',
                            settings: {
                                workDuration: 25,
                                shortBreakDuration: 5,
                                longBreakDuration: 15,
                                dailyFocusThreshold: 100
                            }
                        }
                    })
                };
            }
            if (url === '/api/v1/settings') {
                return {
                    ok: true,
                    json: () => Promise.resolve({
                        user: { settings: { workDuration: 45, shortBreakDuration: 5, longBreakDuration: 15, dailyFocusThreshold: 100 } }
                    })
                };
            }
            return { ok: false };
        });
    });

    it('renders the Settings layout with current settings populated into fields', async () => {
        const { default: SettingsPage } = await import('@/app/(main)/settings/page');

        render(
            <AuthProvider>
                <SettingsPage />
            </AuthProvider>
        );

        // Awaits the UI state rendering the form after loading
        await waitFor(() => {
            expect(screen.getByText('Settings')).toBeInTheDocument();
        });

        // The default values should exist from the mock fetch
        expect(screen.getByDisplayValue('25')).toBeInTheDocument(); // Focus Time
        expect(screen.getByDisplayValue('5')).toBeInTheDocument(); // Short Break
        expect(screen.getByDisplayValue('15')).toBeInTheDocument(); // Long Break
        expect(screen.getByDisplayValue('100')).toBeInTheDocument(); // Daily Threshold
    });

    it('allows typing new settings values and saving fires a PATCH request', async () => {
        const { default: SettingsPage } = await import('@/app/(main)/settings/page');

        render(
            <AuthProvider>
                <SettingsPage />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Settings')).toBeInTheDocument();
        });

        const focusInput = screen.getByDisplayValue('25');

        // Simulate change
        fireEvent.change(focusInput, { target: { value: '45', name: 'workDuration' } });

        // Save
        const saveBtn = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveBtn);

        await waitFor(() => {
            // Check that it's called with /api/v1/settings
            const fetchCalls = vi.mocked(global.fetch).mock.calls;
            const settingsCall = fetchCalls.find(call => call[0] === '/api/v1/settings');

            expect(settingsCall).toBeDefined();
            expect(settingsCall[1].method).toBe('PATCH');
        });
    });
});


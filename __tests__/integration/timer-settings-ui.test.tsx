import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
import { TimerWidget } from '@/components/TimerWidget';

// Mock timer hooks so we can isolate the component UI
vi.mock('@/hooks/useTimer', () => {
    return {
        useTimer: () => {
            return {
                mode: 'focus',
                running: false,
                secondsLeft: 1500,
                progress: 0,
                toggleTimer: vi.fn(),
                resetTimer: vi.fn(),
                toggleFocusBreak: vi.fn(),
            };
        }
    };
});

describe('TimerWidget Settings UI', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        global.fetch = vi.fn().mockImplementation((url: string) => {
            if (url === '/api/v1/auth/me') {
                return Promise.resolve(new Response(JSON.stringify({ data: { email: 'test@example.com', settings: { workDuration: 45, shortBreakDuration: 10, longBreakDuration: 20, dailyFocusThreshold: 100 } } }), {
                    status: 200, headers: { 'Content-Type': 'application/json' },
                }));
            }
            if (url === '/api/v1/tags') {
                return Promise.resolve(new Response(JSON.stringify({ tags: [] }), {
                    status: 200, headers: { 'Content-Type': 'application/json' },
                }));
            }
            return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
        });
    });

    it('should open and close the settings modal', async () => {
        await act(async () => {
            render(<TimerWidget />);
        });

        // Wait for initial load to finish
        await waitFor(() => {
            expect(screen.queryByText('DeepWork')).not.toHaveClass('animate-pulse');
        });

        // Click settings button
        const settingsBtn = screen.getByText('Settings');
        fireEvent.click(settingsBtn);

        // Modal should appear
        expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);
        expect(screen.getByText('Work Duration')).toBeInTheDocument();

        // Close using the SAVE button
        const saveBtn = screen.getByText(/SAVE/);
        fireEvent.click(saveBtn);

        // Modal should disappear (we wait for it to be removed, but since it's conditional rendering, checking query is enough)
        await waitFor(() => {
            expect(screen.queryByText('Work Duration')).not.toBeInTheDocument();
        });
    });

    it('should allow changing the timer settings', async () => {
        await act(async () => {
            render(<TimerWidget />);
        });

        await waitFor(() => {
            expect(screen.queryByText('DeepWork')).not.toHaveClass('animate-pulse');
        });

        const settingsBtn = screen.getByText('Settings');
        fireEvent.click(settingsBtn);

        // Find the range inputs
        const sliders = screen.getAllByRole('slider') as HTMLInputElement[];
        expect(sliders.length).toBe(4); // Work, Short Break, Long Break, Focus Threshold

        // Change Work Duration (first slider)
        fireEvent.change(sliders[0], { target: { value: '50' } });

        // Change Short Break (second slider)
        fireEvent.change(sliders[1], { target: { value: '15' } });

        // Change Long Break (third slider)
        fireEvent.change(sliders[2], { target: { value: '30' } });

        // Change Focus Threshold (fourth slider)
        fireEvent.change(sliders[3], { target: { value: '150' } });

        // Ensure the mock functions triggered state changes visually
        expect(screen.getByText('50 min')).toBeInTheDocument();
        expect(screen.getByText('15 min')).toBeInTheDocument();
        expect(screen.getByText('30 min')).toBeInTheDocument();
        expect(screen.getByText('150 min')).toBeInTheDocument();

        // Click outside the modal to close it
        const overlay = document.querySelector('.bg-black\\/80');
        if (overlay) {
            fireEvent.click(overlay);
        }

        await waitFor(() => {
            expect(screen.queryByText('Work Duration')).not.toBeInTheDocument();
        });
    });

    it('should call SAVE settings api correctly', async () => {
        await act(async () => {
            render(<TimerWidget />);
        });

        await waitFor(() => {
            expect(screen.queryByText('DeepWork')).not.toHaveClass('animate-pulse');
        });

        const settingsBtn = screen.getByText('Settings');
        fireEvent.click(settingsBtn);

        const sliders = screen.getAllByRole('slider') as HTMLInputElement[];
        fireEvent.change(sliders[0], { target: { value: '55' } });

        const saveBtn = screen.getByText(/SAVE/);
        await act(async () => {
            fireEvent.click(saveBtn);
        });

        expect(global.fetch).toHaveBeenCalledWith('/api/v1/settings', expect.objectContaining({
            method: 'PATCH',
            body: expect.stringContaining('"workDuration":55')
        }));
    });

    it('should handle Sign Out properly', async () => {
        await act(async () => {
            render(<TimerWidget />);
        });

        await waitFor(() => {
            expect(screen.getByText('SIGN OUT')).toBeInTheDocument();
        });

        const signOutBtn = screen.getByText('SIGN OUT');
        await act(async () => {
            fireEvent.click(signOutBtn);
        });

        expect(global.fetch).toHaveBeenCalledWith('/api/v1/auth/logout', expect.objectContaining({
            method: 'POST'
        }));
    });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import { TimerWidget } from '@/components/TimerWidget';

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

// Mock timer hooks so we can easily trigger session end and focus toggle
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let globalFinishFn: any = null;

vi.mock('@/hooks/useTimer', () => {
    let internalMode = 'focus';
    const internalRunning = false;

    return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useTimer: (settings: any, accMinutes: number, onSessionEnd: any) => {
            // ALWAYS update to the latest closure provided by the component render
            globalFinishFn = onSessionEnd;
            return {
                mode: internalMode,
                running: internalRunning,
                secondsLeft: 1500,
                progress: 0,
                toggleTimer: vi.fn(),
                resetTimer: vi.fn(),
                toggleFocusBreak: vi.fn(),
                // Test helper to allow manual trigger
                __triggerEnd: () => globalFinishFn && globalFinishFn(internalMode),
                __setMode: (m: string) => { internalMode = m; }
            };
        }
    };
});

describe('TimerWidget Tag Autocomplete UI', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        global.fetch = vi.fn().mockImplementation((url: string) => {
            if (url === '/api/v1/auth/me') {
                return Promise.resolve(new Response(JSON.stringify({ data: { email: 'test@example.com' } }), {
                    status: 200, headers: { 'Content-Type': 'application/json' },
                }));
            }
            if (url === '/api/v1/tags') {
                return Promise.resolve(new Response(JSON.stringify({ tags: [] }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                }));
            }
            return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
        });
    });

    it('should fetch tags on mount', async () => {
        await act(async () => { render(<TimerWidget />); });

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/v1/tags');
        });
    });

    it('should render a tag input when in focus mode', async () => {
        await act(async () => { render(<TimerWidget />); });

        await waitFor(() => {
            expect(screen.queryByText('DeepWork')).not.toHaveClass('animate-pulse');
        });

        expect(screen.getByPlaceholderText(/tag this session/i)).toBeInTheDocument();
    });

    it('should allow user to type a new tag', async () => {
        await act(async () => { render(<TimerWidget />); });

        await waitFor(() => {
            expect(screen.queryByText('DeepWork')).not.toHaveClass('animate-pulse');
        });

        const input = screen.getByPlaceholderText(/tag this session/i) as HTMLInputElement;
        await act(async () => { fireEvent.change(input, { target: { value: 'Coding - Auth' } }); });

        expect(input.value).toBe('Coding - Auth');
    });

    it('should display autocomplete suggestions based on fetch', async () => {
        global.fetch = vi.fn().mockImplementation((url: string) => {
            if (url === '/api/v1/auth/me') {
                return Promise.resolve(new Response(JSON.stringify({ data: { email: 'test@example.com' } }), {
                    status: 200, headers: { 'Content-Type': 'application/json' },
                }));
            }
            if (url === '/api/v1/tags') {
                return Promise.resolve(new Response(JSON.stringify({
                    tags: [
                        { _id: 'Coding', count: 5 },
                        { _id: 'Reading', count: 2 }
                    ]
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                }));
            }
            return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
        });

        await act(async () => { render(<TimerWidget />); });

        await waitFor(() => {
            expect(screen.queryByText('DeepWork')).not.toHaveClass('animate-pulse');
        });

        const input = screen.getByPlaceholderText(/tag this session/i);
        // Focus the input to show dropdown
        await act(async () => { fireEvent.focus(input); });

        await waitFor(() => {
            expect(screen.getByText('Coding')).toBeInTheDocument();
            expect(screen.getByText('Reading')).toBeInTheDocument();
        });
    });

    it('should update input when autocomplete suggestion is clicked', async () => {
        global.fetch = vi.fn().mockImplementation((url: string) => {
            if (url === '/api/v1/auth/me') {
                return Promise.resolve(new Response(JSON.stringify({ data: { email: 'test@example.com' } }), {
                    status: 200, headers: { 'Content-Type': 'application/json' },
                }));
            }
            if (url === '/api/v1/tags') {
                return Promise.resolve(new Response(JSON.stringify({
                    tags: [{ _id: 'Code Review', count: 10 }]
                }), { status: 200 }));
            }
            return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
        });

        await act(async () => { render(<TimerWidget />); });

        await waitFor(() => {
            expect(screen.queryByText('DeepWork')).not.toHaveClass('animate-pulse');
        });

        const input = screen.getByPlaceholderText(/tag this session/i) as HTMLInputElement;
        await act(async () => { fireEvent.focus(input); });

        await waitFor(() => {
            expect(screen.getByText('Code Review')).toBeInTheDocument();
        });

        await act(async () => { fireEvent.click(screen.getByText('Code Review')); });

        expect(input.value).toBe('Code Review');
    });

    it('should POST session with tag when session ends', async () => {
        await act(async () => { render(<TimerWidget />); });

        // Let mount fetch resolve
        await waitFor(() => {
            expect(screen.queryByText('DeepWork')).not.toHaveClass('animate-pulse');
        });

        // Set tag
        const input = screen.getByPlaceholderText(/tag this session/i);
        await act(async () => { fireEvent.change(input, { target: { value: 'Deep Work Session' } }); });

        // Mock fetch for POST
        global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ session: {} }), { status: 201 }));

        // Fire the session end explicitly using the global finish fn stored by the mock
        if (globalFinishFn) {
            await act(async () => { globalFinishFn('focus'); });
        }

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/v1/sessions', expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('Deep Work Session')
            }));
        });
    });
});

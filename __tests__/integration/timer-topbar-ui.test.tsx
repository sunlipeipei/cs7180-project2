import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';

vi.mock('@/contexts/AuthContext', () => ({
    useAuth: vi.fn(),
}));
import { useAuth } from '@/contexts/AuthContext';

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        refresh: mockRefresh,
    }),
}));

describe('TimerWidget Top Bar UI (Guest vs Auth)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPush.mockClear();
        mockRefresh.mockClear();
    });

    it('renders a guest top bar when unauthenticated', async () => {
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            loading: false,
            updateSettings: vi.fn(),
            logout: vi.fn(),
        });

        // Mock fetch for /tags
        global.fetch = vi.fn().mockImplementation((url) => {
            if (url === '/api/v1/auth/me') {
                return Promise.resolve(new Response(null, { status: 401 }));
            }
            return Promise.resolve(new Response(JSON.stringify({ tags: [] }), { status: 200 }));
        });

        const { TimerWidget } = await import('@/components/TimerWidget');
        render(<TimerWidget />);

        await waitFor(() => {
            expect(screen.getByText('DeepWork')).toBeInTheDocument();
        });

        // The top bar should have "DeepWork", "History", "Settings" but no avatar or sign out
        expect(screen.getByText('DeepWork')).toBeInTheDocument();
        expect(screen.getByText('History')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();

        expect(screen.queryByText('SIGN OUT')).not.toBeInTheDocument();

        // Clicking History when logged out should redirect to /auth
        fireEvent.click(screen.getByText('History'));
        expect(mockPush).toHaveBeenCalledWith('/auth');
    });

    it('renders an authenticated top bar when logged in', async () => {
        vi.mocked(useAuth).mockReturnValue({
            user: { email: 'test@example.com', name: 'Test' },
            loading: false,
            updateSettings: vi.fn(),
            logout: vi.fn(),
        });

        // Mock fetch for tags
        global.fetch = vi.fn().mockImplementation((url) => {
            if (url === '/api/v1/auth/me') {
                return Promise.resolve(new Response(JSON.stringify({ data: { email: 'test@example.com', name: 'Test' } }), { status: 200 }));
            }
            return Promise.resolve(new Response(JSON.stringify({ tags: [] }), { status: 200 }));
        });

        const { TimerWidget } = await import('@/components/TimerWidget');
        render(<TimerWidget />);

        await waitFor(() => {
            expect(screen.getByText('SIGN OUT')).toBeInTheDocument();
        });

        // Clicking History when logged in should go to /dashboard
        fireEvent.click(screen.getByText('History'));
        expect(mockPush).toHaveBeenCalledWith('/dashboard');

        // Avatar should contain 'T' (first letter of test@example.com)
        expect(screen.getByText('T')).toBeInTheDocument();
    });

    it('handles sign out correctly', async () => {
        const mockLogout = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useAuth).mockReturnValue({
            user: { email: 'test@example.com', name: 'Test' },
            loading: false,
            updateSettings: vi.fn(),
            logout: mockLogout,
        });

        global.fetch = vi.fn().mockImplementation((url, init) => {
            if (url === '/api/v1/auth/me') {
                return Promise.resolve(new Response(JSON.stringify({ data: { email: 'test@example.com', name: 'Test' } }), { status: 200 }));
            }
            if (url === '/api/v1/auth/logout' && init?.method === 'POST') {
                return Promise.resolve(new Response(null, { status: 200 }));
            }
            return Promise.resolve(new Response(JSON.stringify({ tags: [] }), { status: 200 }));
        });

        const { TimerWidget } = await import('@/components/TimerWidget');
        render(<TimerWidget />);

        await waitFor(() => {
            expect(screen.getByText('SIGN OUT')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('SIGN OUT'));

        // Should call the context logout fn
        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalled();
        });
    });
});

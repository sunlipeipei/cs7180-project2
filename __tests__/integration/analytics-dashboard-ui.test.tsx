import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const mockAnalyticsData = {
    todayStats: { minutes: 75, sessionCount: 2, avgMinutes: 37 },
    last7Days: [
        { date: '2026-03-01', label: 'Sun', minutes: 60 },
        { date: '2026-03-02', label: 'Mon', minutes: 45 },
        { date: '2026-03-03', label: 'Tue', minutes: 0 },
        { date: '2026-03-04', label: 'Wed', minutes: 90 },
        { date: '2026-03-05', label: 'Thu', minutes: 30 },
        { date: '2026-03-06', label: 'Fri', minutes: 0 },
        { date: '2026-03-07', label: 'Sat', minutes: 75 },
    ],
    byTag: [
        { tag: 'Coding', minutes: 120 },
        { tag: 'Writing', minutes: 45 },
    ],
    recentSessions: [
        { _id: 'a1', tag: 'Coding', duration: 2700, mode: 'focus', createdAt: '2026-03-07T10:00:00Z' },
        { _id: 'a2', tag: 'Writing', duration: 1800, mode: 'focus', createdAt: '2026-03-07T08:00:00Z' },
    ],
};

describe('DashboardPage', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn((url: string) => {
            if (url === '/api/v1/auth/me') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ data: { id: 'user1', email: 'test@example.com' } }),
                });
            }
            if (url === '/api/v1/analytics') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ data: mockAnalyticsData }),
                });
            }
            return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
        }));
    });

    it('renders the Focus History heading', async () => {
        const { default: DashboardPage } = await import('@/app/dashboard/page');
        render(<DashboardPage />);
        await waitFor(() => expect(screen.getByText('Focus History')).toBeInTheDocument());
    });

    it('renders the 3 stat cards with correct values', async () => {
        const { default: DashboardPage } = await import('@/app/dashboard/page');
        render(<DashboardPage />);
        await waitFor(() => {
            expect(screen.getByText("Today's Focus")).toBeInTheDocument();
            expect(screen.getByText('1h 15m')).toBeInTheDocument(); // 75 min
            expect(screen.getByText('Sessions')).toBeInTheDocument();
            expect(screen.getByText('2')).toBeInTheDocument();
            expect(screen.getByText('Avg Session')).toBeInTheDocument();
            expect(screen.getByText('37m')).toBeInTheDocument();
        });
    });

    it('renders the session log entries', async () => {
        const { default: DashboardPage } = await import('@/app/dashboard/page');
        render(<DashboardPage />);
        await waitFor(() => {
            expect(screen.getByText('Session Log')).toBeInTheDocument();
            // Tags appear in both "Time by Project" and "Session Log" sections
            expect(screen.getAllByText('Coding').length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText('Writing').length).toBeGreaterThanOrEqual(1);
        });
    });

    it('renders the Time by Project section with tags', async () => {
        const { default: DashboardPage } = await import('@/app/dashboard/page');
        render(<DashboardPage />);
        await waitFor(() => {
            expect(screen.getByText('Time by Project')).toBeInTheDocument();
        });
    });

    it('renders the Last 7 Days section', async () => {
        const { default: DashboardPage } = await import('@/app/dashboard/page');
        render(<DashboardPage />);
        await waitFor(() => {
            expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
        });
    });
});

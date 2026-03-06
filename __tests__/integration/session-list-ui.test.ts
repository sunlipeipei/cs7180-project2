import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })),
    redirect: vi.fn(),
}));

type Session = { _id: string; duration: number; mode: string; createdAt: string };

function makeSessions(count: number, offset = 0): Session[] {
    return Array.from({ length: count }, (_, i) => ({
        _id: `session-${offset + i}`,
        duration: 1500 + (offset + i) * 100,
        mode: 'focus',
        createdAt: new Date().toISOString(),
    }));
}

function mockFetch(data: Session[], pagination: object) {
    global.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data, pagination }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        }),
    );
}

describe('SessionList component', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should render a list of sessions returned by the API', async () => {
        const sessions = makeSessions(3);
        mockFetch(sessions, { page: 1, limit: 20, total: 3, totalPages: 1 });

        const { default: SessionList } = await import(/* @vite-ignore */ '@/components/SessionList');
        render(React.createElement(SessionList));

        await waitFor(() => {
            expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(3);
        });
    });

    it('should display duration and mode for each session', async () => {
        const sessions = makeSessions(2);
        mockFetch(sessions, { page: 1, limit: 20, total: 2, totalPages: 1 });

        const { default: SessionList } = await import(/* @vite-ignore */ '@/components/SessionList');
        render(React.createElement(SessionList));

        await waitFor(() => {
            expect(screen.getByText(/1500/)).toBeInTheDocument();
            expect(screen.getByText(/1600/)).toBeInTheDocument();
            expect(screen.getAllByText(/focus/i).length).toBeGreaterThanOrEqual(2);
        });
    });

    it('should show empty state message when no sessions exist', async () => {
        mockFetch([], { page: 1, limit: 20, total: 0, totalPages: 0 });

        const { default: SessionList } = await import(/* @vite-ignore */ '@/components/SessionList');
        render(React.createElement(SessionList));

        await waitFor(() => {
            expect(screen.getByText(/no sessions/i)).toBeInTheDocument();
        });
    });

    it('should show a Next page button that is disabled when no more pages', async () => {
        const sessions = makeSessions(2);
        mockFetch(sessions, { page: 1, limit: 20, total: 2, totalPages: 1 });

        const { default: SessionList } = await import(/* @vite-ignore */ '@/components/SessionList');
        render(React.createElement(SessionList));

        await waitFor(() => {
            const nextBtn = screen.getByRole('button', { name: /next/i });
            expect(nextBtn).toBeDisabled();
        });
    });

    it('should show a Previous button disabled on the first page', async () => {
        const sessions = makeSessions(3);
        mockFetch(sessions, { page: 1, limit: 2, total: 3, totalPages: 2 });

        const { default: SessionList } = await import(/* @vite-ignore */ '@/components/SessionList');
        render(React.createElement(SessionList));

        await waitFor(() => {
            const prevBtn = screen.getByRole('button', { name: /prev/i });
            expect(prevBtn).toBeDisabled();
        });
    });

    it('should fetch next page when Next button is clicked', async () => {
        const page1Sessions = makeSessions(2, 0);
        const page2Sessions = makeSessions(1, 2);

        const fetchMock = vi.fn()
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({ data: page1Sessions, pagination: { page: 1, limit: 2, total: 3, totalPages: 2 } }),
                    { status: 200, headers: { 'Content-Type': 'application/json' } },
                ),
            )
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({ data: page2Sessions, pagination: { page: 2, limit: 2, total: 3, totalPages: 2 } }),
                    { status: 200, headers: { 'Content-Type': 'application/json' } },
                ),
            );
        global.fetch = fetchMock;

        const { default: SessionList } = await import(/* @vite-ignore */ '@/components/SessionList');
        render(React.createElement(SessionList));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
        });

        fireEvent.click(screen.getByRole('button', { name: /next/i }));

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledTimes(2);
            const secondCall = fetchMock.mock.calls[1][0] as string;
            expect(secondCall).toContain('page=2');
        });
    });
});

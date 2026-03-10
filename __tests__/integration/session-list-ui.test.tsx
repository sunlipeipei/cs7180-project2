import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import SessionList from '@/components/SessionList';

describe('SessionList UI', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should render loading state initially', async () => {
        global.fetch = vi.fn().mockImplementation(() => new Promise(() => { })); // Never resolves to keep loading state

        render(<SessionList />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render error state if fetch fails', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        render(<SessionList />);

        await waitFor(() => {
            expect(screen.getByText('Failed to load sessions.')).toBeInTheDocument();
        });
    });

    it('should render "No sessions" if data is empty', async () => {
        global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [], pagination: {} })));

        render(<SessionList />);

        await waitFor(() => {
            expect(screen.getByText('No sessions')).toBeInTheDocument();
        });
    });

    it('should handle pagination interaction', async () => {
        // Mock fetch to track calls
        const mockFetch = vi.fn().mockImplementation((url: string) => {
            if (url.includes('page=1')) {
                return Promise.resolve(new Response(JSON.stringify({
                    data: [{ _id: '1', duration: 1500, mode: 'focus' }],
                    pagination: { page: 1, limit: 20, totalPages: 2 }
                })));
            } else if (url.includes('page=2')) {
                return Promise.resolve(new Response(JSON.stringify({
                    data: [{ _id: '2', duration: 600, mode: 'shortBreak' }],
                    pagination: { page: 2, limit: 20, totalPages: 2 }
                })));
            }
        });
        global.fetch = mockFetch;

        render(<SessionList />);

        // Wait for first page to load
        await waitFor(() => {
            expect(screen.getByText('1500 — focus')).toBeInTheDocument();
        });

        // Click next
        fireEvent.click(screen.getByText('Next'));

        // Wait for second page to load
        await waitFor(() => {
            expect(screen.getByText('600 — shortBreak')).toBeInTheDocument();
        });

        // Click prev
        fireEvent.click(screen.getByText('Previous'));

        // Wait for first page again
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith('/api/v1/sessions?page=1&limit=20');
        });
    });

    it('should handle fetch resolving with !res.ok', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false });

        render(<SessionList />);

        await waitFor(() => {
            expect(screen.getByText('Failed to load sessions.')).toBeInTheDocument();
        });
    });

});

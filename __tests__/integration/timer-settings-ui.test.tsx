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
        global.fetch = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ tags: [] }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }),
        );
    });

    it('should open and close the settings modal', async () => {
        await act(async () => {
            render(<TimerWidget />);
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
});

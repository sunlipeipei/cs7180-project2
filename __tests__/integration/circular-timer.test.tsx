import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { CircularTimer } from '@/components/CircularTimer';

describe('CircularTimer UI', () => {
    it('renders correctly in default state', () => {
        const { container } = render(<CircularTimer progress={0} />);
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();

        // Progress arc should have stroke for 'focus' (not break)
        const progressArc = container.querySelectorAll('circle')[1];
        expect(progressArc).toHaveAttribute('stroke', '#c8843a');

        // Pulse dot should NOT be present when not running
        const circles = container.querySelectorAll('circle');
        expect(circles.length).toBe(2); // Track + Arc
    });

    it('renders correctly when running and in focus mode', () => {
        const { container } = render(<CircularTimer progress={0.5} running={true} />);

        // Pulse dot SHOULD be present
        const circles = container.querySelectorAll('circle');
        expect(circles.length).toBe(3); // Track + Arc + Dot

        const pulseDot = circles[2];
        expect(pulseDot).toHaveAttribute('fill', '#c8843a');
    });

    it('renders correctly when running and in break mode', () => {
        const { container } = render(<CircularTimer progress={0.5} running={true} isBreak={true} />);

        const progressArc = container.querySelectorAll('circle')[1];
        expect(progressArc).toHaveAttribute('stroke', '#6a9a6a');

        const circles = container.querySelectorAll('circle');
        expect(circles.length).toBe(3);

        const pulseDot = circles[2];
        expect(pulseDot).toHaveAttribute('fill', '#6a9a6a');
    });
});

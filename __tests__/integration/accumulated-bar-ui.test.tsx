import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { AccumulatedBar } from '@/components/AccumulatedBar';

describe('AccumulatedBar', () => {
    it('renders the accumulated focus label and time string', () => {
        render(<AccumulatedBar minutes={45} threshold={100} />);
        expect(screen.getByText('Accumulated Focus')).toBeInTheDocument();
        expect(screen.getByText('45m / 1h 40m')).toBeInTheDocument();
    });

    it('does not show the completion message when below threshold', () => {
        render(<AccumulatedBar minutes={50} threshold={100} />);
        expect(screen.queryByText(/Time for a meaningful break/)).not.toBeInTheDocument();
    });

    it('shows the completion message when at threshold', () => {
        render(<AccumulatedBar minutes={100} threshold={100} />);
        expect(screen.getByText(/Time for a meaningful break/)).toBeInTheDocument();
    });

    it('shows the completion message when above threshold', () => {
        render(<AccumulatedBar minutes={120} threshold={100} />);
        expect(screen.getByText(/Time for a meaningful break/)).toBeInTheDocument();
    });

    it('renders correctly at 0 minutes', () => {
        render(<AccumulatedBar minutes={0} threshold={100} />);
        expect(screen.getByText('0m / 1h 40m')).toBeInTheDocument();
        expect(screen.queryByText(/Time for a meaningful break/)).not.toBeInTheDocument();
    });

    it('formats hours correctly', () => {
        render(<AccumulatedBar minutes={75} threshold={100} />);
        expect(screen.getByText('1h 15m / 1h 40m')).toBeInTheDocument();
    });
});

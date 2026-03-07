import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BreakSuggestion, BREAK_SUGGESTIONS, randomSuggestion } from '@/components/BreakSuggestion';

describe('BreakSuggestion', () => {
    it('renders the suggestion text and plant emoji', () => {
        render(
            <BreakSuggestion
                suggestion="Drink a full glass of water"
                onDismiss={vi.fn()}
                onRefresh={vi.fn()}
            />
        );
        expect(screen.getByText('🌿')).toBeInTheDocument();
        expect(screen.getByText('Drink a full glass of water')).toBeInTheDocument();
    });

    it('calls onDismiss when the dismiss button is clicked', () => {
        const onDismiss = vi.fn();
        render(
            <BreakSuggestion
                suggestion="Take 5 slow, deep breaths"
                onDismiss={onDismiss}
                onRefresh={vi.fn()}
            />
        );
        fireEvent.click(screen.getByLabelText('Dismiss'));
        expect(onDismiss).toHaveBeenCalledOnce();
    });

    it('calls onRefresh when the refresh button is clicked', () => {
        const onRefresh = vi.fn();
        render(
            <BreakSuggestion
                suggestion="Stand up and stretch your spine"
                onDismiss={vi.fn()}
                onRefresh={onRefresh}
            />
        );
        fireEvent.click(screen.getByLabelText('Another suggestion'));
        expect(onRefresh).toHaveBeenCalledOnce();
    });

    it('renders all 6 known suggestions without error', () => {
        BREAK_SUGGESTIONS.forEach(s => {
            const { unmount } = render(
                <BreakSuggestion suggestion={s} onDismiss={vi.fn()} onRefresh={vi.fn()} />
            );
            expect(screen.getByText(s)).toBeInTheDocument();
            unmount();
        });
    });

    it('randomSuggestion returns a value from the BREAK_SUGGESTIONS list', () => {
        const suggestion = randomSuggestion();
        expect(BREAK_SUGGESTIONS).toContain(suggestion);
    });
});

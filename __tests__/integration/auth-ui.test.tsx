import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

describe('AuthUI (AuthScreen Component)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the unified AuthScreen with Login defaults', async () => {
        const { default: AuthScreen } = await import('@/components/AuthScreen');
        // @ts-ignore
        render(<AuthScreen onAuth={vi.fn()} onBack={vi.fn()} />);

        expect(screen.getByText('DeepWork')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByText('SIGN IN')).toBeInTheDocument();
    });

    it('should switch between Login and Signup tabs', async () => {
        const { default: AuthScreen } = await import('@/components/AuthScreen');
        // @ts-ignore
        render(<AuthScreen onAuth={vi.fn()} onBack={vi.fn()} />);

        // Switch to Signup
        fireEvent.click(screen.getByText('signup'));

        expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
        expect(screen.getByText('CREATE ACCOUNT')).toBeInTheDocument();

        // Switch back to Login
        fireEvent.click(screen.getByText('login'));
        expect(screen.queryByPlaceholderText('Your name')).not.toBeInTheDocument();
    });

    it('should show the escape hatch when onBack prop is given', async () => {
        const { default: AuthScreen } = await import('@/components/AuthScreen');
        const mockOnBack = vi.fn();
        // @ts-ignore
        render(<AuthScreen onAuth={vi.fn()} onBack={mockOnBack} />);

        const btn = screen.getByText('Continue without signing in →');
        expect(btn).toBeInTheDocument();

        fireEvent.click(btn);
        expect(mockOnBack).toHaveBeenCalled();
    });

    it('should NOT show the escape hatch when no onBack prop is given', async () => {
        const { default: AuthScreen } = await import('@/components/AuthScreen');
        // @ts-ignore
        render(<AuthScreen onAuth={vi.fn()} />);

        expect(screen.queryByText('Continue without signing in →')).not.toBeInTheDocument();
    });

    it('should display error if trying to submit empty form', async () => {
        const { default: AuthScreen } = await import('@/components/AuthScreen');
        // @ts-ignore
        render(<AuthScreen onAuth={vi.fn()} onBack={vi.fn()} />);

        fireEvent.click(screen.getByText('SIGN IN'));
        expect(screen.getByText('Please fill in all fields.')).toBeInTheDocument();
    });

    it('should change input styles on focus and blur', async () => {
        const { default: AuthScreen } = await import(/* @vite-ignore */ '@/components/AuthScreen');
        // @ts-ignore
        render(React.createElement(AuthScreen, { onAuth: vi.fn(), onBack: vi.fn() }));

        const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;

        fireEvent.focus(emailInput);
        expect(emailInput.style.borderColor).toBe('var(--amber-dim)');

        fireEvent.blur(emailInput);
        expect(emailInput.style.borderColor).toBe('var(--border)');
    });

    it('should submit on pressing Enter in password field', async () => {
        global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

        const { default: AuthScreen } = await import(/* @vite-ignore */ '@/components/AuthScreen');
        // @ts-ignore
        render(React.createElement(AuthScreen, { onAuth: vi.fn(), onBack: vi.fn() }));

        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'user@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass123' } });

        fireEvent.keyDown(screen.getByPlaceholderText('Password'), { key: 'Enter', code: 'Enter' });

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/v1/auth/login', expect.any(Object));
        });
    });

    it('should redirect via router.push when onBack is not given and escape hatch would exist', async () => {
        // This verifies the router.push('/') path upon successful login (no onAuth redirect)
        global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

        const { default: AuthScreen } = await import(/* @vite-ignore */ '@/components/AuthScreen');
        // no onAuth prop — will call router.push('/')
        render(React.createElement(AuthScreen));

        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'user@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass123' } });
        fireEvent.click(screen.getByText('SIGN IN'));

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/');
        });
    });
});

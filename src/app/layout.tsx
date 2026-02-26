import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'DeepWork',
    description: 'A flexible, non-coercive Pomodoro timer.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="antialiased font-sans bg-bg text-text selection:bg-amber selection:text-bg">
                {children}
            </body>
        </html>
    );
}

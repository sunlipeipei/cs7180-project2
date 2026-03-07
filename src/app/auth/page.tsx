'use client';
import { useRouter } from 'next/navigation';
import AuthScreen from '@/components/AuthScreen';

export default function AuthPage() {
    const router = useRouter();
    return (
        <main className="min-h-screen bg-bg">
            <AuthScreen onBack={() => router.push('/')} />
        </main>
    );
}

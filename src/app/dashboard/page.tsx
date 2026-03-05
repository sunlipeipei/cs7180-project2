'use client';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
    useEffect(() => {
        fetch('/api/v1/auth/me')
            .then(res => {
                if (!res.ok) redirect('/auth/login');
            })
            .catch(() => redirect('/auth/login'));
    }, []);

    return <div>Dashboard</div>;
}

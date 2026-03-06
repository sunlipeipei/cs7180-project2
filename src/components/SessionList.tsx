'use client';
import { useState, useEffect } from 'react';

type Session = { _id: string; duration: number; mode: string; createdAt: string };
type Pagination = { page: number; limit: number; total: number; totalPages: number };

export default function SessionList() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError(false);
        fetch(`/api/v1/sessions?page=${page}&limit=20`)
            .then(res => {
                if (!res.ok) throw new Error('fetch failed');
                return res.json();
            })
            .then(body => {
                setSessions(body.data ?? []);
                setPagination(body.pagination);
            })
            .catch(() => {
                setError(true);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [page]);

    return (
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>Failed to load sessions.</p>
            ) : sessions.length === 0 ? (
                <p>No sessions</p>
            ) : (
                <ul>
                    {sessions.map(s => (
                        <li key={s._id}>
                            {s.duration} — {s.mode}
                        </li>
                    ))}
                </ul>
            )}
            <div>
                <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
                    Previous
                </button>
                <button onClick={() => setPage(p => p + 1)} disabled={pagination.totalPages === 0 || page >= pagination.totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
}

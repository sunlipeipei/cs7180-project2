'use client';
import { useState, useEffect } from 'react';

type Session = { _id: string; duration: number; mode: string; createdAt: string };
type Pagination = { page: number; limit: number; total: number; totalPages: number };

export default function SessionList() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetch(`/api/v1/sessions?page=${page}&limit=20`)
            .then(res => res.json())
            .then(body => {
                setSessions(body.data ?? []);
                setPagination(body.pagination);
            });
    }, [page]);

    return (
        <div>
            {sessions.length === 0 ? (
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

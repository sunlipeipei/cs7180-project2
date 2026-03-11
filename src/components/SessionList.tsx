'use client';
import { useState, useEffect, useReducer } from 'react';

type Session = { _id: string; duration: number; mode: string; createdAt: string };
type Pagination = { page: number; limit: number; total: number; totalPages: number };

type State = { sessions: Session[]; pagination: Pagination; loading: boolean; error: boolean };
type Action =
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; sessions: Session[]; pagination: Pagination }
    | { type: 'FETCH_ERROR' };

const initialState: State = {
    sessions: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    loading: true,
    error: false,
};

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'FETCH_START': return { ...state, loading: true, error: false };
        case 'FETCH_SUCCESS': return { ...state, loading: false, sessions: action.sessions, pagination: action.pagination };
        case 'FETCH_ERROR': return { ...state, loading: false, error: true };
    }
}

export default function SessionList() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { sessions, pagination, loading, error } = state;
    const [page, setPage] = useState(1);

    useEffect(() => {
        dispatch({ type: 'FETCH_START' });
        fetch(`/api/v1/sessions?page=${page}&limit=20`)
            .then(res => {
                if (!res.ok) throw new Error('fetch failed');
                return res.json();
            })
            .then(body => {
                dispatch({ type: 'FETCH_SUCCESS', sessions: body.data ?? [], pagination: body.pagination });
            })
            .catch(() => {
                dispatch({ type: 'FETCH_ERROR' });
            });
    }, [page]);

    return (
        <div className="w-full">
            {loading ? (
                <p className="font-mono text-xs text-text-dim tracking-widest text-center py-4">Loading...</p>
            ) : error ? (
                <p className="font-sans text-sm text-red text-center py-4">Failed to load sessions.</p>
            ) : sessions.length === 0 ? (
                <p className="font-sans text-sm text-text-muted text-center py-4 tracking-[0.04em]">No sessions</p>
            ) : (
                <ul className="flex flex-col gap-1 p-0 m-0 list-none">
                    {sessions.map(s => (
                        <li key={s._id} className="flex justify-between items-center py-3 border-b border-border animate-[fade-in_0.25s_ease]">
                            <span className="sr-only">{s.duration} — {s.mode}</span>
                            <span className="font-sans text-[13px] text-text capitalize" aria-hidden="true">{s.mode.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className="font-mono text-[13px] text-amber" aria-hidden="true">{Math.round(s.duration / 60)} min</span>
                        </li>
                    ))}
                </ul>
            )}

            {pagination.page && (
                <div className="flex items-center justify-between mt-5">
                    <button
                        onClick={() => setPage(p => p - 1)}
                        disabled={page <= 1}
                        className="px-4 py-1.5 rounded border border-border bg-transparent font-mono text-[11px] tracking-[0.1em] text-text-dim hover:text-text hover:border-amber disabled:opacity-40 disabled:hover:border-border disabled:cursor-not-allowed transition-all"
                    >
                        <span className="sr-only">Previous</span>
                        <span aria-hidden="true">← prev</span>
                    </button>
                    <span className="font-mono text-[10px] text-text-muted tracking-widest">
                        {page} / {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={pagination.totalPages === 0 || page >= pagination.totalPages}
                        className="px-4 py-1.5 rounded border border-border bg-transparent font-mono text-[11px] tracking-[0.1em] text-text-dim hover:text-text hover:border-amber disabled:opacity-40 disabled:hover:border-border disabled:cursor-not-allowed transition-all"
                    >
                        <span className="sr-only">Next</span>
                        <span aria-hidden="true">next →</span>
                    </button>
                </div>
            )}
        </div>
    );
}

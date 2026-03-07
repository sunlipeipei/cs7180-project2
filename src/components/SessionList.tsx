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

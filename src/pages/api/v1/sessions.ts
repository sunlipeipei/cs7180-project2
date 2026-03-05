import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyJWT } from '@/lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const token = req.cookies.token;
    if (!token || !verifyJWT(token)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(200).json({ sessions: [] });
}

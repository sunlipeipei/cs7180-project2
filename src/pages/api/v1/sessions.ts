import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyJWT } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Session from '@/lib/models/Session';

const VALID_MODES = ['focus', 'shortBreak', 'longBreak'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = req.cookies.token;
    const payload = token ? verifyJWT(token) as { sub?: string } | null : null;
    if (!payload?.sub) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    await dbConnect();

    if (req.method === 'GET') {
        const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20));
        const skip = (page - 1) * limit;

        const total = await Session.countDocuments({ userId: payload.sub });
        const totalPages = Math.ceil(total / limit);
        const data = await Session.find({ userId: payload.sub })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return res.status(200).json({
            data,
            pagination: { page, limit, total, totalPages },
        });
    }

    if (req.method === 'POST') {
        const { duration, mode, tag } = req.body || {};

        if (typeof duration !== 'number' || duration <= 0) {
            return res.status(400).json({ error: 'duration must be a positive number' });
        }
        if (!VALID_MODES.includes(mode)) {
            return res.status(400).json({ error: `mode must be one of: ${VALID_MODES.join(', ')}` });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sessionPayload: any = { userId: payload.sub, duration, mode };
        if (typeof tag === 'string' && tag.trim() !== '') {
            sessionPayload.tag = tag.trim().substring(0, 50);
        }

        const session = await Session.create(sessionPayload);
        return res.status(201).json({ session });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

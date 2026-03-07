import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Session from '@/lib/models/Session';
import { verifyJWT } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: { code: 405, message: 'Method not allowed' } });
    }

    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ error: { code: 401, message: 'Not authenticated' } });
    }

    const payload = verifyJWT(token) as { sub?: string } | null;
    if (!payload?.sub) {
        return res.status(401).json({ error: { code: 401, message: 'Invalid token' } });
    }

    await dbConnect();

    // Start of today in UTC
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const result = await Session.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(payload.sub),
                mode: 'focus',
                createdAt: { $gte: startOfDay },
            },
        },
        {
            $group: {
                _id: null,
                totalSeconds: { $sum: '$duration' },
            },
        },
    ]);

    const totalSeconds = result[0]?.totalSeconds ?? 0;
    const minutes = Math.round(totalSeconds / 60);

    return res.status(200).json({
        data: { minutes },
    });
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyJWT } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Session from '@/lib/models/Session';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = req.cookies.token;
    const payload = token ? verifyJWT(token) as { sub?: string } | null : null;
    if (!payload?.sub) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    await dbConnect();

    if (req.method === 'GET') {
        // Use an aggregation pipeline to find all non-empty tags for this user,
        // grouped by tag name and sorted by descending frequency.
        const tags = await Session.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(payload.sub),
                    tag: { $exists: true, $ne: '', $type: 'string' }
                }
            },
            {
                $group: {
                    _id: '$tag',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        return res.status(200).json({ tags });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

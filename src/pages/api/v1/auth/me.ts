import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { verifyJWT } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const payload = verifyJWT(token) as { sub?: string } | null;
    if (!payload?.sub) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    await dbConnect();

    const user = await User.findById(payload.sub).lean() as { _id: { toString(): string }; email: string; name?: string; settings?: Record<string, number> } | null;
    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }

    return res.status(200).json({
        data: {
            id: user._id.toString(),
            email: user.email,
            name: user.name ?? user.email.split('@')[0],
            settings: user.settings ?? {
                workDuration: 25,
                shortBreakDuration: 5,
                longBreakDuration: 15,
                dailyFocusThreshold: 100,
            },
        },
    });
}

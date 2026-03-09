
import type { NextApiRequest, NextApiResponse } from 'next';
import { updateUserSettings } from '@/lib/services/settings';
import { verifyJWT } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PATCH') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const payload = verifyJWT(token) as { sub?: string } | null;
        if (!payload?.sub) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        const userId = payload.sub;

        const updates = req.body || {};

        // Perform validation
        const allowedKeys = ['workDuration', 'shortBreakDuration', 'longBreakDuration', 'dailyFocusThreshold'];
        const validUpdates: Record<string, number> = {};

        for (const key of Object.keys(updates)) {
            if (!allowedKeys.includes(key)) {
                return res.status(400).json({ error: `Invalid setting key: ${key}` });
            }

            const val = updates[key];
            if (typeof val !== 'number' || val <= 0) {
                return res.status(400).json({ error: `${key} must be a positive number` });
            }
            validUpdates[key] = val;
        }

        const updatedUser = await updateUserSettings(userId, validUpdates);

        return res.status(200).json({ user: updatedUser });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === 'User not found') {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}


import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyJWT } from '@/lib/auth';
import { updateUserSettings } from '@/lib/services/settings';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PATCH') {
        return res.status(405).json({ error: { code: 405, message: 'Method not allowed' } });
    }

    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: { code: 401, message: 'Unauthorized' } });

    const payload = verifyJWT(token) as { sub?: string } | null;
    if (!payload?.sub) return res.status(401).json({ error: { code: 401, message: 'Unauthorized' } });
    const userId = payload.sub;

    try {
        const body = req.body;
        if (!body || typeof body !== 'object') {
            return res.status(400).json({ error: { code: 400, message: 'Invalid settings payload' } });
        }

        const validUpdates: Record<string, number> = {};
        const allowedKeys = ['workDuration', 'shortBreakDuration', 'longBreakDuration', 'dailyFocusThreshold'];

        for (const key of allowedKeys) {
            if (key in body && typeof body[key] === 'number') {
                validUpdates[key] = body[key];
            }
        }

        // Only update if there's actually something to validate
        if (Object.keys(validUpdates).length === 0) {
            return res.status(400).json({ error: { code: 400, message: 'No valid setting fields provided' } });
        }

        const updatedSettings = await updateUserSettings(userId, validUpdates);

        return res.status(200).json({ data: updatedSettings });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === 'User not found') {
            return res.status(404).json({ error: { code: 404, message: 'User not found' } });
        }
        return res.status(500).json({ error: { code: 500, message: 'Internal server error' } });
    }
}

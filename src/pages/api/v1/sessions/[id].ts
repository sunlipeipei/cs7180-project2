import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Session from '@/lib/models/Session';
import { verifyJWT } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PATCH') {
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

    const { id } = req.query;
    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: { code: 400, message: 'Invalid session ID' } });
    }

    const { tag } = req.body ?? {};
    if (typeof tag !== 'string') {
        return res.status(400).json({ error: { code: 400, message: 'tag must be a string' } });
    }

    await dbConnect();

    const session = await Session.findOneAndUpdate(
        { _id: id, userId: payload.sub },
        { tag: tag.trim().substring(0, 50) || undefined },
        { new: true, lean: true }
    );

    if (!session) {
        return res.status(404).json({ error: { code: 404, message: 'Session not found' } });
    }

    return res.status(200).json({ data: session });
}

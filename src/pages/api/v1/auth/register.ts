import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { hashPassword } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password, name } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    await dbConnect();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
        return res.status(409).json({ error: 'Email already exists' });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({ email: email.toLowerCase(), passwordHash, name: name || undefined });

    return res.status(201).json({
        message: 'User created',
        user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name ?? user.email.split('@')[0],
            settings: user.settings,
        }
    });
}

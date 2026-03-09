import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { verifyPassword, signJWT } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password } = req.body || {};

    await dbConnect();

    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signJWT({ sub: user._id.toString() });
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; SameSite=Strict; Path=/`);
    return res.status(200).json({
        message: 'Logged in',
        user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name ?? user.email.split('@')[0],
            settings: user.settings,
        }
    });
}

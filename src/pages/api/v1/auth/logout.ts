import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        // Clear the token cookie by setting Max-Age to 0
        res.setHeader(
            'Set-Cookie',
            `token=; HttpOnly; Path=/; Max-Age=0; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''} SameSite=Strict`
        );
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

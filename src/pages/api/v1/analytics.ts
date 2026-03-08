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

    const userId = new mongoose.Types.ObjectId(payload.sub);

    // Rolling 24-hour window for "today" stats (avoids UTC midnight timezone issues)
    const startOfToday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Start of 7 days ago (UTC calendar days for the chart)
    const startOf7DaysUTC = new Date();
    startOf7DaysUTC.setUTCHours(0, 0, 0, 0);
    startOf7DaysUTC.setUTCDate(startOf7DaysUTC.getUTCDate() - 6);
    const startOf7Days = startOf7DaysUTC;

    const [todayResult, weekResult, tagResult, recentResult] = await Promise.all([
        // 1. Today's focus stats
        Session.aggregate([
            { $match: { userId, mode: 'focus', createdAt: { $gte: startOfToday } } },
            {
                $group: {
                    _id: null,
                    totalSeconds: { $sum: '$duration' },
                    sessionCount: { $sum: 1 },
                },
            },
        ]),

        // 2. Last 7 days — daily focus totals + session count
        Session.aggregate([
            { $match: { userId, mode: 'focus', createdAt: { $gte: startOf7Days } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' },
                    },
                    totalSeconds: { $sum: '$duration' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]),

        // 3. Time by tag — include untagged sessions as 'Untitled', all time, top 10
        Session.aggregate([
            { $match: { userId, mode: 'focus' } },
            {
                $group: {
                    _id: { $ifNull: ['$tag', 'Untitled'] },
                    totalSeconds: { $sum: '$duration' },
                },
            },
            { $match: { _id: { $ne: '' } } },
            { $sort: { totalSeconds: -1 } },
            { $limit: 10 },
        ]),

        // 4. Recent focus sessions (last 200 — enough for 7-day client-side filtering)
        Session.find({ userId, mode: 'focus' })
            .sort({ createdAt: -1 })
            .limit(200)
            .lean(),
    ]);

    // Build today stats
    const rawToday = todayResult[0] ?? { totalSeconds: 0, sessionCount: 0 };
    const todayMinutes = Math.round(rawToday.totalSeconds / 60);
    const todayStats = {
        minutes: todayMinutes,
        sessionCount: rawToday.sessionCount,
        avgMinutes: rawToday.sessionCount > 0
            ? Math.round(todayMinutes / rawToday.sessionCount)
            : 0,
    };

    // Build 7-day array — fill missing days with 0
    const weekMap = new Map(weekResult.map((d: { _id: string; totalSeconds: number; count: number }) => [d._id, { seconds: d.totalSeconds, count: d.count }]));
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(startOf7Days);
        d.setUTCDate(d.getUTCDate() + i);
        const dateStr = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
        const entry = weekMap.get(dateStr);
        return {
            date: dateStr,
            label,
            minutes: Math.round(((entry?.seconds ?? 0) as number) / 60),
            count: (entry?.count ?? 0) as number,
        };
    });

    // Build by-tag array
    const byTag = tagResult.map((t: { _id: string; totalSeconds: number }) => ({
        tag: t._id,
        minutes: Math.round(t.totalSeconds / 60),
    }));

    return res.status(200).json({
        data: { todayStats, last7Days, byTag, recentSessions: recentResult },
    });
}

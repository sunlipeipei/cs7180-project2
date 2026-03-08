import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import { getTestServer } from './server';
import { Server } from 'http';
import mongoose from 'mongoose';

describe('GET /api/v1/analytics', () => {
    let server: Server;
    let token: string;
    let userId: string;

    beforeAll(async () => {
        server = await getTestServer();

        await request(server).post('/api/v1/auth/register').send({
            email: 'analytics-test@example.com',
            password: 'Password123!',
            name: 'Analytics Tester',
        });

        const loginRes = await request(server).post('/api/v1/auth/login').send({
            email: 'analytics-test@example.com',
            password: 'Password123!',
        });

        const setCookie = loginRes.headers['set-cookie'];
        token = Array.isArray(setCookie) ? setCookie[0] : String(setCookie);

        const meRes = await request(server).get('/api/v1/auth/me').set('Cookie', token);
        userId = meRes.body.data.id;
    });

    afterAll(async () => {
        if (userId) {
            await mongoose.connection.collection('sessions').deleteMany({
                userId: new mongoose.Types.ObjectId(userId),
            });
            await mongoose.connection.collection('users').deleteOne({
                _id: new mongoose.Types.ObjectId(userId),
            });
        }
        server.close();
    });

    afterEach(async () => {
        if (userId) {
            await mongoose.connection.collection('sessions').deleteMany({
                userId: new mongoose.Types.ObjectId(userId),
            });
        }
    });

    it('returns 401 for unauthenticated requests', async () => {
        const res = await request(server).get('/api/v1/analytics');
        expect(res.status).toBe(401);
    });

    it('returns zeroed stats when no sessions exist', async () => {
        const res = await request(server).get('/api/v1/analytics').set('Cookie', token);
        expect(res.status).toBe(200);
        expect(res.body.data.todayStats.minutes).toBe(0);
        expect(res.body.data.todayStats.sessionCount).toBe(0);
        expect(res.body.data.last7Days).toHaveLength(7);
        expect(res.body.data.byTag).toHaveLength(0);
        expect(res.body.data.recentSessions).toHaveLength(0);
    });

    it('returns correct todayStats after posting focus sessions', async () => {
        // 45 min + 30 min = 75 min, 2 sessions, avg 37 min
        await request(server).post('/api/v1/sessions').set('Cookie', token)
            .send({ duration: 2700, mode: 'focus', tag: 'Coding' });
        await request(server).post('/api/v1/sessions').set('Cookie', token)
            .send({ duration: 1800, mode: 'focus', tag: 'Writing' });

        const res = await request(server).get('/api/v1/analytics').set('Cookie', token);
        expect(res.status).toBe(200);
        expect(res.body.data.todayStats.minutes).toBe(75);
        expect(res.body.data.todayStats.sessionCount).toBe(2);
        expect(res.body.data.todayStats.avgMinutes).toBe(37);
    });

    it('excludes break sessions from byTag but includes untagged focus as Untitled', async () => {
        await request(server).post('/api/v1/sessions').set('Cookie', token)
            .send({ duration: 2700, mode: 'focus', tag: 'Coding' });
        await request(server).post('/api/v1/sessions').set('Cookie', token)
            .send({ duration: 1500, mode: 'focus' }); // untagged
        await request(server).post('/api/v1/sessions').set('Cookie', token)
            .send({ duration: 600, mode: 'shortBreak' });

        const res = await request(server).get('/api/v1/analytics').set('Cookie', token);
        expect(res.body.data.todayStats.minutes).toBe(70); // 45+25, not break
        const tags = res.body.data.byTag.map((t: { tag: string }) => t.tag);
        expect(tags).toContain('Coding');
        expect(tags).toContain('Untitled');
        expect(tags).not.toContain(undefined);
    });

    it('last7Days always returns exactly 7 entries', async () => {
        const res = await request(server).get('/api/v1/analytics').set('Cookie', token);
        expect(res.body.data.last7Days).toHaveLength(7);
        // Each entry has date, label, minutes
        res.body.data.last7Days.forEach((d: { date: string; label: string; minutes: number }) => {
            expect(d).toHaveProperty('date');
            expect(d).toHaveProperty('label');
            expect(d).toHaveProperty('minutes');
            expect(typeof d.minutes).toBe('number');
        });
    });
});

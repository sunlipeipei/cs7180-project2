import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import { getTestServer } from './server';
import { Server } from 'http';
import mongoose from 'mongoose';

describe('GET /api/v1/accumulated', () => {
    let server: Server;
    let token: string;
    let userId: string;

    beforeAll(async () => {
        server = await getTestServer();

        // Register + login a test user
        await request(server).post('/api/v1/auth/register').send({
            email: 'acc-test@example.com',
            password: 'Password123!',
            name: 'Acc Tester',
        });

        const loginRes = await request(server).post('/api/v1/auth/login').send({
            email: 'acc-test@example.com',
            password: 'Password123!',
        });

        const setCookie = loginRes.headers['set-cookie'];
        token = Array.isArray(setCookie) ? setCookie[0] : String(setCookie);

        // Get userId from /auth/me
        const meRes = await request(server).get('/api/v1/auth/me').set('Cookie', token);
        userId = meRes.body.data.id;
    });

    afterAll(async () => {
        // Clean up sessions and user
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
        // Clean up sessions between tests
        if (userId) {
            await mongoose.connection.collection('sessions').deleteMany({
                userId: new mongoose.Types.ObjectId(userId),
            });
        }
    });

    it('returns 401 for unauthenticated request', async () => {
        const res = await request(server).get('/api/v1/accumulated');
        expect(res.status).toBe(401);
    });

    it('returns 0 minutes when no focus sessions today', async () => {
        const res = await request(server)
            .get('/api/v1/accumulated')
            .set('Cookie', token);

        expect(res.status).toBe(200);
        expect(res.body.data.minutes).toBe(0);
    });

    it('returns correct sum of today\'s focus session durations', async () => {
        // POST two focus sessions: 2700s (45 min) + 1800s (30 min) = 75 min
        await request(server)
            .post('/api/v1/sessions')
            .set('Cookie', token)
            .send({ duration: 2700, mode: 'focus', tag: 'Coding' });

        await request(server)
            .post('/api/v1/sessions')
            .set('Cookie', token)
            .send({ duration: 1800, mode: 'focus', tag: 'Writing' });

        const res = await request(server)
            .get('/api/v1/accumulated')
            .set('Cookie', token);

        expect(res.status).toBe(200);
        expect(res.body.data.minutes).toBe(75);
    });

    it('does not count break sessions toward accumulated total', async () => {
        // POST a focus session + a break session
        await request(server)
            .post('/api/v1/sessions')
            .set('Cookie', token)
            .send({ duration: 2700, mode: 'focus' });

        await request(server)
            .post('/api/v1/sessions')
            .set('Cookie', token)
            .send({ duration: 600, mode: 'shortBreak' });

        const res = await request(server)
            .get('/api/v1/accumulated')
            .set('Cookie', token);

        expect(res.status).toBe(200);
        // Only the focus session (45 min) should be counted
        expect(res.body.data.minutes).toBe(45);
    });
});

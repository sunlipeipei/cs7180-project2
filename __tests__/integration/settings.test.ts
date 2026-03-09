import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { getTestServer } from './server';
import { Server } from 'http';
import { signJWT } from '../../src/lib/auth';
import mongoose from 'mongoose';

describe('Settings API', () => {
    let server: Server;
    let jwtCookie: string;

    beforeAll(async () => {
        server = await getTestServer();
    });

    afterAll(() => {
        if (server) {
            server.close();
        }
    });

    beforeEach(async () => {
        // Create user via API
        const credentials = { email: `testsettings_${Date.now()}@example.com`, password: 'Password123!' };
        await request(server).post('/api/v1/auth/register').send(credentials);

        // Login to get the JWT cookie
        const loginRes = await request(server).post('/api/v1/auth/login').send(credentials);
        const cookies = loginRes.headers['set-cookie'];
        jwtCookie = Array.isArray(cookies) ? cookies.join('; ') : String(cookies);
    });

    it('should return 401 when no JWT cookie is present', async () => {
        const response = await request(server)
            .patch('/api/v1/settings')
            .send({ workDuration: 50 });

        expect(response.status).toBe(401);
    });

    it('should return 400 for invalid payload format', async () => {
        const response = await request(server)
            .patch('/api/v1/settings')
            .set('Cookie', jwtCookie)
            .type('json')
            .send('null'); // Invalid body

        expect(response.status).toBe(400);
    });

    it('should return 400 if no valid setting keys provide', async () => {
        const response = await request(server)
            .patch('/api/v1/settings')
            .set('Cookie', jwtCookie)
            .send({ invalidKey: 100, anotherInvalid: 'test' });

        expect(response.status).toBe(400);
    });

    it('should return 200 and update allowed settings fields correctly', async () => {
        const response = await request(server)
            .patch('/api/v1/settings')
            .set('Cookie', jwtCookie)
            .send({
                workDuration: 55,
                dailyFocusThreshold: 150,
                ignoredKey: 123
            });

        expect(response.status).toBe(200);
        expect(response.body.data.workDuration).toBe(55);
        expect(response.body.data.dailyFocusThreshold).toBe(150);

        // Untouched fields remain default (45/10/20...) from register API defaults
        expect(response.body.data.shortBreakDuration).toBe(10);
        expect(response.body.data.longBreakDuration).toBe(20);

        // Verify ignoredKey does not get merged
        expect(response.body.data.ignoredKey).toBeUndefined();
    });

    it('should return 404 if the user does not exist', async () => {
        const fakeToken = signJWT({ sub: new mongoose.Types.ObjectId().toString() });
        const fakeCookie = `token=${fakeToken}; HttpOnly; Path=/`;

        const response = await request(server)
            .patch('/api/v1/settings')
            .set('Cookie', fakeCookie)
            .send({ workDuration: 55 });

        expect(response.status).toBe(404);
        expect(response.body.error.message).toBe('User not found');
    });
});

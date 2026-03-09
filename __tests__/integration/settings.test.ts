import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { getTestServer } from './server';
import { Server } from 'http';
/**
 * Helper: register a user, log in, and return the cookie header string.
 */
async function authAs(server: Server, email: string, password = 'SecurePass123!') {
    await request(server).post('/api/v1/auth/register').send({ email, password });
    const loginRes = await request(server).post('/api/v1/auth/login').send({ email, password });
    const cookies = loginRes.headers['set-cookie'] ?? [];
    return Array.isArray(cookies) ? cookies.join('; ') : String(cookies);
}

describe('Settings API', () => {
    let server: Server;
    let token: string;

    beforeAll(async () => {
        server = await getTestServer();
        token = await authAs(server, 'settings-user@example.com');
    });

    afterAll(() => {
        if (server) server.close();
    });

    describe('PATCH /api/v1/settings', () => {
        it('should return 401 for unauthenticated requests', async () => {
            const res = await request(server)
                .patch('/api/v1/settings')
                .send({ workDuration: 30 });

            expect(res.status).toBe(401);
        });

        it('should return 400 when validating negative or missing durations', async () => {
            const res = await request(server)
                .patch('/api/v1/settings')
                .set('Cookie', token)
                .send({ workDuration: -5 }); // Invalid duration

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
        });

        it('should return 400 when sending unrecognized fields', async () => {
            const res = await request(server)
                .patch('/api/v1/settings')
                .set('Cookie', token)
                .send({ maliciousUpdate: true }); // Invalid structure

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
        });

        it('should return 200 and return the updated user document with embedded settings', async () => {
            const res = await request(server)
                .patch('/api/v1/settings')
                .set('Cookie', token)
                .send({
                    workDuration: 55,
                    shortBreakDuration: 10,
                    longBreakDuration: 20,
                    dailyFocusThreshold: 120
                });

            expect(res.status).toBe(200);
            expect(res.body.user).toBeDefined();
            expect(res.body.user.settings).toBeDefined();
            expect(res.body.user.settings.workDuration).toBe(55);
            expect(res.body.user.settings.shortBreakDuration).toBe(10);
            expect(res.body.user.settings.longBreakDuration).toBe(20);
            expect(res.body.user.settings.dailyFocusThreshold).toBe(120);
        });

        it('should only update the provided fields and preserve existing ones', async () => {
            // Setup base
            await request(server)
                .patch('/api/v1/settings')
                .set('Cookie', token)
                .send({
                    workDuration: 45,
                    shortBreakDuration: 5,
                    longBreakDuration: 15,
                    dailyFocusThreshold: 100
                });

            // Patch a single field
            const res = await request(server)
                .patch('/api/v1/settings')
                .set('Cookie', token)
                .send({ workDuration: 25 });

            expect(res.status).toBe(200);
            expect(res.body.user.settings.workDuration).toBe(25); // Should update
            expect(res.body.user.settings.shortBreakDuration).toBe(5); // Should remain preserved
        });
    });

    describe('GET /api/v1/auth/me dependencies', () => {
        it('should embed user settings within /auth/me payload upon fetching profile', async () => {
            const res = await request(server).get('/api/v1/auth/me').set('Cookie', token);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('settings');

            // Should have defaults if unmodified, but since we modified it above, 
            // the structure is what matters most here.
            expect(res.body.data.settings).toMatchObject({
                workDuration: expect.any(Number),
                shortBreakDuration: expect.any(Number),
                longBreakDuration: expect.any(Number),
                dailyFocusThreshold: expect.any(Number),
            });
        });
    });
});

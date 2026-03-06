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
    const cookies: string[] = loginRes.headers['set-cookie'] ?? [];
    return Array.isArray(cookies) ? cookies.join('; ') : String(cookies);
}

describe('Sessions API', () => {
    let server: Server;

    beforeAll(async () => {
        server = await getTestServer();
    });

    afterAll(() => {
        if (server) server.close();
    });

    // -----------------------------------------------------------------
    // POST /api/v1/sessions
    // -----------------------------------------------------------------

    describe('POST /api/v1/sessions', () => {
        it('should return 201 and persist session when authenticated with valid data', async () => {
            const cookie = await authAs(server, 'sess-create@example.com');

            const res = await request(server)
                .post('/api/v1/sessions')
                .set('Cookie', cookie)
                .send({ duration: 2700, mode: 'focus' });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('session');
            expect(res.body.session).toMatchObject({
                duration: 2700,
                mode: 'focus',
            });
            expect(res.body.session).toHaveProperty('createdAt');
        });

        it('should return 401 when no JWT cookie is present', async () => {
            const res = await request(server)
                .post('/api/v1/sessions')
                .send({ duration: 1500, mode: 'focus' });

            expect(res.status).toBe(401);
        });

        it('should return 400 when duration is missing', async () => {
            const cookie = await authAs(server, 'sess-nodur@example.com');

            const res = await request(server)
                .post('/api/v1/sessions')
                .set('Cookie', cookie)
                .send({ mode: 'focus' });

            expect(res.status).toBe(400);
        });

        it('should return 400 when duration is zero or negative', async () => {
            const cookie = await authAs(server, 'sess-zerodur@example.com');

            const res = await request(server)
                .post('/api/v1/sessions')
                .set('Cookie', cookie)
                .send({ duration: 0, mode: 'focus' });

            expect(res.status).toBe(400);
        });

        it('should return 400 when mode is invalid', async () => {
            const cookie = await authAs(server, 'sess-badmode@example.com');

            const res = await request(server)
                .post('/api/v1/sessions')
                .set('Cookie', cookie)
                .send({ duration: 300, mode: 'invalid' });

            expect(res.status).toBe(400);
        });

        it('should associate session with the authenticated user', async () => {
            const cookie = await authAs(server, 'sess-assoc@example.com');

            await request(server)
                .post('/api/v1/sessions')
                .set('Cookie', cookie)
                .send({ duration: 1500, mode: 'shortBreak' });

            const getRes = await request(server)
                .get('/api/v1/sessions')
                .set('Cookie', cookie);

            expect(getRes.status).toBe(200);
            expect(getRes.body.sessions).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ duration: 1500, mode: 'shortBreak' }),
                ]),
            );
        });
    });

    // -----------------------------------------------------------------
    // GET /api/v1/sessions
    // -----------------------------------------------------------------

    describe('GET /api/v1/sessions', () => {
        it('should return sessions belonging to the authenticated user', async () => {
            const cookie = await authAs(server, 'sess-getmine@example.com');

            await request(server)
                .post('/api/v1/sessions')
                .set('Cookie', cookie)
                .send({ duration: 600, mode: 'longBreak' });

            const res = await request(server)
                .get('/api/v1/sessions')
                .set('Cookie', cookie);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.sessions)).toBe(true);
            expect(res.body.sessions.length).toBeGreaterThanOrEqual(1);

            const session = res.body.sessions[0];
            expect(session).toHaveProperty('duration', 600);
            expect(session).toHaveProperty('mode', 'longBreak');
            expect(session).toHaveProperty('createdAt');
        });

        it('should not return sessions from other users', async () => {
            const cookieA = await authAs(server, 'sess-usera@example.com');
            const cookieB = await authAs(server, 'sess-userb@example.com');

            await request(server)
                .post('/api/v1/sessions')
                .set('Cookie', cookieA)
                .send({ duration: 900, mode: 'focus' });

            await request(server)
                .post('/api/v1/sessions')
                .set('Cookie', cookieB)
                .send({ duration: 300, mode: 'shortBreak' });

            const resB = await request(server)
                .get('/api/v1/sessions')
                .set('Cookie', cookieB);

            expect(resB.status).toBe(200);
            const modes = resB.body.sessions.map((s: { mode: string }) => s.mode);
            expect(modes).not.toContain('focus');
            expect(resB.body.sessions).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ duration: 300, mode: 'shortBreak' }),
                ]),
            );
        });
    });
});

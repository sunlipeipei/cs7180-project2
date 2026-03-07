import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { getTestServer } from './server';
import { Server } from 'http';

describe('Auth Logout API', () => {
    let server: Server;

    beforeAll(async () => {
        server = await getTestServer();
    });

    afterAll(() => {
        if (server) server.close();
    });

    it('POST /api/v1/auth/logout should clear the token cookie', async () => {
        // 1. Create a user and log in to get a token cookie
        await request(server).post('/api/v1/auth/register').send({
            email: 'logout-test@example.com',
            password: 'Password123!',
        });

        const loginRes = await request(server).post('/api/v1/auth/login').send({
            email: 'logout-test@example.com',
            password: 'Password123!',
        });

        const setCookieHeader = loginRes.headers['set-cookie'];
        expect(setCookieHeader).toBeDefined();

        // 2. Call logout
        const logoutRes = await request(server).post('/api/v1/auth/logout');

        expect(logoutRes.status).toBe(200);

        // 3. Check if the Set-Cookie header clears the token (Max-Age=0 or Expires in the past)
        const logoutCookies = logoutRes.headers['set-cookie'];
        expect(logoutCookies).toBeDefined();

        const cookieStr = Array.isArray(logoutCookies) ? logoutCookies.join('; ') : String(logoutCookies);
        expect(cookieStr).toMatch(/token=;/); // token is empty
        expect(cookieStr).toMatch(/Max-Age=0/); // instantly expires
    });
});

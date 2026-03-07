import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { getTestServer } from './server';
import { Server } from 'http';

async function authAs(server: Server, email: string, password = 'SecurePass123!') {
    await request(server).post('/api/v1/auth/register').send({ email, password });
    const loginRes = await request(server).post('/api/v1/auth/login').send({ email, password });
    const cookies: string[] = loginRes.headers['set-cookie'] ?? [];
    return Array.isArray(cookies) ? cookies.join('; ') : String(cookies);
}

async function createSessions(server: Server, cookie: string, count: number) {
    for (let i = 0; i < count; i++) {
        await request(server)
            .post('/api/v1/sessions')
            .set('Cookie', cookie)
            .send({ duration: 1500 + i * 100, mode: 'focus' });
    }
}

describe('GET /api/v1/sessions — pagination', () => {
    let server: Server;

    beforeAll(async () => {
        server = await getTestServer();
    });

    afterAll(() => {
        if (server) server.close();
    });

    it('should return { data, pagination } shape when authenticated', async () => {
        const cookie = await authAs(server, 'pag-shape@example.com');
        await createSessions(server, cookie, 3);

        const res = await request(server)
            .get('/api/v1/sessions')
            .set('Cookie', cookie);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('pagination');
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return total and totalPages in pagination metadata', async () => {
        const cookie = await authAs(server, 'pag-meta@example.com');
        await createSessions(server, cookie, 5);

        const res = await request(server)
            .get('/api/v1/sessions?limit=2')
            .set('Cookie', cookie);

        expect(res.status).toBe(200);
        expect(res.body.pagination).toMatchObject({
            total: 5,
            totalPages: 3,
            page: 1,
            limit: 2,
        });
    });

    it('should limit results to limit per page', async () => {
        const cookie = await authAs(server, 'pag-limit@example.com');
        await createSessions(server, cookie, 10);

        const res = await request(server)
            .get('/api/v1/sessions?limit=4')
            .set('Cookie', cookie);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(4);
    });

    it('should return correct sessions on page 2', async () => {
        const cookie = await authAs(server, 'pag-page2@example.com');
        await createSessions(server, cookie, 5);

        const resPage1 = await request(server)
            .get('/api/v1/sessions?page=1&limit=3')
            .set('Cookie', cookie);

        const resPage2 = await request(server)
            .get('/api/v1/sessions?page=2&limit=3')
            .set('Cookie', cookie);

        expect(resPage2.status).toBe(200);
        expect(resPage2.body.data.length).toBe(2);

        const page1Ids = resPage1.body.data.map((s: { _id: string }) => s._id);
        const page2Ids = resPage2.body.data.map((s: { _id: string }) => s._id);
        const overlap = page1Ids.filter((id: string) => page2Ids.includes(id));
        expect(overlap.length).toBe(0);
    });

    it('should return empty data array when page exceeds total', async () => {
        const cookie = await authAs(server, 'pag-exceed@example.com');
        await createSessions(server, cookie, 2);

        const res = await request(server)
            .get('/api/v1/sessions?page=99&limit=10')
            .set('Cookie', cookie);

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
    });

    it('should use default page=1 and limit=20 when params omitted', async () => {
        const cookie = await authAs(server, 'pag-defaults@example.com');
        await createSessions(server, cookie, 3);

        const res = await request(server)
            .get('/api/v1/sessions')
            .set('Cookie', cookie);

        expect(res.status).toBe(200);
        expect(res.body.pagination).toMatchObject({ page: 1, limit: 20 });
    });

    it('should return 401 for unauthenticated GET with pagination params', async () => {
        const res = await request(server).get('/api/v1/sessions?page=1&limit=5');
        expect(res.status).toBe(401);
    });
});

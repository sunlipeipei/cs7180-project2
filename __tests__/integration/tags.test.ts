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

describe('Tags API (Frequency Tracking)', () => {
    let server: Server;

    beforeAll(async () => {
        server = await getTestServer();
    });

    afterAll(() => {
        if (server) server.close();
    });

    describe('GET /api/v1/tags', () => {
        it('should return 401 when no JWT cookie is present', async () => {
            const res = await request(server).get('/api/v1/tags');
            expect(res.status).toBe(401);
        });

        it('should return aggregated tags sorted by frequency descending', async () => {
            const cookie = await authAs(server, 'tags-freq@example.com');

            // Seed some sessions with tags
            await request(server).post('/api/v1/sessions').set('Cookie', cookie).send({ duration: 1500, mode: 'focus', tag: 'Coding' });
            await request(server).post('/api/v1/sessions').set('Cookie', cookie).send({ duration: 1500, mode: 'focus', tag: 'Coding' });
            await request(server).post('/api/v1/sessions').set('Cookie', cookie).send({ duration: 1500, mode: 'focus', tag: 'Coding' });

            await request(server).post('/api/v1/sessions').set('Cookie', cookie).send({ duration: 1500, mode: 'focus', tag: 'Reading' });
            await request(server).post('/api/v1/sessions').set('Cookie', cookie).send({ duration: 1500, mode: 'focus', tag: 'Reading' });

            await request(server).post('/api/v1/sessions').set('Cookie', cookie).send({ duration: 1500, mode: 'focus', tag: 'Admin' });

            const res = await request(server)
                .get('/api/v1/tags')
                .set('Cookie', cookie);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('tags');

            const tags = res.body.tags;
            expect(tags).toHaveLength(3);

            // Should be sorted by frequency: Coding (3) -> Reading (2) -> Admin (1)
            expect(tags[0]._id).toBe('Coding');
            expect(tags[0].count).toBe(3);

            expect(tags[1]._id).toBe('Reading');
            expect(tags[1].count).toBe(2);

            expect(tags[2]._id).toBe('Admin');
            expect(tags[2].count).toBe(1);
        });

        it('should only return tags belonging to the authenticated user', async () => {
            const cookieA = await authAs(server, 'tags-usera@example.com');
            const cookieB = await authAs(server, 'tags-userb@example.com');

            // User A creates a 'Secret Project' tag
            await request(server).post('/api/v1/sessions').set('Cookie', cookieA).send({ duration: 1500, mode: 'focus', tag: 'Secret Project' });

            // User B gets their tags
            const resB = await request(server).get('/api/v1/tags').set('Cookie', cookieB);

            expect(resB.status).toBe(200);
            const tagIds = resB.body.tags.map((t: { _id: string }) => t._id);
            expect(tagIds).not.toContain('Secret Project');
        });

        it('should ignore sessions without tags in the aggregation', async () => {
            const cookie = await authAs(server, 'tags-null@example.com');

            await request(server).post('/api/v1/sessions').set('Cookie', cookie).send({ duration: 1500, mode: 'focus', tag: 'ValidTag' });
            await request(server).post('/api/v1/sessions').set('Cookie', cookie).send({ duration: 1500, mode: 'focus' }); // Null tag
            await request(server).post('/api/v1/sessions').set('Cookie', cookie).send({ duration: 1500, mode: 'focus', tag: '' }); // Empty tag

            const res = await request(server).get('/api/v1/tags').set('Cookie', cookie);

            expect(res.status).toBe(200);
            const tagIds = res.body.tags.map((t: { _id: string }) => t._id);
            expect(tagIds).toContain('ValidTag');
            expect(tagIds).not.toContain(null);
            expect(tagIds).not.toContain('');
        });
    });
});

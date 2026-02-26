import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { getTestServer } from './server';
import { Server } from 'http';

describe('Health API', () => {
    let server: Server;

    beforeAll(async () => {
        server = await getTestServer();
    });

    afterAll(() => {
        if (server) {
            server.close();
        }
    });

    it('GET /api/v1/health should return 200 OK', async () => {
        const response = await request(server).get('/api/v1/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'ok');
        expect(response.body).toHaveProperty('timestamp');
    });
});

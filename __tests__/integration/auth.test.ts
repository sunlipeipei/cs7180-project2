import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { getTestServer } from './server';
import { Server } from 'http';
import { render, waitFor, act } from '@testing-library/react';
import React from 'react';


// ---------------------------------------------------------------------------
// API Tests
// ---------------------------------------------------------------------------

describe('Auth API', () => {
    let server: Server;

    beforeAll(async () => {
        server = await getTestServer();
    });

    afterAll(() => {
        if (server) {
            server.close();
        }
    });

    // POST /api/v1/auth/register
    describe('POST /api/v1/auth/register', () => {
        it('should return 201 and create user when given valid email and password', async () => {
            const response = await request(server)
                .post('/api/v1/auth/register')
                .send({ email: 'newuser@example.com', password: 'SecurePass123!' });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message');
        });

        it('should return 400 when email is missing', async () => {
            const response = await request(server)
                .post('/api/v1/auth/register')
                .send({ password: 'SecurePass123!' });
            expect(response.status).toBe(400);
        });

        it('should return 400 when password is missing', async () => {
            const response = await request(server)
                .post('/api/v1/auth/register')
                .send({ email: 'nopassword@example.com' });
            expect(response.status).toBe(400);
        });

        it('should return 409 when email already exists', async () => {
            const payload = { email: 'duplicate@example.com', password: 'SecurePass123!' };
            await request(server).post('/api/v1/auth/register').send(payload);
            const response = await request(server)
                .post('/api/v1/auth/register')
                .send(payload);
            expect(response.status).toBe(409);
        });
    });

    // POST /api/v1/auth/login
    describe('POST /api/v1/auth/login', () => {
        it('should return 200 and set HTTP-only JWT cookie when credentials are valid', async () => {
            const credentials = { email: 'loginuser@example.com', password: 'SecurePass123!' };
            await request(server).post('/api/v1/auth/register').send(credentials);
            const response = await request(server)
                .post('/api/v1/auth/login')
                .send(credentials);
            expect(response.status).toBe(200);
            const setCookieHeader = response.headers['set-cookie'];
            expect(setCookieHeader).toBeDefined();
            const cookieStr: string = Array.isArray(setCookieHeader)
                ? setCookieHeader.join('; ')
                : String(setCookieHeader);
            expect(cookieStr).toMatch(/HttpOnly/i);
        });

        it('should return 401 when password is incorrect', async () => {
            await request(server)
                .post('/api/v1/auth/register')
                .send({ email: 'wrongpass@example.com', password: 'CorrectPass123!' });
            const response = await request(server)
                .post('/api/v1/auth/login')
                .send({ email: 'wrongpass@example.com', password: 'WrongPass!' });
            expect(response.status).toBe(401);
        });

        it('should return 401 when email does not exist', async () => {
            const response = await request(server)
                .post('/api/v1/auth/login')
                .send({ email: 'ghost@example.com', password: 'AnyPass123!' });
            expect(response.status).toBe(401);
        });
    });

    // Protected route: GET /api/v1/sessions
    describe('GET /api/v1/sessions (protected)', () => {
        it('should return 401 when no JWT cookie is present', async () => {
            const response = await request(server).get('/api/v1/sessions');
            expect(response.status).toBe(401);
        });

        it('should return 200 when a valid JWT cookie is present', async () => {
            const credentials = { email: 'sessionuser@example.com', password: 'SecurePass123!' };
            await request(server).post('/api/v1/auth/register').send(credentials);
            const loginRes = await request(server)
                .post('/api/v1/auth/login')
                .send(credentials);
            const cookies = loginRes.headers['set-cookie'] ?? [];
            const cookieHeader = Array.isArray(cookies) ? cookies.join('; ') : String(cookies);

            const response = await request(server)
                .get('/api/v1/sessions')
                .set('Cookie', cookieHeader);
            expect(response.status).toBe(200);
        });
    });
});

// ---------------------------------------------------------------------------
// UI Tests
// ---------------------------------------------------------------------------

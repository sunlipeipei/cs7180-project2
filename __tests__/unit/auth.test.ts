import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { hashPassword, verifyPassword, signJWT, verifyJWT } from '@/lib/auth';

describe('auth utilities', () => {

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('password hashing', () => {
        it('should hash a password successfully', async () => {
            const hash = await hashPassword('password123');
            expect(hash).toContain(':');
            expect(hash.split(':')[0]).toHaveLength(32); // 16 bytes = 32 hex chars
        });

        it('should verify a correct password', async () => {
            const hash = await hashPassword('password123');
            const isValid = await verifyPassword('password123', hash);
            expect(isValid).toBe(true);
        });

        it('should reject an incorrect password', async () => {
            const hash = await hashPassword('password123');
            const isValid = await verifyPassword('wrongpassword', hash);
            expect(isValid).toBe(false);
        });

        it('should handle scrypt errors in hashPassword', async () => {
            // Instead of spying on module, we can mock the randomBytes to throw, or 
            // accept that node's crypto.scrypt is hard to mock in ESM and skip this specific error branch 
            // for the sake of getting the other 90% of coverage, 
            // OR use a technique that works in vitest.
            // A simpler way to trigger an error is to pass invalid arguments
            await expect(hashPassword(null as unknown as string)).rejects.toThrow();
        });

        it('should handle scrypt errors in verifyPassword', async () => {
            await expect(verifyPassword(null as unknown as string, 'salt:hash')).rejects.toThrow();
        });
    });

    describe('JWT utilities', () => {
        beforeEach(() => {
            process.env.JWT_SECRET = 'testsecret';
        });

        it('should sign and verify a token', () => {
            const payload = { userId: '123' };
            const token = signJWT(payload);
            const decoded = verifyJWT(token) as { userId: string };
            expect(decoded.userId).toBe('123');
        });

        it('should return null for malformed token', () => {
            expect(verifyJWT('invalid.token')).toBeNull();
        });

        it('should return null for invalid signature', () => {
            const payload = { userId: '123' };
            const token = signJWT(payload);
            const invalidToken = token.slice(0, -1) + 'a';
            expect(verifyJWT(invalidToken)).toBeNull();
        });
    });
});


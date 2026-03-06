import crypto from 'crypto';

function base64url(input: Buffer): string {
    return input.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16).toString('hex');
        crypto.scrypt(password, salt, 64, (err, derived) => {
            if (err) reject(err);
            else resolve(`${salt}:${derived.toString('hex')}`);
        });
    });
}

export function verifyPassword(password: string, stored: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const [salt, hash] = stored.split(':');
        crypto.scrypt(password, salt, 64, (err, derived) => {
            if (err) reject(err);
            else resolve(derived.toString('hex') === hash);
        });
    });
}

export function signJWT(payload: object): string {
    const secret = process.env.JWT_SECRET!;
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig = base64url(crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest());
    return `${header}.${body}.${sig}`;
}

export function verifyJWT(token: string): object | null {
    try {
        const secret = process.env.JWT_SECRET!;
        const [header, body, sig] = token.split('.');
        const expected = base64url(
            crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest()
        );
        if (sig !== expected) return null;
        return JSON.parse(Buffer.from(body, 'base64url').toString());
    } catch {
        return null;
    }
}

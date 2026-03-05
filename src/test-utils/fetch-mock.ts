// Mocks global.fetch for UI component tests so they don't need a running HTTP server.
global.fetch = async (input: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
    const url = String(input);
    const method = options?.method?.toUpperCase() ?? 'GET';
    const body = options?.body ? JSON.parse(String(options.body)) : {};

    if (url.includes('/api/v1/auth/register') && method === 'POST') {
        return new Response(JSON.stringify({ message: 'User created' }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (url.includes('/api/v1/auth/login') && method === 'POST') {
        if (body.email === 'bad@example.com') {
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response(JSON.stringify({ message: 'Logged in' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
    });
};

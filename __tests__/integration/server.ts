import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const app = next({ dev: true });
const handle = app.getRequestHandler();

export async function getTestServer() {
    await app.prepare();
    return createServer((req, res) => {
        const parsedUrl = parse(req.url!, true);
        handle(req, res, parsedUrl);
    });
}

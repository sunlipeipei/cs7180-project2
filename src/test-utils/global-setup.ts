import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

export async function setup() {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.JWT_SECRET = 'test-jwt-secret-for-testing';
}

export async function teardown() {
    if (mongod) {
        await mongod.stop();
    }
}

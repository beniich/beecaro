import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

jest.setTimeout(60000);

let mongo: MongoMemoryServer;

// Mock Kafka producer
jest.mock('../index', () => ({
  producer: {
    send: jest.fn().mockResolvedValue(true),
    connect: jest.fn().mockResolvedValue(true),
  },
}));

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    
    // Ensure we don't connect if already connected
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    
    await mongoose.connect(uri);
});

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    if (mongo) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongo.stop();
    }
});

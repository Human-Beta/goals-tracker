import { MongoClient } from 'mongodb';

import { env } from '@/config/env';

type MongoCache = {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
};

const globalForMongo = globalThis as typeof globalThis & {
  __mongoCache__?: MongoCache;
};

const mongoCache: MongoCache = globalForMongo.__mongoCache__ ?? {
  client: null,
  promise: null,
};

globalForMongo.__mongoCache__ = mongoCache;

export async function connectMongo(): Promise<MongoClient> {
  if (mongoCache.client) {
    return mongoCache.client;
  }

  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set.');
  }

  if (!mongoCache.promise) {
    const client = new MongoClient(env.MONGODB_URI);
    mongoCache.promise = client.connect().then(connectedClient => {
      mongoCache.client = connectedClient;
      return connectedClient;
    });
  }

  return mongoCache.promise;
}

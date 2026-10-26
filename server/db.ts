import { MongoClient } from 'mongodb';
import { config } from './config.js';

const client = new MongoClient(config.uri, {
  auth: config.auth,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 10000,
});

export const db = client.db(config.database);

export async function connectDatabase() {
  await client.connect();
  await pingDatabase();
}

export async function pingDatabase() {
  await db.command({ ping: 1 }, { timeoutMS: 10000 });
}

export async function closeDatabase() {
  await client.close();
}

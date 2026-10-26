import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';

// Works from both server/ source and dist-server/ compiled output.
const envPath = fileURLToPath(new URL('../atlas-credentials.env', import.meta.url));
if (existsSync(envPath)) loadEnvFile(envPath);

const uri = process.env.MONGODB_URI?.trim();
if (!uri || !/^mongodb(?:\+srv)?:\/\//.test(uri) || /<[^>]+>/.test(uri)) {
  throw new Error('Set MONGODB_URI to a complete MongoDB connection string.');
}
const database = process.env.MONGODB_DB?.trim() || 'focus';
if (!/^[A-Za-z0-9_-]+$/.test(database)) {
  throw new Error('MONGODB_DB must contain only letters, numbers, underscores, or hyphens.');
}
const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
if (!!username !== !!password) {
  throw new Error('Provide both MONGODB_USERNAME and MONGODB_PASSWORD, or neither.');
}
const port = Number(process.env.PORT ?? 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

const host = process.env.HOST?.trim() || '127.0.0.1';
const trustProxy = process.env.TRUST_PROXY === 'loopback' ? 'loopback' : false;
export const config = { uri, database, port, host, trustProxy, auth: username && password ? { username, password } : undefined };

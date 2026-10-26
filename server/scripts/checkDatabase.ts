import { closeDatabase, connectDatabase } from '../db.js';

try {
  await connectDatabase();
  console.log('MongoDB connection and ping succeeded. No content was modified.');
} catch {
  console.error('MongoDB connection failed. Check credentials, Atlas network access, and DNS/network connectivity.');
  process.exitCode = 1;
} finally {
  await closeDatabase();
}

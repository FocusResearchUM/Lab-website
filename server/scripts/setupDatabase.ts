import { closeDatabase, connectDatabase } from '../db.js';
import { setupDatabase } from '../schema.js';

try {
  await connectDatabase();
  await setupDatabase();
  console.log('Database structure ready. No admin accounts or public content were inserted.');
} catch {
  console.error('Database setup failed. Check database permissions, existing record formats, and duplicate IDs/emails. Some collections may already have been configured; rerunning is supported.');
  process.exitCode = 1;
} finally {
  await closeDatabase();
}

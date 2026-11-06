import { readFileSync } from 'node:fs';
import { db, closeDatabase, connectDatabase } from '../db.js';

const snapshot = JSON.parse(readFileSync(new URL('../../server/seed-content.json', import.meta.url), 'utf8')) as Record<string, { id: string }[]>;
try {
  await connectDatabase();
  for (const name of ['publications', 'people', 'news', 'themes']) {
    let inserted = 0;
    const now = new Date();
    for (const record of snapshot[name]) {
      const result = await db.collection(name).updateOne({ id: record.id }, {
        $setOnInsert: { ...record, status: 'published', createdAt: now, updatedAt: now },
      }, { upsert: true });
      inserted += result.upsertedCount;
    }
    console.log(`${name}: inserted ${inserted}; preserved ${snapshot[name].length - inserted} existing records.`);
  }
} catch {
  console.error('Content import failed. Check database connectivity and collection permissions. Rerunning preserves existing records.');
  process.exitCode = 1;
} finally { await closeDatabase(); }

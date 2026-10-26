import type { Document, IndexDescription } from 'mongodb';
import { db } from './db.js';

const text = { bsonType: 'string', minLength: 1 };
const date = { bsonType: 'date' };
const url = { ...text, pattern: '^https?://' };
const id = { ...text, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' };
const metadata = { id, status: { enum: ['draft', 'published'] }, createdAt: date, updatedAt: date };
const metadataRequired = ['id', 'status', 'createdAt', 'updatedAt'];
const schema = (required: string[], properties: Document) => ({
  $jsonSchema: {
    bsonType: 'object', additionalProperties: false,
    required, properties: { _id: { bsonType: 'objectId' }, ...properties },
  },
});

export const definitions: Record<string, { validator: Document; indexes: IndexDescription[] }> = {
  admins: {
    validator: schema(['email', 'passwordHash', 'role', 'createdAt', 'updatedAt'], {
      email: { ...text, pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
      passwordHash: { ...text, pattern: '^\\$argon2id\\$' },
      role: { enum: ['admin'] }, createdAt: date, updatedAt: date,
    }),
    indexes: [{ key: { email: 1 }, name: 'unique_admin_email', unique: true }],
  },
  sessions: {
    validator: schema(['tokenHash', 'adminId', 'createdAt', 'expiresAt'], {
      tokenHash: { bsonType: 'string', pattern: '^[a-f0-9]{64}$' },
      adminId: { bsonType: 'objectId' }, createdAt: date, expiresAt: date,
    }),
    indexes: [
      { key: { tokenHash: 1 }, name: 'unique_session_token', unique: true },
      { key: { expiresAt: 1 }, name: 'expire_sessions', expireAfterSeconds: 0 },
      { key: { adminId: 1 }, name: 'sessions_by_admin' },
    ],
  },
  news: {
    validator: schema([...metadataRequired, 'date', 'title', 'summary', 'paragraphs', 'sourceUrl'], {
      ...metadata, date: { bsonType: 'string', pattern: '^\\d{4}-(0[1-9]|1[0-2])$' },
      title: text, summary: text,
      paragraphs: { bsonType: 'array', minItems: 1, items: text },
      publicationId: id, sourceUrl: url,
    }),
    indexes: [
      { key: { id: 1 }, name: 'unique_news_id', unique: true },
      { key: { status: 1, date: -1 }, name: 'published_news_by_date' },
    ],
  },
  people: {
    validator: schema([...metadataRequired, 'name', 'role', 'group'], {
      ...metadata, name: text, role: text,
      group: { enum: ['director', 'graduate', 'undergraduate', 'alumni'] },
      detail: text, image: text, profileUrl: url,
    }),
    indexes: [
      { key: { id: 1 }, name: 'unique_person_id', unique: true },
      { key: { status: 1, group: 1 }, name: 'published_people_by_group' },
    ],
  },
  publications: {
    validator: schema([...metadataRequired, 'title', 'authors', 'year', 'venue', 'themes'], {
      ...metadata, title: text, authors: text, venue: text,
      year: { bsonType: ['int', 'long', 'double'], minimum: 1900, maximum: 9999, multipleOf: 1 },
      themes: { bsonType: 'array', uniqueItems: true, items: { enum: ['provenance', 'ai', 'network', 'cloud'] } },
      paperUrl: url, codeUrl: url, projectId: id,
    }),
    indexes: [
      { key: { id: 1 }, name: 'unique_publication_id', unique: true },
      { key: { status: 1, year: -1 }, name: 'published_publications_by_year' },
    ],
  },
};

export async function setupDatabase() {
  // Preflight all collections before changing validation or creating indexes.
  const existing = await db.listCollections({}, { nameOnly: true }).toArray();
  const names = new Set(existing.map(collection => collection.name));
  for (const [name, definition] of Object.entries(definitions)) {
    if (names.has(name)) {
      const invalid = await db.collection(name).countDocuments({ $nor: [definition.validator] });
      if (invalid) throw new Error(`Collection ${name} contains records incompatible with the schema.`);
    }
  }
  for (const [name, definition] of Object.entries(definitions)) {
    const options = { validator: definition.validator, validationLevel: 'strict' as const, validationAction: 'error' as const };
    if (names.has(name)) await db.command({ collMod: name, ...options });
    else await db.createCollection(name, options);
    await db.collection(name).createIndexes(definition.indexes);
    console.log(`Configured ${name}: validation and indexes ready.`);
  }
}

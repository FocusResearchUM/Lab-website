import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import type { Document, Sort } from 'mongodb';
import { db } from '../db.js';

const definitions = {
  news: {
    required: ['date', 'title', 'summary', 'paragraphs', 'sourceUrl'],
    optional: ['publicationId'], sort: { date: -1, id: 1 },
  },
  people: {
    required: ['name', 'role', 'group'],
    optional: ['detail', 'image', 'profileUrl'], sort: { group: 1, name: 1, id: 1 },
  },
  themes: { required: ['name', 'description', 'icon'], optional: [] as string[], sort: { createdAt: 1, id: 1 } },
  publications: {
    required: ['title', 'authors', 'year', 'venue', 'themes'],
    optional: ['paperUrl', 'codeUrl', 'projectId'], sort: { year: -1, title: 1, id: 1 },
  },
};

export const publicContentRouter = Router();
export const adminContentRouter = Router();

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && (value.length === 0 || value.some(isEmpty)));
}

for (const [name, definition] of Object.entries(definitions)) {
  const collection = db.collection(name);
  const sort = definition.sort as Sort;
  publicContentRouter.get(`/${name}`, async (_req, res) => {
    res.json(await collection.find({ status: 'published' }, { projection: { _id: 0 } }).sort(sort).toArray());
  });
  publicContentRouter.get(`/${name}/:id`, async (req, res) => {
    const record = await collection.findOne({ id: req.params.id, status: 'published' }, { projection: { _id: 0 } });
    if (!record) { res.status(404).json({ error: 'Record not found' }); return; }
    res.json(record);
  });
  adminContentRouter.get(`/${name}`, async (_req, res) => {
    res.json(await collection.find({}, { projection: { _id: 0 } }).sort(sort).toArray());
  });
  adminContentRouter.get(`/${name}/:id`, async (req, res) => {
    const record = await collection.findOne({ id: req.params.id }, { projection: { _id: 0 } });
    if (!record) { res.status(404).json({ error: 'Record not found' }); return; }
    res.json(record);
  });

  for (const method of ['post', 'patch'] as const) {
    adminContentRouter[method](method === 'post' ? `/${name}` : `/${name}/:id`, async (req, res) => {
      const body = req.body ?? {};
      const missing = definition.required.filter(field =>
        (method === 'post' || Object.hasOwn(body, field)) && isEmpty(body[field]));
      if (Object.hasOwn(body, 'status') && isEmpty(body.status)) missing.push('status');
      if (missing.length) {
        res.status(400).json({ error: 'Please fill in the required fields', fields: missing }); return;
      }
      const invalid: string[] = [];
      for (const field of [...definition.required, ...definition.optional, 'status']) {
        if (!Object.hasOwn(body, field) || (definition.optional.includes(field) && isEmpty(body[field]))) continue;
        const value = body[field];
        if (field === 'year') {
          if (!Number.isInteger(value) || value < 1900 || value > 9999) invalid.push('Year must be a whole number between 1900 and 9999.');
        } else if (field === 'themes' || field === 'paragraphs') {
          if (!Array.isArray(value) || value.some(item => typeof item !== 'string' || !item.trim())) invalid.push(field + ' must contain nonempty text values.');
          else if (field === 'themes' && (new Set(value).size !== value.length || value.some(item => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item)))) invalid.push('Select valid, distinct research themes.');
        } else if (typeof value !== 'string') invalid.push(field + ' must be text.');
        else if (field.endsWith('Url') && !/^https?:\/\//.test(value.trim())) invalid.push(field + ' must start with https:// or http://.');
        else if (['projectId', 'publicationId'].includes(field) && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim())) invalid.push('Select a valid related record.');
        else if (field === 'status' && !['draft', 'published'].includes(value)) invalid.push('Select draft or published status.');
        else if (field === 'group' && !['director', 'graduate', 'undergraduate', 'alumni', 'friends'].includes(value)) invalid.push('Select a valid team group.');
        else if (field === 'icon' && !['ai', 'network', 'provenance', 'cloud'].includes(value)) invalid.push('Icon must be ai, network, provenance, or cloud.');
        else if (field === 'date' && !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) invalid.push('Select a valid month.');
      }
      if (invalid.length) { res.status(400).json({ error: invalid.join(' ') }); return; }
      const fields: Document = {};
      const unset: Document = {};
      // Only copy content fields; callers cannot change IDs, timestamps, or MongoDB operators.
      for (const field of [...definition.required, ...definition.optional, 'status']) {
        if (!Object.hasOwn(body, field)) continue;
        const value = body[field];
        if (definition.optional.includes(field) && isEmpty(value)) unset[field] = '';
        else fields[field] = typeof value === 'string' ? value.trim() : value;
      }
      if (method === 'post') {
        const now = new Date();
        const record = { ...fields, id: randomUUID(), status: fields.status ?? 'draft', createdAt: now, updatedAt: now };
        await collection.insertOne(record);
        const { _id: _ignored, ...saved } = record as Document;
        res.status(201).json(saved);
      } else {
        if (!Object.keys(fields).length && !Object.keys(unset).length) {
          res.status(400).json({ error: 'No content fields supplied' }); return;
        }
        const record = await collection.findOneAndUpdate({ id: (req.params as Record<string, string>).id }, {
          $set: { ...fields, updatedAt: new Date() }, ...(Object.keys(unset).length ? { $unset: unset } : {}),
        }, { returnDocument: 'after', projection: { _id: 0 } });
        if (!record) { res.status(404).json({ error: 'Record not found' }); return; }
        res.json(record);
      }
    });
  }
  adminContentRouter.delete(`/${name}/:id`, async (req, res) => {
    const result = await collection.deleteOne({ id: req.params.id });
    if (!result.deletedCount) { res.status(404).json({ error: 'Record not found' }); return; }
    res.status(204).end();
  });
}

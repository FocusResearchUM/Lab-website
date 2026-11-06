import type { ObjectId } from 'mongodb';
import { db } from './db.js';

export interface ContentMetadata {
  id: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}
export interface AdminRecord {
  email: string;
  passwordHash: string;
  role: 'admin';
  createdAt: Date;
  updatedAt: Date;
}
export interface SessionRecord {
  tokenHash: string;
  adminId: ObjectId;
  createdAt: Date;
  expiresAt: Date;
}
export interface NewsRecord extends ContentMetadata {
  date: string;
  title: string;
  summary: string;
  paragraphs: string[];
  publicationId?: string;
  sourceUrl: string;
}
export interface PersonRecord extends ContentMetadata {
  name: string;
  role: string;
  group: 'director' | 'graduate' | 'undergraduate' | 'alumni' | 'friends';
  detail?: string;
  image?: string;
  profileUrl?: string;
}
export interface PublicationRecord extends ContentMetadata {
  title: string;
  authors: string;
  year: number;
  venue: string;
  themes: string[];
  paperUrl?: string;
  codeUrl?: string;
  projectId?: string;
}

export const collections = {
  admins: db.collection<AdminRecord>('admins'),
  sessions: db.collection<SessionRecord>('sessions'),
  news: db.collection<NewsRecord>('news'),
  people: db.collection<PersonRecord>('people'),
  publications: db.collection<PublicationRecord>('publications'),
};

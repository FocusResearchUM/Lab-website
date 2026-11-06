import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { hash } from 'argon2';
import { collections } from '../models.js';
import { closeDatabase, connectDatabase } from '../db.js';
import { db } from '../db.js';

const email = `auth-test-${randomBytes(8).toString('hex')}@example.invalid`;
const password = randomBytes(32).toString('hex');
const port = 3011;
const base = `http://127.0.0.1:${port}`;
let child: ReturnType<typeof spawn> | undefined;
let adminId;
const temporaryContent: { collection: string; id: string }[] = [];
try {
  await connectDatabase();
  const now = new Date();
  const result = await collections.admins.insertOne({ email, passwordHash: await hash(password), role: 'admin', createdAt: now, updatedAt: now });
  adminId = result.insertedId;
  child = spawn(process.execPath, [fileURLToPath(new URL('../index.js', import.meta.url))], {
    env: { ...process.env, PORT: String(port), NODE_ENV: 'test' }, stdio: 'ignore', windowsHide: true,
  });
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    if (child.exitCode !== null) throw new Error('Test API failed to start');
    try { ready = (await fetch(`${base}/api/health`)).ok; } catch { /* Wait for startup. */ }
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  assert.ok(ready, 'API starts');
  const homepage = await fetch(base);
  assert.equal(homepage.status, 200);
  assert.match(homepage.headers.get('content-type') ?? '', /text\/html/);
  assert.equal((await fetch(`${base}/atlas-credentials.env`)).status, 404);
  assert.equal((await fetch(`${base}/server/config.ts`)).status, 404);
  const unknownApi = await fetch(`${base}/api/nonexistent`);
  assert.equal(unknownApi.status, 404);
  assert.match(unknownApi.headers.get('content-type') ?? '', /application\/json/);
  const login = (body: unknown, customHeader = true) => fetch(`${base}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(customHeader ? { 'X-Requested-With': 'focus-admin' } : {}) }, body: JSON.stringify(body),
  });
  assert.equal((await fetch(`${base}/api/auth/me`)).status, 401);
  assert.equal((await fetch(`${base}/api/admin/news`)).status, 401);
  assert.equal((await login({ email, password }, false)).status, 403);
  assert.equal((await login({ email, password: 'incorrect' })).status, 401);
  assert.equal((await login({ email, password: {} })).status, 400);
  const response = await login({ email: email.toUpperCase(), password });
  assert.equal(response.status, 200);
  const cookieHeader = response.headers.get('set-cookie')!;
  assert.match(cookieHeader, /HttpOnly/i);
  assert.match(cookieHeader, /SameSite=Strict/i);
  const cookie = cookieHeader.split(';')[0];
  const data = await response.json() as { admin: { email: string; passwordHash?: string }; csrfToken: string };
  assert.equal(data.admin.email, email);
  assert.equal(data.admin.passwordHash, undefined);
  const me = await fetch(`${base}/api/auth/me`, { headers: { Cookie: cookie } });
  assert.equal(me.status, 200);
  assert.equal((await me.json() as { csrfToken: string }).csrfToken, data.csrfToken);
  const contentRequest = (path: string, method = 'GET', body?: unknown) => fetch(`${base}${path}`, {
    method, headers: { Cookie: cookie, 'X-CSRF-Token': data.csrfToken, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  for (const [name, content] of Object.entries({
    news: { date: '2026-10', title: 'Temporary test', summary: 'Test summary', paragraphs: ['Test paragraph'], sourceUrl: 'https://example.invalid' },
    people: { name: 'Temporary test', role: 'Researcher', group: 'graduate', detail: 'Temporary details' },
    publications: { title: 'Temporary test', authors: 'Test author', year: 2026, venue: 'Test venue', themes: ['ai'], paperUrl: 'https://example.invalid/paper' },
  })) {
    const invalid = await contentRequest(`/api/admin/${name}`, 'POST', {});
    assert.equal(invalid.status, 400);
    if (name === 'publications') {
      const badLink = await contentRequest('/api/admin/publications', 'POST', { ...content, paperUrl: 'example.com/paper' });
      assert.equal(badLink.status, 400);
      assert.match((await badLink.json() as { error: string }).error, /paperUrl must start/);
      const badYear = await contentRequest('/api/admin/publications', 'POST', { ...content, year: 2026.5 });
      assert.equal(badYear.status, 400);
    }
    const created = await contentRequest(`/api/admin/${name}`, 'POST', { ...content, ...(name === 'publications' ? { codeUrl: '', projectId: '' } : {}) });
    assert.equal(created.status, 201);
    const record = await created.json() as { id: string; status: string };
    temporaryContent.push({ collection: name, id: record.id });
    assert.equal(record.status, 'draft');
    assert.equal((await fetch(`${base}/api/${name}/${record.id}`)).status, 404);
    assert.equal((await contentRequest(`/api/admin/${name}/${record.id}`)).status, 200);
    const field = name === 'people' ? 'name' : 'title';
    assert.equal((await contentRequest(`/api/admin/${name}/${record.id}`, 'PATCH', { [field]: '  ' })).status, 400);
    const updated = await contentRequest(`/api/admin/${name}/${record.id}`, 'PATCH', { status: 'published', [field]: 'Updated test' });
    assert.equal(updated.status, 200);
    assert.equal((await updated.json() as Record<string, unknown>)[field], 'Updated test');
    assert.equal((await fetch(`${base}/api/${name}/${record.id}`)).status, 200);
    const optional = name === 'people' ? 'detail' : name === 'publications' ? 'paperUrl' : 'publicationId';
    const cleared = await contentRequest(`/api/admin/${name}/${record.id}`, 'PATCH', { [optional]: '' });
    assert.equal(cleared.status, 200);
    assert.equal((await cleared.json() as Record<string, unknown>)[optional], undefined);
    assert.equal((await contentRequest(`/api/admin/${name}/${record.id}`, 'DELETE')).status, 204);
    assert.equal((await fetch(`${base}/api/${name}/${record.id}`)).status, 404);
  }
  console.log('Content create/edit/publish/delete checks passed.');
  assert.equal((await fetch(`${base}/api/auth/logout`, { method: 'POST', headers: { Cookie: cookie } })).status, 403);
  assert.equal((await fetch(`${base}/api/admin/news`, { method: 'POST', headers: { Cookie: cookie, 'X-CSRF-Token': 'wrong' } })).status, 403);
  assert.equal((await fetch(`${base}/api/auth/logout`, { method: 'POST', headers: { Cookie: cookie, 'X-CSRF-Token': data.csrfToken } })).status, 204);
  assert.equal((await fetch(`${base}/api/auth/me`, { headers: { Cookie: cookie } })).status, 401);
  const second = await login({ email, password });
  assert.equal(second.status, 200);
  const expiredCookie = second.headers.get('set-cookie')!.split(';')[0];
  await collections.sessions.updateMany({ adminId }, { $set: { expiresAt: new Date(0) } });
  assert.equal((await fetch(`${base}/api/auth/me`, { headers: { Cookie: expiredCookie } })).status, 401);
  let limited = false;
  for (let attempt = 0; attempt < 12; attempt++) {
    if ((await login({ email, password: 'incorrect' })).status === 429) { limited = true; break; }
  }
  assert.ok(limited, 'Login rate limit applies');
  console.log('Authentication integration checks passed.');
} finally {
  if (child && child.exitCode === null) {
    const exited = new Promise<void>(resolve => child!.once('exit', () => resolve()));
    child.kill();
    await exited;
  }
  if (adminId) {
    await collections.sessions.deleteMany({ adminId });
    await collections.admins.deleteOne({ _id: adminId });
  }
  for (const record of temporaryContent) await db.collection(record.collection).deleteOne({ id: record.id });
  await closeDatabase();
}

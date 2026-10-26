import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import { hash, verify } from 'argon2';
import { rateLimit } from 'express-rate-limit';
import { collections } from '../models.js';
import { cookieName, cookieOptions, csrfToken, hashToken, readToken, requireAdmin, sessionDuration } from '../middleware/requireAdmin.js';

export const authRouter = Router();
authRouter.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
// Verify a dummy hash for unknown emails to reduce account-enumeration timing differences.
const dummyHash = await hash(randomBytes(32), { memoryCost: 19456, timeCost: 2, parallelism: 1 });
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' },
});

authRouter.post('/login', loginLimiter, async (req, res) => {
  // A custom header prevents cross-origin forms from initiating login. No CORS is enabled.
  if (req.get('X-Requested-With') !== 'focus-admin') {
    res.status(403).json({ error: 'Invalid request' }); return;
  }
  if (!req.is('application/json')) { res.status(415).json({ error: 'Send application/json' }); return; }
  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || email.length > 254 || typeof password !== 'string' || !password.length || password.length > 1024) {
    res.status(400).json({ error: 'Provide a valid email and password' }); return;
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    res.status(400).json({ error: 'Provide a valid email and password' }); return;
  }
  const admin = await collections.admins.findOne({ email: normalizedEmail, role: 'admin' });
  let matches = false;
  try { matches = await verify(admin?.passwordHash ?? dummyHash, password); } catch { /* Treat invalid stored hashes as failed authentication. */ }
  if (!admin || !matches) { res.status(401).json({ error: 'Invalid email or password' }); return; }
  const token = randomBytes(32).toString('hex');
  const createdAt = new Date();
  await collections.sessions.insertOne({ tokenHash: hashToken(token), adminId: admin._id, createdAt, expiresAt: new Date(createdAt.getTime() + sessionDuration) });
  const previous = readToken(req);
  if (previous) await collections.sessions.deleteOne({ tokenHash: hashToken(previous) });
  res.cookie(cookieName, token, { ...cookieOptions, maxAge: sessionDuration });
  res.json({ admin: { id: admin._id.toHexString(), email: admin.email, role: admin.role }, csrfToken: csrfToken(token) });
});

authRouter.get('/me', requireAdmin, (_req, res) => {
  res.json({ admin: res.locals.admin, csrfToken: res.locals.csrfToken });
});

authRouter.post('/logout', requireAdmin, async (_req, res) => {
  await collections.sessions.deleteOne({ tokenHash: res.locals.tokenHash });
  res.clearCookie(cookieName, cookieOptions);
  res.status(204).end();
});

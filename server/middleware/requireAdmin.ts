import { createHash, timingSafeEqual } from 'node:crypto';
import type { Request, RequestHandler } from 'express';
import { collections } from '../models.js';

export const cookieName = process.env.NODE_ENV === 'production' ? '__Host-focus-session' : 'focus-session';
export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/' };
export const sessionDuration = 8 * 60 * 60 * 1000;
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
export const csrfToken = (token: string) => hashToken(`csrf:${token}`);

export function readToken(req: Request) {
  const cookies = (req.headers.cookie ?? '').split(';').map(part => part.trim());
  const value = cookies.find(part => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  return value && /^[a-f0-9]{64}$/.test(value) ? value : undefined;
}

export const requireAdmin: RequestHandler = async (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  const token = readToken(req);
  if (!token) { res.status(401).json({ error: 'Login required' }); return; }
  const session = await collections.sessions.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } });
  const admin = session && await collections.admins.findOne({ _id: session.adminId, role: 'admin' });
  if (!session || !admin) {
    res.clearCookie(cookieName, cookieOptions);
    res.status(401).json({ error: 'Login required' }); return;
  }
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const supplied = req.get('X-CSRF-Token') ?? '';
    const expected = csrfToken(token);
    if (!/^[a-f0-9]{64}$/.test(supplied) || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) {
      res.status(403).json({ error: 'Invalid CSRF token' }); return;
    }
  }
  res.locals.admin = { id: admin._id.toHexString(), email: admin.email, role: admin.role };
  res.locals.tokenHash = session.tokenHash;
  res.locals.csrfToken = csrfToken(token);
  next();
};

import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

export const sign = (u) => jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

async function load(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  try {
    const p = jwt.verify(h.slice(7), process.env.JWT_SECRET);
    const u = await prisma.user.findUnique({ where: { id: p.id } });
    return u && !u.blocked ? u : null;
  } catch {
    return null;
  }
}

export async function optionalAuth(req, _res, next) {
  req.user = await load(req);
  next();
}
export async function auth(req, res, next) {
  const u = await load(req);
  if (!u) return res.status(401).json({ error: 'Please log in to continue' });
  req.user = u;
  next();
}
export const role = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'You do not have access to this' });

export const staff = [auth, role('ADMIN', 'SUPER_ADMIN')];
export const superOnly = [auth, role('SUPER_ADMIN')];

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma, wrap, audit } from '../db.js';
import { superOnly } from '../middleware/auth.js';

const r = Router();
r.use(...superOnly);

const sel = { id: true, name: true, email: true, phone: true, role: true, blocked: true, createdAt: true };

r.get('/admins', wrap(async (_req, res) =>
  res.json(await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } }, select: sel, orderBy: { createdAt: 'desc' } }))));

r.post('/admins', wrap(async (req, res) => {
  const d = z.object({
    name: z.string().min(2), email: z.string().email(), phone: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }).parse(req.body);
  const email = d.email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) return res.status(409).json({ error: 'This email is already registered' });
  const u = await prisma.user.create({ data: { ...d, email, role: 'ADMIN', password: await bcrypt.hash(d.password, 10) }, select: sel });
  audit(req.user.id, 'ADMIN_CREATE', email);
  res.json(u);
}));

r.patch('/admins/:id', wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) return res.status(400).json({ error: 'You cannot change your own account here' });
  const d = z.object({
    name: z.string().min(2).optional(), blocked: z.boolean().optional(), password: z.string().min(8).optional(),
  }).parse(req.body);
  if (d.password) d.password = await bcrypt.hash(d.password, 10);
  const u = await prisma.user.update({ where: { id }, data: d, select: sel });
  audit(req.user.id, 'ADMIN_UPDATE', `${u.email} ${d.blocked !== undefined ? (d.blocked ? 'suspended' : 'reactivated') : ''}`);
  res.json(u);
}));

r.delete('/admins/:id', wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) return res.status(400).json({ error: 'You cannot delete your own account' });
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || target.role !== 'ADMIN') return res.status(400).json({ error: 'Only admin accounts can be deleted here' });
  // Keep audit history: suspend + anonymise instead of hard delete if they have logs
  const logs = await prisma.auditLog.count({ where: { actorId: id } });
  if (logs) await prisma.user.update({ where: { id }, data: { blocked: true } });
  else await prisma.user.delete({ where: { id } });
  audit(req.user.id, 'ADMIN_DELETE', target.email);
  res.json({ ok: true, suspended: !!logs });
}));

r.get('/audit', wrap(async (_req, res) =>
  res.json(await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200, include: { actor: { select: { name: true, role: true } } } }))));

export default r;

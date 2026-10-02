import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma, wrap } from '../db.js';
import { auth, sign } from '../middleware/auth.js';

const r = Router();
const pub = ({ password, ...u }) => u;

const regSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

r.post('/register', wrap(async (req, res) => {
  const d = regSchema.parse(req.body);
  const email = d.email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) return res.status(409).json({ error: 'This email is already registered' });
  const u = await prisma.user.create({ data: { ...d, email, password: await bcrypt.hash(d.password, 10) } });
  res.json({ token: sign(u), user: pub(u) });
}));

r.post('/login', wrap(async (req, res) => {
  const { email, password } = z.object({ email: z.string(), password: z.string() }).parse(req.body);
  const u = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!u || !(await bcrypt.compare(password, u.password))) return res.status(401).json({ error: 'Wrong email or password' });
  if (u.blocked) return res.status(403).json({ error: 'This account is suspended. Contact support.' });
  res.json({ token: sign(u), user: pub(u) });
}));

r.get('/me', auth, (req, res) => res.json({ user: pub(req.user) }));

r.patch('/me', auth, wrap(async (req, res) => {
  const d = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    language: z.enum(['en', 'om', 'am']).optional(),
    theme: z.enum(['light', 'dark']).optional(),
  }).parse(req.body);
  const u = await prisma.user.update({ where: { id: req.user.id }, data: d });
  res.json({ user: pub(u) });
}));

export default r;

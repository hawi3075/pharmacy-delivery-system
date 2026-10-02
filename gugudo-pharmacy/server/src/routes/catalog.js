import { Router } from 'express';
import { prisma, wrap } from '../db.js';

const r = Router();

r.get('/categories', wrap(async (_req, res) => res.json(await prisma.category.findMany({ orderBy: { name: 'asc' } }))));

r.get('/products', wrap(async (req, res) => {
  const { q, category, rx } = req.query;
  const where = { active: true };
  if (q) where.OR = [{ name: { contains: String(q), mode: 'insensitive' } }, { generic: { contains: String(q), mode: 'insensitive' } }];
  if (category) where.categoryId = Number(category);
  if (rx === 'true') where.requiresRx = true;
  res.json(await prisma.product.findMany({ where, include: { category: true }, orderBy: { name: 'asc' }, take: 100 }));
}));

r.get('/products/:id', wrap(async (req, res) => {
  const p = await prisma.product.findFirst({ where: { id: Number(req.params.id), active: true }, include: { category: true } });
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json(p);
}));

export default r;

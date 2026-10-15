import { Router } from 'express';
import { z } from 'zod';
import { prisma, wrap } from '../db.js';
import { auth } from '../middleware/auth.js';

const r = Router();
r.use(auth);

/* ---- Saved addresses ---- */
const addrSchema = z.object({
  label: z.string().default('Home'),
  text: z.string().min(5),
  phone: z.string().min(7),
  lat: z.number().optional(),
  lng: z.number().optional(),
});
r.get('/addresses', wrap(async (req, res) =>
  res.json(await prisma.address.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } }))));
r.post('/addresses', wrap(async (req, res) =>
  res.json(await prisma.address.create({ data: { ...addrSchema.parse(req.body), userId: req.user.id } }))));
r.delete('/addresses/:id', wrap(async (req, res) => {
  await prisma.address.deleteMany({ where: { id: Number(req.params.id), userId: req.user.id } });
  res.json({ ok: true });
}));

/* ---- Support messages (customer <-> staff) ---- */
r.get('/messages', wrap(async (req, res) =>
  res.json(await prisma.message.findMany({ where: { customerId: req.user.id }, orderBy: { createdAt: 'asc' } }))));
r.post('/messages', wrap(async (req, res) => {
  const { body } = z.object({ body: z.string().min(1).max(2000) }).parse(req.body);
  res.json(await prisma.message.create({ data: { customerId: req.user.id, body } }));
}));

r.post('/reviews', wrap(async (req, res) => {
  const d = z.object({
    productId: z.coerce.number().int().positive(),
    rating: z.coerce.number().int().min(1).max(5),
    body: z.string().min(2).max(1000),
  }).parse(req.body);
  const review = await prisma.review.upsert({
    where: { customerId_productId: { customerId: req.user.id, productId: d.productId } },
    update: { rating: d.rating, body: d.body },
    create: { ...d, customerId: req.user.id },
    include: { customer: { select: { name: true } } },
  });
  res.json(review);
}));

export default r;

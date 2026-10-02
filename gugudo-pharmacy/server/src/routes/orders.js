import { Router } from 'express';
import { z } from 'zod';
import { prisma, wrap } from '../db.js';
import { auth } from '../middleware/auth.js';
import { upload, fileUrl } from '../upload.js';

const r = Router();
r.use(auth);

const FREE_DELIVERY_OVER = 1000; // ETB
const DELIVERY_FEE = 50;

r.post('/', upload.single('prescription'), wrap(async (req, res) => {
  const b = z.object({
    items: z.string(),
    addressText: z.string().min(5, 'Please enter a delivery address'),
    phone: z.string().min(7, 'Please enter a phone number'),
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
    notes: z.string().optional(),
    paymentMethod: z.enum(['COD']).default('COD'),
  }).parse(req.body);
  const items = z.array(z.object({ id: z.number(), qty: z.number().int().min(1).max(50) })).min(1).parse(JSON.parse(b.items));

  const order = await prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({ where: { id: { in: items.map((i) => i.id) }, active: true } });
    if (products.length !== items.length) throw Object.assign(new Error('Some products are no longer available'), { status: 400 });
    let subtotal = 0;
    const lines = items.map((i) => {
      const p = products.find((x) => x.id === i.id);
      if (p.stock < i.qty) throw Object.assign(new Error(`Only ${p.stock} left of ${p.name}`), { status: 400 });
      subtotal += p.price * i.qty;
      return { productId: p.id, name: p.name, price: p.price, qty: i.qty };
    });
    if (products.some((p) => p.requiresRx) && !req.file)
      throw Object.assign(new Error('A prescription file is required for prescription medicines'), { status: 400 });
    for (const l of lines) await tx.product.update({ where: { id: l.productId }, data: { stock: { decrement: l.qty } } });
    const deliveryFee = subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
    return tx.order.create({
      data: {
        code: 'MED-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 90 + 10),
        customerId: req.user.id,
        subtotal, deliveryFee, total: subtotal + deliveryFee,
        addressText: b.addressText, phone: b.phone, lat: b.lat, lng: b.lng, notes: b.notes,
        paymentMethod: b.paymentMethod,
        prescriptionUrl: fileUrl(req.file),
        items: { create: lines },
      },
      include: { items: true },
    });
  });
  res.json(order);
}));

r.get('/', wrap(async (req, res) =>
  res.json(await prisma.order.findMany({ where: { customerId: req.user.id }, include: { items: true }, orderBy: { createdAt: 'desc' } }))));

r.patch('/:id/cancel', wrap(async (req, res) => {
  const o = await prisma.order.findFirst({ where: { id: Number(req.params.id), customerId: req.user.id }, include: { items: true } });
  if (!o) return res.status(404).json({ error: 'Order not found' });
  if (o.status !== 'PENDING') return res.status(400).json({ error: 'Only pending orders can be cancelled' });
  await prisma.$transaction([
    prisma.order.update({ where: { id: o.id }, data: { status: 'CANCELLED' } }),
    ...o.items.map((i) => prisma.product.update({ where: { id: i.productId }, data: { stock: { increment: i.qty } } })),
  ]);
  res.json({ ok: true });
}));

export default r;

import { Router } from 'express';
import { z } from 'zod';
import { prisma, wrap, audit } from '../db.js';
import { staff } from '../middleware/auth.js';
import { upload, fileUrl } from '../upload.js';

const r = Router();
r.use(...staff);

/* ---- Dashboard ---- */
r.get('/stats', wrap(async (_req, res) => {
  const since = new Date(Date.now() - 7 * 864e5);
  const [orders, pending, customers, products, recent, weekOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.product.findMany({ where: { active: true } }),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 6, include: { customer: { select: { name: true } } } }),
    prisma.order.findMany({ where: { createdAt: { gte: since }, status: { not: 'CANCELLED' } } }),
  ]);
  const paid = await prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { total: true } });
  const byDay = {};
  for (const o of weekOrders) {
    const k = o.createdAt.toISOString().slice(0, 10);
    byDay[k] = (byDay[k] || 0) + o.total;
  }
  res.json({
    orders, pending, customers,
    revenue: paid._sum.total || 0,
    lowStock: products.filter((p) => p.stock <= p.lowStockAt).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
    recent, byDay,
  });
}));

/* ---- Orders ---- */
r.get('/orders', wrap(async (req, res) => {
  const where = req.query.status ? { status: String(req.query.status) } : {};
  res.json(await prisma.order.findMany({
    where, orderBy: { createdAt: 'desc' }, take: 200,
    include: { items: true, customer: { select: { id: true, name: true, email: true, phone: true } } },
  }));
}));

r.patch('/orders/:id', wrap(async (req, res) => {
  const d = z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']).optional(),
    paymentStatus: z.enum(['UNPAID', 'PAID', 'REFUNDED']).optional(),
  }).parse(req.body);
  const o = await prisma.order.findUnique({ where: { id: Number(req.params.id) }, include: { items: true } });
  if (!o) return res.status(404).json({ error: 'Order not found' });
  const data = { ...d };
  if (d.status === 'DELIVERED' && o.paymentMethod === 'COD' && !d.paymentStatus) data.paymentStatus = 'PAID'; // cash collected
  const ops = [prisma.order.update({ where: { id: o.id }, data })];
  if (d.status === 'CANCELLED' && o.status !== 'CANCELLED')
    ops.push(...o.items.map((i) => prisma.product.update({ where: { id: i.productId }, data: { stock: { increment: i.qty } } })));
  await prisma.$transaction(ops);
  audit(req.user.id, 'ORDER_UPDATE', `${o.code} -> ${JSON.stringify(data)}`);
  res.json({ ok: true });
}));

/* ---- Products ---- */
r.get('/products', wrap(async (_req, res) =>
  res.json(await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } }))));

const productBody = (b, file) => {
  const d = {};
  for (const k of ['name', 'generic', 'description', 'batchNo', 'manufacturer']) if (b[k] !== undefined) d[k] = b[k] || null;
  if (b.price !== undefined) d.price = Number(b.price);
  if (b.stock !== undefined) d.stock = parseInt(b.stock, 10) || 0;
  if (b.lowStockAt !== undefined) d.lowStockAt = parseInt(b.lowStockAt, 10) || 10;
  if (b.requiresRx !== undefined) d.requiresRx = b.requiresRx === 'true' || b.requiresRx === true;
  if (b.active !== undefined) d.active = b.active === 'true' || b.active === true;
  if (b.categoryId !== undefined) d.categoryId = b.categoryId ? Number(b.categoryId) : null;
  if (b.expiry !== undefined) d.expiry = b.expiry ? new Date(b.expiry) : null;
  if (file) d.imageUrl = fileUrl(file);
  return d;
};

r.post('/products', upload.single('image'), wrap(async (req, res) => {
  if (!req.body.name || req.body.price === undefined) return res.status(400).json({ error: 'Name and price are required' });
  const p = await prisma.product.create({ data: productBody(req.body, req.file) });
  audit(req.user.id, 'PRODUCT_CREATE', p.name);
  res.json(p);
}));
r.put('/products/:id', upload.single('image'), wrap(async (req, res) => {
  const p = await prisma.product.update({ where: { id: Number(req.params.id) }, data: productBody(req.body, req.file) });
  audit(req.user.id, 'PRODUCT_UPDATE', p.name);
  res.json(p);
}));
r.delete('/products/:id', wrap(async (req, res) => {
  const id = Number(req.params.id);
  const used = await prisma.orderItem.count({ where: { productId: id } });
  if (used) { // keep order history intact: hide instead of delete
    await prisma.product.update({ where: { id }, data: { active: false } });
    audit(req.user.id, 'PRODUCT_HIDE', String(id));
    return res.json({ ok: true, hidden: true });
  }
  await prisma.product.delete({ where: { id } });
  audit(req.user.id, 'PRODUCT_DELETE', String(id));
  res.json({ ok: true });
}));
r.post('/categories', wrap(async (req, res) => {
  const { name } = z.object({ name: z.string().min(2) }).parse(req.body);
  res.json(await prisma.category.upsert({ where: { name }, update: {}, create: { name } }));
}));

/* ---- Support inbox ---- */
r.get('/messages', wrap(async (_req, res) => {
  const msgs = await prisma.message.findMany({ orderBy: { createdAt: 'desc' }, include: { customer: { select: { id: true, name: true, email: true } } } });
  const threads = new Map();
  for (const m of msgs) {
    if (!threads.has(m.customerId)) threads.set(m.customerId, { customer: m.customer, last: m, unread: 0 });
    if (!m.fromStaff && !m.readByStaff) threads.get(m.customerId).unread++;
  }
  res.json([...threads.values()]);
}));
r.get('/messages/:customerId', wrap(async (req, res) => {
  const customerId = Number(req.params.customerId);
  await prisma.message.updateMany({ where: { customerId, fromStaff: false }, data: { readByStaff: true } });
  res.json(await prisma.message.findMany({ where: { customerId }, orderBy: { createdAt: 'asc' } }));
}));
r.post('/messages/:customerId', wrap(async (req, res) => {
  const { body } = z.object({ body: z.string().min(1).max(2000) }).parse(req.body);
  res.json(await prisma.message.create({ data: { customerId: Number(req.params.customerId), fromStaff: true, readByStaff: true, body } }));
}));

/* ---- Customers ---- */
r.get('/customers', wrap(async (_req, res) => {
  const users = await prisma.user.findMany({
    where: { role: 'CUSTOMER' }, orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, phone: true, blocked: true, createdAt: true, _count: { select: { orders: true } } },
  });
  res.json(users);
}));
r.patch('/customers/:id/block', wrap(async (req, res) => {
  const { blocked } = z.object({ blocked: z.boolean() }).parse(req.body);
  await prisma.user.updateMany({ where: { id: Number(req.params.id), role: 'CUSTOMER' }, data: { blocked } });
  audit(req.user.id, blocked ? 'CUSTOMER_BLOCK' : 'CUSTOMER_UNBLOCK', req.params.id);
  res.json({ ok: true });
}));
r.patch('/customers/:id', wrap(async (req, res) => {
  const d = z.object({ name: z.string().min(2).optional(), phone: z.string().min(7).optional() }).parse(req.body);
  const customer = await prisma.user.updateMany({ where: { id: Number(req.params.id), role: 'CUSTOMER' }, data: d });
  if (!customer.count) return res.status(404).json({ error: 'Customer not found' });
  audit(req.user.id, 'CUSTOMER_UPDATE', req.params.id);
  res.json({ ok: true });
}));
r.delete('/customers/:id', wrap(async (req, res) => {
  const id = Number(req.params.id);
  const customer = await prisma.user.findFirst({ where: { id, role: 'CUSTOMER' }, include: { _count: { select: { orders: true } } } });
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  if (customer._count.orders) return res.status(409).json({ error: 'Customers with order history cannot be deleted. Suspend the account instead.' });
  await prisma.user.delete({ where: { id } });
  audit(req.user.id, 'CUSTOMER_DELETE', String(id));
  res.json({ ok: true });
}));

/* ---- Finance ---- */
r.get('/finance', wrap(async (_req, res) => {
  const sum = async (where) => (await prisma.order.aggregate({ where, _sum: { total: true }, _count: true }));
  const [paid, pendingCod, refunded] = await Promise.all([
    sum({ paymentStatus: 'PAID' }),
    sum({ paymentStatus: 'UNPAID', status: { notIn: ['CANCELLED'] } }),
    sum({ paymentStatus: 'REFUNDED' }),
  ]);
  const payments = await prisma.order.findMany({
    where: { status: { not: 'CANCELLED' } }, orderBy: { updatedAt: 'desc' }, take: 50,
    select: { id: true, code: true, total: true, paymentMethod: true, paymentStatus: true, updatedAt: true, customer: { select: { name: true } } },
  });
  res.json({
    collected: paid._sum.total || 0, collectedCount: paid._count,
    outstanding: pendingCod._sum.total || 0, outstandingCount: pendingCod._count,
    refunded: refunded._sum.total || 0, payments,
  });
}));

export default r;

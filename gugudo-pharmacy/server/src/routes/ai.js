import { Router } from 'express';
import { z } from 'zod';
import { prisma, wrap } from '../db.js';
import { optionalAuth, staff } from '../middleware/auth.js';

const r = Router();

async function claude(system, messages, max_tokens = 700) {
  if (!process.env.ANTHROPIC_API_KEY) throw Object.assign(new Error('AI assistant is not configured yet'), { status: 503 });
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6', max_tokens, system, messages }),
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error?.message || 'AI request failed'), { status: 502 });
  return data.content.filter((c) => c.type === 'text').map((c) => c.text).join('');
}

const LANGS = { en: 'English', om: 'Afaan Oromoo', am: 'Amharic (አማርኛ)' };

/* Customer assistant */
r.post('/chat', optionalAuth, wrap(async (req, res) => {
  const { messages, lang } = z.object({
    messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(3000) })).min(1).max(20),
    lang: z.enum(['en', 'om', 'am']).default('en'),
  }).parse(req.body);

  const products = await prisma.product.findMany({ where: { active: true }, take: 40, select: { name: true, price: true, stock: true, requiresRx: true } });
  let orderCtx = '';
  if (req.user) {
    const orders = await prisma.order.findMany({ where: { customerId: req.user.id }, orderBy: { createdAt: 'desc' }, take: 3, include: { items: true } });
    orderCtx = 'Customer recent orders:\n' + orders.map((o) => `${o.code}: ${o.status}, ${o.total} ETB, items: ${o.items.map((i) => i.name).join(', ')}`).join('\n');
  }
  const system = `You are the customer assistant for Gugudo Pharmacy, an online pharmacy in Ethiopia (prices in ETB).
Reply in ${LANGS[lang]}. Be brief, warm and clear.
You can: help find products from the catalog, explain how to order, upload a prescription, pay (cash on delivery), and track orders.
You are NOT a doctor: never diagnose or give personal dosing advice. For medical concerns, advise seeing a pharmacist or doctor; for emergencies, urge local emergency care.
Prescription-only medicines need an uploaded prescription at checkout.
Catalog: ${products.map((p) => `${p.name} (${p.price} ETB${p.requiresRx ? ', Rx' : ''}${p.stock === 0 ? ', out of stock' : ''})`).join('; ')}
${orderCtx}`;
  res.json({ reply: await claude(system, messages) });
}));

/* Admin: draft a product record from a short prompt */
r.post('/product-draft', ...staff, wrap(async (req, res) => {
  const { prompt } = z.object({ prompt: z.string().min(2).max(500) }).parse(req.body);
  const cats = (await prisma.category.findMany()).map((c) => c.name);
  const text = await claude(
    `You help a pharmacy admin fill a product form. Return ONLY minified JSON with keys: name, generic, description (max 300 chars, factual, no medical claims beyond standard labeling), category (one of: ${cats.join(', ')}), requiresRx (boolean), manufacturer. Use empty string when unknown. No markdown.`,
    [{ role: 'user', content: prompt }], 500);
  try {
    res.json(JSON.parse(text.replace(/```json|```/g, '').trim()));
  } catch {
    res.status(502).json({ error: 'The AI returned an unexpected answer. Try again.' });
  }
}));

/* Admin: draft a reply to a customer message */
r.post('/reply-draft', ...staff, wrap(async (req, res) => {
  const { thread } = z.object({ thread: z.array(z.object({ fromStaff: z.boolean(), body: z.string() })).min(1).max(30) }).parse(req.body);
  const messages = [{ role: 'user', content: 'Conversation so far:\n' + thread.map((m) => `${m.fromStaff ? 'Pharmacy' : 'Customer'}: ${m.body}`).join('\n') + '\n\nWrite the pharmacy\'s next reply.' }];
  res.json({ reply: await claude('You draft short, polite support replies for Gugudo Pharmacy staff. Match the customer\'s language. Do not give diagnoses or dosing advice; refer clinical questions to the pharmacist. Output only the reply text.', messages, 400) });
}));

export default r;

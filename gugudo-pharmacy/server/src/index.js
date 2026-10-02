import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { ZodError } from 'zod';

import authRoutes from './routes/auth.js';
import catalogRoutes from './routes/catalog.js';
import orderRoutes from './routes/orders.js';
import meRoutes from './routes/me.js';
import adminRoutes from './routes/admin.js';
import superRoutes from './routes/superadmin.js';
import aiRoutes from './routes/ai.js';

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing. Copy .env.example to .env first.');

const app = express();
app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(',') }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.resolve('uploads')));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api', catalogRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/me', meRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/super', superRoutes);
app.use('/api/ai', aiRoutes);

app.use((err, _req, res, _next) => {
  if (err instanceof ZodError) return res.status(400).json({ error: err.issues[0]?.message || 'Invalid input' });
  if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
  if (!err.status) console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : err.message?.includes('files are allowed') ? err.message : 'Something went wrong' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));

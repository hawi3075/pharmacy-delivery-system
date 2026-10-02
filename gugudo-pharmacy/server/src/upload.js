import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const dir = path.resolve('uploads');
fs.mkdirSync(dir, { recursive: true });

export const upload = multer({
  storage: multer.diskStorage({
    destination: dir,
    filename: (_req, file, cb) => cb(null, crypto.randomBytes(12).toString('hex') + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /\.(png|jpe?g|webp|pdf)$/i.test(file.originalname);
    cb(ok ? null : new Error('Only PNG, JPG, WEBP or PDF files are allowed'), ok);
  },
});
export const fileUrl = (f) => (f ? `/uploads/${f.filename}` : undefined);

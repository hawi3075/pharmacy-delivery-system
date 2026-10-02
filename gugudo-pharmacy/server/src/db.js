import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export const audit = (actorId, action, detail) =>
  prisma.auditLog.create({ data: { actorId, action, detail } }).catch(() => {});

import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const prisma = new PrismaClient();
const AUTH_SECRET = process.env.AUTH_SECRET || 'fallback-secret-development-key';

const PALETTE = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default async function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.spinduck_token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let userPayload;
  try {
    userPayload = jwt.verify(token, AUTH_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  const user = await prisma.user.findUnique({ where: { id: userPayload.userId } });
  if (!user || user.isBanned) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method === 'GET') {
    try {
      const spins = await prisma.spin.findMany({
        where: { ownerId: user.id },
        include: { options: true },
        orderBy: { createdAt: 'desc' }
      });
      return res.status(200).json({ spins });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch spins' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, options } = req.body;

      if (!title || !options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ error: 'A title and at least 2 options are required' });
      }

      if (options.length > 100) {
        return res.status(400).json({ error: 'Maximum 100 options allowed per spin' });
      }

      // Enforce 2 Free Spin Limit
      const FREE_LIMIT = 2;
      const canCreate = user.freeSpinsUsed < FREE_LIMIT || user.paidSpinCredits > 0;

      if (!canCreate) {
        return res.status(402).json({
          error: 'Your free Spin limit has been reached. Please upgrade to create additional wheels.'
        });
      }

      const result = await prisma.$transaction(async (tx) => {
        let isFree = false;
        if (user.freeSpinsUsed < FREE_LIMIT) {
          isFree = true;
          await tx.user.update({
            where: { id: user.id },
            data: { freeSpinsUsed: { increment: 1 } }
          });
        } else {
          await tx.user.update({
            where: { id: user.id },
            data: { paidSpinCredits: { decrement: 1 } }
          });
        }

        const spin = await tx.spin.create({
          data: {
            title,
            ownerId: user.id,
            options: {
              create: options.map((opt, index) => ({
                label: typeof opt === 'string' ? opt : opt.label,
                color: PALETTE[index % PALETTE.length],
                order: index
              }))
            }
          },
          include: { options: true }
        });

        return spin;
      });

      return res.status(201).json({ spin: result });
    } catch (err) {
      console.error('Create Spin Error:', err);
      return res.status(500).json({ error: 'Failed to create spin wheel' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

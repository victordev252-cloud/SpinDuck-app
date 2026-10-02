import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const prisma = new PrismaClient();
const AUTH_SECRET = process.env.AUTH_SECRET || 'fallback-secret-development-key';

export default async function handler(req, res) {
  const { id } = req.query;
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.spinduck_token;

  let currentUser = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, AUTH_SECRET);
      currentUser = await prisma.user.findUnique({ where: { id: decoded.userId } });
    } catch {}
  }

  if (req.method === 'GET') {
    try {
      const spin = await prisma.spin.findUnique({
        where: { id: String(id) },
        include: {
          options: { orderBy: { order: 'asc' } },
          results: { orderBy: { createdAt: 'desc' }, take: 10 }
        }
      });

      if (!spin || spin.isDisabled) {
        return res.status(404).json({ error: 'Spin wheel not found or disabled' });
      }

      return res.status(200).json({ spin });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch spin' });
    }
  }

  if (req.method === 'POST') {
    // Action: Spin Execution (Server side calculation for security)
    try {
      const spin = await prisma.spin.findUnique({
        where: { id: String(id) },
        include: { options: true }
      });

      if (!spin || spin.isDisabled) {
        return res.status(404).json({ error: 'Spin wheel not available' });
      }

      if (!spin.options || spin.options.length === 0) {
        return res.status(400).json({ error: 'Spin wheel has no options' });
      }

      // Secure Server Selection
      const randomIndex = Math.floor(Math.random() * spin.options.length);
      const selectedOption = spin.options[randomIndex];

      const spinResult = await prisma.$transaction(async (tx) => {
        await tx.spin.update({
          where: { id: spin.id },
          data: { spinCount: { increment: 1 } }
        });

        return await tx.spinResult.create({
          data: {
            spinId: spin.id,
            userId: currentUser ? currentUser.id : null,
            selectedOption: selectedOption.label
          }
        });
      });

      return res.status(200).json({
        winningIndex: randomIndex,
        result: spinResult
      });
    } catch (err) {
      console.error('Spin Execution Error:', err);
      return res.status(500).json({ error: 'Failed to execute spin' });
    }
  }

  if (req.method === 'DELETE') {
    if (!currentUser) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const spin = await prisma.spin.findUnique({ where: { id: String(id) } });
      if (!spin) return res.status(404).json({ error: 'Spin not found' });

      if (spin.ownerId !== currentUser.id && currentUser.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Permission denied' });
      }

      await prisma.spin.delete({ where: { id: String(id) } });
      return res.status(200).json({ success: true, message: 'Spin wheel deleted successfully' });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete spin' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

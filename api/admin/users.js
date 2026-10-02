import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const prisma = new PrismaClient();
const AUTH_SECRET = process.env.AUTH_SECRET || 'fallback-secret-development-key';

async function verifyAdmin(req) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.spinduck_token;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, AUTH_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    return (user && user.role === 'ADMIN' && !user.isBanned) ? user : null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const admin = await verifyAdmin(req);
  if (!admin) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  if (req.method === 'GET') {
    const { search, filter } = req.query;
    try {
      const whereClause = {};

      if (search) {
        whereClause.OR = [
          { username: { contains: String(search), mode: 'insensitive' } },
          { displayName: { contains: String(search), mode: 'insensitive' } }
        ];
      }

      if (filter === 'banned') whereClause.isBanned = true;
      if (filter === 'upgraded') whereClause.isUpgraded = true;

      const users = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          username: true,
          displayName: true,
          email: true,
          role: true,
          isBanned: true,
          banReason: true,
          warningCount: true,
          freeSpinsUsed: true,
          paidSpinCredits: true,
          isUpgraded: true,
          createdAt: true,
          lastLogin: true,
          _count: { select: { spins: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json({ users });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to load users' });
    }
  }

  if (req.method === 'POST') {
    const { action, userId, reason, amount } = req.body;

    if (!userId) return res.status(400).json({ error: 'User ID required' });

    try {
      if (action === 'ban') {
        await prisma.user.update({
          where: { id: userId },
          data: { isBanned: true, banReason: reason || 'Suspended by admin' }
        });
        await prisma.adminAuditLog.create({
          data: {
            adminId: admin.id,
            action: 'ADMIN_BANNED_USER',
            targetUserId: userId,
            description: `Banned user with reason: ${reason || 'N/A'}`
          }
        });
        return res.status(200).json({ success: true, message: 'User banned' });
      }

      if (action === 'unban') {
        await prisma.user.update({
          where: { id: userId },
          data: { isBanned: false, banReason: null }
        });
        await prisma.adminAuditLog.create({
          data: {
            adminId: admin.id,
            action: 'ADMIN_UNBANNED_USER',
            targetUserId: userId,
            description: 'Unbanned user'
          }
        });
        return res.status(200).json({ success: true, message: 'User unbanned' });
      }

      if (action === 'warn') {
        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: { warningCount: { increment: 1 } }
          }),
          prisma.warning.create({
            data: { userId, reason: reason || 'Violation of terms' }
          }),
          prisma.notification.create({
            data: {
              userId,
              title: 'Account Warning Issued',
              message: reason || 'Please adhere to SpinDuck content rules.',
              type: 'WARNING'
            }
          }),
          prisma.adminAuditLog.create({
            data: {
              adminId: admin.id,
              action: 'ADMIN_SENT_WARNING',
              targetUserId: userId,
              description: `Warning: ${reason || 'N/A'}`
            }
          })
        ]);
        return res.status(200).json({ success: true, message: 'Warning issued' });
      }

      if (action === 'add_credit') {
        const qty = parseInt(amount || 1, 10);
        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: { paidSpinCredits: { increment: qty }, isUpgraded: true }
          }),
          prisma.notification.create({
            data: {
              userId,
              title: 'Spin Credits Granted',
              message: `An administrator granted you ${qty} Spin Credit(s).`,
              type: 'SUCCESS'
            }
          }),
          prisma.adminAuditLog.create({
            data: {
              adminId: admin.id,
              action: 'ADMIN_GRANTED_CREDIT',
              targetUserId: userId,
              description: `Granted ${qty} credits`
            }
          })
        ]);
        return res.status(200).json({ success: true, message: 'Credits granted' });
      }
    } catch (err) {
      console.error('Admin User Action Error:', err);
      return res.status(500).json({ error: 'Failed to complete admin action' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const prisma = new PrismaClient();
const AUTH_SECRET = process.env.AUTH_SECRET || 'fallback-secret-development-key';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.spinduck_token;

  if (!token) {
    return res.status(401).json({ user: null });
  }

  try {
    const decoded = jwt.verify(token, AUTH_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        role: true,
        isBanned: true,
        warningCount: true,
        freeSpinsUsed: true,
        paidSpinCredits: true,
        isUpgraded: true,
        createdAt: true
      }
    });

    if (!user || user.isBanned) {
      return res.status(401).json({ user: null });
    }

    return res.status(200).json({ user });
  } catch (err) {
    return res.status(401).json({ user: null });
  }
}

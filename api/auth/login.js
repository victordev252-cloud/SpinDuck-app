import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const prisma = new PrismaClient();
const AUTH_SECRET = process.env.AUTH_SECRET || 'fallback-secret-development-key';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: `Account suspended. Reason: ${user.banReason || 'Policy violation'}` });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      AUTH_SECRET,
      { expiresIn: '7d' }
    );

    res.setHeader(
      'Set-Cookie',
      cookie.serialize('spinduck_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 604800,
        path: '/'
      })
    );

    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        freeSpinsUsed: user.freeSpinsUsed,
        paidSpinCredits: user.paidSpinCredits,
        isUpgraded: user.isUpgraded
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
}

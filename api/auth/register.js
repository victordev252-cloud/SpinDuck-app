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
    const { username, displayName, email, password, confirmPassword } = req.body;

    if (!username || !displayName || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.toLowerCase() },
          email ? { email: email.toLowerCase() } : undefined
        ].filter(Boolean)
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username or Email is already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        displayName,
        email: email ? email.toLowerCase() : null,
        passwordHash,
        notifications: {
          create: {
            title: 'Welcome to SpinDuck!',
            message: 'You have 2 free Spins ready to use. Create your first wheel now!',
            type: 'SUCCESS'
          }
        }
      }
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

    return res.status(201).json({
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
    console.error('Registration Error:', err);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
}

import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const prisma = new PrismaClient();
const AUTH_SECRET = process.env.AUTH_SECRET || 'fallback-secret-development-key';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.spinduck_token;

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, AUTH_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || user.isBanned) {
      return res.status(403).json({ error: 'Account suspended' });
    }

    // Creating initial pending payment transaction record
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: 0.50,
        currency: 'USD',
        status: 'PENDING',
        creditsBought: 1
      }
    });

    // Isolated Payment Gateway Connector simulation/abstraction
    // Seamless integration point for Stripe Checkout Session or Square URL creation
    const checkoutUrl = `${process.env.APP_URL || 'http://localhost:5173'}/upgrade?payment_id=${payment.id}&simulated=true`;

    return res.status(200).json({
      paymentId: payment.id,
      checkoutUrl,
      message: 'Payment session created successfully'
    });
  } catch (err) {
    console.error('Payment Create Error:', err);
    return res.status(500).json({ error: 'Failed to create payment session' });
  }
}

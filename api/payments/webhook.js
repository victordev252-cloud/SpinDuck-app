import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId, status, secret } = req.body;

    // Optional verification check against PAYMENT_WEBHOOK_SECRET
    if (process.env.PAYMENT_WEBHOOK_SECRET && secret !== process.env.PAYMENT_WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    if (payment.status === 'COMPLETED') {
      return res.status(200).json({ message: 'Already processed' });
    }

    if (status === 'COMPLETED' || status === 'SUCCESS') {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'COMPLETED' }
        });

        await tx.user.update({
          where: { id: payment.userId },
          data: {
            paidSpinCredits: { increment: payment.creditsBought },
            isUpgraded: true
          }
        });

        await tx.notification.create({
          data: {
            userId: payment.userId,
            title: 'Spin Credit Unlocked!',
            message: `Your payment of $${payment.amount.toFixed(2)} was verified. 1 Spin Credit has been added to your account.`,
            type: 'SUCCESS'
          }
        });
      });

      return res.status(200).json({ success: true, message: 'Credits granted' });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' }
    });

    return res.status(200).json({ success: false, message: 'Payment marked failed' });
  } catch (err) {
    console.error('Payment Webhook Error:', err);
    return res.status(500).json({ error: 'Internal server error processing webhook' });
  }
}

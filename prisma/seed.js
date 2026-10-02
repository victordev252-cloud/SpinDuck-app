import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'spinduck@gmail.com';
  const rawPassword = 'ANASMENO1@';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      displayName: 'SpinDuck Admin',
      email: adminEmail,
      passwordHash: hashedPassword,
      role: 'ADMIN',
      isUpgraded: true,
      paidSpinCredits: 9999
    }
  });

  console.log('Seeded Admin account:', admin.username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

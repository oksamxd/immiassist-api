import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Seeding ImmiAssist database...');

  // 1. Create Support Agent
  const supportUser = await prisma.user.upsert({
    where: { email: 'support@immiassist.com' },
    update: {},
    create: {
      name: 'Alex Support',
      email: 'support@immiassist.com',
      passwordHash: hashPassword('password123'),
      role: 'SUPPORT',
    },
  });

  await prisma.supportAgent.upsert({
    where: { userId: supportUser.id },
    update: {},
    create: {
      userId: supportUser.id,
      name: 'Alex Support',
      languages: ['English', 'Spanish'],
      isAvailable: true,
    },
  });

  // 2. Create Lawyer
  const lawyerUser = await prisma.user.upsert({
    where: { email: 'lawyer@immiassist.com' },
    update: {},
    create: {
      name: 'Sarah Lawyer',
      email: 'lawyer@immiassist.com',
      passwordHash: hashPassword('password123'),
      role: 'LAWYER',
    },
  });

  await prisma.lawyer.upsert({
    where: { userId: lawyerUser.id },
    update: {},
    create: {
      userId: lawyerUser.id,
      name: 'Sarah Lawyer',
      specialization: ['Immigration', 'Visa Denials'],
      languages: ['English'],
      barNumber: 'BAR123456',
      rating: 4.9,
    },
  });

  // 3. Create Admin
  await prisma.user.upsert({
    where: { email: 'admin@immiassist.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@immiassist.com',
      passwordHash: hashPassword('admin123'),
      role: 'ADMIN',
    },
  });

  console.log('✅ Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

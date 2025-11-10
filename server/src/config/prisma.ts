import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function connectDB() {
  await prisma.$connect();
  console.log('🗄️ Prisma connected to Postgres');
}

export async function disconnectDB() {
  await prisma.$disconnect();
  console.log('🗄️ Prisma disconnected');
}

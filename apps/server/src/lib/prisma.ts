import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (
      retries > 0 &&
      (error.message?.includes('Connection reset') ||
        error.message?.includes('connection') ||
        error.code === 'P1001' ||
        error.code === 'P1002')
    ) {
      console.warn(`[prisma] Connection error, retrying... (${retries} left)`);
      await new Promise(r => setTimeout(r, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

import { PrismaClient } from '@prisma/client'
import { env } from './env.js'
import { logger } from './logger.js'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.IS_DEVELOPMENT ? ['warn', 'error'] : ['error'],
    errorFormat: env.IS_DEVELOPMENT ? 'pretty' : 'minimal',
  })

if (!env.IS_PRODUCTION) {
  globalForPrisma.prisma = prisma
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect()
    logger.info('✅ Database connected')
  } catch (error) {
    logger.error({ error }, '❌ Database connection failed')
    throw error
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
  logger.info('Database disconnected')
}
import { redisGet, redisSet } from './redis'
import { prisma } from './prisma'

const TTL_SECONDS = 86400 // 24 horas

export async function checkIdempotency(
  key: string,
  type: 'payment' | 'request'
): Promise<{ isDuplicate: boolean; metadata?: any }> {
  const redisKey = `idempotency:${type}:${key}`
  const cached = await redisGet(redisKey)

  if (cached) {
    return { isDuplicate: true, metadata: JSON.parse(cached) }
  }

  const existing = await prisma.idempotencyKey.findUnique({
    where: { key: `${type}:${key}` }
  })

  if (existing && existing.expiresAt > new Date()) {
    return {
      isDuplicate: true,
      metadata: existing.metadata ? JSON.parse(existing.metadata) : undefined
    }
  }

  return { isDuplicate: false }
}

export async function markUsed(
  key: string,
  type: 'payment' | 'request',
  metadata?: object
): Promise<void> {
  const metaStr = metadata ? JSON.stringify(metadata) : undefined
  const redisKey = `idempotency:${type}:${key}`
  const expiresAt = new Date(Date.now() + TTL_SECONDS * 1000)

  await redisSet(redisKey, metaStr || '{}', TTL_SECONDS)

  await prisma.idempotencyKey.upsert({
    where: { key: `${type}:${key}` },
    update: { usedAt: new Date(), expiresAt, metadata: metaStr },
    create: {
      key: `${type}:${key}`,
      type,
      expiresAt,
      metadata: metaStr
    }
  })
}

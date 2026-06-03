import { redisIncr, redis } from './redis'
import { prisma } from './prisma'

interface RateLimitConfig {
  identifier: string
  type: 'ip' | 'wallet' | 'apikey' | 'user'
  window: 'minute' | 'hour' | 'day'
  limit: number
}

const WINDOW_SECONDS = {
  minute: 60,
  hour: 3600,
  day: 86400,
}

/**
 * Sliding window rate limit via Redis sorted sets.
 * More accurate than fixed-window incr — no burst at window boundary.
 */
export async function slidingWindowRateLimit(
  identifier: string,
  windowMs: number,
  limit: number
): Promise<{ allowed: boolean; count: number; remaining: number }> {
  if (!redis) {
    // Redis not available — allow all (fallback)
    return { allowed: true, count: 0, remaining: limit }
  }

  const now = Date.now()
  const key = `sw:${identifier}`
  const windowStart = now - windowMs

  try {
    const pipeline = redis.pipeline()
    pipeline.zadd(key, now, `${now}-${Math.random()}`)
    pipeline.zremrangebyscore(key, 0, windowStart)
    pipeline.zcard(key)
    pipeline.pexpire(key, windowMs)
    const results = await pipeline.exec()

    const count = (results?.[2]?.[1] as number) ?? 0
    const remaining = Math.max(0, limit - count)

    return { allowed: count <= limit, count, remaining }
  } catch {
    return { allowed: true, count: 0, remaining: limit }
  }
}

export async function checkRateLimit(
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const { identifier, type, window, limit } = config
  const ttl = WINDOW_SECONDS[window]
  const redisKey = `ratelimit:${type}:${identifier}:${window}`

  const count = await redisIncr(redisKey, ttl)

  if (count !== 0) {
    const remaining = Math.max(0, limit - count)
    return {
      allowed: count <= limit,
      remaining,
      resetIn: ttl,
    }
  }

  // Fallback para banco se Redis down
  const now = new Date()
  const resetAt = new Date(now.getTime() + ttl * 1000)

  const existing = await prisma.rateLimitEntry.findUnique({
    where: { identifier_type_window: { identifier, type, window } }
  })

  const entry = await prisma.rateLimitEntry.upsert({
    where: { identifier_type_window: { identifier, type, window } },
    update: {
      count: { increment: 1 },
      resetAt: existing && now > existing.resetAt ? resetAt : undefined,
    },
    create: { identifier, type, window, count: 1, resetAt }
  })

  const remaining = Math.max(0, limit - entry.count)
  return {
    allowed: entry.count <= limit,
    remaining,
    resetIn: Math.max(0, Math.floor((entry.resetAt.getTime() - now.getTime()) / 1000))
  }
}

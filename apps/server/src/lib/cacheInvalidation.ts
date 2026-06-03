import { redis, redisDel } from './redis'

/**
 * Invalidates all dashboard/analytics cache keys for a user.
 * Call after any new transaction or ApiCall is created.
 */
export async function invalidateDashboardCache(userId: string): Promise<void> {
  if (!redis) return
  try {
    const keys = await redis.keys(`*:${userId}*`)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (e) {
    // fire-and-forget — log but never throw
    console.error('[cacheInvalidation] failed:', (e as Error).message)
  }
}

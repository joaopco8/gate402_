import Redis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL

if (!REDIS_URL) {
  console.warn('[redis] REDIS_URL not configured — using in-memory fallback')
}

const _redis = REDIS_URL
  ? new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      lazyConnect: true,
    })
  : null

if (_redis) {
  _redis.on('error', (err: Error) => {
    console.error('[redis] connection error:', err.message)
  })
}

export const redis = _redis

export async function redisGet(key: string): Promise<string | null> {
  if (!redis) return null
  try { return await redis.get(key) }
  catch { return null }
}

export async function redisSet(
  key: string,
  value: string,
  ttlSeconds?: number
): Promise<void> {
  if (!redis) return
  try {
    if (ttlSeconds) await redis.setex(key, ttlSeconds, value)
    else await redis.set(key, value)
  } catch (e) {
    console.error('[redis] set error:', e)
  }
}

export async function redisDel(key: string): Promise<void> {
  if (!redis) return
  try { await redis.del(key) }
  catch {}
}

export async function redisIncr(
  key: string,
  ttlSeconds?: number
): Promise<number> {
  if (!redis) return 0
  try {
    const count = await redis.incr(key)
    if (ttlSeconds && count === 1) await redis.expire(key, ttlSeconds)
    return count
  } catch { return 0 }
}

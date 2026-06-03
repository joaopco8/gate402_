import { redis, redisGet, redisSet, redisDel } from './redis'
import { prisma } from './prisma'

const TTL = 300 // 5 minutes

interface CachedApiKeyUser {
  id: string
  supabaseId: string
  network: string
  walletAddress: string | null
  plan: string
  apiKey: string
}

export async function getUserByApiKey(apiKey: string): Promise<CachedApiKeyUser | null> {
  const cacheKey = `apikey:${apiKey}`

  const cached = await redisGet(cacheKey)
  if (cached) {
    try { return JSON.parse(cached) } catch { /* fall through */ }
  }

  const user = await prisma.user.findUnique({
    where: { apiKey },
    select: {
      id: true,
      supabaseId: true,
      network: true,
      walletAddress: true,
      plan: true,
      apiKey: true,
    },
  })

  if (!user) return null

  await redisSet(cacheKey, JSON.stringify(user), TTL)
  return user
}

export async function invalidateApiKey(apiKey: string): Promise<void> {
  await redisDel(`apikey:${apiKey}`)
}

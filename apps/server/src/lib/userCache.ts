import { prisma } from './prisma'

interface CachedUser { id: string; plan: string; ts: number }

const cache = new Map<string, CachedUser>()
const TTL = 5 * 60 * 1000 // 5 min

/** Resolves supabaseId → { id, plan } with in-memory cache.
 *  Eliminates the sequential RTT1 before every parallel query batch. */
export async function getCachedUser(supabaseId: string): Promise<{ id: string; plan: string } | null> {
  const hit = cache.get(supabaseId)
  if (hit && Date.now() - hit.ts < TTL) return { id: hit.id, plan: hit.plan }

  const user = await prisma.user.findUnique({
    where: { supabaseId },
    select: { id: true, plan: true },
  })
  if (!user) return null
  cache.set(supabaseId, { ...user, ts: Date.now() })
  return { id: user.id, plan: user.plan }
}

export function evictUser(supabaseId: string) {
  cache.delete(supabaseId)
}

import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { redisGet, redisSet } from '../lib/redis'

const router = Router()

// In-memory user cache to eliminate sequential round trip (supabaseId → user row)
const userCache = new Map<string, { user: any; ts: number }>()
const USER_CACHE_TTL = 5 * 60 * 1000 // 5 min

async function getCachedUser(supabaseId: string) {
  const hit = userCache.get(supabaseId)
  if (hit && Date.now() - hit.ts < USER_CACHE_TTL) return hit.user
  const user = await prisma.user.findUnique({
    where: { supabaseId },
    include: {
      endpoints: {
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { calls: true } } },
      },
    },
  })
  if (user) userCache.set(supabaseId, { user, ts: Date.now() })
  return user
}

export function invalidateDashboardCache(supabaseId: string) {
  userCache.delete(supabaseId)
}

// GET /api/dashboard — single aggregated endpoint for the dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string
    if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' })

    const rawDays = parseInt(req.query.days as string) || 7

    // Redis full-response cache (30s TTL) — eliminates both round trips on cache hit
    const cacheKey = `dash:${supabaseId}:d${rawDays}`
    const cached = await redisGet(cacheKey)
    if (cached) {
      res.setHeader('X-Cache', 'HIT')
      return res.json(JSON.parse(cached))
    }

    // Resolve user from in-memory cache (eliminates 1st sequential round trip on warm requests)
    const user = await getCachedUser(supabaseId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterdayStart = new Date(today)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    const yesterdayEnd = today

    const weekStart = new Date(Date.now() - 7 * 24 * 3600 * 1000)
    const lastWeekStart = new Date(Date.now() - 14 * 24 * 3600 * 1000)
    const lastWeekEnd = weekStart

    const chartDays = user.plan === 'pro' ? Math.min(rawDays, 90) : Math.min(rawDays, 7)
    const sinceN = new Date(Date.now() - chartDays * 24 * 3600 * 1000)

    const callLimit = user.plan === 'pro' ? 50 : 5

    const [
      totalCalls,
      callsToday,
      callsYesterday,
      revenueAll,
      revenueToday,
      revenueYesterday,
      callsThisWeek,
      callsLastWeek,
      revenueThisWeek,
      revenueLastWeek,
      recentCalls,
      perDay,
    ] = await Promise.all([
      prisma.apiCall.count({ where: { userId: user.id } }),
      prisma.apiCall.count({ where: { userId: user.id, createdAt: { gte: today } } }),
      prisma.apiCall.count({ where: { userId: user.id, createdAt: { gte: yesterdayStart, lt: yesterdayEnd } } }),
      prisma.apiCall.aggregate({ where: { userId: user.id }, _sum: { amountUsdc: true } }),
      prisma.apiCall.aggregate({ where: { userId: user.id, createdAt: { gte: today } }, _sum: { amountUsdc: true } }),
      prisma.apiCall.aggregate({ where: { userId: user.id, createdAt: { gte: yesterdayStart, lt: yesterdayEnd } }, _sum: { amountUsdc: true } }),
      prisma.apiCall.count({ where: { userId: user.id, createdAt: { gte: weekStart } } }),
      prisma.apiCall.count({ where: { userId: user.id, createdAt: { gte: lastWeekStart, lt: lastWeekEnd } } }),
      prisma.apiCall.aggregate({ where: { userId: user.id, createdAt: { gte: weekStart } }, _sum: { amountUsdc: true } }),
      prisma.apiCall.aggregate({ where: { userId: user.id, createdAt: { gte: lastWeekStart, lt: lastWeekEnd } }, _sum: { amountUsdc: true } }),
      prisma.apiCall.findMany({
        where: { userId: user.id },
        include: { endpoint: { select: { path: true } } },
        orderBy: { createdAt: 'desc' },
        take: callLimit,
      }),
      prisma.$queryRaw<Array<{ date: Date; count: number; amount: number }>>`
        SELECT
          DATE("createdAt") as date,
          COUNT(id)::int as count,
          COALESCE(SUM("amountUsdc"), 0)::float as amount
        FROM "ApiCall"
        WHERE "userId" = ${user.id}
          AND "createdAt" >= ${sinceN}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
    ])

    // Fill all days in range including days with zero activity
    const days = []
    for (let i = chartDays - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const found = (perDay as any[]).find(r => {
        const rowDate = new Date(r.date).toISOString().split('T')[0]
        return rowDate === dateStr
      })
      days.push({
        date: d.toISOString(),
        count: found?.count ?? 0,
        amount: found?.amount ?? 0,
      })
    }

    const payload = {
      user: {
        id: user.id,
        plan: user.plan,
        network: user.network,
        walletAddress: user.walletAddress,
        apiKey: user.apiKey,
        emailAlerts: user.emailAlerts,
        limits: {
          maxEndpoints: user.plan === 'pro' ? -1 : 3,
          recentCallsLimit: callLimit,
          chartDays: user.plan === 'pro' ? 90 : 7,
          hasAnalytics: user.plan === 'pro',
          hasMRR: user.plan === 'pro',
        },
      },
      metrics: {
        totalCalls,
        callsToday,
        callsYesterday,
        totalUsdc: revenueAll._sum.amountUsdc ?? 0,
        usdcToday: revenueToday._sum.amountUsdc ?? 0,
        usdcYesterday: revenueYesterday._sum.amountUsdc ?? 0,
        callsThisWeek,
        callsLastWeek,
        revenueThisWeek: revenueThisWeek._sum.amountUsdc ?? 0,
        revenueLastWeek: revenueLastWeek._sum.amountUsdc ?? 0,
      },
      recentCalls: recentCalls.map(c => ({
        id: c.id,
        endpoint: c.endpoint?.path ?? '—',
        amountUsdc: c.amountUsdc,
        payerWallet: c.payerWallet,
        status: c.status,
        createdAt: c.createdAt,
      })),
      callsPerDay: days,
      endpoints: user.endpoints.map(ep => ({
        id: ep.id,
        path: ep.path,
        priceUsdc: ep.priceUsdc,
        active: ep.active,
        description: ep.description,
        totalCalls: ep._count.calls,
        createdAt: ep.createdAt,
      })),
    }

    // Cache full response in Redis for 30s (fire-and-forget)
    redisSet(cacheKey, JSON.stringify(payload), 30).catch(() => {})

    return res.json(payload)
  } catch (err) {
    console.error('[dashboard]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

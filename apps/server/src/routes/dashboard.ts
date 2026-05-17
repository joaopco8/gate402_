import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /api/dashboard — single aggregated endpoint for the dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string
    if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' })

    const user = await prisma.user.findUnique({
      where: { supabaseId },
      include: {
        endpoints: {
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { calls: true } } },
        },
      },
    })

    if (!user) return res.status(404).json({ error: 'User not found' })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const rawDays = parseInt(req.query.days as string) || 7
    const chartDays = user.plan === 'pro' ? Math.min(rawDays, 90) : Math.min(rawDays, 7)
    const sinceN = new Date(Date.now() - chartDays * 24 * 3600 * 1000)

    const callLimit = user.plan === 'pro' ? 50 : 5

    const [
      totalCalls,
      callsToday,
      revenueAll,
      revenueToday,
      recentCalls,
      perDay,
    ] = await Promise.all([
      prisma.apiCall.count({ where: { userId: user.id } }),
      prisma.apiCall.count({ where: { userId: user.id, createdAt: { gte: today } } }),
      prisma.apiCall.aggregate({ where: { userId: user.id }, _sum: { amountUsdc: true } }),
      prisma.apiCall.aggregate({ where: { userId: user.id, createdAt: { gte: today } }, _sum: { amountUsdc: true } }),
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

    return res.json({
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
        totalUsdc: revenueAll._sum.amountUsdc ?? 0,
        usdcToday: revenueToday._sum.amountUsdc ?? 0,
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
    })
  } catch (err) {
    console.error('[dashboard]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

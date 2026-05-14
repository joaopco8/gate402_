import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { getRevenueStats } from '../lib/revenueLog'

const router = Router()

router.post('/admin/set-plan', async (req, res) => {
  const adminSecret = req.headers['x-admin-secret'] as string

  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { supabaseId, plan } = req.body

  if (!['free', 'pro', 'enterprise'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan. Must be: free, pro, enterprise' })
  }

  const user = await prisma.user.update({
    where: { supabaseId },
    data: { plan },
  })

  return res.json({
    supabaseId: user.supabaseId,
    plan: user.plan,
    message: `Plan updated to ${plan}`,
  })
})

router.get('/admin/revenue', async (req, res) => {
  const adminSecret = req.headers['x-admin-secret'] as string
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const [revenueStats, recentFees, topProviders] = await Promise.all([
    prisma.revenueLog.aggregate({
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.revenueLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.transaction.groupBy({
      by: ['userId'],
      _sum: { totalAmount: true, platformFee: true },
      _count: { id: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: 10,
    }),
  ])

  return res.json({
    totalRevenue: revenueStats._sum.amount ?? 0,
    totalTransactions: revenueStats._count.id,
    recentFees,
    topProviders,
  })
})

export default router

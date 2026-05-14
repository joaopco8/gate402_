import { prisma } from './prisma'

export async function logRevenue(params: {
  source: 'platform_fee' | 'subscription'
  amount: number
  txHash?: string
  userId?: string
  description?: string
}) {
  try {
    await prisma.revenueLog.create({
      data: {
        source: params.source,
        amount: params.amount,
        currency: 'USDC',
        txHash: params.txHash,
        userId: params.userId,
        description: params.description,
      }
    })
    console.log(`[revenue] Logged ${params.source}: ${params.amount} USDC`)
  } catch (error) {
    console.error('[revenue] Failed to log revenue:', error)
  }
}

export async function getRevenueStats() {
  const [total, today, bySource] = await Promise.all([
    prisma.revenueLog.aggregate({ _sum: { amount: true } }),
    prisma.revenueLog.aggregate({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      _sum: { amount: true }
    }),
    prisma.revenueLog.groupBy({
      by: ['source'],
      _sum: { amount: true }
    })
  ])

  return {
    totalRevenue: total._sum.amount || 0,
    todayRevenue: today._sum.amount || 0,
    bySource: bySource.map(s => ({
      source: s.source,
      amount: s._sum.amount || 0
    }))
  }
}

import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// POST /api/metering/record — register a usage metric
router.post('/metering/record', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string
    const apiKey = req.headers['x-api-key'] as string

    if (!supabaseId && !apiKey) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = supabaseId
      ? await prisma.user.findUnique({ where: { supabaseId } })
      : await prisma.user.findUnique({ where: { apiKey } })

    if (!user) return res.status(404).json({ error: 'User not found' })

    const { endpointId, requestId, metricType, metricValue, unit, pricePerUnit } = req.body

    if (!metricType || metricValue === undefined || !pricePerUnit) {
      return res.status(400).json({ error: 'metricType, metricValue, pricePerUnit required' })
    }

    const totalPrice = parseFloat((metricValue * pricePerUnit).toFixed(8))

    const metric = await prisma.usageMetric.create({
      data: {
        userId: user.id,
        endpointId: endpointId || '',
        requestId: requestId || null,
        metricType,
        metricValue,
        unit: unit || 'count',
        pricePerUnit,
        totalPrice,
        settledAt: null,
      }
    })

    return res.status(201).json({
      id: metric.id,
      metricType,
      metricValue,
      unit,
      pricePerUnit,
      totalPrice,
      settled: false,
    })

  } catch (error: unknown) {
    console.error('[metering/record] Error:', error)
    return res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/metering/pending — unsettled metrics
router.get('/metering/pending', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string
    const apiKey = req.headers['x-api-key'] as string

    const user = supabaseId
      ? await prisma.user.findUnique({ where: { supabaseId } })
      : await prisma.user.findUnique({ where: { apiKey } })

    if (!user) return res.status(404).json({ error: 'User not found' })

    const pending = await prisma.usageMetric.findMany({
      where: { userId: user.id, settledAt: null },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    const totalOwed = pending.reduce((sum, m) => sum + m.totalPrice, 0)

    return res.json({
      pending,
      totalOwed: parseFloat(totalOwed.toFixed(8)),
      count: pending.length
    })

  } catch (error: unknown) {
    return res.status(500).json({ error: (error as Error).message })
  }
})

// POST /api/metering/settle — mark metrics as paid
router.post('/metering/settle', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'] as string
    if (!apiKey) return res.status(401).json({ error: 'x-api-key required' })

    const user = await prisma.user.findUnique({ where: { apiKey } })
    if (!user) return res.status(401).json({ error: 'Invalid API key' })

    const { metricIds, txHash } = req.body

    if (!metricIds?.length || !txHash) {
      return res.status(400).json({ error: 'metricIds and txHash required' })
    }

    await prisma.usageMetric.updateMany({
      where: { id: { in: metricIds }, userId: user.id, settledAt: null },
      data: { settledAt: new Date() }
    })

    return res.json({ settled: metricIds.length, txHash, message: 'Metrics marked as settled' })

  } catch (error: unknown) {
    return res.status(500).json({ error: (error as Error).message })
  }
})

// GET /api/metering/stats — usage stats by metric type
router.get('/metering/stats', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string
    const user = await prisma.user.findUnique({ where: { supabaseId } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const stats = await prisma.usageMetric.groupBy({
      by: ['metricType'],
      where: { userId: user.id },
      _sum: { metricValue: true, totalPrice: true },
      _count: { id: true }
    })

    const settled = await prisma.usageMetric.aggregate({
      where: { userId: user.id, settledAt: { not: null } },
      _sum: { totalPrice: true }
    })

    const pending = await prisma.usageMetric.aggregate({
      where: { userId: user.id, settledAt: null },
      _sum: { totalPrice: true }
    })

    return res.json({
      byType: stats.map(s => ({
        type: s.metricType,
        totalUsage: s._sum.metricValue || 0,
        totalCost: s._sum.totalPrice || 0,
        count: s._count.id
      })),
      totalSettled: settled._sum.totalPrice || 0,
      totalPending: pending._sum.totalPrice || 0,
    })

  } catch (error: unknown) {
    return res.status(500).json({ error: (error as Error).message })
  }
})

export default router
# 20260514T175724Z

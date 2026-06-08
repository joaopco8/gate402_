import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { redisGet, redisSet } from '../lib/redis'

const router = Router()

const SAFE_SELECT = {
  id: true,
  slug: true,
  name: true,
  description: true,
  longDescription: true,
  category: true,
  pricePerCall: true,
  totalCalls: true,
  totalEarned: true,
  uptimePercent: true,
  avgLatencyMs: true,
  avatarEmoji: true,
  avatarColor: true,
  avatarImage: true,
  tags: true,
  docsUrl: true,
  methods: true,
  responseExample: true,
  isFeatured: true,
  createdAt: true,
  user: {
    select: {
      username: true,
      displayName: true,
    },
  },
} as const

// GET /api/marketplace
router.get('/', async (req, res) => {
  try {
    const {
      category,
      search,
      cursor,
      limit = '20',
      sort = 'popular',
    } = req.query

    const take = Math.min(parseInt(limit as string) || 20, 50)
    const cacheKey = `marketplace:${category || 'all'}:${search || ''}:${cursor || ''}:${sort}:${take}`

    const cached = await redisGet(cacheKey)
    if (cached) {
      res.setHeader('Cache-Control', 'no-cache')
      return res.json(JSON.parse(cached))
    }

    const where: any = { isPublic: true, isActive: true }

    if (category && category !== 'all') where.category = category

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { slug: { contains: search as string, mode: 'insensitive' } },
      ]
    }

    if (cursor) where.id = { lt: cursor as string }

    const orderBy: any[] =
      sort === 'newest' ? [{ isFeatured: 'desc' }, { createdAt: 'desc' }] :
      sort === 'cheapest' ? [{ isFeatured: 'desc' }, { pricePerCall: 'asc' }] :
      [{ isFeatured: 'desc' }, { totalCalls: 'desc' }]

    const [rawEndpoints, categoryCounts, total] = await Promise.all([
      prisma.proxyEndpoint.findMany({
        where,
        select: SAFE_SELECT,
        orderBy,
        take: take + 1,
      }),
      prisma.proxyEndpoint.groupBy({
        by: ['category'],
        where: { isPublic: true, isActive: true },
        _count: true,
      }),
      prisma.proxyEndpoint.count({ where: { isPublic: true, isActive: true } }),
    ])

    const hasMore = rawEndpoints.length > take
    const items = hasMore ? rawEndpoints.slice(0, take) : rawEndpoints
    const nextCursor = hasMore ? items[items.length - 1].id : null

    const result = {
      endpoints: items,
      pagination: { total, hasMore, nextCursor },
      filters: {
        categories: categoryCounts.map((c) => ({ name: c.category, count: c._count })),
      },
      meta: {
        description: 'Gate402 Marketplace — APIs that accept x402 payments',
        docs: 'https://gate402.dev/docs',
        protocol: 'x402',
        chain: 'solana',
      },
    }

    await redisSet(cacheKey, JSON.stringify(result), 300)

    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.json(result)
  } catch (error) {
    console.error('[marketplace] list error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/marketplace/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params
    const cacheKey = `marketplace:detail:${slug}`

    const cached = await redisGet(cacheKey)
    if (cached) {
      res.setHeader('Cache-Control', 'no-cache')
      return res.json(JSON.parse(cached))
    }

    const endpoint = await prisma.proxyEndpoint.findFirst({
      where: { slug, isPublic: true, isActive: true },
      select: {
        ...SAFE_SELECT,
        user: { select: { username: true, displayName: true, avatarImage: true } },
      },
    })

    if (!endpoint) {
      return res.status(404).json({ error: 'API not found', code: 'NOT_FOUND' })
    }

    const last24h = await prisma.proxyCall.aggregate({
      where: {
        proxyEndpointId: endpoint.id,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      _count: true,
      _avg: { latencyMs: true },
    })

    const BASE = process.env.API_BASE_URL || 'https://api.gate402.dev'

    const result = {
      ...endpoint,
      stats: {
        callsLast24h: last24h._count,
        avgLatencyMs: Math.round(last24h._avg.latencyMs || endpoint.avgLatencyMs),
      },
      usage: {
        endpoint: `${BASE}/p/${endpoint.slug}`,
        method: 'GET or POST',
        payment: { amount: endpoint.pricePerCall, token: 'USDC', chain: 'solana', protocol: 'x402' },
        example: {
          curl: `curl ${BASE}/p/${endpoint.slug} \\\n  -H "x-payment-signature: YOUR_TX_HASH"`,
          agent: `await agent.fetch('${BASE}/p/${endpoint.slug}')`,
        },
      },
    }

    await redisSet(cacheKey, JSON.stringify(result), 300)

    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.json(result)
  } catch (error) {
    console.error('[marketplace] detail error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

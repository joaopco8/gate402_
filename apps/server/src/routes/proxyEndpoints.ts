import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { redisDel } from '../lib/redis'
import { generateSlug, ensureUniqueSlug } from '../lib/slugify'

const router = Router()

function getUser(req: any) {
  return req.gate402User as { id: string; supabaseId: string; plan: string; apiKey: string } | undefined
}

const FREE_LIMIT = 3

const SAFE_SELECT = {
  id: true,
  slug: true,
  name: true,
  description: true,
  longDescription: true,
  category: true,
  targetUrl: true,
  pricePerCall: true,
  totalCalls: true,
  totalEarned: true,
  lastCallAt: true,
  uptimePercent: true,
  avgLatencyMs: true,
  isPublic: true,
  isActive: true,
  avatarEmoji: true,
  avatarColor: true,
  avatarImage: true,
  tags: true,
  docsUrl: true,
  methods: true,
  responseExample: true,
  createdAt: true,
  // targetApiKey intentionally omitted
} as const

// GET /api/proxy-endpoints
router.get('/', async (req, res) => {
  try {
    const user = getUser(req)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const endpoints = await prisma.proxyEndpoint.findMany({
      where: { userId: user.id, isActive: true },
      select: SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
    })

    return res.json({ endpoints })
  } catch (err) {
    console.error('[proxy-endpoints] list error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/proxy-endpoints
router.post('/', async (req, res) => {
  try {
    const user = getUser(req)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const {
      name,
      description,
      longDescription,
      category = 'data',
      targetUrl,
      pricePerCall = 0.001,
      targetApiKey,
      targetApiHeader = 'x-api-key',
      isPublic = true,
      avatarEmoji = '🔌',
      avatarColor = '#7AF279',
      avatarImage,
      tags = [],
      docsUrl,
      methods = ['GET'],
      responseExample,
    } = req.body

    if (!name || !targetUrl) {
      return res.status(400).json({ error: 'name and targetUrl are required', code: 'MISSING_FIELDS' })
    }

    if (avatarImage) {
      if (!avatarImage.startsWith('data:image/')) {
        return res.status(400).json({ error: 'avatarImage must be a valid image data URL', code: 'INVALID_IMAGE' })
      }
      // 512KB limit — base64 overhead ~1.37×
      if (avatarImage.length > 716800) {
        return res.status(400).json({ error: 'Image too large. Max 512KB.', code: 'IMAGE_TOO_LARGE' })
      }
    }

    try {
      new URL(targetUrl)
    } catch {
      return res.status(400).json({ error: 'Invalid target URL', code: 'INVALID_URL' })
    }

    if (process.env.NODE_ENV === 'production') {
      const url = new URL(targetUrl)
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return res.status(400).json({ error: 'localhost URLs are not allowed in production', code: 'LOCALHOST_NOT_ALLOWED' })
      }
    }

    const isPro = user.plan === 'pro' || user.plan === 'enterprise'
    if (!isPro) {
      const count = await prisma.proxyEndpoint.count({ where: { userId: user.id, isActive: true } })
      if (count >= FREE_LIMIT) {
        return res.status(400).json({
          error: `Free plan allows up to ${FREE_LIMIT} proxy endpoints. Upgrade to Pro for unlimited.`,
          code: 'LIMIT_REACHED',
        })
      }
    }

    const baseSlug = generateSlug(name)
    const slug = await ensureUniqueSlug(prisma, baseSlug)

    const endpoint = await prisma.proxyEndpoint.create({
      data: {
        userId: user.id,
        slug,
        name,
        description,
        longDescription: longDescription || null,
        category,
        targetUrl,
        pricePerCall,
        targetApiKey: targetApiKey || null,
        targetApiHeader,
        isPublic,
        avatarEmoji,
        avatarColor,
        avatarImage: avatarImage || null,
        tags: Array.isArray(tags) ? tags : [],
        docsUrl: docsUrl || null,
        methods: Array.isArray(methods) ? methods : ['GET'],
        responseExample: responseExample || null,
      },
      select: SAFE_SELECT,
    })

    return res.status(201).json({ endpoint })
  } catch (err) {
    console.error('[proxy-endpoints] create error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /api/proxy-endpoints/:id
router.patch('/:id', async (req, res) => {
  try {
    const user = getUser(req)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const { id } = req.params
    const { name, description, category, pricePerCall, targetApiKey, isPublic, isActive } = req.body

    const existing = await prisma.proxyEndpoint.findFirst({ where: { id, userId: user.id } })
    if (!existing) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' })

    const endpoint = await prisma.proxyEndpoint.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(pricePerCall !== undefined && { pricePerCall }),
        ...(targetApiKey !== undefined && { targetApiKey }),
        ...(isPublic !== undefined && { isPublic }),
        ...(isActive !== undefined && { isActive }),
      },
      select: SAFE_SELECT,
    })

    await redisDel(`proxy:${existing.slug}`)

    return res.json({ endpoint })
  } catch (err) {
    console.error('[proxy-endpoints] patch error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/proxy-endpoints/:id
router.delete('/:id', async (req, res) => {
  try {
    const user = getUser(req)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const { id } = req.params

    const existing = await prisma.proxyEndpoint.findFirst({
      where: { id, userId: user.id },
      select: { id: true, slug: true },
    })
    if (!existing) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' })

    await prisma.proxyEndpoint.update({ where: { id }, data: { isActive: false } })
    await redisDel(`proxy:${existing.slug}`)

    return res.json({ success: true })
  } catch (err) {
    console.error('[proxy-endpoints] delete error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

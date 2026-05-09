import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /api/endpoints — lista endpoints do usuário autenticado
router.get('/endpoints', async (req, res) => {
  const supabaseId = req.headers['x-user-id'] as string
  if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' })

  const user = await prisma.user.findUnique({
    where: { supabaseId },
    include: {
      endpoints: {
        include: { _count: { select: { calls: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!user) return res.status(404).json({ error: 'User not found' })

  return res.json(user.endpoints.map(ep => ({
    id: ep.id,
    path: ep.path,
    priceUsdc: ep.priceUsdc,
    active: ep.active,
    description: ep.description,
    totalCalls: ep._count.calls,
    createdAt: ep.createdAt,
  })))
})

// GET /api/endpoints/pricing — rota pública, SDK busca preços por apiKey
// IMPORTANTE: deve ficar antes de /endpoints/:id
router.get('/endpoints/pricing', async (req, res) => {
  const apiKey = req.headers['x-api-key'] as string
  if (!apiKey) return res.status(401).json({ error: 'x-api-key required' })

  const user = await prisma.user.findUnique({
    where: { apiKey },
    include: { endpoints: { where: { active: true } } },
  })

  if (!user) return res.status(401).json({ error: 'Invalid API key' })

  const pricing: Record<string, number> = {}
  user.endpoints.forEach(ep => { pricing[ep.path] = ep.priceUsdc })

  return res.json({
    pricing,
    walletAddress: user.walletAddress,
    network: user.network,
  })
})

// POST /api/endpoints — cria novo endpoint
router.post('/endpoints', async (req, res) => {
  const supabaseId = req.headers['x-user-id'] as string
  if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' })

  const { path, priceUsdc, description } = req.body

  if (!path || priceUsdc === undefined) {
    return res.status(400).json({ error: 'path and priceUsdc are required' })
  }
  if (!path.startsWith('/')) {
    return res.status(400).json({ error: 'path must start with /' })
  }
  if (priceUsdc < 0.0001) {
    return res.status(400).json({ error: 'minimum price is 0.0001 USDC' })
  }

  const user = await prisma.user.findUnique({ where: { supabaseId } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  const existing = await prisma.endpoint.findFirst({
    where: { path, userId: user.id },
  })
  if (existing) return res.status(409).json({ error: 'Endpoint already exists' })

  const endpoint = await prisma.endpoint.create({
    data: { path, priceUsdc, description: description || null, userId: user.id, active: true },
  })

  return res.status(201).json(endpoint)
})

// PATCH /api/endpoints/:id — atualiza endpoint (verifica ownership)
router.patch('/endpoints/:id', async (req, res) => {
  const supabaseId = req.headers['x-user-id'] as string
  if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' })

  const { id } = req.params
  const { priceUsdc, active, description } = req.body

  const user = await prisma.user.findUnique({ where: { supabaseId } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  const endpoint = await prisma.endpoint.findFirst({ where: { id, userId: user.id } })
  if (!endpoint) return res.status(404).json({ error: 'Endpoint not found' })

  const updated = await prisma.endpoint.update({
    where: { id },
    data: {
      ...(priceUsdc !== undefined && { priceUsdc }),
      ...(active !== undefined && { active }),
      ...(description !== undefined && { description }),
    },
  })

  return res.json(updated)
})

// DELETE /api/endpoints/:id — deleta endpoint (verifica ownership)
router.delete('/endpoints/:id', async (req, res) => {
  const supabaseId = req.headers['x-user-id'] as string
  if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' })

  const { id } = req.params

  const user = await prisma.user.findUnique({ where: { supabaseId } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  const endpoint = await prisma.endpoint.findFirst({ where: { id, userId: user.id } })
  if (!endpoint) return res.status(404).json({ error: 'Endpoint not found' })

  await prisma.endpoint.delete({ where: { id } })

  return res.json({ message: 'Endpoint deleted successfully' })
})

export default router

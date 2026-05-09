import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// POST /api/users/sync — called after Supabase login, creates or returns user
router.post('/users/sync', async (req, res) => {
  try {
    const { supabaseId, email } = req.body

    if (!supabaseId) {
      return res.status(400).json({ error: 'supabaseId required' })
    }

    const user = await prisma.user.upsert({
      where: { supabaseId },
      update: { email },
      create: {
        supabaseId,
        email,
        plan: 'free',
        network: 'devnet',
      },
    })

    return res.json({
      id: user.id,
      apiKey: user.apiKey,
      walletAddress: user.walletAddress,
      plan: user.plan,
      network: user.network,
      isNew: false,
    })
  } catch (error) {
    console.error('[users/sync] Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /api/users/wallet — update wallet address for logged-in user
router.patch('/users/wallet', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string
    const { walletAddress } = req.body

    if (!supabaseId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!walletAddress) {
      return res.status(400).json({ error: 'walletAddress required' })
    }

    const user = await prisma.user.update({
      where: { supabaseId },
      data: { walletAddress },
    })

    return res.json({
      walletAddress: user.walletAddress,
      message: 'Wallet updated successfully',
    })
  } catch (error) {
    console.error('[users/wallet] Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/users/me — return data for the logged-in user
router.get('/users/me', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string

    if (!supabaseId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId },
      include: {
        _count: {
          select: { apiCalls: true, endpoints: true },
        },
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.json({
      id: user.id,
      apiKey: user.apiKey,
      walletAddress: user.walletAddress,
      plan: user.plan,
      network: user.network,
      emailAlerts: user.emailAlerts,
      totalCalls: user._count.apiCalls,
      totalEndpoints: user._count.endpoints,
      createdAt: user.createdAt,
    })
  } catch (error) {
    console.error('[users/me] Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/users/rotate-key — generate a new API key
router.post('/users/rotate-key', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string

    if (!supabaseId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { v4: uuidv4 } = await import('uuid')

    const user = await prisma.user.update({
      where: { supabaseId },
      data: { apiKey: uuidv4() },
    })

    return res.json({
      apiKey: user.apiKey,
      message: 'API key rotated successfully',
    })
  } catch (error) {
    console.error('[users/rotate-key] Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /api/users/email-alerts — toggle email alerts
router.patch('/users/email-alerts', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string
    if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' })

    const { enabled } = req.body

    const user = await prisma.user.update({
      where: { supabaseId },
      data: { emailAlerts: enabled },
    })

    return res.json({
      emailAlerts: user.emailAlerts,
      message: `Email alerts ${enabled ? 'enabled' : 'disabled'}`,
    })
  } catch (error) {
    console.error('[users/email-alerts] Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

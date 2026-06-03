import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { sendWebhook } from '../lib/webhook'
import { invalidateApiKey } from '../lib/apiKeyCache'

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

    const planLimits = {
      free: {
        maxEndpoints: 3,
        recentCallsLimit: 5,
        chartDays: 7,
        hasAnalytics: false,
        hasMetering: false,
        hasExport: false,
        hasLatency: false,
        hasWallet: false,
        hasMRR: false,
      },
      pro: {
        maxEndpoints: -1,
        recentCallsLimit: 50,
        chartDays: 90,
        hasAnalytics: true,
        hasMetering: true,
        hasExport: true,
        hasLatency: true,
        hasWallet: true,
        hasMRR: true,
      },
    }

    return res.json({
      id: user.id,
      apiKey: user.apiKey,
      walletAddress: user.walletAddress,
      plan: user.plan,
      network: user.network,
      emailAlerts: user.emailAlerts,
      limits: planLimits[user.plan as keyof typeof planLimits] || planLimits.free,
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

    const existing = await prisma.user.findUnique({
      where: { supabaseId },
      select: { apiKey: true },
    })

    const user = await prisma.user.update({
      where: { supabaseId },
      data: { apiKey: uuidv4() },
    })

    // Invalidate old API key from Redis cache
    if (existing?.apiKey) {
      invalidateApiKey(existing.apiKey).catch(() => {})
    }

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

// PATCH /api/users/network — switch between devnet and mainnet
router.patch('/users/network', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string
    if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' })

    const { network } = req.body

    if (!['devnet', 'mainnet'].includes(network)) {
      return res.status(400).json({ error: 'network must be devnet or mainnet' })
    }

    const user = await prisma.user.findUnique({ where: { supabaseId } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (network === 'mainnet' && !user.walletAddress) {
      return res.status(400).json({
        error: 'You must configure a Solana wallet before switching to mainnet',
      })
    }

    const updated = await prisma.user.update({
      where: { supabaseId },
      data: { network },
    })

    return res.json({ network: updated.network, message: `Switched to ${network}` })
  } catch (error) {
    console.error('[users/network] Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /api/users/webhook — configura ou remove webhook URL
router.patch('/users/webhook', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string
    if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' })

    const { webhookUrl, webhookSecret } = req.body

    if (webhookUrl && !webhookUrl.startsWith('https://')) {
      return res.status(400).json({ error: 'webhookUrl must use HTTPS' })
    }

    const user = await prisma.user.update({
      where: { supabaseId },
      data: {
        webhookUrl: webhookUrl || null,
        webhookSecret: webhookSecret || null,
      },
    })

    return res.json({
      webhookUrl: user.webhookUrl,
      webhookSecret: user.webhookSecret ? '***configured***' : null,
      message: webhookUrl ? 'Webhook configured' : 'Webhook removed',
    })
  } catch (error) {
    console.error('[users/webhook] Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/users/webhook/test — dispara um webhook de teste
router.post('/users/webhook/test', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string
    if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' })

    const user = await prisma.user.findUnique({ where: { supabaseId } })
    if (!user?.webhookUrl) {
      return res.status(400).json({ error: 'No webhook URL configured' })
    }

    await sendWebhook(user.webhookUrl, user.webhookSecret ?? null, {
      event: 'payment.confirmed',
      endpoint: '/api/test',
      amount: 0.001,
      currency: 'USDC',
      network: user.network || 'devnet',
      txHash: `demo_webhook_test_${Date.now()}`,
      timestamp: new Date().toISOString(),
    })

    return res.json({ message: 'Test webhook sent', url: user.webhookUrl })
  } catch (error) {
    console.error('[users/webhook/test] Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

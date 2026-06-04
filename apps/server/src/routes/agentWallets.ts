import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { redis } from '../lib/redis'
import { privy } from '../lib/privy'
import { getHourBucket, getDayBucket, getMonthBucket } from '../services/spendingLimits'

const router = Router()

function getUser(req: any) {
  return req.gate402User as { id: string; supabaseId: string; plan: string; apiKey: string } | undefined
}

// ─── LIST ────────────────────────────────────────────────────────────────────
// GET /api/agent-wallets
router.get('/', async (req, res) => {
  try {
    const user = getUser(req)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const wallets = await prisma.agentWallet.findMany({
      where: { userId: user.id, isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        walletAddress: true,
        network: true,
        maxPerCall: true,
        maxPerHour: true,
        maxPerDay: true,
        maxPerMonth: true,
        allowedEndpoints: true,
        blockedEndpoints: true,
        totalCalls: true,
        totalSpent: true,
        lastCallAt: true,
        agentKey: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.json({ wallets })
  } catch (err) {
    console.error('[agent-wallets] list error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── CREATE ──────────────────────────────────────────────────────────────────
// POST /api/agent-wallets
router.post('/', async (req, res) => {
  try {
    const user = getUser(req)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const {
      name,
      description,
      network = 'mainnet',
      maxPerCall,
      maxPerHour,
      maxPerDay,
      maxPerMonth,
      allowedEndpoints = [],
      blockedEndpoints = [],
    } = req.body

    if (!name) {
      return res.status(400).json({
        error: 'name is required',
        code: 'MISSING_FIELDS',
      })
    }

    const count = await prisma.agentWallet.count({
      where: { userId: user.id, isActive: true },
    })

    if (count >= 10) {
      return res.status(400).json({
        error: 'Maximum 10 agent wallets per account',
        code: 'MAX_WALLETS_REACHED',
      })
    }

    // Create managed Solana wallet via Privy
    let privyWallet: { id: string; address: string }
    try {
      privyWallet = await privy.walletApi.create({ chainType: 'solana' }) as { id: string; address: string }
    } catch (privyError) {
      console.error('[agent-wallets] Privy wallet creation failed:', privyError)
      return res.status(500).json({
        error: 'Failed to create wallet',
        code: 'WALLET_CREATION_FAILED',
      })
    }

    const wallet = await prisma.agentWallet.create({
      data: {
        userId: user.id,
        name,
        description: description ?? null,
        privyWalletId: privyWallet.id,
        walletAddress: privyWallet.address,
        network,
        maxPerCall: maxPerCall ?? null,
        maxPerHour: maxPerHour ?? null,
        maxPerDay: maxPerDay ?? null,
        maxPerMonth: maxPerMonth ?? null,
        allowedEndpoints,
        blockedEndpoints,
      },
      select: {
        id: true,
        name: true,
        description: true,
        walletAddress: true,
        network: true,
        maxPerCall: true,
        maxPerHour: true,
        maxPerDay: true,
        maxPerMonth: true,
        allowedEndpoints: true,
        blockedEndpoints: true,
        totalCalls: true,
        totalSpent: true,
        agentKey: true,
        createdAt: true,
      },
    })

    return res.status(201).json({ wallet })
  } catch (err) {
    console.error('[agent-wallets] create error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── GET ONE ─────────────────────────────────────────────────────────────────
// GET /api/agent-wallets/:id
router.get('/:id', async (req, res) => {
  try {
    const user = getUser(req)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const { id } = req.params

    const wallet = await prisma.agentWallet.findFirst({
      where: { id, userId: user.id },
      include: {
        calls: {
          select: {
            id: true,
            endpoint: true,
            amount: true,
            status: true,
            txHash: true,
            blockReason: true,
            latencyMs: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!wallet) {
      return res.status(404).json({ error: 'Agent wallet not found', code: 'NOT_FOUND' })
    }

    return res.json({ wallet })
  } catch (err) {
    console.error('[agent-wallets] get error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── UPDATE ──────────────────────────────────────────────────────────────────
// PATCH /api/agent-wallets/:id
router.patch('/:id', async (req, res) => {
  try {
    const user = getUser(req)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const { id } = req.params
    const {
      name,
      description,
      maxPerCall,
      maxPerHour,
      maxPerDay,
      maxPerMonth,
      allowedEndpoints,
      blockedEndpoints,
      isActive,
    } = req.body

    const existing = await prisma.agentWallet.findFirst({ where: { id, userId: user.id } })
    if (!existing) {
      return res.status(404).json({ error: 'Agent wallet not found', code: 'NOT_FOUND' })
    }

    const wallet = await prisma.agentWallet.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(maxPerCall !== undefined && { maxPerCall }),
        ...(maxPerHour !== undefined && { maxPerHour }),
        ...(maxPerDay !== undefined && { maxPerDay }),
        ...(maxPerMonth !== undefined && { maxPerMonth }),
        ...(allowedEndpoints !== undefined && { allowedEndpoints }),
        ...(blockedEndpoints !== undefined && { blockedEndpoints }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        name: true,
        maxPerCall: true,
        maxPerHour: true,
        maxPerDay: true,
        maxPerMonth: true,
        allowedEndpoints: true,
        blockedEndpoints: true,
        isActive: true,
        updatedAt: true,
      },
    })

    if (redis) redis.del(`agent:${id}:stats`).catch(() => {})

    return res.json({ wallet })
  } catch (err) {
    console.error('[agent-wallets] update error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── DELETE ──────────────────────────────────────────────────────────────────
// DELETE /api/agent-wallets/:id
router.delete('/:id', async (req, res) => {
  try {
    const user = getUser(req)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const { id } = req.params

    const existing = await prisma.agentWallet.findFirst({
      where: { id, userId: user.id },
      select: { id: true, privyWalletId: true, name: true },
    })
    if (!existing) {
      return res.status(404).json({ error: 'Agent wallet not found', code: 'NOT_FOUND' })
    }

    // 1. Delete from Privy first
    if (existing.privyWalletId) {
      try {
        await (privy.walletApi as any).delete(existing.privyWalletId)
        console.log(`[privy] Wallet deleted: ${existing.privyWalletId}`)
      } catch (privyError: any) {
        if (privyError?.status === 404 || privyError?.code === 404) {
          console.warn(`[privy] Wallet already deleted: ${existing.privyWalletId}`)
        } else {
          console.error('[privy] Delete failed:', privyError?.message)
          return res.status(500).json({ error: 'Failed to delete wallet from Privy', code: 'PRIVY_DELETE_FAILED' })
        }
      }
    }

    // 2. Soft delete in DB
    await prisma.agentWallet.update({ where: { id }, data: { isActive: false } })

    // 3. Invalidate cache
    if (redis) {
      redis.del(`agent:${id}:limits`).catch(() => {})
      redis.del(`agent:${id}:stats`).catch(() => {})
    }

    return res.json({ success: true, message: `Agent wallet "${existing.name}" deleted successfully` })
  } catch (err) {
    console.error('[agent-wallets] delete error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── STATS ───────────────────────────────────────────────────────────────────
// GET /api/agent-wallets/:id/stats
router.get('/:id/stats', async (req, res) => {
  try {
    const user = getUser(req)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const { id } = req.params
    const cacheKey = `agent:${id}:stats`

    if (redis) {
      const cached = await redis.get(cacheKey).catch(() => null)
      if (cached) return res.json(JSON.parse(cached))
    }

    const wallet = await prisma.agentWallet.findFirst({ where: { id, userId: user.id } })
    if (!wallet) {
      return res.status(404).json({ error: 'Agent wallet not found', code: 'NOT_FOUND' })
    }

    const [callsByStatus, topEndpoints, rtHour, rtDay, rtMonth] = await Promise.all([
      prisma.agentCall.groupBy({
        by: ['status'],
        where: { agentWalletId: id },
        _count: true,
      }),
      prisma.agentCall.groupBy({
        by: ['endpoint'],
        where: { agentWalletId: id, status: 'verified' },
        _sum: { amount: true },
        _count: true,
        orderBy: { _sum: { amount: 'desc' } },
        take: 5,
      }),
      redis ? redis.get(`agent:${id}:spent:hour:${getHourBucket()}`).catch(() => null) : Promise.resolve(null),
      redis ? redis.get(`agent:${id}:spent:day:${getDayBucket()}`).catch(() => null) : Promise.resolve(null),
      redis ? redis.get(`agent:${id}:spent:month:${getMonthBucket()}`).catch(() => null) : Promise.resolve(null),
    ])

    const spentThisHour  = parseFloat(rtHour  || '0')
    const spentToday     = parseFloat(rtDay   || '0')
    const spentThisMonth = parseFloat(rtMonth || '0')

    const stats = {
      totalCalls: wallet.totalCalls,
      totalSpent: wallet.totalSpent,
      spentToday,
      spentThisHour,
      realtime: { spentThisHour, spentToday, spentThisMonth },
      callsByStatus,
      topEndpoints,
      limits: {
        maxPerCall: wallet.maxPerCall,
        maxPerHour: wallet.maxPerHour,
        maxPerDay: wallet.maxPerDay,
        maxPerMonth: wallet.maxPerMonth,
      },
      utilization: {
        hour:  wallet.maxPerHour  ? (spentThisHour  / wallet.maxPerHour)  * 100 : null,
        day:   wallet.maxPerDay   ? (spentToday     / wallet.maxPerDay)   * 100 : null,
        month: wallet.maxPerMonth ? (spentThisMonth / wallet.maxPerMonth) * 100 : null,
      },
      lastCallAt: wallet.lastCallAt,
    }

    if (redis) redis.setex(cacheKey, 60, JSON.stringify(stats)).catch(() => {})

    return res.json(stats)
  } catch (err) {
    console.error('[agent-wallets] stats error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

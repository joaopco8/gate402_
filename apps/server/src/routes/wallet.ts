import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { transferUsdc } from '../solana/transfer'

const router = Router()

// GET /api/wallet/balance — available balance based on earned - withdrawn
router.get('/wallet/balance', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string
    if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' })

    const user = await prisma.user.findUnique({ where: { supabaseId } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const earned = await prisma.apiCall.aggregate({
      where: { userId: user.id, amountUsdc: { gt: 0 } },
      _sum: { amountUsdc: true },
    })

    const withdrawn = await prisma.apiCall.aggregate({
      where: { userId: user.id, status: 'withdrawal' },
      _sum: { amountUsdc: true },
    })

    const totalEarned = earned._sum.amountUsdc || 0
    const totalWithdrawn = Math.abs(withdrawn._sum.amountUsdc || 0)
    const available = Math.max(0, totalEarned - totalWithdrawn)

    return res.json({
      available: parseFloat(available.toFixed(6)),
      totalEarned: parseFloat(totalEarned.toFixed(6)),
      totalWithdrawn: parseFloat(totalWithdrawn.toFixed(6)),
      currency: 'USDC',
      network: user.network,
    })
  } catch (error) {
    console.error('[wallet/balance] Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/wallet/withdraw — transfer USDC on-chain to user's wallet
router.post('/wallet/withdraw', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string
    if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' })

    const { toAddress, amountUsdc } = req.body

    if (!toAddress || !amountUsdc) {
      return res.status(400).json({ error: 'toAddress and amountUsdc are required' })
    }

    const amount = parseFloat(amountUsdc)

    if (amount < 0.001) {
      return res.status(400).json({ error: 'Minimum withdrawal is 0.001 USDC' })
    }

    if (amount > 10) {
      return res.status(400).json({ error: 'Maximum withdrawal is 10 USDC (devnet limit)' })
    }

    const user = await prisma.user.findUnique({ where: { supabaseId } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    // Calculate available balance
    const earned = await prisma.apiCall.aggregate({
      where: { userId: user.id, amountUsdc: { gt: 0 } },
      _sum: { amountUsdc: true },
    })
    const withdrawn = await prisma.apiCall.aggregate({
      where: { userId: user.id, status: 'withdrawal' },
      _sum: { amountUsdc: true },
    })
    const totalEarned = earned._sum.amountUsdc || 0
    const totalWithdrawn = Math.abs(withdrawn._sum.amountUsdc || 0)
    const available = Math.max(0, totalEarned - totalWithdrawn)

    if (amount > available) {
      return res.status(400).json({
        error: `Insufficient balance. Available: ${available.toFixed(4)} USDC`,
      })
    }

    // Execute on-chain transfer
    const result = await transferUsdc(toAddress, amount, user.network as 'devnet' | 'mainnet')

    if (!result.success) {
      return res.status(500).json({ error: 'Transfer failed', details: result.error })
    }

    // Log withdrawal (endpointId is now optional)
    await prisma.apiCall.create({
      data: {
        userId: user.id,
        txHash: result.txHash!,
        amountUsdc: -amount,
        payerWallet: toAddress,
        status: 'withdrawal',
      },
    })

    const explorerUrl = `https://explorer.solana.com/tx/${result.txHash}${user.network === 'devnet' ? '?cluster=devnet' : ''}`

    return res.json({
      success: true,
      txHash: result.txHash,
      amount,
      toAddress,
      explorerUrl,
    })
  } catch (error: any) {
    console.error('[wallet/withdraw] Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

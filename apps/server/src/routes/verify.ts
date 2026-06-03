import { Router } from 'express'
import { getUserByApiKey } from '../lib/apiKeyCache'
import { verifyPayment } from '../solana/verify'
import { checkIdempotency, markUsed } from '../lib/idempotency'

const router = Router()

router.post('/verify-payment', async (req, res) => {
  try {
    const { txHash, expectedAmount, expectedWallet, network } = req.body
    const apiKey = req.headers['x-api-key'] as string

    if (!txHash || !expectedAmount || !expectedWallet) {
      return res.status(400).json({
        valid: false,
        reason: 'Missing required fields: txHash, expectedAmount, expectedWallet',
      })
    }

    if (!apiKey) {
      return res.status(401).json({
        valid: false,
        reason: 'Missing x-api-key header',
      })
    }

    const user = await getUserByApiKey(apiKey).catch(() => null)

    if (!user) {
      return res.status(401).json({
        valid: false,
        reason: 'Invalid API key. Get yours at gate402.dev/settings',
      })
    }

    // Anti-replay check (skip for demo txHashes)
    if (!txHash.startsWith('demo_')) {
      const { isDuplicate } = await checkIdempotency(txHash, 'payment')
      if (isDuplicate) {
        return res.status(409).json({
          valid: false,
          reason: 'REPLAY_ATTACK: txHash already used',
        })
      }
    }

    // Demo mode
    if (txHash.startsWith('demo_')) {
      return res.json({
        valid: true,
        confirmedAmount: expectedAmount,
        confirmedAt: new Date().toISOString(),
        network: 'demo',
        demo: true,
      })
    }

    // Verify on Solana — adapt to existing verifyPayment signature
    const verification = await verifyPayment({
      txHash,
      expectedAmountUsdc: Number(expectedAmount),
      recipientAddress: expectedWallet,
    })

    if (!verification.valid) {
      return res.json({
        valid: false,
        reason: verification.reason || 'Payment not confirmed on chain',
      })
    }

    // Mark txHash as used — TTL 24h
    markUsed(txHash, 'payment', { confirmedAt: new Date().toISOString() }).catch(() => {})

    return res.json({
      valid: true,
      confirmedAmount: verification.amount,
      confirmedAt: new Date().toISOString(),
      network: network || 'devnet',
    })
  } catch (error) {
    console.error('[verify-payment] Error:', error)
    return res.status(500).json({
      valid: false,
      reason: 'Internal server error',
    })
  }
})

export default router

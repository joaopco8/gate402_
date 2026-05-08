import { Router } from 'express'
import { verifyPayment } from '../solana/verify'

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

    // No User model yet — accept any apiKey with length > 10
    // TODO: validate against real user table when auth is wired up
    if (apiKey.length <= 10) {
      return res.status(401).json({
        valid: false,
        reason: 'Invalid API key',
      })
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

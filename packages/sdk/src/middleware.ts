import { Request, Response, NextFunction } from 'express'
import { Gate402Config } from './types'

const DEFAULT_SERVER_URL = 'https://api.gate402.dev'

export function gate402(config: Gate402Config) {
  const serverUrl = config.serverUrl || DEFAULT_SERVER_URL

  return async function gate402Middleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const path = req.path
    const price = config.endpoints[path]

    if (price === undefined) {
      return next()
    }

    const paymentHeader = req.headers['x-payment-payload'] as string | undefined

    if (!paymentHeader) {
      return res.status(402).json({
        error: 'Payment Required',
        price: {
          amount: price.toString(),
          currency: 'USDC',
          network: config.network || 'devnet'
        },
        payTo: config.walletAddress,
        endpoint: path,
        instructions: 'Send USDC on Solana and include tx hash in X-Payment-Payload header'
      })
    }

    // Demo mode — bypasses blockchain verification
    if (paymentHeader.startsWith('demo_')) {
      req.headers['x-payment-verified'] = 'true'
      req.headers['x-payment-amount'] = price.toString()
      return next()
    }

    // Real payment — verify via Gate402 server
    try {
      const verifyRes = await fetch(`${serverUrl}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey
        },
        body: JSON.stringify({
          txHash: paymentHeader,
          expectedAmount: price,
          expectedWallet: config.walletAddress,
          network: config.network || 'devnet'
        })
      })

      const result = await verifyRes.json() as { valid: boolean; reason?: string }

      if (!result.valid) {
        return res.status(402).json({
          error: 'Payment invalid or not confirmed',
          details: result.reason
        })
      }

      req.headers['x-payment-verified'] = 'true'
      req.headers['x-payment-amount'] = price.toString()
      req.headers['x-payment-tx'] = paymentHeader
      return next()

    } catch (error) {
      console.error('[gate402] Verification error:', error)
      return res.status(503).json({
        error: 'Payment verification temporarily unavailable'
      })
    }
  }
}

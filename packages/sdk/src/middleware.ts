import { Request, Response, NextFunction } from 'express'
import { Gate402Config } from './types'

export function gate402(config: Gate402Config) {
  const {
    apiKey,
    endpoints,
    serverUrl = 'http://localhost:3001',
    network = 'devnet',
    walletAddress
  } = config

  return async function gate402Middleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const path = req.path
    const price = endpoints[path]

    // Endpoint não está configurado para cobrança — deixa passar
    if (price === undefined) {
      return next()
    }

    const paymentHeader = req.headers['x-payment-payload'] as string | undefined

    // Sem pagamento — retorna 402
    if (!paymentHeader) {
      return res.status(402).json({
        error: 'Payment Required',
        price: {
          amount: price.toString(),
          currency: 'USDC',
          network: `solana-${network}`
        },
        payTo: walletAddress || 'configure walletAddress in gate402()',
        endpoint: path,
        instructions: 'Send USDC on Solana and include tx hash in X-Payment-Payload header',
        apiKey
      })
    }

    // Demo mode — hashes começando com "demo_" passam direto
    if (paymentHeader.startsWith('demo_')) {
      return next()
    }

    // Verifica pagamento real no servidor Gate402
    try {
      const verifyRes = await fetch(`${serverUrl}/api/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          txHash: paymentHeader,
          endpoint: path,
          expectedAmount: price,
          network
        })
      })

      const verification = await verifyRes.json() as { valid: boolean; reason?: string }

      if (verification.valid) {
        return next()
      }

      return res.status(402).json({
        error: 'Invalid payment',
        reason: verification.reason,
        txHash: paymentHeader
      })
    } catch {
      // Se servidor Gate402 não responder, usa modo offline
      console.warn('[gate402] Could not reach verification server, using offline mode')
      return next()
    }
  }
}

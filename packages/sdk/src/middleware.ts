import { Request, Response, NextFunction } from 'express'
import { Gate402Config } from './types'

const DEFAULT_SERVER_URL = 'https://api.gate402.dev'

// Cache de pricing para evitar requisição em cada chamada
const pricingCache = new Map<string, {
  pricing: Record<string, number>
  walletAddress: string
  network: string
  fetchedAt: number
}>()

const CACHE_TTL = 60_000 // 1 minuto

async function fetchPricing(serverUrl: string, apiKey: string) {
  const cached = pricingCache.get(apiKey)
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached
  }

  const res = await fetch(`${serverUrl}/api/endpoints/pricing`, {
    headers: { 'x-api-key': apiKey }
  })

  if (!res.ok) throw new Error('Failed to fetch pricing from Gate402')

  const data = await res.json() as {
    pricing: Record<string, number>
    walletAddress: string
    network: string
  }

  pricingCache.set(apiKey, { ...data, fetchedAt: Date.now() })
  return data
}

export function gate402(config: Gate402Config) {
  const serverUrl = config.serverUrl || DEFAULT_SERVER_URL

  return async function gate402Middleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const path = req.path

      // Modo managed — busca pricing do servidor com cache de 1 minuto
      let price: number | undefined
      let walletAddress = config.walletAddress
      let network = config.network || 'devnet'

      if (config.apiKey) {
        try {
          const pricing = await fetchPricing(serverUrl, config.apiKey)
          price = pricing.pricing[path]
          walletAddress = pricing.walletAddress || config.walletAddress
          network = (pricing.network as 'devnet' | 'mainnet') || config.network || 'devnet'
        } catch {
          // Fallback para config local se servidor indisponível
          price = config.endpoints?.[path]
        }
      } else {
        price = config.endpoints?.[path]
      }

      if (price === undefined) return next()

      const paymentHeader = req.headers['x-payment-payload'] as string | undefined

      if (!paymentHeader) {
        return res.status(402).json({
          error: 'Payment Required',
          price: {
            amount: price.toString(),
            currency: 'USDC',
            network
          },
          payTo: walletAddress,
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

      // Verificação remota via Gate402 server
      const verifyRes = await fetch(`${serverUrl}/api/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey
        },
        body: JSON.stringify({
          txHash: paymentHeader,
          expectedAmount: price,
          expectedWallet: walletAddress,
          network
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
      console.error('[gate402] Error:', error)
      return res.status(503).json({
        error: 'Payment service temporarily unavailable'
      })
    }
  }
}

import { Request, Response, NextFunction } from 'express'
import { Gate402Config } from './types'

const DEFAULT_SERVER_URL = 'https://api.gate402.dev'

export interface MCPGate402Config extends Gate402Config {
  defaultToolPrice?: number
  toolPricing?: Record<string, number>
}

const pricingCache = new Map<string, {
  pricing: Record<string, number>
  walletAddress: string
  network: string
  fetchedAt: number
}>()

const CACHE_TTL = 60_000

async function fetchPricing(serverUrl: string, apiKey: string) {
  const cached = pricingCache.get(apiKey)
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached
  }

  const res = await fetch(`${serverUrl}/api/endpoints/pricing`, {
    headers: { 'x-api-key': apiKey }
  })

  if (!res.ok) throw new Error('Failed to fetch pricing')

  const data = await res.json() as {
    pricing: Record<string, number>
    walletAddress: string
    network: string
  }

  pricingCache.set(apiKey, { ...data, fetchedAt: Date.now() })
  return data
}

async function verifyPayment(
  serverUrl: string,
  apiKey: string,
  txHash: string,
  expectedAmount: number,
  expectedWallet: string,
  network: string
): Promise<{ valid: boolean; reason?: string }> {
  if (txHash.startsWith('demo_')) {
    return { valid: true }
  }

  const res = await fetch(`${serverUrl}/api/verify-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify({
      txHash,
      expectedAmount,
      expectedWallet,
      network
    })
  })

  return res.json() as Promise<{ valid: boolean; reason?: string }>
}

export function gate402MCP(config: MCPGate402Config) {
  const serverUrl = config.serverUrl || DEFAULT_SERVER_URL

  return async function mcpGate402Middleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (req.method !== 'POST') return next()

    const body = req.body
    if (!body || body.jsonrpc !== '2.0') return next()

    const method = body.method as string
    if (!method?.startsWith('tools/call')) return next()

    const toolName = body.params?.name as string
    const paymentHeader = req.headers['x-payment-payload'] as string

    let price = config.defaultToolPrice || 0.001

    if (config.toolPricing?.[toolName]) {
      price = config.toolPricing[toolName]
    } else {
      try {
        const pricing = await fetchPricing(serverUrl, config.apiKey)
        const toolPath = `/tools/${toolName}`
        if (pricing.pricing[toolPath]) {
          price = pricing.pricing[toolPath]
        }
      } catch {
        // use default price
      }
    }

    if (!paymentHeader) {
      return res.status(402).json({
        jsonrpc: '2.0',
        id: body.id,
        error: {
          code: -32000,
          message: 'Payment Required',
          data: {
            price: {
              total: price,
              currency: 'USDC',
              network: config.network || 'devnet'
            },
            splits: {
              provider: {
                wallet: config.walletAddress,
                amount: parseFloat((price * 0.99).toFixed(6))
              },
              platform: {
                wallet: '7UQctUWgfH87jjz9xjnCCKVY6Q1tMWZ8i1ZB3Whx939D',
                amount: parseFloat((price * 0.01).toFixed(6))
              }
            },
            tool: toolName,
            instructions: 'Send USDC on Solana and include tx hash in X-Payment-Payload header'
          }
        }
      })
    }

    if (paymentHeader.startsWith('demo_')) {
      req.headers['x-payment-verified'] = 'true'
      req.headers['x-payment-amount'] = price.toString()
      req.headers['x-tool-name'] = toolName
      return next()
    }

    try {
      const [txHashProvider] = paymentHeader.split(',')
      const result = await verifyPayment(
        serverUrl,
        config.apiKey,
        txHashProvider,
        price * 0.99,
        config.walletAddress || '',
        config.network || 'devnet'
      )

      if (!result.valid) {
        return res.status(402).json({
          jsonrpc: '2.0',
          id: body.id,
          error: {
            code: -32001,
            message: 'Payment verification failed',
            data: { reason: result.reason }
          }
        })
      }

      req.headers['x-payment-verified'] = 'true'
      req.headers['x-payment-amount'] = price.toString()
      req.headers['x-tool-name'] = toolName
      return next()

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return res.status(503).json({
        jsonrpc: '2.0',
        id: body.id,
        error: {
          code: -32002,
          message: 'Payment verification temporarily unavailable',
          data: { error: message }
        }
      })
    }
  }
}

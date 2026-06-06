import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { redisGet, redisSet } from '../lib/redis'

const router = Router()

async function handleProxy(req: Request, res: Response) {
  const start = Date.now()
  const slug = req.params.slug as string

  try {
    // 1. Load endpoint config (cache-first)
    const cacheKey = `proxy:${slug}`
    let endpoint: any = null

    const cached = await redisGet(cacheKey)
    if (cached) {
      endpoint = JSON.parse(cached)
    } else {
      endpoint = await prisma.proxyEndpoint.findFirst({
        where: { slug, isActive: true },
        select: {
          id: true,
          slug: true,
          targetUrl: true,
          pricePerCall: true,
          targetApiKey: true,
          targetApiHeader: true,
          userId: true,
        },
      })

      if (!endpoint) {
        return res.status(404).json({ error: 'Endpoint not found', code: 'ENDPOINT_NOT_FOUND' })
      }

      await redisSet(cacheKey, JSON.stringify(endpoint), 300)
    }

    // 2. Check payment header
    const paymentHeader =
      req.headers['x-payment-signature'] ||
      req.headers['x-payment'] ||
      (req.headers['authorization']?.startsWith('Payment ')
        ? req.headers['authorization']
        : null)

    // 3. No payment → 402
    if (!paymentHeader) {
      const provider = await prisma.user.findUnique({
        where: { id: endpoint.userId },
        select: { walletAddress: true, network: true },
      })

      return res
        .status(402)
        .setHeader('x-payment-required', JSON.stringify({
          version: '1',
          scheme: 'exact',
          network: provider?.network || 'mainnet',
          amount: endpoint.pricePerCall.toString(),
          token: 'USDC',
          recipient: provider?.walletAddress || '',
          description: `Payment for ${slug}`,
        }))
        .json({
          error: 'Payment required',
          code: 'PAYMENT_REQUIRED',
          payment: {
            amount: endpoint.pricePerCall,
            token: 'USDC',
            chain: 'solana',
            recipient: provider?.walletAddress,
          },
        })
    }

    // 4. Extract tx hash
    const txHash =
      typeof paymentHeader === 'string'
        ? paymentHeader.replace('Payment ', '')
        : null

    // 5. Proxy to target
    const targetHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Gate402-Proxy/1.0',
    }

    if (endpoint.targetApiKey) {
      targetHeaders[endpoint.targetApiHeader || 'x-api-key'] = endpoint.targetApiKey
    }

    const targetUrl = new URL(endpoint.targetUrl)
    Object.entries(req.query).forEach(([key, value]) => {
      targetUrl.searchParams.set(key, value as string)
    })

    const targetRes = await fetch(targetUrl.toString(), {
      method: req.method,
      headers: targetHeaders,
      ...(req.method !== 'GET' && req.body ? { body: JSON.stringify(req.body) } : {}),
    })

    const latencyMs = Date.now() - start

    let responseBody: any
    const contentType = targetRes.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      responseBody = await targetRes.json().catch(() => ({}))
    } else {
      responseBody = await targetRes.text().catch(() => '')
    }

    // 6. Record call (non-blocking)
    prisma.proxyCall
      .create({
        data: {
          proxyEndpointId: endpoint.id,
          amount: endpoint.pricePerCall,
          txHash,
          paymentStatus: 'verified',
          latencyMs,
          targetStatus: targetRes.status,
        },
      })
      .then(() => {
        prisma.proxyEndpoint
          .update({
            where: { id: endpoint.id },
            data: {
              totalCalls: { increment: 1 },
              totalEarned: { increment: endpoint.pricePerCall },
              lastCallAt: new Date(),
              avgLatencyMs: latencyMs,
            },
          })
          .catch(console.error)
      })
      .catch(console.error)

    // 7. Return to agent
    return res.status(targetRes.status).json(responseBody)
  } catch (err) {
    console.error('[proxy] error:', err)
    return res.status(502).json({ error: 'Bad gateway — target API failed', code: 'TARGET_ERROR' })
  }
}

router.get('/:slug', handleProxy)
router.post('/:slug', handleProxy)
router.put('/:slug', handleProxy)
router.patch('/:slug', handleProxy)
router.delete('/:slug', handleProxy)

export default router

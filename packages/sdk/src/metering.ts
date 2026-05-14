import { Request, Response, NextFunction } from 'express'

export type MeteringType = 'token' | 'compute' | 'bandwidth' | 'request'

export interface MeteringConfig {
  type: MeteringType
  pricePerToken?: number
  tokenCounter?: (req: Request, res: Response) => number
  pricePerMs?: number
  pricePerKb?: number
  serverUrl?: string
  apiKey?: string
}

export interface EndpointMeteringConfig {
  [path: string]: MeteringConfig
}

async function reportMetric(params: {
  serverUrl: string
  apiKey: string
  metricType: string
  metricValue: number
  unit: string
  pricePerUnit: number
  requestId?: string
}) {
  try {
    await fetch(`${params.serverUrl}/api/metering/record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': params.apiKey
      },
      body: JSON.stringify({
        metricType: params.metricType,
        metricValue: params.metricValue,
        unit: params.unit,
        pricePerUnit: params.pricePerUnit,
        requestId: params.requestId,
      })
    })
  } catch (error) {
    console.error('[gate402] Failed to report metric:', error)
  }
}

function estimateTokens(body: unknown): number {
  const text = typeof body === 'string' ? body : JSON.stringify(body)
  return Math.ceil(text.length / 4)
}

export function tokenMeter(config: {
  pricePerToken: number
  serverUrl: string
  apiKey: string
  tokenCounter?: (req: Request, res: Response) => number
}) {
  return function tokenMeterMiddleware(req: Request, res: Response, next: NextFunction) {
    const originalJson = res.json.bind(res)
    res.json = function (body: unknown) {
      const tokensUsed = config.tokenCounter
        ? config.tokenCounter(req, res)
        : estimateTokens(body)

      const totalCost = tokensUsed * config.pricePerToken

      const responseWithBilling = {
        ...(typeof body === 'object' && body !== null ? body : { data: body }),
        _billing: {
          type: 'token',
          tokensUsed,
          pricePerToken: config.pricePerToken,
          totalCost,
          currency: 'USDC',
          settleAt: config.serverUrl + '/api/metering/settle'
        }
      }

      reportMetric({
        serverUrl: config.serverUrl,
        apiKey: config.apiKey,
        metricType: 'token',
        metricValue: tokensUsed,
        unit: 'tokens',
        pricePerUnit: config.pricePerToken,
        requestId: req.headers['x-request-id'] as string,
      }).catch(console.error)

      return originalJson(responseWithBilling)
    }

    next()
  }
}

export function computeMeter(config: {
  pricePerMs: number
  serverUrl: string
  apiKey: string
}) {
  return function computeMeterMiddleware(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now()

    const originalJson = res.json.bind(res)
    res.json = function (body: unknown) {
      const elapsedMs = Date.now() - startTime
      const totalCost = elapsedMs * config.pricePerMs

      const responseWithBilling = {
        ...(typeof body === 'object' && body !== null ? body : { data: body }),
        _billing: {
          type: 'compute',
          computeMs: elapsedMs,
          pricePerMs: config.pricePerMs,
          totalCost,
          currency: 'USDC',
        }
      }

      reportMetric({
        serverUrl: config.serverUrl,
        apiKey: config.apiKey,
        metricType: 'compute',
        metricValue: elapsedMs,
        unit: 'ms',
        pricePerUnit: config.pricePerMs,
        requestId: req.headers['x-request-id'] as string,
      }).catch(console.error)

      return originalJson(responseWithBilling)
    }

    next()
  }
}

export function bandwidthMeter(config: {
  pricePerKb: number
  serverUrl: string
  apiKey: string
}) {
  return function bandwidthMeterMiddleware(req: Request, res: Response, next: NextFunction) {
    const originalJson = res.json.bind(res)
    res.json = function (body: unknown) {
      const responseSize = Buffer.byteLength(JSON.stringify(body), 'utf8')
      const responseKb = responseSize / 1024
      const totalCost = responseKb * config.pricePerKb

      const responseWithBilling = {
        ...(typeof body === 'object' && body !== null ? body : { data: body }),
        _billing: {
          type: 'bandwidth',
          responseKb: parseFloat(responseKb.toFixed(4)),
          pricePerKb: config.pricePerKb,
          totalCost,
          currency: 'USDC',
        }
      }

      reportMetric({
        serverUrl: config.serverUrl,
        apiKey: config.apiKey,
        metricType: 'bandwidth',
        metricValue: responseKb,
        unit: 'kb',
        pricePerUnit: config.pricePerKb,
        requestId: req.headers['x-request-id'] as string,
      }).catch(console.error)

      return originalJson(responseWithBilling)
    }

    next()
  }
}

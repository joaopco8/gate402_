import { Request, Response, NextFunction } from 'express'
import { checkRateLimit } from '../lib/rateLimit'

export async function globalRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown'
  const apiKey = req.headers['x-api-key'] as string

  const ipLimit = await checkRateLimit({
    identifier: ip,
    type: 'ip',
    window: 'minute',
    limit: 100,
  })

  if (!ipLimit.allowed) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: ipLimit.resetIn,
      message: 'Rate limit exceeded. Try again in ' + ipLimit.resetIn + ' seconds.'
    })
  }

  if (apiKey) {
    const keyLimit = await checkRateLimit({
      identifier: apiKey,
      type: 'apikey',
      window: 'minute',
      limit: 200,
    })

    if (!keyLimit.allowed) {
      return res.status(429).json({
        error: 'API key rate limit exceeded',
        retryAfter: keyLimit.resetIn,
      })
    }
  }

  res.setHeader('X-RateLimit-Remaining', ipLimit.remaining)
  res.setHeader('X-RateLimit-Reset', ipLimit.resetIn)

  next()
}

export async function unpaidRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.headers['x-payment-payload']) return next()

  const ip = req.ip || 'unknown'

  const limit = await checkRateLimit({
    identifier: ip,
    type: 'ip',
    window: 'minute',
    limit: 20,
  })

  if (!limit.allowed) {
    return res.status(429).json({
      error: 'Too many unpaid requests',
      message: 'You are sending too many requests without payment. Add X-Payment-Payload header.',
      retryAfter: limit.resetIn,
    })
  }

  next()
}

import { createHmac } from 'crypto'
import { Request, Response, NextFunction } from 'express'

function verifyJWT(token: string, secret: string): { sub: string; exp?: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [header, payload, signature] = parts
    const expected = createHmac('sha256', Buffer.from(secret))
      .update(`${header}.${payload}`)
      .digest('base64url')
    if (expected !== signature) return null
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) return null
    return decoded
  } catch {
    return null
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']
  const apiKey = req.headers['x-api-key'] as string | undefined
  const legacyUserId = req.headers['x-user-id'] as string | undefined

  // Method 1: Bearer JWT — validate signature and set x-user-id to verified sub
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const jwtSecret = process.env.SUPABASE_JWT_SECRET
    if (!jwtSecret) {
      console.error('[auth] SUPABASE_JWT_SECRET not configured — cannot validate JWT')
      return res.status(500).json({ error: 'Server misconfiguration', code: 'MISSING_JWT_SECRET' })
    }
    const decoded = verifyJWT(token, jwtSecret)
    if (!decoded?.sub) {
      return res.status(401).json({ error: 'Unauthorized', code: 'INVALID_TOKEN', message: 'Invalid or expired token' })
    }
    // Override header with verified user ID so downstream middleware can trust it
    req.headers['x-user-id'] = decoded.sub
    return next()
  }

  // Method 2: API key — plan middleware handles identity lookup
  if (apiKey) return next()

  // Method 3: Legacy x-user-id without JWT (deprecated — log but allow during migration)
  if (legacyUserId) {
    console.warn(`[auth] DEPRECATED: x-user-id used without JWT — ${req.method} ${req.path}`)
    return next()
  }

  // No auth headers — pass through (plan middleware rejects unauthenticated protected routes)
  return next()
}

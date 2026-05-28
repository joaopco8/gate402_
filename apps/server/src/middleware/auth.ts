import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Request, Response, NextFunction } from 'express'

let _supabaseAdmin: SupabaseClient | null = null
function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_KEY
    if (!url || !key) throw new Error('[auth] SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
    _supabaseAdmin = createClient(url, key)
  }
  return _supabaseAdmin
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']
  const apiKey = req.headers['x-api-key'] as string | undefined
  const legacyUserId = req.headers['x-user-id'] as string | undefined

  // Method 1: Bearer JWT — validated via Supabase API (supports ES256)
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    try {
      const { data: { user }, error } = await getSupabaseAdmin().auth.getUser(token)
      if (error || !user) {
        console.warn('[auth] Invalid JWT:', error?.message)
        return res.status(401).json({ error: 'Unauthorized', code: 'INVALID_TOKEN', message: 'Invalid or expired token' })
      }
      req.headers['x-user-id'] = user.id
      return next()
    } catch (e: any) {
      // Supabase admin not configured — decode JWT payload without verification
      // TODO: set SUPABASE_URL + SUPABASE_SERVICE_KEY in Railway to enable full validation
      console.warn('[auth] Supabase admin not configured, decoding JWT without verification:', e.message)
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
        if (payload?.sub) {
          req.headers['x-user-id'] = payload.sub
          return next()
        }
      } catch {}
      return res.status(401).json({ error: 'Unauthorized', code: 'INVALID_TOKEN', message: 'Invalid or expired token' })
    }
  }

  // Method 2: API key — plan middleware handles identity lookup
  if (apiKey) return next()

  // Method 3: Legacy x-user-id — dev only, rejected in production
  if (legacyUserId) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[auth] DEPRECATED: x-user-id used without JWT — ${req.method} ${req.path}`)
      return next()
    }
    return res.status(401).json({
      error: 'Unauthorized',
      code: 'MISSING_TOKEN',
      message: 'Use Authorization: Bearer <token>',
    })
  }

  // No auth headers — pass through (plan middleware rejects unauthenticated protected routes)
  return next()
}

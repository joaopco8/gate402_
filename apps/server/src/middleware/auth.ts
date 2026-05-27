import { createClient } from '@supabase/supabase-js'
import { Request, Response, NextFunction } from 'express'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']
  const apiKey = req.headers['x-api-key'] as string | undefined
  const legacyUserId = req.headers['x-user-id'] as string | undefined

  // Method 1: Bearer JWT — validated via Supabase API (supports ES256)
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
      if (error || !user) {
        console.warn('[auth] Invalid JWT:', error?.message)
        return res.status(401).json({ error: 'Unauthorized', code: 'INVALID_TOKEN', message: 'Invalid or expired token' })
      }
      console.log('[auth] JWT valid — user:', user.id.slice(0, 8))
      req.headers['x-user-id'] = user.id
      return next()
    } catch (e: any) {
      console.error('[auth] JWT validation error:', e.message)
      return res.status(401).json({ error: 'Unauthorized', code: 'INVALID_TOKEN', message: 'Invalid or expired token' })
    }
  }

  // Method 2: API key — plan middleware handles identity lookup
  if (apiKey) return next()

  // Method 3: Legacy x-user-id (accepted during migration period)
  if (legacyUserId) {
    console.warn(`[auth] DEPRECATED: x-user-id used without JWT — ${req.method} ${req.path}`)
    return next()
  }

  // No auth headers — pass through (plan middleware rejects unauthenticated protected routes)
  return next()
}

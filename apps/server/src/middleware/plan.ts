import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

export async function requirePro(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string
  const supabaseId = req.headers['x-user-id'] as string

  let user = null

  if (apiKey) {
    user = await prisma.user.findUnique({ where: { apiKey } }).catch(() => null)
  } else if (supabaseId) {
    user = await prisma.user.findUnique({ where: { supabaseId } }).catch(() => null)
  }

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Valid API key required. Get yours at gate402.dev/settings',
    })
  }

  if (user.plan !== 'pro' && user.plan !== 'enterprise') {
    return res.status(403).json({
      error: 'Pro plan required',
      code: 'UPGRADE_REQUIRED',
      message: 'This feature requires a Pro plan.',
      currentPlan: user.plan,
      upgradeUrl: 'https://gate402.dev/billing',
    })
  }

  // Propagate supabaseId so downstream route handlers that read x-user-id work with API key auth
  if (apiKey && user) req.headers['x-user-id'] = user.supabaseId
  ;(req as any).gate402User = user
  next()
}

export async function attachPlan(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string
  const supabaseId = req.headers['x-user-id'] as string

  if (supabaseId || apiKey) {
    const user = supabaseId
      ? await prisma.user.findUnique({ where: { supabaseId } }).catch(() => null)
      : await prisma.user.findUnique({ where: { apiKey } }).catch(() => null)

    if (user) {
      ;(req as any).userPlan = user.plan
      ;(req as any).userId = user.id
    }
  }

  next()
}

export async function requireAccount(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string
  const supabaseId = req.headers['x-user-id'] as string

  let user = null

  if (apiKey) {
    user = await prisma.user.findUnique({ where: { apiKey } }).catch(() => null)
  } else if (supabaseId) {
    user = await prisma.user.findUnique({ where: { supabaseId } }).catch(() => null)
  }

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Valid API key required. Get yours at gate402.dev',
    })
  }

  // Propagate supabaseId so downstream route handlers that read x-user-id work with API key auth
  if (apiKey && user) req.headers['x-user-id'] = user.supabaseId
  ;(req as any).gate402User = user
  next()
}

import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { getRevenueStats } from '../lib/revenueLog'

const router = Router()

router.post('/admin/set-plan', async (req, res) => {
  const adminSecret = req.headers['x-admin-secret'] as string

  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { supabaseId, plan } = req.body

  if (!['free', 'pro', 'enterprise'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan. Must be: free, pro, enterprise' })
  }

  const user = await prisma.user.update({
    where: { supabaseId },
    data: { plan },
  })

  return res.json({
    supabaseId: user.supabaseId,
    plan: user.plan,
    message: `Plan updated to ${plan}`,
  })
})

router.get('/admin/revenue', async (req, res) => {
  const adminSecret = req.headers['x-admin-secret'] as string
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const stats = await getRevenueStats()
  return res.json(stats)
})

export default router

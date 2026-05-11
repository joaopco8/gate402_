import { Router } from 'express'
import Stripe from 'stripe'
import { prisma } from '../lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
})

const router = Router()

// POST /api/billing/checkout — create Stripe checkout session
router.post('/billing/checkout', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string
    if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' })

    const user = await prisma.user.findUnique({ where: { supabaseId } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (user.plan === 'pro' || user.plan === 'enterprise') {
      return res.status(400).json({ error: 'Already on Pro plan' })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      }],
      client_reference_id: supabaseId,
      customer_email: user.email || undefined,
      metadata: { supabaseId, plan: 'pro' },
      success_url: 'https://gate402.dev/dashboard?upgraded=true',
      cancel_url: 'https://gate402.dev/pricing?cancelled=true',
    })

    return res.json({ url: session.url, sessionId: session.id })
  } catch (error: any) {
    console.error('[billing/checkout] Error:', error)
    return res.status(500).json({ error: error.message })
  }
})

// POST /api/billing/webhook — Stripe webhook (raw body required)
router.post('/billing/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  if (!webhookSecret || webhookSecret === 'placeholder_will_update') {
    console.warn('[billing/webhook] No webhook secret configured — skipping verification')
    return res.json({ received: true })
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent>

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err: any) {
    console.error('[billing/webhook] Signature error:', err.message)
    return res.status(400).json({ error: err.message })
  }

  const obj = event.data.object as Record<string, any>

  switch (event.type) {
    case 'checkout.session.completed': {
      const supabaseId = obj.client_reference_id || obj.metadata?.supabaseId

      if (supabaseId) {
        await prisma.user.update({
          where: { supabaseId },
          data: {
            plan: 'pro',
            stripeCustomerId: obj.customer as string,
            stripeSubscriptionId: obj.subscription as string,
          },
        })
        console.log(`[billing] Upgraded ${supabaseId} to Pro`)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const customerId = obj.customer as string

      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: { plan: 'free' },
      })
      console.log(`[billing] Downgraded customer ${customerId} to free`)
      break
    }
  }

  return res.json({ received: true })
})

// GET /api/billing/status — current plan info
router.get('/billing/status', async (req, res) => {
  const supabaseId = req.headers['x-user-id'] as string
  if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' })

  const user = await prisma.user.findUnique({ where: { supabaseId } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  return res.json({
    plan: user.plan,
    isPro: user.plan === 'pro' || user.plan === 'enterprise',
    stripeCustomerId: user.stripeCustomerId || null,
  })
})

export default router

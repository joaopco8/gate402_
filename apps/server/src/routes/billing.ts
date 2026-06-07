import { Router } from 'express'
import Stripe from 'stripe'
import { prisma } from '../lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
})

const router = Router()

const PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID || '',
  pro: process.env.STRIPE_PRO_PRICE_ID || process.env.STRIPE_PRICE_ID || '',
}

// POST /api/billing/checkout — create Stripe checkout session
router.post('/billing/checkout', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string
    if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' })

    const user = await prisma.user.findUnique({ where: { supabaseId } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const { plan = 'pro' } = req.body

    if (plan !== 'starter' && plan !== 'pro') {
      return res.status(400).json({ error: 'Invalid plan. Must be starter or pro.', code: 'INVALID_PLAN' })
    }

    if (user.plan === 'enterprise') {
      return res.status(400).json({ error: 'Contact us to manage your Enterprise plan.' })
    }
    if (user.plan === 'pro' && plan === 'starter') {
      return res.status(400).json({ error: 'Already on a higher plan.' })
    }
    if (user.plan === plan) {
      return res.status(400).json({ error: `Already on ${plan} plan.` })
    }

    const priceId = PRICE_IDS[plan]
    if (!priceId) {
      return res.status(400).json({
        error: 'Price not configured for this plan. Contact hello@metera.dev.',
        code: 'PRICE_NOT_CONFIGURED',
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      client_reference_id: supabaseId,
      customer_email: user.email || undefined,
      metadata: { supabaseId, plan },
      success_url: 'https://gate402.dev/dashboard?upgraded=true',
      cancel_url: 'https://gate402.dev/pricing?cancelled=true',
    })

    return res.json({ url: session.url, sessionId: session.id })
  } catch (error: any) {
    console.error('[billing/checkout] Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/billing/webhook — Stripe webhook (raw body required)
router.post('/billing/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  if (!webhookSecret || webhookSecret === 'placeholder_will_update') {
    console.error('[billing/webhook] STRIPE_WEBHOOK_SECRET not configured — rejecting event')
    return res.status(500).json({ error: 'Webhook not configured' })
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
      const planFromMeta = obj.metadata?.plan || 'pro'

      if (supabaseId) {
        // Resolve plan from price ID for extra accuracy
        const subscription = obj.subscription
          ? await stripe.subscriptions.retrieve(obj.subscription as string)
          : null
        const priceId = subscription?.items?.data[0]?.price?.id

        const planByPrice: Record<string, string> = {}
        if (PRICE_IDS.starter) planByPrice[PRICE_IDS.starter] = 'starter'
        if (PRICE_IDS.pro) planByPrice[PRICE_IDS.pro] = 'pro'

        const resolvedPlan = (priceId && planByPrice[priceId]) || planFromMeta

        await prisma.user.update({
          where: { supabaseId },
          data: {
            plan: resolvedPlan,
            stripeCustomerId: obj.customer as string,
            stripeSubscriptionId: obj.subscription as string,
          },
        })
        console.log(`[billing] Upgraded ${supabaseId} to ${resolvedPlan}`)
      }
      break
    }

    case 'customer.subscription.updated': {
      // Handle plan changes via portal (e.g. starter → pro)
      const customerId = obj.customer as string
      const priceId = obj.items?.data[0]?.price?.id

      if (priceId) {
        const planByPrice: Record<string, string> = {}
        if (PRICE_IDS.starter) planByPrice[PRICE_IDS.starter] = 'starter'
        if (PRICE_IDS.pro) planByPrice[PRICE_IDS.pro] = 'pro'

        const newPlan = planByPrice[priceId]
        if (newPlan) {
          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: { plan: newPlan },
          })
          console.log(`[billing] Updated customer ${customerId} to ${newPlan}`)
        }
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

// POST /api/billing/portal — create Stripe customer portal session
router.post('/billing/portal', async (req, res) => {
  try {
    const supabaseId = req.headers['x-user-id'] as string
    if (!supabaseId) return res.status(401).json({ error: 'Unauthorized' })

    const user = await prisma.user.findUnique({ where: { supabaseId } })
    if (!user) return res.status(404).json({ error: 'User not found' })
    if (!user.stripeCustomerId) {
      return res.json({
        url: null,
        message: 'Manual plan — no Stripe subscription to manage.',
        manualPlan: true,
      })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: 'https://gate402.dev/dashboard/billing',
    })

    return res.json({ url: session.url })
  } catch (error: any) {
    console.error('[billing/portal] Error:', error)
    return res.status(500).json({ error: error.message })
  }
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

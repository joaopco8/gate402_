'use client'

import { useState, useEffect, type ReactNode, type CSSProperties } from 'react'
import { Check } from 'lucide-react'
import { createClient } from '../../../lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import DashboardLayout from '../components/DashboardLayout'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'
const LINE = '1px solid #2A2E2A'

const FREE_FEATURES = [
  'Hosted proxy endpoints (up to 3)',
  'Agent wallet (1 wallet)',
  'Public marketplace listing',
  'Solana devnet + mainnet',
  'Last 5 calls visible',
  '7-day analytics',
  'Community support',
  'MIT licensed',
]

const STARTER_FEATURES = [
  'Everything in Free',
  'Up to 10 hosted endpoints',
  'Up to 5 agent wallets',
  'Last 20 calls visible',
  '30-day analytics',
  'Community support',
  'Cancel anytime',
]

const PRO_FEATURES = [
  'Everything in Starter',
  'Unlimited hosted endpoints',
  'Up to 20 agent wallets',
  'Last 50 calls visible',
  '90-day analytics',
  'Revenue breakdown gross/net',
  'Top paying agents',
  'Latency p50/p95/p99',
  'CSV export + tax report',
  'MRR projection',
  'Metering engine',
  'Priority email support',
  'Cancel anytime',
]

const ENTERPRISE_FEATURES = [
  'Everything in Pro',
  'Unlimited agent wallets',
  'White-label dashboard',
  'Custom domain',
  'Marketplace featured listing',
  'SLA guarantee',
  'Dedicated support',
  'Custom integrations',
  'Onboarding call',
  'Cancel anytime',
]

const FAQ = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from your dashboard settings at any time. Your plan features remain active until the end of the billing period.',
  },
  {
    q: 'What happens to my endpoints if I downgrade?',
    a: 'Your endpoints stay active but you can only manage up to your plan limit. Analytics history is preserved for 90 days.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'We offer a 7-day refund if you are not satisfied. Contact hello@metera.dev.',
  },
]

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms', flexShrink: 0 }}>
      <path d="M3 5l4 4 4-4" />
    </svg>
  )
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: LINE }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 0', background: 'transparent', border: 'none', cursor: 'pointer',
          color: open ? '#E8F4EE' : '#7A8C79', fontSize: 14, fontFamily: "'Geist Mono', monospace",
          textAlign: 'left', gap: 12, transition: 'color 150ms',
        }}
      >
        <span>{q}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <p style={{ fontSize: 13, color: '#7A8C79', lineHeight: 1.65, paddingBottom: 16, fontFamily: "'Geist Mono', monospace", margin: 0 }}>
          {a}
        </p>
      )}
    </div>
  )
}

export default function BillingPage() {
  const { userData, loading } = useUser()
  const [upgradingStarter, setUpgradingStarter] = useState(false)
  const [upgradingPro, setUpgradingPro] = useState(false)
  const [managing, setManaging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const urlError = new URLSearchParams(window.location.search).get('error')
    if (urlError) setError(decodeURIComponent(urlError))
  }, [])

  const currentPlan = !loading ? (userData?.plan ?? 'free') : null
  const isStarter   = currentPlan === 'starter'
  const isPro       = currentPlan === 'pro' || currentPlan === 'enterprise'

  async function getSession() {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/auth/login?next=/billing'; return null }
    return session
  }

  async function handleManage() {
    setManaging(true)
    setError(null)
    try {
      const session = await getSession()
      if (!session) return
      const res = await fetch(`${SERVER_URL}/api/billing/portal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      if (data.manualPlan) {
        setError('Your plan was activated manually. To cancel, contact hello@metera.dev')
      } else if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Could not open billing portal. Try again.')
      }
    } catch {
      setError('Connection error. Try again.')
    } finally {
      setManaging(false)
    }
  }

  async function handleUpgrade(plan: 'starter' | 'pro') {
    if (plan === 'starter') setUpgradingStarter(true)
    else setUpgradingPro(true)
    setError(null)
    try {
      const session = await getSession()
      if (!session) return
      const res = await fetch(`${SERVER_URL}/api/billing/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Could not create checkout session. Try again.')
      }
    } catch (e: any) {
      setError(e?.message || 'Connection error. Try again.')
    } finally {
      setUpgradingStarter(false)
      setUpgradingPro(false)
    }
  }

  const planTag = (label: string, color: string) => (
    <span style={{ fontSize: 12, color, fontFamily: 'monospace', letterSpacing: '0.04em' }}>{label}</span>
  )

  function PlanCard({
    title, description, price, priceLabel, features, accent, checkColor,
    badge, tag, cta,
    borderRight = true,
  }: {
    title: string
    description: string
    price: string
    priceLabel: string
    features: string[]
    accent: string | null
    checkColor: string
    badge?: string
    tag?: ReactNode
    cta: ReactNode
    borderRight?: boolean
  }) {
    return (
      <div style={{
        borderRight: borderRight ? LINE : 'none',
        borderTop: accent ? `2px solid ${accent}` : '2px solid transparent',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ padding: '32px 32px 24px', borderBottom: LINE }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 17, fontWeight: 400, letterSpacing: '-0.02em', color: '#FFFFFF' }}>{title}</span>
            {badge && (
              <span style={{ fontSize: 10, color: '#60a5fa', fontFamily: 'monospace', letterSpacing: '0.06em', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', borderRadius: 4, padding: '1px 6px' }}>{badge}</span>
            )}
            {tag}
          </div>
          <p style={{ fontSize: 12, color: '#7A8C79', lineHeight: 1.6, marginBottom: 20 }}>{description}</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 36, fontWeight: 300, letterSpacing: '-0.04em', color: '#FFFFFF', lineHeight: 1 }}>{price}</span>
            <span style={{ fontSize: 12, color: '#4A5549' }}>{priceLabel}</span>
          </div>
        </div>
        <div style={{ padding: '24px 32px', flex: 1, borderBottom: LINE }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {features.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={12} strokeWidth={2} color={checkColor} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#7A8C79', lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '20px 32px' }}>
          {error && title !== 'Free' && title !== 'Enterprise' && (
            <p style={{ fontSize: 11, color: '#ef4444', marginBottom: 8, textAlign: 'center' }}>{error}</p>
          )}
          {cta}
        </div>
      </div>
    )
  }

  const btnStyle = (bg: string, color: string, disabled: boolean): CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: 38, width: '100%', fontSize: 12, fontWeight: 500,
    background: bg, color, border: 'none',
    letterSpacing: '-0.01em', cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1, transition: 'opacity 150ms ease',
    fontFamily: "'Geist Mono', monospace",
    textDecoration: 'none',
  })

  const outlineBtn: CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: 38, width: '100%', fontSize: 12, fontWeight: 500,
    background: 'transparent', border: LINE, color: '#7A8C79',
    textDecoration: 'none', letterSpacing: '-0.01em',
    transition: 'opacity 150ms ease', fontFamily: "'Geist Mono', monospace",
  }

  return (
    <DashboardLayout>
      <div style={{ fontFamily: "'Geist Mono', monospace", color: '#E8F4EE', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ padding: '56px 48px 40px', borderBottom: LINE, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 300, letterSpacing: '-0.04em', color: '#FFFFFF', margin: 0, lineHeight: 1.1 }}>
            Pricing that<br />
            <span style={{ color: '#7AF279' }}>scales with you.</span>
          </h1>
          <p style={{ fontSize: 15, color: '#7A8C79', lineHeight: 1.7, margin: 0, fontWeight: 300 }}>
            Start free. Upgrade when you need more. No hidden fees. Cancel anytime.
          </p>
        </div>

        {/* Plans grid — 4 columns */}
        <div className="resp-grid-bill" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: LINE }}>

          {/* Free */}
          <PlanCard
            title="Free"
            description="For developers getting started."
            price="$0"
            priceLabel="forever"
            features={FREE_FEATURES}
            accent={null}
            checkColor="#4A5549"
            tag={currentPlan === 'free' ? planTag('// current', '#7AF279') : undefined}
            cta={
              <a href="/dashboard" style={outlineBtn}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Go to dashboard →
              </a>
            }
          />

          {/* Starter */}
          <PlanCard
            title="Starter"
            description="For developers growing their first API."
            price="$29"
            priceLabel="monthly"
            features={STARTER_FEATURES}
            accent="#60a5fa"
            checkColor="#60a5fa"
            badge="New"
            tag={isStarter ? planTag('// active', '#60a5fa') : undefined}
            cta={
              isStarter ? (
                <button onClick={handleManage} disabled={managing}
                  style={btnStyle('#60a5fa', '#1B1E1B', managing)}
                  onMouseEnter={e => { if (!managing) e.currentTarget.style.opacity = '0.8' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = managing ? '0.6' : '1' }}
                >
                  {managing ? 'Redirecting…' : 'Manage subscription →'}
                </button>
              ) : isPro ? (
                <a href="/dashboard" style={outlineBtn}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Current plan is higher →
                </a>
              ) : (
                <button onClick={() => handleUpgrade('starter')} disabled={upgradingStarter}
                  style={btnStyle('#60a5fa', '#1B1E1B', upgradingStarter)}
                  onMouseEnter={e => { if (!upgradingStarter) e.currentTarget.style.opacity = '0.8' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = upgradingStarter ? '0.6' : '1' }}
                >
                  {upgradingStarter ? 'Redirecting…' : 'Start Starter →'}
                </button>
              )
            }
          />

          {/* Pro */}
          <PlanCard
            title="Pro"
            description="For developers monetizing at scale."
            price="$99"
            priceLabel="monthly"
            features={PRO_FEATURES}
            accent="#7AF279"
            checkColor="#7AF279"
            tag={isPro ? planTag('// active', '#7AF279') : planTag('// most popular', '#7AF279')}
            cta={
              isPro ? (
                <button onClick={handleManage} disabled={managing}
                  style={btnStyle('#7AF279', '#1B1E1B', managing)}
                  onMouseEnter={e => { if (!managing) e.currentTarget.style.opacity = '0.8' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = managing ? '0.6' : '1' }}
                >
                  {managing ? 'Redirecting…' : 'Manage subscription →'}
                </button>
              ) : (
                <button onClick={() => handleUpgrade('pro')} disabled={upgradingPro}
                  style={btnStyle('#7AF279', '#1B1E1B', upgradingPro)}
                  onMouseEnter={e => { if (!upgradingPro) e.currentTarget.style.opacity = '0.8' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = upgradingPro ? '0.6' : '1' }}
                >
                  {upgradingPro ? 'Redirecting…' : 'Start Pro →'}
                </button>
              )
            }
          />

          {/* Enterprise */}
          <PlanCard
            title="Enterprise"
            description="For teams processing serious volume."
            price="0.5%"
            priceLabel="of volume"
            features={ENTERPRISE_FEATURES}
            accent="#BC86FF"
            checkColor="#BC86FF"
            tag={currentPlan === 'enterprise' ? planTag('// active', '#BC86FF') : undefined}
            borderRight={false}
            cta={
              <a href="mailto:hello@metera.dev"
                style={{ ...btnStyle('#BC86FF', '#1B1E1B', false), cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Talk to us →
              </a>
            }
          />
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '56px 48px 80px' }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: '#7A8C79', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 32 }}>FAQ</p>
          <div style={{ borderTop: LINE }}>
            {FAQ.map(item => <FAQItem key={item.q} q={item.q} a={item.a} />)}
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}

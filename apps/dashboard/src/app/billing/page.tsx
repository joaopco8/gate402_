'use client'

import { useState, useEffect } from 'react'
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

const PRO_FEATURES = [
  'Everything in Free',
  'Unlimited hosted endpoints',
  'Unlimited agent wallets',
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

const FAQ = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from your dashboard settings at any time. Your Pro features remain active until the end of the billing period.',
  },
  {
    q: 'What happens to my endpoints if I downgrade?',
    a: 'Your endpoints stay active but you can only manage the first 3. Analytics history is preserved for 90 days.',
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
  const [upgrading, setUpgrading] = useState(false)
  const [managing, setManaging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const urlError = new URLSearchParams(window.location.search).get('error')
    if (urlError) setError(decodeURIComponent(urlError))
  }, [])

  const isPro = !loading && (userData?.plan === 'pro' || userData?.plan === 'enterprise')

  async function handleManage() {
    setManaging(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/auth/login?next=/billing'; return }
      const res = await fetch(`${SERVER_URL}/api/billing/portal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      if (data.manualPlan) {
        setError('Your Pro plan was activated manually. To cancel, contact hello@metera.dev')
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

  async function handleUpgrade() {
    setUpgrading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/auth/login?next=/billing'; return }
      const res = await fetch(`${SERVER_URL}/api/billing/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
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
      setUpgrading(false)
    }
  }

  return (
    <DashboardLayout>
      <div style={{
        fontFamily: "'Geist Mono', monospace",
        color: '#E8F4EE',
        minHeight: '100vh',
      }}>

        {/* Header */}
        <div style={{
          padding: '56px 48px 40px',
          borderBottom: LINE,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 12,
        }}>
          <h1 style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            fontWeight: 300,
            letterSpacing: '-0.04em',
            color: '#FFFFFF',
            margin: 0,
            lineHeight: 1.1,
          }}>
            Pricing that<br />
            <span style={{ color: '#7AF279' }}>scales with you.</span>
          </h1>
          <p style={{
            fontSize: 15,
            color: '#7A8C79',
            lineHeight: 1.7,
            margin: 0,
            fontWeight: 300,
          }}>
            Start free. Upgrade when you need more. No hidden fees. Cancel anytime.
          </p>
        </div>

        {/* Plans grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: LINE }}>

          {/* Free */}
          <div style={{
            borderRight: LINE,
            borderTop: '2px solid transparent',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ padding: '40px 40px 32px', borderBottom: LINE }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 400, letterSpacing: '-0.02em', color: '#FFFFFF' }}>Free</span>
                {!isPro && !loading && (
                  <span style={{ fontSize: 12, color: '#7AF279', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                    // current plan
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13, color: '#7A8C79', lineHeight: 1.6, marginBottom: 24 }}>
                For developers getting started.
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 40, fontWeight: 300, letterSpacing: '-0.04em', color: '#FFFFFF', lineHeight: 1 }}>$0</span>
                <span style={{ fontSize: 13, color: '#4A5549' }}>forever</span>
              </div>
            </div>
            <div style={{ padding: '32px 40px', flex: 1, borderBottom: LINE }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {FREE_FEATURES.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Check size={13} strokeWidth={2} color="#4A5549" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#7A8C79', lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '24px 40px' }}>
              <a
                href="/dashboard"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  height: 40, width: '100%', fontSize: 13, fontWeight: 500,
                  textDecoration: 'none', letterSpacing: '-0.01em',
                  background: 'transparent', border: LINE, color: '#7A8C79',
                  transition: 'opacity 150ms ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Go to dashboard →
              </a>
            </div>
          </div>

          {/* Pro */}
          <div style={{
            borderTop: '2px solid #7AF279',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ padding: '40px 40px 32px', borderBottom: LINE }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 400, letterSpacing: '-0.02em', color: '#FFFFFF' }}>Pro</span>
                {isPro ? (
                  <span style={{ fontSize: 12, color: '#7AF279', fontFamily: 'monospace', letterSpacing: '0.04em' }}>// active</span>
                ) : (
                  <span style={{ fontSize: 12, color: '#7AF279', fontFamily: 'monospace', letterSpacing: '0.04em' }}>// most popular</span>
                )}
              </div>
              <p style={{ fontSize: 13, color: '#7A8C79', lineHeight: 1.6, marginBottom: 24 }}>
                For developers monetizing at scale.
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 40, fontWeight: 300, letterSpacing: '-0.04em', color: '#FFFFFF', lineHeight: 1 }}>$99</span>
                <span style={{ fontSize: 13, color: '#4A5549' }}>monthly</span>
              </div>
            </div>
            <div style={{ padding: '32px 40px', flex: 1, borderBottom: LINE }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PRO_FEATURES.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Check size={13} strokeWidth={2} color="#7AF279" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#7A8C79', lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '24px 40px' }}>
              {error && (
                <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 10, textAlign: 'center' }}>{error}</p>
              )}
              {isPro ? (
                <button
                  onClick={handleManage}
                  disabled={managing}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: 40, width: '100%', fontSize: 13, fontWeight: 500,
                    background: '#7AF279', color: '#1B1E1B', border: 'none',
                    letterSpacing: '-0.01em', cursor: managing ? 'not-allowed' : 'pointer',
                    opacity: managing ? 0.7 : 1, transition: 'opacity 150ms ease',
                    fontFamily: "'Geist Mono', monospace",
                  }}
                  onMouseEnter={e => { if (!managing) e.currentTarget.style.opacity = '0.8' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = managing ? '0.7' : '1' }}
                >
                  {managing ? 'Redirecting…' : 'Manage subscription →'}
                </button>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: 40, width: '100%', fontSize: 13, fontWeight: 500,
                    background: '#7AF279', color: '#1B1E1B', border: 'none',
                    letterSpacing: '-0.01em', cursor: upgrading ? 'not-allowed' : 'pointer',
                    opacity: upgrading ? 0.7 : 1, transition: 'opacity 150ms ease',
                    fontFamily: "'Geist Mono', monospace",
                  }}
                  onMouseEnter={e => { if (!upgrading) e.currentTarget.style.opacity = '0.8' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = upgrading ? '0.7' : '1' }}
                >
                  {upgrading ? 'Redirecting to Stripe…' : 'Start Pro →'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '56px 48px 80px' }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', fontFamily: 'var(--font-label)', textTransform: 'uppercase', marginBottom: 32 }}>
            FAQ
          </p>
          <div style={{ borderTop: LINE }}>
            {FAQ.map(item => <FAQItem key={item.q} q={item.q} a={item.a} />)}
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}

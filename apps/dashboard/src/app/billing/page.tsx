'use client'

import { useState, useEffect } from 'react'
import { CheckIcon } from 'lucide-react'
import { createClient } from '../../../lib/supabase/client'
import { useUser } from '../hooks/useUser'
import DashboardLayout from '../components/DashboardLayout'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'

const FREE_FEATURES = [
  'npm install gate402',
  'x402 middleware',
  'Solana devnet + mainnet',
  'Up to 3 endpoints',
  'Last 5 calls visible',
  '7-day chart',
  'Community support',
  'MIT licensed',
]

const PRO_FEATURES = [
  'Everything in Free',
  'Unlimited endpoints',
  'Last 50 calls visible',
  '90-day analytics',
  'Revenue breakdown gross/net',
  'Top paying agents',
  'Latency p50/p95/p99',
  'Failed requests tracking',
  'CSV export + tax report',
  'Wallet management + withdrawals',
  'MRR projection',
  'Metering engine (token/compute/bandwidth)',
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
    a: 'We offer a 7-day refund if you are not satisfied. Contact support@gate402.dev.',
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
    <div style={{ borderBottom: '1px solid #1a1a1a' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 0', background: 'transparent', border: 'none', cursor: 'pointer',
          color: open ? '#fff' : '#898989', fontSize: 14, fontFamily: 'var(--font-display)',
          textAlign: 'left', gap: 12, transition: 'color 150ms',
        }}
      >
        <span>{q}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <p style={{ fontSize: 13, color: '#898989', lineHeight: 1.65, paddingBottom: 16, fontFamily: 'var(--font-display)' }}>
          {a}
        </p>
      )}
    </div>
  )
}

export default function BillingPage() {
  const { userData, loading } = useUser()
  const [upgrading, setUpgrading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const urlError = new URLSearchParams(window.location.search).get('error')
    if (urlError) setError(decodeURIComponent(urlError))
  }, [])

  const isPro = !loading && (userData?.plan === 'pro' || userData?.plan === 'enterprise')
  const [managing, setManaging] = useState(false)

  async function handleManage() {
    setManaging(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login?next=/billing'; return }

      const res = await fetch(`${SERVER_URL}/api/billing/portal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
      })
      const data = await res.json()
      if (data.url) {
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login?next=/billing'; return }

      const res = await fetch(`${SERVER_URL}/api/billing/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
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
    <div style={{ background: '#0D0D0D', minHeight: '100vh', fontFamily: 'var(--font-display)', color: '#fff' }}>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 24px 80px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <h1 style={{ fontWeight: 500, lineHeight: 1.15, margin: 0 }}>
            <span style={{ color: '#fff', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>Pricing that</span>{' '}
            <span style={{ color: '#898989', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>scales with you.</span>
          </h1>
          <p style={{ fontSize: 16, color: '#898989', lineHeight: 1.65, maxWidth: 480, margin: 0 }}>
            Start free. Upgrade when you need more. No hidden fees. No minimums. Cancel anytime.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', maxWidth: 720, margin: '0 auto 56px' }}>

          {/* Free card */}
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '28px', display: 'flex', flexDirection: 'column', gap: 24, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontWeight: 500, fontSize: 20, lineHeight: 1.25 }}>
                  Free{' '}
                  {!isPro && !loading && (
                    <span style={{ fontSize: 14, fontWeight: 400, color: '#00bc7d' }}>// current plan</span>
                  )}
                </div>
                <p style={{ fontSize: 14, color: '#898989', lineHeight: 1.57, margin: 0 }}>For developers getting started.</p>
                <div style={{ fontSize: 12, lineHeight: 1.25 }}>
                  <span style={{ fontWeight: 500, fontSize: 16 }}>$0</span>
                  <span style={{ color: '#898989' }}> forever</span>
                </div>
              </div>
              <hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {FREE_FEATURES.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckIcon style={{ width: 15, height: 15, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, lineHeight: 1.1 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '0 0 24px' }} />
              <a
                href="/dashboard"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', height: 40, fontSize: 14, fontWeight: 500,
                  background: 'transparent', border: '1px solid #333', color: '#d1d5db',
                  textDecoration: 'none', transition: 'opacity 150ms',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Go to dashboard
              </a>
            </div>
          </div>

          {/* Pro card */}
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '28px', display: 'flex', flexDirection: 'column', gap: 24, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontWeight: 500, fontSize: 20, lineHeight: 1.25 }}>
                  Pro{' '}
                  {isPro ? (
                    <span style={{ fontSize: 14, fontWeight: 400, color: '#00bc7d' }}>// active</span>
                  ) : (
                    <span style={{ fontSize: 14, fontWeight: 400, color: '#00bc7d' }}>// most popular</span>
                  )}
                </div>
                <p style={{ fontSize: 14, color: '#898989', lineHeight: 1.57, margin: 0 }}>For developers monetizing at scale.</p>
                <div style={{ fontSize: 12, lineHeight: 1.25 }}>
                  <span style={{ fontWeight: 500, fontSize: 16 }}>$99</span>
                  <span style={{ color: '#898989' }}> monthly</span>
                </div>
              </div>
              <hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {PRO_FEATURES.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckIcon style={{ width: 15, height: 15, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, lineHeight: 1.1 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '0 0 24px' }} />
              {isPro ? (
                <button
                  onClick={handleManage}
                  disabled={managing}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '100%', height: 40, fontSize: 14, fontWeight: 500,
                    backgroundColor: '#00bc7d', color: '#111111',
                    border: 'none', cursor: managing ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-display)',
                    opacity: managing ? 0.7 : 1, transition: 'opacity 150ms',
                  }}
                  onMouseEnter={e => { if (!managing) e.currentTarget.style.opacity = '0.9' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = managing ? '0.7' : '1' }}
                >
                  {managing ? 'Redirecting…' : 'Manage subscription'}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleUpgrade}
                    disabled={upgrading}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '100%', height: 40, fontSize: 14, fontWeight: 500,
                      backgroundColor: '#00bc7d', color: '#111111',
                      border: 'none', cursor: upgrading ? 'not-allowed' : 'pointer',
                      fontFamily: 'var(--font-display)',
                      opacity: upgrading ? 0.7 : 1, transition: 'opacity 150ms',
                    }}
                    onMouseEnter={e => { if (!upgrading) e.currentTarget.style.opacity = '0.9' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = upgrading ? '0.7' : '1' }}
                  >
                    {upgrading ? 'Redirecting to Stripe…' : 'Start Pro'}
                  </button>
                  {error && (
                    <p style={{ fontSize: 12, color: '#ef4444', marginTop: 8, textAlign: 'center' }}>{error}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{
            fontSize: 11, color: '#444', fontFamily: 'var(--font-code)',
            marginBottom: 24,
          }}>
            FAQ
          </p>
          {FAQ.map(item => <FAQItem key={item.q} q={item.q} a={item.a} />)}
        </div>

      </div>
    </div>
    </DashboardLayout>
  )
}

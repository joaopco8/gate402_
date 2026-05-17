'use client'

import { useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { useUser } from '../hooks/useUser'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'

const FREE_FEATURES = [
  { label: 'npm install gate402',         included: true },
  { label: 'x402 middleware',             included: true },
  { label: 'Solana devnet + mainnet',     included: true },
  { label: 'Up to 3 endpoints',          included: true },
  { label: 'Last 5 calls visible',       included: true },
  { label: '7-day chart',                included: true },
  { label: 'Advanced analytics',         included: false },
  { label: 'Revenue breakdown',          included: false },
  { label: 'CSV export',                 included: false },
  { label: 'Latency tracking',           included: false },
  { label: 'Wallet management',          included: false },
  { label: 'Unlimited endpoints',        included: false },
]

const PRO_FEATURES = [
  'Everything in Free',
  'Unlimited endpoints',
  'Last 50 calls visible',
  '90-day analytics',
  'Revenue breakdown (gross/net/fees)',
  'Top paying agents',
  'Latency p50/p95/p99',
  'Failed requests tracking',
  'CSV export + tax report',
  'Wallet management + withdrawals',
  'MRR projection',
  'Metering engine (token/compute/bandwidth)',
  'Priority email support',
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

function CheckIcon({ color = '#00bc7d' }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="7" r="7" fill={color} fillOpacity={0.15} />
      <path d="M4 7l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="7" r="7" fill="#333" />
      <path d="M5 5l4 4M9 5l-4 4" stroke="#555" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

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
          color: open ? '#fff' : '#aaa', fontSize: 14, fontFamily: 'var(--font-display)',
          textAlign: 'left', gap: 12, transition: 'color 150ms',
        }}
      >
        <span>{q}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.65, paddingBottom: 16, fontFamily: 'var(--font-display)' }}>
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

  const isPro = !loading && (userData?.plan === 'pro' || userData?.plan === 'enterprise')

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
        setError('Could not create checkout session. Try again.')
      }
    } catch {
      setError('Connection error. Try again.')
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: 'var(--font-display)' }}>

      {/* Header */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #1a1a1a',
      }}>
        <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="/logo-gate.png" alt="gate402" style={{ height: 20, width: 'auto' }} />
        </a>
        <a href="/dashboard" style={{
          fontSize: 13, color: '#666', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
          transition: 'color 150ms',
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#666'}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M9 3L5 7l4 4" />
          </svg>
          Dashboard
        </a>
      </div>

      {/* Content */}
      <div style={{ paddingTop: 56, maxWidth: 880, margin: '0 auto', padding: '88px 24px 80px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{
            display: 'inline-block', marginBottom: 20,
            background: 'rgba(153,69,255,0.1)', color: '#9945FF',
            border: '1px solid rgba(153,69,255,0.25)', borderRadius: 4,
            padding: '3px 10px', fontSize: 11,
            fontFamily: 'var(--font-code)', letterSpacing: '0.1em',
          }}>
            PRO PLAN
          </span>
          <h1 style={{ fontSize: 36, fontWeight: 600, color: '#fff', letterSpacing: '-0.5px', marginBottom: 12, lineHeight: 1.1 }}>
            Unlock the full Gate402
          </h1>
          <p style={{ fontSize: 16, color: '#666', lineHeight: 1.6 }}>
            Everything you need to monetize APIs at scale.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 56 }}>

          {/* Free card */}
          <div style={{
            background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 12, padding: 28,
            display: 'flex', flexDirection: 'column',
          }}>
            <span style={{
              display: 'inline-block', marginBottom: 20,
              background: '#111', color: '#666',
              border: '1px solid #1a1a1a', borderRadius: 4,
              padding: '3px 10px', fontSize: 11,
              fontFamily: 'var(--font-code)', letterSpacing: '0.08em',
            }}>
              FREE — Current plan
            </span>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 32, fontWeight: 600, color: '#fff' }}>$0</span>
              <span style={{ fontSize: 14, color: '#555', marginLeft: 4 }}>/month</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {FREE_FEATURES.map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {f.included ? <CheckIcon /> : <XIcon />}
                  <span style={{ fontSize: 13, color: f.included ? '#aaa' : '#444' }}>{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro card */}
          <div style={{
            background: 'rgba(153,69,255,0.05)',
            border: '1px solid rgba(153,69,255,0.3)',
            borderRadius: 12, padding: 28,
            display: 'flex', flexDirection: 'column',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Subtle purple glow top */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(153,69,255,0.4), transparent)',
              pointerEvents: 'none',
            }} />

            <span style={{
              display: 'inline-block', marginBottom: 20,
              background: 'rgba(153,69,255,0.1)', color: '#9945FF',
              border: '1px solid rgba(153,69,255,0.25)', borderRadius: 4,
              padding: '3px 10px', fontSize: 11,
              fontFamily: 'var(--font-code)', letterSpacing: '0.08em',
            }}>
              PRO — Recommended
            </span>

            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 40, fontWeight: 700, color: '#fff', letterSpacing: '-1px' }}>$99</span>
              <span style={{ fontSize: 14, color: '#888', marginLeft: 4 }}>/month</span>
            </div>
            <p style={{ fontSize: 12, color: '#555', marginBottom: 24, fontFamily: 'var(--font-code)' }}>
              Billed monthly via Stripe. Cancel anytime.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 28 }}>
              {PRO_FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckIcon color="#9945FF" />
                  <span style={{ fontSize: 13, color: '#ccc' }}>{f}</span>
                </div>
              ))}
            </div>

            {isPro ? (
              <div style={{ textAlign: 'center' }}>
                <span style={{
                  display: 'inline-block', marginBottom: 12,
                  background: 'rgba(153,69,255,0.12)', color: '#9945FF',
                  border: '1px solid rgba(153,69,255,0.3)', borderRadius: 4,
                  padding: '4px 12px', fontSize: 12,
                  fontFamily: 'var(--font-code)', letterSpacing: '0.08em',
                }}>
                  PRO — Active
                </span>
                <p style={{ fontSize: 14, color: '#888', marginBottom: 16 }}>You are on the Pro plan.</p>
                <a
                  href={`${SERVER_URL}/api/billing/portal`}
                  style={{
                    display: 'block', fontSize: 13, color: '#9945FF',
                    fontFamily: 'var(--font-code)', textDecoration: 'none',
                    transition: 'opacity 150ms',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Manage subscription →
                </a>
              </div>
            ) : (
              <>
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  style={{
                    width: '100%', padding: '14px', background: '#9945FF',
                    border: 'none', borderRadius: 8, cursor: upgrading ? 'not-allowed' : 'pointer',
                    fontSize: 15, fontWeight: 500, color: '#fff',
                    fontFamily: 'var(--font-display)',
                    opacity: upgrading ? 0.7 : 1, transition: 'opacity 150ms',
                  }}
                  onMouseEnter={e => { if (!upgrading) e.currentTarget.style.opacity = '0.9' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = upgrading ? '0.7' : '1' }}
                >
                  {upgrading ? 'Redirecting to Stripe…' : 'Upgrade to Pro'}
                </button>
                {error && (
                  <p style={{ fontSize: 12, color: '#ef4444', marginTop: 8, textAlign: 'center' }}>{error}</p>
                )}
                <p style={{ fontSize: 11, color: '#444', textAlign: 'center', marginTop: 12, fontFamily: 'var(--font-code)' }}>
                  Secure payment via Stripe. No hidden fees.
                </p>
              </>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{
            fontSize: 11, color: '#444', fontFamily: 'var(--font-code)',
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24,
          }}>
            FAQ
          </p>
          {FAQ.map(item => <FAQItem key={item.q} q={item.q} a={item.a} />)}
        </div>

      </div>
    </div>
  )
}

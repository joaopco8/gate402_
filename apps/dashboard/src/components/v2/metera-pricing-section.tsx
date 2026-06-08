'use client'
import React, { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { DitheringShader } from './dithering-shader'
import { FadeIn, useStagger } from './animations'

const LINE = '1px solid #2A2E2A'
const PAD  = '0 64px'

const plans = [
  {
    title: 'Free',
    description: 'For developers getting started.',
    price: '$0',
    priceLabel: 'forever',
    cta: 'Read the docs',
    ctaHref: '/docs',
    accent: null,
    features: [
      'Hosted proxy endpoints (up to 3)',
      'Agent wallet (1 wallet)',
      'Public marketplace listing',
      'Solana devnet + mainnet',
      'Last 5 calls visible',
      '7-day analytics',
      'Community support',
      'MIT licensed',
    ],
  },
  {
    title: 'Starter',
    description: 'For developers growing their first API.',
    price: '$29',
    priceLabel: 'monthly',
    cta: 'Start Starter',
    ctaHref: '/auth/login?intent=checkout&plan=starter',
    accent: '#60a5fa',
    badge: '',
    features: [
      'Everything in Free',
      'Up to 10 hosted endpoints',
      'Up to 5 agent wallets',
      'Last 20 calls visible',
      '30-day analytics',
      'Community support',
      'Cancel anytime',
    ],
  },
  {
    title: 'Pro',
    description: 'For developers monetizing at scale.',
    price: '$99',
    priceLabel: 'monthly',
    cta: 'Start Pro',
    ctaHref: '/auth/login?intent=checkout&plan=pro',
    accent: '#7AF279',
    popular: true,
    features: [
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
    ],
  },
  {
    title: 'Enterprise',
    description: 'For teams processing serious volume.',
    price: '0.5%',
    priceLabel: 'of volume',
    cta: 'Talk to us',
    ctaHref: 'mailto:hello@metera.dev',
    accent: '#BC86FF',
    features: [
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
    ],
  },
]

export function MeteraPricingSection() {
  const [headerReady, setHeaderReady] = useState(false)
  const grid = useStagger(plans.length, 200, 100)

  useEffect(() => {
    const t = setTimeout(() => setHeaderReady(true), 800)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ borderBottom: LINE }}>

      {/* header */}
      <div className="v2r-pricing-head" style={{
        position: 'relative',
        padding: '80px 64px 56px',
        borderBottom: LINE,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 20,
        overflow: 'hidden',
      }}>
        <DitheringShader
          shape="wave"
          type="8x8"
          colorBack="#1B1E1B"
          colorFront="#BC86FF"
          pxSize={3}
          speed={0.6}
          style={{ opacity: headerReady ? 0.2 : 0, pointerEvents: 'none', transition: 'opacity 0.4s ease' }}
          onFirstFrame={() => setHeaderReady(true)}
        />
        <h2 style={{ position: 'relative', zIndex: 2, opacity: headerReady ? 1 : 0, transition: 'opacity 0.4s ease',
          fontSize: 'clamp(2rem, 4vw, 3.5rem)',
          fontWeight: 300,
          letterSpacing: '-0.04em',
          color: '#FFFFFF',
          maxWidth: 640,
          margin: 0,
          lineHeight: 1.05,
        }}>
          Pricing that<br />
          <span style={{ color: '#7AF279' }}>scales with you.</span>
        </h2>
        <p style={{
          position: 'relative',
          zIndex: 2,
          opacity: headerReady ? 1 : 0,
          transition: 'opacity 0.4s ease',
          fontFamily: "'Geist Mono', monospace",
          fontSize: 17,
          color: '#FFFFFF',
          lineHeight: 1.7,
          maxWidth: 440,
          margin: 0,
          fontWeight: 300,
        }}>
          Start free. Upgrade when you need more. No hidden fees. No minimums. Cancel anytime.
        </p>
      </div>

      {/* plans grid */}
      <div ref={grid.ref} className="v2r-pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {plans.map((plan, i) => (
          <div key={plan.title} className="v2r-plan-item" style={{
            ...grid.itemStyle(i),
            borderRight: i < 3 ? LINE : 'none',
            borderTop: plan.accent ? `2px solid ${plan.accent}` : '2px solid transparent',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* plan header */}
            <div style={{ padding: '40px 40px 32px', borderBottom: LINE }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{
                  fontSize: 18,
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                  color: '#FFFFFF',
                }}>
                  {plan.title}
                </span>
                {plan.popular && (
                  <span style={{ fontSize: 12, color: '#7AF279', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                    // most popular
                  </span>
                )}
                {'badge' in plan && plan.badge && (
                  <span style={{ fontSize: 11, color: '#60a5fa', fontFamily: 'monospace', letterSpacing: '0.04em', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', borderRadius: 4, padding: '1px 6px' }}>
                    {plan.badge}
                  </span>
                )}
              </div>
              <p style={{
                fontSize: 13,
                color: '#7A8C79',
                lineHeight: 1.6,
                marginBottom: 24,
              }}>
                {plan.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{
                  fontSize: 40,
                  fontWeight: 300,
                  letterSpacing: '-0.04em',
                  color: '#FFFFFF',
                  lineHeight: 1,
                }}>
                  {plan.price}
                </span>
                <span style={{ fontSize: 13, color: '#4A5549' }}>
                  {plan.priceLabel}
                </span>
              </div>
            </div>

            {/* features */}
            <div style={{ padding: '32px 40px', flex: 1, borderBottom: LINE }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {plan.features.map((feature) => (
                  <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Check
                      size={13}
                      strokeWidth={2}
                      color={plan.accent ?? '#4A5549'}
                      style={{ flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 13, color: '#7A8C79', lineHeight: 1.5 }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* cta */}
            <div style={{ padding: '24px 40px' }}>
              <a
                href={plan.ctaHref}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 40,
                  width: '100%',
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: 'none',
                  letterSpacing: '-0.01em',
                  transition: 'opacity 150ms ease',
                  ...(plan.accent === '#7AF279'
                    ? { background: '#7AF279', color: '#1B1E1B' }
                    : plan.accent === '#BC86FF'
                    ? { background: '#BC86FF', color: '#1B1E1B' }
                    : plan.accent === '#60a5fa'
                    ? { background: '#60a5fa', color: '#1B1E1B' }
                    : { background: 'transparent', border: LINE, color: '#7A8C79' }
                  ),
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {plan.cta} →
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

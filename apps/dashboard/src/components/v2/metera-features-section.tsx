'use client'
import React from 'react'
import { FadeIn, Strikethrough } from './animations'

const LINE = '1px solid #2A2E2A'
const GAP  = '0.75rem'

const marqueeData = [
  'How do I charge AI agents for my API?',
  'Can agents pay without a credit card?',
  'How do I monetize my MCP server?',
  'What is the x402 payment protocol?',
  'How do I accept USDC on Solana?',
  'Can I charge per API call?',
  'How do I add billing to my Claude tools?',
  'Do agents need a wallet to pay?',
  'How do agents handle HTTP 402?',
  'How do I monetize GPT-4 function calls?',
  'Can I get paid without a payment processor?',
  'How do I add pay-per-use to my API?',
]


function MarqueeRow({ items, duration, reverse }: { items: string[]; duration: string; reverse?: boolean }) {
  const doubled = [...items, ...items]
  return (
    <div style={{ overflow: 'hidden', position: 'relative', width: '100%' }}>
      <div style={{
        display: 'flex',
        gap: GAP,
        width: 'max-content',
        animationName: reverse ? 'v2-marquee-reverse' : 'v2-marquee',
        animationDuration: duration,
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
      }}>
        {doubled.map((q, i) => (
          <span key={i} style={{
            display: 'inline-flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            padding: '5px 14px',
            border: LINE,
            background: '#1F221F',
            fontSize: 13,
            color: '#7A8C79',
            fontFamily: "'Geist Mono', monospace",
            flexShrink: 0,
          }}>
            {q}
          </span>
        ))}
      </div>
    </div>
  )
}

export function MeteraFeaturesSection() {
  const third = Math.ceil(marqueeData.length / 3)
  const m1 = marqueeData.slice(0, third)
  const m2 = marqueeData.slice(third, third * 2)
  const m3 = marqueeData.slice(third * 2)

  return (
    <div style={{ borderBottom: LINE }}>

      {/* headline + description */}
      <div className="v2r-features-head" style={{
        padding: '80px 64px 56px',
        borderBottom: LINE,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 20,
      }}>
        <FadeIn>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 300,
            letterSpacing: '-0.04em',
            color: '#FFFFFF',
            maxWidth: 720,
            margin: 0,
            lineHeight: 1.05,
          }}>
            REMOVE THE <Strikethrough>ROADBLOCKS</Strikethrough>.<br />
            <span style={{ color: '#7AF279' }}>GET PAID FOR YOUR WORK.</span>
          </h2>
        </FadeIn>
        <FadeIn delay={100}>
          <p style={{
            fontSize: 15,
            color: '#7A8C79',
            lineHeight: 1.7,
            maxWidth: 480,
            margin: 0,
            fontWeight: 300,
            fontFamily: "'Geist Mono', monospace",
          }}>
            The tooling to monetize AI-facing APIs didn't exist.
            Metera builds it — invisible to your code, instant for your wallet.
          </p>
        </FadeIn>
      </div>

      {/* marquee block */}
      <div style={{
        position: 'relative',
        borderBottom: LINE,
        padding: '32px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        overflow: 'hidden',
      }}>
        {/* fade edges */}
        <div style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: 120,
          background: 'linear-gradient(to right, #1B1E1B, transparent)',
          zIndex: 2,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          right: 0, top: 0, bottom: 0,
          width: 120,
          background: 'linear-gradient(to left, #1B1E1B, transparent)',
          zIndex: 2,
          pointerEvents: 'none',
        }} />

        <MarqueeRow items={m1} duration="42s" />
        <MarqueeRow items={m2} duration="50s" reverse />
        <MarqueeRow items={m3} duration="38s" />
      </div>

    </div>
  )
}

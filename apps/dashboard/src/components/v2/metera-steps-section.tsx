'use client'
import React, { useState } from 'react'

const LINE  = "1px solid #2A2E2A"
const MONO  = "'Geist Mono', monospace"
const GREEN = "#7AF279"
const BG    = "#1B1E1B"
const TEXT  = "#E8F4EE"
const MUTED = "#7A8C79"
const DIM   = "#4A5549"

const STEPS = [
  {
    number: "01",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
    title: "Add your endpoint",
    desc: "Paste any API URL. Gate402 wraps it with x402 payment middleware in seconds.",
    bullets: [
      "No code changes to your API",
      "Any REST endpoint works",
      "Live in under 5 minutes",
    ],
  },
  {
    number: "02",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    title: "Set your price",
    desc: "Define per-call pricing in USDC. Set daily caps, per-call limits, or monthly budgets.",
    bullets: [
      "Start from $0.001 per call",
      "Per-call and per-day limits",
      "Change price anytime",
    ],
  },
  {
    number: "03",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: "Get paid",
    desc: "USDC lands in your Solana wallet automatically. No invoices, no banks, no waiting.",
    bullets: [
      "Instant USDC settlement",
      "Full analytics per endpoint",
      "Withdraw anytime",
    ],
  },
]

function StepCard({ step }: { step: typeof STEPS[0] }) {
  const [hov, setHov] = useState(false)

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border: `1px solid ${hov ? '#7AF27940' : '#2A2E2A'}`,
        borderRadius: 12,
        padding: '28px 28px',
        background: hov ? '#1F231F' : 'transparent',
        transition: 'border-color 0.2s ease, background 0.2s ease, transform 0.2s ease',
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        cursor: 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      {/* icon + number row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 44, height: 44,
          border: `1px solid ${hov ? '#7AF27940' : '#2A2E2A'}`,
          borderRadius: 8,
          background: '#252825',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: hov ? GREEN : MUTED,
          transition: 'color 0.2s ease, border-color 0.2s ease',
          flexShrink: 0,
        }}>
          {step.icon}
        </div>
      </div>

      {/* title + desc */}
      <div>
        <div style={{
          fontFamily: MONO,
          fontSize: 15,
          fontWeight: 500,
          color: TEXT,
          marginBottom: 10,
          letterSpacing: '-0.01em',
        }}>
          {step.title}
        </div>
        <div style={{
          fontFamily: MONO,
          fontSize: 13,
          color: MUTED,
          lineHeight: 1.75,
        }}>
          {step.desc}
        </div>
      </div>

      {/* bullets */}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {step.bullets.map((b, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 16, height: 16, borderRadius: '50%',
              background: '#7AF27914',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, display: 'block' }} />
            </span>
            <span style={{ fontFamily: MONO, fontSize: 12, color: DIM }}>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function MeteraStepsSection() {
  return (
    <div style={{ borderBottom: LINE }}>

      {/* Headline */}
      <div className="v2r-section-head" style={{ padding: "48px 64px", borderBottom: LINE }}>
        <h2 style={{
          fontSize: "clamp(2rem, 3.5vw, 3rem)",
          fontWeight: 300,
          color: "#FFFFFF",
          letterSpacing: "-0.04em",
          lineHeight: 1.05,
          margin: 0,
        }}>
          From API to income<br />
          <span style={{ color: GREEN }}>in three steps.</span>
        </h2>
      </div>

      {/* Steps */}
      <div className="v2r-steps-pad" style={{ padding: "56px 56px" }}>

        {/* connector line + numbers */}
        <div className="v2r-connector" style={{ position: 'relative', marginBottom: 24 }}>
          <div style={{
            position: 'absolute',
            left: 'calc(16.6667% + 12px)',
            right: 'calc(16.6667% + 12px)',
            top: '50%',
            height: 1,
            background: 'linear-gradient(to right, #2A2E2A, #2A2E2A)',
            borderTop: '1px dashed #2A2E2A',
            transform: 'translateY(-50%)',
          }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', position: 'relative', zIndex: 1 }}>
            {STEPS.map((step) => (
              <div key={step.number} style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: 28, height: 28,
                  borderRadius: '50%',
                  background: BG,
                  border: `1px solid #2A2E2A`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: MONO, fontSize: 11, fontWeight: 500,
                  color: GREEN,
                  outline: `4px solid ${BG}`,
                }}>
                  {step.number}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="v2r-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {STEPS.map((step) => (
            <StepCard key={step.number} step={step} />
          ))}
        </div>
      </div>

    </div>
  )
}

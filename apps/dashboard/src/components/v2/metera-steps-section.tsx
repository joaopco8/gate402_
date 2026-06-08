'use client'
import React from 'react'

const LINE  = "1px solid #2A2E2A"
const MONO  = "'Geist Mono', monospace"
const GREEN = "#7AF279"
const TEXT  = "#E8F4EE"
const MUTED = "#7A8C79"

const STEPS = [
  {
    image: "/ednpoint.jpg",
    title: "Add your endpoint",
    desc: "Paste any API URL. Gate402 wraps it with x402 payment middleware in seconds.",
  },
  {
    image: "/set.jpg",
    title: "Set your price",
    desc: "Define per-call pricing in USDC. Set daily caps, per-call limits, or monthly budgets.",
  },
  {
    image: "/get paid.jpg",
    title: "Get paid",
    desc: "USDC lands in your Solana wallet automatically. No invoices, no banks, no waiting.",
  },
]

function StepCard({ step }: { step: typeof STEPS[0] }) {
  return (
    <div style={{
      border: LINE,
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* image — aspect ratio 1080/1350 = 4/5 */}
      <div style={{ width: '100%', aspectRatio: '1080 / 1350', overflow: 'hidden' }}>
        <img
          src={step.image}
          alt={step.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* title + desc */}
      <div style={{ padding: '20px 24px', borderTop: LINE }}>
        <div style={{
          fontFamily: MONO,
          fontSize: 14,
          fontWeight: 500,
          color: TEXT,
          marginBottom: 8,
        }}>
          {step.title}
        </div>
        <div style={{
          fontFamily: MONO,
          fontSize: 12,
          color: MUTED,
          lineHeight: 1.75,
        }}>
          {step.desc}
        </div>
      </div>
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

        {/* Cards */}
        <div className="v2r-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {STEPS.map((step) => (
            <StepCard key={step.title} step={step} />
          ))}
        </div>
      </div>

    </div>
  )
}

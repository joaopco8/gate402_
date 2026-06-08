'use client'
import React from 'react'
import { MatrixText } from '@/components/ui/matrix-text'

const LINE  = "1px solid #2A2E2A"
const MONO  = "'Geist Mono', monospace"
const GREEN = "#7AF279"
const TEXT  = "#E8F4EE"
const MUTED = "#7A8C79"

const STEPS = [
  {
    image: "/ednpoint.jpg",
    title: "ADD YOUR ENDPOINT",
    desc: "PASTE ANY API URL. METERA WRAPS IT WITH X402 PAYMENT MIDDLEWARE IN SECONDS.",
  },
  {
    image: "/set.jpg",
    title: "SET YOUR PRICE",
    desc: "DEFINE PER-CALL PRICING IN USDC. SET DAILY CAPS, PER-CALL LIMITS, OR MONTHLY BUDGETS.",
  },
  {
    image: "/get paid.jpg",
    title: "GET PAID",
    desc: "USDC LANDS IN YOUR SOLANA WALLET AUTOMATICALLY. NO INVOICES, NO BANKS, NO WAITING.",
  },
]

function StepCard({ step }: { step: typeof STEPS[0] }) {
  return (
    <div style={{
      border: LINE,
      position: 'relative',
      overflow: 'hidden',
      aspectRatio: '1080 / 1350',
    }}>
      {/* image fills entire card */}
      <img
        src={step.image}
        alt={step.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />

      {/* text overlay at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        padding: '32px 24px 24px',
        background: 'transparent',
      }}>
        <div style={{
          fontFamily: MONO,
          fontSize: 14,
          fontWeight: 500,
          color: TEXT,
          marginBottom: 6,
        }}>
          {step.title}
        </div>
        <div style={{
          fontFamily: MONO,
          fontSize: 12,
          color: 'rgba(232,244,238,0.75)',
          lineHeight: 1.7,
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
          <MatrixText text="FROM API TO INCOME" /><br />
          <span style={{ color: GREEN }}><MatrixText text="IN THREE STEPS." /></span>
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

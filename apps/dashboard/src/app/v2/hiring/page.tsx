'use client'
import { useState } from 'react'
import '../../../styles/v2/tokens.css'
import { V2Navbar } from '../../../components/v2/v2-navbar'
import { V2Footer } from '../../../components/v2/v2-footer'

const LINE   = '1px solid #2A2E2A'
const SANS   = "'Inter', sans-serif"
const MONO   = "'JetBrains Mono', monospace"
const TEXT   = '#E8F4EE'
const MUTED  = '#7A8C79'
const DIM    = '#4A5549'
const GREEN  = '#7AF279'
const PURPLE = '#BC86FF'

interface Role {
  title: string
  type: string
  location: string
  accent: string
  tag: string
  description: string
  responsibilities: string[]
  requirements: string[]
  nice: string[]
}

const ROLES: Role[] = [
  {
    title: 'Developer Relations Engineer',
    type: 'Full-time',
    location: 'Remote',
    accent: GREEN,
    tag: 'devrel',
    description: 'Be the bridge between Metera and the developer community. You\'ll own our developer experience end-to-end — from docs and tutorials to community engagement and feedback loops that shape the product.',
    responsibilities: [
      'Write technical content: guides, tutorials, blog posts, and code samples',
      'Build and maintain example integrations across multiple frameworks',
      'Engage with developers on GitHub, Discord, and X',
      'Speak at conferences and run developer workshops',
      'Collect developer feedback and translate it into product insights',
      'Maintain and improve our docs site',
    ],
    requirements: [
      '3+ years of software development experience (Node.js, Python, or equivalent)',
      'Strong technical writing ability — you can explain complex systems clearly',
      'Experience with blockchain or payments infrastructure (a plus)',
      'Genuine interest in AI agents and autonomous systems',
      'Comfortable on camera and in front of an audience',
    ],
    nice: [
      'Experience with Solana or the x402 protocol',
      'Prior developer relations or DevEx role',
      'Active presence in developer communities',
    ],
  },
  {
    title: 'Backend Engineer — Rust',
    type: 'Full-time',
    location: 'Remote',
    accent: PURPLE,
    tag: 'rust',
    description: 'Build the core payment processing engine that powers Metera. You\'ll work on the critical path: x402 payment verification, Solana transaction validation, metering, and the low-latency API gateway that serves AI agents at scale.',
    responsibilities: [
      'Build and maintain high-performance Rust services for payment processing',
      'Implement and optimize x402 protocol verification logic',
      'Develop Solana transaction parsing and validation pipelines',
      'Design metering and rate-limiting systems for API monetization',
      'Own reliability: observability, alerting, and incident response',
      'Contribute to SDK internals and open source components',
    ],
    requirements: [
      '3+ years of systems programming experience, with Rust experience required',
      'Deep understanding of async Rust (tokio, axum, or equivalent)',
      'Experience building low-latency networked services',
      'Solid understanding of cryptography fundamentals',
      'Familiarity with blockchain data structures and transaction lifecycle',
    ],
    nice: [
      'Solana program development experience (Anchor or native)',
      'Experience with payment processing or fintech infrastructure',
      'Contributions to open source Rust projects',
    ],
  },
]

function RoleCard({ role }: { role: Role }) {
  const [open, setOpen] = useState(false)
  const [hov, setHov] = useState(false)

  return (
    <div
      style={{
        border: `1px solid ${hov || open ? `${role.accent}40` : '#2A2E2A'}`,
        borderRadius: 10,
        overflow: 'hidden',
        transition: 'border-color 250ms ease',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* header row */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', background: 'none', border: 'none',
          padding: '28px 32px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 10, fontFamily: MONO, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: role.accent,
              border: `1px solid ${role.accent}44`, borderRadius: 4,
              padding: '2px 8px',
            }}>
              {role.tag}
            </span>
            <span style={{ fontSize: 12, fontFamily: MONO, color: DIM }}>
              {role.type} · {role.location}
            </span>
          </div>
          <h3 style={{
            fontSize: 20, fontWeight: 300, letterSpacing: '-0.03em',
            color: TEXT, margin: 0, fontFamily: SANS,
          }}>
            {role.title}
          </h3>
        </div>

        {/* chevron */}
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          style={{
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 250ms ease',
          }}
        >
          <path d="M3 6l5 5 5-5" />
        </svg>
      </button>

      {/* expanded body */}
      {open && (
        <div style={{ padding: '0 32px 32px', display: 'flex', flexDirection: 'column', gap: 28, borderTop: LINE }}>

          <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, fontWeight: 300, fontFamily: SANS, margin: '24px 0 0' }}>
            {role.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

            <div>
              <span style={{ fontSize: 10, fontFamily: MONO, letterSpacing: '0.1em', textTransform: 'uppercase', color: DIM, display: 'block', marginBottom: 16 }}>
                Responsibilities
              </span>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {role.responsibilities.map((r, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: role.accent, fontFamily: MONO, fontSize: 12, marginTop: 2, flexShrink: 0 }}>—</span>
                    <span style={{ fontSize: 13, color: MUTED, fontFamily: SANS, lineHeight: 1.6, fontWeight: 300 }}>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <span style={{ fontSize: 10, fontFamily: MONO, letterSpacing: '0.1em', textTransform: 'uppercase', color: DIM, display: 'block', marginBottom: 16 }}>
                  Requirements
                </span>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {role.requirements.map((r, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: role.accent, fontFamily: MONO, fontSize: 12, marginTop: 2, flexShrink: 0 }}>—</span>
                      <span style={{ fontSize: 13, color: MUTED, fontFamily: SANS, lineHeight: 1.6, fontWeight: 300 }}>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span style={{ fontSize: 10, fontFamily: MONO, letterSpacing: '0.1em', textTransform: 'uppercase', color: DIM, display: 'block', marginBottom: 16 }}>
                  Nice to have
                </span>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {role.nice.map((r, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: DIM, fontFamily: MONO, fontSize: 12, marginTop: 2, flexShrink: 0 }}>—</span>
                      <span style={{ fontSize: 13, color: DIM, fontFamily: SANS, lineHeight: 1.6, fontWeight: 300 }}>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* apply button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 8 }}>
            <a
              href={`mailto:hiring@metera.xyz?subject=Application: ${role.title}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: role.accent, color: '#1B1E1B',
                border: 'none', borderRadius: 6,
                padding: '10px 22px', fontSize: 13,
                fontFamily: SANS, fontWeight: 500,
                textDecoration: 'none',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Apply for this role
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6h8M6 2l4 4-4 4" />
              </svg>
            </a>
            <span style={{ fontSize: 12, color: DIM, fontFamily: MONO }}>hiring@metera.xyz</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function HiringPage() {
  return (
    <div style={{ background: '#1B1E1B', minHeight: '100vh', fontFamily: SANS, color: TEXT }}>
      <V2Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', borderLeft: LINE, borderRight: LINE }}>

        {/* header */}
        <div style={{ padding: '80px 64px 56px', borderBottom: LINE }}>
          <span style={{
            fontSize: 10, fontFamily: MONO, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: GREEN,
            display: 'block', marginBottom: 20,
          }}>
            careers
          </span>
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 300,
            letterSpacing: '-0.04em', color: '#FFFFFF',
            margin: '0 0 20px', lineHeight: 1.05, fontFamily: SANS,
          }}>
            Join Metera.
          </h1>
          <p style={{ fontSize: 15, color: MUTED, margin: '0 0 40px', fontWeight: 300, maxWidth: 480 }}>
            We're building the payment layer for autonomous AI. Small team,
            hard problems, real impact. Remote-first.
          </p>

          {/* stats row */}
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            {[
              { label: 'Open roles', value: `${ROLES.length}` },
              { label: 'Team size', value: 'Small' },
              { label: 'Location', value: 'Remote' },
              { label: 'Stage', value: 'Early' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 300, color: TEXT, fontFamily: SANS, letterSpacing: '-0.03em' }}>{value}</span>
                <span style={{ fontSize: 12, fontFamily: MONO, color: DIM, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* open roles */}
        <div style={{ padding: '56px 64px 80px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span style={{
            fontSize: 10, fontFamily: MONO, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: DIM, marginBottom: 8,
          }}>
            Open positions
          </span>
          {ROLES.map(role => (
            <RoleCard key={role.title} role={role} />
          ))}

          {/* no match */}
          <div style={{
            marginTop: 24,
            padding: '32px',
            border: LINE,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
          }}>
            <div>
              <p style={{ fontSize: 15, color: TEXT, fontWeight: 300, fontFamily: SANS, margin: '0 0 6px' }}>
                Don't see a role that fits?
              </p>
              <p style={{ fontSize: 13, color: MUTED, fontFamily: SANS, fontWeight: 300, margin: 0 }}>
                We're always open to strong engineers and builders. Send us your background.
              </p>
            </div>
            <a
              href="mailto:hiring@metera.xyz?subject=General Application"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'transparent', color: TEXT,
                border: LINE, borderRadius: 6,
                padding: '10px 22px', fontSize: 13,
                fontFamily: SANS, fontWeight: 400,
                textDecoration: 'none', flexShrink: 0,
                transition: 'border-color 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#4A5549'
                e.currentTarget.style.color = GREEN
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#2A2E2A'
                e.currentTarget.style.color = TEXT
              }}
            >
              Get in touch
            </a>
          </div>
        </div>

        <V2Footer />
      </div>
    </div>
  )
}

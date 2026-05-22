'use client'

import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { Component as FlickeringFooter } from '@/components/ui/flickering-footer'
import { LandingNavbar } from '@/components/ui/landing-navbar'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-space',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})

const CSS = `
  :root {
    --bg: #000;
    --border: #1a1a1a;
    --text: #ffffff;
    --muted: #666666;
    --dim: #333333;
    --green: #00bc7d;
    --purple: #9945FF;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #101010;
    color: #fff;
    -webkit-font-smoothing: antialiased;
  }

  a { color: inherit; text-decoration: none; }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes gradientShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes pulseSlow {
    0%, 100% { opacity: 0.4; }
    50%       { opacity: 1; }
  }

  .gradient-text {
    background: linear-gradient(135deg, #00bc7d, #9945FF, #00bc7d, #9945FF);
    background-size: 300% 300%;
    animation: gradientShift 3s ease infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .live-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #00bc7d;
    display: inline-block;
    animation: pulseSlow 2s ease-in-out infinite;
    flex-shrink: 0;
  }

  html, body { overflow-x: hidden; }

  @media (max-width: 768px) {
    .nav-links { display: none !important; }
    .hero-title { font-size: 40px !important; }
    .values-grid { grid-template-columns: 1fr !important; }
    .mission-grid { grid-template-columns: 1fr !important; }
    .timeline-dot-col { display: none !important; }
    .timeline-right { padding-left: 0 !important; }
    .timeline-left { display: none !important; }
  }
`

const FONT = 'var(--font-space, sans-serif)'
const MONO = 'var(--font-mono, monospace)'

// Icons
function IconZap() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  )
}
function IconKey() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3L22 7l-3-3"/>
    </svg>
  )
}
function IconEye() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  )
}
function IconCpu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/>
    </svg>
  )
}

const VALUES = [
  { icon: <IconZap />, n: '01', title: 'Instant monetization', desc: 'Ship a paid API in minutes — no Stripe account, no bank transfers, no KYC. x402 handles everything at the protocol level.' },
  { icon: <IconKey />, n: '02', title: 'Permissionless by design', desc: 'Any wallet, any agent. No sign-up required on the consumer side. If you have SOL, you can call any endpoint on Gate402.' },
  { icon: <IconEye />, n: '03', title: 'Radical transparency', desc: 'Every payment is on-chain. Every call is logged. Developers get full visibility into who is using their APIs and when.' },
  { icon: <IconCpu />, n: '04', title: 'Built for the agentic web', desc: 'AI agents need to pay for resources autonomously. Gate402 speaks the x402 protocol — the machine-native payment layer.' },
]

const TIMELINE = [
  { period: '2024', label: 'Idea', desc: 'Frustrated by Stripe\'s 7-day payouts and KYC walls while building a data API side-project.' },
  { period: 'Q1 2025', label: 'Protocol', desc: 'Discovered the x402 HTTP payment extension. Prototyped the first payment-gated endpoint in a weekend.' },
  { period: 'Q2 2025', label: 'Alpha', desc: 'First external developers testing Gate402. Processed first real USDC payment from an autonomous AI agent.' },
  { period: 'Now', label: 'Beta', desc: 'Opening access to developers building the next generation of paid APIs and AI-native services.' },
]

export default function AboutPage() {
  return (
    <div
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      style={{ fontFamily: FONT, background: '#101010', minHeight: '100vh' }}
    >
      <style>{CSS}</style>
      <LandingNavbar />

      {/* ── HERO ── */}
      <section style={{ paddingTop: 160, paddingBottom: 120, padding: '160px clamp(20px, 5vw, 120px) 120px', textAlign: 'center', borderBottom: '1px solid #1a1a1a' }}>
        <h1
          className="hero-title"
          style={{
            fontFamily: FONT, fontWeight: 600,
            fontSize: 'clamp(40px, 6vw, 72px)',
            lineHeight: 1.1, letterSpacing: '-0.03em', color: '#fff',
            marginBottom: 24,
          }}
        >
          The payment layer<br />
          <span style={{ color: '#00bc7d' }}>the internet forgot to build</span>
        </h1>

        <p style={{
          fontFamily: FONT, fontSize: 18, color: '#666',
          maxWidth: 520, margin: '0 auto',
          lineHeight: 1.7,
        }}>
          Gate402 is a developer platform that lets you monetize any API endpoint
          with per-call crypto payments — no Stripe, no invoices, no friction.
        </p>
      </section>

      {/* ── MISSION ── */}
      <section style={{ background: '#111111', padding: '120px clamp(20px, 5vw, 120px)', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: '#333', letterSpacing: '0.1em', marginBottom: 48 }}>
            OUR MISSION
          </div>

          <div className="mission-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
            <h2 style={{ fontFamily: FONT, fontWeight: 300, fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.2, letterSpacing: '-0.02em', color: '#fff' }}>
              Make APIs as easy to sell as they are to build.
            </h2>
            <div>
              <p style={{ fontFamily: FONT, color: '#666', lineHeight: 1.8, marginBottom: 20 }}>
                Developers spend months building APIs and days setting up payment infrastructure.
                Stripe KYC, bank delays, monthly invoices — none of that matches the speed of code.
              </p>
              <p style={{ fontFamily: FONT, color: '#666', lineHeight: 1.8 }}>
                We built Gate402 so that returning{' '}
                <code style={{ fontFamily: MONO, color: '#00bc7d', fontSize: 13 }}>402 Payment Required</code>{' '}
                from any endpoint is all it takes to charge for your work — instantly, globally, trustlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section style={{ background: '#101010', padding: '120px clamp(20px, 5vw, 120px)', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: '#333', letterSpacing: '0.1em', marginBottom: 16 }}>
            WHAT WE BELIEVE
          </div>
          <h2 style={{ fontFamily: FONT, fontWeight: 300, fontSize: 40, letterSpacing: '-0.03em', color: '#fff', marginBottom: 48 }}>
            Four principles.
          </h2>

          <div className="values-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 0,
            background: '#1a1a1a',
            border: '1px solid #1a1a1a',
            borderRadius: 6,
            overflow: 'hidden',
          }}>
            {VALUES.map(({ icon, n, title, desc }, idx) => (
              <div key={n} style={{
                background: '#101010',
                padding: '40px 36px',
                borderRight: idx % 2 === 0 ? '1px solid #1a1a1a' : 'none',
                borderBottom: idx < 2 ? '1px solid #1a1a1a' : 'none',
                transition: 'background 200ms ease',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = '#111111')}
                onMouseLeave={e => (e.currentTarget.style.background = '#000')}
              >
                <div style={{ fontFamily: MONO, fontSize: 11, color: '#222', letterSpacing: '0.1em', marginBottom: 20 }}>{n}</div>
                <div style={{ color: '#00bc7d', marginBottom: 16 }}>{icon}</div>
                <h3 style={{ fontFamily: FONT, fontWeight: 400, fontSize: 20, color: '#fff', marginBottom: 12 }}>{title}</h3>
                <p style={{ fontFamily: FONT, fontSize: 14, color: '#666', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STORY ── */}
      <section style={{ background: '#111111', padding: '120px clamp(20px, 5vw, 120px)', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: '#333', letterSpacing: '0.1em', marginBottom: 16 }}>
            THE STORY
          </div>
          <h2 style={{ fontFamily: FONT, fontWeight: 300, fontSize: 40, letterSpacing: '-0.03em', color: '#fff', marginBottom: 64 }}>
            How we got here.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid #1a1a1a', borderRadius: 6, overflow: 'hidden' }}>
            {TIMELINE.map(({ period, label, desc }, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr',
                borderBottom: i < TIMELINE.length - 1 ? '1px solid #1a1a1a' : 'none',
                background: '#101010',
                transition: 'background 200ms ease',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = '#0a0a0a')}
                onMouseLeave={e => (e.currentTarget.style.background = '#000')}
              >
                <div style={{
                  padding: '32px 28px',
                  borderRight: '1px solid #1a1a1a',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                }}>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: '#333', letterSpacing: '0.08em', marginBottom: 6 }}>{period}</div>
                  <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 15, color: period === 'Now' ? '#00bc7d' : '#fff' }}>{label}</div>
                </div>
                <div style={{ padding: '32px 36px', display: 'flex', alignItems: 'center' }}>
                  <p style={{ fontFamily: FONT, fontSize: 15, color: '#666', lineHeight: 1.65 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROTOCOL ── */}
      <section style={{ background: '#101010', padding: '120px clamp(20px, 5vw, 120px)', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: '#333', letterSpacing: '0.1em', marginBottom: 16 }}>
            BUILT ON OPEN STANDARDS
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 0, background: '#1a1a1a', border: '1px solid #1a1a1a',
            borderRadius: 6, overflow: 'hidden',
          }}>
            <div style={{ background: '#101010', padding: '48px 40px', borderRight: '1px solid #1a1a1a' }}>
              <h2 style={{ fontFamily: FONT, fontWeight: 300, fontSize: 36, letterSpacing: '-0.02em', color: '#fff', marginBottom: 16 }}>
                x402 — the machine-native payment protocol
              </h2>
              <p style={{ fontFamily: FONT, color: '#666', lineHeight: 1.7, marginBottom: 28 }}>
                Gate402 implements the x402 open protocol — an HTTP extension that adds
                machine-readable payment metadata to 402 responses. Any AI agent or developer tool
                that speaks x402 can pay your endpoints automatically.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href="/docs" style={{
                  fontSize: 13, fontWeight: 500, color: '#000',
                  background: '#00bc7d', padding: '10px 20px', borderRadius: 6,
                  fontFamily: FONT,
                }}>Read the docs →</a>
                <a href="https://github.com/joaopco8/gate402_" target="_blank" rel="noopener noreferrer" style={{
                  fontSize: 13, color: '#666',
                  border: '1px solid #1a1a1a', padding: '10px 20px', borderRadius: 6,
                  fontFamily: FONT, transition: 'color 150ms, border-color 150ms',
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#333' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = '#1a1a1a' }}
                >View on GitHub</a>
              </div>
            </div>

            <div style={{ background: '#101010', padding: '48px 40px' }}>
              <div style={{
                background: '#111111', border: '1px solid #1a1a1a',
                borderRadius: 6, padding: '20px 20px',
                fontFamily: MONO, fontSize: 12, color: '#666', lineHeight: 2,
              }}>
                <div><span style={{ color: '#333' }}>{'// response from any gate402 endpoint'}</span></div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ color: '#666' }}>HTTP/1.1 </span>
                  <span style={{ color: '#f59e0b' }}>402 Payment Required</span>
                </div>
                <div><span style={{ color: '#666' }}>X-Payment-Required: </span><span style={{ color: '#00bc7d' }}>x402</span></div>
                <div><span style={{ color: '#666' }}>X-Payment-Amount: </span><span style={{ color: '#fff' }}>0.001</span></div>
                <div><span style={{ color: '#666' }}>X-Payment-Asset: </span><span style={{ color: '#9945FF' }}>USDC/Solana</span></div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ color: '#666' }}>X-Payment-Recipient: </span><span style={{ color: '#fff' }}>7UQc...939D</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: '#111111', padding: '120px clamp(20px, 5vw, 120px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontFamily: FONT, fontWeight: 300, fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-0.02em', color: '#fff', marginBottom: 16 }}>
            Ready to charge for your API?
          </h2>
          <p style={{ fontFamily: FONT, color: '#666', marginBottom: 32, fontSize: 16 }}>
            Join developers already earning USDC per call.
          </p>
          <a href="/auth/login" style={{
            fontFamily: FONT, fontSize: 15, fontWeight: 500,
            color: '#000', background: '#00bc7d', padding: '14px 32px', borderRadius: 6,
            display: 'inline-block',
          }}>Get started free →</a>
        </div>
      </section>

      <FlickeringFooter />
    </div>
  )
}

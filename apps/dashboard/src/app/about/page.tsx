'use client'

import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { Component as FlickeringFooter } from '@/components/ui/flickering-footer'

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
    --bg:           #0F0F0F;
    --surface:      #0a0a0a;
    --card:         #0d0d0d;
    --border:       #1a1a1a;
    --border-hover: #2a2a2a;
    --text:         #ffffff;
    --text-muted:   #666666;
    --text-dim:     #333333;
    --green:        #00bc7d;
    --purple:       #9945FF;
  }

  *, *::before, *::after { box-sizing: border-box; }

  body {
    background: var(--bg);
    color: var(--text);
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

  @keyframes blurReveal {
    from { opacity: 0; filter: blur(18px); transform: translateY(16px); }
    to   { opacity: 1; filter: blur(0px);  transform: translateY(0); }
  }

  @keyframes pulseSlow {
    0%, 100% { opacity: 0.35; }
    50%       { opacity: 1; }
  }

  .gradient-animated {
    background: linear-gradient(135deg, #00bc7d, #9945FF, #00bc7d, #9945FF);
    background-size: 300% 300%;
    animation: gradientShift 3s ease infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .fade-in-up { animation: fadeInUp 0.6s ease-out both; }
  .blur-reveal { animation: blurReveal 0.8s ease-out both; }

  .g-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    transition: border-color 0.2s;
  }
  .g-card:hover { border-color: var(--border-hover); }

  .badge {
    display: inline-flex; align-items: center; gap: 8px;
    border: 1px solid var(--border); border-radius: 100px;
    padding: 5px 14px; font-size: 11px; color: var(--text-muted);
    font-family: var(--font-mono, monospace); letter-spacing: 0.04em;
    background: var(--card);
  }

  .live-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--green);
    animation: pulseSlow 2s ease-in-out infinite;
  }

  html, body { overflow-x: hidden; }

  @media (max-width: 768px) {
    .nav-links { display: none !important; }
    .about-hero-title { font-size: 40px !important; }
    .values-grid { grid-template-columns: 1fr !important; }
    .team-grid { grid-template-columns: 1fr !important; }
    .timeline-line { display: none !important; }
  }
`

function Nav() {
  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 100,
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 clamp(20px, 10vw, 250px)',
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #1a1a1a',
    }}>
      <a href="/">
        <img src="/logo-gate.png" alt="Gate402" style={{ height: 22, width: 'auto', display: 'block' }} />
      </a>

      <div className="nav-links" style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 32,
        alignItems: 'center',
      }}>
        {[
          { label: 'How it works', href: '/#how-it-works' },
          { label: 'Docs',         href: '/docs' },
          { label: 'Pricing',      href: '/pricing' },
          { label: 'GitHub',       href: 'https://github.com/joaopco8/gate402_', target: '_blank' },
        ].map(({ label, href, target }) => (
          <a
            key={label}
            href={href}
            target={target}
            rel={target === '_blank' ? 'noopener noreferrer' : undefined}
            style={{ fontSize: 14, color: '#666', fontFamily: 'var(--font-space)', transition: 'color 150ms' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#666')}
          >{label}</a>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <a href="/auth/login" style={{ fontSize: 14, color: '#666', fontFamily: 'var(--font-space)' }}>Sign in</a>
        <a href="/auth/login" style={{
          fontSize: 14, fontFamily: 'var(--font-space)', fontWeight: 500,
          color: '#000', background: '#00bc7d', padding: '8px 18px', borderRadius: 6,
        }}>Start free →</a>
      </div>
    </nav>
  )
}

const VALUES = [
  {
    icon: '⚡',
    title: 'Instant monetization',
    desc: 'Ship a paid API in minutes — no Stripe account, no bank transfers, no KYC. x402 handles everything at the protocol level.',
  },
  {
    icon: '🔑',
    title: 'Permissionless by design',
    desc: 'Any wallet, any agent. No sign-up required on the consumer side. If you have SOL, you can call any endpoint on Gate402.',
  },
  {
    icon: '🔍',
    title: 'Radical transparency',
    desc: 'Every payment is on-chain. Every call is logged. Developers get full visibility into who is using their APIs and when.',
  },
  {
    icon: '🤖',
    title: 'Built for the agentic web',
    desc: 'AI agents need to pay for resources autonomously. Gate402 speaks the x402 protocol — the machine-native payment layer.',
  },
]

const TIMELINE = [
  { year: '2024', label: 'Idea', desc: 'Frustrated by Stripe\'s 7-day payouts and KYC walls while building a data API side-project.' },
  { year: 'Q1 2025', label: 'Protocol', desc: 'Discovered the x402 HTTP payment extension. Prototyped the first payment-gated endpoint in a weekend.' },
  { year: 'Q2 2025', label: 'Alpha', desc: 'First external developers testing Gate402. Processed first real USDC payment from an autonomous AI agent.' },
  { year: 'Now', label: 'Beta', desc: 'Opening access to developers building the next generation of paid APIs and AI-native services.' },
]

export default function AboutPage() {
  return (
    <div
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      style={{ fontFamily: 'var(--font-space, sans-serif)', background: '#0F0F0F', minHeight: '100vh' }}
    >
      <style>{CSS}</style>
      <Nav />

      {/* ── HERO ── */}
      <section style={{
        paddingTop: 160,
        paddingBottom: 100,
        padding: '160px clamp(20px, 10vw, 250px) 100px',
        textAlign: 'center',
      }}>
        <div className="badge fade-in-up" style={{ marginBottom: 28, animationDelay: '0ms' }}>
          <span className="live-dot" />
          About Gate402
        </div>

        <h1
          className="about-hero-title fade-in-up"
          style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 300,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: 24,
            animationDelay: '80ms',
          }}
        >
          The payment layer<br />
          <span className="gradient-animated">the internet forgot to build</span>
        </h1>

        <p className="fade-in-up" style={{
          fontSize: 18,
          color: '#666',
          maxWidth: 560,
          margin: '0 auto',
          lineHeight: 1.7,
          animationDelay: '160ms',
        }}>
          Gate402 is a developer platform that lets you monetize any API endpoint
          with per-call crypto payments — no Stripe, no invoices, no friction.
        </p>
      </section>

      {/* ── MISSION ── */}
      <section style={{ padding: '0 clamp(20px, 10vw, 250px) 100px' }}>
        <div style={{
          background: '#0d0d0d',
          border: '1px solid #1a1a1a',
          borderRadius: 12,
          padding: 'clamp(40px, 6vw, 80px)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 60,
          alignItems: 'center',
        }}>
          <div>
            <p style={{ fontSize: 11, color: '#444', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
              Our mission
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 300, lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 0 }}>
              Make APIs as easy to sell as they are to build.
            </h2>
          </div>
          <div>
            <p style={{ color: '#666', lineHeight: 1.8, marginBottom: 20 }}>
              Developers spend months building APIs and days setting up payment infrastructure.
              Stripe KYC, bank delays, monthly invoices — none of that matches the speed of code.
            </p>
            <p style={{ color: '#666', lineHeight: 1.8 }}>
              We built Gate402 so that adding{' '}
              <code style={{ fontFamily: 'var(--font-mono)', color: '#00bc7d', fontSize: 13 }}>Payment-Required</code>{' '}
              to any HTTP response is all it takes to charge for your work — instantly, globally, trustlessly.
            </p>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section style={{ padding: '0 clamp(20px, 10vw, 250px) 100px' }}>
        <p style={{ fontSize: 11, color: '#444', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 48, textAlign: 'center' }}>
          What we believe
        </p>

        <div className="values-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, border: '1px solid #1a1a1a', borderRadius: 12, overflow: 'hidden' }}>
          {VALUES.map((v, i) => (
            <div key={i} className="g-card" style={{
              padding: '40px 36px',
              borderRadius: 0,
              border: 'none',
              borderRight: i % 2 === 0 ? '1px solid #1a1a1a' : 'none',
              borderBottom: i < 2 ? '1px solid #1a1a1a' : 'none',
            }}>
              <div style={{ fontSize: 28, marginBottom: 16 }}>{v.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 500, marginBottom: 12, letterSpacing: '-0.01em' }}>{v.title}</h3>
              <p style={{ color: '#666', lineHeight: 1.7, fontSize: 14 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section style={{ padding: '0 clamp(20px, 10vw, 250px) 100px' }}>
        <p style={{ fontSize: 11, color: '#444', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 48, textAlign: 'center' }}>
          The story
        </p>

        <div style={{ position: 'relative' }}>
          {/* vertical line */}
          <div className="timeline-line" style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 1,
            background: '#1a1a1a',
            transform: 'translateX(-50%)',
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {TIMELINE.map((item, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 80px 1fr',
                alignItems: 'center',
                marginBottom: 48,
              }}>
                {/* left content (even items) */}
                <div style={{ textAlign: 'right', paddingRight: 40, ...(i % 2 !== 0 ? { opacity: 0 } : {}) }}>
                  {i % 2 === 0 && (
                    <>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#444', letterSpacing: '0.08em', marginBottom: 8 }}>{item.year}</p>
                      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{item.label}</h3>
                      <p style={{ color: '#666', fontSize: 14, lineHeight: 1.6 }}>{item.desc}</p>
                    </>
                  )}
                </div>

                {/* center dot */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: item.year === 'Now' ? '#00bc7d' : '#1a1a1a',
                    border: `2px solid ${item.year === 'Now' ? '#00bc7d' : '#2a2a2a'}`,
                    zIndex: 1,
                  }} />
                </div>

                {/* right content (odd items) */}
                <div style={{ paddingLeft: 40, ...(i % 2 === 0 ? { opacity: 0 } : {}) }}>
                  {i % 2 !== 0 && (
                    <>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#444', letterSpacing: '0.08em', marginBottom: 8 }}>{item.year}</p>
                      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{item.label}</h3>
                      <p style={{ color: '#666', fontSize: 14, lineHeight: 1.6 }}>{item.desc}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BUILT ON ── */}
      <section style={{ padding: '0 clamp(20px, 10vw, 250px) 100px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,188,125,0.05), rgba(153,69,255,0.05))',
          border: '1px solid #1a1a1a',
          borderRadius: 12,
          padding: 'clamp(40px, 6vw, 60px)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 11, color: '#444', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24 }}>
            Built on open standards
          </p>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: 16 }}>
            x402 — HTTP for the money-native web
          </h2>
          <p style={{ color: '#666', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.7, fontSize: 15 }}>
            Gate402 implements the x402 payment extension — an open protocol that adds
            machine-readable payment metadata to HTTP 402 responses. Any AI agent or
            developer tool that speaks x402 can pay your endpoints automatically.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/docs" style={{
              fontSize: 14, fontWeight: 500, color: '#000',
              background: '#00bc7d', padding: '10px 22px', borderRadius: 6,
            }}>Read the docs →</a>
            <a
              href="https://github.com/joaopco8/gate402_"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 14, color: '#666',
                border: '1px solid #1a1a1a', padding: '10px 22px', borderRadius: 6,
                transition: 'color 150ms, border-color 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#333' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = '#1a1a1a' }}
            >View on GitHub</a>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: '0 clamp(20px, 10vw, 250px) 120px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: 16 }}>
          Ready to charge for your API?
        </h2>
        <p style={{ color: '#666', marginBottom: 32, fontSize: 16 }}>Join developers already earning USDC per call.</p>
        <a href="/auth/login" style={{
          fontSize: 15, fontWeight: 500, color: '#000',
          background: '#00bc7d', padding: '14px 28px', borderRadius: 6, display: 'inline-block',
        }}>Get started free →</a>
      </section>

      <FlickeringFooter />
    </div>
  )
}

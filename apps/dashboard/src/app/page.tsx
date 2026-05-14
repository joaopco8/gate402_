'use client'

import { useEffect, useState, useRef } from 'react'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { createClient } from '../../lib/supabase/client'

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

/* ─── DESIGN SYSTEM CSS ──────────────────────────────────────────────────── */

const CSS = `
  :root {
    --bg:           #000000;
    --surface:      #0a0a0a;
    --card:         #0d0d0d;
    --border:       #1a1a1a;
    --border-hover: #2a2a2a;
    --text:         #ffffff;
    --text-muted:   #666666;
    --text-dim:     #333333;
    --green:        #00ff88;
    --purple:       #9945FF;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

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

  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to   { opacity: 0; }
  }

  @keyframes pulseSlow {
    0%, 100% { opacity: 0.35; }
    50%       { opacity: 1; }
  }

  @keyframes gradientShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes orbePulse {
    0%, 100% { transform: translateX(-50%) scale(1); opacity: 1; }
    50% { transform: translateX(-50%) scale(1.1); opacity: 0.7; }
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  @keyframes scrollTicker {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }

  @keyframes countUp {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes lineGrow {
    from { width: 0; }
    to { width: 100%; }
  }

  @keyframes cardReveal {
    from { opacity: 0; transform: translateY(32px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes borderPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(0,255,136,0); }
    50% { box-shadow: 0 0 20px 2px rgba(0,255,136,0.15); }
  }

  @keyframes gridMove {
    from { background-position: 0 0; }
    to { background-position: 60px 60px; }
  }

  @keyframes scrollLine {
    0%   { transform: scaleY(0); transform-origin: top; opacity: 1; }
    50%  { transform: scaleY(1); transform-origin: top; opacity: 1; }
    100% { transform: scaleY(1); transform-origin: top; opacity: 0; }
  }

  .gradient-animated {
    background: linear-gradient(135deg, #00ff88, #9945FF, #00ff88, #9945FF);
    background-size: 300% 300%;
    animation: gradientShift 3s ease infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @keyframes pulseGreen {
    0%, 100% { opacity: 0.4; box-shadow: 0 0 0 0 rgba(0,255,136,0.3); }
    50%       { opacity: 1; box-shadow: 0 0 0 4px rgba(0,255,136,0); }
  }

  .fade-in-up   { animation: fadeInUp 0.6s ease-out both; }
  .fade-in-down { animation: fadeInDown 0.4s ease-out both; }

  .live-dot-purple { animation: pulseSlow 2s ease-in-out infinite; }
  .live-dot-green  { animation: pulseGreen 2s ease-in-out infinite; }

  .g-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    transition: border-color 0.2s;
  }
  .g-card:hover { border-color: var(--border-hover); }

  .btn-primary {
    display: inline-flex; align-items: center; justify-content: center;
    background: var(--green); color: #000; font-weight: 500;
    padding: 12px 24px; border-radius: 6px; border: none;
    cursor: pointer; font-size: 14px; transition: opacity 0.15s;
    font-family: inherit;
  }
  .btn-primary:hover { opacity: 0.85; }

  .btn-ghost {
    display: inline-flex; align-items: center; justify-content: center;
    background: transparent; color: var(--text-muted);
    padding: 12px 24px; border-radius: 6px; border: 1px solid var(--border);
    cursor: pointer; font-size: 14px; transition: border-color 0.15s, color 0.15s;
    font-family: inherit;
  }
  .btn-ghost:hover { border-color: #333; color: var(--text); }

  .badge {
    display: inline-flex; align-items: center; gap: 8px;
    border: 1px solid var(--border); border-radius: 100px;
    padding: 5px 14px; font-size: 11px; color: var(--text-muted);
    font-family: var(--font-mono, monospace); letter-spacing: 0.04em;
    background: var(--card);
  }

  .mono { font-family: var(--font-mono, monospace) !important; }

  .nav-link {
    font-size: 14px; color: #666; transition: color 0.15s; cursor: pointer;
  }
  .nav-link:hover { color: #fff; }

  html { overflow-x: hidden; }
  body { overflow-x: hidden; }

  @media (max-width: 768px) {
    .nav-links { display: none !important; }
    .hero-headline { font-size: 44px !important; }
    .hero-ctas { flex-direction: column !important; width: 100% !important; }
    .hero-ctas a { width: 100% !important; box-sizing: border-box !important; }
    .how-connector { display: none !important; }
    .features-grid { grid-template-columns: 1fr !important; }
    .code-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
    .pricing-grid { grid-template-columns: 1fr !important; max-width: 100% !important; }
    .feed-wallet { display: none !important; }
    .feed-arrow { display: none !important; }
    .footer-inner { flex-direction: column !important; gap: 20px !important; }
    .footer-links { flex-wrap: wrap !important; gap: 16px !important; }
    .final-cta-headline { font-size: 36px !important; }
    .npm-snippet { flex-direction: column !important; gap: 12px !important; width: 100% !important; box-sizing: border-box !important; }
    .agent-flow-grid { grid-template-columns: 1fr !important; }
    .how-cards { grid-template-columns: 1fr !important; }
    .how-cards > div { border-right: none !important; border-bottom: 1px solid #1a1a1a !important; }
    .how-cards > div:last-child { border-bottom: none !important; }
    .how-agents-grid { grid-template-columns: 1fr !important; }
    .two-wallets-grid { grid-template-columns: 1fr !important; }
    .provider-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
    .provider-sticky { position: static !important; }
    .provider-title { font-size: 36px !important; }
    .timeline-grid-7 { grid-template-columns: repeat(2, 1fr) !important; }
    .provider-steps-grid { grid-template-columns: 1fr !important; }
    .stats-bar-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .hood-grid { grid-template-columns: 1fr !important; }
    .hood-card-8 { flex-direction: column !important; align-items: flex-start !important; }
  }
`

/* ─── NAV ────────────────────────────────────────────────────────────────── */

/* SECTION: Nav */
function Nav() {
  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
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
      {/* Logo — esquerda */}
      <a href="/">
        <img src="/logo-gate.png" alt="Gate402" style={{ height: 22, width: 'auto', display: 'block' }} />
      </a>

      {/* Links — centro absoluto */}
      <div className="nav-links" style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 32,
        alignItems: 'center',
      }}>
        {[
          { label: 'How it works', onClick: () => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }) },
          { label: 'Docs',         href: '/docs' },
          { label: 'Pricing',      onClick: () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }) },
          { label: 'GitHub',       href: 'https://github.com/joaopco8/gate402_', target: '_blank' },
        ].map(({ label, href, target, onClick }) => (
          <a
            key={label}
            href={href ?? '#'}
            target={target}
            rel={target === '_blank' ? 'noopener noreferrer' : undefined}
            onClick={onClick ? (e) => { e.preventDefault(); onClick() } : undefined}
            style={{ fontSize: 14, color: '#666', fontFamily: 'var(--font-space)', transition: 'color 150ms', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = '#666'}
          >
            {label}
          </a>
        ))}
      </div>

      {/* CTAs — direita */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <a href="/login" style={{ fontSize: 14, color: '#666', fontFamily: 'var(--font-space)' }}>Sign in</a>
        <a href="/login" style={{
          fontSize: 14,
          fontFamily: 'var(--font-space)',
          fontWeight: 500,
          color: '#000',
          background: '#00ff88',
          padding: '8px 18px',
          borderRadius: 6,
        }}>Start free →</a>
      </div>
    </nav>
  )
}

/* ─── HERO ───────────────────────────────────────────────────────────────── */

/* SECTION: Hero */
function useCounter(target: number, duration: number) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

function Hero() {
  const count = useCounter(24187, 2000)
  const [liveCount, setLiveCount] = useState(24187)

  useEffect(() => {
    const t = setInterval(() => setLiveCount(n => n + 1), 3000)
    return () => clearInterval(t)
  }, [])

  const displayed = count < 24187 ? count : liveCount

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '120px 24px 80px',
      textAlign: 'center',
      background: '#000',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Dot grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, #1a1a1a 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.6,
        zIndex: 0,
      }} />

      {/* Green orbe */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)',
        zIndex: 0,
        animation: 'orbePulse 4s ease-in-out infinite',
      }} />

      {/* Purple orbe */}
      <div style={{
        position: 'absolute',
        top: '30%',
        right: '-10%',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(153,69,255,0.08) 0%, transparent 70%)',
        zIndex: 0,
        animation: 'orbePulse 6s ease-in-out infinite reverse',
      }} />

      {/* Badge */}
      <div className="badge fade-in-up" style={{ marginBottom: 40, position: 'relative', zIndex: 1 }}>
        <span className="live-dot-purple" style={{ width: 6, height: 6, borderRadius: '50%', background: '#9945FF', display: 'inline-block', flexShrink: 0 }} />
        Built on x402 Protocol · Solana
      </div>

      {/* Headline */}
      <div style={{ marginBottom: 28, position: 'relative', zIndex: 1 }}>
        {[
          { text: 'Your API.', delay: '0.2s', gradient: false },
          { text: 'Paid per call.', delay: '0.4s', gradient: false },
          { text: 'By AI agents.', delay: '0.6s', gradient: true },
        ].map(({ text, delay, gradient }) => (
          <div
            key={text}
            className={`fade-in-up hero-headline${gradient ? ' gradient-animated' : ''}`}
            style={{
              fontFamily: 'var(--font-space, sans-serif)',
              fontWeight: 300,
              fontSize: 88,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              animationDelay: delay,
              ...(gradient ? {} : { color: '#fff' }),
            }}
          >
            {text}
          </div>
        ))}
      </div>

      {/* Subheadline */}
      <p className="fade-in-up" style={{
        fontFamily: 'var(--font-space, sans-serif)',
        fontWeight: 400,
        fontSize: 18,
        color: '#666',
        maxWidth: 480,
        lineHeight: 1.65,
        marginBottom: 40,
        animationDelay: '0.8s',
        position: 'relative',
        zIndex: 1,
      }}>
        Gate402 puts a paywall on any API endpoint. Agents pay in USDC.
        Settlement in 400ms. You keep everything.
      </p>

      {/* CTAs */}
      <div className="fade-in-up hero-ctas" style={{ display: 'flex', gap: 12, marginBottom: 28, animationDelay: '1.0s', position: 'relative', zIndex: 1 }}>
        <a href="/login" className="btn-primary" style={{ fontSize: 15, padding: '13px 28px' }}>Start free →</a>
        <a href="#how" className="btn-ghost" style={{ fontSize: 15, padding: '13px 28px' }}>View live demo</a>
      </div>

      {/* Social proof */}
      <div className="fade-in-up mono" style={{ fontSize: 12, color: '#333', letterSpacing: '0.04em', marginBottom: 56, animationDelay: '1.2s', position: 'relative', zIndex: 1 }}>
        npm install gate402&nbsp;&nbsp;·&nbsp;&nbsp;v0.1.0&nbsp;&nbsp;·&nbsp;&nbsp;MIT&nbsp;&nbsp;·&nbsp;&nbsp;Open source
      </div>

      {/* Live counter */}
      <div className="fade-in-up" style={{ animationDelay: '1.4s', position: 'relative', zIndex: 1 }}>
        <div className="mono" style={{ fontSize: 11, color: '#333', letterSpacing: '0.1em', marginBottom: 12 }}>
          API CALLS PROCESSED
        </div>
        <div style={{
          fontFamily: 'var(--font-space, sans-serif)',
          fontWeight: 300,
          fontSize: 48,
          color: '#fff',
          letterSpacing: '-0.02em',
        }}>
          {displayed.toLocaleString()}
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        zIndex: 1,
      }}>
        <div className="mono" style={{ fontSize: 11, color: '#333', letterSpacing: '0.1em' }}>SCROLL</div>
        <div style={{
          width: 1,
          height: 40,
          background: 'linear-gradient(to bottom, #333, transparent)',
          animation: 'scrollLine 2s ease-in-out infinite',
        }} />
      </div>
    </section>
  )
}

/* ─── LIVE FEED ──────────────────────────────────────────────────────────── */

/* SECTION: LiveFeed */
const DEMO_CALLS = [
  { endpoint: '/api/weather', wallet: '7UQc...939D', amount: '0.001' },
  { endpoint: '/api/news',    wallet: 'BwL2...88nX', amount: '0.002' },
  { endpoint: '/api/data',    wallet: 'Dq7v...zZ3A', amount: '0.005' },
  { endpoint: '/api/search',  wallet: '9mLZ...4kWE', amount: '0.003' },
  { endpoint: '/api/premium', wallet: '3pRt...7vNQ', amount: '0.050' },
]

type FeedItem = { id: number; endpoint: string; wallet: string; amount: string }

function LiveFeed() {
  const idRef = useRef(100)
  const [feedItems, setFeedItems] = useState<FeedItem[]>(
    DEMO_CALLS.slice(0, 4).map((d, i) => ({ ...d, id: i }))
  )
  const [counter, setCounter] = useState(24371)
  const [latestId, setLatestId] = useState(-1)

  useEffect(() => {
    const interval = setInterval(() => {
      const newCall = DEMO_CALLS[Math.floor(Math.random() * DEMO_CALLS.length)]
      const id = idRef.current++
      setFeedItems(prev => [{ ...newCall, id }, ...prev].slice(0, 6))
      setLatestId(id)
      setCounter(prev => prev + 1)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  const stats = [
    { value: counter.toLocaleString(), label: 'Total calls' },
    { value: '$24.19', label: 'Total USDC' },
    { value: '412ms', label: 'Avg settlement' },
  ]

  return (
    <section style={{ background: '#000', padding: '80px 32px', borderTop: '1px solid #1a1a1a' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 400, fontSize: 16, color: '#fff' }}>
            Live payments
          </span>
          <span className="badge mono" style={{ color: '#00ff88', borderColor: '#00ff8830', background: '#00ff8808', fontSize: 10 }}>
            DEVNET
          </span>
        </div>

        {/* feed */}
        <div style={{ border: '1px solid #1a1a1a', borderRadius: 8, overflow: 'hidden', marginBottom: 40 }}>
          {feedItems.map((item, i) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: 48,
                padding: '0 20px',
                borderBottom: i < feedItems.length - 1 ? '1px solid #1a1a1a' : 'none',
                background: item.id === latestId ? '#0a0a0a' : '#000',
                transition: 'background 0.4s',
                animation: item.id === latestId ? 'fadeInDown 0.4s ease-out' : undefined,
              }}
            >
              <span className="mono" style={{ fontSize: 12, color: '#00ff88', minWidth: 140 }}>{item.endpoint}</span>
              <span className="mono feed-wallet" style={{ fontSize: 12, color: '#333' }}>{item.wallet}</span>
              <span className="feed-arrow" style={{ fontSize: 12, color: '#333', margin: '0 8px' }}>→</span>
              <span className="mono" style={{ fontSize: 12, color: '#fff', flex: 1, textAlign: 'center' }}>{item.amount} USDC</span>
              <span className="badge" style={{
                fontSize: 10,
                color: item.id === latestId ? '#00ff88' : '#333',
                borderColor: item.id === latestId ? '#00ff8830' : '#1a1a1a',
                background: item.id === latestId ? '#00ff8808' : 'transparent',
                padding: '3px 10px',
              }}>
                {item.id === latestId ? 'confirmed ✓' : `${Math.min(i * 5, 59)}s ago`}
              </span>
            </div>
          ))}
        </div>

        {/* stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
          {stats.map(({ value, label }, i) => (
            <div key={label} style={{
              textAlign: 'center',
              padding: '24px 0',
              borderRight: i < 2 ? '1px solid #1a1a1a' : 'none',
            }}>
              <div style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 300, fontSize: 32, color: '#fff', letterSpacing: '-0.02em', marginBottom: 6, transition: 'all 0.3s' }}>
                {value}
              </div>
              <div className="mono" style={{ fontSize: 11, color: '#333', letterSpacing: '0.08em' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── HOW IT WORKS ───────────────────────────────────────────────────────── */

/* SECTION: HowItWorks */
const HOW_STEPS = [
  {
    n: '01',
    title: 'Install',
    desc: 'npm install gate402. Wrap your Express app. 3 lines of code. Done.',
    snippet: 'app.use(gate402({ ... }))',
    snippetColor: '#00ff88',
  },
  {
    n: '02',
    title: 'Price',
    desc: 'Set USDC price per endpoint. Any amount. Change anytime. No approval needed.',
    snippet: "'/api/data': 0.005",
    snippetColor: '#f59e0b',
  },
  {
    n: '03',
    title: 'Collect',
    desc: 'Agents pay in USDC on Solana. 400ms confirmation. Funds go directly to your wallet.',
    snippet: '✓ 0.001 USDC · 412ms',
    snippetColor: '#00ff88',
  },
]

function HowItWorks() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section id="how-it-works" style={{ background: '#000', padding: '120px 32px', borderTop: '1px solid #1a1a1a' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        <div className="mono" style={{ fontSize: 11, color: '#333', letterSpacing: '0.1em', marginBottom: 16 }}>
          HOW IT WORKS
        </div>

        <h2 style={{
          fontFamily: 'var(--font-space, sans-serif)',
          fontWeight: 300,
          fontSize: 40,
          letterSpacing: '-0.03em',
          color: '#fff',
          marginBottom: 48,
        }}>
          Drop in. Price it. Get paid.
        </h2>

        {/* Card grid container */}
        <div className="how-cards" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 0,
          background: '#1a1a1a',
          border: '1px solid #1a1a1a',
          borderRadius: 8,
          overflow: 'hidden',
        }}>
          {HOW_STEPS.map(({ n, title, desc, snippet, snippetColor }, idx) => (
            <div
              key={n}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered === idx ? '#0a0a0a' : '#000',
                padding: '40px 32px',
                borderRight: idx < HOW_STEPS.length - 1 ? '1px solid #1a1a1a' : 'none',
                borderBottom: 'none',
                transition: 'background 200ms ease',
              }}
            >
              <div className="mono" style={{ fontSize: 11, color: '#222', letterSpacing: '0.1em', marginBottom: 24 }}>
                {n}
              </div>

              <h3 style={{
                fontFamily: 'var(--font-space, sans-serif)',
                fontWeight: 400,
                fontSize: 22,
                color: '#fff',
                marginBottom: 12,
              }}>
                {title}
              </h3>

              <p style={{
                fontFamily: 'var(--font-space, sans-serif)',
                fontSize: 14,
                color: '#666',
                lineHeight: 1.6,
                marginBottom: 0,
              }}>
                {desc}
              </p>

              <div className="mono" style={{
                background: '#0a0a0a',
                border: '1px solid #1a1a1a',
                borderRadius: 4,
                padding: '14px 16px',
                marginTop: 24,
                fontSize: 13,
                color: snippetColor,
              }}>
                {snippet}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

/* ─── AGENT FLOW ─────────────────────────────────────────────────────────── */

/* SECTION: AgentFlow */
const FLOW_LINES = [
  { from: 'Agent', to: 'Gate402', dir: 'right', color: '#9945FF', msg: 'GET /api/weather' },
  { from: 'Gate402', to: 'Agent', dir: 'left',  color: '#EF4444', msg: 'HTTP 402 · 0.001 USDC · 7UQc...939D' },
  { from: 'Agent', to: 'Solana', dir: 'right',  color: '#9945FF', msg: 'send 0.001 USDC' },
  { from: 'Solana', to: 'Agent', dir: 'left',   color: '#14F195', msg: 'confirmed · tx_5kWq...9mLP · 412ms' },
  { from: 'Agent', to: 'Gate402', dir: 'right', color: '#9945FF', msg: 'GET /api/weather · X-Payment: tx_5kWq...' },
  { from: 'Gate402', to: 'Agent', dir: 'left',  color: '#00ff88', msg: '200 OK · { city: São Paulo, temp: 28°C }' },
]

const AGENT_CODE_TOKENS = [
  { text: '// Install x402-fetch',                           color: '#333' },
  { text: 'npm install x402-fetch @solana/web3.js',          color: '#ccc' },
  { text: '',                                                 color: '' },
  { text: '// Agent setup',                                  color: '#333' },
  { text: 'import',                                          color: '#9945FF', inline: true },
  { text: ' { ',                                             color: '#ccc',    inline: true },
  { text: 'wrapFetch',                                       color: '#3b82f6', inline: true },
  { text: ' } ',                                             color: '#ccc',    inline: true },
  { text: 'from',                                            color: '#9945FF', inline: true },
  { text: " 'x402-fetch'",                                   color: '#00ff88', inline: true, newline: true },
  { text: 'import',                                          color: '#9945FF', inline: true },
  { text: ' { ',                                             color: '#ccc',    inline: true },
  { text: 'Keypair',                                         color: '#3b82f6', inline: true },
  { text: ' } ',                                             color: '#ccc',    inline: true },
  { text: 'from',                                            color: '#9945FF', inline: true },
  { text: " '@solana/web3.js'",                              color: '#00ff88', inline: true, newline: true },
  { text: '',                                                 color: '' },
  { text: 'const',                                           color: '#9945FF', inline: true },
  { text: ' agentWallet = ',                                 color: '#ccc',    inline: true },
  { text: 'Keypair',                                         color: '#3b82f6', inline: true },
  { text: '.',                                               color: '#ccc',    inline: true },
  { text: 'generate',                                        color: '#3b82f6', inline: true },
  { text: '()',                                              color: '#ccc',    inline: true, newline: true },
  { text: '',                                                 color: '' },
  { text: 'const',                                           color: '#9945FF', inline: true },
  { text: ' fetch = ',                                       color: '#ccc',    inline: true },
  { text: 'wrapFetch',                                       color: '#3b82f6', inline: true },
  { text: '({',                                              color: '#ccc',    inline: true, newline: true },
  { text: '  wallet: agentWallet,',                          color: '#ccc',    inline: true, newline: true },
  { text: "  network: ",                                     color: '#ccc',    inline: true },
  { text: "'mainnet'",                                       color: '#00ff88', inline: true, newline: true },
  { text: '})',                                              color: '#ccc',    inline: true, newline: true },
  { text: '',                                                 color: '' },
  { text: '// This pays automatically',                      color: '#333' },
  { text: '// No human required',                            color: '#333' },
  { text: 'const',                                           color: '#9945FF', inline: true },
  { text: ' data = ',                                        color: '#ccc',    inline: true },
  { text: 'await',                                           color: '#9945FF', inline: true },
  { text: ' ',                                               color: '#ccc',    inline: true },
  { text: 'fetch',                                           color: '#3b82f6', inline: true },
  { text: '(',                                               color: '#ccc',    inline: true, newline: true },
  { text: "  'https://api.gate402.dev/weather'",             color: '#00ff88', inline: true, newline: true },
  { text: ')',                                               color: '#ccc',    inline: true, newline: true },
  { text: '',                                                 color: '' },
  { text: "// data = { city: 'São Paulo', temp: '28°C' }",   color: '#333' },
  { text: '// Wallet balance: -0.001 USDC',                  color: '#333' },
]

function AgentFlow() {
  const [visibleLines, setVisibleLines] = useState(0)
  const [observed, setObserved] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setObserved(true) },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!observed) return
    let current = 0
    const timers: ReturnType<typeof setTimeout>[] = []
    for (let i = 0; i < FLOW_LINES.length; i++) {
      const t = setTimeout(() => {
        current += 1
        setVisibleLines(current)
      }, 400 * (i + 1))
      timers.push(t)
    }
    return () => timers.forEach(clearTimeout)
  }, [observed])

  // Build code lines for display (group inline tokens into rows)
  const codeRows: { segments: { text: string; color: string }[] }[] = []
  let currentRow: { text: string; color: string }[] = []
  for (const token of AGENT_CODE_TOKENS) {
    if (!token.inline) {
      if (currentRow.length) { codeRows.push({ segments: currentRow }); currentRow = [] }
      codeRows.push({ segments: [{ text: token.text, color: token.color || '#ccc' }] })
    } else {
      currentRow.push({ text: token.text, color: token.color })
      if (token.newline) { codeRows.push({ segments: currentRow }); currentRow = [] }
    }
  }
  if (currentRow.length) codeRows.push({ segments: currentRow })

  return (
    <section style={{ background: '#000', padding: '120px 0', borderTop: '1px solid #1a1a1a' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>

        {/* Eyebrow */}
        <div className="mono" style={{ fontSize: 11, color: '#333', letterSpacing: '0.1em', marginBottom: 20 }}>
          AGENT PAYMENT FLOW
        </div>

        {/* Title */}
        <h2 style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 300, fontSize: 48, letterSpacing: '-0.03em', color: '#fff', marginBottom: 16 }}>
          Agents pay themselves.
        </h2>

        {/* Subtitle */}
        <p style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 16, color: '#666', maxWidth: 520, lineHeight: 1.7, marginBottom: 56 }}>
          No human in the loop. No credit card. No approval.<br />
          The agent receives HTTP 402, pays in USDC, and gets access.<br />
          All in under a second.
        </p>

        {/* Two panels */}
        <div ref={ref} style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24, marginBottom: 48 }} className="agent-flow-grid">

          {/* LEFT — Sequence diagram */}
          <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 8, padding: 32, fontFamily: 'var(--font-mono, monospace)' }}>

            {/* Actors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginBottom: 0 }}>
              {[
                { icon: '◈', label: 'AI Agent',  color: '#9945FF' },
                { icon: '⬡', label: 'Gate402',   color: '#00ff88' },
                { icon: '◎', label: 'Solana',    color: '#14F195' },
              ].map(({ icon, label, color }) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, paddingBottom: 16 }}>
                  <span style={{ fontSize: 18, color }}>{icon}</span>
                  <span style={{ fontSize: 11, color: '#666', letterSpacing: '0.06em' }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Horizontal divider connecting actors */}
            <div style={{ borderTop: '1px solid #1a1a1a', marginBottom: 24 }} />

            {/* Flow lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {FLOW_LINES.map((line, idx) => {
                if (idx >= visibleLines) return null
                const isRight = line.dir === 'right'
                // Column positions: Agent=col0, Gate402=col1, Solana=col2
                // right: Agent→Gate402, Agent→Solana
                // left:  Gate402→Agent, Solana→Agent
                const fromLabel = line.from
                const toLabel   = line.to
                return (
                  <div
                    key={idx}
                    style={{
                      animation: 'fadeInUp 0.3s ease-out both',
                      marginBottom: 20,
                    }}
                  >
                    {/* Arrow row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: '#555', textAlign: 'center' }}>{isRight ? fromLabel : toLabel}</span>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ position: 'absolute', left: 0, right: 0, borderTop: '1px dashed #1a1a1a' }} />
                        <span style={{ position: 'relative', fontSize: 14, color: line.color, background: '#0a0a0a', padding: '0 4px' }}>
                          {isRight ? '→' : '←'}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: '#555', textAlign: 'center' }}>{isRight ? toLabel : fromLabel}</span>
                    </div>
                    {/* Message */}
                    <div style={{ textAlign: 'center', fontSize: 11, color: line.color, letterSpacing: '0.02em', opacity: 0.9 }}>
                      {line.msg}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT — Code snippet */}
          <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 8, padding: 24 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 5 }}>
                {['#ff5f57','#febc2e','#28c840'].map(c => (
                  <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
                ))}
              </div>
              <span className="mono" style={{ fontSize: 11, color: '#333', marginLeft: 4 }}>agent.ts</span>
            </div>

            {/* Code */}
            <pre style={{ margin: 0, fontFamily: 'var(--font-mono, monospace)', fontSize: 11, lineHeight: 1.85, overflowX: 'auto' }}>
              {codeRows.map((row, i) => (
                <div key={i} style={{ minHeight: '1.85em' }}>
                  {row.segments.map((seg, j) => (
                    <span key={j} style={{ color: seg.color }}>{seg.text}</span>
                  ))}
                </div>
              ))}
            </pre>
          </div>
        </div>

        {/* Footer badge */}
        <div className="mono" style={{ fontSize: 11, color: '#333', textAlign: 'center', letterSpacing: '0.06em' }}>
          Compatible with Claude · GPT-4 · Gemini · Any HTTP client
        </div>

      </div>
    </section>
  )
}

/* ─── FEATURES ───────────────────────────────────────────────────────────── */

/* SECTION: Features */

function Features() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const cardDelays = ['0.1s', '0.25s', '0.4s']

  function handle3DMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    e.currentTarget.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`
    e.currentTarget.style.borderTopColor = '#00ff88'
  }

  function handle3DLeave(e: React.MouseEvent<HTMLDivElement>) {
    e.currentTarget.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg)'
    e.currentTarget.style.borderTopColor = 'transparent'
  }

  const FEATURE_CARDS = [
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L21.39 7.5V16.5L12 22L2.61 16.5V7.5L12 2Z" stroke="#9945FF" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
      title: 'x402 native',
      desc: 'The HTTP payment standard backed by Google, Stripe, and Microsoft. Not a workaround. The spec.',
      badge: <span className="badge" style={{ color: '#9945FF', borderColor: '#9945ff30', background: '#9945ff08', alignSelf: 'flex-start' }}>RFC Draft</span>,
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M13 2L4.09 12.96H11L10.09 22L19 11.04H12.09L13 2Z" stroke="#00ff88" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/></svg>,
      title: 'Solana settlement',
      desc: '400ms finality. $0.001 fees. No banks. No chargebacks. No KYC. No weekends.',
      badge: <span className="mono" style={{ fontSize: 12, color: '#00ff88' }}>400ms · $0.001</span>,
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="1" stroke="#fff" strokeWidth="1.5"/><rect x="13" y="3" width="8" height="8" rx="1" stroke="#fff" strokeWidth="1.5"/><rect x="3" y="13" width="8" height="8" rx="1" stroke="#fff" strokeWidth="1.5"/><rect x="13" y="13" width="8" height="8" rx="1" stroke="#fff" strokeWidth="1.5"/></svg>,
      title: 'Real-time dashboard',
      desc: 'Every call, every payment, every wallet. Live analytics. Export CSV. Yours forever.',
      badge: <span className="badge" style={{ color: '#00ff88', borderColor: '#00ff8830', background: '#00ff8808', alignSelf: 'flex-start' }}><span className="live-dot-green" style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', display: 'inline-block' }} /> Live</span>,
    },
  ]

  return (
    <section id="features" style={{ background: '#000', padding: '120px 0', borderTop: '1px solid #1a1a1a' }}>
      <div ref={ref} style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
        <div className="mono" style={{ fontSize: 11, color: '#333', letterSpacing: '0.1em', marginBottom: 20 }}>
          INFRASTRUCTURE
        </div>
        <h2 style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 300, fontSize: 48, letterSpacing: '-0.03em', color: '#fff', marginBottom: 16 }}>
          Infrastructure that disappears.
        </h2>
        <p style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 18, color: '#666', marginBottom: 72 }}>
          Everything you need. Nothing you don&apos;t.
        </p>

        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {FEATURE_CARDS.map((card, idx) => (
            <div
              key={card.title}
              className="g-card"
              onMouseMove={handle3DMove}
              onMouseLeave={handle3DLeave}
              style={{
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                cursor: 'default',
                borderTop: '1px solid transparent',
                transition: 'transform 150ms ease, border-color 200ms ease',
                opacity: visible ? undefined : 0,
                animation: visible ? `cardReveal 0.6s ease-out ${cardDelays[idx]} both` : undefined,
              }}
            >
              {card.icon}
              <div style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 400, fontSize: 18, color: '#fff' }}>{card.title}</div>
              <p style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 14, color: '#666', lineHeight: 1.7, flex: 1 }}>{card.desc}</p>
              {card.badge}
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}

/* ─── CODE SECTION ───────────────────────────────────────────────────────── */

/* SECTION: CodeSection */
const CODE_LINES = [
  { text: "// Before — free forever",              color: '#333' },
  { text: "app.get('/api/data', handler)",          color: '#ccc' },
  { text: "",                                       color: '' },
  { text: "// After — $0.005 per call",             color: '#333' },
  { text: "import { gate402 } from 'gate402'",      color: '#ccc' },
  { text: "",                                       color: '' },
  { text: "app.use(gate402({",                      color: '#ccc' },
  { text: "  apiKey: 'gk_live_...',",               color: '#00ff88' },
  { text: "  endpoints: {",                         color: '#ccc' },
  { text: "    '/api/data': 0.005,",                color: '#00ff88' },
  { text: "    '/api/premium': 0.050,",             color: '#00ff88' },
  { text: "  }",                                    color: '#ccc' },
  { text: "}))",                                    color: '#ccc' },
  { text: "",                                       color: '' },
  { text: "// ✓ 0.005 USDC confirmed — 412ms",     color: '#333' },
]

const BENEFITS = [
  'Works with any Express API',
  'TypeScript native',
  'Zero config Solana wallet',
  'Automatic payment verification',
  'Real-time dashboard included',
]

function CodeSection() {
  const [visibleLines, setVisibleLines] = useState(0)
  const [codeVisible, setCodeVisible] = useState(false)
  const codeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCodeVisible(true) },
      { threshold: 0.3 }
    )
    if (codeRef.current) observer.observe(codeRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!codeVisible) return
    const interval = setInterval(() => {
      setVisibleLines(prev => {
        if (prev >= CODE_LINES.length) { clearInterval(interval); return prev }
        return prev + 1
      })
    }, 120)
    return () => clearInterval(interval)
  }, [codeVisible])

  return (
    <section style={{ background: '#000', padding: '120px 32px', borderTop: '1px solid #1a1a1a' }}>
      <div className="code-grid" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>

        {/* Left */}
        <div>
          <div className="mono" style={{ fontSize: 11, color: '#333', letterSpacing: '0.1em', marginBottom: 20 }}>ONE MIDDLEWARE</div>
          <h2 style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 300, fontSize: 40, letterSpacing: '-0.03em', color: '#fff', marginBottom: 16 }}>
            Any API.<br />Monetized.
          </h2>
          <p style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 15, color: '#666', lineHeight: 1.7, marginBottom: 32 }}>
            Before Gate402, your API was free. After Gate402, every call generates revenue.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
            {BENEFITS.map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#00ff88', fontSize: 13 }}>✓</span>
                <span style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 14, color: '#888' }}>{b}</span>
              </div>
            ))}
          </div>
          <a href="/login" className="btn-primary">npm install gate402 →</a>
        </div>

        {/* Right: code block */}
        <div ref={codeRef} style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 8, overflow: 'hidden' }}>
          {/* dots header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #1a1a1a' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#ff5f57', '#febc2e', '#28c840'].map(c => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
              ))}
            </div>
            <span className="mono" style={{ fontSize: 11, color: '#333' }}>gate402 · Express</span>
          </div>
          {/* code with typing effect */}
          <pre style={{ margin: 0, padding: '20px', fontFamily: 'var(--font-mono, monospace)', fontSize: 13, lineHeight: 1.75, overflowX: 'auto', minHeight: 280 }}>
            {CODE_LINES.slice(0, visibleLines).map((line, i) => (
              <div key={i} style={{ color: line.color || 'transparent', minHeight: '1.75em' }}>
                {line.text}
                {i === visibleLines - 1 && (
                  <span style={{ animation: 'blink 1s infinite', marginLeft: 2, color: '#00ff88' }}>|</span>
                )}
              </div>
            ))}
          </pre>
        </div>

      </div>
    </section>
  )
}

/* ─── PRICING ────────────────────────────────────────────────────────────── */

/* SECTION: Pricing */

/* ─── PROVIDER + AGENT SIDES + TIMELINE ─────────────────────────────────── */

type Seg = { text: string; color: string }
type CodeLine = Seg[]

function CodeBlock({ lang, lines }: { lang: string; lines: CodeLine[] }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    const text = lines.map(l => l.map(s => s.text).join('')).join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 6, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid #1a1a1a' }}>
        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: '#333', letterSpacing: '0.06em' }}>{lang}</span>
        <button
          onClick={copy}
          style={{ background: copied ? '#00ff8815' : 'transparent', border: `1px solid ${copied ? '#00ff8840' : '#222'}`, color: copied ? '#00ff88' : '#444', borderRadius: 4, padding: '3px 10px', fontFamily: 'var(--font-mono, monospace)', fontSize: 11, cursor: 'pointer', transition: 'all 0.15s' }}
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '16px 20px', fontFamily: 'var(--font-mono, monospace)', fontSize: 13, lineHeight: 1.7, overflowX: 'auto' }}>
        {lines.map((line, i) => (
          <div key={i} style={{ minHeight: '1.7em' }}>
            {line.map((seg, j) => (
              <span key={j} style={{ color: seg.color }}>{seg.text}</span>
            ))}
          </div>
        ))}
      </pre>
    </div>
  )
}

function StatsBar() {
  const stats = [
    { value: '< 1s', label: 'SETTLEMENT' },
    { value: '0%', label: 'CUSTODY' },
    { value: '$0.001', label: 'MINIMUM' },
    { value: 'x402', label: 'STANDARD' },
  ]
  return (
    <div style={{ borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', padding: '20px 0' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ textAlign: 'center', borderRight: i < 3 ? '1px solid #1a1a1a' : 'none', padding: '8px 0' }}>
            <div style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 600, fontSize: 22, color: '#fff' }}>{s.value}</div>
            <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: '#444', letterSpacing: '0.08em', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProviderSide() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const steps = [
    {
      n: '01', title: 'Install',
      content: (
        <div style={{ background: '#000', border: '1px solid #1a1a1a', borderRadius: 4, padding: '10px 14px', fontFamily: 'var(--font-mono, monospace)', fontSize: 13, color: '#00ff88' }}>
          npm install gate402
        </div>
      ),
    },
    {
      n: '02', title: 'Add middleware',
      content: (
        <div style={{ background: '#000', border: '1px solid #1a1a1a', borderRadius: 4, padding: '10px 14px', fontFamily: 'var(--font-mono, monospace)', fontSize: 13, lineHeight: 1.7 }}>
          <span style={{ color: '#9945FF' }}>app</span><span style={{ color: '#ccc' }}>.use(gate402({'{'}</span><br />
          <span style={{ color: '#ccc' }}>{'  '}apiKey: </span><span style={{ color: '#00ff88' }}>&apos;key&apos;</span><span style={{ color: '#ccc' }}>, price: </span><span style={{ color: '#f59e0b' }}>0.001</span><br />
          <span style={{ color: '#ccc' }}>{'}))'}</span>
        </div>
      ),
    },
    {
      n: '03', title: 'Set your wallet',
      content: (
        <div>
          <p style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 12 }}>Payments go directly to your Solana wallet.</p>
          <span style={{ display: 'inline-block', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', color: '#00ff88', fontFamily: 'var(--font-mono, monospace)', fontSize: 11, padding: '4px 10px', borderRadius: 4 }}>Non-custodial</span>
        </div>
      ),
    },
    {
      n: '04', title: 'Deploy',
      content: (
        <div>
          <p style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 12 }}>Agents receive HTTP 402 and pay automatically.</p>
          <span style={{ display: 'inline-block', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', color: '#00ff88', fontFamily: 'var(--font-mono, monospace)', fontSize: 11, padding: '4px 10px', borderRadius: 4 }}>✓ Done</span>
        </div>
      ),
    },
  ]

  return (
    <section style={{ background: '#000', padding: '96px 0', borderTop: '1px solid #1a1a1a' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: '#444', letterSpacing: '0.12em', marginBottom: 16 }}>FOR API DEVELOPERS</div>
          <h2 style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 300, fontSize: 40, color: '#fff', lineHeight: 1.1, marginBottom: 12 }}>Three lines. Agents pay you.</h2>
          <p style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 16, color: '#888', maxWidth: 480 }}>Drop-in Express middleware. No custody. No intermediary.</p>
        </div>
        <div className="provider-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {steps.map((step, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: hoveredCard === i ? '#0f0f0f' : '#0a0a0a',
                border: `1px solid ${hoveredCard === i ? '#2a2a2a' : '#1a1a1a'}`,
                borderRadius: 8,
                padding: 28,
                transition: 'background 150ms, border-color 150ms',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: '#444', marginBottom: 16 }}>{step.n}</div>
              <div style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 500, fontSize: 15, color: '#fff', marginBottom: 12 }}>{step.title}</div>
              {step.content}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AgentSide() {
  return (
    <section style={{ background: '#0a0a0a', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', padding: '80px 0' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ maxWidth: 720, marginBottom: 48 }}>
          <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: '#444', letterSpacing: '0.12em', marginBottom: 16 }}>FOR AGENT OPERATORS</div>
          <h2 style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 300, fontSize: 40, color: '#fff', lineHeight: 1.1, marginBottom: 12 }}>Any HTTP client. Pays itself.</h2>
          <p style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 16, color: '#888' }}>Fund your agent wallet with USDC. The agent handles the rest.</p>
        </div>

        <div className="code-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
          <div style={{ background: '#000', border: '1px solid #1a1a1a', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: '#444' }}>with x402-fetch</span>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, color: '#00ff88' }}>RECOMMENDED</span>
            </div>
            <div style={{ padding: '16px 20px', fontFamily: 'var(--font-mono, monospace)', fontSize: 13, lineHeight: 1.7 }}>
              <div><span style={{ color: '#9945FF' }}>import</span><span style={{ color: '#ccc' }}> {'{ wrapFetch }'} </span><span style={{ color: '#9945FF' }}>from</span><span style={{ color: '#00ff88' }}> &apos;x402-fetch&apos;</span></div>
              <div style={{ height: 8 }} />
              <div><span style={{ color: '#9945FF' }}>const</span><span style={{ color: '#ccc' }}> fetch = </span><span style={{ color: '#3b82f6' }}>wrapFetch</span><span style={{ color: '#ccc' }}>{'({ wallet: agentWallet })'}</span></div>
              <div><span style={{ color: '#9945FF' }}>const</span><span style={{ color: '#ccc' }}> data = </span><span style={{ color: '#9945FF' }}>await</span><span style={{ color: '#ccc' }}> fetch(</span><span style={{ color: '#00ff88' }}>&apos;https://api.dev/data&apos;</span><span style={{ color: '#ccc' }}>)</span></div>
              <div style={{ height: 4 }} />
              <div><span style={{ color: '#444' }}>{'// Pays automatically on HTTP 402'}</span></div>
            </div>
          </div>

          <div style={{ background: '#000', border: '1px solid #1a1a1a', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: '#444' }}>with any HTTP client</span>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, color: '#444' }}>MANUAL</span>
            </div>
            <div style={{ padding: '16px 20px', fontFamily: 'var(--font-mono, monospace)', fontSize: 13, lineHeight: 1.7 }}>
              <div><span style={{ color: '#9945FF' }}>const</span><span style={{ color: '#ccc' }}> res = </span><span style={{ color: '#9945FF' }}>await</span><span style={{ color: '#ccc' }}> fetch(url)</span></div>
              <div><span style={{ color: '#444' }}>{'// → HTTP 402: pay 0.001 USDC to 7UQct...'}</span></div>
              <div style={{ height: 8 }} />
              <div><span style={{ color: '#9945FF' }}>const</span><span style={{ color: '#ccc' }}> txHash = </span><span style={{ color: '#9945FF' }}>await</span><span style={{ color: '#ccc' }}> sendUsdc(res.payTo, res.price)</span></div>
              <div><span style={{ color: '#9945FF' }}>const</span><span style={{ color: '#ccc' }}> data = </span><span style={{ color: '#9945FF' }}>await</span><span style={{ color: '#ccc' }}>{" fetch(url, {"}</span></div>
              <div><span style={{ color: '#ccc' }}>{"  headers: { 'X-Payment-Payload': txHash }"}</span></div>
              <div><span style={{ color: '#ccc' }}>{"}"}</span><span style={{ color: '#ccc' }}>)</span></div>
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(153,69,255,0.05)', borderLeft: '2px solid #9945FF', padding: '16px 20px', borderRadius: '0 8px 8px 0' }}>
          <p style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 14, color: '#888', lineHeight: 1.6, margin: 0 }}>
            Anthropic, OpenAI, and Google haven&apos;t shipped native agent wallets yet. Gate402 is the infrastructure layer ready when they do.
          </p>
        </div>
      </div>
    </section>
  )
}

const HOOD_CARDS = [
  {
    n: '01', span: 1,
    title: 'Request arrives',
    desc: 'Your agent makes an HTTP request to the protected endpoint. Any method, any payload.',
    detail: 'GET /api/data HTTP/1.1',
    dot: null,
  },
  {
    n: '02', span: 1,
    title: 'Middleware intercepts',
    desc: 'gate402 catches the request before it reaches your handler. Zero changes to your business logic.',
    detail: 'app.use(gate402({ ... }))',
    dot: null,
  },
  {
    n: '03', span: 1,
    title: 'HTTP 402 returned',
    desc: 'The standard Payment Required response. Includes price, currency, and your wallet address.',
    detail: '402 Payment Required',
    dot: null,
  },
  {
    n: '04', span: 1,
    title: 'Agent pays on Solana',
    desc: 'USDC is sent directly to your wallet. Gate402 never holds your funds. Non-custodial by design.',
    detail: '→ 0.001 USDC · 7UQct...939D',
    dot: null,
  },
  {
    n: '05', span: 1,
    title: 'Transaction confirmed',
    desc: 'Solana confirms the transaction in under 400ms. The agent receives the transaction hash.',
    detail: '✓ confirmed · 412ms',
    dot: null,
  },
  {
    n: '06', span: 1,
    title: 'Proof submitted',
    desc: 'The agent retries the request with the transaction hash in the X-Payment-Payload header.',
    detail: 'X-Payment-Payload: 5kWq...',
    dot: 'amber',
  },
  {
    n: '07', span: 1,
    title: 'Verified on-chain',
    desc: 'Gate402 queries Solana to confirm the payment reached the correct wallet with the correct amount. Replay attacks blocked.',
    detail: 'RPC → verified ✓',
    dot: 'amber',
  },
]

function HoodCard({ card }: { card: typeof HOOD_CARDS[number] }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? '#030303' : '#000', padding: 32, position: 'relative', transition: 'background 150ms' }}
    >
      {/* Decorative number */}
      <div style={{
        position: 'absolute', top: 20, right: 24,
        fontFamily: 'var(--font-mono, monospace)', fontSize: 72, fontWeight: 700,
        color: hovered ? '#111' : '#0d0d0d', lineHeight: 1,
        userSelect: 'none', pointerEvents: 'none', transition: 'color 150ms',
      }}>{card.n}</div>

      {/* Step badge + dot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <span style={{
          display: 'inline-block',
          fontFamily: 'var(--font-mono, monospace)', fontSize: 9, color: '#333',
          letterSpacing: '0.12em', background: '#0a0a0a', border: '1px solid #1a1a1a',
          borderRadius: 3, padding: '3px 8px',
        }}>STEP {card.n}</span>
        {card.dot === 'amber' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />}
        {card.dot === 'green' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', display: 'inline-block' }} />}
      </div>

      <div style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 500, fontSize: 17, color: '#fff', marginBottom: 8 }}>{card.title}</div>
      <p style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 13, color: '#555', lineHeight: 1.7, margin: 0 }}>{card.desc}</p>

      {card.detail && (
        <div style={{
          display: 'inline-block', marginTop: 16,
          fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: '#333',
          background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 4, padding: '6px 12px',
        }}>{card.detail}</div>
      )}
    </div>
  )
}

function HowItWorksTimeline() {
  const [hovered8, setHovered8] = useState(false)
  return (
    <section style={{ background: '#000', padding: '120px 0', borderTop: '1px solid #1a1a1a' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: '#333', letterSpacing: '0.15em', marginBottom: 16 }}>UNDER THE HOOD</div>
          <h2 style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 300, fontSize: 52, lineHeight: 1.1, marginBottom: 16 }}>
            <span style={{ color: '#fff' }}>Seven steps.</span>
            <span style={{ color: '#333' }}> Under one second.</span>
          </h2>
          <p style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 16, color: '#555', margin: 0 }}>
            Every payment. Every time. Fully verified on-chain.
          </p>
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: '#111', marginBottom: 48 }} />

        {/* Grid wrapper */}
        <div style={{ background: '#111', borderRadius: 12, overflow: 'hidden' }}>
          {/* 7 cards in 2-column grid */}
          <div className="hood-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            {HOOD_CARDS.map((card) => (
              <HoodCard key={card.n} card={card} />
            ))}

            {/* Card 8 — full width */}
            <div
              className="hood-card-8"
              onMouseEnter={() => setHovered8(true)}
              onMouseLeave={() => setHovered8(false)}
              style={{
                gridColumn: '1 / -1',
                background: hovered8 ? '#030303' : '#000',
                padding: 32, position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32,
                transition: 'background 150ms',
              }}
            >
              {/* Decorative number */}
              <div style={{
                position: 'absolute', top: 20, right: 40,
                fontFamily: 'var(--font-mono, monospace)', fontSize: 96, fontWeight: 700,
                color: hovered8 ? '#111' : '#0d0d0d', lineHeight: 1,
                userSelect: 'none', pointerEvents: 'none', transition: 'color 150ms',
              }}>08</div>

              {/* Left: text */}
              <div style={{ flex: 1, zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <span style={{
                    display: 'inline-block',
                    fontFamily: 'var(--font-mono, monospace)', fontSize: 9, color: '#333',
                    letterSpacing: '0.12em', background: '#0a0a0a', border: '1px solid #1a1a1a',
                    borderRadius: 3, padding: '3px 8px',
                  }}>STEP 08</span>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', display: 'inline-block' }} />
                </div>
                <div style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 500, fontSize: 17, color: '#fff', marginBottom: 8 }}>Access granted</div>
                <p style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 13, color: '#555', lineHeight: 1.7, margin: 0, maxWidth: 480 }}>
                  Your handler executes. The response is returned to the agent. USDC is already in your wallet.
                </p>
              </div>

              {/* Right: badge */}
              <div style={{
                flexShrink: 0, zIndex: 1,
                background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)',
                borderRadius: 8, padding: '20px 32px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 24, color: '#00ff88', fontWeight: 600 }}>200 OK</span>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: '#333' }}>handler executed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── FAQ ─────────────────────────────────────────────────────────────────── */

const FAQ_ITEMS = [
  { q: 'Does Gate402 hold my money?',                   a: "No. Payments go directly from the agent's wallet to your Solana wallet on-chain. Gate402 only verifies that the payment happened. We never touch your funds." },
  { q: 'Do agents need special software to pay?',       a: "Any HTTP client works. For automatic payment handling when receiving a 402, agents use the x402-fetch library (npm install x402-fetch). Without it, agents must manually send USDC and include the transaction hash in the header." },
  { q: 'What is USDC?',                                 a: "USDC is a stablecoin pegged 1:1 to the US dollar, issued by Circle. 0.001 USDC = exactly $0.001. No volatility, no conversion needed. It runs on Solana and settles in ~400ms." },
  { q: 'What is the x402 protocol?',                   a: 'HTTP 402 "Payment Required" is a status code that has existed since 1991 but was never widely used. The x402 protocol defines how APIs should use it for machine-to-machine payments. Backed by Google, Microsoft, Stripe, Coinbase, and Cloudflare through the x402 Foundation.' },
  { q: 'Can I use Gate402 with any framework?',         a: "The npm SDK currently supports Express (Node.js). The Python SDK supports Flask and FastAPI. Next.js API routes and Fastify support are coming in Q3 2026. The server (api.gate402.dev) works with any framework via direct API calls." },
  { q: 'How do agents get USDC to pay?',               a: "The person or company running the agent funds the agent's Solana wallet with USDC. This is analogous to giving an employee a corporate card. The agent spends from that balance automatically. Minimum balance depends on how many API calls you expect." },
  { q: 'What is Solana devnet vs mainnet?',             a: "Devnet is a test network with fake tokens — free to use for development and testing. Mainnet is the live network with real USDC. Gate402 supports both. You switch with one environment variable: network: 'mainnet'." },
  { q: 'What happens if the agent sends the wrong amount?', a: "Gate402 verifies the exact amount on-chain. If the payment is less than the configured price, the request is rejected with HTTP 402 again. The agent must send the correct amount to get access." },
  { q: 'Is Gate402 open source?',                      a: "Yes. The core middleware, SDK, and server are MIT licensed at github.com/joaopco8/gate402_. The hosted dashboard at gate402.dev is the commercial offering — same model as Supabase and Redis." },
  { q: 'How long does payment verification take?',     a: "Solana confirms transactions in an average of 400ms. Gate402 verification adds ~50ms on top of that. Total overhead to the agent: under 500ms per payment. Subsequent calls with the same hash are cached." },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section style={{ background: '#000', padding: '120px 0', borderTop: '1px solid #1a1a1a' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 32px' }}>
        <div className="mono" style={{ fontSize: 11, color: '#333', letterSpacing: '0.1em', marginBottom: 20 }}>FAQ</div>
        <h2 style={{ fontSize: 40, fontWeight: 300, marginBottom: 64, lineHeight: 1.2 }}>Common questions</h2>
        <div>
          {FAQ_ITEMS.map((item, idx) => (
            <div key={idx} style={{ borderBottom: '1px solid #1a1a1a' }}>
              <button
                onClick={() => setOpen(open === idx ? null : idx)}
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}
              >
                <span style={{ color: '#fff', fontSize: 15, fontFamily: 'inherit' }}>{item.q}</span>
                <span style={{ color: '#00ff88', fontSize: 20, flexShrink: 0, marginLeft: 16, fontFamily: 'var(--font-mono,monospace)' }}>{open === idx ? '−' : '+'}</span>
              </button>
              <div style={{ maxHeight: open === idx ? 300 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
                <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7, paddingBottom: 18 }}>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── PRICING ────────────────────────────────────────────────────────────── */

function PricingFeature({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ color: '#00ff88', fontSize: 12, flexShrink: 0, marginTop: 1 }}>✓</span>
      <span style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 13, color: '#888', lineHeight: 1.5 }}>{label}</span>
    </div>
  )
}

function Pricing() {
  const [visible, setVisible] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  async function handleStartPro() {
    setCheckoutLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login?intent=checkout'
        return
      }

      const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'
      const res = await fetch(`${SERVER_URL}/api/billing/checkout`, {
        method: 'POST',
        headers: { 'x-user-id': user.id },
      })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else if (data.error === 'Already on Pro plan') {
        window.location.href = '/dashboard'
      } else {
        alert(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('[checkout] Error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const delays = ['0s', '0.15s', '0.3s']

  return (
    <section id="pricing" style={{ background: '#000', padding: '120px 32px', borderTop: '1px solid #1a1a1a' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div className="mono" style={{ fontSize: 11, color: '#333', letterSpacing: '0.1em', marginBottom: 20, textAlign: 'center' }}>PRICING</div>
        <h2 style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 300, fontSize: 48, letterSpacing: '-0.03em', color: '#fff', marginBottom: 12, textAlign: 'center' }}>
          Free until you&apos;re making money.
        </h2>
        <p style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 64 }}>
          Start self-hosted for free. Upgrade when you need scale.
        </p>

        {/* Cards */}
        <div ref={ref} className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>

          {/* ── CARD 1: Free ── */}
          <div style={{
            background: '#0d0d0d',
            border: '1px solid #1a1a1a',
            borderRadius: 8,
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            opacity: visible ? undefined : 0,
            animation: visible ? `cardReveal 0.5s ease-out ${delays[0]} both` : undefined,
          }}>
            <span className="badge" style={{ alignSelf: 'flex-start', marginBottom: 20, color: '#666', borderColor: '#1a1a1a' }}>
              Self-hosted
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
              <span style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 300, fontSize: 56, color: '#fff', letterSpacing: '-0.03em' }}>$0</span>
            </div>
            <div style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 13, color: '#555', marginBottom: 24 }}>Forever</div>
            <div style={{ height: 1, background: '#1a1a1a', marginBottom: 20 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 20 }}>
              {[
                'npm install gate402',
                'Full x402 middleware',
                'Solana devnet + mainnet',
                'Local dashboard',
                'Unlimited API calls',
                'Open source MIT',
                'Community support',
              ].map(f => <PricingFeature key={f} label={f} />)}
            </div>
            <p style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 12, color: '#444', marginBottom: 20, lineHeight: 1.5 }}>
              Run on your own infra. Full control.
            </p>
            <a href="https://github.com/joaopco8/gate402_" target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ textAlign: 'center' }}>
              Get started →
            </a>
          </div>

          {/* ── CARD 2: Pro ── */}
          <div style={{
            background: '#0d0d0d',
            border: '1px solid rgba(0,255,136,0.25)',
            borderRadius: 8,
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            opacity: visible ? undefined : 0,
            animation: visible ? `cardReveal 0.5s ease-out ${delays[1]} both, borderPulse 3s ease-in-out 0.5s infinite` : undefined,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span className="badge" style={{ color: '#00ff88', borderColor: '#00ff8830', background: '#00ff8808' }}>Hosted</span>
              <span className="badge" style={{ color: '#00ff88', borderColor: '#00ff8830', background: '#00ff8808', fontSize: 10 }}>Most popular</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
              <span style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 300, fontSize: 56, color: '#fff', letterSpacing: '-0.03em' }}>$99</span>
              <span style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 16, color: '#555' }}>/ month</span>
            </div>
            <div style={{ height: 1, background: '#1a1a1a', margin: '20px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 20 }}>
              {[
                'Everything in Free',
                'npm install gate402 — one line setup',
                'Gate402 verifies payments for you',
                'Hosted dashboard at gate402.dev',
                'Real-time analytics',
                'Email alerts on payment received',
                'Webhook on every confirmed payment',
                'Priority support',
              ].map(f => <PricingFeature key={f} label={f} />)}
            </div>

            {/* Setup snippet */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ height: 1, background: '#1a1a1a', marginBottom: 16 }} />
              <div className="mono" style={{ fontSize: 10, color: '#333', letterSpacing: '0.08em', marginBottom: 8 }}>SETUP</div>
              <div style={{
                background: '#0a0a0a',
                border: '1px solid #222',
                borderRadius: 6,
                padding: 10,
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 11,
                lineHeight: 1.85,
                overflowX: 'auto',
              }}>
                {[
                  [{ t: 'app.use(gate402({', c: '#666' }],
                  [{ t: '  apiKey: ', c: '#666' }, { t: "'your-key'", c: '#00ff88' }, { t: ',', c: '#666' }],
                  [{ t: '  serverUrl: ', c: '#666' }, { t: "'https://api.gate402.dev'", c: '#00ff88' }, { t: ',', c: '#666' }],
                  [{ t: '  endpoints: ', c: '#666' }, { t: '{', c: '#ccc' }, { t: " '/api/data'", c: '#00ff88' }, { t: ': 0.001 }', c: '#ccc' }],
                  [{ t: '}))', c: '#666' }],
                ].map((line, li) => (
                  <div key={li}>
                    {line.map((seg, si) => <span key={si} style={{ color: seg.c }}>{seg.t}</span>)}
                  </div>
                ))}
              </div>
            </div>

            <p style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 12, color: '#444', marginBottom: 20, lineHeight: 1.5 }}>
              We handle the infrastructure. You collect USDC.
            </p>
            <button
              onClick={handleStartPro}
              disabled={checkoutLoading}
              className="btn-primary"
              style={{ textAlign: 'center', opacity: checkoutLoading ? 0.7 : 1, cursor: checkoutLoading ? 'wait' : 'pointer' }}
            >
              {checkoutLoading ? 'Loading...' : 'Start Pro →'}
            </button>
          </div>

          {/* ── CARD 3: Enterprise ── */}
          <div style={{
            background: '#0d0d0d',
            border: '1px solid #1a1a1a',
            borderRadius: 8,
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            opacity: visible ? undefined : 0,
            animation: visible ? `cardReveal 0.5s ease-out ${delays[2]} both` : undefined,
          }}>
            <span className="badge" style={{ alignSelf: 'flex-start', marginBottom: 20, color: '#666', borderColor: '#1a1a1a' }}>
              Volume
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
              <span style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 300, fontSize: 56, color: '#fff', letterSpacing: '-0.03em' }}>0.5%</span>
            </div>
            <div style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 13, color: '#555', marginBottom: 24 }}>of processed volume</div>
            <div style={{ height: 1, background: '#1a1a1a', marginBottom: 20 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 20 }}>
              {[
                'Everything in Pro',
                'Custom domain',
                'SLA guarantee',
                'Dedicated support',
                'Custom integrations',
                'White-label dashboard',
                'Volume discounts',
              ].map(f => <PricingFeature key={f} label={f} />)}
            </div>
            <p style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 12, color: '#444', marginBottom: 20, lineHeight: 1.5 }}>
              For teams processing serious scale.
            </p>
            <a href="mailto:joaocamargo@gate402.dev" className="btn-ghost" style={{ textAlign: 'center' }}>
              Talk to us →
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}

/* ─── FINAL CTA ──────────────────────────────────────────────────────────── */

/* SECTION: FinalCTA */
function FinalCTA() {
  const [copied, setCopied] = useState(false)
  const [ctaVisible, setCtaVisible] = useState(false)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCtaVisible(true) },
      { threshold: 0.3 }
    )
    if (ctaRef.current) observer.observe(ctaRef.current)
    return () => observer.disconnect()
  }, [])

  function handleCopy() {
    navigator.clipboard.writeText('npm install gate402')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section style={{ background: '#000', padding: '160px 32px', borderTop: '1px solid #1a1a1a', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* animated grid background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        animation: 'gridMove 20s linear infinite',
        zIndex: 0,
      }} />

      <div ref={ctaRef} style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <h2 className="final-cta-headline" style={{
          fontFamily: 'var(--font-space, sans-serif)',
          fontWeight: 300,
          fontSize: 64,
          letterSpacing: '-0.03em',
          color: '#fff',
          lineHeight: 1.05,
          marginBottom: 16,
          opacity: ctaVisible ? undefined : 0,
          animation: ctaVisible ? 'fadeInUp 0.8s ease-out both' : undefined,
        }}>
          Your API has been free for too long.
        </h2>
        <p style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 20, color: '#666', marginBottom: 48 }}>
          Start collecting USDC in 5 minutes.
        </p>

        {/* copiable snippet */}
        <div className="npm-snippet" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 16,
          background: '#0d0d0d',
          border: '1px solid #1a1a1a',
          borderRadius: 6,
          padding: '14px 20px',
          marginBottom: 32,
        }}>
          <span className="mono" style={{ fontSize: 15, color: '#ccc' }}>
            $ npm install gate402
            <span style={{ animation: 'blink 1s ease-in-out infinite', color: '#00ff88', marginLeft: 2 }}>_</span>
          </span>
          <button onClick={handleCopy} style={{
            background: copied ? '#00ff8815' : 'transparent',
            border: `1px solid ${copied ? '#00ff8840' : '#333'}`,
            color: copied ? '#00ff88' : '#555',
            borderRadius: 4,
            padding: '4px 12px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 12,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}>
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <a href="/dashboard" className="btn-primary" style={{ padding: '14px 32px', fontSize: 16 }}>
            Open Dashboard →
          </a>
        </div>
        <p className="mono" style={{ fontSize: 12, color: '#333' }}>
          No credit card. No account. Open source.
        </p>
      </div>
    </section>
  )
}

/* ─── FOOTER ─────────────────────────────────────────────────────────────── */

/* SECTION: Footer */
function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #1a1a1a', background: '#000', padding: '40px 32px 0' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="footer-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 32, borderBottom: '1px solid #1a1a1a' }}>
          {/* Left */}
          <div>
            <div style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 500, fontSize: 16, color: '#fff', marginBottom: 8 }}>Gate402</div>
            <div style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 13, color: '#333' }}>Billing infrastructure for AI agents.</div>
          </div>

          {/* Right links */}
          <div className="footer-links" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            {[
              ['GitHub',    'https://github.com/joaopco8/gate402_',  '_blank'],
              ['npm',       'https://npmjs.com/package/gate402',     '_blank'],
              ['Docs',      '/docs',                                  undefined],
              ['Privacy',   '/privacy',                               undefined],
              ['Terms',     '/terms',                                 undefined],
              ['Dashboard', '/dashboard',                             undefined],
            ].map(([label, href, target]) => (
              <a
                key={label}
                href={href}
                target={target}
                rel={target === '_blank' ? 'noopener noreferrer' : undefined}
                style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 13, color: '#666', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#666')}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom line */}
        <div className="mono" style={{ fontSize: 11, color: '#333', textAlign: 'center', padding: '24px 0' }}>
          Built with x402 Protocol · Powered by Solana
        </div>
      </div>
    </footer>
  )
}

/* ─── PAGE ROOT ──────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      style={{ background: '#000', minHeight: '100vh', fontFamily: 'var(--font-space), sans-serif', overflowX: 'hidden' }}
    >
      <style>{CSS}</style>
      <Nav />
      <Hero />
      <StatsBar />
      <LiveFeed />
      <HowItWorks />
      <Features />
      <CodeSection />
      <ProviderSide />
      <AgentSide />
      <FAQ />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  )
}

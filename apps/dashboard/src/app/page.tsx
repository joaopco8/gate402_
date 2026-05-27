'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '../../lib/supabase/client'
import { getAuthHeaders } from './lib/api'
import InteractiveHero from '@/components/ui/hero-section-nexus'
import { WaitlistSection } from '@/components/ui/waitlist-section'
import { Features as FeaturesGrid } from '@/components/ui/features-4'
import RuixenSection from '@/components/ui/ruixen-feature-section'
import { FAQSection } from '@/components/ui/faqsection'
import { BentoGrid } from '@/components/ui/bento-grid'
import { Component as FlickeringFooter } from '@/components/ui/flickering-footer'
import { Features as Features8 } from '@/components/blocks/features-8'
import { Features as Features7 } from '@/components/blocks/features-7'
import FeaturedSectionStats from '@/components/ui/featured-section-stats'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { Layers, ShieldCheck, Zap } from 'lucide-react'

/* ─── DESIGN SYSTEM CSS ──────────────────────────────────────────────────── */

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

  @keyframes blurReveal {
    from { opacity: 0; filter: blur(18px); transform: translateY(16px); }
    to   { opacity: 1; filter: blur(0px);  transform: translateY(0); }
  }

  @keyframes borderPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(0,188,125,0); }
    50% { box-shadow: 0 0 20px 2px rgba(0,188,125,0.15); }
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
    background: linear-gradient(135deg, #00bc7d, #9945FF, #00bc7d, #9945FF);
    background-size: 300% 300%;
    animation: gradientShift 3s ease infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @keyframes pulseGreen {
    0%, 100% { opacity: 0.4; box-shadow: 0 0 0 0 rgba(0,188,125,0.3); }
    50%       { opacity: 1; box-shadow: 0 0 0 4px rgba(0,188,125,0); }
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
        <Image src="/logo-gate.png" alt="Gate402" width={110} height={22} priority style={{ height: 22, width: 'auto', display: 'block' }} />
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
          { label: 'Pricing',      href: '/pricing' },
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
        <a href="/auth/login" style={{ fontSize: 14, color: '#666', fontFamily: 'var(--font-space)' }}>Sign in</a>
        <a href="/auth/login" style={{
          fontSize: 14,
          fontFamily: 'var(--font-space)',
          fontWeight: 500,
          color: '#00bc7d',
          background: 'rgba(0,188,125,0.08)',
          border: '1px solid rgba(0,188,125,0.3)',
          padding: '8px 18px',
          borderRadius: 6,
          textDecoration: 'none',
        }}>Start free →</a>
      </div>
    </nav>
  )
}

/* ─── HERO ───────────────────────────────────────────────────────────────── */


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
    <section style={{ background: '#111111', padding: '80px 32px', borderTop: '1px solid #1a1a1a' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 400, fontSize: 16, color: '#fff' }}>
            Live payments
          </span>
          <span className="badge mono" style={{ color: '#00bc7d', borderColor: '#00bc7d30', background: '#00bc7d08', fontSize: 10 }}>
            DEVNET
          </span>
        </div>

        {/* feed */}
        <div style={{ border: '1px solid #1a1a1a', borderRadius: 6, overflow: 'hidden', marginBottom: 40 }}>
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
                background: item.id === latestId ? '#111111' : '#000',
                transition: 'background 0.4s',
                animation: item.id === latestId ? 'fadeInDown 0.4s ease-out' : undefined,
              }}
            >
              <span className="mono" style={{ fontSize: 12, color: '#00bc7d', minWidth: 140 }}>{item.endpoint}</span>
              <span className="mono feed-wallet" style={{ fontSize: 12, color: '#333' }}>{item.wallet}</span>
              <span className="feed-arrow" style={{ fontSize: 12, color: '#333', margin: '0 8px' }}>→</span>
              <span className="mono" style={{ fontSize: 12, color: '#fff', flex: 1, textAlign: 'center' }}>{item.amount} USDC</span>
              <span className="badge" style={{
                fontSize: 10,
                color: item.id === latestId ? '#00bc7d' : '#333',
                borderColor: item.id === latestId ? '#00bc7d30' : '#1a1a1a',
                background: item.id === latestId ? '#00bc7d08' : 'transparent',
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
    snippetColor: '#00bc7d',
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
    snippetColor: '#00bc7d',
  },
]

function HowItWorks() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section id="how-it-works" style={{ background: '#111111', padding: '120px 32px', borderTop: '1px solid #1a1a1a' }}>
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
          borderRadius: 6,
          overflow: 'hidden',
        }}>
          {HOW_STEPS.map(({ n, title, desc, snippet, snippetColor }, idx) => (
            <div
              key={n}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered === idx ? '#111111' : '#000',
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
                background: '#111111',
                border: '1px solid #1a1a1a',
                borderRadius: 6,
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
  { from: 'Gate402', to: 'Agent', dir: 'left',  color: '#00bc7d', msg: '200 OK · { city: São Paulo, temp: 28°C }' },
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
  { text: " 'x402-fetch'",                                   color: '#00bc7d', inline: true, newline: true },
  { text: 'import',                                          color: '#9945FF', inline: true },
  { text: ' { ',                                             color: '#ccc',    inline: true },
  { text: 'Keypair',                                         color: '#3b82f6', inline: true },
  { text: ' } ',                                             color: '#ccc',    inline: true },
  { text: 'from',                                            color: '#9945FF', inline: true },
  { text: " '@solana/web3.js'",                              color: '#00bc7d', inline: true, newline: true },
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
  { text: "'mainnet'",                                       color: '#00bc7d', inline: true, newline: true },
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
  { text: "  'https://api.gate402.dev/weather'",             color: '#00bc7d', inline: true, newline: true },
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
    <section style={{ background: '#111111', padding: '120px 0', borderTop: '1px solid #1a1a1a' }}>
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
          <div style={{ background: '#111111', border: '1px solid #1a1a1a', borderRadius: 6, padding: 32, fontFamily: 'var(--font-mono, monospace)' }}>

            {/* Actors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginBottom: 0 }}>
              {[
                { icon: '◈', label: 'AI Agent',  color: '#9945FF' },
                { icon: '⬡', label: 'Gate402',   color: '#00bc7d' },
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
                        <span style={{ position: 'relative', fontSize: 14, color: line.color, background: '#111111', padding: '0 4px' }}>
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
          <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 6, padding: 24 }}>
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
    e.currentTarget.style.borderTopColor = '#00bc7d'
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
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M13 2L4.09 12.96H11L10.09 22L19 11.04H12.09L13 2Z" stroke="#00bc7d" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/></svg>,
      title: 'Solana settlement',
      desc: '400ms finality. $0.001 fees. No banks. No chargebacks. No KYC. No weekends.',
      badge: <span className="mono" style={{ fontSize: 12, color: '#00bc7d' }}>400ms · $0.001</span>,
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="1" stroke="#fff" strokeWidth="1.5"/><rect x="13" y="3" width="8" height="8" rx="1" stroke="#fff" strokeWidth="1.5"/><rect x="3" y="13" width="8" height="8" rx="1" stroke="#fff" strokeWidth="1.5"/><rect x="13" y="13" width="8" height="8" rx="1" stroke="#fff" strokeWidth="1.5"/></svg>,
      title: 'Real-time dashboard',
      desc: 'Every call, every payment, every wallet. Live analytics. Export CSV. Yours forever.',
      badge: <span className="badge" style={{ color: '#00bc7d', borderColor: '#00bc7d30', background: '#00bc7d08', alignSelf: 'flex-start' }}><span className="live-dot-green" style={{ width: 6, height: 6, borderRadius: '50%', background: '#00bc7d', display: 'inline-block' }} /> Live</span>,
    },
  ]

  return (
    <section id="features" style={{ background: '#111111', padding: '120px 0', borderTop: '1px solid #1a1a1a' }}>
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
  { text: "  apiKey: 'gk_live_...',",               color: '#00bc7d' },
  { text: "  endpoints: {",                         color: '#ccc' },
  { text: "    '/api/data': 0.005,",                color: '#00bc7d' },
  { text: "    '/api/premium': 0.050,",             color: '#00bc7d' },
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
    <section style={{ background: '#111111', padding: '120px 32px', borderTop: '1px solid #1a1a1a' }}>
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
                <span style={{ color: '#00bc7d', fontSize: 13 }}>✓</span>
                <span style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 14, color: '#888' }}>{b}</span>
              </div>
            ))}
          </div>
          <a href="/auth/login" className="btn-primary">npm install gate402 →</a>
        </div>

        {/* Right: code block */}
        <div ref={codeRef} style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 6, overflow: 'hidden' }}>
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
                  <span style={{ animation: 'blink 1s infinite', marginLeft: 2, color: '#00bc7d' }}>|</span>
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
    <div style={{ background: '#111111', border: '1px solid #1a1a1a', borderRadius: 6, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid #1a1a1a' }}>
        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: '#333', letterSpacing: '0.06em' }}>{lang}</span>
        <button
          onClick={copy}
          style={{ background: copied ? '#00bc7d15' : 'transparent', border: `1px solid ${copied ? '#00bc7d40' : '#222'}`, color: copied ? '#00bc7d' : '#444', borderRadius: 6, padding: '3px 10px', fontFamily: 'var(--font-mono, monospace)', fontSize: 11, cursor: 'pointer', transition: 'all 0.15s' }}
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
        <div style={{ background: '#111111', border: '1px solid #1a1a1a', borderRadius: 6, padding: '10px 14px', fontFamily: 'var(--font-mono, monospace)', fontSize: 13, color: '#00bc7d' }}>
          npm install gate402
        </div>
      ),
    },
    {
      n: '02', title: 'Add middleware',
      content: (
        <div style={{ background: '#111111', border: '1px solid #1a1a1a', borderRadius: 6, padding: '10px 14px', fontFamily: 'var(--font-mono, monospace)', fontSize: 13, lineHeight: 1.7 }}>
          <span style={{ color: '#9945FF' }}>app</span><span style={{ color: '#ccc' }}>.use(gate402({'{'}</span><br />
          <span style={{ color: '#ccc' }}>{'  '}apiKey: </span><span style={{ color: '#00bc7d' }}>&apos;key&apos;</span><span style={{ color: '#ccc' }}>, price: </span><span style={{ color: '#f59e0b' }}>0.001</span><br />
          <span style={{ color: '#ccc' }}>{'}))'}</span>
        </div>
      ),
    },
    {
      n: '03', title: 'Set your wallet',
      content: (
        <div>
          <p style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 12 }}>Payments go directly to your Solana wallet.</p>
          <span style={{ display: 'inline-block', background: 'rgba(0,188,125,0.08)', border: '1px solid rgba(0,188,125,0.2)', color: '#00bc7d', fontFamily: 'var(--font-mono, monospace)', fontSize: 11, padding: '4px 10px', borderRadius: 6 }}>Non-custodial</span>
        </div>
      ),
    },
    {
      n: '04', title: 'Deploy',
      content: (
        <div>
          <p style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 12 }}>Agents receive HTTP 402 and pay automatically.</p>
          <span style={{ display: 'inline-block', background: 'rgba(0,188,125,0.08)', border: '1px solid rgba(0,188,125,0.2)', color: '#00bc7d', fontFamily: 'var(--font-mono, monospace)', fontSize: 11, padding: '4px 10px', borderRadius: 6 }}>✓ Done</span>
        </div>
      ),
    },
  ]

  return (
    <section style={{ background: '#111111', padding: '96px 0', borderTop: '1px solid #1a1a1a' }}>
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
                background: hoveredCard === i ? '#0f0f0f' : '#111111',
                border: `1px solid ${hoveredCard === i ? '#2a2a2a' : '#1a1a1a'}`,
                borderRadius: 6,
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
    <section style={{ background: '#111111', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', padding: '80px 0' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ maxWidth: 720, marginBottom: 48 }}>
          <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: '#444', letterSpacing: '0.12em', marginBottom: 16 }}>FOR AGENT OPERATORS</div>
          <h2 style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 300, fontSize: 40, color: '#fff', lineHeight: 1.1, marginBottom: 12 }}>Any HTTP client. Pays itself.</h2>
          <p style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 16, color: '#888' }}>Fund your agent wallet with USDC. The agent handles the rest.</p>
        </div>

        <div className="code-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
          <div style={{ background: '#111111', border: '1px solid #1a1a1a', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: '#444' }}>with x402-fetch</span>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, color: '#00bc7d' }}>RECOMMENDED</span>
            </div>
            <div style={{ padding: '16px 20px', fontFamily: 'var(--font-mono, monospace)', fontSize: 13, lineHeight: 1.7 }}>
              <div><span style={{ color: '#9945FF' }}>import</span><span style={{ color: '#ccc' }}> {'{ wrapFetch }'} </span><span style={{ color: '#9945FF' }}>from</span><span style={{ color: '#00bc7d' }}> &apos;x402-fetch&apos;</span></div>
              <div style={{ height: 8 }} />
              <div><span style={{ color: '#9945FF' }}>const</span><span style={{ color: '#ccc' }}> fetch = </span><span style={{ color: '#3b82f6' }}>wrapFetch</span><span style={{ color: '#ccc' }}>{'({ wallet: agentWallet })'}</span></div>
              <div><span style={{ color: '#9945FF' }}>const</span><span style={{ color: '#ccc' }}> data = </span><span style={{ color: '#9945FF' }}>await</span><span style={{ color: '#ccc' }}> fetch(</span><span style={{ color: '#00bc7d' }}>&apos;https://api.dev/data&apos;</span><span style={{ color: '#ccc' }}>)</span></div>
              <div style={{ height: 4 }} />
              <div><span style={{ color: '#444' }}>{'// Pays automatically on HTTP 402'}</span></div>
            </div>
          </div>

          <div style={{ background: '#111111', border: '1px solid #1a1a1a', borderRadius: 6, overflow: 'hidden' }}>
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
          letterSpacing: '0.12em', background: '#111111', border: '1px solid #1a1a1a',
          borderRadius: 6, padding: '3px 8px',
        }}>STEP {card.n}</span>
        {card.dot === 'amber' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />}
        {card.dot === 'green' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00bc7d', display: 'inline-block' }} />}
      </div>

      <div style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 500, fontSize: 17, color: '#fff', marginBottom: 8 }}>{card.title}</div>
      <p style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 13, color: '#555', lineHeight: 1.7, margin: 0 }}>{card.desc}</p>

      {card.detail && (
        <div style={{
          display: 'inline-block', marginTop: 16,
          fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: '#333',
          background: '#111111', border: '1px solid #1a1a1a', borderRadius: 6, padding: '6px 12px',
        }}>{card.detail}</div>
      )}
    </div>
  )
}

function HowItWorksTimeline() {
  const [hovered8, setHovered8] = useState(false)
  return (
    <section style={{ background: '#111111', padding: '120px 0', borderTop: '1px solid #1a1a1a' }}>
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
        <div style={{ background: '#111', borderRadius: 6, overflow: 'hidden' }}>
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
                    letterSpacing: '0.12em', background: '#111111', border: '1px solid #1a1a1a',
                    borderRadius: 6, padding: '3px 8px',
                  }}>STEP 08</span>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00bc7d', display: 'inline-block' }} />
                </div>
                <div style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 500, fontSize: 17, color: '#fff', marginBottom: 8 }}>Access granted</div>
                <p style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 13, color: '#555', lineHeight: 1.7, margin: 0, maxWidth: 480 }}>
                  Your handler executes. The response is returned to the agent. USDC is already in your wallet.
                </p>
              </div>

              {/* Right: badge */}
              <div style={{
                flexShrink: 0, zIndex: 1,
                background: 'rgba(0,188,125,0.06)', border: '1px solid rgba(0,188,125,0.15)',
                borderRadius: 6, padding: '20px 32px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 24, color: '#00bc7d', fontWeight: 600 }}>200 OK</span>
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
    <section style={{ background: '#111111', padding: '120px 0', borderTop: '1px solid #1a1a1a' }}>
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
                <span style={{ color: '#00bc7d', fontSize: 20, flexShrink: 0, marginLeft: 16, fontFamily: 'var(--font-mono,monospace)' }}>{open === idx ? '−' : '+'}</span>
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
      <span style={{ color: '#00bc7d', fontSize: 12, flexShrink: 0, marginTop: 1 }}>✓</span>
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
        window.location.href = '/auth/login?intent=checkout'
        return
      }

      const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'
      const res = await fetch(`${SERVER_URL}/api/billing/checkout`, {
        method: 'POST',
        headers: { ...await getAuthHeaders() },
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
    <section id="pricing" style={{ background: '#111111', padding: '120px 32px', borderTop: '1px solid #1a1a1a' }}>
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
            borderRadius: 6,
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
            border: '1px solid rgba(0,188,125,0.25)',
            borderRadius: 6,
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            opacity: visible ? undefined : 0,
            animation: visible ? `cardReveal 0.5s ease-out ${delays[1]} both, borderPulse 3s ease-in-out 0.5s infinite` : undefined,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span className="badge" style={{ color: '#00bc7d', borderColor: '#00bc7d30', background: '#00bc7d08' }}>Hosted</span>
              <span className="badge" style={{ color: '#00bc7d', borderColor: '#00bc7d30', background: '#00bc7d08', fontSize: 10 }}>Most popular</span>
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
                background: '#111111',
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
                  [{ t: '  apiKey: ', c: '#666' }, { t: "'your-key'", c: '#00bc7d' }, { t: ',', c: '#666' }],
                  [{ t: '  serverUrl: ', c: '#666' }, { t: "'https://api.gate402.dev'", c: '#00bc7d' }, { t: ',', c: '#666' }],
                  [{ t: '  endpoints: ', c: '#666' }, { t: '{', c: '#ccc' }, { t: " '/api/data'", c: '#00bc7d' }, { t: ': 0.001 }', c: '#ccc' }],
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
            borderRadius: 6,
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


/* ─── GET STARTED ────────────────────────────────────────────────────────── */

/* SECTION: GetStarted */
function GetStarted() {
  const [copied, setCopied] = useState<string | null>(null)

  function handleCopy(cmd: string) {
    navigator.clipboard.writeText(cmd)
    setCopied(cmd)
    setTimeout(() => setCopied(null), 2000)
  }

  const options = [
    {
      label: 'Provider Side',
      desc: 'Monetize any Express, Fastify, or Python API. Three lines of middleware. Agents pay you in USDC.',
      cmd: 'npm install gate402',
      badge: 'API Middleware',
    },
    {
      label: 'Consumer Side',
      desc: 'Add autonomous payment to any AI agent. Detects 402, pays, retries — zero human interaction.',
      cmd: 'npm install gate402-agent',
      badge: 'Agent SDK',
    },
    {
      label: 'MCP Server — from scratch',
      desc: 'Scaffold a new MCP server with Gate402 pre-configured. Per-tool pricing out of the box.',
      cmd: 'npx create-gate402-mcp',
      badge: 'MCP',
    },
    {
      label: 'Existing MCP Server',
      desc: 'Add Gate402 billing to an MCP server you already have running. Drop-in middleware.',
      cmd: 'npm install gate402',
      badge: 'Middleware',
    },
  ]

  return (
    <section style={{ background: '#111111', borderTop: '1px solid #222222', padding: 'clamp(48px, 8vw, 80px) clamp(16px, 4vw, 32px)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 500, lineHeight: 1.15, marginBottom: 12, fontFamily: 'var(--font-space)' }}>
            <span style={{ color: '#fff' }}>Start building.</span>{' '}
            <span style={{ color: '#898989' }}>Pick your entry point.</span>
          </h2>
          <p style={{ fontSize: 16, color: '#898989', lineHeight: 1.65, maxWidth: 480, margin: '0 auto', fontFamily: 'var(--font-space)' }}>
            One command. No accounts. No contracts. Your first payment flows in under five minutes.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {options.map((opt) => (
            <div
              key={opt.cmd}
              style={{
                background: '#161616',
                border: '1px solid #222222',
                borderRadius: 6,
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#333')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#222222')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fff', fontFamily: 'var(--font-space)', margin: 0 }}>
                  {opt.label}
                </h3>
                <span style={{
                  fontSize: 11, fontWeight: 500, color: '#00bc7d',
                  background: 'rgba(0,188,125,0.1)', border: '1px solid rgba(0,188,125,0.2)',
                  borderRadius: 6, padding: '2px 8px', whiteSpace: 'nowrap',
                }}>
                  {opt.badge}
                </span>
              </div>

              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, fontFamily: 'var(--font-space)', margin: 0, flexGrow: 1 }}>
                {opt.desc}
              </p>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#0d0d0d', border: '1px solid #1a1a1a',
                borderRadius: 6, padding: '10px 14px', gap: 12,
              }}>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 13, color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {opt.cmd}
                </span>
                <button
                  onClick={() => handleCopy(opt.cmd)}
                  style={{
                    flexShrink: 0,
                    background: copied === opt.cmd ? 'rgba(0,188,125,0.1)' : 'transparent',
                    border: `1px solid ${copied === opt.cmd ? 'rgba(0,188,125,0.3)' : '#333'}`,
                    color: copied === opt.cmd ? '#00bc7d' : '#555',
                    borderRadius: 6, padding: '3px 10px',
                    fontFamily: 'var(--font-mono, monospace)', fontSize: 11,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {copied === opt.cmd ? '✓' : 'Copy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


/* ─── FOOTER ─────────────────────────────────────────────────────────────── */

/* SECTION: Footer */
function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #1a1a1a', background: '#111111', padding: '40px 32px 0' }}>
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

/* ─── MAC TERMINAL ───────────────────────────────────────────────────────── */

const terminalLines = [
  { type: 'comment', text: 'calling a Gate402-protected API' },
  { type: 'blank' },
  { type: 'prompt',  text: 'curl https://api.meuservico.dev/api/analyze' },
  { type: 'blank' },
  { type: 'output',  text: '  HTTP/1.1 402 Payment Required' },
  { type: 'json',    text: '  {' },
  { type: 'json',    text: '    "price": { "total": 0.005, "currency": "USDC" },' },
  { type: 'json',    text: '    "payTo": "DcL4mMaq...YABE",' },
  { type: 'json',    text: '    "network": "solana-devnet"' },
  { type: 'json',    text: '  }' },
  { type: 'blank' },
  { type: 'info',    text: 'Received HTTP 402 — processing payment...' },
  { type: 'info',    text: 'Sending 0.00495 USDC → DcL4mMaq...YABE' },
  { type: 'info',    text: 'Sending 0.00005 USDC → Gate402 (1% fee)' },
  { type: 'blank' },
  { type: 'success', text: 'Transaction confirmed in 412ms' },
  { type: 'success', text: 'txHash: 5kWq9mLP3rTxHJzUvBn...' },
  { type: 'blank' },
  { type: 'info',    text: 'Retrying with X-Payment-Payload header...' },
  { type: 'blank' },
  { type: 'output',  text: '  HTTP/1.1 200 OK' },
  { type: 'json',    text: '  { "resultado": "análise completa", "status": "ok" }' },
  { type: 'blank' },
  { type: 'money',   text: 'You received 0.00495 USDC — directly to your wallet' },
  { type: 'blank' },
]

const lineDelays: Record<string, number> = {
  prompt: 600, output: 300, json: 80, info: 400,
  success: 300, money: 500, blank: 150, comment: 200,
}

function MacTerminal() {
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    if (visibleLines >= terminalLines.length) {
      const t = setTimeout(() => setVisibleLines(0), 3000)
      return () => clearTimeout(t)
    }
    const delay = lineDelays[terminalLines[visibleLines]?.type] ?? 200
    const t = setTimeout(() => setVisibleLines(v => v + 1), delay)
    return () => clearTimeout(t)
  }, [visibleLines])

  function renderLine(line: { type: string; text?: string }, i: number) {
    if (line.type === 'blank') return <div key={i} style={{ height: 10 }} />
    const styles: Record<string, { color: string; prefix?: string }> = {
      prompt:  { color: '#00bc7d',               prefix: '$ ' },
      output:  { color: 'rgba(255,255,255,0.5)' },
      json:    { color: 'rgba(255,255,255,0.4)' },
      info:    { color: '#3b82f6',               prefix: '  [agent] ' },
      success: { color: '#00bc7d',               prefix: '  ✓ ' },
      money:   { color: '#f59e0b',               prefix: '  💰 ' },
      comment: { color: 'rgba(255,255,255,0.2)', prefix: '  # ' },
    }
    const s = styles[line.type] || { color: 'rgba(255,255,255,0.5)' }
    return (
      <div key={i} style={{ color: s.color, whiteSpace: 'pre' }}>
        {s.prefix ?? ''}{line.text}
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 720, margin: '0 auto', marginTop: 64 }}>

      {/* window */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(10,10,10,0.75)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 6, overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}>
        {/* titlebar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '14px 18px',
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
        }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
          <span style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em',
          }}>gate402 — payment flow</span>
        </div>

        {/* content */}
        <div style={{ position: 'relative' }}>
          <div style={{
            padding: '24px 28px', height: 560, overflow: 'hidden',
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 13, lineHeight: 1.8,
          }}>
            <style>{`
              @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
              @keyframes termPulse { 0%,100%{opacity:1;box-shadow:0 0 4px #00bc7d} 50%{opacity:.4;box-shadow:none} }
            `}</style>
            {terminalLines.slice(0, visibleLines).map((line, i) => renderLine(line, i))}
            {visibleLines < terminalLines.length && (
              <span style={{
                display: 'inline-block', width: 8, height: 14,
                background: '#00bc7d', verticalAlign: 'middle', marginLeft: 2,
                animation: 'blink 1s step-end infinite',
              }} />
            )}
          </div>
        </div>

        {/* status bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '8px 18px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(0,0,0,0.2)',
          borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00bc7d', animation: 'termPulse 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>gate402 connected</span>
          </div>
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>solana devnet</span>
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>x402 protocol</span>
        </div>
      </div>

      {/* bottom fade */}
      <div style={{
        height: 120,
        background: 'linear-gradient(to bottom, transparent, #000)',
        marginTop: -120, position: 'relative', zIndex: 2, pointerEvents: 'none',
      }} />
    </div>
  )
}

/* ─── PAGE ROOT ──────────────────────────────────────────────────────────── */

/* SECTION: InstallSection */
const INSTALL_PANELS = [
  {
    badge: 'Provider Side',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M4 9l10-5 10 5-10 5L4 9z" stroke="#333" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M4 14l10 5 10-5" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M4 19l10 5 10-5" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'API Middleware',
    description: 'Monetize any Express, Fastify, or Python API. Three lines of middleware. Agents pay you in USDC.',
    command: 'npm install gate402',
  },
  {
    badge: 'Consumer Side',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="7" y="10" width="14" height="12" rx="3" stroke="#333" strokeWidth="1.5"/>
        <circle cx="11" cy="16" r="1.5" fill="#333"/>
        <circle cx="17" cy="16" r="1.5" fill="#333"/>
        <path d="M14 6v4M11 6h6" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Agent SDK',
    description: 'Add autonomous payment to any AI agent. Detects 402, pays, retries — zero human interaction.',
    command: 'npm install gate402-agent',
  },
  {
    badge: 'MCP Server — from scratch',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="6" width="20" height="16" rx="2" stroke="#333" strokeWidth="1.5"/>
        <path d="M8 12l4 3-4 3" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 18h4" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'MCP',
    description: 'Scaffold a new MCP server with Gate402 pre-configured. Per-tool pricing out of the box.',
    command: 'npx create-gate402-mcp',
  },
  {
    badge: 'Existing MCP Server',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 18v4M10 18h8" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="9" y="12" width="10" height="6" rx="1" stroke="#333" strokeWidth="1.5"/>
        <path d="M11 12V8M17 12V8" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Middleware',
    description: 'Add Gate402 billing to an MCP server you already have running. Drop-in middleware.',
    command: 'npm install gate402',
  },
]

function InstallSection() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  function handleCopy(text: string, index: number) {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div style={{ borderTop: '1px solid #1a1a1a', background: '#111111' }}>
      <div style={{ textAlign: 'center', padding: 'clamp(48px, 8vw, 80px) clamp(16px, 4vw, 32px) clamp(40px, 6vw, 64px)' }}>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 500, marginBottom: 12, lineHeight: 1.15, fontFamily: 'var(--font-space)' }}>
          <span style={{ color: '#fff' }}>Start building.</span>{' '}
          <span style={{ color: '#898989' }}>Pick your entry point.</span>
        </h2>
        <p style={{ fontSize: 16, color: '#898989', maxWidth: 480, margin: '0 auto', lineHeight: 1.65, fontFamily: 'var(--font-space)' }}>
          Whether you&apos;re monetizing an API, building an agent, or wiring up an MCP server — one package gets you there.
        </p>
      </div>
      <div style={{ borderTop: '1px solid #1a1a1a' }} />
      <div
        style={{ display: 'grid' }}
        className="install-grid"
      >
        <style>{`
          .install-grid { grid-template-columns: repeat(4, 1fr); }
          .install-panel { transition: background 200ms; border-right: 1px solid #1a1a1a; }
          .install-panel:last-child { border-right: none; }
          .install-panel:hover { background: rgba(255,255,255,0.015); }
          @media (max-width: 768px) {
            .install-grid { grid-template-columns: repeat(2, 1fr); }
            .install-panel:nth-child(even) { border-right: none; }
            .install-panel:nth-child(1), .install-panel:nth-child(2) { border-bottom: 1px solid #1a1a1a; }
          }
          @media (max-width: 480px) {
            .install-grid { grid-template-columns: 1fr; }
            .install-panel { border-right: none; border-bottom: 1px solid #1a1a1a; }
            .install-panel:last-child { border-bottom: none; }
          }
        `}</style>
        {INSTALL_PANELS.map((panel, i) => (
          <div
            key={i}
            className="install-panel"
            style={{
              padding: 'clamp(32px, 4vw, 48px) clamp(24px, 3vw, 40px)',
              position: 'relative',
            }}
          >
            {/* Badge */}
            <div style={{ display: 'inline-block', fontFamily: 'var(--font-mono, monospace)', fontSize: 10, color: '#444', letterSpacing: '0.12em', border: '1px solid #1a1a1a', borderRadius: 6, padding: '3px 8px', marginBottom: 32 }}>
              {panel.badge}
            </div>

            {/* Icon */}
            <div style={{ marginBottom: 16 }}>{panel.icon}</div>

            {/* Title */}
            <div style={{ fontSize: 18, fontWeight: 600, color: '#ffffff', marginBottom: 12 }}>
              {panel.title}
            </div>

            {/* Description */}
            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.7, marginBottom: 32 }}>
              {panel.description}
            </div>

            {/* Command */}
            <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12, color: '#00bc7d' }}>
                {panel.command}
              </span>
              <button
                onClick={() => handleCopy(panel.command, i)}
                style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, color: copiedIndex === i ? '#00bc7d' : '#444', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 150ms', padding: 0 }}
                onMouseEnter={e => { if (copiedIndex !== i) (e.currentTarget as HTMLButtonElement).style.color = '#888' }}
                onMouseLeave={e => { if (copiedIndex !== i) (e.currentTarget as HTMLButtonElement).style.color = '#444' }}
              >
                {copiedIndex === i ? 'Copied ✓' : 'copy'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BlurReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.08 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        animation: visible ? `blurReveal 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}ms both` : 'none',
      }}
    >
      {children}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div
      className=""
      style={{ background: '#111111', minHeight: '100vh', fontFamily: 'var(--font-space), sans-serif', overflowX: 'hidden' }}
    >
      <style>{CSS}</style>
      <InteractiveHero />
      <BlurReveal><WaitlistSection /></BlurReveal>
      <BlurReveal><div style={{ borderTop: '1px solid #222222', background: '#111111' }}><FeaturedSectionStats /></div></BlurReveal>
      <BlurReveal><div style={{ borderTop: '1px solid #222222', background: '#111111' }}><FeaturesGrid /></div></BlurReveal>


      <BlurReveal>
      <div style={{ textAlign: 'center', padding: 'clamp(48px, 8vw, 80px) clamp(16px, 4vw, 32px) 0', background: '#111111', borderTop: '1px solid #222222' }}>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 500, marginBottom: 12, lineHeight: 1.15, fontFamily: 'var(--font-space)' }}><span style={{ color: '#898989' }}>Three building blocks.</span> <span style={{ color: '#fff' }}>Infinite APIs.</span></h2>
        <p style={{ fontSize: 16, color: '#898989', maxWidth: 540, margin: '0 auto', lineHeight: 1.65, fontFamily: 'var(--font-space)' }}>Gate402 connects API providers, AI agents, and Solana settlement in one lightweight middleware layer.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 28 }}>
          <a href="/docs" className="btn-primary" style={{ fontFamily: 'var(--font-space)' }}>Read docs →</a>
          <a href="https://www.npmjs.com/package/gate402" target="_blank" rel="noreferrer" className="btn-ghost" style={{ fontFamily: 'var(--font-space)' }}>View on npm</a>
        </div>
      </div>
      </BlurReveal>
      <BlurReveal>
      <div className="min-h-[500px] w-full flex items-center justify-center p-4 sm:p-10" style={{ background: '#111111' }}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-5xl w-full">
          <SpotlightCard className="p-4 sm:p-8 h-full flex flex-col gap-4 sm:gap-8" spotlightColor="rgba(0,188,125,0.2)">
            <div className="h-10 w-10 flex items-center justify-center rounded-lg" style={{ background: "rgba(0,188,125,0.1)", border: "1px solid rgba(0,188,125,0.3)" }}>
              <Layers style={{ color: "#00bc7d", width: 20, height: 20 }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Drop-in middleware</h3>
              <p className="text-sm text-neutral-400">
                Add a paywall to any Express, Flask, or FastAPI endpoint in under five minutes. Your handlers don't change. Zero refactoring required.
              </p>
            </div>
          </SpotlightCard>
          <SpotlightCard className="p-4 sm:p-8 h-full flex flex-col gap-4 sm:gap-8" spotlightColor="rgba(0,188,125,0.2)">
            <div className="h-10 w-10 flex items-center justify-center rounded-lg" style={{ background: "rgba(0,188,125,0.1)", border: "1px solid rgba(0,188,125,0.3)" }}>
              <ShieldCheck style={{ color: "#00bc7d", width: 20, height: 20 }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Verified on-chain</h3>
              <p className="text-sm text-neutral-400">
                Every payment is verified against the Solana blockchain. Amount, recipient, and recency — all confirmed before your handler executes.
              </p>
            </div>
          </SpotlightCard>
          <SpotlightCard className="p-4 sm:p-8 h-full flex flex-col gap-4 sm:gap-8" spotlightColor="rgba(0,188,125,0.2)">
            <div className="h-10 w-10 flex items-center justify-center rounded-lg" style={{ background: "rgba(0,188,125,0.1)", border: "1px solid rgba(0,188,125,0.3)" }}>
              <Zap style={{ color: "#00bc7d", width: 20, height: 20 }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Built for micropayments</h3>
              <p className="text-sm text-neutral-400">
                $0.001 per call is viable on Solana. On Ethereum it would cost more in gas than the payment itself. The economics only work here.
              </p>
            </div>
          </SpotlightCard>
        </div>
      </div>
      </BlurReveal>
      <BlurReveal><div className="dark" style={{ borderTop: "1px solid #222222" }}>
        <Features7 />
      </div></BlurReveal>


      <BlurReveal>
      <div style={{ textAlign: 'center', padding: 'clamp(48px, 8vw, 80px) clamp(16px, 4vw, 32px) 0', background: '#111111', borderTop: '1px solid #222222' }}>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 500, marginBottom: 12, lineHeight: 1.15, fontFamily: 'var(--font-space)' }}><span style={{ color: '#fff' }}>Any stack.</span> <span style={{ color: '#898989' }}>Any language.</span></h2>
        <p style={{ fontSize: 16, color: '#898989', maxWidth: 540, margin: '0 auto', lineHeight: 1.65, fontFamily: 'var(--font-space)' }}>From Express to Python to Rust — drop Gate402 in without rewriting your business logic.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 28 }}>
          <a href="/auth/login" className="btn-primary" style={{ fontFamily: 'var(--font-space)' }}>Get started →</a>
          <a href="/docs#api-installation" className="btn-ghost" style={{ fontFamily: 'var(--font-space)' }}>View docs</a>
        </div>
      </div>
      </BlurReveal>
      <BlurReveal><BentoGrid /></BlurReveal>


      <BlurReveal>
      <div style={{ textAlign: 'center', padding: 'clamp(48px, 8vw, 80px) clamp(16px, 4vw, 32px) 0', background: '#111111', borderTop: '1px solid #222222' }}>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 500, marginBottom: 12, lineHeight: 1.15, fontFamily: 'var(--font-space)' }}><span style={{ color: '#898989' }}>From 402 to paid in</span> <span style={{ color: '#fff' }}>400ms.</span></h2>
        <p style={{ fontSize: 16, color: '#898989', maxWidth: 540, margin: '0 auto', lineHeight: 1.65, fontFamily: 'var(--font-space)' }}>Real-time payment flows for every role in the stack — provider, agent, and MCP server.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 28 }}>
          <a href="/auth/login" className="btn-primary" style={{ fontFamily: 'var(--font-space)' }}>Try for free →</a>
          <a href="/pricing" className="btn-ghost" style={{ fontFamily: 'var(--font-space)' }}>View pricing</a>
        </div>
      </div>
      </BlurReveal>
      <BlurReveal><RuixenSection /></BlurReveal>
      <BlurReveal><div style={{ borderTop: '1px solid #222222', background: '#111111' }}>
        <FAQSection
          title="FAQ"
          description="Everything you need to know about Gate402, the x402 protocol, and how AI agents pay for APIs."
          buttonLabel="Browse Docs →"
          onButtonClick={() => window.open('/docs', '_self')}
          faqsLeft={[
            { question: "Why can't I just use Stripe to charge AI agents?", answer: "Stripe requires a human cardholder, a billing address, and identity verification. An AI agent has none of these — it has a cryptographic keypair and a USDC balance. Gate402 uses the x402 protocol and Solana to enable payments between machines, with no human in the loop." },
            { question: "Where does my money actually go?", answer: "Directly to your Solana wallet. Gate402 never holds your funds, not even for a millisecond. Payments go on-chain from the agent's wallet to your wallet. We collect 1% as a platform fee in a separate transaction." },
            { question: "How do I test without spending real USDC?", answer: "Use demo mode. Any payment hash starting with demo_ bypasses blockchain verification entirely. This works in development and is automatically disabled when NODE_ENV=production is set. For more realistic testing, get free devnet USDC at faucet.circle.com." },
            { question: "Can I change my endpoint prices without redeploying my API?", answer: "Yes. In managed mode, prices are fetched from the dashboard and cached locally for 60 seconds. Change the price in gate402.dev and it propagates to all your instances within one minute — no redeploy, no downtime." },
            { question: "What if I already have an MCP server — do I need to rebuild it?", answer: "No. Install gate402, add gate402MCP() as middleware before your existing /mcp route, and configure your tool prices. Your tools stay exactly the same. tools/call gets charged, initialize and tools/list always pass through for free." },
          ]}
          faqsRight={[]}
        />
      </div></BlurReveal>
      <BlurReveal><InstallSection /></BlurReveal>
      <BlurReveal><FlickeringFooter /></BlurReveal>
    </div>
  )
}

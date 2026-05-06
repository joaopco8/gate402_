'use client'

import { useEffect, useState, useRef } from 'react'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'

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
    .how-grid { grid-template-columns: 1fr !important; }
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
        {['How it works', 'Docs', 'Pricing', 'GitHub'].map(link => (
          <a key={link} href="#" style={{
            fontSize: 14,
            color: '#666',
            fontFamily: 'var(--font-space)',
            transition: 'color 150ms',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#666'}
          >{link}</a>
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
    desc: 'npm install gate402. Wrap your Express app with one middleware. 3 lines of code.',
    snippet: "app.use(gate402({ ... }))",
  },
  {
    n: '02',
    title: 'Price',
    desc: 'Set USDC price per endpoint. Any amount. Change anytime. No approval needed.',
    snippet: "'/api/data': 0.005",
  },
  {
    n: '03',
    title: 'Collect',
    desc: 'Agents pay in USDC on Solana. 400ms confirmation. Funds go directly to your wallet.',
    snippet: "✓ 0.001 USDC confirmed",
  },
]

function HowItWorks() {
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

  const delays = ['0.1s', '0.3s', '0.5s']

  return (
    <section id="how" style={{ background: '#000', padding: '120px 32px', borderTop: '1px solid #1a1a1a' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* eyebrow */}
        <div className="mono" style={{ fontSize: 11, color: '#333', letterSpacing: '0.1em', marginBottom: 20 }}>
          HOW IT WORKS
        </div>

        {/* title */}
        <h2 style={{
          fontFamily: 'var(--font-space, sans-serif)',
          fontWeight: 300,
          fontSize: 48,
          letterSpacing: '-0.03em',
          color: '#fff',
          marginBottom: 72,
        }}>
          Drop in. Price it. Get paid.
        </h2>

        {/* connector line + steps */}
        <div ref={ref} style={{ position: 'relative' }}>
          {/* animated gradient connector */}
          <div className="how-connector" style={{
            position: 'absolute',
            top: 18,
            left: 24,
            right: 24,
            height: 1,
            background: 'linear-gradient(90deg, #00ff88, #9945FF)',
            zIndex: 0,
            width: visible ? undefined : 0,
            animation: visible ? 'lineGrow 1s ease-out forwards' : undefined,
          }} />

          <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, position: 'relative', zIndex: 1 }}>
            {HOW_STEPS.map(({ n, title, desc, snippet }, idx) => (
              <div
                key={n}
                style={{
                  opacity: visible ? undefined : 0,
                  animation: visible ? `cardReveal 0.6s ease-out ${delays[idx]} both` : undefined,
                }}
              >
                {/* step number with dot on connector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88', border: '1px solid #00ff88', flexShrink: 0, opacity: visible ? 1 : 0, transition: `opacity 0.4s ${delays[idx]}` }} />
                  <span className="mono" style={{ fontSize: 11, color: '#333', letterSpacing: '0.06em' }}>{n}</span>
                </div>

                <h3 style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 400, fontSize: 20, color: '#fff', marginBottom: 12 }}>
                  {title}
                </h3>

                <p style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 14, color: '#666', lineHeight: 1.7, marginBottom: 20 }}>
                  {desc}
                </p>

                {/* inline snippet */}
                <div className="mono" style={{
                  background: '#0d0d0d',
                  border: '1px solid #1a1a1a',
                  borderRadius: 6,
                  padding: '10px 14px',
                  fontSize: 12,
                  color: '#00ff88',
                }}>
                  {snippet}
                </div>
              </div>
            ))}
          </div>
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
    <section style={{ background: '#000', padding: '120px 0', borderTop: '1px solid #1a1a1a' }}>
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
const PLANS = [
  {
    badge: 'Free forever',
    price: '$0',
    sub: 'Self-hosted',
    features: ['Open source MIT', 'Unlimited API calls', 'x402 middleware', 'Solana integration', 'Community support'],
    cta: 'Get started →',
    primary: false,
    featured: false,
  },
  {
    badge: 'Most popular',
    price: '$99',
    priceSuffix: '/mo',
    sub: 'Hosted dashboard',
    features: ['Everything in Free', 'Hosted dashboard', 'Advanced analytics', 'Email alerts', 'Webhooks', 'Priority support'],
    cta: 'Start Pro →',
    primary: true,
    featured: true,
  },
  {
    badge: 'Enterprise',
    price: '0.5%',
    sub: 'On processed volume',
    features: ['Everything in Pro', 'Custom domain', 'SLA guarantee', 'Dedicated support', 'Custom integrations'],
    cta: 'Talk to us →',
    primary: false,
    featured: false,
  },
]

function Pricing() {
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

  const cardDelays = ['0s', '0.15s', '0.3s']

  return (
    <section id="pricing" style={{ background: '#000', padding: '120px 32px', borderTop: '1px solid #1a1a1a' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="mono" style={{ fontSize: 11, color: '#333', letterSpacing: '0.1em', marginBottom: 20, textAlign: 'center' }}>PRICING</div>
        <h2 style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 300, fontSize: 48, letterSpacing: '-0.03em', color: '#fff', marginBottom: 72, textAlign: 'center' }}>
          Free until you&apos;re making money.
        </h2>

        <div ref={ref} className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 900, margin: '0 auto' }}>
          {PLANS.map((plan, idx) => (
            <div key={plan.price} style={{
              background: '#0d0d0d',
              border: `1px solid ${plan.featured ? 'rgba(0,255,136,0.25)' : '#1a1a1a'}`,
              borderRadius: 8,
              padding: 28,
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              opacity: visible ? undefined : 0,
              animation: visible
                ? `cardReveal 0.5s ease-out ${cardDelays[idx]} both${plan.featured ? ', borderPulse 3s ease-in-out 0.5s infinite' : ''}`
                : undefined,
            }}>
              <span className="badge" style={{
                alignSelf: 'flex-start',
                marginBottom: 20,
                color: plan.featured ? '#00ff88' : '#666',
                borderColor: plan.featured ? '#00ff8830' : '#1a1a1a',
                background: plan.featured ? '#00ff8808' : 'transparent',
              }}>
                {plan.badge}
              </span>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-space, sans-serif)', fontWeight: 300, fontSize: 56, color: '#fff', letterSpacing: '-0.03em' }}>
                  {plan.price}
                </span>
                {plan.priceSuffix && (
                  <span style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 16, color: '#666' }}>{plan.priceSuffix}</span>
                )}
              </div>
              <div style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 13, color: '#666', marginBottom: 24 }}>{plan.sub}</div>

              <div style={{ height: 1, background: '#1a1a1a', marginBottom: 24 }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 28 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#00ff88', fontSize: 12, flexShrink: 0 }}>✓</span>
                    <span style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 13, color: '#888' }}>{f}</span>
                  </div>
                ))}
              </div>

              <a href="/login" className={plan.primary ? 'btn-primary' : 'btn-ghost'} style={{ textAlign: 'center', borderRadius: 6 }}>
                {plan.cta}
              </a>
            </div>
          ))}
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
            {[['GitHub', '#'], ['npm', '#'], ['Docs', '/docs'], ['Dashboard', '/']].map(([label, href]) => (
              <a key={label} href={href} style={{ fontFamily: 'var(--font-space, sans-serif)', fontSize: 13, color: '#666', transition: 'color 0.15s' }}
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
      <LiveFeed />
      <HowItWorks />
      <Features />
      <CodeSection />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  )
}

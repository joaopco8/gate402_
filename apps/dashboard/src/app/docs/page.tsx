'use client'
import { useState, useEffect } from 'react'

// ─── Breakpoints ──────────────────────────────────────────────────────────────
// mobile  : < 768
// tablet  : 768 – 1099
// desktop : >= 1100

function useWindowWidth() {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    setWidth(window.innerWidth)
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return width
}

// ─── Nav Data ─────────────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    group: 'Getting Started',
    items: [
      { label: 'Introduction', id: 'introduction' },
      { label: 'Quick Start', id: 'quick-start' },
      { label: 'Installation', id: 'quick-start' },
      { label: 'Configuration', id: 'configuration' },
    ],
  },
  {
    group: 'Core Concepts',
    items: [
      { label: 'How It Works', id: 'how-it-works' },
      { label: 'Payment Flow', id: 'payment-flow' },
      { label: 'x402 Protocol', id: 'x402-protocol' },
      { label: 'Solana & USDC', id: 'payment-flow' },
    ],
  },
  {
    group: 'Integrations',
    items: [
      { label: 'Express', id: 'quick-start' },
      { label: 'MCP Server', id: 'mcp-server' },
      { label: 'Claude Desktop', id: 'mcp-server' },
      { label: 'Agent Setup', id: 'mcp-server' },
    ],
  },
  {
    group: 'Dashboard',
    items: [
      { label: 'Overview', id: 'introduction' },
      { label: 'Wallet', id: 'payment-flow' },
      { label: 'Endpoints', id: 'configuration' },
      { label: 'Analytics', id: 'api-reference' },
    ],
  },
  {
    group: 'API Reference',
    items: [
      { label: 'Metrics', id: 'api-reference' },
      { label: 'Calls', id: 'api-reference' },
      { label: 'Endpoints API', id: 'api-reference' },
    ],
  },
  {
    group: 'Support',
    items: [
      { label: 'FAQ', id: 'faq' },
      { label: 'Troubleshooting', id: 'troubleshooting' },
      { label: 'Changelog', id: 'changelog' },
    ],
  },
]

const TOC_ITEMS = [
  { label: 'Introduction', id: 'introduction', level: 2 },
  { label: 'Quick Start', id: 'quick-start', level: 2 },
  { label: 'How It Works', id: 'how-it-works', level: 2 },
  { label: 'Payment Flow', id: 'payment-flow', level: 2 },
  { label: 'HTTP 402 Response', id: 'http-402', level: 3 },
  { label: 'x402-fetch', id: 'x402-fetch', level: 3 },
  { label: 'Demo Mode', id: 'demo-mode', level: 3 },
  { label: 'x402 Protocol', id: 'x402-protocol', level: 2 },
  { label: 'Configuration', id: 'configuration', level: 2 },
  { label: 'MCP Server', id: 'mcp-server', level: 2 },
  { label: 'API Reference', id: 'api-reference', level: 2 },
  { label: 'FAQ', id: 'faq', level: 2 },
  { label: 'Troubleshooting', id: 'troubleshooting', level: 2 },
  { label: 'Changelog', id: 'changelog', level: 2 },
]

const ALL_SECTION_IDS = [
  'introduction', 'quick-start', 'how-it-works', 'payment-flow',
  'http-402', 'x402-fetch', 'demo-mode', 'x402-protocol',
  'configuration', 'mcp-server', 'api-reference', 'faq',
  'troubleshooting', 'changelog',
]

const FAQ_ITEMS = [
  { q: 'Does Gate402 hold my funds?', a: 'No. Payments go directly from agent wallet to your Solana wallet. We only verify.' },
  { q: "What happens if the agent doesn't pay?", a: 'Gate402 returns HTTP 402. Your handler never executes. Zero unauthorized access.' },
  { q: 'Can I use Gate402 with frameworks other than Express?', a: 'Currently Express only. Next.js API routes and Fastify coming Q3 2026.' },
  { q: 'What is the x402 protocol?', a: 'HTTP 402 is a 30-year-old standard finally activated for payments. Backed by Google, Microsoft, Stripe.' },
  { q: 'Do agents need special software?', a: 'Any HTTP client works. For automatic payment, use x402-fetch.' },
  { q: 'What is USDC?', a: 'Stablecoin pegged 1:1 to USD. 0.001 USDC = $0.001. Settles on Solana in ~400ms.' },
  { q: "Devnet vs Mainnet — what's the difference?", a: 'Devnet uses fake USDC for testing. Mainnet uses real USDC.' },
  { q: 'How do I get my API key?', a: 'Sign in at gate402.dev with GitHub. Settings page shows your key.' },
  { q: 'Is Gate402 open source?', a: 'Core middleware is MIT licensed on GitHub. Dashboard is commercial.' },
  { q: 'What is the fee for using Gate402?', a: 'Free tier: self-hosted, no fee. Pro: $99/month. Enterprise: 0.5% of volume.' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      background: '#0d0d0d',
      border: '1px solid #1a1a1a',
      borderRadius: 6,
      overflow: 'hidden',
      marginTop: 12,
      marginBottom: 20,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 16px 0',
        fontFamily: 'var(--font-code)',
        fontSize: 11,
        color: '#333',
      }}>
        <span>{lang}</span>
        <button
          onClick={copy}
          style={{
            background: 'transparent',
            border: 'none',
            fontFamily: 'var(--font-code)',
            fontSize: 11,
            color: copied ? '#00ff88' : '#333',
            cursor: 'pointer',
            paddingBottom: 10,
            transition: 'color 0.15s',
          }}
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <pre style={{
        margin: 0,
        padding: '12px 16px 20px',
        fontFamily: 'var(--font-code)',
        fontSize: 13,
        lineHeight: 1.7,
        color: '#ccc',
        overflowX: 'auto',
        whiteSpace: 'pre',
        WebkitOverflowScrolling: 'touch',
      }}>
        {code}
      </pre>
    </div>
  )
}

function Callout({ color, children }: { color: 'green' | 'yellow'; children: React.ReactNode }) {
  const styles = {
    green: { bg: 'rgba(0,255,136,0.05)', border: 'rgba(0,255,136,0.2)' },
    yellow: { bg: 'rgba(245,158,11,0.05)', border: 'rgba(245,158,11,0.2)' },
  }
  return (
    <div style={{
      background: styles[color].bg,
      border: `1px solid ${styles[color].border}`,
      borderRadius: 6,
      padding: 16,
      fontSize: 14,
      lineHeight: 1.6,
      color: '#999',
      marginTop: 12,
      marginBottom: 16,
    }}>
      {children}
    </div>
  )
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{
          fontFamily: 'var(--font-code)',
          fontSize: 11,
          color: '#333',
          background: '#0d0d0d',
          border: '1px solid #1a1a1a',
          borderRadius: 4,
          padding: '2px 8px',
          flexShrink: 0,
        }}>{n}</span>
        <span style={{
          fontFamily: 'var(--font-space)',
          fontSize: 15,
          color: '#fff',
          fontWeight: 500,
        }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

// ─── Sidebar Nav (shared between fixed panel and mobile drawer) ───────────────

function SidebarNav({
  activeId,
  onNavigate,
}: {
  activeId: string
  onNavigate: (id: string) => void
}) {
  return (
    <>
      {NAV_GROUPS.map((group) => (
        <div key={group.group} style={{ marginBottom: 8 }}>
          <div style={{
            fontFamily: 'var(--font-code)',
            fontSize: 10,
            color: '#333',
            letterSpacing: '0.1em',
            padding: '8px 20px',
            textTransform: 'uppercase',
          }}>
            {group.group}
          </div>
          {group.items.map((item) => {
            const isActive = activeId === item.id
            return (
              <button
                key={item.label}
                onClick={() => onNavigate(item.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 20px',
                  fontFamily: 'var(--font-code)',
                  fontSize: 13,
                  color: isActive ? '#fff' : '#666',
                  background: isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                  border: 'none',
                  borderLeft: `2px solid ${isActive ? '#00ff88' : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#fff'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#666'
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      ))}
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const width = useWindowWidth()
  const [activeId, setActiveId] = useState('introduction')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const isMobile = width > 0 && width < 768
  const isTablet = width >= 768 && width < 1100
  const isDesktop = width >= 1100

  // Close mobile nav on resize to tablet/desktop
  useEffect(() => {
    if (!isMobile) setMobileNavOpen(false)
  }, [isMobile])

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileNavOpen])

  // IntersectionObserver for active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: '-56px 0px -70% 0px', threshold: 0 },
    )
    ALL_SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (isMobile) setMobileNavOpen(false)
  }

  // ── Layout measurements ──
  const sidebarW = 240
  const tocW = 200
  const mainML = (isMobile || width === 0) ? 0 : sidebarW
  const mainMR = isDesktop ? tocW : 0
  const mainPad = isMobile ? '32px 16px' : isTablet ? '40px 28px' : '48px 40px'

  // ── Shared style helpers ──
  const h2Style: React.CSSProperties = {
    fontFamily: 'var(--font-space)',
    fontWeight: 300,
    fontSize: isMobile ? 22 : 28,
    color: '#fff',
    borderBottom: '1px solid #1a1a1a',
    paddingBottom: 16,
    marginTop: isMobile ? 48 : 64,
    marginBottom: 24,
    scrollMarginTop: 80,
  }

  const h3Style: React.CSSProperties = {
    fontFamily: 'var(--font-space)',
    fontWeight: 400,
    fontSize: isMobile ? 16 : 18,
    color: '#fff',
    marginTop: 32,
    marginBottom: 12,
    scrollMarginTop: 80,
  }

  const pStyle: React.CSSProperties = {
    color: '#666',
    fontSize: isMobile ? 14 : 15,
    lineHeight: 1.8,
    marginBottom: 12,
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>

      {/* ── Header ── */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        zIndex: 50,
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1a1a1a',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Left: hamburger (mobile) + logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isMobile && (
            <button
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Toggle navigation"
              style={{
                background: 'transparent',
                border: '1px solid #1a1a1a',
                borderRadius: 4,
                padding: '6px 8px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                marginRight: 4,
              }}
            >
              {[0, 1, 2].map((i) => (
                <span key={i} style={{
                  display: 'block',
                  width: 16,
                  height: 1.5,
                  background: '#666',
                  borderRadius: 1,
                  transition: 'background 0.15s',
                }} />
              ))}
            </button>
          )}
          <a href="/" style={{
            fontFamily: 'var(--font-space)',
            fontWeight: 500,
            fontSize: 16,
            color: '#fff',
            textDecoration: 'none',
          }}>
            gate402
          </a>
          <span style={{
            fontFamily: 'var(--font-code)',
            fontSize: 11,
            color: '#333',
            background: '#0d0d0d',
            border: '1px solid #1a1a1a',
            padding: '2px 8px',
            borderRadius: 4,
          }}>
            docs
          </span>
        </div>

        {/* Right: links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 16 : 24 }}>
          <a
            href="https://github.com/joaopco8/gate402_"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: '#666', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
          >
            {isMobile ? 'GitHub' : 'GitHub ↗'}
          </a>
          {!isMobile && (
            <a
              href="/dashboard"
              style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: '#666', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
            >
              Dashboard →
            </a>
          )}
        </div>
      </header>

      {/* ── Mobile overlay ── */}
      {isMobile && mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 45,
            background: 'rgba(0,0,0,0.7)',
          }}
        />
      )}

      {/* ── Left Sidebar ── */}
      {/* Desktop/tablet: fixed panel | Mobile: slide-in drawer */}
      {(isTablet || isDesktop) && (
        <nav style={{
          position: 'fixed',
          left: 0,
          top: 56,
          width: sidebarW,
          height: 'calc(100vh - 56px)',
          overflowY: 'auto',
          background: '#000',
          borderRight: '1px solid #1a1a1a',
          padding: '24px 0',
          zIndex: 40,
        }}>
          <SidebarNav activeId={activeId} onNavigate={scrollTo} />
        </nav>
      )}

      {isMobile && (
        <nav style={{
          position: 'fixed',
          left: mobileNavOpen ? 0 : -280,
          top: 0,
          width: 280,
          height: '100vh',
          overflowY: 'auto',
          background: '#000',
          borderRight: '1px solid #1a1a1a',
          paddingTop: 72,
          paddingBottom: 24,
          zIndex: 46,
          transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: mobileNavOpen ? '4px 0 24px rgba(0,0,0,0.8)' : 'none',
        }}>
          <SidebarNav activeId={activeId} onNavigate={scrollTo} />
        </nav>
      )}

      {/* ── Right TOC — desktop only ── */}
      {isDesktop && (
        <aside style={{
          position: 'fixed',
          right: 0,
          top: 56,
          width: tocW,
          height: 'calc(100vh - 56px)',
          overflowY: 'auto',
          background: '#000',
          borderLeft: '1px solid #1a1a1a',
          padding: '24px 16px',
          zIndex: 40,
        }}>
          <div style={{
            fontFamily: 'var(--font-code)',
            fontSize: 11,
            color: '#333',
            letterSpacing: '0.1em',
            marginBottom: 12,
            textTransform: 'uppercase',
          }}>
            On This Page
          </div>
          {TOC_ITEMS.map((item) => {
            const isActive = activeId === item.id
            return (
              <button
                key={item.id + item.label}
                onClick={() => scrollTo(item.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  fontFamily: 'var(--font-code)',
                  fontSize: 11,
                  color: isActive ? '#00ff88' : '#333',
                  background: 'transparent',
                  border: 'none',
                  padding: `4px 0 4px ${item.level === 3 ? 12 : 0}px`,
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                  lineHeight: 1.5,
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#fff' }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = '#333' }}
              >
                {item.label}
              </button>
            )
          })}
        </aside>
      )}

      {/* ── Main Content ── */}
      <main style={{
        marginLeft: mainML,
        marginRight: mainMR,
        marginTop: 56,
        padding: mainPad,
        minWidth: 0,
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          {/* ══ Introduction ══ */}
          <section id="introduction">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
              {[
                { label: 'v0.1.0', bg: '#0d0d0d', border: '#1a1a1a', color: '#666' },
                { label: 'MIT', bg: '#0d0d0d', border: '#1a1a1a', color: '#666' },
                { label: 'Solana', bg: 'rgba(153,69,255,0.1)', border: 'rgba(153,69,255,0.3)', color: '#9945FF' },
                { label: 'x402', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', color: '#3b82f6' },
              ].map((b) => (
                <span key={b.label} style={{
                  fontFamily: 'var(--font-code)',
                  fontSize: 11,
                  background: b.bg,
                  border: `1px solid ${b.border}`,
                  color: b.color,
                  borderRadius: 4,
                  padding: '3px 10px',
                }}>
                  {b.label}
                </span>
              ))}
            </div>

            <h1 style={{
              fontFamily: 'var(--font-space)',
              fontWeight: 300,
              fontSize: isMobile ? 32 : 40,
              color: '#fff',
              marginBottom: 8,
              lineHeight: 1.1,
            }}>
              Gate402
            </h1>
            <p style={{ color: '#999', fontSize: 16, marginBottom: 0 }}>Last updated May 2026</p>
            <hr style={{ border: 'none', borderTop: '1px solid #1a1a1a', margin: '24px 0' }} />

            <p style={pStyle}>
              Gate402 is billing infrastructure for AI agents. Drop-in middleware that puts a paywall on any API using the x402 protocol. Agents pay in USDC on Solana. Settlement in 400ms. Real-time analytics dashboard included.
            </p>

            <p style={{ ...pStyle, color: '#fff', fontWeight: 500, marginTop: 24, fontSize: 15 }}>
              When to use Gate402:
            </p>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                'You have an MCP server and want to charge per call',
                'You have a specialized API consumed by AI agents',
                'You want to monetize tools without Stripe or banks',
                'You need machine-to-machine payments with no human in the loop',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: '#00ff88', fontFamily: 'var(--font-code)', fontSize: 14, marginTop: 2, flexShrink: 0 }}>→</span>
                  <span style={{ color: '#666', fontSize: isMobile ? 14 : 15, lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ══ Quick Start ══ */}
          <section id="quick-start">
            <h2 style={h2Style}>Quick Start</h2>
            <p style={pStyle}>Get Gate402 running in under 5 minutes.</p>

            <Callout color="green">
              ✓ Prerequisites: Node.js 18+, Express, a Solana wallet address
            </Callout>

            <Step n="1" title="Install">
              <CodeBlock lang="bash" code="npm install gate402" />
            </Step>

            <Step n="2" title="Add middleware">
              <CodeBlock lang="typescript" code={`import { gate402 } from 'gate402'
import express from 'express'

const app = express()

app.use(gate402({
  apiKey: 'your-api-key',        // from gate402.dev/settings
  walletAddress: 'your-wallet',  // Solana wallet to receive USDC
  endpoints: {
    '/api/data':    0.001,       // 0.001 USDC per call
    '/api/premium': 0.010,       // 0.010 USDC per call
  }
}))

app.get('/api/data', (req, res) => {
  res.json({ result: 'your data here' })
})

app.listen(3000)
console.log('Gate402 running on port 3000')`} />
            </Step>

            <Step n="3" title="Get credentials">
              <div style={{
                background: '#0d0d0d',
                border: '1px solid #1a1a1a',
                borderRadius: 6,
                padding: 20,
                marginTop: 12,
              }}>
                {[
                  '1. Sign in at gate402.dev with GitHub',
                  '2. Go to Settings',
                  '3. Copy your API Key and Solana wallet address',
                ].map((line) => (
                  <p key={line} style={{ color: '#666', fontSize: 14, lineHeight: 1.8, margin: 0 }}>{line}</p>
                ))}
                <a href="/settings" style={{ color: '#00ff88', fontSize: 14, display: 'block', marginTop: 12, textDecoration: 'none' }}>
                  Open Settings →
                </a>
              </div>
            </Step>

            <Step n="4" title="Test it">
              <CodeBlock lang="bash" code={`# Returns 402 — blocked
curl http://localhost:3000/api/data

# Returns data — paid (demo mode)
curl http://localhost:3000/api/data \\
  -H "X-Payment-Payload: demo_test_123"`} />
            </Step>
          </section>

          {/* ══ How It Works ══ */}
          <section id="how-it-works">
            <h2 style={h2Style}>How It Works</h2>

            <CodeBlock lang="ascii" code={`AI Agent              Gate402              Solana
    │                    │                    │
    │── GET /api/data ──▶│                    │
    │◀── HTTP 402 ────────│                    │
    │   price: 0.001 USDC│                    │
    │   payTo: 7UQc...   │                    │
    │                    │                    │
    │── send USDC ───────────────────────────▶│
    │◀─ confirmed 412ms ──────────────────────│
    │                    │                    │
    │── GET /api/data ──▶│                    │
    │  X-Payment: tx_... │                    │
    │                    │── verify on-chain ▶│
    │◀── 200 OK ──────────│◀─ confirmed ───────│`} />

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 12,
              marginTop: 24,
            }}>
              {[
                { n: '01', title: 'Intercept', desc: 'Gate402 intercepts every request before your handler' },
                { n: '02', title: 'Challenge', desc: 'Returns HTTP 402 with price and wallet address' },
                { n: '03', title: 'Verify', desc: 'Checks payment on Solana blockchain' },
                { n: '04', title: 'Release', desc: 'Grants access and logs the call' },
              ].map((card) => (
                <div key={card.n} style={{
                  background: '#0d0d0d',
                  border: '1px solid #1a1a1a',
                  borderRadius: 6,
                  padding: 20,
                }}>
                  <div style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: '#333', marginBottom: 8 }}>{card.n}</div>
                  <div style={{ fontFamily: 'var(--font-space)', fontWeight: 500, fontSize: 14, color: '#fff', marginBottom: 4 }}>{card.title}</div>
                  <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{card.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ══ Payment Flow ══ */}
          <section id="payment-flow">
            <h2 style={h2Style}>Payment Flow</h2>

            <h3 id="http-402" style={h3Style}>HTTP 402 Response</h3>
            <p style={pStyle}>When an agent calls without payment, Gate402 returns:</p>
            <CodeBlock lang="json" code={`{
  "error": "Payment Required",
  "price": {
    "amount": "0.001",
    "currency": "USDC",
    "network": "solana-devnet"
  },
  "payTo": "7UQctUWgfH87jjz9xjnCCKVY6Q1tMWZ8i1ZB3Whx939D",
  "endpoint": "/api/weather",
  "instructions": "Send USDC on Solana and include tx hash in X-Payment-Payload header"
}`} />

            <h3 id="x402-fetch" style={h3Style}>Paying with x402-fetch (recommended)</h3>
            <CodeBlock lang="typescript" code={`import { wrapFetch } from 'x402-fetch'
import { Keypair } from '@solana/web3.js'

const agentWallet = Keypair.fromSecretKey(yourSecretKey)

const fetch = wrapFetch({
  wallet: agentWallet,
  network: 'mainnet'
})

// Pays automatically when it receives 402
const data = await fetch('https://yourapi.dev/api/data')
console.log(data) // { result: '...' }`} />

            <h3 style={h3Style}>Manual payment</h3>
            <CodeBlock lang="bash" code={`# Send USDC on Solana, get tx hash
# Then include it in the header:
curl https://yourapi.dev/api/data \\
  -H "X-Payment-Payload: 5kWq9mLP3rT..."`} />

            <h3 id="demo-mode" style={h3Style}>Demo Mode</h3>
            <Callout color="yellow">
              In development, use hashes starting with{' '}
              <code style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: '#ccc' }}>demo_</code>{' '}
              to bypass blockchain verification. Demo mode is automatically disabled in production (NODE_ENV=production).
            </Callout>
            <CodeBlock lang="bash" code={`curl http://localhost:3000/api/data \\
  -H "X-Payment-Payload: demo_anything_here"`} />
          </section>

          {/* ══ x402 Protocol ══ */}
          <section id="x402-protocol">
            <h2 style={h2Style}>x402 Protocol</h2>
            <p style={pStyle}>
              HTTP 402 — Payment Required — is a status code that has existed since 1991.
              It was always designed for payments but never standardized. x402 changes that.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
              gap: 12,
              marginTop: 20,
            }}>
              {[
                { title: 'Standard', desc: 'Built on HTTP. Every API already speaks it.' },
                { title: 'Open', desc: 'No vendor lock-in. Any agent, any API.' },
                { title: 'Backed', desc: 'Google, Microsoft, Stripe are x402 Foundation members.' },
              ].map((card) => (
                <div key={card.title} style={{
                  background: '#0d0d0d',
                  border: '1px solid #1a1a1a',
                  borderRadius: 6,
                  padding: 20,
                }}>
                  <div style={{ fontFamily: 'var(--font-space)', fontWeight: 500, fontSize: 14, color: '#fff', marginBottom: 6 }}>{card.title}</div>
                  <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{card.desc}</div>
                </div>
              ))}
            </div>

            <a
              href="https://x402.org"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-block', marginTop: 20, color: '#00ff88', fontSize: 14, textDecoration: 'none' }}
            >
              Learn more about x402 →
            </a>
          </section>

          {/* ══ Configuration ══ */}
          <section id="configuration">
            <h2 style={h2Style}>Configuration</h2>

            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
                <thead>
                  <tr>
                    {['Option', 'Type', 'Required', 'Default', 'Description'].map((h) => (
                      <th key={h} style={{
                        fontFamily: 'var(--font-code)',
                        fontSize: 11,
                        color: '#333',
                        letterSpacing: '0.06em',
                        background: '#0d0d0d',
                        padding: '10px 12px',
                        textAlign: 'left',
                        borderBottom: '1px solid #1a1a1a',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { opt: 'apiKey', type: 'string', req: '✓', def: '—', desc: 'API key from gate402.dev/settings' },
                    { opt: 'walletAddress', type: 'string', req: '✓', def: '—', desc: 'Solana wallet to receive USDC' },
                    { opt: 'endpoints', type: 'object', req: '✓', def: '—', desc: 'Path → price in USDC mapping' },
                    { opt: 'network', type: "'devnet'|'mainnet'", req: '', def: "'devnet'", desc: 'Solana network' },
                    { opt: 'serverUrl', type: 'string', req: '', def: 'auto', desc: 'Gate402 server for verification' },
                  ].map((row) => (
                    <tr key={row.opt}>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #1a1a1a', color: '#fff', fontWeight: 500, fontFamily: 'var(--font-code)', fontSize: 12, whiteSpace: 'nowrap' }}>{row.opt}</td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #1a1a1a', color: '#666', fontSize: 12, fontFamily: 'var(--font-code)', whiteSpace: 'nowrap' }}>{row.type}</td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #1a1a1a', color: '#00ff88', fontSize: 12, fontFamily: 'var(--font-code)', textAlign: 'center' }}>{row.req}</td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #1a1a1a', color: '#666', fontSize: 12, fontFamily: 'var(--font-code)', whiteSpace: 'nowrap' }}>{row.def}</td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #1a1a1a', color: '#666', fontSize: 13 }}>{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <CodeBlock lang="typescript" code={`app.use(gate402({
  apiKey: 'gk_live_abc123',
  walletAddress: '7UQctUWgfH87jjz9xjnCCKVY6Q1tMWZ8i1ZB3Whx939D',
  network: 'mainnet',
  serverUrl: 'https://api.gate402.dev',
  endpoints: {
    '/api/weather':  0.001,
    '/api/analysis': 0.050,
    '/api/premium':  0.100,
  }
}))`} />
          </section>

          {/* ══ MCP Server ══ */}
          <section id="mcp-server">
            <h2 style={h2Style}>MCP Server Integration</h2>
            <p style={pStyle}>Gate402 works seamlessly with MCP servers for Claude Desktop and other AI agents.</p>

            <CodeBlock lang="typescript" code={`import express from 'express'
import { gate402 } from 'gate402'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'

const app = express()
app.use(express.json())

// Gate402 middleware — all MCP calls are gated
app.use(gate402({
  apiKey: process.env.GATE402_API_KEY!,
  walletAddress: process.env.SOLANA_WALLET!,
  endpoints: {
    '/mcp': 0.001,  // 0.001 USDC per MCP call
  }
}))

// Your MCP server
const server = new McpServer({ name: 'my-server', version: '1.0.0' })

server.tool('get_weather', { city: z.string() }, async ({ city }) => ({
  content: [{ type: 'text', text: \`Weather in \${city}: 28°C\` }]
}))

app.post('/mcp', async (req, res) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
  await server.connect(transport)
  await transport.handleRequest(req, res, req.body)
})

app.listen(3001)`} />

            <h3 id="claude-desktop" style={h3Style}>Claude Desktop config (~/.claude/claude_desktop_config.json):</h3>
            <CodeBlock lang="json" code={`{
  "mcpServers": {
    "my-gated-server": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "GATE402_API_KEY": "your-api-key",
        "SOLANA_WALLET": "your-wallet"
      }
    }
  }
}`} />
          </section>

          {/* ══ API Reference ══ */}
          <section id="api-reference">
            <h2 style={h2Style}>API Reference</h2>
            <p style={pStyle}>
              Base URL:{' '}
              <code style={{ fontFamily: 'var(--font-code)', fontSize: 13, color: '#ccc', wordBreak: 'break-all' }}>
                https://api.gate402.dev
              </code>
            </p>

            {[
              {
                method: 'GET', path: '/api/weather', desc: 'Demo endpoint (requires payment)',
                headers: 'X-Payment-Payload: <tx-hash>',
                response: '{ "city": "São Paulo", "temp": "28°C" }',
              },
              {
                method: 'GET', path: '/api/metrics', desc: 'Your API metrics',
                headers: 'Authorization: Bearer <api-key>',
                response: '{ "totalCalls": 142, "totalRevenue": "0.142", "uniqueCallers": 8 }',
              },
              {
                method: 'GET', path: '/api/calls/recent', desc: 'Recent calls feed',
                headers: 'Authorization: Bearer <api-key>',
                response: '[{ "id": "...", "endpoint": "/api/data", "amount": "0.001" }]',
              },
              {
                method: 'GET', path: '/api/calls/per-day', desc: 'Calls grouped by day',
                headers: 'Authorization: Bearer <api-key>',
                response: '[{ "date": "2026-05-08", "calls": 24, "revenue": "0.024" }]',
              },
              {
                method: 'GET', path: '/api/endpoints', desc: 'Your configured endpoints',
                headers: 'Authorization: Bearer <api-key>',
                response: '[{ "path": "/api/data", "price": "0.001", "calls": 42 }]',
              },
              {
                method: 'POST', path: '/api/endpoints', desc: 'Create new endpoint',
                headers: 'Authorization: Bearer <api-key>\nContent-Type: application/json',
                response: '{ "id": "...", "path": "/api/new", "price": "0.005" }',
              },
            ].map((ep) => (
              <div key={ep.path + ep.method} style={{
                background: '#0d0d0d',
                border: '1px solid #1a1a1a',
                borderRadius: 6,
                padding: isMobile ? 16 : 20,
                marginBottom: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'var(--font-code)',
                    fontSize: 11,
                    fontWeight: 500,
                    color: ep.method === 'GET' ? '#00ff88' : '#3b82f6',
                    background: ep.method === 'GET' ? 'rgba(0,255,136,0.1)' : 'rgba(59,130,246,0.1)',
                    border: `1px solid ${ep.method === 'GET' ? 'rgba(0,255,136,0.2)' : 'rgba(59,130,246,0.2)'}`,
                    borderRadius: 4,
                    padding: '2px 8px',
                    flexShrink: 0,
                  }}>{ep.method}</span>
                  <code style={{ fontFamily: 'var(--font-code)', fontSize: 13, color: '#ccc', wordBreak: 'break-all' }}>{ep.path}</code>
                </div>
                <p style={{ color: '#666', fontSize: 13, marginBottom: 10 }}>{ep.desc}</p>
                <div style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: '#333', marginBottom: 4 }}>Headers</div>
                <pre style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: '#666', margin: '0 0 8px', whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>{ep.headers}</pre>
                <div style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: '#333', marginBottom: 4 }}>Response</div>
                <pre style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: '#666', margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>{ep.response}</pre>
              </div>
            ))}
          </section>

          {/* ══ FAQ ══ */}
          <section id="faq">
            <h2 style={h2Style}>FAQ</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} style={{ border: '1px solid #1a1a1a', borderRadius: 6, overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      padding: isMobile ? '12px 16px' : '14px 20px',
                      background: openFaq === i ? '#0d0d0d' : 'transparent',
                      border: 'none',
                      color: '#fff',
                      fontSize: isMobile ? 13 : 14,
                      fontFamily: 'var(--font-space)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                      gap: 12,
                    }}
                  >
                    <span style={{ flex: 1 }}>{item.q}</span>
                    <span style={{ color: '#333', fontSize: 18, flexShrink: 0 }}>
                      {openFaq === i ? '−' : '+'}
                    </span>
                  </button>
                  {openFaq === i && (
                    <div style={{
                      padding: isMobile ? '0 16px 14px' : '0 20px 16px',
                      background: '#0d0d0d',
                      color: '#666',
                      fontSize: isMobile ? 13 : 14,
                      lineHeight: 1.7,
                    }}>
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ══ Troubleshooting ══ */}
          <section id="troubleshooting">
            <h2 style={h2Style}>Troubleshooting</h2>
            {[
              {
                error: "Can't reach database server",
                cause: 'DATABASE_URL incorreta ou IPv6 bloqueado',
                fix: 'Use Session Pooler URL do Supabase. Ative IPv6 no Railway.',
              },
              {
                error: 'No wallet found. Generated new wallet',
                cause: 'SOLANA_WALLET_PRIVATE_KEY não está sendo lida',
                fix: 'Verifique variáveis de ambiente. Re-set sem caracteres invisíveis.',
              },
              {
                error: 'Payment Required em todo request',
                cause: 'Endpoint não cadastrado no banco',
                fix: 'Acesse gate402.dev/endpoints e cadastre o path.',
              },
              {
                error: 'Could not connect to server. Is it running on localhost:3001?',
                cause: 'NEXT_PUBLIC_SERVER_URL apontando para localhost',
                fix: 'Atualize para https://api.gate402.dev na Vercel.',
              },
            ].map((item) => (
              <div key={item.error} style={{
                background: '#0d0d0d',
                border: '1px solid #1a1a1a',
                borderRadius: 6,
                padding: isMobile ? 16 : 20,
                marginBottom: 12,
              }}>
                <div style={{
                  fontFamily: 'var(--font-code)',
                  fontSize: isMobile ? 11 : 13,
                  color: '#ff4444',
                  background: 'rgba(255,68,68,0.05)',
                  border: '1px solid rgba(255,68,68,0.15)',
                  borderRadius: 4,
                  padding: '6px 12px',
                  display: 'inline-block',
                  marginBottom: 12,
                  wordBreak: 'break-word',
                  maxWidth: '100%',
                }}>
                  {item.error}
                </div>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: '#333', marginRight: 8 }}>CAUSE</span>
                  <span style={{ fontSize: 13, color: '#666' }}>{item.cause}</span>
                </div>
                <div>
                  <span style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: '#333', marginRight: 8 }}>FIX</span>
                  <span style={{ fontSize: 13, color: '#999' }}>{item.fix}</span>
                </div>
              </div>
            ))}
          </section>

          {/* ══ Changelog ══ */}
          <section id="changelog" style={{ paddingBottom: 80 }}>
            <h2 style={h2Style}>Changelog</h2>
            <div style={{
              fontFamily: 'var(--font-code)',
              fontSize: 12,
              color: '#fff',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}>
              <span>v0.1.0</span>
              <span style={{ color: '#333' }}>—</span>
              <span style={{ color: '#666' }}>May 2026</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'x402 middleware for Express',
                'Solana devnet payment verification',
                'Real-time dashboard with analytics',
                'GitHub OAuth with multi-tenant auth',
                'MCP server demo',
                'npm package published',
                'Demo mode for local development',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ color: '#00ff88', fontSize: 14, flexShrink: 0 }}>●</span>
                  <span style={{ color: '#666', fontSize: isMobile ? 13 : 14, lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #1a1a1a',
        padding: '24px',
        display: 'flex',
        justifyContent: 'center',
        gap: 24,
      }}>
        {[
          { label: 'Home', href: '/' },
          { label: 'Privacy', href: '/privacy' },
          { label: 'Terms', href: '/terms' },
          { label: 'GitHub', href: 'https://github.com/joaopco8/gate402_' },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            style={{ fontFamily: 'var(--font-code)', color: '#444', textDecoration: 'none', fontSize: 13, transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#888')}
            onMouseLeave={e => (e.currentTarget.style.color = '#444')}
          >
            {label}
          </a>
        ))}
      </footer>

    </div>
  )
}

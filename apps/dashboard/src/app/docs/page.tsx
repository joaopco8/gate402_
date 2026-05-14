'use client'
import { useState, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem = { label: string; id: string }
type NavGroup = { group: string; items: NavItem[] }

// ─── Nav Data ─────────────────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    group: 'GETTING STARTED',
    items: [
      { label: 'Introduction', id: 'introduction' },
      { label: 'How it works', id: 'how-it-works' },
      { label: 'Quick start', id: 'quick-start' },
      { label: 'Core concepts', id: 'core-concepts' },
    ],
  },
  {
    group: 'FOR API DEVELOPERS',
    items: [
      { label: 'Installation', id: 'api-installation' },
      { label: 'Basic setup', id: 'api-basic-setup' },
      { label: 'Endpoint pricing', id: 'endpoint-pricing' },
      { label: 'Managed mode', id: 'managed-mode' },
      { label: 'Token metering', id: 'token-metering' },
      { label: 'Compute metering', id: 'compute-metering' },
      { label: 'Webhooks', id: 'webhooks' },
      { label: 'Python SDK', id: 'python-sdk' },
    ],
  },
  {
    group: 'FOR AGENT OPERATORS',
    items: [
      { label: 'Installation', id: 'agent-installation' },
      { label: 'Spending limits', id: 'spending-limits' },
      { label: 'Demo fetch', id: 'demo-fetch' },
      { label: 'Getting USDC', id: 'getting-usdc' },
    ],
  },
  {
    group: 'FOR MCP DEVELOPERS',
    items: [
      { label: 'Add to existing MCP', id: 'mcp-existing' },
      { label: 'Build new MCP', id: 'mcp-new' },
      { label: 'Per-tool pricing', id: 'mcp-pricing' },
      { label: 'CLI generator', id: 'mcp-cli' },
    ],
  },
  {
    group: 'PLATFORM',
    items: [
      { label: 'Dashboard', id: 'platform-dashboard' },
      { label: 'Analytics', id: 'analytics' },
      { label: 'Wallet & payouts', id: 'wallet-payouts' },
    ],
  },
  {
    group: 'REFERENCE',
    items: [
      { label: 'API endpoints', id: 'api-reference' },
      { label: 'Error codes', id: 'error-codes' },
    ],
  },
]

const ALL_IDS = NAV_GROUPS.flatMap(g => g.items.map(i => i.id))

// ─── Components ───────────────────────────────────────────────────────────────

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div style={{
      background: '#0a0a0a',
      border: '1px solid #1a1a1a',
      borderRadius: 8,
      overflow: 'hidden',
      margin: '16px 0',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        borderBottom: '1px solid #1a1a1a',
        background: '#0d0d0d',
      }}>
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#444' }}>{lang}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          style={{ background: 'none', border: 'none', fontFamily: 'monospace', fontSize: 11, color: copied ? '#00ff88' : '#444', cursor: 'pointer' }}
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '20px', fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 13, lineHeight: 1.7, overflowX: 'auto', color: '#ccc' }}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

function Callout({ type = 'info', children }: { type?: 'info' | 'warning' | 'danger' | 'success'; children: React.ReactNode }) {
  const colors = {
    info:    { border: '#3b82f6', bg: 'rgba(59,130,246,0.05)', icon: 'ℹ' },
    warning: { border: '#f59e0b', bg: 'rgba(245,158,11,0.05)', icon: '⚠' },
    danger:  { border: '#ef4444', bg: 'rgba(239,68,68,0.05)',  icon: '✕' },
    success: { border: '#00ff88', bg: 'rgba(0,255,136,0.05)',  icon: '✓' },
  }
  const c = colors[type]
  return (
    <div style={{ borderLeft: `3px solid ${c.border}`, background: c.bg, borderRadius: '0 6px 6px 0', padding: '14px 18px', margin: '16px 0', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ color: c.border, fontSize: 14, flexShrink: 0 }}>{c.icon}</span>
      <div style={{ fontSize: 14, color: '#aaa', lineHeight: 1.6 }}>{children}</div>
    </div>
  )
}

function Terminal({ title = 'bash', lines }: {
  title?: string
  lines: Array<{ type: 'command' | 'output' | 'comment' | 'success' | 'error' | 'blank'; text: string }>
}) {
  const lineStyles: Record<string, React.CSSProperties> = {
    command: { color: '#fff', fontSize: 13, lineHeight: '22px' },
    output:  { color: '#666', fontSize: 13, lineHeight: '22px', paddingLeft: 16 },
    comment: { color: '#333', fontSize: 12, lineHeight: '22px', fontStyle: 'italic' },
    success: { color: '#00ff88', fontSize: 13, lineHeight: '22px' },
    error:   { color: '#ef4444', fontSize: 13, lineHeight: '22px' },
    blank:   { height: 8 },
  }
  const prefix: Record<string, string> = { command: '$ ', output: '', comment: '# ', success: '✓ ', error: '✗ ', blank: '' }
  return (
    <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 10, overflow: 'hidden', margin: '20px 0', fontFamily: "'JetBrains Mono', monospace" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderBottom: '1px solid #1a1a1a', background: '#0d0d0d' }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#00ff88' }} />
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#333', letterSpacing: '0.05em' }}>{title}</span>
      </div>
      <div style={{ padding: '16px 20px' }}>
        {lines.map((line, i) => (
          <div key={i} style={lineStyles[line.type]}>
            {line.type !== 'blank' && (
              <span style={{ color: line.type === 'command' ? '#00ff88' : 'inherit' }}>{prefix[line.type]}</span>
            )}
            {line.text}
          </div>
        ))}
      </div>
    </div>
  )
}

function PropTable({ rows }: {
  rows: Array<{ prop: string; type: string; required: boolean; default?: string; description: string }>
}) {
  return (
    <div style={{ border: '1px solid #1a1a1a', borderRadius: 8, overflow: 'hidden', margin: '16px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.5fr 1fr 2fr', background: '#0d0d0d', borderBottom: '1px solid #1a1a1a', padding: '8px 16px', gap: 16 }}>
        {['Property', 'Type', 'Req', 'Default', 'Description'].map(h => (
          <span key={h} style={{ fontFamily: 'monospace', fontSize: 10, color: '#333', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</span>
        ))}
      </div>
      {rows.map((row, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.5fr 1fr 2fr', padding: '12px 16px', gap: 16, borderBottom: i < rows.length - 1 ? '1px solid #111' : 'none', background: i % 2 === 0 ? '#0a0a0a' : '#0d0d0d', alignItems: 'start' }}>
          <code style={{ fontFamily: 'monospace', fontSize: 12, color: '#00ff88' }}>{row.prop}</code>
          <code style={{ fontFamily: 'monospace', fontSize: 11, color: '#9945FF' }}>{row.type}</code>
          <span style={{ fontSize: 12, color: row.required ? '#00ff88' : '#444' }}>{row.required ? 'Yes' : 'No'}</span>
          <code style={{ fontFamily: 'monospace', fontSize: 11, color: '#666' }}>{row.default || '—'}</code>
          <span style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>{row.description}</span>
        </div>
      ))}
    </div>
  )
}

function StepList({ steps }: { steps: Array<{ title: string; description: string | React.ReactNode }> }) {
  return (
    <div style={{ margin: '20px 0' }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', gap: 20, marginBottom: 32, alignItems: 'flex-start' }}>
          <div style={{ width: 32, height: 32, flexShrink: 0, border: '1px solid #1a1a1a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 11, color: '#00ff88', background: '#0a0a0a' }}>
            {String(i + 1).padStart(2, '0')}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#fff', marginBottom: 8 }}>{step.title}</div>
            <div style={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>{step.description}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Section heading helpers ──────────────────────────────────────────────────

const H2 = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <h2 id={id} style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 300, fontSize: 28, color: '#fff', borderBottom: '1px solid #1a1a1a', paddingBottom: 16, marginTop: 72, marginBottom: 24, scrollMarginTop: 24 }}>
    {children}
  </h2>
)

const H3 = ({ id, children }: { id?: string; children: React.ReactNode }) => (
  <h3 id={id} style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 400, fontSize: 18, color: '#fff', marginTop: 36, marginBottom: 12, scrollMarginTop: 24 }}>
    {children}
  </h3>
)

const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ color: '#666', fontSize: 15, lineHeight: 1.8, marginBottom: 12 }}>{children}</p>
)

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [activeId, setActiveId] = useState('introduction')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    setWidth(window.innerWidth)
    const h = () => setWidth(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => { for (const e of entries) { if (e.isIntersecting) setActiveId(e.target.id) } },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 },
    )
    ALL_IDS.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setSidebarOpen(false)
  }

  const isMobile = width > 0 && width < 900

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#000', fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* ── Mobile overlay ── */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.7)' }} />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        width: 260,
        flexShrink: 0,
        borderRight: '1px solid #1a1a1a',
        position: 'fixed',
        top: 0,
        left: isMobile ? (sidebarOpen ? 0 : -260) : 0,
        height: '100vh',
        overflowY: 'auto',
        padding: '24px 0',
        background: '#000',
        zIndex: 50,
        transition: isMobile ? 'left 0.25s cubic-bezier(0.4,0,0.2,1)' : 'none',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px', marginBottom: 8 }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, color: '#fff' }}>gate402</span>
            <span style={{ fontFamily: "monospace", fontSize: 10, color: '#444', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 3, padding: '2px 6px' }}>DOCS</span>
          </a>
        </div>

        {/* ← Home */}
        <div style={{ padding: '0 20px', marginBottom: 32 }}>
          <a href="/" style={{ fontFamily: 'monospace', fontSize: 12, color: '#444', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#888')}
            onMouseLeave={e => (e.currentTarget.style.color = '#444')}
          >
            ← Home
          </a>
        </div>

        {/* Nav groups */}
        {NAV_GROUPS.map(group => (
          <div key={group.group}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#333', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '24px 20px 8px' }}>
              {group.group}
            </div>
            {group.items.map(item => {
              const active = activeId === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '6px 20px',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 14,
                    color: active ? '#00ff88' : '#666',
                    background: active ? '#0a0a0a' : 'transparent',
                    border: 'none',
                    borderLeft: `2px solid ${active ? '#00ff88' : 'transparent'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#0a0a0a'; e.currentTarget.style.color = '#fff' } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#666' } }}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        ))}
      </aside>

      {/* ── Mobile header ── */}
      {isMobile && (
        <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 52, background: 'rgba(0,0,0,0.95)', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, zIndex: 30 }}>
          <button onClick={() => setSidebarOpen(v => !v)} style={{ background: 'none', border: '1px solid #1a1a1a', borderRadius: 4, padding: '6px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[0,1,2].map(i => <span key={i} style={{ display: 'block', width: 16, height: 1.5, background: '#666', borderRadius: 1 }} />)}
          </button>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, color: '#fff' }}>gate402</span>
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#444', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 3, padding: '2px 6px' }}>DOCS</span>
        </header>
      )}

      {/* ── Main ── */}
      <main style={{
        flex: 1,
        marginLeft: isMobile ? 0 : 260,
        marginTop: isMobile ? 52 : 0,
        minWidth: 0,
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: isMobile ? '32px 20px 80px' : '64px 64px 80px' }}>

          {/* ══ INTRODUCTION ══ */}
          <section id="introduction">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
              {[
                { label: 'v0.1.0', color: '#666', border: '#1a1a1a', bg: '#0d0d0d' },
                { label: 'MIT', color: '#666', border: '#1a1a1a', bg: '#0d0d0d' },
                { label: 'Solana', color: '#9945FF', border: 'rgba(153,69,255,0.3)', bg: 'rgba(153,69,255,0.08)' },
                { label: 'x402', color: '#3b82f6', border: 'rgba(59,130,246,0.3)', bg: 'rgba(59,130,246,0.08)' },
              ].map(b => (
                <span key={b.label} style={{ fontFamily: 'monospace', fontSize: 11, background: b.bg, border: `1px solid ${b.border}`, color: b.color, borderRadius: 4, padding: '3px 10px' }}>{b.label}</span>
              ))}
            </div>

            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 300, fontSize: isMobile ? 32 : 42, color: '#fff', marginBottom: 12, lineHeight: 1.1 }}>
              Gate402
            </h1>
            <P>Billing infrastructure for AI agents. Drop-in middleware that adds a paywall to any HTTP API or MCP server. Agents pay in USDC on Solana — no banks, no credit cards, no human intervention.</P>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 12, margin: '32px 0' }}>
              {[
                { pkg: 'gate402', label: 'For API Developers', desc: 'Add a paywall to any Express API' },
                { pkg: 'gate402-agent', label: 'For Agent Operators', desc: 'Pay APIs automatically on HTTP 402' },
                { pkg: 'create-gate402-mcp', label: 'For MCP Developers', desc: 'Monetize any MCP tool call' },
              ].map(card => (
                <div key={card.pkg} style={{ border: '1px solid #1a1a1a', borderRadius: 8, padding: 20, background: '#0a0a0a' }}>
                  <code style={{ fontSize: 12, color: '#00ff88', fontFamily: 'monospace' }}>npm install {card.pkg}</code>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginTop: 12 }}>{card.label}</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{card.desc}</div>
                </div>
              ))}
            </div>

            <Callout type="success">
              Gate402 is MIT licensed. The npm packages are free forever. The hosted platform at gate402.dev is the commercial offering.
            </Callout>
          </section>

          {/* ══ HOW IT WORKS ══ */}
          <H2 id="how-it-works">How it works</H2>
          <P>Every payment goes through 5 steps. Total time: under one second.</P>

          <Terminal title="payment flow" lines={[
            { type: 'comment', text: 'Step 1 — Agent calls your API' },
            { type: 'command', text: 'GET https://your-api.dev/api/data' },
            { type: 'blank', text: '' },
            { type: 'comment', text: 'Step 2 — Gate402 returns HTTP 402' },
            { type: 'output', text: 'HTTP/1.1 402 Payment Required' },
            { type: 'output', text: '{ "price": { "total": 0.001, "currency": "USDC" },' },
            { type: 'output', text: '  "splits": { "provider": "0.00099", "platform": "0.00001" },' },
            { type: 'output', text: '  "payTo": "DcL4mMaqX4FAHg4Cp1SstvMSMWytoXo93ktWycgGYABE" }' },
            { type: 'blank', text: '' },
            { type: 'comment', text: 'Step 3 — Agent sends USDC on Solana (~400ms)' },
            { type: 'success', text: 'Transaction confirmed: 5kWq9mLP3rTxHJzUvBnCs...' },
            { type: 'blank', text: '' },
            { type: 'comment', text: 'Step 4 — Agent retries with payment proof' },
            { type: 'command', text: 'GET https://your-api.dev/api/data' },
            { type: 'output', text: 'X-Payment-Payload: 5kWq9mLP3rTxHJzUvBnCs...' },
            { type: 'blank', text: '' },
            { type: 'comment', text: 'Step 5 — Gate402 verifies on-chain and releases' },
            { type: 'success', text: 'Payment verified ✓ — handler executing' },
            { type: 'output', text: 'HTTP/1.1 200 OK' },
            { type: 'output', text: '{ "data": "your response here" }' },
          ]} />

          {/* ══ QUICK START ══ */}
          <H2 id="quick-start">Quick start</H2>
          <P>5 minutes to your first paid API call.</P>

          <StepList steps={[
            {
              title: 'Create your account',
              description: <>
                <span>Sign in at gate402.dev with GitHub. Copy your API key from Settings.</span>
                <Terminal title="credentials" lines={[
                  { type: 'comment', text: 'Your API key looks like this:' },
                  { type: 'output', text: 'GATE402_API_KEY=7d40dc5a-c0a9-49ac-b87c-89af2267ba32' },
                ]} />
              </>,
            },
            {
              title: 'Install',
              description: <CodeBlock lang="bash" code="npm install gate402" />,
            },
            {
              title: 'Add middleware',
              description: <CodeBlock lang="typescript" code={`import { gate402 } from 'gate402'
import express from 'express'

const app = express()

app.use(gate402({
  apiKey: process.env.GATE402_API_KEY,
  serverUrl: 'https://api.gate402.dev',
  endpoints: {
    '/api/data': 0.001  // $0.001 per call
  }
}))

app.get('/api/data', (req, res) => {
  res.json({ message: 'You paid 0.001 USDC!' })
})

app.listen(3000)`} />,
            },
            {
              title: 'Test',
              description: <Terminal title="terminal" lines={[
                { type: 'comment', text: 'Without payment — returns 402' },
                { type: 'command', text: 'curl http://localhost:3000/api/data' },
                { type: 'error', text: '402 Payment Required' },
                { type: 'blank', text: '' },
                { type: 'comment', text: 'With demo payment — bypasses blockchain' },
                { type: 'command', text: 'curl http://localhost:3000/api/data \\' },
                { type: 'output', text: '  -H "X-Payment-Payload: demo_test_001"' },
                { type: 'success', text: '200 OK — { "message": "You paid 0.001 USDC!" }' },
              ]} />,
            },
            {
              title: 'Open dashboard',
              description: 'Go to gate402.dev/dashboard to see your calls in real time.',
            },
          ]} />

          {/* ══ CORE CONCEPTS ══ */}
          <H2 id="core-concepts">Core concepts</H2>

          <H3>x402 Protocol</H3>
          <P>HTTP 402 Payment Required is a status code defined in 1991. The x402 protocol defines how to use it for machine-to-machine payments. Backed by Google, Microsoft, Stripe, Coinbase, and Cloudflare.</P>

          <H3>Fee split</H3>
          <P>Every payment is automatically split. Gate402 never holds your funds.</P>
          <div style={{ border: '1px solid #1a1a1a', borderRadius: 8, overflow: 'hidden', margin: '16px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: '#0d0d0d', borderBottom: '1px solid #1a1a1a', padding: '8px 16px', gap: 16 }}>
              {['Payment', 'You receive (99%)', 'Gate402 (1%)'].map(h => (
                <span key={h} style={{ fontFamily: 'monospace', fontSize: 10, color: '#333', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</span>
              ))}
            </div>
            {[
              { pay: '0.001 USDC', you: '0.00099 USDC', fee: '0.00001 USDC' },
              { pay: '0.010 USDC', you: '0.00990 USDC', fee: '0.00010 USDC' },
              { pay: '1.000 USDC', you: '0.99000 USDC', fee: '0.01000 USDC' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '10px 16px', gap: 16, borderBottom: i < 2 ? '1px solid #111' : 'none', background: i % 2 === 0 ? '#0a0a0a' : '#0d0d0d' }}>
                <code style={{ fontFamily: 'monospace', fontSize: 12, color: '#ccc' }}>{r.pay}</code>
                <code style={{ fontFamily: 'monospace', fontSize: 12, color: '#00ff88' }}>{r.you}</code>
                <code style={{ fontFamily: 'monospace', fontSize: 12, color: '#444' }}>{r.fee}</code>
              </div>
            ))}
          </div>

          <H3>Demo mode</H3>
          <Terminal title="demo mode" lines={[
            { type: 'comment', text: 'Any hash starting with demo_ bypasses blockchain' },
            { type: 'command', text: 'curl /api/data -H "X-Payment-Payload: demo_any_string"' },
            { type: 'success', text: 'Works in development — blocked in production' },
          ]} />
          <Callout type="warning">
            Set NODE_ENV=production in your deployment to disable demo mode automatically.
          </Callout>

          {/* ══ FOR API DEVELOPERS ══ */}
          <H2 id="api-installation">Installation</H2>
          <H3>Requirements</H3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {['Node.js 18+', 'Express 4+ (or Flask/FastAPI)', 'Gate402 account at gate402.dev', 'Solana wallet (Phantom, Backpack, or any)'].map(item => (
              <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ color: '#00ff88', fontFamily: 'monospace', fontSize: 12 }}>→</span>
                <span style={{ color: '#666', fontSize: 14 }}>{item}</span>
              </div>
            ))}
          </div>
          <Terminal title="install" lines={[
            { type: 'comment', text: 'npm' },
            { type: 'command', text: 'npm install gate402' },
            { type: 'blank', text: '' },
            { type: 'comment', text: 'yarn' },
            { type: 'command', text: 'yarn add gate402' },
            { type: 'blank', text: '' },
            { type: 'comment', text: 'pnpm' },
            { type: 'command', text: 'pnpm add gate402' },
          ]} />

          <H2 id="api-basic-setup">Basic setup</H2>
          <CodeBlock lang="typescript" code={`import { gate402 } from 'gate402'
import express from 'express'

const app = express()

app.use(gate402({
  apiKey: process.env.GATE402_API_KEY,
  walletAddress: process.env.SOLANA_WALLET,  // optional — uses dashboard setting
  serverUrl: 'https://api.gate402.dev',
  network: 'devnet',   // 'devnet' | 'mainnet'
  endpoints: {
    '/api/search':    0.001,   // $0.001 per call
    '/api/analyze':   0.010,   // $0.010 per call
    '/api/generate':  0.050,   // $0.050 per call
  }
}))

// Your handlers don't change at all
app.get('/api/search', (req, res) => {
  res.json({ results: ['...'] })
})

app.listen(3000)`} />
          <PropTable rows={[
            { prop: 'apiKey', type: 'string', required: true, description: 'API key from gate402.dev/settings' },
            { prop: 'walletAddress', type: 'string', required: false, description: 'Solana wallet to receive USDC. Falls back to dashboard setting.' },
            { prop: 'serverUrl', type: 'string', required: true, description: 'Gate402 API URL for payment verification' },
            { prop: 'network', type: "'devnet' | 'mainnet'", required: false, default: "'devnet'", description: 'Solana network for on-chain verification' },
            { prop: 'endpoints', type: 'Record<string, number>', required: false, description: 'Map of URL paths to prices in USDC. Omit to use managed mode.' },
          ]} />

          <H2 id="endpoint-pricing">Endpoint pricing</H2>
          <P>Each entry in <code style={{ fontFamily: 'monospace', fontSize: 13, color: '#ccc', background: '#111', padding: '1px 6px', borderRadius: 4 }}>endpoints</code> maps a URL path to a price in USDC. Prices can be as low as 0.0001 USDC ($0.0001).</P>
          <CodeBlock lang="typescript" code={`app.use(gate402({
  apiKey: '...',
  walletAddress: '...',
  endpoints: {
    '/api/basic':    0.0001,  // $0.0001 — micro tier
    '/api/standard': 0.001,   // $0.001  — standard
    '/api/premium':  0.010,   // $0.01   — premium
    '/api/bulk':     0.100,   // $0.10   — bulk
  }
}))`} />
          <Callout type="info">Gate402 takes a 1% platform fee on each payment. The remaining 99% goes directly to your wallet. No monthly fees on the free tier.</Callout>

          <H2 id="managed-mode">Managed mode</H2>
          <P>Fetch prices from the dashboard automatically. Change prices without redeploying your API.</P>
          <CodeBlock lang="typescript" code={`// No endpoints config — everything fetched from dashboard
app.use(gate402({
  apiKey: process.env.GATE402_API_KEY,
  serverUrl: 'https://api.gate402.dev'
}))`} />
          <Callout type="info">
            Prices are cached with Redis for 60 seconds. Add endpoints at gate402.dev/dashboard → Endpoints.
          </Callout>

          <H2 id="token-metering">Token metering</H2>
          <P>For LLM-backed APIs, charge per output token instead of per request. Gate402 reads the response and calculates the charge dynamically.</P>
          <CodeBlock lang="typescript" code={`app.use(gate402({
  apiKey: '...',
  walletAddress: '...',
  metering: {
    type: 'tokens',
    pricePerToken: 0.000001,  // $0.000001 per token
    tokenField: 'usage.output_tokens',  // path in response JSON
  }
}))`} />

          <H2 id="compute-metering">Compute metering</H2>
          <P>Charge based on wall-clock execution time. Useful for compute-heavy endpoints like video processing or ML inference.</P>
          <CodeBlock lang="typescript" code={`app.use(gate402({
  apiKey: '...',
  walletAddress: '...',
  metering: {
    type: 'compute',
    pricePerSecond: 0.001,   // $0.001 per second
    minCharge: 0.0001,       // minimum charge
  }
}))`} />

          <H2 id="webhooks">Webhooks</H2>
          <P>Receive a webhook on every successful payment. Useful for logging, analytics, or triggering downstream workflows.</P>
          <CodeBlock lang="typescript" code={`app.use(gate402({
  apiKey: '...',
  walletAddress: '...',
  endpoints: { '/api/data': 0.001 },
  webhook: {
    url: 'https://your-server.com/webhook',
    secret: process.env.WEBHOOK_SECRET,
  }
}))

// Webhook payload (POST to your URL):
// {
//   event: 'payment.verified',
//   txHash: '5kWq...',
//   amount: 0.001,
//   endpoint: '/api/data',
//   callerIp: '1.2.3.4',
//   timestamp: '2026-05-14T12:00:00Z'
// }`} />

          <H2 id="python-sdk">Python SDK</H2>
          <Callout type="warning">Python SDK is in beta. Install with pip install gate402-py</Callout>
          <CodeBlock lang="python" code={`from gate402 import Gate402Middleware
from fastapi import FastAPI

app = FastAPI()

gate402 = Gate402Middleware(
    api_key=os.environ["GATE402_API_KEY"],
    wallet_address=os.environ["SOLANA_WALLET"],
    endpoints={
        "/api/data": 0.001,
        "/api/premium": 0.010,
    }
)

app.add_middleware(gate402)

@app.get("/api/data")
async def get_data():
    return {"result": "your data here"}`} />

          {/* ══ FOR AGENT OPERATORS ══ */}
          <H2 id="agent-installation">Agent installation</H2>
          <P>x402-fetch is a drop-in replacement for the native fetch that automatically handles 402 responses — paying the required amount and retrying the request.</P>
          <Terminal title="bash" lines={[
            { type: 'command', text: 'npm install x402-fetch @solana/web3.js' },
            { type: 'success', text: '+ x402-fetch@0.3.1' },
          ]} />
          <CodeBlock lang="typescript" code={`import { wrapFetch } from 'x402-fetch'
import { Keypair } from '@solana/web3.js'

// Load agent wallet from env
const secretKey = Uint8Array.from(JSON.parse(process.env.AGENT_WALLET_KEY!))
const agentWallet = Keypair.fromSecretKey(secretKey)

// Wrap fetch — payments are automatic
const fetch = wrapFetch({
  wallet: agentWallet,
  network: 'mainnet',
  maxAutoPayment: 0.01,  // never auto-pay more than $0.01 per call
})

// Call any Gate402-protected API
const res = await fetch('https://weather-api.example.com/api/weather')
const data = await res.json()
console.log(data)  // { city: 'São Paulo', temp: '28°C' }`} />

          <H2 id="spending-limits">Spending limits</H2>
          <P>Control how much your agent spends automatically. Exceeding limits requires explicit approval.</P>
          <CodeBlock lang="typescript" code={`const fetch = wrapFetch({
  wallet: agentWallet,
  network: 'mainnet',
  limits: {
    perRequest: 0.01,    // max $0.01 per single call
    perMinute:  0.10,    // max $0.10 per minute
    perHour:    1.00,    // max $1.00 per hour
    perDay:     5.00,    // max $5.00 per day
  },
  onLimitExceeded: (limit, amount) => {
    console.error(\`Limit \${limit} exceeded: \${amount} USDC\`)
    // throw, notify, or request approval
  }
})`} />

          <H2 id="demo-fetch">Demo fetch</H2>
          <P>For local development, use demo mode — no real USDC required. Any server running in development mode accepts <code style={{ fontFamily: 'monospace', fontSize: 13, color: '#ccc', background: '#111', padding: '1px 6px', borderRadius: 4 }}>demo_*</code> hashes.</P>
          <CodeBlock lang="typescript" code={`const fetch = wrapFetch({
  wallet: agentWallet,
  network: 'devnet',
  demoMode: true,       // use demo_ hashes instead of real txs
})

// Works against any Gate402 server in dev mode
const res = await fetch('http://localhost:3000/api/data')
`} />

          <H2 id="getting-usdc">Getting USDC</H2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginTop: 8 }}>
            {[
              { title: 'Devnet (free)', steps: ['Install Solana CLI', 'solana airdrop 2', 'Use devnet USDC faucet at spl-token-faucet.com'] },
              { title: 'Mainnet (real)', steps: ['Buy USDC on Coinbase or Kraken', 'Send to your Solana wallet', 'Bridge from Ethereum via Wormhole'] },
            ].map(c => (
              <div key={c.title} style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 12 }}>{c.title}</div>
                {c.steps.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#00ff88', flexShrink: 0, marginTop: 2 }}>{i + 1}.</span>
                    <span style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>{s}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* ══ FOR MCP DEVELOPERS ══ */}
          <H2 id="mcp-existing">Add to existing MCP</H2>
          <P>If you already have an MCP server, add Gate402 middleware in front of the HTTP transport. All tool calls are gated.</P>
          <CodeBlock lang="typescript" code={`import express from 'express'
import { gate402 } from 'gate402'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { z } from 'zod'

const app = express()
app.use(express.json())

// Gate402 — all MCP traffic gated at /mcp
app.use('/mcp', gate402({
  apiKey:        process.env.GATE402_API_KEY!,
  walletAddress: process.env.SOLANA_WALLET!,
  endpoints: { '/mcp': 0.001 }
}))

const server = new McpServer({ name: 'my-mcp', version: '1.0.0' })

server.tool('get_weather', { city: z.string() }, async ({ city }) => ({
  content: [{ type: 'text', text: \`Weather in \${city}: 28°C, sunny\` }]
}))

app.post('/mcp', async (req, res) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
  await server.connect(transport)
  await transport.handleRequest(req, res, req.body)
})

app.listen(3001, () => console.log('Gated MCP server on :3001'))`} />

          <H2 id="mcp-new">Build new MCP</H2>
          <P>Start from scratch with the Gate402 MCP template. Includes payment middleware, tool definitions, and dashboard integration.</P>
          <Terminal title="bash" lines={[
            { type: 'command', text: 'npx create-gate402-mcp my-mcp-server' },
            { type: 'output', text: 'Scaffolding MCP server with Gate402...' },
            { type: 'success', text: 'Created my-mcp-server/' },
            { type: 'blank', text: '' },
            { type: 'command', text: 'cd my-mcp-server && cp .env.example .env' },
            { type: 'command', text: 'npm install && npm run dev' },
            { type: 'success', text: 'Gate402 MCP server running on :3001' },
          ]} />

          <H2 id="mcp-pricing">Per-tool pricing</H2>
          <P>Charge different amounts per MCP tool by mapping tool names to prices. The middleware reads the tool name from the JSON-RPC request body.</P>
          <CodeBlock lang="typescript" code={`app.use('/mcp', gate402({
  apiKey:        process.env.GATE402_API_KEY!,
  walletAddress: process.env.SOLANA_WALLET!,
  mcpToolPricing: {
    'get_weather':         0.001,
    'run_analysis':        0.050,
    'generate_report':     0.100,
    '*':                   0.001,   // fallback for unlisted tools
  }
}))`} />

          <H2 id="mcp-cli">CLI generator</H2>
          <P>Generate a fully typed MCP tool definition with Gate402 pricing from a single command.</P>
          <Terminal title="bash" lines={[
            { type: 'command', text: 'npx gate402 generate-tool get_weather' },
            { type: 'output', text: 'Tool name: get_weather' },
            { type: 'output', text: 'Price (USDC): 0.001' },
            { type: 'output', text: 'Input schema (JSON): { "city": { "type": "string" } }' },
            { type: 'blank', text: '' },
            { type: 'success', text: 'Generated src/tools/get_weather.ts' },
            { type: 'success', text: 'Registered in src/index.ts' },
          ]} />

          {/* ══ PLATFORM ══ */}
          <H2 id="platform-dashboard">Dashboard</H2>
          <P>The Gate402 dashboard at gate402.dev gives you a real-time view of your API usage, revenue, and callers.</P>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10, marginTop: 8 }}>
            {[
              { title: 'Overview', desc: 'Total calls, revenue, unique callers, top endpoints' },
              { title: 'Live feed', desc: 'Real-time stream of every paid API call' },
              { title: 'Endpoints', desc: 'Create, edit, and toggle endpoint prices' },
              { title: 'Settings', desc: 'API key, wallet address, network selection' },
            ].map(c => (
              <div key={c.title} style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 8, padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 4 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>{c.desc}</div>
              </div>
            ))}
          </div>

          <H2 id="analytics">Analytics</H2>
          <P>Analytics are available at gate402.dev/dashboard. Metrics are updated in real-time as payments come in.</P>
          <CodeBlock lang="bash" code={`# Pull analytics via API
curl https://api.gate402.dev/api/metrics \\
  -H "Authorization: Bearer $GATE402_API_KEY"

# Response:
# {
#   "totalCalls":    142,
#   "totalRevenue":  "0.1420",
#   "uniqueCallers": 8,
#   "topEndpoint":   "/api/weather"
# }`} />

          <H2 id="wallet-payouts">Wallet & payouts</H2>
          <P>All payments land directly in your Solana wallet. There is no Gate402 escrow. You can withdraw or use USDC at any time through any Solana wallet (Phantom, Backpack, CLI).</P>
          <Callout type="info">Gate402 takes 1% of each payment as a platform fee, deducted at the time of the split — not from your wallet later. You always receive exactly 99% of the configured price.</Callout>

          {/* ══ REFERENCE ══ */}
          <H2 id="api-reference">API endpoints</H2>
          <P>Base URL: <code style={{ fontFamily: 'monospace', fontSize: 13, color: '#ccc' }}>https://api.gate402.dev</code></P>

          {[
            { method: 'GET', path: '/api/metrics', auth: true, desc: 'Total calls, revenue, unique callers', response: '{ totalCalls, totalRevenue, uniqueCallers, topEndpoint }' },
            { method: 'GET', path: '/api/calls/recent', auth: true, desc: 'Last 50 API calls', response: '[{ id, endpoint, amount, txHash, callerIp, createdAt }]' },
            { method: 'GET', path: '/api/calls/per-day', auth: true, desc: 'Calls grouped by day (last 30 days)', response: '[{ date, calls, revenue }]' },
            { method: 'GET', path: '/api/endpoints', auth: true, desc: 'Your configured endpoints', response: '[{ id, path, priceUsdc, active, calls }]' },
            { method: 'POST', path: '/api/endpoints', auth: true, desc: 'Create a new endpoint', response: '{ id, path, priceUsdc, active }' },
            { method: 'DELETE', path: '/api/endpoints/:id', auth: true, desc: 'Delete an endpoint', response: '{ success: true }' },
            { method: 'POST', path: '/api/verify-payment', auth: true, desc: 'Verify a Solana tx hash', response: '{ valid: boolean, amount, wallet }' },
            { method: 'GET', path: '/api/weather', auth: false, desc: 'Demo endpoint (requires 0.001 USDC payment)', response: '{ city, temp, humidity }' },
          ].map(ep => (
            <div key={ep.path + ep.method} style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 8, padding: 18, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600, color: ep.method === 'GET' ? '#00ff88' : ep.method === 'POST' ? '#3b82f6' : '#ef4444', background: ep.method === 'GET' ? 'rgba(0,255,136,0.1)' : ep.method === 'POST' ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${ep.method === 'GET' ? 'rgba(0,255,136,0.2)' : ep.method === 'POST' ? 'rgba(59,130,246,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 4, padding: '2px 8px', flexShrink: 0 }}>{ep.method}</span>
                <code style={{ fontFamily: 'monospace', fontSize: 13, color: '#ccc' }}>{ep.path}</code>
                {ep.auth && <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#9945FF', background: 'rgba(153,69,255,0.1)', border: '1px solid rgba(153,69,255,0.2)', borderRadius: 3, padding: '2px 6px' }}>Auth</span>}
              </div>
              <div style={{ fontSize: 13, color: '#555', marginBottom: 8 }}>{ep.desc}</div>
              <code style={{ fontFamily: 'monospace', fontSize: 12, color: '#444' }}>{ep.response}</code>
            </div>
          ))}

          <H2 id="error-codes">Error codes</H2>
          <div style={{ border: '1px solid #1a1a1a', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 120px 1fr', background: '#0d0d0d', borderBottom: '1px solid #1a1a1a', padding: '8px 16px', gap: 16 }}>
              {['HTTP', 'Code', 'Description'].map(h => (
                <span key={h} style={{ fontFamily: 'monospace', fontSize: 10, color: '#333', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</span>
              ))}
            </div>
            {[
              { status: 402, code: 'PAYMENT_REQUIRED', desc: 'No payment header. Response includes price and wallet.' },
              { status: 402, code: 'PAYMENT_ALREADY_USED', desc: 'This tx hash has already been consumed (anti-replay).' },
              { status: 402, code: 'PAYMENT_INVALID', desc: 'Tx not found on-chain or amount does not match.' },
              { status: 401, code: 'INVALID_API_KEY', desc: 'x-api-key header missing or not found in database.' },
              { status: 401, code: 'MISSING_API_KEY', desc: 'x-api-key header not present in request.' },
              { status: 502, code: 'UPSTREAM_UNAVAILABLE', desc: 'Origin API did not respond (managed mode only).' },
              { status: 500, code: 'INTERNAL_ERROR', desc: 'Unexpected error. Check server logs.' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 120px 1fr', padding: '12px 16px', gap: 16, borderBottom: i < 6 ? '1px solid #111' : 'none', background: i % 2 === 0 ? '#0a0a0a' : '#0d0d0d', alignItems: 'start' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 12, color: row.status === 402 ? '#f59e0b' : row.status === 401 ? '#ef4444' : '#ef4444' }}>{row.status}</span>
                <code style={{ fontFamily: 'monospace', fontSize: 11, color: '#00ff88' }}>{row.code}</code>
                <span style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>{row.desc}</span>
              </div>
            ))}
          </div>

          {/* Footer padding */}
          <div style={{ height: 64 }} />
        </div>
      </main>
    </div>
  )
}

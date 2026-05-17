'use client'
import { useState, useEffect, useRef } from 'react'

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
          style={{ background: 'none', border: 'none', fontFamily: 'monospace', fontSize: 11, color: copied ? '#00bc7d' : '#444', cursor: 'pointer' }}
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
    success: { border: '#00bc7d', bg: 'rgba(0,188,125,0.05)',  icon: '✓' },
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
    success: { color: '#00bc7d', fontSize: 13, lineHeight: '22px' },
    error:   { color: '#ef4444', fontSize: 13, lineHeight: '22px' },
    blank:   { height: 8 },
  }
  const prefix: Record<string, string> = { command: '$ ', output: '', comment: '# ', success: '✓ ', error: '✗ ', blank: '' }
  return (
    <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 10, overflow: 'hidden', margin: '20px 0', fontFamily: "'JetBrains Mono', monospace" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderBottom: '1px solid #1a1a1a', background: '#0d0d0d' }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#00bc7d' }} />
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#333', letterSpacing: '0.05em' }}>{title}</span>
      </div>
      <div style={{ padding: '16px 20px' }}>
        {lines.map((line, i) => (
          <div key={i} style={lineStyles[line.type]}>
            {line.type !== 'blank' && (
              <span style={{ color: line.type === 'command' ? '#00bc7d' : 'inherit' }}>{prefix[line.type]}</span>
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
          <code style={{ fontFamily: 'monospace', fontSize: 12, color: '#00bc7d' }}>{row.prop}</code>
          <code style={{ fontFamily: 'monospace', fontSize: 11, color: '#9945FF' }}>{row.type}</code>
          <span style={{ fontSize: 12, color: row.required ? '#00bc7d' : '#444' }}>{row.required ? 'Yes' : 'No'}</span>
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
          <div style={{ width: 32, height: 32, flexShrink: 0, border: '1px solid #1a1a1a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 11, color: '#00bc7d', background: '#0a0a0a' }}>
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
  <h2 id={id} style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: 'clamp(1.4rem, 2.5vw, 1.75rem)', color: '#fff', borderBottom: '1px solid #1a1a1a', paddingBottom: 16, marginTop: 72, marginBottom: 24, scrollMarginTop: 24, lineHeight: 1.2 }}>
    {children}
  </h2>
)

const H3 = ({ id, children }: { id?: string; children: React.ReactNode }) => (
  <h3 id={id} style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: 16, color: '#fff', marginTop: 36, marginBottom: 10, scrollMarginTop: 24, letterSpacing: '-0.01em' }}>
    {children}
  </h3>
)

const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ color: '#898989', fontSize: 15, lineHeight: 1.8, marginBottom: 12 }}>{children}</p>
)

// ─── Page ─────────────────────────────────────────────────────────────────────

function DocsSidebar({
  activeId, isMobile, sidebarOpen, setSidebarOpen, scrollTo,
}: {
  activeId: string
  isMobile: boolean
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
  scrollTo: (id: string) => void
}) {
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  const q = search.toLowerCase()
  const filtered = NAV_GROUPS.map(g => ({
    ...g,
    items: g.items.filter(i => !q || i.label.toLowerCase().includes(q)),
  })).filter(g => g.items.length > 0)

  return (
    <aside style={{
      width: 260,
      flexShrink: 0,
      borderRight: '1px solid #1a1a1a',
      position: 'fixed',
      top: 0,
      left: isMobile ? (sidebarOpen ? 0 : -260) : 0,
      height: '100vh',
      background: '#101010',
      zIndex: 50,
      transition: isMobile ? 'left 0.25s cubic-bezier(0.4,0,0.2,1)' : 'none',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* ── Header ── */}
      <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <img src="/logo-gate.png" alt="Gate402" style={{ height: 20, width: 'auto', display: 'block' }} />
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#444', background: '#111', border: '1px solid #1a1a1a', borderRadius: 3, padding: '2px 6px', letterSpacing: '0.06em' }}>DOCS</span>
        </a>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            width="13" height="13" viewBox="0 0 15 15" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="6.5" cy="6.5" r="4.5" /><path d="M10.5 10.5L13.5 13.5" />
          </svg>
          <input
            ref={inputRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search docs..."
            style={{
              width: '100%',
              background: '#111',
              border: '1px solid #222',
              borderRadius: 8,
              padding: '7px 10px 7px 30px',
              fontSize: 13,
              color: '#ccc',
              fontFamily: "'Space Grotesk', sans-serif",
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#333')}
            onBlur={e => (e.currentTarget.style.borderColor = '#222')}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 14, lineHeight: 1,
            }}>×</button>
          )}
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0 24px' }}>
        {/* ← Home link */}
        <div style={{ padding: '6px 16px 10px' }}>
          <a href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: 'monospace', fontSize: 12, color: '#444', textDecoration: 'none', transition: 'color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#888')}
            onMouseLeave={e => (e.currentTarget.style.color = '#444')}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 1L2 5.5 7 10" />
            </svg>
            Home
          </a>
        </div>

        {filtered.map(group => {
          const isCollapsed = collapsed[group.group]
          return (
            <div key={group.group} style={{ marginBottom: 4 }}>
              {/* Group header */}
              <button
                onClick={() => setCollapsed(c => ({ ...c, [group.group]: !c[group.group] }))}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '6px 16px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'monospace', fontSize: 10, color: '#444',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#888')}
                onMouseLeave={e => (e.currentTarget.style.color = '#444')}
              >
                <span>{group.group}</span>
                <svg
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                  style={{ transition: 'transform 0.2s', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', flexShrink: 0 }}
                >
                  <path d="M2 4l4 4 4-4" />
                </svg>
              </button>

              {/* Items */}
              {!isCollapsed && group.items.map(item => {
                const active = activeId === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', textAlign: 'left',
                      padding: '6px 16px 6px 20px',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 13,
                      color: active ? '#00bc7d' : '#666',
                      background: active ? 'rgba(0,188,125,0.05)' : 'transparent',
                      border: 'none',
                      borderLeft: `2px solid ${active ? '#00bc7d' : 'transparent'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      borderRadius: '0 6px 6px 0',
                      marginRight: 8,
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.background = '#1c1c1c'
                        e.currentTarget.style.color = '#ccc'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = '#666'
                      }
                    }}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div style={{ padding: '24px 16px', fontFamily: 'monospace', fontSize: 12, color: '#333', textAlign: 'center' }}>
            No results for "{search}"
          </div>
        )}
      </nav>

      {/* ── Footer ── */}
      <div style={{ borderTop: '1px solid #1a1a1a', padding: '12px 16px', flexShrink: 0 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#2a2a2a', letterSpacing: '0.06em' }}>gate402 · v0.1.0</span>
      </div>
    </aside>
  )
}

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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0D0D', fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* ── Mobile overlay ── */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.7)' }} />
      )}

      {/* ── Sidebar ── */}
      <DocsSidebar
        activeId={activeId}
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        scrollTo={scrollTo}
      />

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
        <div style={{ maxWidth: 1080, padding: isMobile ? '32px 20px 80px' : '64px clamp(32px, 5vw, 64px) 80px' }}>

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

            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: isMobile ? 36 : 52, color: '#fff', marginBottom: 12, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
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
                  <code style={{ fontSize: 12, color: '#00bc7d', fontFamily: 'monospace' }}>npm install {card.pkg}</code>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginTop: 12 }}>{card.label}</div>
                  <div style={{ fontSize: 12, color: '#898989', marginTop: 4 }}>{card.desc}</div>
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
                <code style={{ fontFamily: 'monospace', fontSize: 12, color: '#00bc7d' }}>{r.you}</code>
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
                <span style={{ color: '#00bc7d', fontFamily: 'monospace', fontSize: 12 }}>→</span>
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

          <H2 id="token-metering">Token Metering</H2>
          <P>Charge per token consumed. Ideal for LLM-powered APIs.</P>
          <CodeBlock lang="typescript" code={`import { gate402, tokenMeter } from 'gate402'

// 1. Charge minimum entry fee upfront
app.use('/api/chat', gate402({
  apiKey: process.env.GATE402_API_KEY,
  endpoints: { '/api/chat': 0.001 }
}))

// 2. Measure actual tokens after execution
app.use('/api/chat', tokenMeter({
  pricePerToken: 0.000001,   // $0.000001 per token
  serverUrl: 'https://api.gate402.dev',
  apiKey: process.env.GATE402_API_KEY,
  tokenCounter: (req, res) => res.locals.tokensUsed || 0
}))

app.post('/api/chat', async (req, res) => {
  const response = await callOpenAI(req.body.message)
  res.locals.tokensUsed = response.usage.total_tokens
  res.json({ reply: response.text })
  // _billing metadata automatically added to response
})`} />
          <H3>Response with billing metadata</H3>
          <CodeBlock lang="json" code={`{
  "reply": "Hello! How can I help?",
  "_billing": {
    "type": "token",
    "tokensUsed": 42,
    "pricePerToken": 0.000001,
    "totalCost": 0.000042,
    "currency": "USDC",
    "settleAt": "https://api.gate402.dev/api/metering/settle"
  }
}`} />

          <H2 id="compute-metering">Compute Metering</H2>
          <P>Charge per millisecond of execution. Ideal for heavy compute APIs.</P>
          <CodeBlock lang="typescript" code={`import { gate402, computeMeter } from 'gate402'

app.use('/api/process', gate402({
  apiKey: process.env.GATE402_API_KEY,
  endpoints: { '/api/process': 0.001 }
}))

app.use('/api/process', computeMeter({
  pricePerMs: 0.0000001,   // $0.0000001 per millisecond
  serverUrl: 'https://api.gate402.dev',
  apiKey: process.env.GATE402_API_KEY,
}))

app.post('/api/process', async (req, res) => {
  const result = await heavyComputation(req.body.data)
  res.json({ result })
  // _billing: { computeMs: 342, totalCost: 0.0000342 }
})`} />

          <H2 id="webhooks">Webhooks</H2>
          <P>Receive a POST request after each confirmed payment.</P>
          <H3>Setup</H3>
          <P>Go to gate402.dev/settings → Webhooks → Add URL</P>
          <H3>Payload</H3>
          <CodeBlock lang="json" code={`{
  "event": "payment.confirmed",
  "endpoint": "/api/data",
  "amount": 0.001,
  "currency": "USDC",
  "network": "devnet",
  "txHash": "5kWq9mLP3rTxHJzUvBnCs...",
  "payerWallet": "DcL4mMaqX4FAHg4Cp1SstvMSMWytoXo93ktWycgGYABE",
  "timestamp": "2026-05-14T12:00:00Z"
}`} />
          <H3>Verifying signatures</H3>
          <CodeBlock lang="typescript" code={`import crypto from 'crypto'

app.post('/webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const signature = req.headers['x-gate402-signature'] as string
    const secret = process.env.GATE402_WEBHOOK_SECRET

    const expected = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex')

    if (signature !== \`sha256=\${expected}\`) {
      return res.status(401).json({ error: 'Invalid signature' })
    }

    const event = req.body
    console.log('Payment:', event.amount, 'USDC from', event.payerWallet)

    res.json({ received: true })
  }
)`} />

          <H2 id="python-sdk">Python SDK</H2>
          <H3>Flask</H3>
          <CodeBlock lang="python" code={`from gate402 import gate402, Gate402Config
from flask import Flask, request, jsonify

app = Flask(__name__)
gw = gate402(Gate402Config(
    api_key='your-api-key',
    server_url='https://api.gate402.dev',
    endpoints={'/api/data': 0.001}
))

@app.before_request
def check_payment():
    return gw.handle_flask(request)

@app.route('/api/data')
def data():
    return jsonify({'result': 'you paid!'})`} />
          <H3>FastAPI</H3>
          <CodeBlock lang="python" code={`from gate402 import gate402, Gate402Config
from fastapi import FastAPI

app = FastAPI()
gw = gate402(Gate402Config(api_key='your-api-key'))
app.middleware('http')(gw.handle_fastapi)

@app.get('/api/data')
async def data():
    return {'result': 'you paid!'}`} />

          {/* ══ FOR AGENT OPERATORS ══ */}
          <H2 id="agent-installation">Installation</H2>
          <Terminal title="install" lines={[
            { type: 'command', text: 'npm install gate402-agent' },
          ]} />
          <H3>Basic usage</H3>
          <CodeBlock lang="typescript" code={`import { Gate402Agent } from 'gate402-agent'

const agent = new Gate402Agent({
  privateKey: process.env.AGENT_WALLET_PRIVATE_KEY,
  network: 'devnet',
  debug: true,
})

// Pays automatically on HTTP 402 — no extra code needed
const res = await agent.fetch('https://api.example.com/data')
const data = await res.json()

console.log(agent.getStats())
// {
//   totalCalls: 1,
//   successfulPayments: 1,
//   totalSpent: 0.001,
//   walletAddress: 'DcL4mMaq...'
// }`} />

          <H2 id="spending-limits">Spending Limits</H2>
          <P>Protect your agent from unexpected costs.</P>
          <CodeBlock lang="typescript" code={`const agent = new Gate402Agent({
  privateKey: process.env.AGENT_WALLET_PRIVATE_KEY,
  network: 'devnet',
  limits: {
    maxPerCall:  0.10,   // Max $0.10 per single call
    maxPerHour:  5.00,   // Max $5.00 per hour
    maxPerDay:  50.00,   // Max $50.00 per day
    blockedEndpoints: ['/api/premium'],
    allowedEndpoints: ['/api/search', '/api/analyze'],
  }
})`} />
          <H3>Handling errors</H3>
          <CodeBlock lang="typescript" code={`import { Gate402Agent, SpendingLimitError } from 'gate402-agent'

try {
  const res = await agent.fetch('https://api.example.com/expensive')
} catch (e) {
  if (e instanceof SpendingLimitError) {
    console.log('Blocked:', e.message)
    console.log('Code:', e.code)  // SPENDING_LIMIT_EXCEEDED
  }
}`} />

          <H2 id="demo-fetch">Demo Fetch</H2>
          <P>Test your integration without real USDC.</P>
          <CodeBlock lang="typescript" code={`// Uses demo_ hash — bypasses blockchain verification
const res = await agent.demoFetch('https://api.example.com/data')
const data = await res.json()`} />
          <Callout type="warning">
            demoFetch only works on APIs running in demo mode. Production APIs with NODE_ENV=production reject demo payments.
          </Callout>

          <H2 id="getting-usdc">Getting USDC</H2>
          <H3>Devnet (free, for testing)</H3>
          <StepList steps={[
            { title: 'Go to faucet.circle.com', description: 'Open the Circle USDC faucet in your browser.' },
            { title: 'Select "Solana Devnet"', description: 'Choose Solana Devnet from the network dropdown.' },
            { title: 'Paste your agent wallet address and click Send', description: 'Copy your wallet address from agent.getStats().walletAddress and paste it in the faucet.' },
          ]} />
          <Terminal title="devnet faucet" lines={[
            { type: 'comment', text: 'Get your agent wallet address' },
            { type: 'command', text: 'const agent = new Gate402Agent({ privateKey: "..." })' },
            { type: 'output', text: 'agent.getStats().walletAddress' },
            { type: 'success', text: 'DcL4mMaqX4FAHg4Cp1SstvMSMWytoXo93ktWycgGYABE' },
            { type: 'blank', text: '' },
            { type: 'comment', text: 'Then go to faucet.circle.com → Solana Devnet → paste address' },
            { type: 'success', text: 'You receive 10 USDC instantly — free' },
          ]} />
          <H3>Mainnet (production)</H3>
          <Callout type="warning">Mainnet uses real USDC. Always test on devnet first.</Callout>
          <StepList steps={[
            { title: 'Buy USDC on Coinbase, Kraken, or Binance', description: 'Purchase USDC on any major exchange.' },
            { title: 'Withdraw to your Solana wallet address', description: 'Send USDC to the Solana address from your Gate402Agent.' },
            { title: "Change network to 'mainnet' in agent config", description: "Set network: 'mainnet' in your Gate402Agent constructor." },
          ]} />

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
                <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600, color: ep.method === 'GET' ? '#00bc7d' : ep.method === 'POST' ? '#3b82f6' : '#ef4444', background: ep.method === 'GET' ? 'rgba(0,188,125,0.1)' : ep.method === 'POST' ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${ep.method === 'GET' ? 'rgba(0,188,125,0.2)' : ep.method === 'POST' ? 'rgba(59,130,246,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 4, padding: '2px 8px', flexShrink: 0 }}>{ep.method}</span>
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
                <code style={{ fontFamily: 'monospace', fontSize: 11, color: '#00bc7d' }}>{row.code}</code>
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

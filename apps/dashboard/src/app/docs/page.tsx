'use client'
import { useState, useEffect, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem = { label: string; id: string }
type NavGroup = { group: string; items: NavItem[] }

// ─── Nav Data ─────────────────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    group: 'Getting started',
    items: [
      { label: 'Introduction', id: 'introduction' },
      { label: 'How it works', id: 'how-it-works' },
      { label: 'Quick start', id: 'quick-start' },
      { label: 'Core concepts', id: 'core-concepts' },
    ],
  },
  {
    group: 'For API developers',
    items: [
      { label: 'Installation', id: 'api-installation' },
      { label: 'Basic setup', id: 'api-basic-setup' },
      { label: 'Going to mainnet', id: 'going-to-mainnet' },
      { label: 'Endpoint pricing', id: 'endpoint-pricing' },
      { label: 'Managed mode', id: 'managed-mode' },
      { label: 'Token metering', id: 'token-metering' },
      { label: 'Compute metering', id: 'compute-metering' },
      { label: 'Webhooks', id: 'webhooks' },
    ],
  },
  {
    group: 'For agent operators',
    items: [
      { label: 'Installation', id: 'agent-installation' },
      { label: 'Spending limits', id: 'spending-limits' },
      { label: 'Demo fetch', id: 'demo-fetch' },
      { label: 'Getting USDC', id: 'getting-usdc' },
    ],
  },
  {
    group: 'For MCP developers',
    items: [
      { label: 'Add to existing MCP', id: 'mcp-existing' },
      { label: 'Build new MCP', id: 'mcp-new' },
      { label: 'Per-tool pricing', id: 'mcp-pricing' },
      { label: 'CLI generator', id: 'mcp-cli' },
    ],
  },
  {
    group: 'Platform',
    items: [
      { label: 'Dashboard', id: 'platform-dashboard' },
      { label: 'Analytics', id: 'analytics' },
      { label: 'Wallet & payouts', id: 'wallet-payouts' },
      { label: 'API Key Management', id: 'api-key-management' },
    ],
  },
  {
    group: 'Reference',
    items: [
      { label: 'API endpoints', id: 'api-reference' },
      { label: 'Error codes', id: 'error-codes' },
      { label: 'Troubleshooting', id: 'troubleshooting' },
    ],
  },
]

const ALL_IDS = NAV_GROUPS.flatMap(g => g.items.map(i => i.id))

// ─── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:           '#171717',
  surface:      '#171717',
  card:         '#1f1f1f',
  border:       '#2a2a2a',
  borderHover:  '#333333',
  textPrimary:  '#f9fafb',
  textSecondary:'#9ca3af',
  textMuted:    '#6b7280',
  textFaint:    '#4b5563',
  green:        '#00bc7d',
  greenBg:      'rgba(0,188,125,0.08)',
  purple:       '#9945FF',
  blue:         '#3b82f6',
  font:         "var(--font-roboto), 'Roboto', system-ui, sans-serif",
  mono:         "'JetBrains Mono', 'Courier New', monospace",
  navH:         60,
  sideW:        260,
  tocW:         220,
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

function SearchModal({ onClose, scrollTo }: { onClose: () => void; scrollTo: (id: string) => void }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const q = query.toLowerCase()
  const results = q
    ? NAV_GROUPS.flatMap(g =>
        g.items
          .filter(i => i.label.toLowerCase().includes(q))
          .map(i => ({ ...i, group: g.group }))
      )
    : []

  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '18%', left: '50%', transform: 'translateX(-50%)',
        width: 560, maxWidth: 'calc(100vw - 32px)', zIndex: 201,
      }}>
        <div style={{
          background: '#1c1c1c', border: `1px solid #333`,
          borderRadius: 10, overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
        }}>
          {/* Input row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: `1px solid ${results.length > 0 || (q && results.length === 0) ? '#2a2a2a' : 'transparent'}` }}>
            <svg width="16" height="16" viewBox="0 0 15 15" fill="none" stroke={T.textMuted} strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
              <circle cx="6.5" cy="6.5" r="4.5" /><path d="M10.5 10.5L13.5 13.5" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search documentation..."
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                fontSize: 16, color: T.textPrimary, fontFamily: T.font,
              }}
            />
            {query ? (
              <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
            ) : (
              <kbd style={{ fontFamily: T.mono, fontSize: 11, color: T.textFaint, background: '#111', border: `1px solid #2a2a2a`, borderRadius: 4, padding: '2px 6px' }}>ESC</kbd>
            )}
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div style={{ maxHeight: 340, overflowY: 'auto', padding: '6px 0' }}>
              {results.map(item => (
                <button
                  key={item.id}
                  onClick={() => { scrollTo(item.id); onClose() }}
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                    padding: '9px 16px', fontFamily: T.font,
                    background: hovered === item.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                >
                  <span style={{ fontSize: 14, color: T.textPrimary }}>{item.label}</span>
                  <span style={{ fontSize: 11, color: T.textFaint, fontFamily: T.mono }}>{item.group}</span>
                </button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {q && results.length === 0 && (
            <div style={{ padding: '28px 16px', textAlign: 'center', fontFamily: T.font, fontSize: 14, color: T.textFaint }}>
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {/* Footer hint */}
          {!q && (
            <div style={{ padding: '10px 16px', borderTop: `1px solid #222`, display: 'flex', gap: 16 }}>
              {[['↵', 'select'], ['↑↓', 'navigate'], ['esc', 'close']].map(([key, label]) => (
                <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: T.mono, fontSize: 11, color: T.textFaint }}>
                  <kbd style={{ background: '#111', border: `1px solid #2a2a2a`, borderRadius: 4, padding: '1px 5px' }}>{key}</kbd>
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function DocsNavbar({
  onOpenSearch, onMenu, isMobile,
}: {
  onOpenSearch: () => void
  onMenu: () => void
  isMobile: boolean
}) {
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: T.navH,
      background: 'rgba(23,23,23,0.97)', backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${T.border}`, zIndex: 100,
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16,
    }}>
      {/* Left — Logo */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/logo-gate.png" alt="Gate402" style={{ height: 22, width: 'auto', display: 'block' }} />
          <span style={{
            fontFamily: T.mono, fontSize: 10, color: T.textMuted,
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 5, padding: '2px 6px', letterSpacing: '0.07em',
          }}>DOCS</span>
        </a>
      </div>

      {/* Center — Search trigger */}
      {!isMobile && (
        <button
          onClick={onOpenSearch}
          style={{
            width: 320, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8,
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 6,
            padding: '7px 12px', cursor: 'text', transition: 'border-color 0.15s',
            fontFamily: T.font,
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = T.borderHover)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
        >
          <svg width="13" height="13" viewBox="0 0 15 15" fill="none" stroke={T.textFaint} strokeWidth="1.5" strokeLinecap="round">
            <circle cx="6.5" cy="6.5" r="4.5" /><path d="M10.5 10.5L13.5 13.5" />
          </svg>
          <span style={{ flex: 1, textAlign: 'left', fontSize: 13, color: T.textFaint }}>Search docs...</span>
          <kbd style={{ fontFamily: T.mono, fontSize: 10, color: T.textFaint, background: '#111', border: `1px solid #2a2a2a`, borderRadius: 4, padding: '1px 5px' }}>⌘K</kbd>
        </button>
      )}

      {/* Right — Repo + Dashboard */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
        {!isMobile && (
          <a
            href="https://github.com/joaopco8/gate402_"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, color: T.textSecondary, textDecoration: 'none',
              padding: '5px 10px', borderRadius: 6, transition: 'all 0.15s',
              border: '1px solid transparent', fontFamily: T.font,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = T.textPrimary
              e.currentTarget.style.borderColor = T.border
              e.currentTarget.style.background = T.card
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = T.textSecondary
              e.currentTarget.style.borderColor = 'transparent'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Repository
          </a>
        )}

        {!isMobile && (
          <a
            href="/dashboard"
            style={{
              background: '#006239', border: '0.5px solid #128353',
              borderRadius: 6, padding: '8px 20px', fontSize: 13,
              fontFamily: T.font, fontWeight: 500, color: '#fff',
              textDecoration: 'none', transition: 'opacity 150ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Dashboard
          </a>
        )}

        {isMobile && (
          <button onClick={onMenu} style={{
            background: 'none', border: `1px solid ${T.border}`, borderRadius: 6,
            padding: '6px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column',
            gap: 4,
          }}>
            {[0,1,2].map(i => <span key={i} style={{ display: 'block', width: 16, height: 1.5, background: T.textSecondary, borderRadius: 6 }} />)}
          </button>
        )}
      </div>
    </header>
  )
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────

function DocsSidebar({
  activeId, isMobile, sidebarOpen, setSidebarOpen, scrollTo, search, setSearch,
}: {
  activeId: string
  isMobile: boolean
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
  scrollTo: (id: string) => void
  search: string
  setSearch: (v: string) => void
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const q = (search ?? '').toLowerCase()
  const filtered = NAV_GROUPS.map(g => ({
    ...g,
    items: g.items.filter(i => !q || i.label.toLowerCase().includes(q)),
  })).filter(g => g.items.length > 0)

  return (
    <aside style={{
      width: T.sideW,
      flexShrink: 0,
      borderRight: `1px solid ${T.border}`,
      position: 'fixed',
      top: isMobile ? 0 : T.navH,
      left: isMobile ? (sidebarOpen ? 0 : -T.sideW) : 0,
      height: isMobile ? '100vh' : `calc(100vh - ${T.navH}px)`,
      background: T.surface,
      zIndex: isMobile ? 50 : 10,
      transition: isMobile ? 'left 0.25s cubic-bezier(0.4,0,0.2,1)' : 'none',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Mobile top bar */}
      {isMobile && (
        <div style={{ padding: '16px 14px 12px', borderBottom: `1px solid ${T.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/logo-gate.png" alt="Gate402" style={{ height: 20, width: 'auto' }} />
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.textMuted, background: T.card, border: `1px solid ${T.border}`, borderRadius: 5, padding: '2px 6px' }}>DOCS</span>
          </a>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
        </div>
      )}

      {/* Back to home */}
      <div style={{ padding: '10px 12px 4px', flexShrink: 0 }}>
        <a href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: T.font, fontSize: 12, color: T.textMuted, textDecoration: 'none',
          padding: '4px 6px', borderRadius: 5, transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = T.textSecondary; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
          onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.background = 'transparent' }}
        >
          <svg width="10" height="10" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 1L2 5.5 7 10" />
          </svg>
          Home
        </a>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 0 24px' }}>
        {filtered.map(group => {
          const isCollapsed = collapsed[group.group]
          return (
            <div key={group.group} style={{ marginBottom: 2 }}>
              <button
                onClick={() => setCollapsed(c => ({ ...c, [group.group]: !c[group.group] }))}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '6px 14px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: T.font, fontSize: 13, color: T.textPrimary,
                  letterSpacing: 'normal', textTransform: 'none', fontWeight: 500,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = T.textSecondary)}
                onMouseLeave={e => (e.currentTarget.style.color = T.textPrimary)}
              >
                <span>{group.group}</span>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                  style={{ transition: 'transform 0.2s', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', flexShrink: 0 }}>
                  <path d="M2 4l4 4 4-4" />
                </svg>
              </button>

              {!isCollapsed && group.items.map(item => {
                const active = activeId === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    style={{
                      display: 'flex', alignItems: 'center',
                      width: '100%', textAlign: 'left',
                      padding: '6px 14px 6px 18px',
                      fontFamily: T.font, fontSize: 13,
                      color: active ? T.green : T.textMuted,
                      background: active ? T.greenBg : 'transparent',
                      border: 'none',
                      borderLeft: `2px solid ${active ? T.green : 'transparent'}`,
                      cursor: 'pointer',
                      transition: 'all 0.12s',
                      borderRadius: '0 6px 6px 0',
                      marginRight: 10,
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                        e.currentTarget.style.color = T.textSecondary
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = T.textMuted
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
          <div style={{ padding: '24px 14px', fontFamily: T.font, fontSize: 13, color: T.textMuted, textAlign: 'center' }}>
            No results for &ldquo;{search}&rdquo;
          </div>
        )}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${T.border}`, padding: '10px 14px', flexShrink: 0 }}>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.textFaint, letterSpacing: '0.06em' }}>gate402 · v0.1.0</span>
      </div>
    </aside>
  )
}

// ─── Table of Contents ─────────────────────────────────────────────────────────

function TableOfContents({ activeId, scrollTo }: { activeId: string; scrollTo: (id: string) => void }) {
  const activeGroup = NAV_GROUPS.find(g => g.items.some(i => i.id === activeId))
  if (!activeGroup) return null

  return (
    <aside style={{
      width: T.tocW,
      flexShrink: 0,
      position: 'fixed',
      top: T.navH,
      right: 0,
      height: `calc(100vh - ${T.navH}px)`,
      padding: '32px 20px 24px',
      overflowY: 'auto',
      zIndex: 5,
    }}>
      <div style={{ fontFamily: T.font, fontSize: 11, fontWeight: 600, color: T.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
        On this page
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {activeGroup.items.map(item => {
          const active = activeId === item.id
          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                padding: '4px 0', fontFamily: T.font, fontSize: 13,
                color: active ? T.green : T.textMuted,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = T.textSecondary }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = T.textMuted }}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </aside>
  )
}

// ─── Content components ────────────────────────────────────────────────────────

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div style={{ background: '#0a0a0a', border: `1px solid ${T.border}`, borderRadius: 6, overflow: 'hidden', margin: '14px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 14px', borderBottom: `1px solid ${T.border}`, background: T.card }}>
        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.textMuted }}>{lang}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          style={{ background: 'none', border: 'none', fontFamily: T.font, fontSize: 12, color: copied ? T.green : T.textMuted, cursor: 'pointer', transition: 'color 0.15s' }}
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '18px', fontFamily: T.mono, fontSize: 13, lineHeight: 1.7, overflowX: 'auto', color: '#d1d5db' }}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

function Callout({ type = 'info', children }: { type?: 'info' | 'warning' | 'danger' | 'success'; children: React.ReactNode }) {
  const colors = {
    info:    { border: T.blue,    bg: 'rgba(59,130,246,0.06)',  icon: 'ℹ' },
    warning: { border: '#f59e0b', bg: 'rgba(245,158,11,0.06)',  icon: '⚠' },
    danger:  { border: '#ef4444', bg: 'rgba(239,68,68,0.06)',   icon: '✕' },
    success: { border: T.green,   bg: 'rgba(0,188,125,0.06)',   icon: '✓' },
  }
  const c = colors[type]
  return (
    <div style={{ borderLeft: `3px solid ${c.border}`, background: c.bg, borderRadius: '0 6px 6px 0', padding: '12px 16px', margin: '14px 0', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ color: c.border, fontSize: 13, flexShrink: 0, marginTop: 1 }}>{c.icon}</span>
      <div style={{ fontSize: 14, color: T.textSecondary, lineHeight: 1.6, fontFamily: T.font }}>{children}</div>
    </div>
  )
}

function Terminal({ title = 'bash', lines }: {
  title?: string
  lines: Array<{ type: 'command' | 'output' | 'comment' | 'success' | 'error' | 'blank'; text: string }>
}) {
  const lineStyles: Record<string, React.CSSProperties> = {
    command: { color: '#f9fafb', fontSize: 13, lineHeight: '22px' },
    output:  { color: '#6b7280', fontSize: 13, lineHeight: '22px', paddingLeft: 16 },
    comment: { color: '#374151', fontSize: 12, lineHeight: '22px', fontStyle: 'italic' },
    success: { color: T.green,   fontSize: 13, lineHeight: '22px' },
    error:   { color: '#ef4444', fontSize: 13, lineHeight: '22px' },
    blank:   { height: 8 },
  }
  const prefix: Record<string, string> = { command: '$ ', output: '', comment: '# ', success: '✓ ', error: '✗ ', blank: '' }
  return (
    <div style={{ background: '#0a0a0a', border: `1px solid ${T.border}`, borderRadius: 6, overflow: 'hidden', margin: '16px 0', fontFamily: T.mono }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderBottom: `1px solid ${T.border}`, background: T.card }}>
        {['#ef4444','#f59e0b',T.green].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: T.textFaint, letterSpacing: '0.05em' }}>{title}</span>
      </div>
      <div style={{ padding: '14px 18px' }}>
        {lines.map((line, i) => (
          <div key={i} style={lineStyles[line.type]}>
            {line.type !== 'blank' && (
              <span style={{ color: line.type === 'command' ? T.green : 'inherit' }}>{prefix[line.type]}</span>
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
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 6, overflow: 'hidden', margin: '14px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.5fr 1fr 2fr', background: T.card, borderBottom: `1px solid ${T.border}`, padding: '8px 14px', gap: 14 }}>
        {['Property', 'Type', 'Req', 'Default', 'Description'].map(h => (
          <span key={h} style={{ fontFamily: T.mono, fontSize: 10, color: T.textFaint, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</span>
        ))}
      </div>
      {rows.map((row, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.5fr 1fr 2fr', padding: '10px 14px', gap: 14, borderBottom: i < rows.length - 1 ? '1px solid #111' : 'none', background: i % 2 === 0 ? '#0a0a0a' : T.card, alignItems: 'start' }}>
          <code style={{ fontFamily: T.mono, fontSize: 12, color: T.green }}>{row.prop}</code>
          <code style={{ fontFamily: T.mono, fontSize: 11, color: T.purple }}>{row.type}</code>
          <span style={{ fontSize: 12, color: row.required ? T.green : T.textMuted }}>{row.required ? 'Yes' : 'No'}</span>
          <code style={{ fontFamily: T.mono, fontSize: 11, color: T.textMuted }}>{row.default ?? '—'}</code>
          <span style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.5, fontFamily: T.font }}>{row.description}</span>
        </div>
      ))}
    </div>
  )
}

function StepList({ steps }: { steps: Array<{ title: string; description: string | React.ReactNode }> }) {
  return (
    <div style={{ margin: '16px 0' }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', gap: 18, marginBottom: 28, alignItems: 'flex-start' }}>
          <div style={{ width: 28, height: 28, flexShrink: 0, border: `1px solid ${T.border}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.mono, fontSize: 11, color: T.green, background: '#0a0a0a' }}>
            {String(i + 1).padStart(2, '0')}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: T.textPrimary, marginBottom: 6, fontFamily: T.font }}>{step.title}</div>
            <div style={{ fontSize: 14, color: T.textSecondary, lineHeight: 1.7, fontFamily: T.font }}>{step.description}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Section headings ──────────────────────────────────────────────────────────

const H2 = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <h2 id={id} style={{ fontFamily: T.font, fontWeight: 600, fontSize: 22, color: T.textPrimary, borderBottom: `1px solid ${T.border}`, paddingBottom: 12, marginTop: 64, marginBottom: 20, scrollMarginTop: 80, lineHeight: 1.2 }}>
    {children}
  </h2>
)

const H3 = ({ id, children }: { id?: string; children: React.ReactNode }) => (
  <h3 id={id} style={{ fontFamily: T.font, fontWeight: 600, fontSize: 15, color: T.textPrimary, marginTop: 28, marginBottom: 8, scrollMarginTop: 80 }}>
    {children}
  </h3>
)

const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ color: T.textSecondary, fontSize: 14, lineHeight: 1.8, marginBottom: 12, fontFamily: T.font }}>{children}</p>
)

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [activeId, setActiveId] = useState('introduction')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [width, setWidth] = useState(0)
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    setWidth(window.innerWidth)
    const h = () => setWidth(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
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
  const showToc = width >= 1280

  return (
    <>
      <div style={{ display: 'flex', minHeight: '100vh', background: T.bg, fontFamily: T.font }}>

        {/* Navbar */}
        <DocsNavbar onOpenSearch={() => setSearchOpen(true)} onMenu={() => setSidebarOpen(v => !v)} isMobile={isMobile} />

        {/* Search modal */}
        {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} scrollTo={scrollTo} />}

        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.7)' }} />
        )}

        {/* Sidebar */}
        <DocsSidebar
          activeId={activeId}
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          scrollTo={scrollTo}
          search={search}
          setSearch={setSearch}
        />

        {/* TOC */}
        {showToc && <TableOfContents activeId={activeId} scrollTo={scrollTo} />}

        {/* Main */}
        <main style={{
          flex: 1,
          marginLeft: isMobile ? 0 : T.sideW,
          marginTop: T.navH,
          marginRight: showToc ? T.tocW : 0,
          minWidth: 0,
        }}>
          <div style={{ maxWidth: 920, padding: isMobile ? '32px 20px 80px' : '52px clamp(32px, 5vw, 64px) 80px', margin: '0 auto' }}>

            {/* ══ INTRODUCTION ══ */}
            <section id="introduction">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
                {[
                  { label: 'v0.1.0', color: T.textMuted, border: T.border,                    bg: T.card },
                  { label: 'MIT',    color: T.textMuted, border: T.border,                    bg: T.card },
                  { label: 'Solana', color: T.purple,    border: 'rgba(153,69,255,0.3)',       bg: 'rgba(153,69,255,0.08)' },
                  { label: 'x402',   color: T.blue,      border: 'rgba(59,130,246,0.3)',       bg: 'rgba(59,130,246,0.08)' },
                ].map(b => (
                  <span key={b.label} style={{ fontFamily: T.mono, fontSize: 11, background: b.bg, border: `1px solid ${b.border}`, color: b.color, borderRadius: 5, padding: '3px 8px' }}>{b.label}</span>
                ))}
              </div>

              <h1 style={{ fontFamily: T.font, fontWeight: 700, fontSize: isMobile ? 32 : 44, color: T.textPrimary, marginBottom: 10, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                Gate402
              </h1>
              <P>Billing infrastructure for AI agents. Drop-in middleware that adds a paywall to any HTTP API or MCP server. Agents pay in USDC on Solana — no banks, no credit cards, no human intervention.</P>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 10, margin: '28px 0' }}>
                {[
                  { pkg: 'gate402',             label: 'For API Developers',   desc: 'Add a paywall to any Express API' },
                  { pkg: 'gate402-agent',        label: 'For Agent Operators',  desc: 'Pay APIs automatically on HTTP 402' },
                  { pkg: 'create-gate402-mcp',   label: 'For MCP Developers',   desc: 'Monetize any MCP tool call' },
                ].map(card => (
                  <div key={card.pkg} style={{ border: `1px solid ${T.border}`, borderRadius: 6, padding: 18, background: T.card, transition: 'border-color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = T.borderHover)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
                  >
                    <code style={{ fontSize: 12, color: T.green, fontFamily: T.mono }}>npm install {card.pkg}</code>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, marginTop: 10, fontFamily: T.font }}>{card.label}</div>
                    <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4, fontFamily: T.font }}>{card.desc}</div>
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
              { type: 'blank',   text: '' },
              { type: 'comment', text: 'Step 2 — Gate402 returns HTTP 402' },
              { type: 'output',  text: 'HTTP/1.1 402 Payment Required' },
              { type: 'output',  text: '{ "price": { "total": 0.001, "currency": "USDC", "network": "solana-mainnet" },' },
              { type: 'output',  text: '  "splits": { "provider": { "wallet": "YOUR_WALLET", "amount": 0.001 } },' },
              { type: 'output',  text: '  "endpoint": "/api/data", "instructions": "Send USDC on Solana and include tx hash in X-Payment-Payload" }' },
              { type: 'blank',   text: '' },
              { type: 'comment', text: 'Step 3 — Agent sends USDC on Solana (~400ms)' },
              { type: 'success', text: 'Transaction confirmed: 5kWq9mLP3rTxHJzUvBnCs...' },
              { type: 'blank',   text: '' },
              { type: 'comment', text: 'Step 4 — Agent retries with payment proof' },
              { type: 'command', text: 'GET https://your-api.dev/api/data' },
              { type: 'output',  text: 'X-Payment-Payload: 5kWq9mLP3rTxHJzUvBnCs...' },
              { type: 'blank',   text: '' },
              { type: 'comment', text: 'Step 5 — Gate402 verifies on-chain and releases' },
              { type: 'success', text: 'Payment verified ✓ — handler executing' },
              { type: 'output',  text: 'HTTP/1.1 200 OK' },
              { type: 'output',  text: '{ "data": "your response here" }' },
            ]} />

            {/* ══ QUICK START ══ */}
            <H2 id="quick-start">Quick start</H2>
            <P>6 steps to your first paid API call — no credit card, no bank account.</P>
            <StepList steps={[
              {
                title: 'Create account',
                description: <>
                  <span>Sign in at gate402.dev with GitHub or email. Copy your API key from Settings → API Key.</span>
                  <Terminal title="credentials" lines={[
                    { type: 'comment', text: 'Your API key looks like this:' },
                    { type: 'output',  text: 'GATE402_API_KEY=7d40dc5a-c0a9-49ac-b87c-89af2267ba32' },
                  ]} />
                </>,
              },
              {
                title: 'Install',
                description: <CodeBlock lang="bash" code="npm install gate402" />,
              },
              {
                title: 'Add 3 lines to your Express app',
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

// Your existing handlers don't change
app.get('/api/data', (req, res) => {
  res.json({ message: 'You paid 0.001 USDC!' })
})

app.listen(3000)`} />,
              },
              {
                title: 'Test in devnet (no real money)',
                description: <Terminal title="terminal" lines={[
                  { type: 'comment', text: 'Without payment — returns 402' },
                  { type: 'command', text: 'curl http://localhost:3000/api/data' },
                  { type: 'error',   text: '402 Payment Required' },
                  { type: 'blank',   text: '' },
                  { type: 'comment', text: 'With demo payment — works instantly, no blockchain' },
                  { type: 'command', text: 'curl http://localhost:3000/api/data \\' },
                  { type: 'output',  text: '  -H "X-Payment-Payload: demo_test_001"' },
                  { type: 'success', text: '200 OK — { "message": "You paid 0.001 USDC!" }' },
                ]} />,
              },
              {
                title: 'Test with a real agent',
                description: <CodeBlock lang="typescript" code={`import { Gate402Agent } from 'gate402-agent'

const agent = new Gate402Agent({
  privateKey: process.env.AGENT_WALLET_KEY,
  network: 'devnet'
})

// Detects 402, pays automatically, retries
const res = await agent.fetch('http://localhost:3000/api/data')
const data = await res.json()
// { "message": "You paid 0.001 USDC!" }`} />,
              },
              {
                title: 'See it in the dashboard',
                description: 'Open gate402.dev/dashboard — every call appears in real time with endpoint, amount, and status (demo on devnet, verified on mainnet).',
              },
            ]} />

            {/* ══ CORE CONCEPTS ══ */}
            <H2 id="core-concepts">Core concepts</H2>
            <H3>x402 Protocol</H3>
            <P>HTTP 402 Payment Required is a status code defined in 1991. The x402 protocol defines how to use it for machine-to-machine payments. Backed by Google, Microsoft, Stripe, Coinbase, and Cloudflare.</P>

            <H3>Fee split</H3>
            <P>During early access, Gate402 charges no platform fee. You receive 100% of every payment directly in your wallet.</P>
            <Callout type="success">
              Gate402 takes 0% platform fee during early access. 100% of every payment goes directly to your wallet. This will change when we exit early access — you will be notified in advance.
            </Callout>

            <H3>Demo mode</H3>
            <Terminal title="demo mode" lines={[
              { type: 'comment', text: 'Any hash starting with demo_ bypasses blockchain' },
              { type: 'command', text: 'curl /api/data -H "X-Payment-Payload: demo_any_string"' },
              { type: 'success', text: 'Works on devnet — blocked automatically on mainnet' },
            ]} />
            <P>Demo mode is controlled by the network setting in your Gate402 dashboard, not by NODE_ENV.</P>
            <Callout type="warning">
              On devnet: demo_ hashes are accepted for development. On mainnet: demo_ hashes are rejected with DEMO_NOT_ALLOWED_ON_MAINNET. Switch your network in gate402.dev/settings — Gate402 blocks demo payments on mainnet automatically.
            </Callout>

            {/* ══ FOR API DEVELOPERS ══ */}
            <H2 id="api-installation">Installation</H2>
            <H3>Requirements</H3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
              {['Node.js 18+', 'Express 4+', 'Gate402 account at gate402.dev', 'Solana wallet (Phantom, Backpack, or any)'].map(item => (
                <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ color: T.green, fontFamily: T.mono, fontSize: 12 }}>→</span>
                  <span style={{ color: T.textSecondary, fontSize: 14, fontFamily: T.font }}>{item}</span>
                </div>
              ))}
            </div>
            <Terminal title="install" lines={[
              { type: 'comment', text: 'npm' },
              { type: 'command', text: 'npm install gate402' },
              { type: 'blank',   text: '' },
              { type: 'comment', text: 'yarn' },
              { type: 'command', text: 'yarn add gate402' },
              { type: 'blank',   text: '' },
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
              { prop: 'apiKey',        type: 'string',                    required: true,  description: 'API key from gate402.dev/settings' },
              { prop: 'walletAddress', type: 'string',                    required: false, description: 'Solana wallet to receive USDC. Falls back to dashboard setting.' },
              { prop: 'serverUrl',     type: 'string',                    required: true,  description: 'Gate402 API URL for payment verification' },
              { prop: 'network',       type: "'devnet' | 'mainnet'",      required: false, default: "'devnet'", description: 'Solana network for on-chain verification' },
              { prop: 'endpoints',     type: 'Record<string, number>',    required: false, description: 'Map of URL paths to prices in USDC. Omit to use managed mode.' },
            ]} />

            <H2 id="going-to-mainnet">Going to mainnet</H2>
            <P>When you're ready to receive real USDC payments, follow these steps.</P>
            <StepList steps={[
              {
                title: 'Configure your Solana wallet',
                description: 'Go to gate402.dev/settings → Receiving Wallet. Add your Solana mainnet wallet address (Phantom, Backpack, or any Solana wallet).',
              },
              {
                title: 'Switch to mainnet',
                description: <>
                  <span>Go to gate402.dev/settings → Network → Mainnet. Or via API:</span>
                  <CodeBlock lang="bash" code={`curl -X PATCH https://api.gate402.dev/api/users/network \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"network": "mainnet"}'`} />
                </>,
              },
              {
                title: 'Configure Helius RPC (recommended)',
                description: 'The public Solana RPC has rate limits. For production, use a dedicated RPC like Helius (free tier available). Go to helius.dev → create account → copy your RPC URL → paste in gate402.dev/settings.',
              },
              {
                title: 'Test with real USDC',
                description: <CodeBlock lang="typescript" code={`import { Gate402Agent } from 'gate402-agent'

const agent = new Gate402Agent({
  privateKey: process.env.AGENT_WALLET_KEY,
  network: 'mainnet',
  limits: { maxPerCall: 0.01, maxPerDay: 1.00 }
})

const res = await agent.fetch('https://your-api.dev/api/data')`} />,
              },
              {
                title: 'Monitor in dashboard',
                description: 'Every payment appears in gate402.dev/dashboard in real time with status "verified" (on-chain confirmed) and the tx hash on Solscan.',
              },
            ]} />
            <Callout type="warning">
              Always test thoroughly on devnet before switching to mainnet. Demo payments are blocked on mainnet automatically.
            </Callout>

            <H2 id="endpoint-pricing">Endpoint pricing</H2>
            <P>Each entry in <code style={{ fontFamily: T.mono, fontSize: 13, color: T.textSecondary, background: T.card, padding: '1px 5px', borderRadius: 5 }}>endpoints</code> maps a URL path to a price in USDC. Prices can be as low as 0.0001 USDC ($0.0001).</P>
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
            <Callout type="success">Gate402 takes 0% platform fee during early access. 100% of each payment goes directly to your wallet. No monthly fees on the free tier.</Callout>

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
            <P>Go to gate402.dev/settings → Webhooks → Add URL and webhook secret. Or via API:</P>
            <CodeBlock lang="bash" code={`curl -X PATCH https://api.gate402.dev/api/users/webhook \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"webhookUrl": "https://your-app.com/webhook", "webhookSecret": "your-secret"}'`} />
            <H3>Headers sent with every webhook</H3>
            <CodeBlock lang="bash" code={`X-Gate402-Signature: sha256=<hmac>
X-Gate402-Event: payment.confirmed
X-Gate402-Timestamp: 2026-05-27T01:04:51.630Z
User-Agent: Gate402-Webhook/1.0`} />
            <H3>Payload</H3>
            <CodeBlock lang="json" code={`{
  "event": "payment.confirmed",
  "endpoint": "/api/data",
  "amount": 0.001,
  "currency": "USDC",
  "network": "mainnet",
  "txHash": "5kWq9mLP3rTxHJzUvBnCs...",
  "payerWallet": "DcL4mMaqX4FAHg4Cp1SstvMSMWytoXo93ktWycgGYABE",
  "timestamp": "2026-05-27T01:04:51.630Z"
}`} />
            <H3>Verifying signatures</H3>
            <CodeBlock lang="typescript" code={`import crypto from 'crypto'

app.post('/webhook', express.json(), (req, res) => {
  const sig = req.headers['x-gate402-signature']
  const secret = process.env.GATE402_WEBHOOK_SECRET

  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex')

  if (sig !== \`sha256=\${expected}\`) {
    return res.status(401).json({ error: 'Invalid signature' })
  }

  console.log('Payment confirmed:', req.body.amount, 'USDC')
  console.log('From:', req.body.payerWallet)
  console.log('TxHash:', req.body.txHash)

  res.json({ received: true })
})`} />
            <Callout type="info">
              Webhooks only fire for payments through api.gate402.dev, not local MCP servers. Test with: POST /api/users/webhook/test
            </Callout>

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
              demoFetch only works on APIs whose account is set to devnet. APIs set to mainnet reject demo_ payments with DEMO_NOT_ALLOWED_ON_MAINNET.
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
              { type: 'output',  text: 'agent.getStats().walletAddress' },
              { type: 'success', text: 'DcL4mMaqX4FAHg4Cp1SstvMSMWytoXo93ktWycgGYABE' },
              { type: 'blank',   text: '' },
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
              { type: 'output',  text: 'Scaffolding MCP server with Gate402...' },
              { type: 'success', text: 'Created my-mcp-server/' },
              { type: 'blank',   text: '' },
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
              { type: 'output',  text: 'Tool name: get_weather' },
              { type: 'output',  text: 'Price (USDC): 0.001' },
              { type: 'output',  text: 'Input schema (JSON): { "city": { "type": "string" } }' },
              { type: 'blank',   text: '' },
              { type: 'success', text: 'Generated src/tools/get_weather.ts' },
              { type: 'success', text: 'Registered in src/index.ts' },
            ]} />

            {/* ══ PLATFORM ══ */}
            <H2 id="platform-dashboard">Dashboard</H2>
            <P>The Gate402 dashboard at gate402.dev gives you a real-time view of your API usage, revenue, and callers.</P>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10, marginTop: 8 }}>
              {[
                { title: 'Overview',   desc: 'Total calls, revenue, unique callers, top endpoints' },
                { title: 'Live feed',  desc: 'Real-time stream of every paid API call' },
                { title: 'Endpoints',  desc: 'Create, edit, and toggle endpoint prices' },
                { title: 'Settings',   desc: 'API key, wallet address, network selection' },
              ].map(c => (
                <div key={c.title} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 6, padding: 16, transition: 'border-color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = T.borderHover)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, marginBottom: 4, fontFamily: T.font }}>{c.title}</div>
                  <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.5, fontFamily: T.font }}>{c.desc}</div>
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
            <Callout type="success">During early access, Gate402 takes 0% platform fee. You receive 100% of every configured price directly in your Solana wallet. This will change when we exit early access — you will be notified in advance.</Callout>

            <H2 id="api-key-management">API Key Management</H2>
            <P>Your API key authenticates requests to Gate402. Never expose it in client-side code or public repositories.</P>
            <H3>Using your key</H3>
            <CodeBlock lang="bash" code={`# .env
GATE402_API_KEY=your-key-here`} />
            <CodeBlock lang="typescript" code={`app.use(gate402({
  apiKey: process.env.GATE402_API_KEY,
  serverUrl: 'https://api.gate402.dev',
  endpoints: { '/api/data': 0.001 }
}))`} />
            <H3>Rotating your key</H3>
            <P>If your key is compromised, rotate it immediately:</P>
            <StepList steps={[
              { title: 'Go to gate402.dev/settings', description: 'Navigate to Settings → API Key.' },
              { title: 'Click "Rotate API key"', description: 'Your old key is invalidated immediately upon rotation.' },
              { title: 'Update your environment variables', description: 'Replace GATE402_API_KEY in your .env and all deployment environments with the new key.' },
            ]} />
            <P>Or via API:</P>
            <CodeBlock lang="bash" code={`curl -X POST https://api.gate402.dev/api/users/rotate-key \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response: { "apiKey": "new-key-here" }`} />
            <Callout type="danger">
              Your old key is invalidated the moment you rotate. Update all services before rotating in production.
            </Callout>

            {/* ══ REFERENCE ══ */}
            <H2 id="api-reference">API endpoints</H2>
            <P>Base URL: <code style={{ fontFamily: T.mono, fontSize: 13, color: T.textSecondary }}>https://api.gate402.dev</code></P>
            {[
              { method: 'GET',    path: '/api/metrics',                auth: true,  desc: 'Total calls, revenue, unique callers',                    response: '{ totalCalls, totalRevenue, uniqueCallers, topEndpoint }' },
              { method: 'GET',    path: '/api/calls/recent',           auth: true,  desc: 'Last 50 API calls',                                       response: '[{ id, endpoint, amount, txHash, callerIp, createdAt }]' },
              { method: 'GET',    path: '/api/calls/per-day',          auth: true,  desc: 'Calls grouped by day (last 30 days)',                      response: '[{ date, calls, revenue }]' },
              { method: 'GET',    path: '/api/endpoints',              auth: true,  desc: 'Your configured endpoints',                               response: '[{ id, path, priceUsdc, active, calls }]' },
              { method: 'POST',   path: '/api/endpoints',              auth: true,  desc: 'Create a new endpoint',                                   response: '{ id, path, priceUsdc, active }' },
              { method: 'DELETE', path: '/api/endpoints/:id',          auth: true,  desc: 'Delete an endpoint',                                      response: '{ success: true }' },
              { method: 'POST',   path: '/api/verify-payment',         auth: true,  desc: 'Verify a Solana tx hash',                                 response: '{ valid: boolean, amount, wallet }' },
              { method: 'PATCH',  path: '/api/users/network',          auth: true,  desc: 'Switch network — body: { network: "devnet"|"mainnet" }',   response: '{ network, message }' },
              { method: 'PATCH',  path: '/api/users/wallet',           auth: true,  desc: 'Update receiving wallet — body: { walletAddress }',       response: '{ walletAddress, message }' },
              { method: 'PATCH',  path: '/api/users/webhook',          auth: true,  desc: 'Configure webhook — body: { webhookUrl, webhookSecret }', response: '{ webhookUrl, message }' },
              { method: 'POST',   path: '/api/users/webhook/test',     auth: true,  desc: 'Send a test webhook to your configured URL',              response: '{ message, url }' },
              { method: 'POST',   path: '/api/users/rotate-key',       auth: true,  desc: 'Rotate API key — old key invalidated immediately',        response: '{ apiKey }' },
              { method: 'GET',    path: '/api/analytics/revenue',      auth: true,  desc: 'Revenue summary — query: ?period=7d|30d|90d (Pro)',        response: '{ summary: { grossRevenue, netRevenue, transactionCount }, byDay: [...] }' },
              { method: 'GET',    path: '/api/analytics/top-agents',   auth: true,  desc: 'Top paying agent wallets (Pro)',                          response: '{ agents: [{ wallet, calls, totalPaid }] }' },
              { method: 'GET',    path: '/api/analytics/latency',      auth: true,  desc: 'Latency percentiles per endpoint (Pro)',                  response: '{ latency: [{ endpoint, p50, p95, p99, avg }] }' },
              { method: 'GET',    path: '/api/analytics/export',       auth: true,  desc: 'Export all transactions as CSV (Pro)',                    response: 'CSV file' },
              { method: 'GET',    path: '/api/weather',                auth: false, desc: 'Demo endpoint (requires 0.001 USDC payment)',             response: '{ city, temp, humidity }' },
            ].map(ep => (
              <div key={ep.path + ep.method} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 6, padding: 16, marginBottom: 8, transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = T.borderHover)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: T.mono, fontSize: 11, fontWeight: 700,
                    color: ep.method === 'GET' ? T.green : ep.method === 'POST' ? T.blue : '#ef4444',
                    background: ep.method === 'GET' ? 'rgba(0,188,125,0.1)' : ep.method === 'POST' ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${ep.method === 'GET' ? 'rgba(0,188,125,0.2)' : ep.method === 'POST' ? 'rgba(59,130,246,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    borderRadius: 5, padding: '2px 7px', flexShrink: 0,
                  }}>{ep.method}</span>
                  <code style={{ fontFamily: T.mono, fontSize: 13, color: T.textSecondary }}>{ep.path}</code>
                  {ep.auth && <span style={{ fontFamily: T.mono, fontSize: 10, color: T.purple, background: 'rgba(153,69,255,0.1)', border: '1px solid rgba(153,69,255,0.2)', borderRadius: 5, padding: '2px 5px' }}>Auth</span>}
                </div>
                <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 6, fontFamily: T.font }}>{ep.desc}</div>
                <code style={{ fontFamily: T.mono, fontSize: 12, color: T.textFaint }}>{ep.response}</code>
              </div>
            ))}

            <H2 id="error-codes">Error codes</H2>
            <div style={{ border: `1px solid ${T.border}`, borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 200px 1fr', background: T.card, borderBottom: `1px solid ${T.border}`, padding: '8px 14px', gap: 14 }}>
                {['HTTP', 'Code', 'Description'].map(h => (
                  <span key={h} style={{ fontFamily: T.mono, fontSize: 10, color: T.textFaint, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</span>
                ))}
              </div>
              {[
                { status: 402, code: 'PAYMENT_REQUIRED',               desc: 'No payment header. Response includes price and wallet.' },
                { status: 402, code: 'PAYMENT_ALREADY_USED',           desc: 'This tx hash has already been consumed (anti-replay).' },
                { status: 402, code: 'PAYMENT_INVALID',                desc: 'Tx not found on-chain or amount does not match.' },
                { status: 402, code: 'DEMO_NOT_ALLOWED_ON_MAINNET',    desc: 'Demo mode is disabled on mainnet. Send real USDC or switch to devnet.' },
                { status: 401, code: 'INVALID_API_KEY',                desc: 'x-api-key header contains an invalid or unknown key.' },
                { status: 401, code: 'MISSING_API_KEY',                desc: 'x-api-key header not present in request.' },
                { status: 403, code: 'UPGRADE_REQUIRED',               desc: 'This feature requires a Pro plan. Upgrade at gate402.dev/billing.' },
                { status: 400, code: 'INVALID_PATH',                   desc: 'Endpoint path must start with / and contain only valid characters.' },
                { status: 400, code: 'INVALID_PRICE',                  desc: 'priceUsdc must be a positive number between 0.0001 and 1000.' },
                { status: 502, code: 'UPSTREAM_UNAVAILABLE',           desc: 'Origin API did not respond (managed mode only).' },
                { status: 500, code: 'INTERNAL_ERROR',                 desc: 'Unexpected error. Check server logs.' },
              ].map((row, i, arr) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 200px 1fr', padding: '10px 14px', gap: 14, borderBottom: i < arr.length - 1 ? '1px solid #111' : 'none', background: i % 2 === 0 ? '#0a0a0a' : T.card, alignItems: 'start' }}>
                  <span style={{ fontFamily: T.mono, fontSize: 12, color: row.status === 402 ? '#f59e0b' : '#ef4444' }}>{row.status}</span>
                  <code style={{ fontFamily: T.mono, fontSize: 11, color: T.green }}>{row.code}</code>
                  <span style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.5, fontFamily: T.font }}>{row.desc}</span>
                </div>
              ))}
            </div>

            <H2 id="troubleshooting">Troubleshooting</H2>

            <H3>"Invalid API key" error</H3>
            <P>Your x-api-key header is invalid or missing. Check gate402.dev/settings for your current API key. If you rotated recently, update your environment variables.</P>

            <H3>"Demo mode not allowed on mainnet"</H3>
            <P>Your account is set to mainnet but you sent a demo_ hash. Switch to devnet for testing, or send a real Solana transaction.</P>

            <H3>"Transaction not found"</H3>
            <P>The tx hash doesn't exist on the expected network. Common causes:</P>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '8px 0 16px' }}>
              {[
                'Wrong network — sent mainnet tx but account is on devnet (or vice versa)',
                'Transaction not yet finalized — wait 1–2 seconds and retry',
                'Invalid tx hash format',
              ].map(item => (
                <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: T.textMuted, fontFamily: T.mono, fontSize: 12, marginTop: 2 }}>–</span>
                  <span style={{ color: T.textSecondary, fontSize: 14, fontFamily: T.font, lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>

            <H3>"Insufficient amount: received 0, expected X"</H3>
            <P>The transaction was found but the recipient received 0 USDC. Common causes:</P>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '8px 0 16px' }}>
              {[
                'Sender and recipient are the same wallet — use different wallets for testing',
                'Wrong recipient address — check your wallet in Settings',
                'RPC rate limit — use Helius for production',
              ].map(item => (
                <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: T.textMuted, fontFamily: T.mono, fontSize: 12, marginTop: 2 }}>–</span>
                  <span style={{ color: T.textSecondary, fontSize: 14, fontFamily: T.font, lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>

            <H3>Payment goes through but dashboard shows 0</H3>
            <P>Your API key might not match the endpoint owner. Make sure you're passing x-api-key in the middleware config and that it matches the key in gate402.dev/settings.</P>

            <H3>Webhook not firing</H3>
            <P>Check that your webhook URL is publicly accessible. Test with POST /api/users/webhook/test. Webhooks only fire for payments through api.gate402.dev, not local MCP servers.</P>

            <div style={{ height: 64 }} />
          </div>
        </main>
      </div>
    </>
  )
}

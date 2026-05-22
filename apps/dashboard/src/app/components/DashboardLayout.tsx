'use client'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import Link from 'next/link'
import { useUser } from '../hooks/useUser'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Docs search index ────────────────────────────────────────────────────────

const DOCS_ITEMS = [
  // Getting started
  { label: 'Introduction',      id: 'introduction',      group: 'Getting Started' },
  { label: 'How it works',      id: 'how-it-works',      group: 'Getting Started' },
  { label: 'Quick start',       id: 'quick-start',       group: 'Getting Started' },
  { label: 'Core concepts',     id: 'core-concepts',     group: 'Getting Started' },
  // API developers
  { label: 'Installation',      id: 'api-installation',  group: 'API Developers' },
  { label: 'Basic setup',       id: 'api-basic-setup',   group: 'API Developers' },
  { label: 'Endpoint pricing',  id: 'endpoint-pricing',  group: 'API Developers' },
  { label: 'Managed mode',      id: 'managed-mode',      group: 'API Developers' },
  { label: 'Token metering',    id: 'token-metering',    group: 'API Developers' },
  { label: 'Compute metering',  id: 'compute-metering',  group: 'API Developers' },
  { label: 'Webhooks',          id: 'webhooks',          group: 'API Developers' },
  // Agent operators
  { label: 'Agent installation',id: 'agent-installation',group: 'Agent Operators' },
  { label: 'Spending limits',   id: 'spending-limits',   group: 'Agent Operators' },
  { label: 'Demo fetch',        id: 'demo-fetch',        group: 'Agent Operators' },
  { label: 'Getting USDC',      id: 'getting-usdc',      group: 'Agent Operators' },
  // MCP
  { label: 'Add to existing MCP', id: 'mcp-existing',   group: 'MCP Developers' },
  { label: 'Build new MCP',     id: 'mcp-new',           group: 'MCP Developers' },
  { label: 'Per-tool pricing',  id: 'mcp-pricing',       group: 'MCP Developers' },
  { label: 'CLI generator',     id: 'mcp-cli',           group: 'MCP Developers' },
  // Platform
  { label: 'Dashboard',         id: 'platform-dashboard',group: 'Platform' },
  { label: 'Analytics',         id: 'analytics',         group: 'Platform' },
  { label: 'Wallet & payouts',  id: 'wallet-payouts',    group: 'Platform' },
  // Reference
  { label: 'API endpoints',     id: 'api-reference',     group: 'Reference' },
  { label: 'Error codes',       id: 'error-codes',       group: 'Reference' },
]

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconOverview = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
)
const IconAnalytics = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M1 12l4-4 3 3 4-5 3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconWallet = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="4" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M1 7h14" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="10" r="1" fill="currentColor"/>
  </svg>
)
const IconEndpoints = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="3.5" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12.5" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12.5" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5.4 7l5.6-2M5.4 9l5.6 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const IconPlayground = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 3l8 5-8 5V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
)
const IconDocs = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 2h7l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const IconBilling = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M1 7h14" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
)
const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const NAV_ITEMS = [
  { label: 'Overview',   href: '/dashboard',  Icon: IconOverview },
  { label: 'Analytics',  href: '/analytics',  Icon: IconAnalytics, pro: true },
  { label: 'Wallet',     href: '/wallet',     Icon: IconWallet },
  { label: 'Endpoints',  href: '/endpoints',  Icon: IconEndpoints },
  { label: 'Playground', href: '/playground', Icon: IconPlayground },
  { label: 'Docs',       href: '/docs',       Icon: IconDocs },
  { label: 'Billing',    href: '/billing',    Icon: IconBilling },
  { label: 'Settings',   href: '/settings',   Icon: IconSettings },
]

// ─── Framer variants ──────────────────────────────────────────────────────────

const sidebarVariants = {
  open:   { width: '220px' },
  closed: { width: '52px' },
}

const labelVariants = {
  open:   { opacity: 1, x: 0,  display: 'block', transition: { duration: 0.15 } },
  closed: { opacity: 0, x: -8, transition: { duration: 0.1 }, transitionEnd: { display: 'none' } },
}

const sidebarTransition = { type: 'tween' as const, ease: 'easeOut' as const, duration: 0.18 }

// ─── NavItem ──────────────────────────────────────────────────────────────────

function NavItem({ label, href, Icon, active, pro, isPro, collapsed }: {
  label: string; href: string; Icon: () => React.ReactElement
  active: boolean; pro?: boolean; isPro: boolean; collapsed: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const lit = active || hovered

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '4px 8px', margin: '1px 6px',
        fontSize: 'var(--text-sm)', fontWeight: active ? 500 : 400,
        color: lit ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: 'transparent',
        borderRadius: 'var(--radius-md)',
        transition: 'color 120ms',
        textDecoration: 'none', overflow: 'hidden', whiteSpace: 'nowrap',
      }}
    >
      <span style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, width: 30, height: 30,
        borderRadius: 'var(--radius-md)',
        background: lit ? '#313131' : 'transparent',
        color: lit ? '#fff' : 'var(--text-muted)',
        transition: 'background 120ms, color 120ms',
      }}>
        <Icon />
      </span>
      <motion.span variants={labelVariants} style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
        {label}
        {pro && !isPro && (
          <span style={{
            fontSize: 9, fontWeight: 600,
            color: 'var(--brand-primary)', background: 'var(--brand-muted)',
            border: '1px solid var(--brand-border)', borderRadius: 6,
            padding: '1px 4px', letterSpacing: '0.08em', lineHeight: 1.4,
          }}>PRO</span>
        )}
      </motion.span>
    </Link>
  )
}

// ─── DocsSearch ───────────────────────────────────────────────────────────────

function DocsSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const results = query.trim().length > 0
    ? DOCS_ITEMS.filter(d =>
        d.label.toLowerCase().includes(query.toLowerCase()) ||
        d.group.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : DOCS_ITEMS.slice(0, 6)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    setSelected(0)
  }, [query])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && results[selected]) {
      window.location.href = `/docs#${results[selected].id}`
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 12px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-muted)',
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
          transition: 'border-color 150ms',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span>Search docs</span>
        <span style={{
          fontSize: 10, color: 'var(--text-disabled)',
          background: 'var(--bg-overlay)', border: '1px solid var(--border-default)',
          borderRadius: 6, padding: '1px 5px', fontFamily: 'var(--font-mono)',
        }}>⌘K</span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: 340,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              zIndex: 100,
              overflow: 'hidden',
            }}
          >
            {/* Input */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px',
              borderBottom: '1px solid var(--border-default)',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, color: 'var(--text-muted)' }}>
                <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search documentation..."
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: 'var(--text-primary)', fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-sans)',
                }}
              />
              {query && (
                <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, fontSize: 16, lineHeight: 1 }}>×</button>
              )}
            </div>

            {/* Results */}
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {results.length === 0 ? (
                <div style={{ padding: '24px 14px', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                  No results for &ldquo;{query}&rdquo;
                </div>
              ) : (
                results.map((item, i) => (
                  <a
                    key={item.id}
                    href={`/docs#${item.id}`}
                    onClick={() => setOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '9px 14px', textDecoration: 'none',
                      background: i === selected ? 'var(--bg-overlay)' : 'transparent',
                      transition: 'background 80ms',
                      gap: 12,
                    }}
                    onMouseEnter={() => setSelected(i)}
                  >
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{item.label}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{item.group}</span>
                  </a>
                ))
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '8px 14px',
              borderTop: '1px solid var(--border-default)',
              display: 'flex', gap: 12, alignItems: 'center',
            }}>
              {[['↑↓', 'navigate'], ['↵', 'open'], ['esc', 'close']].map(([key, desc]) => (
                <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                  <kbd style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-default)', borderRadius: 6, padding: '1px 5px', fontFamily: 'var(--font-mono)', fontSize: 10 }}>{key}</kbd>
                  {desc}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const { userData } = useUser()
  const isPro = userData?.plan === 'pro' || userData?.plan === 'enterprise'

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setEmail(user?.email ?? null)
      setAvatarUrl(user?.user_metadata?.avatar_url ?? null)
    }
    load()
  }, [])

  const firstName = email ? email.split('@')[0] : 'User'
  const initial = email ? email[0].toUpperCase() : '?'

  return (
    <div style={{
      display: 'flex', height: '100vh',
      background: 'var(--bg-base)', fontFamily: 'var(--font-sans)', overflow: 'hidden',
    }}>

      {/* ═══ SIDEBAR ═══ */}
      <motion.aside
        initial="closed"
        animate={collapsed ? 'closed' : 'open'}
        variants={sidebarVariants}
        transition={sidebarTransition}
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
        style={{
          height: '100vh', position: 'fixed', top: 0, left: 0,
          background: 'var(--bg-base)', borderRight: '1px solid var(--border-default)',
          display: 'flex', flexDirection: 'column',
          zIndex: 50, overflow: 'hidden', flexShrink: 0,
        }}
      >
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto', overflowX: 'hidden' }}>
          {NAV_ITEMS.map(({ label, href, Icon, pro }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname?.startsWith(href + '/'))
            return (
              <NavItem
                key={href} label={label} href={href} Icon={Icon}
                active={active} pro={pro} isPro={isPro} collapsed={collapsed}
              />
            )
          })}
        </nav>
      </motion.aside>

      {/* ═══ MAIN ═══ */}
      <div style={{
        flex: 1, marginLeft: 52,
        display: 'flex', flexDirection: 'column',
        height: '100vh', overflow: 'hidden',
      }}>

        {/* TOPBAR */}
        <header style={{
          height: 52, background: 'var(--bg-base)',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0, zIndex: 9,
        }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Hi, <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{firstName}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            <DocsSearch />

            {/* Help */}
            <div
              title="Help"
              style={{
                width: 30, height: 30, borderRadius: '50%',
                background: '#313131',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#888" strokeWidth="1.5"/>
                <path d="M5.5 5.5a1.5 1.5 0 013 .5c0 1-1.5 1.5-1.5 2.5" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="7" cy="10.5" r="0.5" fill="#888"/>
              </svg>
            </div>

            {/* Avatar */}
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              overflow: 'hidden', flexShrink: 0,
              border: '1px solid var(--border-default)',
            }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={firstName}
                  referrerPolicy="no-referrer"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  background: 'var(--brand-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 600,
                  color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)',
                }}>
                  {initial}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{
          flex: 1, overflowY: 'auto', padding: '32px',
          background: 'var(--bg-base)',
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}

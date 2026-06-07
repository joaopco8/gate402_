'use client'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import Link from 'next/link'
import { useUser } from '@/contexts/UserContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Settings, CreditCard, LogOut, LayoutDashboard, BookOpen } from 'lucide-react'

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
const IconAgents = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/>
    <circle cx="12" cy="5" r="2"/>
    <path d="M12 7v4"/>
    <path d="M8 15h.01M12 15h.01M16 15h.01"/>
  </svg>
)
const IconProxy = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 8h12M10 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="4" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
)
const IconMarketplace = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M1 4h14M1 4l1.5-2h11L15 4M1 4v9a1 1 0 001 1h12a1 1 0 001-1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 8h4M8 6v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const NAV_ITEMS = [
  { label: 'Overview',      href: '/dashboard',   Icon: IconOverview },
  { label: 'Analytics',     href: '/analytics',   Icon: IconAnalytics, pro: true },
  { label: 'Wallet',        href: '/wallet',      Icon: IconWallet },
  { label: 'Agent Wallets', href: '/agents',      Icon: IconAgents },
  { label: 'APIs',          href: '/proxy',       Icon: IconProxy },
  { label: 'Marketplace',   href: '/marketplace', Icon: IconMarketplace },
  { label: 'Playground',    href: '/playground',  Icon: IconPlayground },
  { label: 'Docs',          href: '/docs',        Icon: IconDocs },
  { label: 'Billing',       href: '/billing',     Icon: IconBilling },
  { label: 'Settings',      href: '/settings',    Icon: IconSettings },
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
        background: active ? 'rgba(122,242,121,0.1)' : hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
        color: active ? '#7AF279' : lit ? 'var(--text-primary)' : 'var(--text-muted)',
        transition: 'background 120ms, color 120ms',
      }}>
        <Icon />
      </span>
      <motion.span variants={labelVariants} style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
        {label}
        {pro && !isPro && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
            <rect x="2" y="5" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M4 5V3.5a2 2 0 014 0V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
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
          fontFamily: 'var(--font-label)',
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
          borderRadius: 6, padding: '1px 5px', fontFamily: 'var(--font-label)',
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
                  fontFamily: 'var(--font-label)',
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
                <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                  <kbd style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-default)', borderRadius: 6, padding: '1px 5px', fontFamily: 'var(--font-label)', fontSize: 10 }}>{key}</kbd>
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

// ─── AvatarMenu ───────────────────────────────────────────────────────────────

const MONO = "'Geist Mono', monospace"
const SANS = "'Geist Mono', monospace"

function AvatarMenu({ avatarUrl, firstName, initial, email, isPro }: {
  avatarUrl: string | null
  firstName: string
  initial: string
  email: string | null
  isPro: boolean
}) {
  async function handleLogout() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {}
    window.location.href = '/auth/login'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 10px 6px 8px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid #2A2E2A',
            borderRadius: 10,
            cursor: 'pointer',
            transition: 'border-color 150ms, background 150ms',
            outline: 'none',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#333733'
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#2A2E2A'
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
          }}
        >
          {/* Avatar */}
          <div style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            overflow: 'hidden',
            background: 'rgba(122,242,121,0.15)',
            border: '1.5px solid rgba(122,242,121,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={firstName}
                referrerPolicy="no-referrer"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <span style={{ fontSize: 12, fontWeight: 600, color: '#7AF279', fontFamily: MONO }}>
                {initial}
              </span>
            )}
          </div>

          {/* Name + plan */}
          <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#E8F4EE', fontFamily: SANS, whiteSpace: 'nowrap' }}>
              {firstName}
            </div>
            <div style={{ fontSize: 10, color: isPro ? '#7AF279' : '#4A5549', fontFamily: MONO, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {isPro ? 'Pro' : 'Free'}
            </div>
          </div>

          {/* Chevron */}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: '#4A5549', flexShrink: 0 }}>
            <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        style={{
          width: 240,
          padding: 6,
          background: 'rgba(27,30,27,0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid #2A2E2A',
          borderRadius: 12,
          boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
          zIndex: 200,
        }}
        className="!bg-[#1B1E1B] !border-[#2A2E2A] !shadow-none !rounded-xl !p-0"
      >
        {/* User header */}
        <div style={{
          padding: '10px 12px 12px',
          marginBottom: 4,
          borderBottom: '1px solid #2A2E2A',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              overflow: 'hidden',
              background: 'rgba(122,242,121,0.1)',
              border: '1.5px solid rgba(122,242,121,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={firstName}
                  referrerPolicy="no-referrer"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <span style={{ fontSize: 13, fontWeight: 600, color: '#7AF279', fontFamily: MONO }}>
                  {initial}
                </span>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#E8F4EE', fontFamily: SANS, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {firstName}
              </div>
              <div style={{ fontSize: 12, color: '#4A5549', fontFamily: MONO, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {email}
              </div>
            </div>
            {isPro && (
              <span style={{
                flexShrink: 0, marginLeft: 'auto',
                fontSize: 9, fontFamily: MONO, letterSpacing: '0.08em',
                color: '#7AF279', border: '1px solid rgba(122,242,121,0.3)',
                borderRadius: 4, padding: '2px 6px', textTransform: 'uppercase',
              }}>
                Pro
              </span>
            )}
          </div>
        </div>

        {/* Menu items */}
        <div style={{ padding: '2px 0', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[
            { label: 'Dashboard', href: '/dashboard', Icon: LayoutDashboard },
            { label: 'Settings', href: '/settings', Icon: Settings },
            { label: isPro ? 'Manage plan' : 'Upgrade to Pro', href: '/billing', Icon: CreditCard, accent: !isPro },
            { label: 'Documentation', href: '/v2/docs', Icon: BookOpen },
          ].map(({ label, href, Icon, accent }) => (
            <DropdownMenuItem key={href} asChild>
              <Link
                href={href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontSize: 13, fontFamily: SANS,
                  color: accent ? '#7AF279' : '#7A8C79',
                  background: 'transparent',
                  border: '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'background 150ms, border-color 150ms, color 150ms',
                  outline: 'none',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.borderColor = '#2A2E2A'
                  e.currentTarget.style.color = accent ? '#7AF279' : '#E8F4EE'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'transparent'
                  e.currentTarget.style.color = accent ? '#7AF279' : '#7A8C79'
                }}
              >
                <Icon size={14} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{label}</span>
                {accent && (
                  <span style={{
                    fontSize: 9, fontFamily: MONO, letterSpacing: '0.06em',
                    color: '#7AF279', border: '1px solid rgba(122,242,121,0.3)',
                    borderRadius: 3, padding: '1px 5px', textTransform: 'uppercase',
                  }}>
                    Upgrade
                  </span>
                )}
              </Link>
            </DropdownMenuItem>
          ))}
        </div>

        {/* Separator */}
        <div style={{ margin: '6px 0', height: 1, background: '#2A2E2A' }} />

        {/* Sign out */}
        <DropdownMenuItem asChild>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '8px 10px',
              borderRadius: 8,
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid transparent',
              cursor: 'pointer',
              fontSize: 13, fontFamily: SANS,
              color: '#ef4444',
              transition: 'background 150ms, border-color 150ms',
              outline: 'none',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.12)'
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.06)'
              e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            <LogOut size={14} style={{ flexShrink: 0 }} />
            Sign out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Profile cache ────────────────────────────────────────────────────────────

const PROFILE_KEY = 'g402_profile'

function readProfileCache(): { firstName: string; email: string | null; avatarUrl: string | null } | null {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(PROFILE_KEY) : null
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function writeProfileCache(data: { firstName: string; email: string | null; avatarUrl: string | null }) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(data)) } catch {}
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { userData } = useUser()
  const isPro = mounted && (userData?.plan === 'pro' || userData?.plan === 'enterprise')

  const cached = typeof window !== 'undefined' ? readProfileCache() : null
  const [email, setEmail] = useState<string | null>(cached?.email ?? null)
  const [firstName, setFirstName] = useState<string>(cached?.firstName ?? 'User')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(cached?.avatarUrl ?? null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const meta = user.user_metadata ?? {}
      const name = meta.full_name || meta.name || null
      const fn = name ? name.split(' ')[0] : (user.email ? user.email.split('@')[0] : 'User')
      const av = meta.avatar_url ?? null
      setEmail(user.email ?? null)
      setFirstName(fn)
      setAvatarUrl(av)
      writeProfileCache({ firstName: fn, email: user.email ?? null, avatarUrl: av })
    }
    load()
  }, [])

  const initial = firstName[0]?.toUpperCase() ?? '?'

  return (
    <div style={{
      display: 'flex', height: '100vh',
      background: 'var(--bg-base)', fontFamily: 'var(--font-label)', overflow: 'hidden',
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
          height: 'calc(100vh - 52px)', position: 'fixed', top: 52, left: 0,
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

      {/* ═══ TOPBAR (full-width, fixed, above sidebar) ═══ */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 52, background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', zIndex: 100,
      }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logos/favicon-metera-white.png" alt="Metera" style={{ height: 22, width: 'auto', display: 'block' }} />
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Hi, <span style={{ color: 'var(--text-primary)', fontWeight: 500 }} suppressHydrationWarning>{firstName}</span>
            </div>
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

            {/* Avatar + dropdown */}
            <AvatarMenu
              avatarUrl={mounted ? avatarUrl : null}
              firstName={mounted ? firstName : 'User'}
              initial={mounted ? initial : '?'}
              email={mounted ? email : null}
              isPro={isPro}
            />
          </div>
      </header>

      {/* ═══ MAIN ═══ */}
      <div style={{
        flex: 1, marginLeft: 52, marginTop: 52,
        width: 'calc(100% - 52px)',
        height: 'calc(100vh - 52px)',
        overflowY: 'auto',
        padding: '32px',
        background: 'var(--bg-base)',
      }}>
        {children}
      </div>
    </div>
  )
}

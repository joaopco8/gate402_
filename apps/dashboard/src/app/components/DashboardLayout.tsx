'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import Link from 'next/link'
import { useUser } from '../hooks/useUser'
import { motion } from 'framer-motion'

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

const transition = { type: 'tween' as const, ease: 'easeOut' as const, duration: 0.18 }

// ─── NavItem ──────────────────────────────────────────────────────────────────

function NavItem({ label, href, Icon, active, pro, isPro, collapsed }: {
  label: string
  href: string
  Icon: () => JSX.Element
  active: boolean
  pro?: boolean
  isPro: boolean
  collapsed: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const highlighted = active || hovered

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '4px 8px',
        margin: '1px 6px',
        fontSize: 'var(--text-sm)',
        fontWeight: active ? 500 : 400,
        color: active ? 'var(--text-primary)' : hovered ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: 'transparent',
        borderRadius: 'var(--radius-md)',
        transition: 'color 120ms',
        textDecoration: 'none',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      {/* Icon wrapper — square with bg when active/hovered */}
      <span style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: 30,
        height: 30,
        borderRadius: 'var(--radius-md)',
        background: highlighted ? '#313131' : 'transparent',
        color: highlighted ? '#fff' : 'var(--text-muted)',
        transition: 'background 120ms, color 120ms',
      }}>
        <Icon />
      </span>

      <motion.span variants={labelVariants} style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
        {label}
        {pro && !isPro && (
          <span style={{
            fontSize: 9,
            fontWeight: 600,
            color: 'var(--brand-primary)',
            background: 'var(--brand-muted)',
            border: '1px solid var(--brand-border)',
            borderRadius: 3,
            padding: '1px 4px',
            letterSpacing: '0.08em',
            lineHeight: 1.4,
          }}>PRO</span>
        )}
      </motion.span>
    </Link>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const { userData } = useUser()
  const isPro = userData?.plan === 'pro' || userData?.plan === 'enterprise'

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setEmail(user?.email ?? null)
    }
    load()
  }, [])

  const firstName = email ? email.split('@')[0] : 'User'
  const initial = email ? email[0].toUpperCase() : '?'

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'var(--bg-base)',
      fontFamily: 'var(--font-sans)',
      overflow: 'hidden',
    }}>

      {/* ═══ SIDEBAR ═══ */}
      <motion.aside
        initial="closed"
        animate={collapsed ? 'closed' : 'open'}
        variants={sidebarVariants}
        transition={transition}
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
        style={{
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          background: 'var(--bg-base)',
          borderRight: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Nav — starts from top, no logo section */}
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto', overflowX: 'hidden' }}>
          {NAV_ITEMS.map(({ label, href, Icon, pro }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname?.startsWith(href + '/'))
            return (
              <NavItem
                key={href}
                label={label}
                href={href}
                Icon={Icon}
                active={active}
                pro={pro}
                isPro={isPro}
                collapsed={collapsed}
              />
            )
          })}
        </nav>
      </motion.aside>

      {/* ═══ MAIN ═══ */}
      <div style={{
        flex: 1,
        marginLeft: 52,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}>

        {/* TOPBAR */}
        <header style={{
          height: 52,
          background: 'var(--bg-base)',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0,
          zIndex: 9,
        }}>
          <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
          }}>
            Hi, <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{firstName}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/docs" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              color: 'var(--text-muted)',
              fontSize: 'var(--text-sm)',
            }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Search docs</span>
            </Link>

            <div style={{
              width: 30, height: 30,
              borderRadius: '50%',
              background: 'var(--brand-bg)',
              border: '1px solid var(--brand-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--brand-primary)',
              fontFamily: 'var(--font-mono)',
              flexShrink: 0,
            }}>
              {initial}
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px',
          background: 'var(--bg-base)',
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}

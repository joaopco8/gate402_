'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CheckIcon } from 'lucide-react'
import { motion } from 'framer-motion'

// ─── Icons ───────────────────────────────────────────────────────────────────

const IconOverview = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="1.5" width="5" height="5" rx="1"/>
    <rect x="8.5" y="1.5" width="5" height="5" rx="1"/>
    <rect x="1.5" y="8.5" width="5" height="5" rx="1"/>
    <rect x="8.5" y="8.5" width="5" height="5" rx="1"/>
  </svg>
)

const IconWallet = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3.5" width="13" height="9" rx="1.5"/>
    <path d="M1 6.5h13"/>
    <circle cx="11" cy="10" r="1" fill="currentColor" stroke="none"/>
    <path d="M5 3.5V2.5a1 1 0 011-1h3a1 1 0 011 1v1"/>
  </svg>
)

const IconEndpoints = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="3.5" cy="7.5" r="2"/>
    <circle cx="11.5" cy="3.5" r="1.5"/>
    <circle cx="11.5" cy="11.5" r="1.5"/>
    <path d="M5.4 6.6L10 4.4"/>
    <path d="M5.4 8.4L10 10.6"/>
  </svg>
)

const IconPlayground = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="2" width="13" height="11" rx="1.5"/>
    <path d="M1 5h13"/>
    <path d="M4 8.5l2 1.5-2 1.5"/>
    <path d="M8.5 11h2.5"/>
  </svg>
)

const IconDocs = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.5 13C5.5 11.5 3.5 11 1.5 11V3c2 0 4 .5 6 2 2-1.5 4-2 6-2v8c-2 0-4 .5-6 2z"/>
    <path d="M7.5 13V5"/>
  </svg>
)

const IconSettings = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="7.5" r="2"/>
    <path d="M7.5 1.5v1.8M7.5 11.7v1.8M1.5 7.5h1.8M11.7 7.5h1.8M3.4 3.4l1.3 1.3M10.3 10.3l1.3 1.3M3.4 11.6l1.3-1.3M10.3 4.7l1.3-1.3"/>
  </svg>
)

const IconBilling = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="13" height="9" rx="1.5"/>
    <path d="M1 6h13"/>
    <path d="M4 9.5h2M9.5 9.5h1.5"/>
  </svg>
)

const IconAnalytics = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 11 4.5 6.5 7.5 8.5 11 4 14 5"/>
    <line x1="1" y1="13.5" x2="14" y2="13.5"/>
  </svg>
)

const NAV_ITEMS = [
  { label: 'Overview',   href: '/dashboard',  Icon: IconOverview },
  { label: 'Analytics',  href: '/analytics',  Icon: IconAnalytics },
  { label: 'Wallet',     href: '/wallet',     Icon: IconWallet },
  { label: 'Endpoints',  href: '/endpoints',  Icon: IconEndpoints },
  { label: 'Playground', href: '/playground', Icon: IconPlayground },
  { label: 'Docs',       href: '/docs',       Icon: IconDocs },
  { label: 'Billing',    href: '/billing',    Icon: IconBilling },
  { label: 'Settings',   href: '/settings',   Icon: IconSettings },
]

// ─── Framer-motion variants ───────────────────────────────────────────────────

const sidebarVariants = {
  open:   { width: '220px' },
  closed: { width: '56px' },
}

const labelVariants = {
  open:   { opacity: 1, x: 0,   display: 'block', transition: { x: { stiffness: 1000, velocity: -100 } } },
  closed: { opacity: 0, x: -12, transition: { x: { stiffness: 100 } },
    transitionEnd: { display: 'none' } },
}

const transitionProps = {
  type: 'tween' as const,
  ease: 'easeOut' as const,
  duration: 0.2,
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname  = usePathname()
  const router    = useRouter()
  const [email, setEmail]     = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(true)
  const [menuOpen, setMenuOpen]   = useState(false)
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

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const initial = email ? email[0].toUpperCase() : '?'

  return (
    <motion.aside
      initial="closed"
      animate={collapsed ? 'closed' : 'open'}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => { setCollapsed(true); setMenuOpen(false) }}
      style={{
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        background: '#0A0A0A',
        borderRight: '1px solid #1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{
        padding: '0 14px',
        display: 'flex',
        alignItems: 'center',
        minHeight: 64,
        borderBottom: '1px solid #1a1a1a',
        gap: 10,
        overflow: 'hidden',
      }}>
        <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          {collapsed
            ? <img src="/icon-logo.png" alt="Gate402" style={{ height: 28, width: 28, display: 'block', flexShrink: 0, objectFit: 'contain' }} />
            : <img src="/logo-gate.png" alt="Gate402" style={{ height: 22, width: 'auto', display: 'block', flexShrink: 0 }} />
          }
        </a>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_ITEMS.map(({ label, href, Icon }) => {
          const active = pathname === href || pathname?.startsWith(href + '/')
          return (
            <a
              key={href}
              href={href}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 14px',
                margin: '1px 6px',
                fontSize: 14,
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                color: active ? '#fff' : '#666',
                background: active ? '#111' : 'transparent',
                borderLeft: active ? '2px solid #00bc7d' : '2px solid transparent',
                borderRadius: 6,
                transition: 'color 150ms ease, background 150ms ease, border-color 150ms ease',
                cursor: 'pointer',
                textDecoration: 'none',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.color = '#fff'
                  e.currentTarget.style.background = '#111'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.color = '#666'
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: active ? '#00bc7d' : 'inherit' }}>
                <Icon />
              </span>
              <motion.span variants={labelVariants} style={{ overflow: 'hidden' }}>
                {label}
              </motion.span>
            </a>
          )
        })}
      </nav>

      {/* Bottom user section */}
      <div style={{ borderTop: '1px solid #1a1a1a', padding: '12px 8px', position: 'relative' }}>

        {/* User popup menu */}
        {menuOpen && !collapsed && (
          <>
            <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
            <div style={{
              position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, right: 0,
              background: '#0A0A0A', border: '1px solid #1a1a1a', borderRadius: 6,
              zIndex: 50, overflow: 'hidden',
            }}>
              {/* Account header */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar className="size-7 ring-2 ring-[#00bc7d] ring-offset-2 ring-offset-black">
                    <AvatarFallback className="bg-[#111] text-[#888] text-[11px] font-mono">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <span style={{
                    position: 'absolute', bottom: -3, right: -3,
                    width: 14, height: 14, borderRadius: '50%',
                    background: '#00bc7d',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <CheckIcon size={9} color="#000" strokeWidth={3} />
                  </span>
                </div>
                <div>
                  <div style={{
                    fontSize: 12, color: '#fff', fontFamily: 'var(--font-display)',
                    fontWeight: 500, marginBottom: 4,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {email ?? '...'}
                  </div>
                  {isPro ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: 'rgba(0,188,125,0.08)', color: '#00bc7d',
                      border: '1px solid rgba(0,188,125,0.2)', borderRadius: 6,
                      padding: '2px 8px', fontSize: 10,
                      fontFamily: 'var(--font-code)',
                    }}>✦ Pro</span>
                  ) : (
                    <span style={{ fontSize: 10, color: '#444', fontFamily: 'var(--font-code)' }}>Free plan</span>
                  )}
                </div>
              </div>

              {/* Items */}
              <div style={{ padding: '4px 0' }}>
                {!isPro && (
                  <a href="/checkout" onClick={() => setMenuOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', margin: '1px 8px', borderRadius: 6,
                    fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 400,
                    color: '#00bc7d', textDecoration: 'none',
                    borderLeft: '2px solid transparent', transition: 'all 150ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.borderLeftColor = '#00bc7d' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = 'transparent' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7.5 1v13M1 7.5h13"/>
                    </svg>
                    Upgrade to Pro
                  </a>
                )}
                {isPro && (
                  <a href="/billing" onClick={() => setMenuOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', margin: '1px 8px', borderRadius: 6,
                    fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 400,
                    color: '#888', textDecoration: 'none',
                    borderLeft: '2px solid transparent', transition: 'all 150ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888' }}
                  >
                    <IconBilling />
                    Manage plan
                  </a>
                )}
                <a href="/settings" onClick={() => setMenuOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', margin: '1px 8px', borderRadius: 6,
                  fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 400,
                  color: '#888', textDecoration: 'none',
                  borderLeft: '2px solid transparent', transition: 'all 150ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888' }}
                >
                  <IconSettings />
                  Settings
                </a>
              </div>

              {/* Sign out */}
              <div style={{ borderTop: '1px solid #1a1a1a', padding: '4px 0' }}>
                <button onClick={() => { setMenuOpen(false); handleLogout() }} style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '9px 12px', margin: '1px 8px', borderRadius: 6,
                  fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 400,
                  color: '#888', background: 'transparent', border: 'none', cursor: 'pointer',
                  borderLeft: '2px solid transparent', transition: 'all 150ms ease',
                  boxSizing: 'border-box',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#ff4444'; e.currentTarget.style.borderLeftColor = '#ff4444' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888'; e.currentTarget.style.borderLeftColor = 'transparent' }}
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 7.5H2m0 0l3-3M2 7.5l3 3"/><path d="M6 3.5H12a1 1 0 011 1v6a1 1 0 01-1 1H6"/>
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          </>
        )}

        {/* Clickable user row */}
        <div
          onClick={() => !collapsed && setMenuOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            borderRadius: 6, padding: '6px 6px',
            transition: 'background 150ms',
            background: menuOpen ? '#111' : 'transparent',
            overflow: 'hidden',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#111' }}
          onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.background = 'transparent' }}
        >
          <div style={{ position: 'relative', flexShrink: 0 }} title={collapsed ? (email ?? undefined) : undefined}>
            <Avatar className="size-7 ring-2 ring-[#00bc7d] ring-offset-2 ring-offset-black">
              <AvatarFallback className="bg-[#111] text-[#888] text-[11px] font-mono">
                {initial}
              </AvatarFallback>
            </Avatar>
            <span style={{
              position: 'absolute', bottom: -3, right: -3,
              width: 14, height: 14, borderRadius: '50%',
              background: '#00bc7d',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckIcon size={9} color="#000" strokeWidth={3} />
            </span>
          </div>

          <motion.div variants={labelVariants} style={{ display: 'flex', alignItems: 'center', flex: 1, gap: 6, overflow: 'hidden' }}>
            <span style={{
              fontSize: 12, color: '#666',
              overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: 'nowrap', flex: 1,
            }}>
              {email ?? '...'}
            </span>
            <span style={{ color: '#333', fontSize: 12, flexShrink: 0 }}>⋯</span>
          </motion.div>
        </div>
      </div>
    </motion.aside>
  )
}

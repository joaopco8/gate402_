'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'

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

const IconLogout = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 4.5L11 6.5L8.5 8.5"/>
    <path d="M11 6.5H4.5"/>
    <path d="M4.5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h2.5"/>
  </svg>
)

// ─── Nav groups ──────────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { label: 'Overview',   href: '/dashboard',  Icon: IconOverview },
      { label: 'Wallet',     href: '/wallet',     Icon: IconWallet },
      { label: 'Endpoints',  href: '/endpoints',  Icon: IconEndpoints },
    ],
  },
  {
    label: 'Developer',
    items: [
      { label: 'Playground', href: '/playground', Icon: IconPlayground },
      { label: 'Docs',       href: '/docs',       Icon: IconDocs },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Settings',   href: '/settings',   Icon: IconSettings },
    ],
  },
]

// ─── Component ───────────────────────────────────────────────────────────────

interface SidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [logoutHovered, setLogoutHovered] = useState(false)

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
    router.push('/login')
  }

  const initial = email ? email[0].toUpperCase() : '?'

  return (
    <aside style={{
      width: 220,
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: mobileOpen ? 0 : undefined,
      background: '#050505',
      borderRight: '1px solid #1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
    }}>

      {/* ── Logo ── */}
      <div style={{
        padding: '22px 18px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderBottom: '1px solid #1a1a1a',
      }}>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#555',
              cursor: 'pointer',
              fontSize: 16,
              padding: '0 8px 0 0',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}

        <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: 15,
            color: '#fff',
            letterSpacing: '-0.01em',
          }}>
            gate402
          </span>
          <span style={{
            background: 'rgba(0,255,136,0.1)',
            color: '#00ff88',
            border: '1px solid rgba(0,255,136,0.2)',
            borderRadius: 4,
            padding: '1px 6px',
            fontSize: 9,
            fontFamily: 'var(--font-code)',
            fontWeight: 600,
            letterSpacing: '0.1em',
            animation: 'liveBlink 2s ease-in-out infinite',
          }}>
            LIVE
          </span>
        </a>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {NAV_GROUPS.map(({ label, items }) => (
          <div key={label} style={{ marginBottom: 4 }}>
            {/* Group label */}
            <div style={{
              padding: '8px 18px 4px',
              fontSize: 10,
              fontFamily: 'var(--font-code)',
              color: '#2a2a2a',
              letterSpacing: '0.1em',
              fontWeight: 600,
            }}>
              {label.toUpperCase()}
            </div>

            {/* Items */}
            {items.map(({ label: itemLabel, href, Icon }) => {
              const active = pathname === href
              return (
                <NavItem
                  key={href}
                  href={href}
                  label={itemLabel}
                  Icon={Icon}
                  active={active}
                  onClick={onClose}
                />
              )
            })}
          </div>
        ))}
      </nav>

      {/* ── User footer ── */}
      <div style={{
        borderTop: '1px solid #1a1a1a',
        padding: '14px 18px',
        background: '#050505',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Avatar */}
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(0,255,136,0.08)',
            border: '1px solid rgba(0,255,136,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontFamily: 'var(--font-code)',
            fontWeight: 600,
            color: '#00ff88',
            flexShrink: 0,
          }}>
            {initial}
          </div>

          {/* Email */}
          <span style={{
            fontSize: 12,
            fontFamily: 'var(--font-display)',
            color: '#555',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}>
            {email ?? '...'}
          </span>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Sign out"
            onMouseEnter={() => setLogoutHovered(true)}
            onMouseLeave={() => setLogoutHovered(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: logoutHovered ? '#ff4444' : '#333',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              transition: 'color 150ms',
              flexShrink: 0,
            }}
          >
            <IconLogout />
          </button>
        </div>
      </div>
    </aside>
  )
}

// ─── NavItem ─────────────────────────────────────────────────────────────────

function NavItem({
  href,
  label,
  Icon,
  active,
  onClick,
}: {
  href: string
  label: string
  Icon: () => JSX.Element
  active: boolean
  onClick?: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        margin: '1px 8px',
        padding: '8px 10px',
        borderRadius: 6,
        fontSize: 13,
        fontFamily: 'var(--font-display)',
        fontWeight: active ? 500 : 400,
        color: active ? '#00ff88' : hovered ? '#fff' : '#555',
        background: active
          ? 'rgba(0,255,136,0.07)'
          : hovered
          ? 'rgba(255,255,255,0.04)'
          : 'transparent',
        transition: 'all 120ms ease',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Active indicator */}
      {active && (
        <span style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 2,
          height: 16,
          borderRadius: 2,
          background: '#00ff88',
        }} />
      )}

      <span style={{
        display: 'flex',
        alignItems: 'center',
        opacity: active ? 1 : hovered ? 0.9 : 0.5,
        transition: 'opacity 120ms ease',
        flexShrink: 0,
      }}>
        <Icon />
      </span>

      {label}
    </a>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import { useUser } from '../hooks/useUser'

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

const NAV_ITEMS = [
  { label: 'Overview',   href: '/dashboard',  Icon: IconOverview },
  { label: 'Wallet',     href: '/wallet',     Icon: IconWallet },
  { label: 'Endpoints',  href: '/endpoints',  Icon: IconEndpoints },
  { label: 'Playground', href: '/playground', Icon: IconPlayground },
  { label: 'Docs',       href: '/docs',       Icon: IconDocs },
  { label: 'Settings',   href: '/settings',   Icon: IconSettings },
]

interface SidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
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
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      transform: mobileOpen !== undefined ? undefined : undefined,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        {onClose && (
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, padding: '0 8px 0 0', lineHeight: 1 }}
          >
            ✕
          </button>
        )}
        <a href="/dashboard">
          <img src="/logo-gate.png" alt="Gate402" style={{ height: 24, width: 'auto', display: 'block' }} />
        </a>
        <span style={{
          background: 'rgba(0,255,136,0.1)',
          color: '#00ff88',
          border: '1px solid rgba(0,255,136,0.25)',
          borderRadius: 4,
          padding: '1px 6px',
          fontSize: 9,
          fontFamily: 'var(--font-code)',
          fontWeight: 500,
          letterSpacing: '0.08em',
          animation: 'liveBlink 2s ease-in-out infinite',
        }}>
          LIVE
        </span>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)', margin: '0 0 8px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {NAV_ITEMS.map(({ label, href, Icon }) => {
          const active = pathname === href
          return (
            <a
              key={href}
              href={href}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 20px',
                fontSize: 14,
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                color: active ? 'var(--green)' : 'var(--text-secondary)',
                background: active ? 'rgba(0,255,136,0.06)' : 'transparent',
                borderLeft: active ? '2px solid var(--green)' : '2px solid transparent',
                transition: 'all 150ms ease',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.color = '#fff'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, opacity: active ? 1 : 0.6 }}>
                <Icon />
              </span>
              {label}
            </a>
          )
        })}
      </nav>

      {/* Bottom user section */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px' }}>
        {/* Plan badge / upgrade link */}
        {userData && (
          <div style={{ marginBottom: 10 }}>
            {isPro ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(0,255,136,0.08)',
                color: '#00ff88',
                border: '1px solid rgba(0,255,136,0.2)',
                borderRadius: 4,
                padding: '2px 8px',
                fontSize: 10,
                fontFamily: 'var(--font-code)',
                fontWeight: 600,
                letterSpacing: '0.08em',
              }}>
                ✦ PRO
              </span>
            ) : (
              <a
                href="/checkout"
                style={{
                  fontSize: 11,
                  fontFamily: 'var(--font-code)',
                  color: '#333',
                  textDecoration: 'none',
                  transition: 'color 150ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#00ff88')}
                onMouseLeave={e => (e.currentTarget.style.color = '#333')}
              >
                Upgrade to Pro →
              </a>
            )}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Avatar */}
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#1a1a1a',
            border: '1px solid #333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontFamily: 'var(--font-code)',
            color: '#888',
            flexShrink: 0,
          }}>
            {initial}
          </div>

          {/* Email */}
          <span style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            maxWidth: 120,
          }}>
            {email ?? '...'}
          </span>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#333',
              cursor: 'pointer',
              fontSize: 14,
              padding: '2px 4px',
              borderRadius: 4,
              transition: 'color 150ms',
              flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ff4444')}
            onMouseLeave={e => (e.currentTarget.style.color = '#333')}
          >
            →
          </button>
        </div>
      </div>
    </aside>
  )
}

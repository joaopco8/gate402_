'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'

const NAV_ITEMS = [
  { label: 'Overview',   href: '/',           icon: '▣' },
  { label: 'Wallet',     href: '/wallet',     icon: '◐' },
  { label: 'Endpoints',  href: '/endpoints',  icon: '◈' },
  { label: 'Playground', href: '/playground', icon: '◉' },
  { label: 'Docs',       href: '/docs',       icon: '◎' },
  { label: 'Settings',   href: '/settings',   icon: '◆' },
]

interface SidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const [email, setEmail] = useState<string | null>(null)

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
        <a href="/">
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
        {NAV_ITEMS.map(({ label, href, icon }) => {
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
              <span style={{ fontSize: 12, fontFamily: 'var(--font-code)', opacity: 0.7 }}>{icon}</span>
              {label}
            </a>
          )
        })}
      </nav>

      {/* Bottom user section */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px' }}>
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

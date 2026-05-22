'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import Link from 'next/link'
import { useUser } from '../hooks/useUser'

const NAV_ITEMS = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    )
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1 12l4-4 3 3 4-5 3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    pro: true
  },
  {
    label: 'Wallet',
    href: '/wallet',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="4" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M1 7h14" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="12" cy="10" r="1" fill="currentColor"/>
      </svg>
    )
  },
  {
    label: 'Endpoints',
    href: '/endpoints',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 8h12M8 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    label: 'Playground',
    href: '/playground',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 3l8 5-8 5V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    )
  },
]

const BOTTOM_ITEMS = [
  { label: 'Docs', href: '/docs', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 2h7l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )},
  { label: 'Billing', href: '/billing', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M1 7h14" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )},
  { label: 'Settings', href: '/settings', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )},
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
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
    router.push('/auth/login')
  }

  const initial = email ? email[0].toUpperCase() : '?'
  const firstName = email ? email.split('@')[0] : 'User'

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'var(--bg-base)',
      fontFamily: 'var(--font-sans)',
      overflow: 'hidden',
    }}>

      {/* ═══ SIDEBAR ═══ */}
      <aside style={{
        width: 240,
        background: 'var(--bg-base)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 10,
      }}>

        {/* Logo */}
        <div style={{
          padding: '16px 16px 12px',
          borderBottom: '1px solid var(--border-default)',
        }}>
          <Link href="/dashboard" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
          }}>
            <div style={{
              width: 28, height: 28,
              background: 'var(--brand-bg)',
              border: '1px solid var(--brand-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--brand-primary)',
              }}>G4</span>
            </div>
            <span style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.2px',
            }}>
              gate402
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>

          <div style={{
            padding: '8px 8px 4px',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            Main
          </div>

          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 8px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                marginBottom: 1,
                background: isActive ? 'var(--bg-surface)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: 'var(--text-sm)',
                fontWeight: isActive ? 500 : 400,
                transition: 'all 0.1s',
              }}>
                <span style={{
                  color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.pro && !isPro && (
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: 9,
                    fontWeight: 600,
                    color: 'var(--brand-primary)',
                    background: 'var(--brand-muted)',
                    border: '1px solid var(--brand-border)',
                    borderRadius: 3,
                    padding: '1px 5px',
                    letterSpacing: '0.08em',
                  }}>PRO</span>
                )}
              </Link>
            )
          })}

          <div style={{
            height: 1,
            background: 'var(--border-default)',
            margin: '8px 0',
          }} />

          <div style={{
            padding: '4px 8px 4px',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            Account
          </div>

          {BOTTOM_ITEMS.map(item => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 8px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                marginBottom: 1,
                background: isActive ? 'var(--bg-surface)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: 'var(--text-sm)',
                fontWeight: isActive ? 500 : 400,
              }}>
                <span style={{
                  color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center',
                }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User card */}
        <div style={{
          padding: '8px',
          borderTop: '1px solid var(--border-default)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px',
            borderRadius: 'var(--radius-md)',
          }}>
            <div style={{
              width: 28, height: 28,
              borderRadius: '50%',
              background: 'var(--brand-bg)',
              border: '1px solid var(--brand-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--brand-primary)',
              fontFamily: 'var(--font-mono)',
            }}>
              {initial}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {firstName}
              </div>
              <div style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {isPro ? 'Pro plan' : 'Free plan'}
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign out"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: 4,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 1H2a1 1 0 00-1 1v10a1 1 0 001 1h3M9 10l4-3-4-3M13 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ═══ MAIN ═══ */}
      <div style={{
        flex: 1,
        marginLeft: 240,
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
          position: 'sticky',
          top: 0,
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
              cursor: 'pointer',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Search docs</span>
            </Link>

            <Link href="/docs" style={{
              width: 32, height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)',
              textDecoration: 'none',
            }} title="Help">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M5.5 5.5a1.5 1.5 0 013 .5c0 1-1.5 1.5-1.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="7" cy="10.5" r="0.5" fill="currentColor"/>
              </svg>
            </Link>

            <div style={{
              width: 32, height: 32,
              borderRadius: '50%',
              background: 'var(--brand-bg)',
              border: '1px solid var(--brand-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
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

'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import { useUser } from '../hooks/useUser'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CheckIcon } from 'lucide-react'

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

const IconChevron = ({ collapsed }: { collapsed: boolean }) => (
  <svg
    width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round"
    style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }}
  >
    <path d="M8 3L5 6.5 8 10"/>
  </svg>
)

const IconBilling = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="13" height="9" rx="1.5"/>
    <path d="M1 6h13"/>
    <path d="M4 9.5h2M9.5 9.5h1.5"/>
  </svg>
)

const NAV_ITEMS = [
  { label: 'Overview',   href: '/dashboard',  Icon: IconOverview },
  { label: 'Wallet',     href: '/wallet',     Icon: IconWallet },
  { label: 'Endpoints',  href: '/endpoints',  Icon: IconEndpoints },
  { label: 'Playground', href: '/playground', Icon: IconPlayground },
  { label: 'Docs',       href: '/docs',       Icon: IconDocs },
  { label: 'Billing',    href: '/billing',    Icon: IconBilling },
  { label: 'Settings',   href: '/settings',   Icon: IconSettings },
]

const SIDEBAR_EXPANDED = 220
const SIDEBAR_COLLAPSED = 56

interface SidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [tooltip, setTooltip] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
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
  const width = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED

  return (
    <aside style={{
      width,
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: mobileOpen ? 0 : undefined,
      background: '#0A0A0A',
      borderRight: '1px solid #1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      transition: 'width 200ms ease',
      overflow: 'hidden',
    }}>

      {/* Logo + collapse toggle */}
      <div style={{
        padding: '20px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        paddingLeft: collapsed ? 0 : 20,
        paddingRight: collapsed ? 0 : 12,
        minHeight: 64,
        borderBottom: '1px solid #1a1a1a',
      }}>
        {!collapsed && (
          <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <img src="/logo-gate.png" alt="Gate402" style={{ height: 22, width: 'auto', display: 'block' }} />
          </a>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 6,
            flexShrink: 0,
            transition: 'color 150ms, background 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#111' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#444'; e.currentTarget.style.background = 'transparent' }}
        >
          <IconChevron collapsed={collapsed} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_ITEMS.map(({ label, href, Icon }) => {
          const active = pathname === href
          return (
            <div key={href} style={{ position: 'relative' }}>
              <a
                href={href}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  margin: '1px 8px',
                  fontSize: 14,
                  fontFamily: 'var(--font-display)',
                  fontWeight: 400,
                  color: active ? '#fff' : '#888',
                  background: active ? '#0a0a0a' : 'transparent',
                  borderLeft: active ? '2px solid #00bc7d' : '2px solid transparent',
                  borderRadius: 6,
                  transition: 'all 150ms ease',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.color = '#fff'
                    e.currentTarget.style.background = '#0f0f0f'
                  }
                  if (collapsed) setTooltip(label)
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.color = '#888'
                    e.currentTarget.style.background = 'transparent'
                  }
                  setTooltip(null)
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: active ? '#00bc7d' : 'currentColor' }}>
                  <Icon />
                </span>
                {!collapsed && <span>{label}</span>}
              </a>

              {/* Tooltip when collapsed */}
              {collapsed && tooltip === label && (
                <div style={{
                  position: 'fixed',
                  left: SIDEBAR_COLLAPSED + 8,
                  transform: 'translateY(-50%)',
                  background: '#111',
                  border: '1px solid #1a1a1a',
                  borderRadius: 6,
                  padding: '6px 10px',
                  fontSize: 12,
                  fontFamily: 'var(--font-display)',
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 200,
                }}>
                  {label}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom user section */}
      <div style={{ borderTop: '1px solid #1a1a1a', padding: collapsed ? '12px 0' : '14px 16px', position: 'relative' }}>

        {/* User popup menu */}
        {menuOpen && !collapsed && (
          <>
            <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
            <div style={{
              position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, right: 0,
              background: '#0A0A0A', border: '1px solid #1a1a1a', borderRadius: 8,
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
                  fontWeight: 500, marginBottom: 6,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {email ?? '...'}
                </div>
                {isPro ? (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: 'rgba(0,188,125,0.08)', color: '#00bc7d',
                    border: '1px solid rgba(0,188,125,0.2)', borderRadius: 4,
                    padding: '2px 8px', fontSize: 10,
                    fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em',
                  }}>✦ PRO</span>
                ) : (
                  <span style={{ fontSize: 10, color: '#444', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em' }}>FREE PLAN</span>
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
                  <a href="/checkout" onClick={() => setMenuOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', margin: '1px 8px', borderRadius: 6,
                    fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 400,
                    color: '#888', textDecoration: 'none',
                    borderLeft: '2px solid transparent', transition: 'all 150ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="13" height="9" rx="1.5"/><path d="M1 6h13"/>
                    </svg>
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
            gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            cursor: collapsed ? 'default' : 'pointer',
            borderRadius: 6, padding: '4px 4px',
            transition: 'background 150ms',
            background: menuOpen ? '#111' : 'transparent',
          }}
          onMouseEnter={e => { if (!collapsed) e.currentTarget.style.background = '#111' }}
          onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.background = 'transparent' }}
        >
          <div
            title={collapsed ? (email ?? undefined) : undefined}
            style={{ position: 'relative', flexShrink: 0 }}
          >
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

          {!collapsed && (
            <>
              <span style={{
                fontSize: 12, color: '#666',
                overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap', flex: 1,
              }}>
                {email ?? '...'}
              </span>
              <span style={{ color: '#333', fontSize: 12, flexShrink: 0 }}>⋯</span>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}

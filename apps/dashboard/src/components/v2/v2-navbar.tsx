// @ts-nocheck
'use client'
import React, { useState, useEffect, useRef } from 'react'

const MONO  = "'JetBrains Mono', monospace"
const SANS  = "'Inter', sans-serif"
const GREEN = '#7AF279'
const MUTED = '#7A8C79'
const DIM   = '#4A5549'
const TEXT  = '#E8F4EE'
const LINE  = '1px solid #2A2E2A'
const BG    = '#1B1E1B'

/* ── nav data ── */
const PRODUCT_ITEMS = [
  { label: 'Gate402 SDK',       desc: 'x402 payment middleware',        href: '/docs' },
  { label: 'Dashboard',         desc: 'Analytics and revenue tracking',  href: '/dashboard' },
  { label: 'Metering Engine',   desc: 'Per-call pricing control',        href: '/docs#metering' },
  { label: 'Wallet Management', desc: 'USDC settlement on Solana',       href: '/docs#wallet' },
]

const DEV_ITEMS = [
  { label: 'Documentation', desc: 'Full SDK reference and guides', href: '/v2/docs' },
  { label: 'Quick Start',   desc: '5 minutes to first paid call',  href: '/v2/docs#quick-start' },
  { label: 'API Reference', desc: 'All server endpoints',          href: '/v2/docs#api-reference' },
  { label: 'GitHub',        desc: 'MIT licensed — open source',    href: 'https://github.com/joaopco8/gate402_', external: true },
  { label: 'Changelog',     desc: "What's new",                    href: '/v2/docs#api-reference' },
]

type NavItem = { label: string; desc: string; href: string; external?: boolean }

/* ── dropdown panel ── */
function DropPanel({ items, visible }: { items: NavItem[]; visible: boolean }) {
  return (
    <div style={{
      position: 'absolute',
      top: 'calc(100% + 12px)',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 200,
      pointerEvents: visible ? 'auto' : 'none',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(8px)',
      transition: 'opacity 0.18s ease, transform 0.18s ease',
      minWidth: 260,
    }}>
      <div style={{
        background: 'rgba(14,18,14,0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: LINE,
        borderRadius: 10,
        padding: 6,
        boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
      }}>
        {items.map((item, i) => (
          <a
            key={i}
            href={item.href}
            target={item.external ? '_blank' : undefined}
            rel={item.external ? 'noopener noreferrer' : undefined}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              padding: '9px 12px',
              borderRadius: 6,
              textDecoration: 'none',
              transition: 'background 0.12s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(122,242,121,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ fontSize: 13, fontWeight: 500, color: TEXT, fontFamily: SANS, letterSpacing: '-0.01em' }}>
              {item.label}
            </span>
            <span style={{ fontSize: 11, color: DIM, fontFamily: SANS, lineHeight: 1.4 }}>
              {item.desc}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}

/* ── nav trigger ── */
function NavTrigger({ label, items }: { label: string; items: NavItem[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={ref}
      style={{ position: 'relative' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 13,
        fontWeight: 400,
        fontFamily: SANS,
        color: open ? TEXT : MUTED,
        padding: '4px 0',
        transition: 'color 0.15s ease',
      }}>
        {label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', opacity: 0.5 }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <DropPanel items={items} visible={open} />
    </div>
  )
}

/* ── nav link ── */
function NavLink({ label, href, active }: { label: string; href: string; active?: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <a
      href={href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontSize: 13,
        fontWeight: 400,
        fontFamily: SANS,
        color: active ? TEXT : hov ? TEXT : MUTED,
        textDecoration: 'none',
        transition: 'color 0.15s ease',
      }}
    >
      {label}
    </a>
  )
}

/* ── mobile menu ── */
function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      top: 64,
      background: 'rgba(14,18,14,0.98)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      zIndex: 150,
      padding: '24px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      opacity: open ? 1 : 0,
      pointerEvents: open ? 'auto' : 'none',
      transition: 'opacity 0.2s ease',
      overflowY: 'auto',
    }}>
      {[
        { label: 'Product', items: PRODUCT_ITEMS },
        { label: 'Developers', items: DEV_ITEMS },
      ].map(group => (
        <div key={group.label} style={{ borderBottom: LINE, paddingBottom: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: DIM, fontFamily: MONO, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            {group.label}
          </div>
          {group.items.map(item => (
            <a key={item.label} href={item.href} onClick={onClose}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
              style={{ display: 'block', padding: '8px 0', fontSize: 14, color: TEXT, textDecoration: 'none', fontFamily: SANS }}>
              {item.label}
            </a>
          ))}
        </div>
      ))}
      <div style={{ borderBottom: LINE, paddingBottom: 16, marginBottom: 24 }}>
        {[{ label: 'Pricing', href: '/v2/pricing' }, { label: 'Docs', href: '/v2/docs' }].map(item => (
          <a key={item.label} href={item.href} onClick={onClose}
            style={{ display: 'block', padding: '8px 0', fontSize: 14, color: TEXT, textDecoration: 'none', fontFamily: SANS }}>
            {item.label}
          </a>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <a href="/auth/login" onClick={onClose}
          style={{ fontSize: 14, color: MUTED, textDecoration: 'none', textAlign: 'center', padding: 12, border: LINE, borderRadius: 6, fontFamily: SANS }}>
          Sign in
        </a>
        <a href="/auth/login" onClick={onClose}
          style={{ fontSize: 14, fontWeight: 500, color: '#1B1E1B', background: GREEN, textDecoration: 'none', textAlign: 'center', padding: 12, borderRadius: 6, fontFamily: SANS }}>
          Get started →
        </a>
      </div>
    </div>
  )
}

/* ── main export ── */
export function V2Navbar({ activePage }: { activePage?: string }) {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(14,18,14,0.96)' : 'rgba(27,30,27,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: LINE,
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          height: 64,
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'space-between',
          borderLeft: LINE,
          borderRight: LINE,
        }}>

          {/* logo */}
          <a href="/v2" style={{
            flexShrink: 0, textDecoration: 'none', display: 'flex', alignItems: 'center',
            padding: '0 32px',
            borderRight: LINE,
          }}>
            <img
              src="/logos/metera-logo.png"
              alt="Metera"
              style={{ height: 28, width: 'auto', display: 'block', filter: 'brightness(0) invert(1)' }}
            />
          </a>

          {/* desktop nav */}
          <nav className="v2nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 28, flex: 1, padding: '0 32px' }}>
            <NavTrigger label="Product"    items={PRODUCT_ITEMS} />
            <NavTrigger label="Developers" items={DEV_ITEMS} />
            <NavLink label="Pricing" href="/v2/pricing" active={activePage === 'pricing'} />
            <NavLink label="Docs"    href="/v2/docs" />
          </nav>

          {/* desktop right */}
          <div className="v2nav-desktop" style={{
            display: 'flex', alignItems: 'center', gap: 16,
            flexShrink: 0,
            padding: '0 32px',
            borderLeft: LINE,
          }}>
            <NavLink label="Sign in" href="/auth/login" />
            <a
              href="/auth/login"
              style={{
                fontSize: 13,
                fontWeight: 500,
                fontFamily: SANS,
                color: '#1B1E1B',
                background: GREEN,
                textDecoration: 'none',
                padding: '7px 16px',
                borderRadius: 6,
                whiteSpace: 'nowrap',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Get started →
            </a>
          </div>

          {/* mobile toggle */}
          <button
            className="v2nav-mobile"
            onClick={() => setMobileOpen(o => !o)}
            style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', padding: 4, display: 'none' }}
            aria-label="Toggle menu"
          >
            {mobileOpen
              ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 18L18 6M6 6l12 12"/></svg>
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            }
          </button>

        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <style>{`
        .v2nav-desktop { display: flex !important; }
        .v2nav-mobile  { display: none  !important; }
        @media (max-width: 768px) {
          .v2nav-desktop { display: none  !important; }
          .v2nav-mobile  { display: block !important; }
        }
      `}</style>
    </>
  )
}

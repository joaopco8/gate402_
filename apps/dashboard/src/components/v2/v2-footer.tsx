// @ts-nocheck
'use client'
import React from 'react'

const LINE  = '1px solid #2A2E2A'
const MONO  = "'JetBrains Mono', monospace"
const SANS  = "'Inter', sans-serif"
const GREEN = '#7AF279'
const MUTED = '#7A8C79'
const DIM   = '#4A5549'
const TEXT  = '#E8F4EE'

const COLUMNS = [
  {
    title: 'PRODUCT',
    links: [
      { label: 'Hosted APIs',    href: '/proxy' },
      { label: 'Agent Wallets',  href: '/agents' },
      { label: 'Marketplace',    href: '/marketplace' },
      { label: 'Dashboard',      href: '/dashboard' },
      { label: 'Pricing',        href: '/v2/pricing' },
    ],
  },
  {
    title: 'DEVELOPERS',
    links: [
      { label: 'Documentation', href: '/v2/docs' },
      { label: 'Quick Start',   href: '/v2/docs#how-it-works' },
      { label: 'API Reference', href: '/v2/docs#x402-flow' },
      { label: 'GitHub',        href: 'https://github.com/joaopco8/gate402_', external: true },
    ],
  },
  {
    title: 'COMPANY',
    links: [
      { label: 'Careers', href: '/v2/hiring', badge: 'Hiring' },
    ],
  },
  {
    title: 'LEGAL',
    links: [
      { label: 'Privacy Policy',   href: '/v2/privacy' },
      { label: 'Terms of Service', href: '/v2/terms' },
      { label: 'Cookie Settings',  href: '/v2/cookies' },
      { label: 'Security',         href: '/v2/security' },
    ],
  },
]

const GithubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
  </svg>
)

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.638 5.902-5.638zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const SOCIAL = [
  { Icon: GithubIcon, href: 'https://github.com/joaopco8/gate402_', label: 'GitHub' },
  { Icon: XIcon,      href: 'https://x.com',                        label: 'Twitter' },
]

function NavLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const [hov, setHov] = React.useState(false)
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontSize: 13, fontFamily: SANS, fontWeight: 300,
        color: hov ? TEXT : MUTED,
        textDecoration: 'none',
        transition: 'color 0.15s ease',
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}
    >
      {children}
    </a>
  )
}

export function V2Footer() {
  return (
    <footer style={{ borderTop: LINE }}>

      {/* main body */}
      <div className="v2r-footer-body" style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 0,
        padding: '64px 64px 56px',
        borderBottom: LINE,
      }}>

        {/* left — logo + desc + social */}
        <div className="v2r-footer-logo" style={{
          display: 'flex', flexDirection: 'column', gap: 24,
          width: 260, flexShrink: 0,
          paddingRight: 48, borderRight: LINE,
          marginRight: 56,
        }}>
          <a href="/v2" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <img
              src="/logo-metera.png"
              alt="Metera"
              style={{ height: 26, width: 'auto', filter: 'brightness(0) invert(1)' }}
            />
          </a>

          <p style={{
            fontSize: 13, color: MUTED, lineHeight: 1.7,
            fontWeight: 300, fontFamily: SANS, margin: 0,
          }}>
            Billing infrastructure for AI agents.
            USDC on Solana. No banks, no credit cards.
          </p>

          {/* social */}
          <div style={{ display: 'flex', gap: 12 }}>
            {SOCIAL.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                style={{
                  width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: LINE, borderRadius: 6,
                  color: MUTED, textDecoration: 'none',
                  transition: 'color 0.15s ease, border-color 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = TEXT
                  e.currentTarget.style.borderColor = '#4A5549'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = MUTED
                  e.currentTarget.style.borderColor = '#2A2E2A'
                }}
              >
                <Icon size={14} strokeWidth={1.5} />
              </a>
            ))}
          </div>

        </div>

        {/* right — columns */}
        <div className="v2r-footer-cols" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0 40px',
          flex: 1,
        }}>
          {COLUMNS.map(col => (
            <div key={col.title} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{
                fontSize: 10, fontFamily: MONO, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: DIM, marginBottom: 4,
              }}>
                {col.title}
              </span>
              {col.links.map(link => (
                <NavLink key={link.label} href={link.href} external={(link as any).external}>
                  {link.label}
                  {(link as any).badge && (
                    <span style={{
                      fontSize: 9, fontFamily: MONO, letterSpacing: '0.06em',
                      color: GREEN, border: `1px solid ${GREEN}44`,
                      borderRadius: 3, padding: '1px 5px',
                      textTransform: 'uppercase',
                    }}>
                      {(link as any).badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

      </div>

      {/* bottom bar */}
      <div className="v2r-footer-bar" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 64px',
        gap: 16,
      }}>
        <span style={{ fontSize: 12, color: DIM, fontFamily: SANS }}>
          © 2026 Metera. All rights reserved.
        </span>
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { label: 'Privacy Policy',  href: '/v2/privacy' },
            { label: 'Terms of Service', href: '/v2/terms' },
            { label: 'Cookie Settings', href: '/v2/cookies' },
          ].map(({ label, href }) => (
            <a key={label} href={href} style={{
              fontSize: 12, color: DIM, fontFamily: SANS, textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = MUTED)}
              onMouseLeave={e => (e.currentTarget.style.color = DIM)}
            >
              {label}
            </a>
          ))}
        </div>
      </div>

    </footer>
  )
}

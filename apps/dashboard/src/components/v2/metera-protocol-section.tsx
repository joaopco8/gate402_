'use client'
import React, { useState, useEffect, useRef } from 'react'
import { FadeIn } from './animations'

const LINE   = '1px solid #2A2E2A'
const MONO   = "'JetBrains Mono', monospace"
const SANS   = "'Inter', sans-serif"
const GREEN  = '#7AF279'
const PURPLE = '#BC86FF'
const MUTED  = '#7A8C79'
const DIM    = '#4A5549'
const TEXT   = '#E8F4EE'
const BG     = 'rgba(14,18,14,0.82)'
const GRAY_BORDER = '1px solid rgba(255,255,255,0.09)'

type Tab = 'provider' | 'agent'

const PROVIDER_LINES = [
  { text: `import { gate402 } from 'gate402'`,     color: MUTED  },
  { text: ``,                                        color: MUTED  },
  { text: `app.use(gate402({`,                       color: TEXT   },
  { text: `  apiKey: process.env.GATE402_API_KEY,`, color: MUTED  },
  { text: `  endpoints: {`,                          color: TEXT   },
  { text: `    '/api/data': 0.001`,                  color: GREEN  },
  { text: `  }`,                                     color: TEXT   },
  { text: `}))`,                                     color: TEXT   },
]

const AGENT_LINES = [
  { text: `import { MeteraClient } from 'metera'`,    color: MUTED  },
  { text: ``,                                          color: MUTED  },
  { text: `const res = await fetch('/api/data')`,     color: TEXT   },
  { text: `// → 402 Payment Required`,                color: DIM    },
  { text: ``,                                          color: MUTED  },
  { text: `const price = res.headers.get('x-price')`, color: TEXT   },
  { text: `const sig   = await wallet.sign(price)`,   color: TEXT   },
  { text: `const paid  = await fetch('/api/data', {`, color: TEXT   },
  { text: `  headers: { 'x-payment': sig },`,         color: MUTED  },
  { text: `})`,                                        color: TEXT   },
  { text: `// → 200 OK  •  ~400ms`,                   color: GREEN  },
]

/* ── macOS window chrome ── */
function WindowBar({ title, badge }: { title: string; badge?: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '11px 14px',
      background: 'rgba(255,255,255,0.03)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      userSelect: 'none', flexShrink: 0,
    }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57', display: 'inline-block' }} />
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E', display: 'inline-block' }} />
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840', display: 'inline-block' }} />
      <span style={{ flex: 1, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.25)', fontFamily: MONO, letterSpacing: '0.04em', marginRight: 30 }}>
        {title}
        {badge && <span style={{ color: GREEN, marginLeft: 6 }}>{badge}</span>}
      </span>
    </div>
  )
}

function DocLink({ npm }: { npm: string }) {
  return (
    <div style={{ padding: '10px 18px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <a href="https://metera.dev/docs" target="_blank" rel="noopener noreferrer"
        style={{ fontSize: 12, color: DIM, fontFamily: MONO, textDecoration: 'none', letterSpacing: '0.04em' }}>
        metera.dev/docs ↗
      </a>
      <code style={{ fontSize: 12, color: MUTED, fontFamily: MONO, letterSpacing: '0.02em' }}>{npm}</code>
    </div>
  )
}

/* ── typing terminal card ── */
function TerminalCard({
  lines, visibleCount, title, badge, npm, cursor,
}: {
  lines: { text: string; color: string }[]
  visibleCount: number
  title: string
  badge?: string
  npm: string
  cursor?: boolean
}) {
  return (
    <div style={{
      width:                '100%',
      background:           BG,
      backdropFilter:       'blur(28px)',
      WebkitBackdropFilter: 'blur(28px)',
      borderRadius:         12,
      border:               GRAY_BORDER,
      overflow:             'hidden',
      display:              'flex',
      flexDirection:        'column',
    }}>
      <WindowBar title={title} badge={badge} />
      <div style={{ padding: '20px 18px 16px', fontFamily: MONO, fontSize: 12, lineHeight: 2, flex: 1 }}>
        {lines.slice(0, visibleCount).map((l, i) => (
          <div key={i} style={{ color: l.color, minHeight: '1em' }}>{l.text || '\u00a0'}</div>
        ))}
        {cursor && visibleCount < lines.length && (
          <span style={{ color: GREEN }}>▋</span>
        )}
      </div>
      <DocLink npm={npm} />
    </div>
  )
}

/* ── right text panel ── */
function TextPanel({
  badge, heading, accentWord, body, tags, accent,
}: {
  badge: string; heading: string; accentWord: string; body: string; tags: string[]; accent: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
      <span style={{
        display: 'inline-block', alignSelf: 'flex-start',
        fontSize: 10, fontFamily: MONO, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: accent, border: `1px solid ${accent}33`, borderRadius: 4, padding: '4px 10px',
      }}>
        {badge}
      </span>
      <h3 style={{
        fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
        fontWeight: 300, letterSpacing: '-0.03em',
        color: '#FFFFFF', margin: 0, lineHeight: 1.2, fontFamily: SANS,
      }}>
        {heading}{' '}
        <span style={{ color: MUTED, fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)', fontWeight: 300 }}>
          {accentWord}
        </span>
      </h3>
      <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.75, margin: 0, fontWeight: 300, fontFamily: SANS }}>
        {body}
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {tags.map(t => (
          <span key={t} style={{
            fontSize: 12, fontFamily: MONO, color: DIM,
            border: LINE, borderRadius: 4, padding: '4px 10px',
          }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── main export ── */
export function MeteraProtocolSection() {
  const [tab, setTab]                   = useState<Tab>('provider')
  const [visible, setVisible]           = useState(false)
  const [providerLines, setProviderLines] = useState(0)
  const [agentLines, setAgentLines]     = useState(0)
  const [fade, setFade]                 = useState(true)
  const sectionRef                      = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  /* typing — provider */
  useEffect(() => {
    if (!visible || tab !== 'provider') return
    setProviderLines(0)
    let i = 0
    const iv = setInterval(() => {
      i++; setProviderLines(i)
      if (i >= PROVIDER_LINES.length) clearInterval(iv)
    }, 110)
    return () => clearInterval(iv)
  }, [visible, tab])

  /* typing — agent */
  useEffect(() => {
    if (!visible || tab !== 'agent') return
    setAgentLines(0)
    let i = 0
    const iv = setInterval(() => {
      i++; setAgentLines(i)
      if (i >= AGENT_LINES.length) clearInterval(iv)
    }, 110)
    return () => clearInterval(iv)
  }, [visible, tab])

  const switchTab = (next: Tab) => {
    if (next === tab) return
    setFade(false)
    setTimeout(() => { setTab(next); setFade(true) }, 180)
  }

  const accent = tab === 'provider' ? GREEN : PURPLE

  return (
    <div ref={sectionRef} style={{ borderBottom: LINE }}>

      {/* ── header ── */}
      <div style={{ padding: '72px 64px 44px', borderBottom: LINE }}>
        <FadeIn>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 300,
            letterSpacing: '-0.04em', color: '#FFFFFF',
            margin: '0 0 28px', lineHeight: 1.05, fontFamily: SANS,
          }}>
            Two sides.{' '}
            <span style={{ color: accent, transition: 'color 0.3s ease' }}>One protocol.</span>
          </h2>
        </FadeIn>
        <div style={{ display: 'flex' }}>
          {(['provider', 'agent'] as Tab[]).map((t, i) => {
            const active = tab === t
            const ac = t === 'provider' ? GREEN : PURPLE
            return (
              <button key={t} onClick={() => switchTab(t)} style={{
                background: 'none', border: LINE,
                borderLeft: i === 1 ? 'none' : LINE,
                borderTop: `2px solid ${active ? ac : 'transparent'}`,
                cursor: 'pointer', padding: '7px 22px',
                fontSize: 12, fontFamily: MONO, letterSpacing: '0.08em',
                color: active ? ac : DIM,
                transition: 'color 0.2s ease, border-top-color 0.2s ease',
              }}>
                {t}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── 2-col: terminal LEFT · text RIGHT ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '3fr 2fr',
        opacity: fade ? 1 : 0, transition: 'opacity 0.18s ease',
      }}>
        <div style={{ borderRight: LINE, padding: '40px 32px', display: 'flex', alignItems: 'center' }}>
          {tab === 'provider' ? (
            <TerminalCard
              lines={PROVIDER_LINES}
              visibleCount={providerLines}
              title="server.js"
              npm="npm install gate402"
              cursor
            />
          ) : (
            <TerminalCard
              lines={AGENT_LINES}
              visibleCount={agentLines}
              title="agent.ts"
              badge="+5"
              npm="npm install metera"
              cursor
            />
          )}
        </div>
        <div style={{ padding: '40px 40px', display: 'flex', alignItems: 'center' }}>
          {tab === 'provider' ? (
            <TextPanel
              badge="provider"
              heading="Monetize your API in 3 lines."
              accentWord="Metera handles 402 responses, payment verification, and settlement — zero infrastructure changes required."
              body="Add one middleware to your Express, Next.js, or Fastify app. Agents pay your endpoints automatically in USDC on Solana."
              tags={['x402 protocol', 'USDC on Solana', 'Any framework', '< 5min setup']}
              accent={GREEN}
            />
          ) : (
            <TextPanel
              badge="agent"
              heading="Pay any API automatically."
              accentWord="Agents detect 402 responses and settle instantly. No manual wallet management, no API keys for payment."
              body="MeteraClient intercepts 402 responses, signs and submits USDC payments on Solana, and retries the original request — all in ~400ms."
              tags={['MeteraClient SDK', '~400ms latency', 'Auto-retry', 'Solana mainnet']}
              accent={PURPLE}
            />
          )}
        </div>
      </div>

    </div>
  )
}

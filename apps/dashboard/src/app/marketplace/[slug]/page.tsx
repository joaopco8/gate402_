'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { V2Navbar } from '../../../components/v2/v2-navbar'
import { V2Footer } from '../../../components/v2/v2-footer'
import '../../../styles/v2/tokens.css'

interface APIDetail {
  id: string
  slug: string
  name: string
  description?: string
  longDescription?: string
  category: string
  pricePerCall: number
  totalCalls: number
  uptimePercent: number
  avgLatencyMs: number
  avatarEmoji?: string
  avatarColor?: string
  tags?: string[]
  docsUrl?: string
  methods?: string[]
  responseExample?: string
  createdAt: string
  user?: { username?: string; displayName?: string; avatarImage?: string }
  stats: {
    callsLast24h: number
    avgLatencyMs: number
  }
}

const BADGE: Record<string, { bg: string; color: string; label: string }> = {
  data:    { bg: '#4A1D96', color: '#C4B5FD', label: 'DATA' },
  ai:      { bg: '#1B6B3A', color: '#7AF279', label: 'AI' },
  media:   { bg: '#1565C0', color: '#93C5FD', label: 'MEDIA' },
  finance: { bg: '#78350F', color: '#FCD34D', label: 'FINANCE' },
  other:   { bg: '#1F2937', color: '#9CA3AF', label: 'API' },
}

const LINE = '1px solid #2A2E2A'
const MONO = "'Geist Mono', monospace"
const SANS = "'Geist Mono', monospace"
const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'

export default function APIDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [api, setApi]           = useState<APIDetail | null>(null)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied]     = useState('')
  const [activeTab, setActiveTab] = useState<'curl' | 'agent' | 'claude' | 'response'>('curl')

  useEffect(() => {
    if (!slug) return
    fetch(`${API_URL}/api/marketplace/${slug}`)
      .then(r => { if (r.status === 404) { setNotFound(true); return null } return r.json() })
      .then(d => { if (d) setApi(d) })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const endpointUrl = `${API_URL}/p/${slug}`

  const codeExamples = api ? {
    curl: `# Step 1 — first call returns 402
curl ${endpointUrl}

# Step 2 — retry with payment proof
curl ${endpointUrl} \\
  -H "x-payment-signature: YOUR_TX_HASH" \\
  -H "x-payment-amount: ${api.pricePerCall}" \\
  -H "x-payment-token: USDC"`,

    agent: `import { Gate402Agent } from 'gate402-agent'

const agent = new Gate402Agent({
  agentKey: 'YOUR_AGENT_KEY',  // from dashboard
})

// Detects 402, signs, retries automatically
const res = await agent.fetch('${endpointUrl}')
const data = await res.json()
console.log(data)`,

    claude: `# Add to Claude Code or Cursor:
npx gate402 skill YOUR_AGENT_KEY

# Then ask Claude:
# "Call the ${api.name} API"
# Claude pays automatically via x402.`,
  } : null

  if (loading) {
    return (
      <div style={{ background: '#1B1E1B', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 20, height: 20, border: '1px solid #7AF279', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (notFound || !api) {
    return (
      <div style={{ background: '#1B1E1B', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, color: '#E8F4EE' }}>
        <p style={{ fontSize: 48, fontWeight: 300, fontFamily: MONO, color: '#2A2E2A', marginBottom: 16 }}>404</p>
        <p style={{ fontSize: 14, color: '#4A5549', marginBottom: 32 }}>API not found in marketplace</p>
        <a href="/marketplace" style={{ color: '#7AF279', fontSize: 13, textDecoration: 'none', fontFamily: MONO }}>← Back to marketplace</a>
      </div>
    )
  }

  const b = BADGE[api.category] || BADGE.other

  return (
    <div style={{ background: '#1B1E1B', minHeight: '100vh', color: '#E8F4EE', fontFamily: SANS }}>
      <V2Navbar activePage="marketplace" />

      {/* Breadcrumb */}
      <div style={{ borderBottom: LINE }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px', height: 44, display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href="/marketplace" style={{ fontSize: 12, color: '#4A5549', textDecoration: 'none', fontFamily: MONO, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Marketplace
          </a>
          <span style={{ fontSize: 12, color: '#2A2E2A' }}>/</span>
          <span style={{ fontSize: 12, color: '#7A8C79', fontFamily: MONO }}>{api.slug}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px' }}>

        {/* Hero */}
        <div style={{ borderBottom: LINE, display: 'grid', gridTemplateColumns: '1fr 280px' }}>

          {/* Left */}
          <div style={{ borderRight: LINE, padding: '48px 48px 48px 0', borderTop: `3px solid ${b.color}` }}>
            {/* Avatar */}
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: (api.avatarEmoji && api.avatarEmoji !== '🔌') ? (api.avatarColor || b.color) + '20' : 'transparent',
              border: (api.avatarEmoji && api.avatarEmoji !== '🔌') ? `2px solid ${api.avatarColor || b.bg}40` : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, marginBottom: 20, overflow: 'hidden',
            }}>
              {(api.avatarEmoji && api.avatarEmoji !== '🔌')
                ? api.avatarEmoji
                : <img src="/icon-api.jpg" alt="" style={{ width: 64, height: 64, objectFit: 'cover', display: 'block' }} />
              }
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{
                fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                padding: '3px 8px', background: b.bg, color: b.color,
              }}>
                {b.label}
              </span>
              <span style={{ fontSize: 11, color: '#4A5549', fontFamily: MONO }}>x402 · USDC · Solana</span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 300, letterSpacing: '-0.04em', color: '#fff', marginBottom: 12 }}>
              {api.name}
            </h1>

            {api.description && (
              <p style={{ fontSize: 15, color: '#7A8C79', fontWeight: 300, lineHeight: 1.6, maxWidth: 480, marginBottom: api.tags?.length ? 16 : 36 }}>
                {api.description}
              </p>
            )}

            {/* Tags */}
            {api.tags && api.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                {api.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 11, color: '#7A8C79', border: LINE, padding: '3px 10px', fontFamily: MONO }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Docs link */}
            {api.docsUrl && (
              <a href={api.docsUrl} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 13, color: b.color, textDecoration: 'none',
                marginBottom: 24, fontFamily: MONO,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                View documentation
              </a>
            )}

            {/* Endpoint URL */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#151815', border: LINE, padding: '10px 14px', maxWidth: 520 }}>
              <span style={{ fontSize: 13, fontFamily: MONO, color: b.color, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {endpointUrl}
              </span>
              <button
                onClick={() => copy(endpointUrl, 'url')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === 'url' ? '#7AF279' : '#4A5549', fontFamily: MONO, fontSize: 11, whiteSpace: 'nowrap' }}
              >
                {copied === 'url' ? '✓ copied' : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Stats sidebar */}
          <div style={{ padding: '48px 0 48px 40px' }}>
            {/* Creator */}
            {api.user?.username && (
              <a href={`/provider/${api.user.username}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                  background: '#2A2E2A', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {api.user.avatarImage
                    ? <img src={api.user.avatarImage} alt="" style={{ width: 32, height: 32, objectFit: 'cover', display: 'block' }} />
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A5549" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  }
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#4A5549', letterSpacing: '0.08em', fontFamily: MONO, marginBottom: 2 }}>CREATOR</div>
                  <div style={{ fontSize: 13, color: '#7A8C79', fontFamily: MONO }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#E8F4EE')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#7A8C79')}
                  >
                    {api.user.displayName || api.user.username}
                  </div>
                </div>
              </a>
            )}
            <p style={{ fontSize: 10, color: '#4A5549', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 24, fontFamily: MONO }}>
              Live stats
            </p>
            {[
              { label: 'PRICE / CALL', value: `$${api.pricePerCall}`, suffix: 'USDC', color: b.color },
              { label: 'TOTAL CALLS',  value: api.totalCalls.toLocaleString(), suffix: null, color: '#E8F4EE' },
              { label: 'LAST 24H',     value: (api.stats?.callsLast24h ?? 0).toLocaleString(), suffix: null, color: '#E8F4EE' },
              { label: 'AVG LATENCY',  value: `${api.avgLatencyMs}ms`, suffix: null, color: '#E8F4EE' },
              { label: 'UPTIME',       value: `${api.uptimePercent}%`, suffix: null, color: api.uptimePercent > 99 ? '#7AF279' : '#F59E0B' },
            ].map((s, i) => (
              <div key={s.label} style={{ borderTop: LINE, padding: '18px 0' }}>
                <p style={{ fontSize: 10, color: '#4A5549', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, fontFamily: MONO }}>{s.label}</p>
                <p style={{ fontSize: 20, fontWeight: 300, fontFamily: MONO, color: s.color, lineHeight: 1 }}>
                  {s.value}
                  {s.suffix && <span style={{ fontSize: 11, color: '#4A5549', marginLeft: 6 }}>{s.suffix}</span>}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Code examples */}
        <div style={{ borderBottom: LINE }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: LINE }}>
            {([
              { key: 'curl',   label: 'cURL',          sub: 'Direct call' },
              { key: 'agent',  label: 'gate402-agent',  sub: 'Auto-pay SDK' },
              { key: 'claude',   label: 'Claude / MCP',   sub: 'AI native' },
              { key: 'response', label: 'Response',       sub: 'Example output' },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '14px 24px',
                  background: activeTab === tab.key ? 'rgba(122,242,121,0.04)' : 'transparent',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: LINE,
                  borderBottom: activeTab === tab.key ? '2px solid #7AF279' : '2px solid transparent',
                  color: activeTab === tab.key ? '#7AF279' : '#4A5549',
                  fontSize: 13, fontFamily: MONO, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2,
                }}
              >
                {tab.label}
                <span style={{ fontSize: 10, color: '#4A5549', letterSpacing: '0.05em' }}>{tab.sub}</span>
              </button>
            ))}
          </div>

          {/* Code block */}
          <div style={{ position: 'relative', background: '#111311' }}>
            {activeTab === 'response' ? (
              api.responseExample ? (
                <>
                  <button
                    onClick={() => copy(api.responseExample!, 'code')}
                    style={{
                      position: 'absolute', top: 16, right: 16,
                      background: '#1F221F', border: LINE,
                      padding: '6px 12px', fontFamily: MONO, fontSize: 11,
                      color: copied === 'code' ? '#7AF279' : '#4A5549',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    {copied === 'code' ? 'Copied!' : 'Copy'}
                  </button>
                  <pre style={{ margin: 0, padding: '28px 32px', fontFamily: MONO, fontSize: 13, color: '#7AF279', lineHeight: 1.8, overflowX: 'auto' }}>
                    {api.responseExample}
                  </pre>
                </>
              ) : (
                <div style={{ padding: '40px 32px', fontFamily: MONO, fontSize: 13, color: '#4A5549' }}>
                  No response example provided.
                </div>
              )
            ) : (
              <>
                <button
                  onClick={() => copy(codeExamples?.[activeTab as 'curl' | 'agent' | 'claude'] || '', 'code')}
                  style={{
                    position: 'absolute', top: 16, right: 16,
                    background: '#1F221F', border: LINE,
                    padding: '6px 12px', fontFamily: MONO, fontSize: 11,
                    color: copied === 'code' ? '#7AF279' : '#4A5549',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                  {copied === 'code' ? 'Copied!' : 'Copy'}
                </button>
                <pre style={{ margin: 0, padding: '28px 32px', fontFamily: MONO, fontSize: 13, color: '#7A8C79', lineHeight: 1.8, overflowX: 'auto' }}>
                  {codeExamples?.[activeTab as 'curl' | 'agent' | 'claude']}
                </pre>
              </>
            )}
          </div>
        </div>

        {/* CTA */}
        <div style={{ borderBottom: LINE, padding: '48px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 300, letterSpacing: '-0.02em', color: '#fff', marginBottom: 8 }}>
              Ready to use {api.name}?
            </h2>
            <p style={{ fontSize: 14, color: '#4A5549' }}>
              Create a free agent wallet and start making paid API calls in minutes.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
            <a href="/marketplace" style={{
              padding: '10px 20px', border: LINE, fontSize: 13,
              color: '#7A8C79', textDecoration: 'none', fontFamily: MONO,
            }}>
              ← Back
            </a>
            <a href="/auth/login" style={{
              padding: '10px 20px', background: '#7AF279', border: 'none',
              fontSize: 13, fontWeight: 600, color: '#0A0C0A',
              textDecoration: 'none', fontFamily: MONO, letterSpacing: '0.04em',
            }}>
              CREATE AGENT WALLET →
            </a>
          </div>
        </div>

      </div>

      <V2Footer />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface APICardProps {
  id: string
  slug: string
  name: string
  description?: string
  category: string
  pricePerCall: number
  totalCalls: number
  uptimePercent: number
  avgLatencyMs: number
  avatarEmoji?: string
  avatarColor?: string
  avatarImage?: string
  tags?: string[]
  methods?: string[]
  isFeatured?: boolean
  provider?: {
    username?: string
    displayName?: string
  }
}

const BADGE_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  data:    { bg: '#4A1D96', color: '#C4B5FD', label: 'DATA' },
  ai:      { bg: '#1B6B3A', color: '#7AF279', label: 'AI' },
  media:   { bg: '#1565C0', color: '#93C5FD', label: 'MEDIA' },
  finance: { bg: '#78350F', color: '#FCD34D', label: 'FINANCE' },
  other:   { bg: '#1F2937', color: '#9CA3AF', label: 'API' },
}

const LINE = '1px solid #2A2E2A'
const MONO = "'Geist Mono', monospace"
const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.metera.xyz'

function slugToProvider(slug: string): string {
  const parts = slug.split('-')
  if (parts.length <= 1) return slug
  return parts.slice(0, -1).join('-')
}

export function APICard({
  slug,
  name,
  description,
  category,
  pricePerCall,
  totalCalls,
  uptimePercent,
  avgLatencyMs,
  avatarEmoji,
  avatarColor = '#7AF279',
  avatarImage,
  tags = [],
  methods = ['GET'],
  isFeatured,
  provider,
}: APICardProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const badge = BADGE_COLORS[category] || BADGE_COLORS.other
  const logoSrc = avatarImage || null
  const hasEmoji = !logoSrc && avatarEmoji && avatarEmoji !== '🔌'
  const providerName = provider?.username || slugToProvider(slug)
  const capabilities = [...methods, ...tags].slice(0, 5)

  function goToDetail() {
    router.push(`/marketplace/${slug}`)
  }

  function copyUrl(e: React.MouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(`${API_URL}/p/${slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function stopProp(e: React.MouseEvent) {
    e.stopPropagation()
  }

  return (
    <div
      onClick={goToDetail}
      style={{
        background: '#1F221F',
        border: LINE,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        transition: 'border-color 150ms',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#4A5549')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#2A2E2A')}
    >
      {isFeatured && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: '#F59E0B20', border: '1px solid #F59E0B40',
          padding: '2px 8px', fontSize: 10, color: '#F59E0B',
          letterSpacing: '0.06em', fontFamily: MONO,
        }}>FEATURED</div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: LINE }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Logo */}
          <div style={{
            width: 36, height: 36,
            background: hasEmoji ? avatarColor + '20' : '#252825',
            border: hasEmoji ? `1px solid ${avatarColor}40` : LINE,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, fontSize: 18, overflow: 'hidden',
          }}>
            {hasEmoji
              ? avatarEmoji
              : <img src={logoSrc || '/icon-api.jpg'} alt="" style={{ width: 36, height: 36, objectFit: 'cover', display: 'block' }} />
            }
          </div>

          {/* provider/name */}
          <span style={{ fontFamily: MONO, fontSize: 14, color: '#7A8C79', fontWeight: 400 }}>
            {provider?.username
              ? (
                <a
                  href={`/provider/${provider.username}`}
                  onClick={stopProp}
                  style={{ color: '#7A8C79', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#E8F4EE')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#7A8C79')}
                >
                  {provider.displayName || provider.username}
                </a>
              )
              : providerName
            }
            /<span style={{ color: '#E8F4EE', fontWeight: 700 }}>{name}</span>
          </span>
        </div>

        <span style={{
          fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
          padding: '3px 8px', background: badge.bg, color: badge.color, flexShrink: 0,
        }}>
          {badge.label}
        </span>
      </div>

      {/* Stats */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, borderBottom: LINE }}>
        {[
          { label: 'PRICE',   value: `$${pricePerCall}`, suffix: 'call' },
          { label: 'CALLS',   value: totalCalls.toLocaleString(), suffix: null },
          { label: 'LATENCY', value: avgLatencyMs ? `${avgLatencyMs}ms` : '—', suffix: null },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 500, color: '#7B8080' }}>{row.label}</span>
            <span style={{ fontFamily: MONO, fontSize: 14 }}>
              {row.value === '—' ? (
                <span style={{ color: '#2A2E2A' }}>—</span>
              ) : (
                <>
                  <span style={{ color: '#E8F4EE', fontWeight: 600 }}>{row.value}</span>
                  {row.suffix && <span style={{ color: '#4A5549', marginLeft: 6 }}>{row.suffix}</span>}
                </>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Capabilities */}
      <div style={{ padding: '14px 20px', borderBottom: LINE }}>
        <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 500, color: '#7B8080', marginBottom: 10 }}>
          CAPABILITIES
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {capabilities.length > 0
            ? capabilities.map(cap => (
                <span key={cap} style={{
                  fontFamily: MONO, fontSize: 13, color: '#C4D8C2',
                  background: '#252825', border: LINE, padding: '4px 12px',
                }}>
                  {cap}
                </span>
              ))
            : <span style={{ fontFamily: MONO, fontSize: 12, color: '#4A5549' }}>—</span>
          }
        </div>
      </div>

      {/* Description */}
      <div style={{ padding: '0 20px 16px', flexGrow: 1 }}>
        <div style={{ border: LINE, background: '#252825', padding: '12px 16px' }}>
          <p style={{ margin: 0, fontFamily: MONO, fontSize: 13, color: '#7A8C79', lineHeight: 1.7 }}>
            {description || `${name} — accessible via x402 payment protocol`}
          </p>
        </div>
      </div>

      {/* Footer: VIEW API */}
      <div style={{ padding: '16px 20px' }}>
        <button
          onClick={goToDetail}
          style={{
            width: '100%', background: '#E8F4EE', border: 'none', padding: '10px 20px',
            fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: '0.14em',
            color: '#0A0C0A', cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          VIEW API
        </button>
      </div>
    </div>
  )
}

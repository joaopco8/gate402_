'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { V2Navbar } from '@/components/v2/v2-navbar'
import { V2Footer } from '@/components/v2/v2-footer'
import { APICard } from '@/components/marketplace/APICard'
import '../../../styles/v2/tokens.css'

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'

const LINE = '1px solid rgba(255,255,255,0.06)'
const FONT = "'JetBrains Mono', 'Fira Mono', monospace"

interface ApiEndpoint {
  id: string
  slug: string
  name: string
  description?: string
  category: string
  pricePerCall: number
  totalCalls: number
  totalEarned: number
  uptimePercent: number
  avgLatencyMs: number
  avatarEmoji?: string
  avatarColor?: string
  avatarImage?: string
  tags?: string[]
  methods?: string[]
  isFeatured?: boolean
}

interface ProviderData {
  username: string
  displayName?: string
  bio?: string
  avatarEmoji?: string
  avatarColor?: string
  avatarImage?: string
  githubUrl?: string
  websiteUrl?: string
  twitterUrl?: string
  proxyEndpoints: ApiEndpoint[]
  stats: { totalApis: number; totalCalls: number; totalEarned: number }
}

export default function ProviderPage() {
  const params = useParams()
  const username = params?.username as string
  const [provider, setProvider] = useState<ProviderData | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!username) return
    fetch(`${API_URL}/api/provider/${username}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null }
        return r.json()
      })
      .then(d => { if (d) setProvider(d) })
      .catch(() => setNotFound(true))
  }, [username])

  return (
    <div style={{ minHeight: '100vh', background: '#1B1E1B', fontFamily: FONT }}>
      <V2Navbar />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 80px' }}>
        {notFound ? (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>404</div>
            <div style={{ fontSize: 16, color: '#4A5549' }}>Provider not found or profile is private</div>
            <a href="/marketplace" style={{ display: 'inline-block', marginTop: 24, color: '#7AF279', textDecoration: 'none', fontSize: 13 }}>← Browse Marketplace</a>
          </div>
        ) : !provider ? (
          <div style={{ textAlign: 'center', paddingTop: 80, color: '#4A5549', fontSize: 13 }}>Loading...</div>
        ) : (
          <>
            {/* Profile header */}
            <div style={{
              background: 'rgba(0,0,0,0.45)', border: LINE, borderRadius: 16,
              padding: '32px', marginBottom: 32,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
                {/* Avatar */}
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
                  background: '#2A2E2A',
                  border: '1px solid rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {provider.avatarImage ? (
                    <img src={provider.avatarImage} alt="" style={{ width: 80, height: 80, objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4A5549" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                    <div style={{ fontSize: 22, color: '#E8F4EE', fontWeight: 700 }}>
                      {provider.displayName || provider.username}
                    </div>
                    <div style={{ fontSize: 13, color: '#4A5549' }}>@{provider.username}</div>
                  </div>
                  {provider.bio && (
                    <div style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 12, lineHeight: 1.6, maxWidth: 600 }}>
                      {provider.bio}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {provider.githubUrl && (
                      <a href={provider.githubUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 12, color: '#7A8C79', textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#E8F4EE')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#7A8C79')}
                      >GitHub →</a>
                    )}
                    {provider.websiteUrl && (
                      <a href={provider.websiteUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 12, color: '#7A8C79', textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#E8F4EE')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#7A8C79')}
                      >Website →</a>
                    )}
                    {provider.twitterUrl && (
                      <a href={provider.twitterUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 12, color: '#7A8C79', textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#E8F4EE')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#7A8C79')}
                      >Twitter/X →</a>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 0, border: LINE, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                  {[
                    { label: 'APIS', value: provider.stats.totalApis },
                    { label: 'CALLS', value: provider.stats.totalCalls.toLocaleString() },
                    { label: 'EARNED', value: `$${provider.stats.totalEarned.toFixed(2)}` },
                  ].map((s, i) => (
                    <div key={s.label} style={{
                      padding: '14px 20px', textAlign: 'center',
                      borderRight: i < 2 ? LINE : 'none',
                    }}>
                      <div style={{ fontSize: 9, color: '#4A5549', letterSpacing: '0.08em', marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 18, color: '#E8F4EE', fontWeight: 700 }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* APIs */}
            {provider.proxyEndpoints.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#4A5549', fontSize: 13 }}>
                No public APIs yet
              </div>
            ) : (
              <>
                <div style={{ fontSize: 11, color: '#4A5549', letterSpacing: '0.1em', marginBottom: 16 }}>
                  {provider.stats.totalApis} API{provider.stats.totalApis !== 1 ? 's' : ''}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                  {provider.proxyEndpoints.map(ep => (
                    <APICard
                      key={ep.id}
                      id={ep.id}
                      slug={ep.slug}
                      name={ep.name}
                      description={ep.description}
                      category={ep.category}
                      pricePerCall={ep.pricePerCall}
                      totalCalls={ep.totalCalls}
                      uptimePercent={ep.uptimePercent}
                      avgLatencyMs={ep.avgLatencyMs}
                      avatarEmoji={ep.avatarEmoji}
                      avatarColor={ep.avatarColor}
                      avatarImage={ep.avatarImage}
                      tags={ep.tags}
                      methods={ep.methods}
                      isFeatured={ep.isFeatured}
                      provider={{ username: provider.username, displayName: provider.displayName }}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <V2Footer />
    </div>
  )
}

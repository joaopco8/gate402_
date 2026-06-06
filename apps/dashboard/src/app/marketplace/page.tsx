'use client'

import { useState, useEffect, useCallback } from 'react'
import { V2Navbar } from '../../components/v2/v2-navbar'
import { V2Footer } from '../../components/v2/v2-footer'
import { APICard } from '../../components/marketplace/APICard'
import { APICardSkeleton } from '../../components/marketplace/APICardSkeleton'
import '../../styles/v2/tokens.css'

interface MarketplaceEndpoint {
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
  user?: {
    username?: string
    displayName?: string
  }
}

const CATEGORIES = ['all', 'data', 'ai', 'media', 'finance', 'other']

const BADGE: Record<string, { color: string }> = {
  data:    { color: '#C4B5FD' },
  ai:      { color: '#7AF279' },
  media:   { color: '#93C5FD' },
  finance: { color: '#FCD34D' },
  other:   { color: '#9CA3AF' },
}

const LINE = '1px solid #2A2E2A'
const MONO = "'Geist Mono', monospace"
const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'

export default function MarketplacePage() {
  const [endpoints, setEndpoints] = useState<MarketplaceEndpoint[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [category, setCategory]   = useState('all')
  const [sort, setSort]           = useState('popular')

  const fetchEndpoints = useCallback(async (s?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== 'all') params.set('category', category)
      const q = s !== undefined ? s : search
      if (q) params.set('search', q)
      params.set('sort', sort)
      params.set('limit', '20')
      const res = await fetch(`${API_URL}/api/marketplace?${params}`)
      const data = await res.json()
      setEndpoints(data.endpoints || [])
    } catch { setEndpoints([]) }
    finally { setLoading(false) }
  }, [category, sort, search])

  useEffect(() => { fetchEndpoints() }, [category, sort])
  useEffect(() => {
    const t = setTimeout(() => fetchEndpoints(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const catColor = (cat: string) => cat === 'all' ? '#7AF279' : (BADGE[cat] || BADGE.other).color

  return (
    <div style={{ background: '#1B1E1B', minHeight: '100vh', color: '#E8F4EE', fontFamily: MONO }}>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <V2Navbar activePage="marketplace" />

      {/* Hero */}
      <div style={{ borderBottom: LINE, padding: '56px 0 40px' }}>
        <div className="v2r-mp-hero-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 300, letterSpacing: '-0.04em', color: '#fff', marginBottom: 10 }}>
            API Marketplace
          </h1>
          <p style={{ fontSize: 14, color: '#4A5549', maxWidth: 440, lineHeight: 1.6, margin: 0 }}>
            APIs that accept automatic payments from AI agents via the x402 protocol.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div style={{ borderBottom: LINE }}>
        <div className="v2r-mp-ctrl-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px', display: 'flex', gap: 0, alignItems: 'stretch', height: 52, flexWrap: 'wrap' }}>
          <div className="v2r-mp-ctrl-search" style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, borderRight: LINE, minWidth: 160 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4A5549" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search APIs..."
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#E8F4EE', fontFamily: MONO, width: '100%' }}
            />
          </div>
          <div className="v2r-mp-ctrl-cats" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 20px', borderRight: LINE, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding: '4px 12px', borderRadius: 99, fontSize: 11, cursor: 'pointer',
                border: category === cat ? `1px solid ${catColor(cat)}` : LINE,
                background: category === cat ? catColor(cat) + '12' : 'transparent',
                color: category === cat ? catColor(cat) : '#4A5549',
                fontFamily: MONO, textTransform: 'capitalize', transition: 'all 0.15s',
              }}>
                {cat}
              </button>
            ))}
          </div>
          <div className="v2r-mp-ctrl-sort" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 20px' }}>
            {['popular', 'newest', 'cheapest'].map(s => (
              <button key={s} onClick={() => setSort(s)} style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                border: sort === s ? '1px solid #7AF279' : LINE,
                background: sort === s ? 'rgba(122,242,121,0.06)' : 'transparent',
                color: sort === s ? '#7AF279' : '#4A5549',
                fontFamily: MONO, textTransform: 'capitalize',
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="v2r-mp-cards" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 40px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => <APICardSkeleton key={i} />)}
          </div>
        ) : endpoints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 14, color: '#4A5549' }}>No APIs found.</p>
            {search && (
              <button onClick={() => setSearch('')} style={{
                marginTop: 12, fontSize: 12, color: '#7AF279',
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: MONO,
              }}>Clear search</button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {endpoints.map(ep => (
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
                provider={ep.user}
              />
            ))}
          </div>
        )}
      </div>

      <V2Footer />
    </div>
  )
}

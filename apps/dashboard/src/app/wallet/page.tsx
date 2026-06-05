'use client'

export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { createClient } from '../../../lib/supabase/client'
import { getAuthHeaders } from '../lib/api'
import DashboardLayout from '../components/DashboardLayout'
import PageContainer from '../components/PageContainer'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import { useUser } from '@/contexts/UserContext'
import { ProGate } from '../components/ProGate'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'
const MONO = 'var(--font-label)'
const SANS = 'var(--font-label)'

interface TxRow {
  id: string
  endpoint: string
  totalAmount: number
  providerAmount: number
  platformFee: number
  status: string
  txHashProvider: string
  createdAt: string
  network?: string
}

interface EndpointRow {
  id: string
  path: string
  priceUsdc: number
  totalCalls: number
  revenue: number
  netRevenue: number
}

interface RevenueData {
  gross: number
  net: number
  fees: number
}

// ── Spark helpers ────────────────────────────────────────────────────────────

interface SparkPoint { value: number }

function buildSpark(txns: TxRow[], field: 'totalAmount' | 'providerAmount' | 'platformFee'): SparkPoint[] {
  const map: Record<string, number> = {}
  txns.forEach(tx => {
    const d = tx.createdAt?.split('T')[0] ?? 'x'
    map[d] = (map[d] ?? 0) + (tx[field] ?? 0)
  })
  const sorted = Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => ({ value: v }))
  if (sorted.length === 0) return [{ value: 0 }, { value: 0 }]
  if (sorted.length === 1) return [{ value: 0 }, sorted[0]]
  return sorted
}

// ── Icons ────────────────────────────────────────────────────────────────────

function IconDollar({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8"/><line x1="12" y1="6" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="18"/>
    </svg>
  )
}
function IconTrendUp({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  )
}
function IconActivity({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  )
}

// ── Area stat card ───────────────────────────────────────────────────────────

function AreaStatCard({
  title, period, value, sparkData, color, gradientId, icon, loading,
}: {
  title: string; period: string; value: string; sparkData: SparkPoint[]
  color: string; gradientId: string; icon: React.ReactNode; loading: boolean
}) {
  return (
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon}
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', whiteSpace: 'nowrap', fontFamily: SANS }}>{period}</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
              {loading ? '—' : value}
            </div>
          </div>
          <div style={{ maxWidth: 160, height: 64, width: '100%', position: 'relative', flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData.length ? sparkData : [{ value: 0 }]} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                  </linearGradient>
                  <filter id={`${gradientId}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.5)" />
                  </filter>
                </defs>
                <Tooltip
                  cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '2 2' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const v = payload[0].value as number
                    return (
                      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', backdropFilter: 'blur(4px)', borderRadius: 6, padding: '6px 10px', fontSize: 12, fontFamily: MONO, color: 'var(--text-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', pointerEvents: 'none' }}>
                        ${v.toFixed(5)}
                      </div>
                    )
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  fill={`url(#${gradientId})`}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: color, stroke: 'white', strokeWidth: 2, filter: `url(#${gradientId}-shadow)` }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  return `${d}d ago`
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { color: string; bg: string; border: string }> = {
    verified: { color: '#3ecf8e', bg: 'rgba(62,207,142,0.1)',  border: 'rgba(62,207,142,0.25)' },
    demo:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
    failed:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)'  },
  }
  const s = cfg[status] ?? cfg.demo
  return (
    <span style={{
      fontFamily: MONO, fontSize: 12, color: s.color,
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 6, padding: '2px 7px', whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function WalletPage() {
  const router = useRouter()
  const { userData, isPro } = useUser()

  const [revenue, setRevenue] = useState<RevenueData | null>(null)
  const [endpoints, setEndpoints] = useState<EndpointRow[]>([])
  const [txns, setTxns] = useState<TxRow[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const network = userData?.network ?? 'devnet'
  const walletAddr = userData?.walletAddress

  useEffect(() => {
    async function loadWallet() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const headers = { ...await getAuthHeaders() }

      const [revenueRes, endpointsRes, txRes] = await Promise.all([
        fetch(`${SERVER_URL}/api/analytics/revenue?period=30d`, { headers }),
        fetch(`${SERVER_URL}/api/endpoints`, { headers }),
        fetch(`${SERVER_URL}/api/transactions`, { headers }),
      ])

      const [rev, eps, tx] = await Promise.all([
        revenueRes.ok ? revenueRes.json() : null,
        endpointsRes.ok ? endpointsRes.json() : null,
        txRes.ok ? txRes.json() : null,
      ])

      if (rev) setRevenue(rev)
      if (eps) setEndpoints(Array.isArray(eps) ? eps : [])
      if (tx) setTxns(tx.transactions ?? [])
      setLoading(false)
    }
    loadWallet()
  }, [router])

  // Fall back to summing from txns if revenue API returns null
  const gross = revenue?.gross ?? txns.reduce((s, t) => s + (t.totalAmount ?? 0), 0)
  const net   = revenue?.net   ?? txns.reduce((s, t) => s + (t.providerAmount ?? 0), 0)

  const grossSpark = buildSpark(txns, 'totalAmount')
  const netSpark   = buildSpark(txns, 'providerAmount')

  const totalRevenue = gross
  const netRevenue = net

  const displayedTxns = isPro ? txns : txns.slice(0, 5)

  const isDemoTx = (hash?: string) =>
    !!hash && (hash.startsWith('demo_') || hash.startsWith('mock_') || hash.startsWith('sim_'))

  async function handleExport() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const res = await fetch(`${SERVER_URL}/api/analytics/export`, { headers: { ...await getAuthHeaders() } })
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gate402-transactions-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function handleCopy() {
    if (!walletAddr) return
    navigator.clipboard.writeText(walletAddr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DashboardLayout>
      <div style={{ fontFamily: 'var(--font-label)' }}>
      <PageContainer>
        <PageHeader title="Wallet" />

        {/* ── Devnet banner ── */}
        {network === 'devnet' && (
          <div style={{
            background: '#F59E0B10', border: '1px solid #F59E0B30',
            borderLeft: '3px solid #F59E0B', borderRadius: 8,
            padding: '14px 20px', marginBottom: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ fontSize: 13, color: '#F59E0B', fontWeight: 500, marginBottom: 2 }}>
                ⚠ You are on Devnet
              </p>
              <p style={{ fontSize: 12, color: '#7A8C79' }}>
                Payments are simulated. Switch to Mainnet to receive real USDC.
              </p>
            </div>
            <a href="/settings" style={{
              fontSize: 12, color: '#F59E0B', textDecoration: 'none',
              border: '1px solid #F59E0B40', borderRadius: 6,
              padding: '6px 14px', whiteSpace: 'nowrap',
            }}>
              Switch to Mainnet →
            </a>
          </div>
        )}

        {/* ── Stat cards ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px', background: '#2A2E2A',
          border: '1px solid #2A2E2A', borderRadius: 12,
          overflow: 'hidden', marginBottom: 24,
        }}>
          <div style={{ background: '#1F221F', padding: '28px 24px' }}>
            <p style={{ fontSize: 10, color: '#4A5549', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 12 }}>
              Total Revenue
            </p>
            <p style={{ fontSize: 32, fontWeight: 300, color: '#7AF279', fontFamily: 'monospace', letterSpacing: '-0.02em', marginBottom: 4 }}>
              {loading ? '—' : `$${totalRevenue.toFixed(4)}`}
            </p>
            <p style={{ fontSize: 11, color: '#4A5549' }}>All time · USDC</p>
          </div>
          <div style={{ background: '#1F221F', padding: '28px 24px' }}>
            <p style={{ fontSize: 10, color: '#4A5549', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 12 }}>
              Net Revenue
            </p>
            <p style={{ fontSize: 32, fontWeight: 300, color: '#FFFFFF', fontFamily: 'monospace', letterSpacing: '-0.02em', marginBottom: 4 }}>
              {loading ? '—' : `$${netRevenue.toFixed(4)}`}
            </p>
            <p style={{ fontSize: 11, color: '#4A5549' }}>99% goes to your wallet</p>
          </div>
          <div style={{ background: '#1F221F', padding: '28px 24px' }}>
            <p style={{ fontSize: 10, color: '#4A5549', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 12 }}>
              Platform Fee
            </p>
            <p style={{ fontSize: 32, fontWeight: 300, color: '#FFFFFF', fontFamily: 'monospace', letterSpacing: '-0.02em', marginBottom: 4 }}>
              Free
            </p>
            <p style={{ fontSize: 11, color: '#7AF279' }}>No fees charged right now</p>
          </div>
        </div>

        {/* ── Receiving Wallet ── */}
        <div style={{ background: '#1F221F', border: '1px solid #2A2E2A', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontSize: 10, color: '#4A5549', letterSpacing: '0.10em', textTransform: 'uppercase' }}>
              Receiving Wallet
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: network === 'mainnet' ? '#7AF279' : '#F59E0B',
                boxShadow: network === 'mainnet' ? '0 0 6px #7AF279' : '0 0 6px #F59E0B',
              }} />
              <span style={{ fontSize: 11, color: network === 'mainnet' ? '#7AF279' : '#F59E0B', textTransform: 'capitalize' }}>
                Solana {network}
              </span>
            </div>
          </div>
          {walletAddr ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#111311', border: '1px solid #2A2E2A', borderRadius: 8, padding: '12px 16px' }}>
              <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#E8F4EE', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {walletAddr}
              </span>
              <button onClick={handleCopy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#7AF279' : '#4A5549', padding: 0, display: 'flex', transition: 'color 150ms' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
              <a href={`https://explorer.solana.com/address/${walletAddr}${network === 'devnet' ? '?cluster=devnet' : ''}`}
                target="_blank" rel="noopener noreferrer"
                style={{ color: '#4A5549', display: 'flex', textDecoration: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111311', border: '1px solid #2A2E2A', borderRadius: 8, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: '#4A5549' }}>No wallet configured</p>
              <a href="/settings" style={{ fontSize: 12, color: '#7AF279', textDecoration: 'none' }}>Add in Settings →</a>
            </div>
          )}
        </div>

        {/* ── Revenue by Endpoint ── */}
        <Card style={{ marginBottom: 'var(--space-md)', padding: 0 }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'var(--font-label)', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Revenue by Endpoint
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '32px 24px', color: 'var(--text-muted)', fontSize: 12, fontFamily: MONO }}>Loading...</div>
          ) : endpoints.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, fontFamily: MONO }}>
              No endpoints yet. Add one to start earning.
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 100px 110px 90px', padding: '10px 24px', borderBottom: '1px solid var(--border)' }}>
                {['Endpoint', 'Calls', 'Gross', 'Net (99%)', 'Price/call'].map(h => (
                  <span key={h} style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{h}</span>
                ))}
              </div>
              {endpoints.map((ep, i) => (
                <div key={ep.id}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 70px 100px 110px 90px', padding: '12px 24px', borderBottom: i < endpoints.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{ep.path}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-secondary)' }}>{ep.totalCalls}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-secondary)' }}>${ep.revenue.toFixed(5)}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--green)' }}>${ep.netRevenue.toFixed(5)}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-muted)' }}>${ep.priceUsdc.toFixed(4)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ── Recent Transactions ── */}
        <Card style={{ marginBottom: 'var(--space-md)', padding: 0 }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-label)', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Recent Transactions
            </span>
            <ProGate isPro={isPro} feature="CSV Export">
              <button onClick={handleExport}
                style={{ padding: '6px 14px', background: 'transparent', border: '1px solid #2A2E2A', fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-label)', textTransform: 'uppercase', fontWeight: 500 }}
                onMouseEnter={e => { e.currentTarget.style.color = '#7AF279'; e.currentTarget.style.borderColor = 'rgba(122,242,121,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = '#2A2E2A' }}>
                Export CSV →
              </button>
            </ProGate>
          </div>

          {loading ? (
            <div style={{ padding: '32px 24px', color: 'var(--text-muted)', fontSize: 12, fontFamily: MONO }}>Loading...</div>
          ) : txns.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, fontFamily: MONO }}>
              No transactions yet
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 80px 80px 65px 80px 110px', padding: '10px 24px', borderBottom: '1px solid var(--border)' }}>
                {['Date', 'Endpoint', 'Gross', 'Net', 'Fee', 'Status', 'Tx Hash'].map(h => (
                  <span key={h} style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{h}</span>
                ))}
              </div>
              {displayedTxns.map((tx, i) => {
                const explorerCluster = (tx.network ?? network) === 'mainnet' ? '' : '?cluster=devnet'
                const isDemo = isDemoTx(tx.txHashProvider)
                const endpointDisplay = tx.endpoint && tx.endpoint !== 'unknown' ? tx.endpoint : null
                return (
                  <div key={tx.id}
                    style={{ display: 'grid', gridTemplateColumns: '90px 1fr 80px 80px 65px 80px 110px', padding: '12px 24px', borderBottom: i < displayedTxns.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(tx.createdAt)}</span>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: endpointDisplay ? 'var(--text-primary)' : '#4A5549', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                      {endpointDisplay ?? '—'}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-secondary)' }}>${tx.totalAmount?.toFixed(4)}</span>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--green)' }}>${tx.providerAmount?.toFixed(4)}</span>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-muted)' }}>${tx.platformFee?.toFixed(4)}</span>
                    <div><StatusBadge status={tx.status} /></div>
                    <div>
                      {isDemo ? (
                        <span style={{ fontSize: 11, color: '#4A5549', background: '#222522', border: '1px solid #2A2E2A', borderRadius: 4, padding: '2px 8px', fontFamily: 'monospace' }}>
                          simulated
                        </span>
                      ) : tx.txHashProvider ? (
                        <a href={`https://explorer.solana.com/tx/${tx.txHashProvider}${explorerCluster}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ fontFamily: MONO, fontSize: 12, color: 'var(--green)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                          onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                          onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
                          {tx.txHashProvider.slice(0, 6)}...{tx.txHashProvider.slice(-4)} ↗
                        </a>
                      ) : (
                        <span style={{ fontFamily: MONO, fontSize: 12, color: '#4A5549' }}>—</span>
                      )}
                    </div>
                  </div>
                )
              })}

              {!isPro && txns.length > 5 && (
                <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-label)', fontSize: 12, color: 'var(--text-muted)' }}>
                    Showing last 5 transactions.
                  </span>
                  <a href="/billing"
                    style={{ fontFamily: 'var(--font-label)', fontSize: 12, fontWeight: 500, color: '#7AF279', textDecoration: 'none', textTransform: 'uppercase' }}
                    onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
                    Upgrade to Pro for complete history →
                  </a>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* ── Network Info ── */}
        <div style={{ background: '#1F221F', border: '1px solid #2A2E2A', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #2A2E2A' }}>
            <p style={{ fontSize: 10, color: '#4A5549', letterSpacing: '0.10em', textTransform: 'uppercase' }}>Network Info</p>
          </div>
          {[
            { label: 'Network', value: `Solana ${network}`, color: network === 'mainnet' ? '#7AF279' : '#F59E0B' },
            { label: 'Status', value: 'Online', color: '#7AF279' },
            { label: 'Settlement', value: '~400ms', color: '#E8F4EE' },
            { label: 'Tx fee', value: '~$0.001 SOL', color: '#E8F4EE' },
          ].map((item, i, arr) => (
            <div key={item.label} style={{ padding: '14px 24px', borderBottom: i < arr.length - 1 ? '1px solid #2A2E2A' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#4A5549' }}>{item.label}</span>
              <span style={{ fontSize: 12, fontFamily: 'monospace', color: item.color }}>{item.value}</span>
            </div>
          ))}
          {network === 'devnet' && (
            <div style={{ padding: '12px 24px', borderTop: '1px solid #2A2E2A', background: '#F59E0B08' }}>
              <a href="/settings" style={{ fontSize: 12, color: '#F59E0B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                Switch to Mainnet →
              </a>
            </div>
          )}
        </div>

      </PageContainer>
      </div>
    </DashboardLayout>
  )
}

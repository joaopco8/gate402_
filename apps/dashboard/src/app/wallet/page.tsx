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
const MONO = 'var(--font-code)'
const SANS = 'var(--font-display)'

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
      fontFamily: MONO, fontSize: 11, color: s.color,
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

  const displayedTxns = isPro ? txns : txns.slice(0, 5)

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
      <PageContainer>
        <PageHeader title="Wallet" />

        {/* ── Stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
          <AreaStatCard title="Total Revenue" period="All time" value={`$${gross.toFixed(4)}`}
            sparkData={grossSpark} color="#00bc7d" gradientId="walletGross"
            icon={<IconDollar color="#00bc7d" />} loading={loading} />
          <AreaStatCard title="Net Revenue (99%)" period="Goes to your wallet" value={`$${net.toFixed(5)}`}
            sparkData={netSpark} color="#3b82f6" gradientId="walletNet"
            icon={<IconTrendUp color="#3b82f6" />} loading={loading} />
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconActivity color="#8b5cf6" />
                <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Platform Fee</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 30, fontWeight: 700, color: '#8b5cf6', letterSpacing: '-0.5px', lineHeight: 1.1 }}>Free</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: SANS }}>No fees charged right now</div>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Receiving Wallet ── */}
        <Card style={{ marginBottom: 'var(--space-md)' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>
            Receiving Wallet
          </div>

          {!walletAddr ? (
            <div>
              <div style={{ padding: 14, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#f59e0b', marginBottom: 4, fontFamily: SANS }}>No wallet configured</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: SANS }}>Add your Solana wallet in Settings to receive payments.</div>
              </div>
              <a href="/settings"
                style={{ fontSize: 13, color: 'var(--green)', fontFamily: SANS, textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
                Go to Settings →
              </a>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontFamily: MONO, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {walletAddr.slice(0, 12)}...{walletAddr.slice(-8)}
                </div>
                <span style={{ fontSize: 11, fontFamily: MONO, color: 'var(--green)' }}>
                  Solana {network === 'mainnet' ? 'Mainnet' : 'Devnet'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleCopy}
                  style={{ padding: '7px 14px', background: '#242424', border: '0.5px solid #363636', borderRadius: 6, fontSize: 12, color: '#fff', cursor: 'pointer', fontFamily: SANS }}>
                  {copied ? 'Copied ✓' : 'Copy'}
                </button>
                <a href={`https://explorer.solana.com/address/${walletAddr}?cluster=${network}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ padding: '7px 14px', background: '#006239', border: '0.5px solid #128353', borderRadius: 6, fontSize: 12, color: '#fff', textDecoration: 'none', fontFamily: SANS }}>
                  View on Solana Explorer →
                </a>
              </div>
            </div>
          )}
        </Card>

        {/* ── Revenue by Endpoint ── */}
        <Card style={{ marginBottom: 'var(--space-md)', padding: 0 }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
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
                  <span key={h} style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{h}</span>
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
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Recent Transactions
            </span>
            <ProGate isPro={isPro} feature="CSV Export">
              <button onClick={handleExport}
                style={{ padding: '6px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: SANS }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--green)'; e.currentTarget.style.borderColor = 'rgba(0,188,125,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
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
                  <span key={h} style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{h}</span>
                ))}
              </div>
              {displayedTxns.map((tx, i) => {
                const explorerCluster = (tx.network ?? network) === 'mainnet' ? '' : '?cluster=devnet'
                const isDemo = tx.txHashProvider?.startsWith('demo_') || tx.txHashProvider?.startsWith('sim_')
                const shortHash = isDemo
                  ? tx.txHashProvider
                  : tx.txHashProvider
                    ? `${tx.txHashProvider.slice(0, 6)}...${tx.txHashProvider.slice(-4)}`
                    : '—'
                return (
                  <div key={tx.id}
                    style={{ display: 'grid', gridTemplateColumns: '90px 1fr 80px 80px 65px 80px 110px', padding: '12px 24px', borderBottom: i < displayedTxns.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(tx.createdAt)}</span>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{tx.endpoint}</span>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-secondary)' }}>${tx.totalAmount?.toFixed(4)}</span>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--green)' }}>${tx.providerAmount?.toFixed(4)}</span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)' }}>${tx.platformFee?.toFixed(4)}</span>
                    <div><StatusBadge status={tx.status} /></div>
                    <div>
                      {!isDemo && tx.txHashProvider ? (
                        <a href={`https://explorer.solana.com/tx/${tx.txHashProvider}${explorerCluster}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ fontFamily: MONO, fontSize: 11, color: 'var(--green)', textDecoration: 'none' }}
                          onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                          onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
                          {shortHash} ↗
                        </a>
                      ) : (
                        <span style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)' }}>{shortHash}</span>
                      )}
                    </div>
                  </div>
                )
              })}

              {!isPro && txns.length > 5 && (
                <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontFamily: SANS, fontSize: 12, color: 'var(--text-muted)' }}>
                    Showing last 5 transactions.
                  </span>
                  <a href="/billing"
                    style={{ fontFamily: SANS, fontSize: 12, color: 'var(--green)', textDecoration: 'none' }}
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
        <Card>
          <style>{`@keyframes pulse-dot { 0%,100%{box-shadow:0 0 0 0 rgba(0,188,125,0.4)} 50%{box-shadow:0 0 0 5px rgba(0,188,125,0)} }`}</style>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>
            Network Info
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 24px', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: MONO, color: 'var(--text-muted)', marginBottom: 4 }}>Network</div>
              <div style={{ fontSize: 13, fontFamily: MONO, color: 'var(--text-primary)' }}>Solana {network === 'mainnet' ? 'Mainnet' : 'Devnet'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontFamily: MONO, color: 'var(--text-muted)', marginBottom: 4 }}>Status</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
                <span style={{ fontSize: 13, fontFamily: MONO, color: 'var(--green)' }}>Online</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontFamily: MONO, color: 'var(--text-muted)', marginBottom: 4 }}>Settlement time</div>
              <div style={{ fontSize: 13, fontFamily: MONO, color: 'var(--text-primary)' }}>~400ms</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontFamily: MONO, color: 'var(--text-muted)', marginBottom: 4 }}>Transaction fee</div>
              <div style={{ fontSize: 13, fontFamily: MONO, color: 'var(--text-primary)' }}>~$0.001 SOL</div>
            </div>
          </div>

          {network !== 'mainnet' && (
            <div style={{ display: 'flex', gap: 8 }}>
              <a href="/settings"
                style={{ display: 'inline-block', padding: '8px 16px', background: '#006239', border: '0.5px solid #128353', borderRadius: 6, fontSize: 13, fontFamily: SANS, color: '#fff', textDecoration: 'none', fontWeight: 500 }}>
                Switch to Mainnet →
              </a>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '8px 14px', background: '#242424', border: '0.5px solid #363636', borderRadius: 6, fontSize: 12, fontFamily: MONO, color: 'var(--text-muted)' }}>
                Currently on Devnet
              </span>
            </div>
          )}
        </Card>

      </PageContainer>
    </DashboardLayout>
  )
}

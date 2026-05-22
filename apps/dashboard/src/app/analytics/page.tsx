'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { createClient } from '../../../lib/supabase/client'
import DashboardLayout from '../components/DashboardLayout'
import PageContainer from '../components/PageContainer'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import { useUser } from '../hooks/useUser'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'
const MONO = 'var(--font-code)'
const SANS = 'var(--font-display)'
const GREEN = '#00bc7d'

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ width = '100%', height = 16 }: { width?: string | number; height?: number }) {
  return (
    <div style={{
      width, height,
      background: 'linear-gradient(90deg, var(--surface) 25%, var(--card-raised) 50%, var(--surface) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: 6,
    }} />
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <Card>
      <div style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color ?? 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1.1, fontFamily: MONO }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, fontFamily: SANS }}>{sub}</div>}
    </Card>
  )
}

// ── Latency color ─────────────────────────────────────────────────────────────

function latColor(ms: number | null) {
  if (ms === null) return 'var(--text-muted)'
  if (ms < 500) return '#00bc7d'
  if (ms < 1000) return '#f59e0b'
  return '#ef4444'
}

function fmtMs(ms: number | null) {
  if (ms === null) return '—'
  return `${ms}ms`
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string }> = {
    failed:   { bg: 'rgba(239,68,68,0.12)',  color: '#f87171' },
    replayed: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' },
  }
  const s = cfg[status] ?? { bg: 'var(--surface)', color: 'var(--text-muted)' }
  return (
    <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontFamily: MONO, background: s.bg, color: s.color }}>
      {status}
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Period = '7d' | '30d' | '90d'

export default function AnalyticsPage() {
  const { isPro, supabaseUserId } = useUser()
  const [period, setPeriod] = useState<Period>('7d')
  const [revenue, setRevenue] = useState<any>(null)
  const [successRate, setSuccessRate] = useState<any>(null)
  const [topAgents, setTopAgents] = useState<any[]>([])
  const [latency, setLatency] = useState<any[]>([])
  const [failed, setFailed] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userChecked, setUserChecked] = useState(false)

  useEffect(() => {
    if (!supabaseUserId) return

    async function loadAll() {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setUserChecked(true); setLoading(false); return }

      const headers = { 'x-user-id': user.id }

      const [revRes, srRes, agRes, latRes, failRes] = await Promise.allSettled([
        fetch(`${SERVER_URL}/api/analytics/revenue?period=${period}`, { headers }),
        fetch(`${SERVER_URL}/api/analytics/success-rate`, { headers }),
        fetch(`${SERVER_URL}/api/analytics/top-agents`, { headers }),
        fetch(`${SERVER_URL}/api/analytics/latency`, { headers }),
        fetch(`${SERVER_URL}/api/analytics/failed`, { headers }),
      ])

      if (revRes.status === 'fulfilled' && revRes.value.ok)   setRevenue(await revRes.value.json())
      if (srRes.status === 'fulfilled' && srRes.value.ok)     setSuccessRate(await srRes.value.json())
      if (agRes.status === 'fulfilled' && agRes.value.ok)     setTopAgents((await agRes.value.json()).agents ?? [])
      if (latRes.status === 'fulfilled' && latRes.value.ok)   setLatency((await latRes.value.json()).latency ?? [])
      if (failRes.status === 'fulfilled' && failRes.value.ok) setFailed((await failRes.value.json()).failed ?? [])

      setUserChecked(true)
      setLoading(false)
    }

    loadAll()
  }, [supabaseUserId, period])

  // ── Free gate ─────────────────────────────────────────────────────────────
  if (userChecked && !isPro) {
    return (
      <DashboardLayout>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 15, color: 'var(--text-muted)', fontFamily: SANS }}>Analytics is a Pro feature.</div>
          <a href="/billing" style={{ padding: '10px 24px', background: GREEN, color: '#000', borderRadius: 6, fontSize: 14, fontWeight: 600, textDecoration: 'none', fontFamily: SANS }}>
            Upgrade to Pro →
          </a>
        </div>
      </DashboardLayout>
    )
  }

  const byDay: any[] = revenue?.byDay ?? []
  const srColor = successRate
    ? successRate.successRate >= 95 ? GREEN
      : successRate.successRate >= 80 ? '#f59e0b'
      : '#ef4444'
    : 'var(--text-primary)'

  const hasHighLatency = latency.some(ep => (ep.p99 ?? 0) > 1000)

  return (
    <DashboardLayout>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
      <PageContainer>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)' }}>
          <PageHeader title="Analytics" />
          <div style={{ display: 'flex', gap: 4, paddingTop: 4 }}>
            {(['7d', '30d', '90d'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '6px 14px', borderRadius: 6, fontSize: 12, fontFamily: MONO, cursor: 'pointer',
                  background: 'transparent',
                  color: period === p ? GREEN : 'var(--text-muted)',
                  border: `1px solid ${period === p ? 'rgba(0,188,125,0.4)' : 'var(--border)'}`,
                  transition: 'all 150ms',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* ══ SECTION 1 — REVENUE SUMMARY ════════════════════════════════════ */}
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Revenue Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            {loading ? Array(4).fill(0).map((_, i) => <Card key={i}><Skeleton height={56} /></Card>) : (
              <>
                <StatCard label="Gross Revenue" value={revenue ? `$${revenue.totalGross?.toFixed(4)}` : '—'} sub="All time" />
                <StatCard label="Net Revenue (99%)" value={revenue ? `$${revenue.totalNet?.toFixed(4)}` : '—'} sub="Goes to you" color={GREEN} />
                <StatCard label="Platform Fees (1%)" value={revenue ? `$${revenue.totalFees?.toFixed(5)}` : '—'} sub="Gate402 fee" />
                <StatCard label="Transactions" value={revenue ? String(revenue.transactionCount ?? 0) : '—'} sub={`Last ${period}`} />
              </>
            )}
          </div>

          <Card>
            <div style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Revenue by Day</div>
            {loading ? <Skeleton height={200} /> : byDay.length === 0 ? (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12, fontFamily: MONO }}>No data for this period</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={byDay} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#555', fontFamily: MONO }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#555', fontFamily: MONO }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${v}`} width={48} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    content={({ active, payload, label }: any) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', fontSize: 12, fontFamily: MONO }}>
                          <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                          <div style={{ color: GREEN }}>Gross: ${(payload[0]?.value as number)?.toFixed(5)}</div>
                          <div style={{ color: '#888' }}>Net: ${(payload[1]?.value as number)?.toFixed(5)}</div>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="gross" fill={GREEN} radius={[2, 2, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="net" fill="rgba(0,188,125,0.35)" radius={[2, 2, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* ══ SECTION 2 — SUCCESS RATE & MRR ════════════════════════════════ */}
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Success Rate & MRR</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-sm)' }}>
            {loading ? Array(3).fill(0).map((_, i) => <Card key={i}><Skeleton height={56} /></Card>) : (
              <>
                <StatCard label="Success Rate" value={successRate ? `${successRate.successRate}%` : '—'} sub="Last 7 days" color={srColor} />
                <StatCard label="MRR Projected" value={successRate ? `$${successRate.mrrProjected?.toFixed(2)}/mo` : '—'} sub="Based on 7d" />
                <StatCard label="Failed Calls" value={successRate ? String(successRate.failedCalls ?? 0) : '—'} sub="Last 7 days" color={successRate?.failedCalls > 0 ? '#ef4444' : undefined} />
              </>
            )}
          </div>
        </div>

        {/* ══ SECTION 3 — TOP PAYING AGENTS ══════════════════════════════════ */}
        <Card style={{ padding: 0, marginBottom: 'var(--space-md)' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Top Paying Agents</div>
          </div>
          {loading ? (
            <div style={{ padding: 24 }}><Skeleton height={120} /></div>
          ) : topAgents.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: SANS, marginBottom: 6 }}>No paying agents yet</div>
              <div style={{ fontSize: 12, color: '#444', fontFamily: SANS }}>Make your first paid API call to see agent data here.</div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 80px 110px 110px', padding: '10px 24px', borderBottom: '1px solid var(--border)' }}>
                {['Rank', 'Agent Wallet', 'Calls', 'Total Paid', 'Net Received'].map(h => (
                  <span key={h} style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</span>
                ))}
              </div>
              {topAgents.map((ag, i) => {
                const wallet: string = ag.payerWallet ?? '—'
                const truncated = wallet.length > 10 ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : wallet
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '48px 1fr 80px 110px 110px', padding: '12px 24px', borderBottom: i < topAgents.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: '#444' }}>#{i + 1}</span>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{truncated}</span>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-secondary)' }}>{ag.calls ?? ag.count ?? 0}</span>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: GREEN }}>${(ag.totalPaid ?? ag.total ?? 0).toFixed(5)}</span>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: '#888' }}>${((ag.totalPaid ?? ag.total ?? 0) * 0.99).toFixed(5)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* ══ SECTION 4 — LATENCY ════════════════════════════════════════════ */}
        <Card style={{ padding: 0, marginBottom: 'var(--space-md)' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Latency</div>
            {hasHighLatency && (
              <div style={{ padding: '4px 12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 6, fontSize: 11, color: '#fbbf24', fontFamily: SANS }}>
                High latency detected — optimize handler response time
              </div>
            )}
          </div>
          {loading ? (
            <div style={{ padding: 24 }}><Skeleton height={120} /></div>
          ) : latency.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, fontFamily: MONO }}>No latency data yet</div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 80px 64px', padding: '10px 24px', borderBottom: '1px solid var(--border)' }}>
                {['Endpoint', 'p50', 'p95', 'p99', 'Avg', 'Calls'].map(h => (
                  <span key={h} style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</span>
                ))}
              </div>
              {latency.map((ep, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 80px 64px', padding: '12px 24px', borderBottom: i < latency.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ep.endpoint}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: latColor(ep.p50) }}>{fmtMs(ep.p50)}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: latColor(ep.p95) }}>{fmtMs(ep.p95)}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: latColor(ep.p99) }}>{fmtMs(ep.p99)}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: latColor(ep.avg) }}>{fmtMs(ep.avg)}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-muted)' }}>{ep.count ?? ep.calls ?? 0}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ══ SECTION 5 — FAILED REQUESTS ════════════════════════════════════ */}
        <Card style={{ padding: 0 }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Failed Requests</div>
          </div>
          {loading ? (
            <div style={{ padding: 24 }}><Skeleton height={120} /></div>
          ) : failed.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: GREEN, fontFamily: SANS }}>No failed requests in the last 7 days ✓</div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 90px 1fr', padding: '10px 24px', borderBottom: '1px solid var(--border)' }}>
                {['Time', 'Endpoint', 'Status', 'Tx Hash'].map(h => (
                  <span key={h} style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</span>
                ))}
              </div>
              {failed.map((f, i) => {
                const t = new Date(f.createdAt ?? f.timestamp)
                const timeStr = `${String(t.getDate()).padStart(2, '0')}/${String(t.getMonth() + 1).padStart(2, '0')} ${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`
                const txHash: string = f.txHash ?? f.txHashProvider ?? '—'
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 90px 1fr', padding: '12px 24px', borderBottom: i < failed.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)' }}>{timeStr}</span>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.endpoint ?? f.endpointPath ?? '—'}</span>
                    <StatusBadge status={f.status ?? 'failed'} />
                    <span style={{ fontFamily: MONO, fontSize: 11, color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{txHash.length > 20 ? `${txHash.slice(0, 8)}...${txHash.slice(-6)}` : txHash}</span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

      </PageContainer>
    </DashboardLayout>
  )
}

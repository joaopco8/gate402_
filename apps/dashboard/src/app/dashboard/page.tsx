'use client'

export const dynamic = 'force-dynamic'

import { useRef, useMemo, useEffect } from 'react'
import { BarChart, Bar, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import DashboardLayout from '../components/DashboardLayout'
import PageContainer from '../components/PageContainer'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import { ProGate } from '../components/ProGate'
import { ProBanner } from '../components/ProBanner'
import { useUser } from '../hooks/useUser'
import { useDashboardData } from '../hooks/useDashboardData'

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ width = '100%', height = 16 }: { width?: string | number; height?: number }) {
  return (
    <div style={{
      width, height,
      background: 'linear-gradient(90deg, var(--surface) 25%, var(--card-raised) 50%, var(--surface) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: 4,
    }} />
  )
}

// ── Sparkline helpers ────────────────────────────────────────────────────────

function generateSmoothPath(points: number[], w: number, h: number): string {
  if (points.length < 2) return `M 0 ${h}`
  const xStep = w / (points.length - 1)
  const pts = points.map((p, i) => [i * xStep, h - (p / 100) * (h * 0.8) - h * 0.1] as [number, number])
  let path = `M ${pts[0][0]} ${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1]
    const mx = (x1 + x2) / 2
    path += ` C ${mx},${y1} ${mx},${y2} ${x2},${y2}`
  }
  return path
}

// ── StatsCard ─────────────────────────────────────────────────────────────────

function StatsCard({ label, value, sub, sparkData, change, loading }: {
  label: string; value: string; sub?: string; sparkData: number[]; change: number | null; loading?: boolean
}) {
  const lineRef = useRef<SVGPathElement>(null)
  const areaRef = useRef<SVGPathElement>(null)
  const svgW = 100, svgH = 48
  const isPositive = change === null || change >= 0
  const strokeColor = isPositive ? '#00bc7d' : '#ef4444'
  const gradId = `sg-${label.replace(/\W+/g, '')}`

  const linePath = useMemo(() => generateSmoothPath(sparkData, svgW, svgH), [sparkData])
  const areaPath = useMemo(() => linePath.startsWith('M') ? `${linePath} L ${svgW} ${svgH} L 0 ${svgH} Z` : '', [linePath])

  useEffect(() => {
    const path = lineRef.current
    const area = areaRef.current
    if (!path || !area) return
    const len = path.getTotalLength()
    path.style.transition = 'none'
    path.style.strokeDasharray = `${len} ${len}`
    path.style.strokeDashoffset = `${len}`
    area.style.transition = 'none'
    area.style.opacity = '0'
    path.getBoundingClientRect()
    path.style.transition = 'stroke-dashoffset 0.8s ease-in-out'
    path.style.strokeDashoffset = '0'
    area.style.transition = 'opacity 0.8s ease-in-out 0.2s'
    area.style.opacity = '1'
  }, [linePath])

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {label}
            </span>
            {change !== null && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 600, color: isPositive ? '#00bc7d' : '#ef4444', fontFamily: 'var(--font-code)' }}>
                {isPositive ? '↑' : '↓'}{Math.abs(change).toFixed(0)}%
              </span>
            )}
          </div>
          {loading
            ? <Skeleton height={28} width={100} />
            : <div style={{ fontSize: 26, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 4 }}>{value}</div>
          }
          {sub && !loading && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
          )}
        </div>

        {!loading && sparkData.length >= 2 && (
          <div style={{ width: 100, height: 48, flexShrink: 0 }}>
            <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <path ref={areaRef} d={areaPath} fill={`url(#${gradId})`} />
              <path ref={lineRef} d={linePath} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    </Card>
  )
}

// ── MiniChart ────────────────────────────────────────────────────────────────

const CHART_CSS = `
  .g402-chart .recharts-cartesian-axis-tick text {
    fill: var(--text-muted);
    font-size: 12px;
  }
  .g402-chart .recharts-cartesian-grid line[stroke='#ccc'],
  .g402-chart .recharts-cartesian-grid line {
    stroke: var(--border);
    stroke-opacity: 0.5;
  }
  .g402-chart .recharts-rectangle.recharts-tooltip-cursor {
    fill: var(--surface);
    opacity: 0.6;
  }
  .g402-chart .recharts-curve.recharts-tooltip-cursor { stroke: var(--border); }
  .g402-chart .recharts-layer,
  .g402-chart .recharts-sector,
  .g402-chart .recharts-surface { outline: none; }
`

function MiniChart({ data }: { data: Array<{ date: string; count: number }> }) {
  if (!data?.length) return (
    <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: 12, fontFamily: 'var(--font-code)' }}>
      no data yet
    </div>
  )
  return (
    <>
      <style>{CHART_CSS}</style>
      <div className="g402-chart" style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 12, left: 12, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string) =>
                new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              }
            />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
                fontFamily: 'var(--font-code)',
                color: 'var(--text-primary)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
              }}
              formatter={(value: unknown) => [`${value} calls`, '']}
              labelFormatter={(label: unknown) =>
                new Date(String(label)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              }
            />
            <Bar dataKey="count" fill="#00bc7d" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}

// ── RecentCalls ───────────────────────────────────────────────────────────────

function RecentCalls({ calls, loading, isPro }: { calls: any[]; loading: boolean; isPro: boolean }) {
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const m = Math.floor(diff / 60000)
    const h = Math.floor(diff / 3600000)
    const d = Math.floor(diff / 86400000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    if (h < 24) return `${h}h ago`
    return `${d}d ago`
  }

  return (
    <Card style={{ padding: 0 }}>
      {/* Header row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 150px 80px', padding: '10px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', borderRadius: '12px 12px 0 0' }}>
        {['Endpoint', 'Amount', 'Payer', 'Time'].map(h => (
          <span key={h} style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</span>
        ))}
      </div>

      {loading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ padding: '13px 20px', borderBottom: '1px solid var(--border)' }}>
            <Skeleton height={13} />
          </div>
        ))
      ) : calls.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-faint)', fontFamily: 'var(--font-code)', fontSize: 12 }}>
          No calls yet — make your first request
        </div>
      ) : (
        calls.map((call, i) => (
          <div key={call.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 150px 80px', padding: '10px 20px', borderBottom: i < calls.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {call.endpoint || '—'}
            </span>
            <span style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: 'var(--green)' }}>
              {call.amountUsdc ? `$${Number(call.amountUsdc).toFixed(5)}` : '—'}
            </span>
            <span style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'var(--text-secondary)' }}>
              {call.payerWallet ? `${call.payerWallet.slice(0, 6)}...${call.payerWallet.slice(-4)}` : 'anonymous'}
            </span>
            <span style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'var(--text-muted)' }}>
              {call.createdAt ? timeAgo(call.createdAt) : '—'}
            </span>
          </div>
        ))
      )}

      {!isPro && !loading && calls.length >= 5 && (
        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '0 0 12px 12px' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>Showing last 5 calls</span>
          <a href="/billing" style={{ fontSize: 12, color: 'var(--green)', fontFamily: 'var(--font-code)' }}>Upgrade for last 50 →</a>
        </div>
      )}
    </Card>
  )
}

// ── QuickSetup ────────────────────────────────────────────────────────────────

function QuickSetup({ walletAddress, endpointCount, totalCalls }: {
  walletAddress: string | null; endpointCount: number; totalCalls: number
}) {
  const steps = [
    { done: true,              label: 'Account created',         link: null },
    { done: !!walletAddress,   label: 'Configure Solana wallet', link: '/settings' },
    { done: endpointCount > 0, label: 'Add your first endpoint', link: '/endpoints' },
    { done: totalCalls > 0,    label: 'Receive first payment',   link: '/docs' },
  ]
  if (steps.every(s => s.done)) return null

  return (
    <Card style={{ marginTop: 'var(--space-xl)' }}>
      <div style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
        Quick Setup
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
              background: step.done ? 'rgba(0,188,125,0.1)' : 'var(--surface)',
              border: `1px solid ${step.done ? 'var(--green)' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {step.done && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="#00bc7d" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </div>
            <span style={{ fontSize: 13, color: step.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: step.done ? 'line-through' : 'none', flex: 1 }}>
              {step.label}
            </span>
            {!step.done && step.link && (
              <a href={step.link} style={{ fontSize: 12, color: 'var(--green)', fontFamily: 'var(--font-code)' }}>Set up →</a>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { userData, supabaseUserId, loading: userLoading, isPro } = useUser()
  const { data, loading: dataLoading } = useDashboardData(supabaseUserId, isPro)

  const loading = userLoading || dataLoading
  const weeklyAmount = data?.callsPerDay?.reduce((s, d) => s + (d.amount || 0), 0) || 0
  const mrrProjected = (weeklyAmount / 7) * 30

  // Spark data: normalize raw values to 0–100 scale
  const toSpark = (vals: number[]) => {
    const max = Math.max(...vals, 1)
    return vals.map(v => (v / max) * 100)
  }
  const callsRaw = data?.callsPerDay?.map(d => d.count) ?? []
  const revenueRaw = data?.callsPerDay?.map(d => d.amount ?? 0) ?? []
  const callsSpark = toSpark(callsRaw)
  const revenueSpark = toSpark(revenueRaw)

  // Change %: last day vs day before (day-over-day)
  const dayChange = (vals: number[]): number | null => {
    if (vals.length < 2) return null
    const last = vals[vals.length - 1]
    const prev = vals[vals.length - 2]
    if (prev === 0) return last > 0 ? 100 : null
    return ((last - prev) / prev) * 100
  }
  const callsChange = dayChange(callsRaw)
  const revenueChange = dayChange(revenueRaw)

  return (
    <DashboardLayout>
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
      `}</style>

      <PageContainer>
        <ProBanner isPro={isPro} />

        <PageHeader
          eyebrow="GATE402"
          title="Overview"
          subtitle={`${userData?.plan === 'pro' ? 'Pro plan' : 'Free plan'} · ${userData?.network === 'mainnet' ? 'Solana Mainnet' : 'Solana Devnet'}`}
        />

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
          <StatsCard label="Total Calls"   value={loading ? '—' : (data?.totalCalls || 0).toLocaleString()} sub="all time"        sparkData={callsSpark}   change={callsChange}   loading={loading} />
          <StatsCard label="Total Earned"  value={loading ? '—' : `$${(data?.totalUsdc || 0).toFixed(4)}`}  sub="USDC · all time" sparkData={revenueSpark} change={revenueChange} loading={loading} />
          <StatsCard label="Calls Today"   value={loading ? '—' : (data?.callsToday || 0).toLocaleString()} sub="since 00:00 UTC" sparkData={callsSpark}   change={callsChange}   loading={loading} />
          <StatsCard label="Revenue Today" value={loading ? '—' : `$${(data?.usdcToday || 0).toFixed(4)}`}  sub="USDC today"      sparkData={revenueSpark} change={revenueChange} loading={loading} />
        </div>

        {/* Chart + MRR */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Calls — last 7 days
              </span>
              <span style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'var(--text-secondary)' }}>
                {data?.callsPerDay?.reduce((s, d) => s + d.count, 0) || 0} total
              </span>
            </div>
            {loading ? <Skeleton height={220} /> : <MiniChart data={data?.callsPerDay || []} />}
          </Card>

          <ProGate isPro={isPro} feature="MRR Projection">
            <Card style={{ height: '100%', boxSizing: 'border-box' }}>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>MRR Projected</div>
              <div style={{ fontSize: 26, fontWeight: 600, color: 'var(--green)', letterSpacing: '-0.5px' }}>${mrrProjected.toFixed(2)}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, marginBottom: 16 }}>based on last 7 days</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(data?.callsPerDay || []).slice(-3).map((d, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'var(--text-muted)' }}>{d.date}</span>
                    <span style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'var(--text-secondary)' }}>{d.count} calls</span>
                  </div>
                ))}
              </div>
            </Card>
          </ProGate>
        </div>

        {/* Recent calls */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
            <span style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Recent Calls
            </span>
            <a href="/endpoints" style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>
              Manage endpoints →
            </a>
          </div>
          <RecentCalls calls={data?.recentCalls || []} loading={loading} isPro={isPro} />
        </div>

        {/* Quick setup */}
        {!loading && (
          <QuickSetup
            walletAddress={userData?.walletAddress ?? null}
            endpointCount={data?.endpoints?.length || 0}
            totalCalls={data?.totalCalls || 0}
          />
        )}
      </PageContainer>
    </DashboardLayout>
  )
}

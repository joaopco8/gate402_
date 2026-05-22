'use client'

export const dynamic = 'force-dynamic'

import { useRef, useMemo, useEffect, useState } from 'react'
import { ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import DashboardLayout from '../components/DashboardLayout'
import PageContainer from '../components/PageContainer'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import { ProGate } from '../components/ProGate'
import { ProBanner } from '../components/ProBanner'
import { useUser } from '../hooks/useUser'
import { useDashboardData } from '../hooks/useDashboardData'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'

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
// Colors match stats-widget.tsx exactly:
//   positive → #22C55E (success-stroke)
//   negative → #F97316 (destructive-stroke / orange)

function ArrowUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 3 }}>
      <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
    </svg>
  )
}
function ArrowDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 3 }}>
      <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
    </svg>
  )
}

type Sentiment = 'positive' | 'negative' | 'neutral'

function getSentiment(change: number | null, sparkData: number[]): Sentiment {
  const hasActivity = sparkData.some(v => v > 0)
  if (!hasActivity || change === null) return 'neutral'
  if (change > 0) return 'positive'
  if (change < 0) return 'negative'
  return 'neutral'
}

const SENTIMENT_COLOR: Record<Sentiment, string> = {
  positive: '#22C55E',
  negative: '#F97316',
  neutral:  '#F59E0B',
}

function StatsCard({ label, value, sub, sparkData, change, loading }: {
  label: string; value: string; sub?: string; sparkData: number[]; change: number | null; loading?: boolean
}) {
  const lineRef = useRef<SVGPathElement>(null)
  const areaRef = useRef<SVGPathElement>(null)
  const svgW = 150, svgH = 60
  const sentiment = getSentiment(change, sparkData)
  const strokeColor = SENTIMENT_COLOR[sentiment]
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
    path.style.transition = 'stroke-dashoffset 0.8s ease-in-out, stroke 0.5s ease'
    path.style.strokeDashoffset = '0'
    area.style.transition = 'opacity 0.8s ease-in-out 0.2s, fill 0.5s ease'
    area.style.opacity = '1'
  }, [linePath])

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: 14, marginBottom: 8 }}>
            <span>{label}</span>
            {change !== null && sentiment !== 'neutral' && (
              <span style={{ display: 'flex', alignItems: 'center', marginLeft: 8, fontWeight: 600, color: strokeColor, fontSize: 14 }}>
                {Math.abs(change).toFixed(0)}%
                {sentiment === 'positive' ? <ArrowUpIcon /> : <ArrowDownIcon />}
              </span>
            )}
          </div>
          {loading
            ? <Skeleton height={36} width={120} />
            : <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-1px', lineHeight: 1.1 }}>{value}</div>
          }
          {sub && !loading && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>
          )}
        </div>

        {!loading && sparkData.length >= 2 && (
          <div style={{ width: '45%', height: 64, flexShrink: 0 }}>
            <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
              <defs>
                <linearGradient id={`${gradId}-pos`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#22C55E" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id={`${gradId}-neg`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F97316" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#F97316" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id={`${gradId}-neu`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <path ref={areaRef} d={areaPath} fill={`url(#${gradId}-${sentiment === 'positive' ? 'pos' : sentiment === 'negative' ? 'neg' : 'neu'})`} />
              <path ref={lineRef} d={linePath} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    </Card>
  )
}

// ── MiniChart ────────────────────────────────────────────────────────────────

const LINE_COLOR = '#00bc7d'

const CHART_CSS = `
  .g402-chart .recharts-cartesian-axis-tick text { fill: var(--text-muted); font-size: 12px; }
  .g402-chart .recharts-layer, .g402-chart .recharts-sector, .g402-chart .recharts-surface { outline: none; }
  .g402-chart .recharts-curve.recharts-tooltip-cursor { stroke: ${LINE_COLOR}; stroke-dasharray: none; }
`

interface TooltipPayload { value: number }
interface MiniTooltipProps { active?: boolean; payload?: TooltipPayload[]; label?: string }

function MiniTooltip({ active, payload }: MiniTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#18181b', color: '#fff', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontFamily: 'var(--font-code)', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}>
      <div style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 2 }}>Total</div>
      <div style={{ fontWeight: 600 }}>{payload[0].value} calls</div>
    </div>
  )
}

function MiniChart({ data, days = 7 }: { data: Array<{ date: string; count: number }>; days?: number }) {
  if (!data?.length) return (
    <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: 12, fontFamily: 'var(--font-code)' }}>
      no data yet
    </div>
  )

  // For longer periods, thin out tick frequency so labels don't overlap
  const tickInterval = days <= 7 ? 0 : days <= 30 ? 4 : 13

  return (
    <>
      <style>{CHART_CSS}</style>
      <div className="g402-chart" style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 25, right: 25, left: 0, bottom: 25 }} style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="g402LineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={LINE_COLOR} stopOpacity={0.15} />
                <stop offset="100%" stopColor={LINE_COLOR} stopOpacity={0} />
              </linearGradient>
              <filter id="g402DotShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.5)" />
              </filter>
            </defs>

            <CartesianGrid
              strokeDasharray="4 12"
              stroke="var(--border)"
              strokeOpacity={1}
              horizontal={true}
              vertical={false}
            />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
              tickMargin={12}
              dy={10}
              interval={tickInterval}
              tickFormatter={(v: string) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
              tickMargin={12}
              domain={[0, 'dataMax + 1']}
              tickCount={5}
              allowDecimals={false}
            />

            <Tooltip
              content={<MiniTooltip />}
              cursor={{ stroke: LINE_COLOR, strokeWidth: 1, strokeDasharray: 'none' }}
            />

            <Area type="linear" dataKey="count" stroke="transparent" fill="url(#g402LineGrad)" strokeWidth={0} dot={false} />

            <Line
              type="linear"
              dataKey="count"
              stroke={LINE_COLOR}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: LINE_COLOR, stroke: '#fff', strokeWidth: 2, filter: 'url(#g402DotShadow)' }}
            />
          </ComposedChart>
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
          <span key={h} style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: 'var(--text-faint)', }}>{h}</span>
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
      <div style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
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

// ── MeteringCard ──────────────────────────────────────────────────────────────

const METERING_META: Record<string, { icon: string; unit: string }> = {
  token:     { icon: 'T', unit: 'tokens' },
  compute:   { icon: '⚡', unit: 'ms' },
  bandwidth: { icon: 'B', unit: 'KB' },
}

function MeteringCard({ stats }: { stats: any }) {
  const byType: any[] = stats?.byType ?? []
  if (byType.length === 0) return null

  return (
    <Card style={{ marginBottom: 'var(--space-xl)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Usage Metering</span>
        <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontFamily: 'var(--font-code)', background: 'rgba(147,51,234,0.12)', color: '#a78bfa', border: '1px solid rgba(147,51,234,0.2)' }}>PRO</span>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${byType.length}, 1fr)`, gap: 'var(--space-sm)', marginBottom: 20 }}>
        {byType.map((item: any) => {
          const meta = METERING_META[item.type] ?? { icon: '·', unit: '' }
          return (
            <div key={item.type} style={{ padding: '14px 16px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontFamily: 'var(--font-code)', fontSize: 13, color: 'var(--text-muted)', width: 20, textAlign: 'center' }}>{meta.icon}</span>
                <span style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.type}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {(item.totalUsage ?? 0).toLocaleString()} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>{meta.unit}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: 'var(--green)' }}>${(item.totalCost ?? 0).toFixed(6)} USDC</div>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: '#444', marginTop: 4 }}>{item.count ?? 0} record{item.count !== 1 ? 's' : ''}</div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <span style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: '#555' }}>
          Pending settlement: ${(stats.totalPending ?? 0).toFixed(6)} USDC
        </span>
        <a href="/analytics" style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: 'var(--green)', textDecoration: 'none' }}>
          Settle pending →
        </a>
      </div>
    </Card>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
  { value: '7',  label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
]

export default function DashboardPage() {
  const { userData, supabaseUserId, loading: userLoading, isPro } = useUser()
  const [chartDays, setChartDays] = useState(7)
  const { data, loading: dataLoading } = useDashboardData(supabaseUserId, isPro, chartDays)
  const [meteringStats, setMeteringStats] = useState<any>(null)

  useEffect(() => {
    if (!isPro || !supabaseUserId) return
    fetch(`${SERVER_URL}/api/metering/stats`, { headers: { 'x-user-id': supabaseUserId } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setMeteringStats(d) })
      .catch(() => {})
  }, [supabaseUserId, isPro])

  const loading = dataLoading
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

        <PageHeader title="Overview" />

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
              <span style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: 'var(--text-muted)', }}>
                Calls
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'var(--text-secondary)' }}>
                  {data?.callsPerDay?.reduce((s, d) => s + d.count, 0) || 0} total
                </span>
                <Select
                  value={String(chartDays)}
                  onValueChange={v => setChartDays(Number(v))}
                  indicatorPosition="right"
                >
                  <SelectTrigger size="sm" className="w-[130px] font-mono text-[11px]" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIOD_OPTIONS.map(opt => (
                      (!isPro && opt.value !== '7') ? null : (
                        <SelectItem key={opt.value} value={opt.value} className="font-mono text-[11px]">
                          {opt.label}
                          {!isPro && opt.value !== '7' && <span className="ml-1 text-[10px] opacity-50">Pro</span>}
                        </SelectItem>
                      )
                    ))}
                    {!isPro && (
                      <>
                        <SelectItem value="30" disabled className="font-mono text-[11px]">
                          Last 30 days <span className="ml-1 text-[10px] opacity-50">Pro</span>
                        </SelectItem>
                        <SelectItem value="90" disabled className="font-mono text-[11px]">
                          Last 90 days <span className="ml-1 text-[10px] opacity-50">Pro</span>
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {loading ? <Skeleton height={280} /> : <MiniChart data={data?.callsPerDay || []} days={chartDays} />}
          </Card>

          <ProGate isPro={isPro} feature="MRR Projection">
            <Card style={{ height: '100%', boxSizing: 'border-box' }}>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>MRR Projected</div>
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
            <span style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: 'var(--text-muted)', }}>
              Recent Calls
            </span>
            <a href="/endpoints" style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>
              Manage endpoints →
            </a>
          </div>
          <RecentCalls calls={data?.recentCalls || []} loading={loading} isPro={isPro} />
        </div>

        {/* Metering */}
        {meteringStats && (
          <ProGate isPro={isPro} feature="Usage Metering">
            <MeteringCard stats={meteringStats} />
          </ProGate>
        )}

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

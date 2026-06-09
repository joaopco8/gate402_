'use client'

export const dynamic = 'force-dynamic'

import { useMemo, useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import DashboardLayout from '../components/DashboardLayout'
import PageContainer from '../components/PageContainer'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import { ProGate } from '../components/ProGate'
import { ProBanner } from '../components/ProBanner'
import { useUser } from '@/contexts/UserContext'
import { useDashboardData } from '../hooks/useDashboardData'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { calcChange } from '@/lib/metrics'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.metera.xyz'

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

// ── StatsCard ─────────────────────────────────────────────────────────────────

function generateSmoothPath(points: number[], width: number, height: number): string {
  if (!points || points.length < 2) return `M 0 ${height}`
  const xStep = width / (points.length - 1)
  const pathData = points.map((point, i) => {
    const x = i * xStep
    const y = height - (point / 100) * (height * 0.8) - (height * 0.1)
    return [x, y]
  })
  let path = `M ${pathData[0][0]} ${pathData[0][1]}`
  for (let i = 0; i < pathData.length - 1; i++) {
    const [x1, y1] = pathData[i]
    const [x2, y2] = pathData[i + 1]
    const midX = (x1 + x2) / 2
    path += ` C ${midX},${y1} ${midX},${y2} ${x2},${y2}`
  }
  return path
}

function StatsCard({ label, value, sub, loading, current, previous, chartData }: {
  label: string; value: string; sub?: string; loading?: boolean
  current?: number; previous?: number; chartData?: number[]
}) {
  const change = (current !== undefined && previous !== undefined)
    ? calcChange(current, previous)
    : null

  const linePathRef = useRef<SVGPathElement>(null)
  const areaPathRef = useRef<SVGPathElement>(null)

  const svgWidth = 150
  const svgHeight = 60

  const normalizedData = useMemo(() => {
    const raw = chartData && chartData.length >= 2
      ? chartData
      : [previous ?? 0, current ?? 0]
    const max = Math.max(...raw, 1)
    return raw.map(v => (v / max) * 90)
  }, [chartData, current, previous])

  const linePath = useMemo(() => generateSmoothPath(normalizedData, svgWidth, svgHeight), [normalizedData])
  const areaPath = useMemo(() => linePath.startsWith('M') ? `${linePath} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z` : '', [linePath])

  const graphStroke = useMemo(() => {
    // Primary: drive color from current vs previous (same signal as % badge)
    if (current !== undefined && previous !== undefined) {
      if (current === 0 && previous === 0) return '#6b7280'
      if (current > previous) return '#7AF279'
      if (current < previous) return '#ef4444'
      return '#6b7280'
    }
    // Fallback: chart shape trend
    if (normalizedData.length < 2) return '#6b7280'
    const delta = normalizedData[normalizedData.length - 1] - normalizedData[0]
    if (delta > 4) return '#7AF279'
    if (delta < -4) return '#ef4444'
    return '#6b7280'
  }, [normalizedData, current, previous])
  const gradientId = `statsGrad_${label.replace(/\s+/g, '')}`

  useEffect(() => {
    const path = linePathRef.current
    const area = areaPathRef.current
    if (!path || !area) return
    const length = path.getTotalLength()
    path.style.transition = 'none'
    path.style.strokeDasharray = `${length} ${length}`
    path.style.strokeDashoffset = `${length}`
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Label + change */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
          <span>{label}</span>
          {change && change.direction !== 'none' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 12, fontWeight: 600, color: change.color }}>
              {change.label}
              {change.direction === 'up'
                ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
              }
            </span>
          )}
        </div>

        {/* Value + chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 }}>
          <div>
            {loading
              ? <Skeleton height={36} width={120} />
              : <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-1px', lineHeight: 1.1 }}>{value}</div>
            }
            {sub && !loading && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>
            )}
          </div>

          {!loading && (
            <div style={{ width: 80, height: 44, flexShrink: 0 }}>
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={graphStroke} stopOpacity={0.35}/>
                    <stop offset="100%" stopColor={graphStroke} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <path ref={areaPathRef} d={areaPath} fill={`url(#${gradientId})`} />
                <path ref={linePathRef} d={linePath} fill="none" stroke={graphStroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

// ── MiniChart ────────────────────────────────────────────────────────────────

const LINE_COLOR = '#7AF279'

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
    <div style={{ background: '#18181b', color: '#fff', borderRadius: 6, padding: '8px 12px', fontSize: 12, fontFamily: 'var(--font-label)', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}>
      <div style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 2 }}>Total</div>
      <div style={{ fontWeight: 600 }}>{payload[0].value} calls</div>
    </div>
  )
}

function MiniChart({ data, days = 7 }: { data: Array<{ date: string; count: number }>; days?: number }) {
  if (!data?.length) return (
    <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: 12, fontFamily: 'var(--font-label)' }}>
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

const rowVariants = {
  hidden:  { opacity: 0, y: 16, scale: 0.98, filter: 'blur(3px)' },
  visible: { opacity: 1, y: 0,  scale: 1,    filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 400, damping: 28, mass: 0.7 } },
}
const containerVariants = {
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
}


function sparkColor(data: number[]): string {
  if (!data || data.length < 2) return '#f59e0b'
  const nonZero = data.filter(v => v > 0)
  if (nonZero.length === 0) return '#f59e0b'
  const first = data.find(v => v > 0) ?? 0
  const last = [...data].reverse().find(v => v > 0) ?? 0
  if (last > first) return '#3ECF8E'
  if (last < first) return '#ef4444'
  return '#f59e0b'
}

function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 56
    const y = 16 - ((v - min) / range) * 13
    return `${x},${y}`
  }).join(' ')
  const color = sparkColor(data)
  return (
    <motion.svg width="56" height="16" viewBox="0 0 56 16" style={{ overflow: 'visible' }}
      initial={{ opacity: 0, scaleX: 0.7 }} animate={{ opacity: 1, scaleX: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.2 }}>
      <motion.polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.25 }} />
    </motion.svg>
  )
}

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

  // Build per-endpoint sparkline data from the calls list
  const sparkMap = useMemo(() => {
    const map: Record<string, number[]> = {}
    ;[...calls].reverse().forEach(c => {
      const k = c.endpoint || '/'
      if (!map[k]) map[k] = []
      map[k].push(Number(c.amountUsdc) || 0)
    })
    return map
  }, [calls])

  const COLS = '1fr 90px 120px 64px 90px'

  return (
    <div style={{ borderRadius: 6, border: '1px solid var(--border-default)', background: 'var(--bg-surface)', overflow: 'hidden', minWidth: 480 }}>

      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: COLS, columnGap: 8,
        padding: '9px 20px', borderBottom: '1px solid var(--border-default)',
        background: 'var(--bg-base)' }}>
        {['Endpoint', 'Amount', 'Payer', 'Chart', 'Time'].map(h => (
          <span key={h} style={{ fontFamily: "var(--font-label)", fontSize: 11,
            color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {h}
          </span>
        ))}
      </div>

      {loading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ padding: '13px 20px', borderBottom: '1px solid var(--border-default)' }}>
            <Skeleton height={13} />
          </div>
        ))
      ) : calls.length === 0 ? (
        <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)',
          fontFamily: "var(--font-label)", fontSize: 12 }}>
          No calls yet — make your first request
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {calls.map((call, i) => {
            const amount = call.amountUsdc ? Number(call.amountUsdc) : null
            const spark = sparkMap[call.endpoint || '/'] ?? []
            return (
              <motion.div key={call.id} variants={rowVariants}>
                <div style={{
                  display: 'grid', gridTemplateColumns: COLS, columnGap: 8,
                  padding: '11px 20px', alignItems: 'center',
                  borderBottom: i < calls.length - 1 ? '1px solid var(--border-default)' : 'none',
                  transition: 'background 120ms',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontFamily: "var(--font-label)", fontSize: 12,
                    color: 'var(--text-primary)', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                    {call.endpoint || '—'}
                  </span>

                  <span style={{ fontSize: 11, fontFamily: "var(--font-label)", color: 'var(--text-muted)' }}>
                    {amount ? `$${amount.toFixed(5)}` : 'free'}
                  </span>

                  <span style={{ fontFamily: "var(--font-label)", fontSize: 11,
                    color: 'var(--text-secondary)', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {call.payerWallet
                      ? `${call.payerWallet.slice(0, 4)}…${call.payerWallet.slice(-4)}`
                      : 'anon'}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Sparkline data={spark.length >= 2 ? spark : [0, amount ?? 0, amount ?? 0]} />
                  </div>

                  <span style={{ fontFamily: "var(--font-label)", fontSize: 11,
                    color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {call.createdAt ? timeAgo(call.createdAt) : '—'}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {!isPro && !loading && calls.length >= 5 && (
        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border-default)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: "var(--font-label)" }}>
            Showing last 5 calls
          </span>
          <a href="/billing" style={{ fontSize: 12, color: '#3ECF8E', fontFamily: "var(--font-label)" }}>
            Upgrade for last 50 →
          </a>
        </div>
      )}
    </div>
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
      <div style={{ fontFamily: 'var(--font-label)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
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
              <a href={step.link} style={{ fontSize: 12, color: 'var(--green)', fontFamily: 'var(--font-label)' }}>Set up →</a>
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
        <span style={{ fontFamily: 'var(--font-label)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Usage Metering</span>
        <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontFamily: 'var(--font-label)', background: 'rgba(147,51,234,0.12)', color: '#a78bfa', border: '1px solid rgba(147,51,234,0.2)' }}>PRO</span>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${byType.length}, 1fr)`, gap: 'var(--space-sm)', marginBottom: 20 }}>
        {byType.map((item: any) => {
          const meta = METERING_META[item.type] ?? { icon: '·', unit: '' }
          return (
            <div key={item.type} style={{ padding: '14px 16px', background: 'var(--surface)', borderRadius: 6, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontFamily: 'var(--font-label)', fontSize: 13, color: 'var(--text-muted)', width: 20, textAlign: 'center' }}>{meta.icon}</span>
                <span style={{ fontFamily: 'var(--font-label)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.type}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-label)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {(item.totalUsage ?? 0).toLocaleString()} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>{meta.unit}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-label)', fontSize: 12, color: 'var(--green)' }}>${(item.totalCost ?? 0).toFixed(6)} USDC</div>
              <div style={{ fontFamily: 'var(--font-label)', fontSize: 11, color: '#444', marginTop: 4 }}>{item.count ?? 0} record{item.count !== 1 ? 's' : ''}</div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <span style={{ fontFamily: 'var(--font-label)', fontSize: 12, color: '#555' }}>
          Pending settlement: ${(stats.totalPending ?? 0).toFixed(6)} USDC
        </span>
        <a href="/analytics" style={{ fontFamily: 'var(--font-label)', fontSize: 12, color: 'var(--green)', textDecoration: 'none' }}>
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
  const { userData, supabaseUserId, accessToken, loading: userLoading, isPro } = useUser()
  const [chartDays, setChartDays] = useState(7)
  const { data, loading: dataLoading } = useDashboardData(supabaseUserId, isPro, chartDays)
  const [meteringStats, setMeteringStats] = useState<any>(null)

  useEffect(() => {
    if (!isPro || !accessToken) return
    fetch(`${SERVER_URL}/api/metering/stats`, { headers: { 'Authorization': `Bearer ${accessToken}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setMeteringStats(d) })
      .catch(() => {})
  }, [accessToken, isPro])

  const loading = dataLoading


  return (
    <DashboardLayout>
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
      `}</style>

      <PageContainer>
        <ProBanner isPro={isPro} loading={userLoading} />

        <PageHeader title="Overview" />

        {/* Stat cards */}
        <div className="resp-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
          <StatsCard label="Total Calls"   value={loading ? '—' : (data?.totalCalls || 0).toLocaleString()} sub="all time"        loading={loading} current={data?.callsThisWeek}   previous={data?.callsLastWeek}  chartData={data?.callsPerDay?.map(d => d.count)} />
          <StatsCard label="Total Earned"  value={loading ? '—' : `$${(data?.totalUsdc || 0).toFixed(4)}`}  sub="USDC · all time" loading={loading} current={data?.revenueThisWeek} previous={data?.revenueLastWeek} chartData={data?.callsPerDay?.map(d => d.amount)} />
          <StatsCard label="Calls Today"   value={loading ? '—' : (data?.callsToday || 0).toLocaleString()} sub="since 00:00 UTC" loading={loading} current={data?.callsToday}      previous={data?.callsYesterday} chartData={data?.callsPerDay?.map(d => d.count)} />
          <StatsCard label="Revenue Today" value={loading ? '—' : `$${(data?.usdcToday || 0).toFixed(4)}`}  sub="USDC today"      loading={loading} current={data?.usdcToday}       previous={data?.usdcYesterday} chartData={data?.callsPerDay?.map(d => d.amount)} />
        </div>

        {/* Chart */}
        <Card style={{ marginBottom: 'var(--space-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontFamily: "var(--font-label)", fontSize: 12, color: 'var(--text-muted)' }}>
              Calls
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: "var(--font-label)", fontSize: 11, color: 'var(--text-secondary)' }}>
                {data?.callsPerDay?.reduce((s, d) => s + d.count, 0) || 0} total
              </span>
              <Select
                value={String(chartDays)}
                onValueChange={v => setChartDays(Number(v))}
                indicatorPosition="right"
              >
                <SelectTrigger size="sm" className="w-[130px] text-[11px]" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)', fontFamily: "var(--font-label)" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map(opt => (
                    (!isPro && opt.value !== '7') ? null : (
                      <SelectItem key={opt.value} value={opt.value} className="text-[11px]" style={{ fontFamily: "var(--font-label)" }}>
                        {opt.label}
                        {!isPro && opt.value !== '7' && <span className="ml-1 text-[10px] opacity-50">Pro</span>}
                      </SelectItem>
                    )
                  ))}
                  {!isPro && (
                    <>
                      <SelectItem value="30" disabled className="text-[11px]" style={{ fontFamily: "var(--font-label)" }}>
                        Last 30 days <span className="ml-1 text-[10px] opacity-50">Pro</span>
                      </SelectItem>
                      <SelectItem value="90" disabled className="text-[11px]" style={{ fontFamily: "var(--font-label)" }}>
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

        {/* Recent calls */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
            <span style={{ fontFamily: 'var(--font-label)', fontSize: 12, color: 'var(--text-muted)', }}>
              Recent Calls
            </span>
            <a href="/endpoints" style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-label)' }}>
              Manage endpoints →
            </a>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <RecentCalls calls={data?.recentCalls || []} loading={loading} isPro={isPro} />
          </div>
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

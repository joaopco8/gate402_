'use client'

export const dynamic = 'force-dynamic'

import DashboardLayout from '../components/DashboardLayout'
import { ProGate } from '../components/ProGate'
import { ProBanner } from '../components/ProBanner'
import { useUser } from '../hooks/useUser'
import { useDashboardData } from '../hooks/useDashboardData'

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ width = '100%', height = 20 }: { width?: string | number; height?: number }) {
  return (
    <div style={{
      width, height,
      background: 'linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: 4,
    }} />
  )
}

// ── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, loading, positive }: {
  label: string; value: string; sub?: string; loading?: boolean; positive?: boolean
}) {
  return (
    <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 10, padding: '20px 24px' }}>
      <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
        {label}
      </div>
      {loading
        ? <Skeleton height={30} width={100} />
        : <div style={{ fontSize: 26, fontWeight: 600, color: '#fff', letterSpacing: '-0.5px', marginBottom: 4 }}>{value}</div>
      }
      {sub && !loading && (
        <div style={{ fontSize: 12, color: positive ? '#00bc7d' : '#444', marginTop: 2 }}>{sub}</div>
      )}
    </div>
  )
}

// ── MiniChart ────────────────────────────────────────────────────────────────

function MiniChart({ data }: { data: Array<{ date: string; count: number }> }) {
  if (!data?.length) return (
    <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: 12, fontFamily: 'monospace' }}>
      no data yet
    </div>
  )
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
      {data.map((d, i) => {
        const h = Math.max((d.count / max) * 72, d.count > 0 ? 4 : 2)
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div
              title={`${d.count} calls on ${d.date}`}
              style={{ width: '100%', height: h, background: d.count > 0 ? '#00bc7d' : '#1a1a1a', borderRadius: 2, opacity: d.count > 0 ? 1 : 0.4, transition: 'height 300ms ease' }}
            />
            <span style={{ fontSize: 9, color: '#333', fontFamily: 'monospace' }}>{d.date}</span>
          </div>
        )
      })}
    </div>
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
    <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 150px 80px', padding: '10px 16px', background: '#0d0d0d', borderBottom: '1px solid #1a1a1a' }}>
        {['Endpoint', 'Amount', 'Payer', 'Time'].map(h => (
          <span key={h} style={{ fontFamily: 'monospace', fontSize: 10, color: '#333', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</span>
        ))}
      </div>

      {loading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid #0d0d0d' }}>
            <Skeleton height={13} />
          </div>
        ))
      ) : calls.length === 0 ? (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: '#333', fontFamily: 'monospace', fontSize: 12 }}>
          No calls yet — make your first request
        </div>
      ) : (
        calls.map((call, i) => (
          <div key={call.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 150px 80px', padding: '10px 16px', borderBottom: i < calls.length - 1 ? '1px solid #0d0d0d' : 'none', alignItems: 'center' }}>
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {call.endpoint || '—'}
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#00bc7d' }}>
              {call.amountUsdc ? `$${Number(call.amountUsdc).toFixed(5)}` : '—'}
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#555' }}>
              {call.payerWallet ? `${call.payerWallet.slice(0, 6)}...${call.payerWallet.slice(-4)}` : 'anonymous'}
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#444' }}>
              {call.createdAt ? timeAgo(call.createdAt) : '—'}
            </span>
          </div>
        ))
      )}

      {!isPro && !loading && calls.length >= 5 && (
        <div style={{ padding: '10px 16px', borderTop: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#444', fontFamily: 'monospace' }}>Showing last 5 calls</span>
          <a href="/billing" style={{ fontSize: 12, color: '#00bc7d', textDecoration: 'none', fontFamily: 'monospace' }}>
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
    { done: true,              label: 'Account created',          link: null },
    { done: !!walletAddress,   label: 'Configure Solana wallet',  link: '/settings' },
    { done: endpointCount > 0, label: 'Add your first endpoint',  link: '/endpoints' },
    { done: totalCalls > 0,    label: 'Receive first payment',    link: '/docs' },
  ]
  const allDone = steps.every(s => s.done)
  if (allDone) return null

  return (
    <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 10, padding: '20px 24px', marginTop: 24 }}>
      <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
        Quick Setup
      </div>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < steps.length - 1 ? 12 : 0 }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
            background: step.done ? 'rgba(0,188,125,0.1)' : '#0d0d0d',
            border: `1px solid ${step.done ? '#00bc7d' : '#1a1a1a'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {step.done && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2.5 2.5L8 3" stroke="#00bc7d" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <span style={{ fontSize: 13, color: step.done ? '#444' : '#fff', textDecoration: step.done ? 'line-through' : 'none', flex: 1 }}>
            {step.label}
          </span>
          {!step.done && step.link && (
            <a href={step.link} style={{ fontSize: 12, color: '#00bc7d', textDecoration: 'none', fontFamily: 'monospace' }}>
              Set up →
            </a>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { userData, supabaseUserId, loading: userLoading, isPro } = useUser()
  const { data, loading: dataLoading } = useDashboardData(supabaseUserId, isPro)

  const loading = userLoading || dataLoading

  const weeklyAmount = data?.callsPerDay?.reduce((s, d) => s + (d.amount || 0), 0) || 0
  const mrrProjected = (weeklyAmount / 7) * 30

  return (
    <DashboardLayout>
      <div style={{ padding: '32px', maxWidth: 1100, margin: '0 auto' }}>
        <style>{`
          @keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
          @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
        `}</style>

        <ProBanner isPro={isPro} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: '#fff', margin: 0 }}>Overview</h1>
            <p style={{ fontSize: 13, color: '#444', marginTop: 4, margin: '4px 0 0' }}>
              {userData?.plan === 'pro' ? 'Pro plan' : 'Free plan'} · {userData?.network === 'mainnet' ? 'Solana Mainnet' : 'Solana Devnet'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00bc7d', boxShadow: '0 0 6px #00bc7d', animation: 'pulse 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#333' }}>live</span>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          <StatCard label="Total Calls" value={loading ? '—' : (data?.totalCalls || 0).toLocaleString()} sub="all time" loading={loading} />
          <StatCard label="Total Earned" value={loading ? '—' : `$${(data?.totalUsdc || 0).toFixed(4)}`} sub="USDC · all time" loading={loading} positive />
          <StatCard label="Calls Today" value={loading ? '—' : (data?.callsToday || 0).toLocaleString()} sub="since 00:00 UTC" loading={loading} />
          <StatCard label="Revenue Today" value={loading ? '—' : `$${(data?.usdcToday || 0).toFixed(4)}`} sub="USDC today" loading={loading} positive />
        </div>

        {/* Chart + MRR */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 12, marginBottom: 16 }}>
          <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 10, padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Calls — last 7 days
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#555' }}>
                {data?.callsPerDay?.reduce((s, d) => s + d.count, 0) || 0} total
              </span>
            </div>
            {loading ? <Skeleton height={80} /> : <MiniChart data={data?.callsPerDay || []} />}
          </div>

          <ProGate isPro={isPro} feature="MRR Projection">
            <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 10, padding: '20px 24px', height: '100%', boxSizing: 'border-box' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>MRR Projected</div>
              <div style={{ fontSize: 26, fontWeight: 600, color: '#00bc7d', letterSpacing: '-0.5px' }}>${mrrProjected.toFixed(2)}</div>
              <div style={{ fontSize: 12, color: '#444', marginTop: 4, marginBottom: 16 }}>based on last 7 days</div>
              {(data?.callsPerDay || []).slice(-3).map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#444' }}>{d.date}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#666' }}>{d.count} calls</span>
                </div>
              ))}
            </div>
          </ProGate>
        </div>

        {/* Recent calls */}
        <div style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Recent Calls
            </span>
            <a href="/endpoints" style={{ fontSize: 12, color: '#444', textDecoration: 'none', fontFamily: 'monospace' }}>
              Manage endpoints →
            </a>
          </div>
          <RecentCalls calls={data?.recentCalls || []} loading={loading} isPro={isPro} />
        </div>

        {/* Quick setup — only if incomplete */}
        {!loading && (
          <QuickSetup
            walletAddress={userData?.walletAddress ?? null}
            endpointCount={data?.endpoints?.length || 0}
            totalCalls={data?.totalCalls || 0}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

'use client'

export const dynamic = 'force-dynamic'

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

// ── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, loading, positive }: {
  label: string; value: string; sub?: string; loading?: boolean; positive?: boolean
}) {
  return (
    <Card>
      <div style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
        {label}
      </div>
      {loading
        ? <Skeleton height={28} width={100} />
        : <div style={{ fontSize: 26, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 4 }}>{value}</div>
      }
      {sub && !loading && (
        <div style={{ fontSize: 12, color: positive ? 'var(--green)' : 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
      )}
    </Card>
  )
}

// ── MiniChart ────────────────────────────────────────────────────────────────

function MiniChart({ data }: { data: Array<{ date: string; count: number }> }) {
  if (!data?.length) return (
    <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: 12, fontFamily: 'var(--font-code)' }}>
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
              style={{ width: '100%', height: h, background: d.count > 0 ? 'var(--green)' : 'var(--border)', borderRadius: 2, opacity: d.count > 0 ? 1 : 0.5, transition: 'height 300ms ease' }}
            />
            <span style={{ fontSize: 9, color: 'var(--text-faint)', fontFamily: 'var(--font-code)' }}>{d.date}</span>
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

  return (
    <DashboardLayout>
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
        @keyframes pulse   { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
      `}</style>

      <PageContainer>
        <ProBanner isPro={isPro} />

        <PageHeader
          eyebrow="GATE402"
          title="Overview"
          subtitle={`${userData?.plan === 'pro' ? 'Pro plan' : 'Free plan'} · ${userData?.network === 'mainnet' ? 'Solana Mainnet' : 'Solana Devnet'}`}
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)', animation: 'pulse 2s ease-in-out infinite' }} />
              <span style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'var(--text-faint)' }}>live</span>
            </div>
          }
        />

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
          <StatCard label="Total Calls"    value={loading ? '—' : (data?.totalCalls || 0).toLocaleString()} sub="all time"        loading={loading} />
          <StatCard label="Total Earned"   value={loading ? '—' : `$${(data?.totalUsdc || 0).toFixed(4)}`}  sub="USDC · all time" loading={loading} positive />
          <StatCard label="Calls Today"    value={loading ? '—' : (data?.callsToday || 0).toLocaleString()} sub="since 00:00 UTC" loading={loading} />
          <StatCard label="Revenue Today"  value={loading ? '—' : `$${(data?.usdcToday || 0).toFixed(4)}`}  sub="USDC today"      loading={loading} positive />
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
            {loading ? <Skeleton height={80} /> : <MiniChart data={data?.callsPerDay || []} />}
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

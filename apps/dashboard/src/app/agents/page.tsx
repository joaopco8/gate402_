'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '../../../lib/supabase/client'
import DashboardLayout from '../components/DashboardLayout'
import PageContainer from '../components/PageContainer'
import PageHeader from '../components/PageHeader'
import { StatCard } from '../components/ui/StatCard'
import { SpendingProgress } from '../components/ui/SpendingProgress'
import { CreateAgentWalletModal } from '../components/ui/CreateAgentWalletModal'
import { AgentWalletsEmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'

async function authHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await createClient().auth.getSession()
  return session ? { Authorization: `Bearer ${session.access_token}` } : {}
}

interface AgentWallet {
  id: string
  name: string
  description?: string
  walletAddress: string
  network: string
  maxPerCall?: number
  maxPerHour?: number
  maxPerDay?: number
  maxPerMonth?: number
  totalCalls: number
  totalSpent: number
  lastCallAt?: string
  agentKey: string
  createdAt: string
}

interface AgentStats {
  totalCalls: number
  totalSpent: number
  spentToday: number
  spentThisHour: number
  realtime: { spentThisHour: number; spentToday: number; spentThisMonth: number }
  topEndpoints: { endpoint: string; _count: number; _sum: { amount: number } }[]
  limits: { maxPerCall?: number; maxPerHour?: number; maxPerDay?: number; maxPerMonth?: number }
  utilization: { hour: number | null; day: number | null; month: number | null }
  lastCallAt?: string
}

export default function AgentsPage() {
  const [wallets, setWallets]           = useState<AgentWallet[]>([])
  const [loading, setLoading]           = useState(true)
  const [selected, setSelected]         = useState<AgentWallet | null>(null)
  const [stats, setStats]               = useState<AgentStats | null>(null)
  const [createOpen, setCreateOpen]     = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AgentWallet | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [copied, setCopied]             = useState('')

  useEffect(() => { fetchWallets() }, [])
  useEffect(() => {
    if (!selected) return
    fetchStats(selected.id)
    const interval = setInterval(() => fetchStats(selected.id), 30000)
    return () => clearInterval(interval)
  }, [selected?.id])

  async function fetchWallets() {
    try {
      const headers = await authHeader()
      const res  = await fetch(`${SERVER_URL}/api/agent-wallets`, { headers })
      const data = await res.json()
      const list: AgentWallet[] = data.wallets || []
      setWallets(list)
      if (list.length > 0 && !selected) setSelected(list[0])
    } finally { setLoading(false) }
  }

  async function fetchStats(id: string) {
    const headers = await authHeader()
    const res  = await fetch(`${SERVER_URL}/api/agent-wallets/${id}/stats`, { headers })
    const data = await res.json()
    setStats(data)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      const headers = await authHeader()
      await fetch(`${SERVER_URL}/api/agent-wallets/${deleteTarget.id}`, { method: 'DELETE', headers })
      setWallets(w => w.filter(x => x.id !== deleteTarget.id))
      if (selected?.id === deleteTarget.id) { setSelected(null); setStats(null) }
      setDeleteTarget(null)
    } finally { setDeleteLoading(false) }
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const totalSpentAll = wallets.reduce((s, w) => s + w.totalSpent, 0)
  const totalCallsAll = wallets.reduce((s, w) => s + w.totalCalls, 0)

  const hasLimits = selected && (selected.maxPerDay || selected.maxPerHour || selected.maxPerMonth)

  return (
    <DashboardLayout>
      <PageContainer>
        <PageHeader
          title="Agent Wallets"
          subtitle="Financial control for your AI agents"
          action={
            <button
              onClick={() => setCreateOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 16px', background: '#7AF279', color: '#1B1E1B',
                fontSize: 13, fontWeight: 500, borderRadius: 8, border: 'none',
                cursor: 'pointer', fontFamily: 'var(--font-display)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              New wallet
            </button>
          }
        />

        {/* Global stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
          <StatCard label="Total Agents"  value={String(wallets.length)} loading={loading} />
          <StatCard label="Total Spent"   value={`$${totalSpentAll.toFixed(4)}`} sub="USDC" loading={loading} />
          <StatCard label="Total Calls"   value={totalCallsAll.toLocaleString()} loading={loading} />
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: 24, height: 24, border: '2px solid #7AF279', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : wallets.length === 0 ? (
          <AgentWalletsEmptyState onAction={() => setCreateOpen(true)} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, alignItems: 'start' }}>

            {/* Wallet list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {wallets.map(wallet => {
                const active = selected?.id === wallet.id
                return (
                  <button key={wallet.id} onClick={() => setSelected(wallet)} style={{
                    width: '100%', textAlign: 'left', padding: 16, borderRadius: 10,
                    border: `1px solid ${active ? '#7AF279' : '#2A2E2A'}`,
                    background: active ? 'rgba(122,242,121,0.04)' : '#1F221F',
                    cursor: 'pointer', transition: 'all 150ms',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: active ? 'rgba(122,242,121,0.12)' : '#242724',
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={active ? '#7AF279' : '#4A5549'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/>
                            <path d="M12 7v4"/><path d="M8 15h.01M12 15h.01M16 15h.01"/>
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', fontFamily: 'var(--font-display)' }}>{wallet.name}</div>
                          <div style={{ fontSize: 11, color: '#4A5549', fontFamily: 'var(--font-code)' }}>{wallet.network}</div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 99, fontFamily: 'var(--font-code)',
                        border: `1px solid ${wallet.network === 'mainnet' ? 'rgba(122,242,121,0.2)' : 'rgba(188,134,255,0.2)'}`,
                        color: wallet.network === 'mainnet' ? '#7AF279' : '#BC86FF',
                        background: wallet.network === 'mainnet' ? 'rgba(122,242,121,0.06)' : 'rgba(188,134,255,0.06)',
                      }}>{wallet.network}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: '#4A5549', fontFamily: 'var(--font-display)' }}>{wallet.totalCalls} calls</span>
                      <span style={{ color: '#7A8C79', fontFamily: 'var(--font-code)' }}>${wallet.totalSpent.toFixed(4)}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Detail panel */}
            {selected && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Header card */}
                <div style={{ padding: 20, borderRadius: 10, border: '1px solid #2A2E2A', background: '#1F221F' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 300, color: '#fff', fontFamily: 'var(--font-display)' }}>{selected.name}</div>
                      {selected.description && (
                        <div style={{ fontSize: 12, color: '#4A5549', marginTop: 4, fontFamily: 'var(--font-display)' }}>{selected.description}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a
                        href={`https://explorer.solana.com/address/${selected.walletAddress}${selected.network === 'devnet' ? '?cluster=devnet' : ''}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ padding: 8, color: '#4A5549', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                      <button onClick={() => setDeleteTarget(selected)} style={{ padding: 8, color: '#4A5549', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </div>

                  {/* Wallet address — auto-managed by Privy */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.22)', border: '1px solid #222522', borderRadius: 8, padding: '8px 12px', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: '#4A5549', fontFamily: 'var(--font-code)', flexShrink: 0 }}>wallet:</span>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-code)', color: '#7A8C79', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selected.walletAddress}
                    </span>
                    <span style={{ fontSize: 10, color: '#4A5549', fontFamily: 'var(--font-code)', background: 'rgba(74,85,73,0.15)', border: '1px solid #2A2E2A', borderRadius: 4, padding: '1px 6px', flexShrink: 0 }}>auto</span>
                    <button onClick={() => copy(selected.walletAddress, 'walletAddress')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === 'walletAddress' ? '#7AF279' : '#4A5549', flexShrink: 0, transition: 'color 150ms' }}>
                      {copied === 'walletAddress'
                        ? <span style={{ fontSize: 11, fontFamily: 'var(--font-code)' }}>✓</span>
                        : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      }
                    </button>
                  </div>
                  {/* Agent key */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(188,134,255,0.04)', border: '1px solid rgba(188,134,255,0.12)', borderRadius: 8, padding: '8px 12px', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: '#4A5549', fontFamily: 'var(--font-code)', flexShrink: 0 }}>agentKey:</span>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-code)', color: '#BC86FF', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selected.agentKey}
                    </span>
                    <button onClick={() => copy(selected.agentKey, 'agentKey')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === 'agentKey' ? '#7AF279' : '#4A5549', flexShrink: 0, transition: 'color 150ms' }}>
                      {copied === 'agentKey'
                        ? <span style={{ fontSize: 11, fontFamily: 'var(--font-code)' }}>✓</span>
                        : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      }
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                  <StatCard label="Total Calls"  value={selected.totalCalls.toLocaleString()} />
                  <StatCard label="Total Spent"  value={`$${selected.totalSpent.toFixed(4)}`} sub="USDC" />
                  <StatCard
                    label="Avg Cost"
                    value={selected.totalCalls > 0 ? `$${(selected.totalSpent / selected.totalCalls).toFixed(5)}` : '$0'}
                  />
                </div>

                {/* Spending limits — real-time */}
                {hasLimits && stats && (
                  <div style={{ padding: 20, borderRadius: 10, border: '1px solid #2A2E2A', background: '#1F221F', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 11, color: '#4A5549', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-code)' }}>
                        Spending Limits
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7AF279', animation: 'pulse 2s infinite' }} />
                        <span style={{ fontSize: 10, color: '#4A5549', fontFamily: 'var(--font-code)' }}>live</span>
                      </div>
                    </div>
                    {selected.maxPerCall && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #2A2E2A' }}>
                        <span style={{ fontSize: 11, color: '#4A5549', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-code)' }}>Per call limit</span>
                        <span style={{ fontSize: 12, fontFamily: 'var(--font-code)', color: '#7AF279' }}>max ${selected.maxPerCall}</span>
                      </div>
                    )}
                    {selected.maxPerHour && <SpendingProgress label="This hour" spent={stats.realtime?.spentThisHour ?? stats.spentThisHour ?? 0} limit={selected.maxPerHour} />}
                    {selected.maxPerDay && <SpendingProgress label="Today" spent={stats.realtime?.spentToday ?? stats.spentToday ?? 0} limit={selected.maxPerDay} />}
                    {selected.maxPerMonth && <SpendingProgress label="This month" spent={stats.realtime?.spentThisMonth ?? selected.totalSpent} limit={selected.maxPerMonth} />}
                  </div>
                )}

                {/* Top endpoints */}
                {stats?.topEndpoints && stats.topEndpoints.length > 0 && (
                  <div style={{ padding: 20, borderRadius: 10, border: '1px solid #2A2E2A', background: '#1F221F' }}>
                    <div style={{ fontSize: 11, color: '#4A5549', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16, fontFamily: 'var(--font-code)' }}>
                      Top APIs
                    </div>
                    {stats.topEndpoints.map((ep, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < stats.topEndpoints.length - 1 ? '1px solid #1F221F' : 'none' }}>
                        <span style={{ fontSize: 12, fontFamily: 'var(--font-code)', color: '#7A8C79' }}>{ep.endpoint}</span>
                        <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                          <span style={{ color: '#4A5549', fontFamily: 'var(--font-display)' }}>{ep._count} calls</span>
                          <span style={{ fontFamily: 'var(--font-code)', color: '#7AF279' }}>${(ep._sum?.amount ?? 0).toFixed(4)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Code snippet */}
                <div style={{ borderRadius: 10, border: '1px solid #2A2E2A', background: '#1A1D1A', overflow: 'hidden' }}>
                  {/* header bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #222522', background: '#1F221F' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* traffic lights */}
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2A2E2A', display: 'inline-block' }} />
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2A2E2A', display: 'inline-block' }} />
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2A2E2A', display: 'inline-block' }} />
                      <span style={{ fontSize: 11, color: '#4A5549', fontFamily: 'var(--font-code)', marginLeft: 6, letterSpacing: '0.04em' }}>agent.ts</span>
                    </div>
                    <button
                      onClick={() => copy(`import { Gate402Agent } from 'gate402-agent'\n\nconst agent = new Gate402Agent({\n  walletAddress: '${selected.walletAddress}',\n  network: '${selected.network}',\n  limits: {\n    maxPerCall: ${selected.maxPerCall ?? null},\n    maxPerDay:  ${selected.maxPerDay ?? null},\n  }\n})`, 'snippet')}
                      style={{ fontSize: 11, fontFamily: 'var(--font-code)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: copied === 'snippet' ? '#7AF279' : '#4A5549', transition: 'color 150ms' }}
                    >
                      {copied === 'snippet'
                        ? <><span>✓</span><span>copied</span></>
                        : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg><span>copy</span></>
                      }
                    </button>
                  </div>
                  {/* code body */}
                  <div style={{ padding: '16px 20px' }}>
                    <pre style={{ fontSize: 12, fontFamily: 'var(--font-code)', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>
                      <span style={{ color: '#4A5549' }}>import</span>{' { '}<span style={{ color: '#E8F4EE' }}>Gate402Agent</span>{' } '}<span style={{ color: '#4A5549' }}>from</span>{' '}<span style={{ color: '#7AF279' }}>'gate402-agent'</span>{'\n\n'}<span style={{ color: '#4A5549' }}>const</span>{' '}<span style={{ color: '#E8F4EE' }}>agent</span>{' = '}<span style={{ color: '#4A5549' }}>new</span>{' '}<span style={{ color: '#BC86FF' }}>Gate402Agent</span>{'({\n  walletAddress: '}<span style={{ color: '#7AF279' }}>'{`${selected.walletAddress.slice(0,12)}...`}'</span>{',\n  network: '}<span style={{ color: '#7AF279' }}>'{selected.network}'</span>{',\n  limits: {\n    maxPerCall: '}<span style={{ color: '#BC86FF' }}>{String(selected.maxPerCall ?? 'null')}</span>{',\n    maxPerDay:  '}<span style={{ color: '#BC86FF' }}>{String(selected.maxPerDay ?? 'null')}</span>{',\n  }\n})'}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg) } } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      </PageContainer>

      <CreateAgentWalletModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={wallet => { setWallets(w => [wallet, ...w]); setSelected(wallet) }}
        serverUrl={SERVER_URL}
        authHeader={authHeader}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Disable agent wallet?"
        description={`The wallet "${deleteTarget?.name}" will be disabled. Existing transactions will be preserved.`}
        confirmLabel="Disable"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  )
}

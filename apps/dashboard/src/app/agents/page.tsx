'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '../../../lib/supabase/client'
import DashboardLayout from '../components/DashboardLayout'
import { SpendingProgress } from '../components/ui/SpendingProgress'
import { CreateAgentWalletModal } from '../components/ui/CreateAgentWalletModal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { DepositModal } from '@/components/ui/deposit-modal'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'
const LINE = '1px solid #2A2E2A'
const SANS = "'Geist Mono', monospace"
const MONO = "'Geist Mono', monospace"

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
  const [wallets, setWallets]               = useState<AgentWallet[]>([])
  const [loading, setLoading]               = useState(true)
  const [selected, setSelected]             = useState<AgentWallet | null>(null)
  const [stats, setStats]                   = useState<AgentStats | null>(null)
  const [balance, setBalance]               = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [createOpen, setCreateOpen]         = useState(false)
  const [deleteTarget, setDeleteTarget]     = useState<AgentWallet | null>(null)
  const [deleteLoading, setDeleteLoading]   = useState(false)
  const [depositTarget, setDepositTarget]   = useState<AgentWallet | null>(null)
  const [copied, setCopied]                 = useState('')

  useEffect(() => { fetchWallets() }, [])

  useEffect(() => {
    function handleMoonPayCompleted() {
      if (selected) {
        fetchStats(selected.id)
        fetchBalance(selected.walletAddress, selected.network)
      }
    }
    window.addEventListener('moonpay:completed', handleMoonPayCompleted)
    return () => window.removeEventListener('moonpay:completed', handleMoonPayCompleted)
  }, [selected])

  useEffect(() => {
    if (!selected) return
    fetchStats(selected.id)
    fetchBalance(selected.walletAddress, selected.network)
    const interval = setInterval(() => {
      fetchStats(selected.id)
      fetchBalance(selected.walletAddress, selected.network)
    }, 30000)
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

  async function fetchBalance(walletAddress: string, network: string) {
    setBalanceLoading(true)
    try {
      const rpc = network === 'mainnet'
        ? 'https://api.mainnet-beta.solana.com'
        : 'https://api.devnet.solana.com'
      const usdcMint = network === 'mainnet'
        ? 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
        : '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
      const res = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0', id: 1,
          method: 'getTokenAccountsByOwner',
          params: [walletAddress, { mint: usdcMint }, { encoding: 'jsonParsed' }],
        }),
      })
      const data = await res.json()
      const accounts = data.result?.value || []
      const uiAmount = accounts[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0
      setBalance(Number(uiAmount))
    } catch {
      setBalance(null)
    } finally {
      setBalanceLoading(false)
    }
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
      const updated = wallets.filter(w => w.id !== deleteTarget.id)
      setWallets(updated)
      if (selected?.id === deleteTarget.id) { setSelected(updated[0] || null); setStats(null) }
      setDeleteTarget(null)
    } finally { setDeleteLoading(false) }
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const hasLimits = selected && (selected.maxPerCall || selected.maxPerHour || selected.maxPerDay || selected.maxPerMonth)

  return (
    <DashboardLayout>
      <div style={{ minHeight: '100vh', background: '#1B1E1B', color: '#E8F4EE', fontFamily: SANS }}>

        {/* ── HEADER ── */}
        <div style={{
          borderBottom: LINE,
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.3px', lineHeight: 1.2, margin: 0, fontFamily: MONO }}>
              Agent Wallets
            </h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 4, marginBottom: 0, fontFamily: MONO }}>
              {loading ? '…' : `${wallets.length} wallet${wallets.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', background: '#7AF279', color: '#1B1E1B',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New wallet
          </button>
        </div>

        {/* ── BODY ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          minHeight: 'calc(100vh - 65px)',
        }}>

          {/* ── LEFT: list ── */}
          <div style={{ borderRight: LINE }}>
            {loading ? (
              <div style={{ padding: '48px 32px', display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: 20, height: 20,
                  border: '2px solid #7AF279', borderTopColor: 'transparent',
                  borderRadius: '50%', animation: 'spin 1s linear infinite',
                }} />
              </div>
            ) : wallets.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2A2E2A" strokeWidth="1.5" style={{ marginBottom: 12 }}>
                  <rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" />
                  <path d="M12 7v4" /><path d="M8 15h.01M12 15h.01M16 15h.01" />
                </svg>
                <p style={{ fontSize: 13, color: '#4A5549', marginBottom: 16 }}>No wallets yet</p>
                <button
                  onClick={() => setCreateOpen(true)}
                  style={{
                    fontSize: 12, color: '#7AF279', background: 'none',
                    border: '1px solid rgba(122,242,121,0.2)', borderRadius: 6,
                    padding: '6px 14px', cursor: 'pointer',
                  }}
                >
                  Create your first wallet
                </button>
              </div>
            ) : (
              wallets.map(wallet => {
                const active = selected?.id === wallet.id
                return (
                  <button
                    key={wallet.id}
                    onClick={() => setSelected(wallet)}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '16px 20px',
                      borderBottom: LINE,
                      borderLeft: active ? '2px solid #7AF279' : '2px solid transparent',
                      borderTop: 'none', borderRight: 'none',
                      background: active ? 'rgba(122,242,121,0.04)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontSize: 13,
                        color: active ? '#FFFFFF' : '#E8F4EE',
                        fontWeight: active ? 500 : 400,
                        marginBottom: 3, marginTop: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {wallet.name}
                      </p>
                      <p style={{ fontSize: 11, color: '#4A5549', fontFamily: MONO, margin: 0 }}>
                        {wallet.walletAddress.slice(0, 8)}…{wallet.walletAddress.slice(-4)}
                      </p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke={active ? '#7AF279' : '#2A2E2A'} strokeWidth="2" strokeLinecap="round"
                      style={{ flexShrink: 0 }}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                )
              })
            )}
          </div>

          {/* ── RIGHT: detail ── */}
          {selected ? (
            <div>

              {/* Name + actions */}
              <div style={{
                padding: '24px 32px', borderBottom: LINE,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <h2 style={{
                    fontSize: 18, fontWeight: 300, color: '#FFFFFF',
                    letterSpacing: '-0.02em', margin: 0,
                  }}>
                    {selected.name}
                  </h2>
                  <span style={{
                    fontSize: 11, fontFamily: MONO, letterSpacing: '0.04em',
                    color: selected.network === 'mainnet' ? '#7AF279' : '#BC86FF',
                  }}>
                    {selected.network}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setDepositTarget(selected)}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(122,242,121,0.08)',
                      border: '1px solid rgba(122,242,121,0.25)',
                      borderRadius: 8, color: '#7AF279', fontSize: 12, cursor: 'pointer',
                    }}
                  >
                    Deposit USDC
                  </button>
                  <a
                    href={`https://explorer.solana.com/address/${selected.walletAddress}${selected.network === 'devnet' ? '?cluster=devnet' : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: 8, color: '#4A5549', display: 'flex', alignItems: 'center',
                      border: LINE, borderRadius: 8, textDecoration: 'none',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                  <button
                    onClick={() => setDeleteTarget(selected)}
                    style={{
                      padding: 8, background: 'transparent', border: LINE,
                      borderRadius: 8, color: '#4A5549', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Wallet address */}
              <div style={{ padding: '20px 32px', borderBottom: LINE }}>
                <p style={{
                  fontSize: 10, color: '#4A5549', letterSpacing: '0.10em',
                  textTransform: 'uppercase', marginBottom: 8, marginTop: 0,
                }}>
                  Solana Wallet
                </p>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#111311', border: LINE, borderRadius: 8, padding: '10px 14px',
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4A5549" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
                  </svg>
                  <span style={{
                    fontSize: 12, fontFamily: MONO, color: '#7A8C79',
                    flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {selected.walletAddress}
                  </span>
                  <button
                    onClick={() => copy(selected.walletAddress, 'wallet')}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex',
                      color: copied === 'wallet' ? '#7AF279' : '#4A5549',
                    }}
                  >
                    {copied === 'wallet'
                      ? <span style={{ fontSize: 11, color: '#7AF279' }}>✓</span>
                      : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                    }
                  </button>
                </div>

                {/* Agent key */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'rgba(188,134,255,0.04)', border: '1px solid rgba(188,134,255,0.12)',
                  borderRadius: 8, padding: '10px 14px', marginTop: 8,
                }}>
                  <span style={{ fontSize: 10, color: '#4A5549', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>
                    key
                  </span>
                  <span style={{
                    fontSize: 12, fontFamily: MONO, color: '#BC86FF',
                    flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {selected.agentKey}
                  </span>
                  <button
                    onClick={() => copy(selected.agentKey, 'agentKey')}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex',
                      color: copied === 'agentKey' ? '#7AF279' : '#BC86FF',
                    }}
                  >
                    {copied === 'agentKey'
                      ? <span style={{ fontSize: 11, color: '#7AF279' }}>✓</span>
                      : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                    }
                  </button>
                </div>
              </div>

              {/* Stats — 4 numbers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: LINE }}>
                {[
                  { label: 'Balance',     value: balanceLoading ? '…' : balance === null ? '—' : `$${balance.toFixed(2)}`, sub: 'USDC' },
                  { label: 'Total calls', value: selected.totalCalls.toLocaleString() },
                  { label: 'Total spent', value: `$${selected.totalSpent.toFixed(4)}` },
                  {
                    label: 'Avg cost',
                    value: selected.totalCalls > 0
                      ? `$${(selected.totalSpent / selected.totalCalls).toFixed(5)}`
                      : '—',
                  },
                ].map((stat, i) => (
                  <div key={stat.label} style={{
                    padding: '20px 24px',
                    borderRight: i < 3 ? LINE : 'none',
                  }}>
                    <p style={{
                      fontSize: 10, color: '#4A5549', letterSpacing: '0.08em',
                      textTransform: 'uppercase', marginBottom: 8, marginTop: 0,
                    }}>
                      {stat.label}
                    </p>
                    <p style={{ fontSize: 20, fontWeight: 300, color: '#FFFFFF', fontFamily: MONO, margin: 0 }}>
                      {stat.value}
                    </p>
                    {stat.sub && (
                      <p style={{ fontSize: 10, color: '#4A5549', margin: '4px 0 0' }}>{stat.sub}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Spending limits — real-time */}
              {hasLimits && (
                <div style={{ padding: '20px 32px', borderBottom: LINE }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <p style={{
                      fontSize: 10, color: '#4A5549', letterSpacing: '0.10em',
                      textTransform: 'uppercase', margin: 0,
                    }}>
                      Spending Limits
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7AF279', animation: 'pulse 2s infinite' }} />
                      <span style={{ fontSize: 10, color: '#4A5549' }}>live</span>
                    </div>
                  </div>
                  {selected.maxPerCall && (
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      paddingBottom: 12, marginBottom: 12, borderBottom: LINE,
                    }}>
                      <span style={{ fontSize: 12, color: '#7A8C79' }}>Per call limit</span>
                      <span style={{ fontSize: 12, fontFamily: MONO, color: '#7AF279' }}>${selected.maxPerCall}</span>
                    </div>
                  )}
                  {stats && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {selected.maxPerHour && <SpendingProgress label="This hour" spent={stats.realtime?.spentThisHour ?? stats.spentThisHour ?? 0} limit={selected.maxPerHour} />}
                      {selected.maxPerDay && <SpendingProgress label="Today" spent={stats.realtime?.spentToday ?? stats.spentToday ?? 0} limit={selected.maxPerDay} />}
                      {selected.maxPerMonth && <SpendingProgress label="This month" spent={stats.realtime?.spentThisMonth ?? selected.totalSpent} limit={selected.maxPerMonth} />}
                    </div>
                  )}
                </div>
              )}

              {/* Top endpoints */}
              {stats?.topEndpoints && stats.topEndpoints.length > 0 && (
                <div style={{ padding: '20px 32px', borderBottom: LINE }}>
                  <p style={{
                    fontSize: 10, color: '#4A5549', letterSpacing: '0.10em',
                    textTransform: 'uppercase', marginBottom: 14, marginTop: 0,
                  }}>
                    Top APIs
                  </p>
                  {stats.topEndpoints.map((ep, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: i < stats.topEndpoints.length - 1 ? LINE : 'none',
                    }}>
                      <span style={{ fontSize: 12, color: '#7A8C79', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                        {ep.endpoint}
                      </span>
                      <div style={{ display: 'flex', gap: 16, fontSize: 12, flexShrink: 0 }}>
                        <span style={{ color: '#4A5549' }}>{ep._count} calls</span>
                        <span style={{ fontFamily: MONO, color: '#7AF279' }}>${(ep._sum?.amount ?? 0).toFixed(4)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Connect to Claude Code / Cursor */}
              <div style={{ padding: '20px 32px', borderBottom: LINE }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <p style={{
                    fontSize: 10, color: '#4A5549', letterSpacing: '0.10em',
                    textTransform: 'uppercase', margin: 0,
                  }}>
                    Connect to Claude Code or Cursor
                  </p>
                  <a
                    href={`${SERVER_URL}/skill/${selected.agentKey}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 10, color: '#4A5549', textDecoration: 'none' }}
                  >
                    Preview ↗
                  </a>
                </div>
                <div style={{
                  background: '#111311', border: LINE, borderRadius: 8,
                  padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
                }}>
                  <code style={{
                    fontSize: 12, fontFamily: MONO, color: '#7AF279',
                    flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    Read {SERVER_URL}/skill/{selected.agentKey} and follow the instructions
                  </code>
                  <button
                    onClick={() => copy(`Read ${SERVER_URL}/skill/${selected.agentKey} and follow the instructions`, 'skill')}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      display: 'flex', flexShrink: 0,
                      color: copied === 'skill' ? '#7AF279' : '#4A5549',
                    }}
                  >
                    {copied === 'skill'
                      ? <span style={{ fontSize: 11, color: '#7AF279' }}>✓</span>
                      : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                    }
                  </button>
                </div>
              </div>

              {/* Code snippet */}
              <div style={{ margin: '0 32px 32px', border: LINE, borderRadius: 8, overflow: 'hidden' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 16px', borderBottom: LINE, background: '#1A1D1A',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2A2E2A', display: 'inline-block' }} />
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2A2E2A', display: 'inline-block' }} />
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2A2E2A', display: 'inline-block' }} />
                    <span style={{ fontSize: 12, color: '#4A5549', marginLeft: 6, fontFamily: MONO }}>agent.ts</span>
                  </div>
                  <button
                    onClick={() => copy(
                      `import { Gate402Agent } from 'gate402-agent'\n\nconst agent = new Gate402Agent({\n  walletAddress: '${selected.walletAddress}',\n  network: '${selected.network}',\n  limits: {\n    maxPerCall: ${selected.maxPerCall ?? null},\n    maxPerDay:  ${selected.maxPerDay ?? null},\n  }\n})`,
                      'snippet'
                    )}
                    style={{
                      fontSize: 12, background: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 4,
                      color: copied === 'snippet' ? '#7AF279' : '#4A5549',
                    }}
                  >
                    {copied === 'snippet'
                      ? <><span>✓</span><span>copied</span></>
                      : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg><span>copy</span></>
                    }
                  </button>
                </div>
                <div style={{ padding: '16px 20px', background: '#111311' }}>
                  <pre style={{ fontSize: 12, fontFamily: MONO, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>
                    <span style={{ color: '#4A5549' }}>import</span>{' { '}<span style={{ color: '#E8F4EE' }}>Gate402Agent</span>{' } '}<span style={{ color: '#4A5549' }}>from</span>{' '}<span style={{ color: '#7AF279' }}>'gate402-agent'</span>{'\n\n'}<span style={{ color: '#4A5549' }}>const</span>{' '}<span style={{ color: '#E8F4EE' }}>agent</span>{' = '}<span style={{ color: '#4A5549' }}>new</span>{' '}<span style={{ color: '#BC86FF' }}>Gate402Agent</span>{'({\n  walletAddress: '}<span style={{ color: '#7AF279' }}>'{`${selected.walletAddress.slice(0, 12)}...`}'</span>{',\n  network: '}<span style={{ color: '#7AF279' }}>'{selected.network}'</span>{',\n  limits: {\n    maxPerCall: '}<span style={{ color: '#BC86FF' }}>{String(selected.maxPerCall ?? 'null')}</span>{',\n    maxPerDay:  '}<span style={{ color: '#BC86FF' }}>{String(selected.maxPerDay ?? 'null')}</span>{',\n  }\n})'}
                  </pre>
                </div>
              </div>

            </div>
          ) : (
            !loading && (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: 64, textAlign: 'center',
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2A2E2A" strokeWidth="1.5" style={{ marginBottom: 16 }}>
                  <rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" />
                  <path d="M12 7v4" /><path d="M8 15h.01M12 15h.01M16 15h.01" />
                </svg>
                <p style={{ fontSize: 14, color: '#4A5549', marginBottom: 8 }}>
                  Select a wallet or create a new one
                </p>
                <button
                  onClick={() => setCreateOpen(true)}
                  style={{
                    marginTop: 16, fontSize: 13, color: '#7AF279', background: 'none',
                    border: '1px solid rgba(122,242,121,0.2)', borderRadius: 8,
                    padding: '8px 20px', cursor: 'pointer',
                  }}
                >
                  Create agent wallet
                </button>
              </div>
            )
          )}
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg) } }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        `}</style>
      </div>

      <CreateAgentWalletModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={wallet => { setWallets(w => [wallet, ...w]); setSelected(wallet) }}
        serverUrl={SERVER_URL}
        authHeader={authHeader}
      />

      <DepositModal
        open={!!depositTarget}
        onClose={() => setDepositTarget(null)}
        walletAddress={depositTarget?.walletAddress || ''}
        agentName={depositTarget?.name || ''}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete agent wallet?"
        description={`"${deleteTarget?.name}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  )
}

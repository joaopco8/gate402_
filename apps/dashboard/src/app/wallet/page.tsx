'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import DashboardLayout from '../components/DashboardLayout'
import PageContainer from '../components/PageContainer'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import { useUser } from '../hooks/useUser'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'
const MONO = 'var(--font-code)'
const SANS = 'var(--font-display)'

interface Stats {
  totalGross: number
  totalNet: number
  totalFeesPaid: number
  transactionCount: number
}

interface TxRow {
  id: string
  endpoint: string
  totalAmount: number
  providerAmount: number
  platformFee: number
  status: string
  txHashProvider: string
  createdAt: string
}

interface EndpointRevenue {
  name: string
  value: number   // gross
  calls: number
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: MONO, fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>
    </div>
  )
}

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

export default function WalletPage() {
  const router = useRouter()
  const { userData } = useUser()

  const [stats, setStats] = useState<Stats | null>(null)
  const [txns, setTxns] = useState<TxRow[]>([])
  const [epRevenue, setEpRevenue] = useState<EndpointRevenue[]>([])
  const [loading, setLoading] = useState(true)

  const [copied, setCopied] = useState(false)
  const [editingAddr, setEditingAddr] = useState(false)
  const [newAddr, setNewAddr] = useState('')
  const [savingAddr, setSavingAddr] = useState(false)

  const network = userData?.network ?? 'devnet'
  const walletAddr = userData?.walletAddress

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      try {
        const [txRes, epRes] = await Promise.allSettled([
          fetch(`${SERVER_URL}/api/transactions`, { headers: { 'x-user-id': user.id } }),
          fetch(`${SERVER_URL}/api/endpoints/revenue`, { headers: { 'x-user-id': user.id } }),
        ])

        if (txRes.status === 'fulfilled' && txRes.value.ok) {
          const d = await txRes.value.json()
          setStats(d.stats ?? null)
          setTxns(d.transactions ?? [])
        }

        if (epRes.status === 'fulfilled' && epRes.value.ok) {
          const d = await epRes.value.json()
          setEpRevenue(Array.isArray(d) ? d : [])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  function handleCopy() {
    if (!walletAddr) return
    navigator.clipboard.writeText(walletAddr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSaveAddr() {
    if (!newAddr.trim()) return
    setSavingAddr(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await fetch(`${SERVER_URL}/api/users/wallet`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ walletAddress: newAddr.trim() }),
      })
      window.location.reload()
    } finally {
      setSavingAddr(false)
    }
  }

  const gross = stats?.totalGross ?? 0
  const net = stats?.totalNet ?? 0
  const fee = stats?.totalFeesPaid ?? 0

  return (
    <DashboardLayout>
      <PageContainer>
        <PageHeader
          eyebrow="GATE402"
          title="Wallet"
          subtitle={`Revenue & payouts · Solana ${network.charAt(0).toUpperCase() + network.slice(1)}`}
        />

        {/* ── Stat row ── */}
        <Card style={{ marginBottom: 'var(--space-md)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-lg)' }}>
            <StatCard
              label="Total Revenue"
              value={loading ? '—' : `$${gross.toFixed(4)}`}
              sub="all time"
            />
            <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: 'var(--space-lg)' }}>
              <StatCard
                label="Net Revenue (99%)"
                value={loading ? '—' : `$${net.toFixed(5)}`}
                sub="goes to your wallet"
              />
            </div>
            <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: 'var(--space-lg)' }}>
              <StatCard
                label="Platform Fees (1%)"
                value={loading ? '—' : `$${fee.toFixed(5)}`}
                sub="Gate402 fee"
              />
            </div>
          </div>
        </Card>

        {/* ── Receiving Wallet ── */}
        <Card style={{ marginBottom: 'var(--space-md)' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
            Receiving Wallet
          </div>

          {!walletAddr ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: 14, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#f87171', marginBottom: 4, fontFamily: SANS }}>No wallet configured</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: SANS }}>Payments cannot be received until you add a Solana wallet address.</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', fontSize: 13, color: 'var(--text-primary)', fontFamily: MONO, outline: 'none' }}
                  type="text"
                  value={newAddr}
                  onChange={e => setNewAddr(e.target.value)}
                  placeholder="Enter Solana address..."
                />
                <button
                  onClick={handleSaveAddr}
                  disabled={savingAddr || !newAddr.trim()}
                  style={{ padding: '8px 16px', background: 'var(--green)', color: '#000', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: (!newAddr.trim() || savingAddr) ? 0.4 : 1, fontFamily: SANS, flexShrink: 0 }}
                >
                  {savingAddr ? 'Saving...' : 'Add wallet'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontFamily: MONO, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {walletAddr.slice(0, 12)}...{walletAddr.slice(-8)}
                  </div>
                  <span style={{ fontSize: 11, fontFamily: MONO, color: 'var(--green)' }}>
                    Solana {network.charAt(0).toUpperCase() + network.slice(1)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleCopy}
                    style={{ padding: '7px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, color: copied ? 'var(--green)' : 'var(--text-muted)', cursor: 'pointer', fontFamily: SANS }}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <a
                    href={`https://explorer.solana.com/address/${walletAddr}?cluster=${network}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ padding: '7px 14px', background: 'transparent', border: '1px solid rgba(0,188,125,0.2)', borderRadius: 6, fontSize: 12, color: 'var(--green)', textDecoration: 'none', fontFamily: SANS }}
                  >
                    Explorer →
                  </a>
                  <button
                    onClick={() => setEditingAddr(v => !v)}
                    style={{ padding: '7px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: SANS }}
                  >
                    Change
                  </button>
                </div>
              </div>

              {editingAddr && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', fontSize: 13, color: 'var(--text-primary)', fontFamily: MONO, outline: 'none' }}
                    type="text"
                    value={newAddr}
                    onChange={e => setNewAddr(e.target.value)}
                    placeholder="New Solana address..."
                  />
                  <button
                    onClick={handleSaveAddr}
                    disabled={savingAddr || !newAddr.trim()}
                    style={{ padding: '8px 16px', background: 'var(--green)', color: '#000', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: (!newAddr.trim() || savingAddr) ? 0.4 : 1, fontFamily: SANS, flexShrink: 0 }}
                  >
                    {savingAddr ? 'Saving...' : 'Update'}
                  </button>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* ── Revenue by Endpoint ── */}
        <Card style={{ marginBottom: 'var(--space-md)', padding: 0 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontFamily: MONO, fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Revenue by Endpoint
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '32px 24px', color: 'var(--text-muted)', fontSize: 12, fontFamily: MONO }}>Loading...</div>
          ) : epRevenue.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, fontFamily: MONO }}>
              No revenue yet — make your first paid call
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 110px', padding: '10px 24px', borderBottom: '1px solid var(--border)' }}>
                {['Endpoint', 'Calls', 'Gross', 'Net (99%)'].map(h => (
                  <span key={h} style={{ fontFamily: MONO, fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</span>
                ))}
              </div>
              {epRevenue.map((ep, i) => {
                const epNet = ep.value * 0.99
                return (
                  <div
                    key={i}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 110px', padding: '12px 24px', borderBottom: i < epRevenue.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}
                  >
                    <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ep.name}</span>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-secondary)' }}>{ep.calls}</span>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-secondary)' }}>${ep.value.toFixed(5)}</span>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--green)' }}>${epNet.toFixed(5)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* ── Recent Transactions ── */}
        <Card style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: MONO, fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Recent Transactions
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '32px 24px', color: 'var(--text-muted)', fontSize: 12, fontFamily: MONO }}>Loading...</div>
          ) : txns.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, fontFamily: MONO }}>
              No transactions yet
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px 70px 80px', padding: '10px 24px', borderBottom: '1px solid var(--border)' }}>
                {['Endpoint', 'Gross', 'Net', 'Fee', 'Status', 'Time'].map(h => (
                  <span key={h} style={{ fontFamily: MONO, fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</span>
                ))}
              </div>
              {txns.map((tx, i) => (
                <div
                  key={tx.id}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px 70px 80px', padding: '12px 24px', borderBottom: i < txns.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}
                >
                  <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.endpoint}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-secondary)' }}>${tx.totalAmount?.toFixed(5)}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--green)' }}>${tx.providerAmount?.toFixed(5)}</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)' }}>${tx.platformFee?.toFixed(5)}</span>
                  <span style={{
                    fontFamily: MONO, fontSize: 10,
                    color: tx.status === 'verified' || tx.status === 'demo' ? 'var(--green)' : 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {tx.status}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(tx.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

      </PageContainer>
    </DashboardLayout>
  )
}

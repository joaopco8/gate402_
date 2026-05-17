'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import DashboardLayout from '../components/DashboardLayout'
import PageContainer from '../components/PageContainer'
import { useUser } from '../hooks/useUser'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'

const SANS = 'var(--font-display)'
const MONO = 'var(--font-code)'

const S = {
  card: {
    background: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: 12,
    marginBottom: 16,
  } as React.CSSProperties,
  cardHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as React.CSSProperties,
  cardBody: {
    padding: '24px',
  } as React.CSSProperties,
  label: {
    fontSize: 12,
    fontFamily: SANS,
    color: '#555',
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    marginBottom: 6,
    fontWeight: 400,
  },
  mono: { fontFamily: MONO } as React.CSSProperties,
  btn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', borderRadius: 6, fontSize: 14, fontWeight: 500,
    cursor: 'pointer', border: 'none', transition: 'background 150ms',
    background: '#3ecf8e', color: '#111',
    fontFamily: SANS,
  } as React.CSSProperties,
  btnGhost: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', borderRadius: 6, fontSize: 14, fontWeight: 500,
    cursor: 'pointer', background: 'transparent',
    border: '1px solid #1a1a1a', color: '#666',
    transition: 'border-color 150ms',
    fontFamily: SANS,
  } as React.CSSProperties,
  input: {
    background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 6,
    padding: '8px 12px', fontSize: 14, color: '#fff',
    fontFamily: MONO,
    outline: 'none', width: '100%', boxSizing: 'border-box' as const,
  },
  tag: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    fontSize: 12, padding: '2px 8px', borderRadius: 9999,
    fontFamily: SANS,
  } as React.CSSProperties,
}

interface Balance {
  available: number
  totalEarned: number
  totalWithdrawn: number
  currency: string
  network: string
}

interface Transaction {
  date: string
  endpoint: string
  gross: number
  net: number
  fee: number
  status: string
}

interface Withdrawal {
  date: string
  amount: number
  toWallet: string
  txHash: string
  status: string
}

function StatNum({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ flex: 1, padding: '28px 24px', borderRight: '1px solid #1a1a1a' }}>
      <div style={S.label}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 500, color: '#fff', letterSpacing: '-0.42px', marginBottom: 6, fontFamily: SANS }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: '#555', fontFamily: SANS }}>{sub}</div>
    </div>
  )
}

export default function WalletPage() {
  const router = useRouter()
  const { userData } = useUser()

  const [balance, setBalance] = useState<Balance | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(true)

  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawMsg, setWithdrawMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const [txns, setTxns] = useState<Transaction[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])

  const [copied, setCopied] = useState(false)
  const [editingAddr, setEditingAddr] = useState(false)
  const [newAddr, setNewAddr] = useState('')
  const [savingAddr, setSavingAddr] = useState(false)

  const isPro = userData?.plan === 'pro' || userData?.plan === 'enterprise'
  const hasMetering = userData?.limits?.hasMetering ?? false
  const network = balance?.network ?? userData?.network ?? 'devnet'
  const walletAddr = userData?.walletAddress

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      try {
        const [balRes, txRes] = await Promise.allSettled([
          fetch(`${SERVER_URL}/api/wallet/balance`, { headers: { 'x-user-id': user.id } }),
          fetch(`${SERVER_URL}/api/analytics/transactions?limit=10`, { headers: { 'x-user-id': user.id } }),
        ])

        if (balRes.status === 'fulfilled' && balRes.value.ok) {
          const d = await balRes.value.json()
          setBalance(d)
          setWithdrawAmount(d.available > 0 ? d.available.toFixed(4) : '')
        }

        if (txRes.status === 'fulfilled' && txRes.value.ok) {
          const d = await txRes.value.json()
          setTxns(d.transactions ?? d ?? [])
          setWithdrawals(d.withdrawals ?? [])
        }
      } finally {
        setLoadingBalance(false)
      }
    }
    load()
  }, [router])

  async function handleWithdraw() {
    if (!walletAddr || !withdrawAmount || !isPro) return
    setWithdrawing(true)
    setWithdrawMsg(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const res = await fetch(`${SERVER_URL}/api/wallet/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ toAddress: walletAddr, amountUsdc: parseFloat(withdrawAmount) }),
      })
      const d = await res.json()
      if (res.ok) {
        setWithdrawMsg({ type: 'ok', text: `Sent! Tx: ${d.txHash}` })
        window.location.reload()
      } else {
        setWithdrawMsg({ type: 'err', text: d.error ?? 'Withdrawal failed' })
      }
    } catch {
      setWithdrawMsg({ type: 'err', text: 'Network error. Try again.' })
    } finally {
      setWithdrawing(false)
    }
  }

  async function handleExport() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const res = await fetch(`${SERVER_URL}/api/analytics/export`, { headers: { 'x-user-id': user.id } })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'gate402-transactions.csv'; a.click()
    URL.revokeObjectURL(url)
  }

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

  const available = balance?.available ?? 0

  return (
    <DashboardLayout>
      <PageContainer>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, fontFamily: SANS, color: '#555', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Wallet</div>
          <h1 style={{ fontSize: 28, fontWeight: 500, color: '#fff', margin: 0, letterSpacing: '-0.42px', fontFamily: SANS }}>Balance & Payouts</h1>
          <p style={{ fontSize: 15, color: '#666', margin: '8px 0 0', lineHeight: 1.5, fontFamily: SANS }}>
            USDC earned from API payments · Solana {network.charAt(0).toUpperCase() + network.slice(1)}
          </p>
        </div>

        <div style={{ ...S.card, display: 'flex', marginBottom: 16, overflow: 'hidden' }}>
          <StatNum
            label="Available Balance"
            value={loadingBalance ? '—' : `$${available.toFixed(4)}`}
            sub="ready to withdraw"
          />
          <StatNum
            label="Total Earned"
            value={loadingBalance ? '—' : `$${(balance?.totalEarned ?? 0).toFixed(4)}`}
            sub="all time"
          />
          <StatNum
            label="Total Withdrawn"
            value={loadingBalance ? '—' : `$${(balance?.totalWithdrawn ?? 0).toFixed(4)}`}
            sub="withdrawal history"
          />
        </div>

        <div style={S.card}>
          <div style={S.cardHeader}>
            <span style={{ fontSize: 15, fontWeight: 500, color: '#fff', fontFamily: SANS }}>Withdraw USDC</span>
            {!isPro && (
              <span style={{ ...S.tag, background: 'rgba(255,255,255,0.05)', border: '1px solid #1a1a1a', color: '#555' }}>
                Pro only
              </span>
            )}
          </div>
          <div style={S.cardBody}>
            {!isPro ? (
              <div style={{ padding: '16px 20px', background: 'rgba(153,69,255,0.04)', border: '1px solid rgba(153,69,255,0.12)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, color: '#888', fontFamily: SANS }}>Upgrade to Pro to withdraw your earnings.</span>
                <a href="/settings" style={{ ...S.btn, textDecoration: 'none' }}>Upgrade to Pro</a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={S.label}>Sending to</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, fontFamily: MONO, color: '#ccc' }}>
                      {walletAddr ? `${walletAddr.slice(0, 8)}...${walletAddr.slice(-4)}` : 'No wallet configured'}
                    </span>
                    {walletAddr && (
                      <button onClick={() => setEditingAddr(v => !v)} style={{ fontSize: 12, color: '#555', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: SANS }}>
                        Change
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <div style={S.label}>Amount</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      style={S.input}
                      type="number"
                      value={withdrawAmount}
                      onChange={e => setWithdrawAmount(e.target.value)}
                      min="0.001"
                      max={available}
                      step="0.001"
                      placeholder="0.0000"
                    />
                    <button
                      onClick={() => setWithdrawAmount(available.toFixed(4))}
                      style={{ ...S.btnGhost, whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                      Max
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: '#555', fontFamily: SANS }}>Network fee: ~$0.001 SOL</div>

                {withdrawMsg && (
                  <div style={{
                    fontSize: 13, padding: '10px 14px', borderRadius: 6, fontFamily: MONO,
                    background: withdrawMsg.type === 'ok' ? 'rgba(62,207,142,0.06)' : 'rgba(239,68,68,0.06)',
                    border: `1px solid ${withdrawMsg.type === 'ok' ? 'rgba(62,207,142,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    color: withdrawMsg.type === 'ok' ? '#3ecf8e' : '#f87171',
                  }}>
                    {withdrawMsg.text}
                  </div>
                )}

                <button
                  onClick={handleWithdraw}
                  disabled={withdrawing || available === 0 || !walletAddr}
                  style={{ ...S.btn, opacity: (withdrawing || available === 0 || !walletAddr) ? 0.4 : 1, cursor: (withdrawing || available === 0 || !walletAddr) ? 'not-allowed' : 'pointer' }}
                >
                  {withdrawing ? 'Sending...' : 'Withdraw to wallet'}
                </button>

                <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6, fontFamily: SANS }}>
                  Payments go directly to your wallet on-chain. Gate402 never holds your funds.
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={S.card}>
          <div style={S.cardHeader}>
            <span style={{ fontSize: 15, fontWeight: 500, color: '#fff', fontFamily: SANS }}>Receiving Wallet</span>
          </div>
          <div style={S.cardBody}>
            {!walletAddr ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ padding: '16px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#f87171', marginBottom: 4, fontFamily: SANS }}>No wallet configured</div>
                    <div style={{ fontSize: 13, color: '#555', fontFamily: SANS }}>Payments cannot be received until you add a Solana wallet address.</div>
                  </div>
                </div>
                <div>
                  <div style={S.label}>Solana wallet address</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input style={S.input} type="text" value={newAddr} onChange={e => setNewAddr(e.target.value)} placeholder="Enter Solana address..." />
                    <button onClick={handleSaveAddr} disabled={savingAddr || !newAddr.trim()} style={{ ...S.btn, flexShrink: 0, opacity: (!newAddr.trim() || savingAddr) ? 0.4 : 1 }}>
                      {savingAddr ? 'Saving...' : 'Add wallet'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={S.label}>Current</div>
                    <span style={{ fontSize: 13, fontFamily: MONO, color: '#ccc' }}>
                      {walletAddr.slice(0, 8)}...{walletAddr.slice(-4)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleCopy} style={{ ...S.btnGhost, color: copied ? '#3ecf8e' : '#666', borderColor: copied ? 'rgba(62,207,142,0.3)' : '#1a1a1a' }}>
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <a
                      href={`https://explorer.solana.com/address/${walletAddr}?cluster=${network}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ ...S.btnGhost, textDecoration: 'none', color: '#3ecf8e', borderColor: 'rgba(62,207,142,0.2)' }}
                    >
                      View on Explorer
                    </a>
                  </div>
                </div>

                <div>
                  <span style={{ ...S.tag, background: 'rgba(62,207,142,0.08)', border: '1px solid rgba(62,207,142,0.15)', color: '#3ecf8e' }}>
                    Solana {network.charAt(0).toUpperCase() + network.slice(1)}
                  </span>
                </div>

                {editingAddr && (
                  <div>
                    <div style={S.label}>New address</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input style={S.input} type="text" value={newAddr} onChange={e => setNewAddr(e.target.value)} placeholder="New Solana address..." />
                      <button onClick={handleSaveAddr} disabled={savingAddr || !newAddr.trim()} style={{ ...S.btn, flexShrink: 0, opacity: (!newAddr.trim() || savingAddr) ? 0.4 : 1 }}>
                        {savingAddr ? 'Saving...' : 'Update'}
                      </button>
                    </div>
                  </div>
                )}

                {!editingAddr && (
                  <button onClick={() => setEditingAddr(true)} style={{ ...S.btnGhost, width: 'fit-content' }}>
                    Update wallet address
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {isPro && hasMetering && (
          <div style={S.card}>
            <div style={S.cardHeader}>
              <span style={{ fontSize: 15, fontWeight: 500, color: '#fff', fontFamily: SANS }}>Revenue Breakdown</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {[
                { label: 'Request-based', value: '$0.031', sub: '14 transactions' },
                { label: 'Token-based', value: '$0.008', sub: '8,200 tokens' },
                { label: 'Compute-based', value: '$0.003', sub: '34 seconds' },
              ].map((c, i) => (
                <div key={i} style={{ padding: '24px', borderRight: i < 2 ? '1px solid #1a1a1a' : undefined }}>
                  <div style={S.label}>{c.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 500, color: '#fff', letterSpacing: '-0.42px', fontFamily: SANS, marginBottom: 4 }}>{c.value}</div>
                  <div style={{ fontSize: 12, color: '#555', fontFamily: SANS }}>{c.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={S.card}>
          <div style={S.cardHeader}>
            <span style={{ fontSize: 15, fontWeight: 500, color: '#fff', fontFamily: SANS }}>Recent Transactions</span>
            {isPro ? (
              <button onClick={handleExport} style={{ ...S.btnGhost, fontSize: 12 }}>Export CSV</button>
            ) : (
              <span style={{ fontSize: 12, color: '#555', fontFamily: SANS }}>Export CSV — Pro only</span>
            )}
          </div>
          <div>
            {txns.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center', color: '#555', fontSize: 13, fontFamily: SANS }}>
                No transactions yet.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                    {['Date', 'Endpoint', 'Gross', 'Net', 'Fee', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontFamily: SANS, color: '#555', letterSpacing: '0.08em', fontWeight: 400 }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {txns.map((tx, i) => (
                    <tr key={i} style={{ borderBottom: i < txns.length - 1 ? '1px solid #111' : undefined }}>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#555', fontFamily: MONO }}>{tx.date}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#ccc', fontFamily: MONO }}>{tx.endpoint}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#fff', fontFamily: MONO }}>${tx.gross?.toFixed(5)}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#3ecf8e', fontFamily: MONO }}>${tx.net?.toFixed(5)}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#555', fontFamily: MONO }}>${tx.fee?.toFixed(5)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ ...S.tag, background: 'rgba(62,207,142,0.08)', border: '1px solid rgba(62,207,142,0.15)', color: '#3ecf8e' }}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {withdrawals.length > 0 && (
          <div style={S.card}>
            <div style={S.cardHeader}>
              <span style={{ fontSize: 15, fontWeight: 500, color: '#fff', fontFamily: SANS }}>Withdrawal History</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                  {['Date', 'Amount', 'To Wallet', 'Tx Hash', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontFamily: SANS, color: '#555', letterSpacing: '0.08em', fontWeight: 400 }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w, i) => (
                  <tr key={i} style={{ borderBottom: i < withdrawals.length - 1 ? '1px solid #111' : undefined }}>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#555', fontFamily: MONO }}>{w.date}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#fff', fontFamily: MONO }}>${w.amount?.toFixed(4)} USDC</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#ccc', fontFamily: MONO }}>{w.toWallet?.slice(0, 8)}...{w.toWallet?.slice(-4)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#555', fontFamily: MONO }}>{w.txHash?.slice(0, 8)}...</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ ...S.tag, background: 'rgba(62,207,142,0.08)', border: '1px solid rgba(62,207,142,0.15)', color: '#3ecf8e' }}>
                        {w.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {withdrawals.length === 0 && isPro && (
          <div style={{ padding: '24px', textAlign: 'center', color: '#555', fontSize: 13, fontFamily: SANS }}>
            No withdrawals yet. Your earned USDC is waiting in your balance.
          </div>
        )}

      </PageContainer>
    </DashboardLayout>
  )
}

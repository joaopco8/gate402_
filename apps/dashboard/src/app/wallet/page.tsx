'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import DashboardLayout from '../components/DashboardLayout'
import PageContainer from '../components/PageContainer'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import { getMetrics } from '../lib/api'

const WALLET_ADDRESS = '7UQctUWgfH87jjz9xjnCCKVY6Q1tMWZ8i1ZB3Whx939D'

const MOCK_TRANSACTIONS = [
  { id: '1', type: 'received',  amount: 0.050, from: 'Agent_GPT4...',    endpoint: '/api/weather', time: '2 min ago',   hash: 'tx_5kWq...9mLP' },
  { id: '2', type: 'received',  amount: 0.020, from: 'Agent_Claude...',  endpoint: '/api/news',    time: '14 min ago',  hash: 'tx_3pRt...7vNQ' },
  { id: '3', type: 'withdrawn', amount: 5.000, from: 'My Phantom Wallet', endpoint: null,          time: '2 hours ago', hash: 'tx_9mLZ...4kWE' },
  { id: '4', type: 'received',  amount: 0.010, from: 'Agent_GPT4...',    endpoint: '/api/data',    time: '5 hours ago', hash: 'tx_2vTx...8nRP' },
  { id: '5', type: 'received',  amount: 0.002, from: 'Agent_Gemini...',  endpoint: '/api/news',    time: '1 day ago',   hash: 'tx_8xKj...9mLP' },
  { id: '6', type: 'withdrawn', amount: 2.500, from: 'My Phantom Wallet', endpoint: null,          time: '3 days ago',  hash: 'tx_1mNp...3kWE' },
]

function truncateAddress(addr: string) {
  return addr.slice(0, 16) + '...' + addr.slice(-4)
}

export default function WalletPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [totalEarned, setTotalEarned] = useState<number>(0)
  const [copied, setCopied] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAddress, setWithdrawAddress] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/login'); return }
      setUser({ id: u.id, email: u.email })

      const metrics = await getMetrics()
      setTotalEarned(metrics.totalUsdc)
      setBalance(metrics.totalUsdc * 0.8)
      setWithdrawAmount((metrics.totalUsdc * 0.8).toFixed(4))
    }
    load()
  }, [router])

  function handleCopyAddress() {
    navigator.clipboard.writeText(WALLET_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleConfirmWithdraw() {
    setWithdrawing(true)
    setTimeout(() => {
      setWithdrawing(false)
      setShowWithdrawModal(false)
      setBalance(0)
      alert('Withdrawal simulated! In production, USDC would be sent to your wallet on Solana mainnet.')
    }, 2000)
  }

  return (
    <DashboardLayout>
      <PageContainer>
        <PageHeader eyebrow="WALLET" title="Your Wallet" subtitle="USDC balance from API payments · Solana devnet" />

        {/* Balance card */}
        <Card accent style={{
          background: 'linear-gradient(135deg, #0d0d0d 0%, #0a0f0a 100%)',
          padding: 32,
          marginBottom: 16,
        }}>
          {/* Decorative orb */}
          <div style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-code)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 12 }}>
              AVAILABLE BALANCE
            </div>
            <div style={{
              fontSize: 48,
              fontWeight: 300,
              color: 'var(--green)',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              marginBottom: 6,
            }}>
              ${balance.toFixed(4)}
            </div>
            <div style={{ fontSize: 12, fontFamily: 'var(--font-code)', color: '#333', marginBottom: 24 }}>
              USDC · Solana devnet
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />

            <div style={{ display: 'flex', gap: 32 }}>
              <div>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-code)', color: 'var(--text-muted)', marginBottom: 4 }}>Total earned</div>
                <div style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-code)' }}>
                  ${totalEarned.toFixed(4)} USDC
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-code)', color: 'var(--text-muted)', marginBottom: 4 }}>Network</div>
                <div style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-code)' }}>Solana Devnet</div>
              </div>
            </div>

            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={balance === 0}
              style={{
                marginTop: 24,
                padding: '12px 28px',
                background: 'var(--green)',
                color: '#000',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                fontFamily: 'var(--font-display)',
                cursor: balance === 0 ? 'not-allowed' : 'pointer',
                opacity: balance === 0 ? 0.4 : 1,
                transition: 'opacity 150ms',
              }}
            >
              {balance === 0 ? 'No balance yet' : 'Withdraw USDC →'}
            </button>
          </div>
        </Card>

        {/* Wallet address card */}
        <Card style={{
          padding: 20,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-code)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>
              RECEIVING ADDRESS
            </div>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-code)', color: 'var(--text)', marginBottom: 8 }}>
              {truncateAddress(WALLET_ADDRESS)}
            </div>
            <a
              href={`https://explorer.solana.com/address/${WALLET_ADDRESS}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12, color: 'var(--green)', fontFamily: 'var(--font-code)', textDecoration: 'none' }}
            >
              View on Solana Explorer →
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={handleCopyAddress}
              style={{
                padding: '8px 16px',
                background: copied ? 'rgba(0,255,136,0.08)' : 'transparent',
                border: `1px solid ${copied ? 'rgba(0,255,136,0.3)' : 'var(--border)'}`,
                borderRadius: 6,
                fontSize: 12,
                fontFamily: 'var(--font-code)',
                color: copied ? 'var(--green)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 150ms',
                whiteSpace: 'nowrap',
              }}
            >
              {copied ? 'Copied ✓' : 'Copy address'}
            </button>

            {/* QR placeholder */}
            <div style={{
              width: 64,
              height: 64,
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontFamily: 'var(--font-code)',
              color: '#333',
              flexShrink: 0,
            }}>
              QR
            </div>
          </div>
        </Card>

        {/* Transaction history */}
        <Card style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border)',
            fontSize: 11,
            fontFamily: 'var(--font-code)',
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
          }}>
            TRANSACTION HISTORY
          </div>

          {MOCK_TRANSACTIONS.map((tx, i) => (
            <div
              key={tx.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                borderBottom: i < MOCK_TRANSACTIONS.length - 1 ? '1px solid var(--border)' : 'none',
                gap: 12,
              }}
            >
              {/* Left: icon + info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: tx.type === 'received' ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  color: tx.type === 'received' ? 'var(--green)' : '#666',
                  flexShrink: 0,
                }}>
                  {tx.type === 'received' ? '↓' : '↑'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>
                    {tx.type === 'received' ? 'Payment received' : 'Withdrawal'}
                  </div>
                  <div style={{ fontSize: 12, fontFamily: 'var(--font-code)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tx.endpoint ?? tx.from}
                  </div>
                </div>
              </div>

              {/* Center: tx hash */}
              <div style={{ fontSize: 12, fontFamily: 'var(--font-code)', color: 'var(--text-muted)', flexShrink: 0 }}>
                {tx.hash}
              </div>

              {/* Right: amount + time */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontSize: 13,
                  fontFamily: 'var(--font-code)',
                  color: tx.type === 'received' ? 'var(--green)' : '#666',
                  marginBottom: 2,
                }}>
                  {tx.type === 'received' ? '+' : '-'}${tx.amount.toFixed(3)} USDC
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tx.time}</div>
              </div>
            </div>
          ))}
        </Card>
      </PageContainer>

      {/* Withdraw modal */}
      {showWithdrawModal && (
        <div
          onClick={() => !withdrawing && setShowWithdrawModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0d0d0d',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 32,
              maxWidth: 400,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 20, fontWeight: 400, color: 'var(--text)', marginBottom: 6 }}>
                Withdraw USDC
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Send your balance to any Solana wallet
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 12, fontFamily: 'var(--font-code)', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                DESTINATION WALLET ADDRESS
              </label>
              <input
                type="text"
                value={withdrawAddress}
                onChange={e => setWithdrawAddress(e.target.value)}
                placeholder="Enter Solana wallet address..."
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  padding: '10px 14px',
                  fontSize: 13,
                  fontFamily: 'var(--font-code)',
                  color: 'var(--text)',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 12, fontFamily: 'var(--font-code)', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                AMOUNT (USDC)
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  padding: '10px 14px',
                  fontSize: 13,
                  fontFamily: 'var(--font-code)',
                  color: 'var(--text)',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Warning */}
            <div style={{
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 6,
              padding: 12,
            }}>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-code)', color: '#f59e0b' }}>
                ⚠ This is a devnet demo. No real USDC will be transferred.
              </span>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                onClick={() => setShowWithdrawModal(false)}
                disabled={withdrawing}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  fontSize: 14,
                  fontFamily: 'var(--font-display)',
                  color: 'var(--text-muted)',
                  cursor: withdrawing ? 'not-allowed' : 'pointer',
                  transition: 'border-color 150ms, color 150ms',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWithdraw}
                disabled={withdrawing}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  background: 'var(--green)',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: 'var(--font-display)',
                  color: '#000',
                  cursor: withdrawing ? 'not-allowed' : 'pointer',
                  opacity: withdrawing ? 0.7 : 1,
                  transition: 'opacity 150ms',
                }}
              >
                {withdrawing ? 'Processing...' : 'Confirm Withdrawal →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

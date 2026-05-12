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

interface WalletBalance {
  available: number
  totalEarned: number
  totalWithdrawn: number
  currency: string
  network: string
}

export default function WalletPage() {
  const router = useRouter()
  const { userData } = useUser()
  const [balance, setBalance] = useState<WalletBalance | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(true)
  const [copied, setCopied] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAddress, setWithdrawAddress] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      try {
        const res = await fetch(`${SERVER_URL}/api/wallet/balance`, {
          headers: { 'x-user-id': user.id },
        })
        if (res.ok) {
          const data = await res.json()
          setBalance(data)
          setWithdrawAmount(data.available > 0 ? data.available.toFixed(4) : '')
        }
      } finally {
        setLoadingBalance(false)
      }
    }
    load()
  }, [router])

  function handleCopyAddress() {
    const addr = userData?.walletAddress
    if (!addr) return
    navigator.clipboard.writeText(addr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleConfirmWithdraw() {
    if (!withdrawAddress.trim() || !withdrawAmount) return
    setWithdrawing(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const res = await fetch(`${SERVER_URL}/api/wallet/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ toAddress: withdrawAddress.trim(), amountUsdc: parseFloat(withdrawAmount) }),
      })

      const data = await res.json()

      if (res.ok) {
        setShowWithdrawModal(false)
        alert(`Withdrawal successful!\nTx: ${data.txHash}\n\nExplorer: ${data.explorerUrl}`)
        window.location.reload()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch {
      alert('Transfer failed. Please try again.')
    } finally {
      setWithdrawing(false)
    }
  }

  const available = balance?.available ?? 0
  const network = balance?.network ?? userData?.network ?? 'devnet'
  const receivingAddress = userData?.walletAddress

  return (
    <DashboardLayout>
      <PageContainer>
        <PageHeader eyebrow="WALLET" title="Your Wallet" subtitle={`USDC balance from API payments · Solana ${network}`} />

        {/* Balance card */}
        <Card accent style={{
          background: 'linear-gradient(135deg, #0d0d0d 0%, #0a0f0a 100%)',
          padding: 32,
          marginBottom: 16,
        }}>
          <div style={{
            position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-code)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 12 }}>
              AVAILABLE BALANCE
            </div>
            <div style={{ fontSize: 48, fontWeight: 300, color: 'var(--green)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 6 }}>
              {loadingBalance ? '...' : `$${available.toFixed(4)}`}
            </div>
            <div style={{ fontSize: 12, fontFamily: 'var(--font-code)', color: '#333', marginBottom: 24 }}>
              USDC · Solana {network}
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />

            <div style={{ display: 'flex', gap: 32 }}>
              <div>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-code)', color: 'var(--text-muted)', marginBottom: 4 }}>Total earned</div>
                <div style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-code)' }}>
                  ${(balance?.totalEarned ?? 0).toFixed(4)} USDC
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-code)', color: 'var(--text-muted)', marginBottom: 4 }}>Total withdrawn</div>
                <div style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-code)' }}>
                  ${(balance?.totalWithdrawn ?? 0).toFixed(4)} USDC
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-code)', color: 'var(--text-muted)', marginBottom: 4 }}>Network</div>
                <div style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-code)' }}>
                  Solana {network.charAt(0).toUpperCase() + network.slice(1)}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={available === 0 || loadingBalance}
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
                cursor: available === 0 || loadingBalance ? 'not-allowed' : 'pointer',
                opacity: available === 0 || loadingBalance ? 0.4 : 1,
                transition: 'opacity 150ms',
              }}
            >
              {loadingBalance ? 'Loading...' : available === 0 ? 'No balance yet' : 'Withdraw USDC →'}
            </button>
          </div>
        </Card>

        {/* Wallet address card */}
        {receivingAddress && (
          <Card style={{
            padding: 20, marginBottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-code)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>
                RECEIVING ADDRESS
              </div>
              <div style={{ fontSize: 13, fontFamily: 'var(--font-code)', color: 'var(--text)', marginBottom: 8 }}>
                {receivingAddress.slice(0, 16)}...{receivingAddress.slice(-4)}
              </div>
              <a
                href={`https://explorer.solana.com/address/${receivingAddress}?cluster=${network}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: 'var(--green)', fontFamily: 'var(--font-code)', textDecoration: 'none' }}
              >
                View on Solana Explorer →
              </a>
            </div>
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
          </Card>
        )}
      </PageContainer>

      {/* Withdraw modal */}
      {showWithdrawModal && (
        <div
          onClick={() => !withdrawing && setShowWithdrawModal(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
            zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0d0d0d', border: '1px solid var(--border)', borderRadius: 12,
              padding: 32, maxWidth: 400, width: '100%', display: 'flex', flexDirection: 'column', gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 20, fontWeight: 400, color: 'var(--text)', marginBottom: 6 }}>Withdraw USDC</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Transfer {available.toFixed(4)} USDC to any Solana wallet on {network}
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
                  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6,
                  padding: '10px 14px', fontSize: 13, fontFamily: 'var(--font-code)', color: 'var(--text)',
                  outline: 'none', width: '100%', boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 12, fontFamily: 'var(--font-code)', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                AMOUNT (USDC) · max {available.toFixed(4)}
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                min="0.001"
                max={available}
                step="0.001"
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6,
                  padding: '10px 14px', fontSize: 13, fontFamily: 'var(--font-code)', color: 'var(--text)',
                  outline: 'none', width: '100%', boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                onClick={() => setShowWithdrawModal(false)}
                disabled={withdrawing}
                style={{
                  flex: 1, padding: '11px 0', background: 'transparent',
                  border: '1px solid var(--border)', borderRadius: 6, fontSize: 14,
                  fontFamily: 'var(--font-display)', color: 'var(--text-muted)',
                  cursor: withdrawing ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWithdraw}
                disabled={withdrawing || !withdrawAddress.trim() || !withdrawAmount}
                style={{
                  flex: 1, padding: '11px 0', background: 'var(--green)', border: 'none',
                  borderRadius: 6, fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-display)',
                  color: '#000', cursor: withdrawing ? 'not-allowed' : 'pointer',
                  opacity: withdrawing ? 0.7 : 1, transition: 'opacity 150ms',
                }}
              >
                {withdrawing ? 'Sending...' : 'Confirm Withdrawal →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

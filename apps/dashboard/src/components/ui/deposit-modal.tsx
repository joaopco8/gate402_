'use client'

import { useState } from 'react'
import { useMoonPay } from '@/hooks/useMoonPay'

interface DepositModalProps {
  open: boolean
  onClose: () => void
  walletAddress: string
  agentName: string
}

const LABEL: React.CSSProperties = {
  fontSize: 12, fontFamily: 'var(--font-label)', fontWeight: 500,
  textTransform: 'uppercase', color: '#4A5549', marginBottom: 10,
}

export function DepositModal({ open, onClose, walletAddress, agentName }: DepositModalProps) {
  const { openWidget, loaded } = useMoonPay()
  const [amount, setAmount] = useState('50')
  const [copied, setCopied] = useState(false)
  const [method, setMethod] = useState<'moonpay' | 'crypto'>('moonpay')

  if (!open) return null

  function copyAddress() {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleMoonPay() {
    await openWidget({ walletAddress, amount })
    onClose()
  }

  const presets = ['10', '25', '50', '100']

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} />

      <div style={{
        position: 'relative', width: '100%', maxWidth: 420, margin: '0 16px',
        background: '#1B1E1B', border: '1px solid #2A2E2A', borderRadius: 0,
        boxShadow: '0 25px 50px rgba(0,0,0,0.6)', fontFamily: 'var(--font-label)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #2A2E2A' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#E8F4EE' }}>Deposit USDC</div>
            <div style={{ fontSize: 12, color: '#4A5549', marginTop: 2 }}>{agentName}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5549', fontSize: 18, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        {/* Method tabs */}
        <div style={{ display: 'flex', gap: 8, padding: '14px 20px 0' }}>
          {(['moonpay', 'crypto'] as const).map(m => (
            <button key={m} onClick={() => setMethod(m)} style={{
              flex: 1, padding: '10px 0', fontSize: 12, fontFamily: 'var(--font-label)',
              fontWeight: 500, cursor: 'pointer', border: '1px solid',
              borderColor: method === m ? '#7AF279' : '#2A2E2A',
              background: method === m ? 'rgba(122,242,121,0.06)' : 'transparent',
              color: method === m ? '#7AF279' : '#4A5549',
              textTransform: 'uppercase',
            }}>
              {m === 'moonpay' ? 'Pix / Card' : 'Crypto'}
            </button>
          ))}
        </div>

        <div style={{ padding: 20 }}>
          {method === 'moonpay' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Presets */}
              <div>
                <div style={LABEL}>Amount (USD)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 10 }}>
                  {presets.map(p => (
                    <button key={p} onClick={() => setAmount(p)} style={{
                      padding: '8px 0', fontSize: 12, fontFamily: 'var(--font-label)',
                      cursor: 'pointer', border: '1px solid',
                      borderColor: amount === p ? '#7AF279' : '#2A2E2A',
                      background: amount === p ? 'rgba(122,242,121,0.08)' : 'transparent',
                      color: amount === p ? '#7AF279' : '#4A5549',
                    }}>
                      ${p}
                    </button>
                  ))}
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4A5549', fontSize: 13 }}>$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    min="10"
                    style={{
                      width: '100%', background: '#111311', border: '1px solid #2A2E2A',
                      padding: '10px 12px 10px 24px', fontSize: 13,
                      fontFamily: 'var(--font-label)', color: '#E8F4EE',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                    placeholder="Custom amount"
                  />
                </div>
              </div>

              {/* Info */}
              <div style={{ background: '#111311', border: '1px solid #2A2E2A', padding: 12, display: 'flex', gap: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>📱</span>
                <div>
                  <div style={{ fontSize: 12, color: '#7A8C79', lineHeight: 1.5 }}>
                    Pay with Pix, credit card, or debit card. USDC arrives in your Solana wallet in minutes.
                  </div>
                  <div style={{ fontSize: 11, color: '#4A5549', marginTop: 4 }}>
                    KYC required on first use
                  </div>
                </div>
              </div>

              <button
                onClick={handleMoonPay}
                disabled={!loaded || !amount || Number(amount) < 10}
                style={{
                  width: '100%', padding: '12px 0', fontSize: 13, fontWeight: 600,
                  fontFamily: 'var(--font-label)', cursor: 'pointer', border: 'none',
                  background: '#7AF279', color: '#1B1E1B',
                  opacity: (!loaded || !amount || Number(amount) < 10) ? 0.5 : 1,
                  textTransform: 'uppercase',
                }}
              >
                {!loaded ? 'Loading...' : `Deposit $${amount} USDC`}
              </button>
            </div>
          )}

          {method === 'crypto' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 12, color: '#4A5549' }}>
                Send USDC on Solana directly to this address.
              </div>

              <div style={{ background: '#111311', border: '1px solid #2A2E2A', padding: 14 }}>
                <div style={LABEL}>Solana wallet address</div>
                <div style={{ fontSize: 12, color: '#E8F4EE', wordBreak: 'break-all', lineHeight: 1.6, marginBottom: 12 }}>
                  {walletAddress}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={copyAddress} style={{
                    flex: 1, padding: '8px 0', fontSize: 12, fontFamily: 'var(--font-label)',
                    border: '1px solid', cursor: 'pointer', background: 'transparent',
                    borderColor: copied ? '#7AF279' : '#2A2E2A',
                    color: copied ? '#7AF279' : '#7A8C79',
                    textTransform: 'uppercase',
                  }}>
                    {copied ? 'Copied!' : 'Copy Address'}
                  </button>
                  <a
                    href={`https://explorer.solana.com/address/${walletAddress}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      padding: '8px 14px', fontSize: 12, fontFamily: 'var(--font-label)',
                      border: '1px solid #2A2E2A', color: '#4A5549', textDecoration: 'none',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    ↗
                  </a>
                </div>
              </div>

              <div style={{ background: 'rgba(122,242,121,0.04)', border: '1px solid rgba(122,242,121,0.15)', padding: 12, display: 'flex', gap: 8 }}>
                <span style={{ color: '#7AF279', fontSize: 12, flexShrink: 0 }}>⚠</span>
                <span style={{ fontSize: 12, color: '#7A8C79', lineHeight: 1.5 }}>
                  Send only USDC on the Solana network. Other tokens or networks will result in permanent loss of funds.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import DashboardLayout from '../components/DashboardLayout'
import PageContainer from '../components/PageContainer'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import { useUser } from '../hooks/useUser'

const cardStyle: React.CSSProperties = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: 24,
  marginBottom: 16,
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-code)',
  letterSpacing: '0.08em',
  marginBottom: 12,
}

const valueBoxStyle: React.CSSProperties = {
  background: '#0a0a0a',
  border: '1px solid var(--border)',
  borderRadius: 6,
  padding: '12px 16px',
  fontFamily: 'var(--font-code)',
  fontSize: 13,
  color: 'var(--text-secondary)',
  wordBreak: 'break-all',
  marginBottom: 10,
}

const subtextStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-code)',
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        background: copied ? 'rgba(0,255,136,0.08)' : 'transparent',
        border: `1px solid ${copied ? 'rgba(0,255,136,0.3)' : 'var(--border)'}`,
        borderRadius: 6,
        padding: '6px 14px',
        fontSize: 12,
        fontFamily: 'var(--font-code)',
        color: copied ? 'var(--green)' : 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'all 150ms',
        marginBottom: 10,
      }}
    >
      {copied ? 'Copied ✓' : 'Copy'}
    </button>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { userData, loading } = useUser()
  const [walletInput, setWalletInput] = useState('')
  const [savingWallet, setSavingWallet] = useState(false)
  const [rotatingKey, setRotatingKey] = useState(false)

  async function handleSaveWallet() {
    if (!walletInput.trim()) return
    setSavingWallet(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'
      await fetch(`${SERVER_URL}/api/users/wallet`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ walletAddress: walletInput.trim() }),
      })
      window.location.reload()
    } catch (err) {
      console.error('[handleSaveWallet]', err)
    } finally {
      setSavingWallet(false)
    }
  }

  async function handleRotateKey() {
    setRotatingKey(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'
      await fetch(`${SERVER_URL}/api/users/rotate-key`, {
        method: 'POST',
        headers: { 'x-user-id': user.id },
      })
      window.location.reload()
    } catch (err) {
      console.error('[handleRotateKey]', err)
    } finally {
      setRotatingKey(false)
    }
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const skeletonBox = (
    <div style={{
      ...valueBoxStyle,
      background: '#0d0d0d',
      color: 'transparent',
      animation: 'pulse 1.5s ease-in-out infinite',
      userSelect: 'none',
    }}>
      loading...
    </div>
  )

  return (
    <DashboardLayout>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      <PageContainer>
        <PageHeader eyebrow="SETTINGS" title="Settings" />

        {/* API Key */}
        <Card style={{ marginBottom: 16 }}>
          <div style={labelStyle}>API KEY</div>
          {loading ? skeletonBox : (
            <div style={valueBoxStyle}>{userData?.apiKey ?? '—'}</div>
          )}
          <CopyButton text={userData?.apiKey ?? ''} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={subtextStyle}>
              Use this key in <span style={{ color: 'var(--text-secondary)' }}>gate402{'({ apiKey: \'...\' })'}</span>
            </div>
            <button
              onClick={handleRotateKey}
              disabled={rotatingKey || loading}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '5px 12px',
                fontSize: 11,
                fontFamily: 'var(--font-code)',
                color: 'var(--text-muted)',
                cursor: rotatingKey ? 'not-allowed' : 'pointer',
                opacity: rotatingKey ? 0.5 : 1,
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { if (!rotatingKey) { e.currentTarget.style.borderColor = '#ff4444'; e.currentTarget.style.color = '#ff4444' } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              {rotatingKey ? 'Rotating...' : 'Rotate key'}
            </button>
          </div>
        </Card>

        {/* Wallet */}
        <Card style={{ marginBottom: 16 }}>
          <div style={labelStyle}>SOLANA WALLET ({(userData?.network ?? 'devnet').toUpperCase()})</div>

          {loading ? skeletonBox : userData?.walletAddress ? (
            <>
              <div style={valueBoxStyle}>{userData.walletAddress}</div>
              <CopyButton text={userData.walletAddress} />
              <div style={{ ...subtextStyle, marginBottom: 10 }}>
                Agents send USDC to this address on Solana {userData.network}
              </div>
              <a
                href={`https://explorer.solana.com/address/${userData.walletAddress}?cluster=${userData.network}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: 'var(--green)', fontFamily: 'var(--font-code)', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
              >
                View on Solana Explorer →
              </a>
            </>
          ) : (
            <div>
              <div style={{ ...subtextStyle, marginBottom: 14, color: 'var(--text-secondary)' }}>
                Add your Solana wallet to start receiving payments
              </div>
              <input
                placeholder="Your Solana wallet address (e.g. 7UQc...)"
                value={walletInput}
                onChange={e => setWalletInput(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0a0a0a',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  padding: '10px 14px',
                  fontFamily: 'var(--font-code)',
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  outline: 'none',
                  marginBottom: 10,
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--green)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
              <button
                onClick={handleSaveWallet}
                disabled={savingWallet || !walletInput.trim()}
                style={{
                  background: 'rgba(0,255,136,0.1)',
                  border: '1px solid rgba(0,255,136,0.3)',
                  borderRadius: 6,
                  padding: '8px 20px',
                  fontSize: 12,
                  fontFamily: 'var(--font-code)',
                  color: 'var(--green)',
                  cursor: savingWallet || !walletInput.trim() ? 'not-allowed' : 'pointer',
                  opacity: !walletInput.trim() ? 0.5 : 1,
                  transition: 'all 150ms',
                }}
              >
                {savingWallet ? 'Saving...' : 'Save wallet'}
              </button>
            </div>
          )}
        </Card>

        {/* Network */}
        <Card style={{ marginBottom: 16 }}>
          <div style={labelStyle}>NETWORK</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{
              background: 'rgba(0,255,136,0.1)',
              color: 'var(--green)',
              border: '1px solid rgba(0,255,136,0.25)',
              borderRadius: 4,
              padding: '2px 8px',
              fontSize: 11,
              fontFamily: 'var(--font-code)',
              fontWeight: 500,
              letterSpacing: '0.08em',
            }}>
              {loading ? '...' : (userData?.network ?? 'devnet').toUpperCase()}
            </span>
          </div>
          <div style={{ ...subtextStyle, marginBottom: 14 }}>
            Switch to mainnet to receive real USDC payments
          </div>
          <button
            disabled
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '7px 16px',
              fontSize: 12,
              fontFamily: 'var(--font-code)',
              color: 'var(--text-muted)',
              cursor: 'not-allowed',
              opacity: 0.4,
            }}
          >
            Mainnet (coming soon)
          </button>
        </Card>

        {/* Account */}
        <Card>
          <div style={labelStyle}>ACCOUNT</div>
          <div style={{ ...valueBoxStyle, marginBottom: 14 }}>
            {loading ? '...' : (userData ? `Plan: ${userData.plan} · ${userData.totalCalls} calls · ${userData.totalEndpoints} endpoints` : '—')}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={handleSignOut}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '7px 16px',
                fontSize: 12,
                fontFamily: 'var(--font-code)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              Sign out
            </button>
            <button
              onClick={() => alert('Coming soon')}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,68,68,0.3)',
                borderRadius: 6,
                padding: '7px 16px',
                fontSize: 12,
                fontFamily: 'var(--font-code)',
                color: 'rgba(255,68,68,0.6)',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff4444'; e.currentTarget.style.color = '#ff4444' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,68,68,0.3)'; e.currentTarget.style.color = 'rgba(255,68,68,0.6)' }}
            >
              Delete account
            </button>
          </div>
        </Card>

      </PageContainer>
    </DashboardLayout>
  )
}

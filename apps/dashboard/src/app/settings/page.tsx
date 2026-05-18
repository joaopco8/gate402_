'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import DashboardLayout from '../components/DashboardLayout'
import PageContainer from '../components/PageContainer'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import { useUser } from '../hooks/useUser'

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-display)',
  fontWeight: 500,
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
  fontSize: 13,
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-display)',
  lineHeight: 1.5,
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
        background: copied ? 'rgba(62,207,142,0.08)' : 'transparent',
        border: `1px solid ${copied ? 'rgba(62,207,142,0.3)' : 'var(--border)'}`,
        borderRadius: 6,
        padding: '6px 14px',
        fontSize: 13,
        fontFamily: 'var(--font-display)',
        color: copied ? '#3ecf8e' : 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'all 150ms',
        marginBottom: 10,
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { userData, loading } = useUser()
  const [walletInput, setWalletInput] = useState('')
  const [savingWallet, setSavingWallet] = useState(false)
  const [rotatingKey, setRotatingKey] = useState(false)
  const [emailAlerts, setEmailAlerts] = useState<boolean | null>(null)
  const [togglingEmail, setTogglingEmail] = useState(false)
  const [togglingNetwork, setTogglingNetwork] = useState(false)

  // Sync emailAlerts state when userData loads
  const resolvedEmailAlerts = emailAlerts ?? userData?.emailAlerts ?? true

  async function handleNetworkSwitch(network: string) {
    if (togglingNetwork) return
    setTogglingNetwork(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'
      const res = await fetch(`${SERVER_URL}/api/users/network`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ network }),
      })
      const data = await res.json()
      if (res.ok) {
        window.location.reload()
      } else {
        alert(data.error)
      }
    } catch (err) {
      console.error('[handleNetworkSwitch]', err)
    } finally {
      setTogglingNetwork(false)
    }
  }

  async function handleToggleEmailAlerts() {
    if (togglingEmail) return
    const next = !resolvedEmailAlerts
    setEmailAlerts(next) // optimistic
    setTogglingEmail(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'
      const res = await fetch(`${SERVER_URL}/api/users/email-alerts`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ enabled: next }),
      })
      if (!res.ok) setEmailAlerts(!next) // revert on error
    } catch {
      setEmailAlerts(!next) // revert on error
    } finally {
      setTogglingEmail(false)
    }
  }

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
    router.push('/auth/login')
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
        <PageHeader eyebrow="Settings" title="Settings" />

        {/* API Key */}
        <Card style={{ marginBottom: 16 }}>
          <div style={labelStyle}>Api key</div>
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
                padding: '6px 14px',
                fontSize: 13,
                fontFamily: 'var(--font-display)',
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
          <div style={labelStyle}>Solana wallet ({userData?.network ?? 'devnet'})</div>

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
                  background: '#3ecf8e',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 20px',
                  fontSize: 14,
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  color: '#111',
                  cursor: savingWallet || !walletInput.trim() ? 'not-allowed' : 'pointer',
                  opacity: !walletInput.trim() ? 0.5 : 1,
                  transition: 'opacity 150ms',
                }}
              >
                {savingWallet ? 'Saving...' : 'Save wallet'}
              </button>
            </div>
          )}
        </Card>

        {/* Network */}
        <Card style={{ marginBottom: 16 }}>
          <div style={labelStyle}>Network</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{
              background: 'rgba(0,188,125,0.1)',
              color: 'var(--green)',
              border: '1px solid rgba(0,188,125,0.25)',
              borderRadius: 9999,
              padding: '2px 10px',
              fontSize: 12,
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
            }}>
              {loading ? '...' : (userData?.network ?? 'devnet')}
            </span>
          </div>
          <div style={{ ...subtextStyle, marginBottom: 14 }}>
            {userData?.network === 'mainnet'
              ? 'Live on mainnet — receiving real USDC payments'
              : 'Switch to mainnet to receive real USDC payments. Requires a wallet configured.'}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => handleNetworkSwitch('devnet')}
              disabled={loading || togglingNetwork || userData?.network === 'devnet'}
              style={{
                background: userData?.network === 'devnet' ? 'rgba(0,188,125,0.1)' : 'transparent',
                border: `1px solid ${userData?.network === 'devnet' ? 'rgba(0,188,125,0.3)' : 'var(--border)'}`,
                borderRadius: 6,
                padding: '7px 16px',
                fontSize: 13,
                fontFamily: 'var(--font-display)',
                color: userData?.network === 'devnet' ? 'var(--green)' : 'var(--text-muted)',
                cursor: userData?.network === 'devnet' ? 'default' : 'pointer',
                transition: 'all 150ms',
              }}
            >
              Devnet
            </button>
            <button
              onClick={() => handleNetworkSwitch('mainnet')}
              disabled={loading || togglingNetwork || userData?.network === 'mainnet'}
              style={{
                background: userData?.network === 'mainnet' ? 'rgba(0,188,125,0.1)' : 'transparent',
                border: `1px solid ${userData?.network === 'mainnet' ? 'rgba(0,188,125,0.3)' : 'var(--border)'}`,
                borderRadius: 6,
                padding: '7px 16px',
                fontSize: 13,
                fontFamily: 'var(--font-display)',
                color: userData?.network === 'mainnet' ? 'var(--green)' : 'var(--text-muted)',
                cursor: loading || togglingNetwork || userData?.network === 'mainnet' ? 'not-allowed' : 'pointer',
                opacity: loading || togglingNetwork ? 0.5 : 1,
                transition: 'all 150ms',
              }}
            >
              {togglingNetwork ? 'Switching...' : 'Mainnet'}
            </button>
          </div>
        </Card>

        {/* Email Alerts */}
        <Card style={{ marginBottom: 16 }}>
          <div style={labelStyle}>Email alerts</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Payment notifications
              </div>
              <div style={subtextStyle}>
                Receive an email each time a payment is confirmed on your endpoints
              </div>
            </div>
            {/* Toggle switch */}
            <button
              onClick={handleToggleEmailAlerts}
              disabled={loading || togglingEmail}
              aria-pressed={resolvedEmailAlerts}
              style={{
                flexShrink: 0,
                width: 44,
                height: 24,
                borderRadius: 12,
                border: 'none',
                background: resolvedEmailAlerts ? 'var(--green)' : '#222',
                cursor: loading || togglingEmail ? 'not-allowed' : 'pointer',
                position: 'relative',
                transition: 'background 200ms',
                opacity: loading ? 0.5 : 1,
                padding: 0,
              }}
            >
              <span style={{
                position: 'absolute',
                top: 3,
                left: resolvedEmailAlerts ? 23 : 3,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 200ms',
              }} />
            </button>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, fontFamily: 'var(--font-display)', color: '#555' }}>
            {loading ? '...' : resolvedEmailAlerts ? 'Alerts enabled' : 'Alerts disabled'}
          </div>
        </Card>

        {/* Account */}
        <Card>
          <div style={labelStyle}>Account</div>
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
                fontSize: 13,
                fontFamily: 'var(--font-display)',
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
                fontSize: 13,
                fontFamily: 'var(--font-display)',
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

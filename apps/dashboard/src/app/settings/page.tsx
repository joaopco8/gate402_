'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
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
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-default)',
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
        border: `1px solid ${copied ? 'rgba(62,207,142,0.3)' : 'var(--border-default)'}`,
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

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'

export default function SettingsPage() {
  const router = useRouter()
  const { userData, loading } = useUser()
  const [walletInput, setWalletInput] = useState('')
  const [savingWallet, setSavingWallet] = useState(false)
  const [rotatingKey, setRotatingKey] = useState(false)
  const [emailAlerts, setEmailAlerts] = useState<boolean | null>(null)
  const [togglingEmail, setTogglingEmail] = useState(false)
  const [togglingNetwork, setTogglingNetwork] = useState(false)

  // Webhook state
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [showSigExample, setShowSigExample] = useState(false)

  // Sync emailAlerts state when userData loads
  const resolvedEmailAlerts = emailAlerts ?? userData?.emailAlerts ?? true

  // Prefill webhook URL from user data
  useEffect(() => {
    if (userData?.webhookUrl) setWebhookUrl(userData.webhookUrl)
  }, [userData?.webhookUrl])

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

  async function handleSaveWebhook() {
    setSaving(true)
    setSaveStatus('idle')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const res = await fetch(`${SERVER_URL}/api/users/webhook`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
      body: JSON.stringify({ webhookUrl: webhookUrl || null, webhookSecret: webhookSecret || null }),
    })
    const status = res.ok ? 'success' : 'error'
    setSaveStatus(status)
    setSaving(false)
    if (status === 'success') setTimeout(() => setSaveStatus('idle'), 3000)
  }

  async function handleTestWebhook() {
    if (!webhookUrl) return
    setTesting(true)
    setTestStatus('idle')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setTesting(false); return }
    const res = await fetch(`${SERVER_URL}/api/users/webhook/test`, {
      method: 'POST',
      headers: { 'x-user-id': user.id },
    })
    setTestStatus(res.ok ? 'success' : 'error')
    setTesting(false)
    setTimeout(() => setTestStatus('idle'), 3000)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const skeletonBox = (
    <div style={{
      ...valueBoxStyle,
      background: 'var(--bg-overlay)',
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
        <PageHeader title="Settings" />

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
                border: '1px solid var(--border-default)',
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
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)' }}
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
                style={{ fontSize: 12, color: '#3ECF8E', fontFamily: 'var(--font-code)', textDecoration: 'none' }}
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
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 6,
                  padding: '10px 14px',
                  fontFamily: 'var(--font-code)',
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  outline: 'none',
                  marginBottom: 10,
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#3ECF8E')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}
              />
              <button
                onClick={handleSaveWallet}
                disabled={savingWallet || !walletInput.trim()}
                style={{
                  background: '#006239',
                  border: '0.5px solid #128353',
                  borderRadius: 6,
                  padding: '8px 20px',
                  fontSize: 14,
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  color: '#fff',
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
              color: '#3ECF8E',
              border: '1px solid rgba(0,188,125,0.25)',
              borderRadius: 6,
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
                border: `1px solid ${userData?.network === 'devnet' ? 'rgba(0,188,125,0.3)' : 'var(--border-default)'}`,
                borderRadius: 6,
                padding: '7px 16px',
                fontSize: 13,
                fontFamily: 'var(--font-display)',
                color: userData?.network === 'devnet' ? '#3ECF8E' : 'var(--text-muted)',
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
                border: `1px solid ${userData?.network === 'mainnet' ? 'rgba(0,188,125,0.3)' : 'var(--border-default)'}`,
                borderRadius: 6,
                padding: '7px 16px',
                fontSize: 13,
                fontFamily: 'var(--font-display)',
                color: userData?.network === 'mainnet' ? '#3ECF8E' : 'var(--text-muted)',
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
                borderRadius: 6,
                border: 'none',
                background: resolvedEmailAlerts ? '#3ECF8E' : '#222',
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

        {/* Webhooks */}
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--font-code)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Webhooks</div>
          <div style={{ ...subtextStyle, marginBottom: 16 }}>Receive a POST request after each confirmed payment.</div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>Endpoint URL</label>
            <input
              type="url"
              placeholder="https://your-server.com/webhook"
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              style={{
                width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                borderRadius: 6, padding: '10px 14px', fontFamily: 'var(--font-code)',
                fontSize: 13, color: 'var(--text-secondary)', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#3ECF8E')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>Secret (optional)</label>
            <input
              type="password"
              placeholder="Used to verify webhook signatures"
              value={webhookSecret}
              onChange={e => setWebhookSecret(e.target.value)}
              style={{
                width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                borderRadius: 6, padding: '10px 14px', fontFamily: 'var(--font-code)',
                fontSize: 13, color: 'var(--text-secondary)', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#3ECF8E')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}
            />
          </div>

          {/* Signature verification example */}
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={() => setShowSigExample(v => !v)}
              style={{
                background: 'transparent', border: 'none', padding: 0,
                fontSize: 12, fontFamily: 'var(--font-display)', color: 'var(--text-muted)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <span style={{ fontSize: 10 }}>{showSigExample ? '▼' : '▶'}</span>
              How to verify signatures
            </button>
            {showSigExample && (
              <pre style={{
                marginTop: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                borderRadius: 6, padding: '12px 14px', fontFamily: 'var(--font-code)',
                fontSize: 12, color: '#aaa', overflowX: 'auto', lineHeight: 1.6,
              }}>{`import crypto from 'crypto'

const sig = req.headers['x-gate402-signature']
const expected = crypto
  .createHmac('sha256', YOUR_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex')

if (sig !== \`sha256=\${expected}\`) {
  return res.status(401).send('Invalid signature')
}`}</pre>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <button
              onClick={handleSaveWebhook}
              disabled={saving}
              style={{
                background: saveStatus === 'success' ? 'rgba(0,98,57,0.4)' : '#006239',
                border: `0.5px solid ${saveStatus === 'success' ? '#128353' : '#128353'}`,
                borderRadius: 6, padding: '8px 20px', fontSize: 13,
                fontFamily: 'var(--font-display)', fontWeight: 500,
                color: '#fff',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1, transition: 'all 150ms',
              }}
            >
              {saving ? 'Saving...' : saveStatus === 'success' ? 'Saved ✓' : saveStatus === 'error' ? 'Error — retry' : 'Save webhook'}
            </button>
            <button
              onClick={handleTestWebhook}
              disabled={testing || !webhookUrl}
              style={{
                background: 'transparent',
                border: `1px solid ${testStatus === 'success' ? 'rgba(62,207,142,0.4)' : testStatus === 'error' ? 'rgba(255,68,68,0.4)' : 'var(--border-default)'}`,
                borderRadius: 6, padding: '8px 20px', fontSize: 13,
                fontFamily: 'var(--font-display)',
                color: testStatus === 'success' ? '#3ecf8e' : testStatus === 'error' ? '#ff4444' : 'var(--text-secondary)',
                cursor: testing || !webhookUrl ? 'not-allowed' : 'pointer',
                opacity: !webhookUrl ? 0.4 : testing ? 0.7 : 1, transition: 'all 150ms',
              }}
            >
              {testing ? 'Sending...' : testStatus === 'success' ? 'Sent ✓' : testStatus === 'error' ? 'Failed' : 'Send test'}
            </button>
          </div>

          {/* Payload example */}
          <div style={{ fontSize: 12, fontFamily: 'var(--font-display)', color: 'var(--text-muted)', marginBottom: 6 }}>Example payload</div>
          <pre style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: 6, padding: '12px 14px', fontFamily: 'var(--font-code)',
            fontSize: 12, color: '#777', overflowX: 'auto', lineHeight: 1.6, margin: 0,
          }}>{`{
  "event": "payment.confirmed",
  "endpoint": "/api/data",
  "amount": 0.001,
  "currency": "USDC",
  "network": "devnet",
  "txHash": "5kWq9mLP...",
  "payerWallet": "DcL4mMaq...",
  "timestamp": "2026-05-20T12:00:00Z"
}`}</pre>
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
                border: '1px solid var(--border-default)',
                borderRadius: 6,
                padding: '7px 16px',
                fontSize: 13,
                fontFamily: 'var(--font-display)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
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

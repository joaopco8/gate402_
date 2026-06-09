'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import { getAuthHeaders } from '../lib/api'
import DashboardLayout from '../components/DashboardLayout'
import PageContainer from '../components/PageContainer'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import { useUser } from '@/contexts/UserContext'
import { NetworkSwitch } from '@/components/ui/network-switch'
import { motion, AnimatePresence } from 'motion/react'
import OnboardCard from '@/components/ui/onboard-card'

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-secondary)',
  fontFamily: 'var(--font-label)',
  fontWeight: 500,
  textTransform: 'uppercase',
  marginBottom: 12,
}

const valueBoxStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid #2A2E2A',
  borderRadius: 8,
  padding: '12px 16px',
  fontFamily: 'var(--font-label)',
  fontSize: 13,
  color: '#E8F4EE',
  wordBreak: 'break-all',
  marginBottom: 10,
}

const subtextStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#7A8C79',
  fontFamily: 'var(--font-label)',
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
        background: copied ? 'rgba(122,242,121,0.08)' : 'transparent',
        border: `1px solid ${copied ? 'rgba(122,242,121,0.3)' : '#2A2E2A'}`,
        borderRadius: 8,
        padding: '6px 14px',
        fontSize: 13,
        fontFamily: 'var(--font-label)',
        color: copied ? '#7AF279' : '#7A8C79',
        cursor: 'pointer',
        transition: 'all 150ms',
        marginBottom: 10,
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.metera.xyz'

export default function SettingsPage() {
  const router = useRouter()
  const { userData, loading } = useUser()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const [walletInput, setWalletInput] = useState('')
  const [savingWallet, setSavingWallet] = useState(false)
  const [rotatingKey, setRotatingKey] = useState(false)
  const [emailAlerts, setEmailAlerts] = useState<boolean | null>(null)
  const [togglingEmail, setTogglingEmail] = useState(false)
  const [togglingNetwork, setTogglingNetwork] = useState(false)
  const [targetNetwork, setTargetNetwork] = useState<string>('')

  // Profile state
  const [profile, setProfile] = useState({
    username: '', displayName: '', bio: '',
    githubUrl: '', websiteUrl: '', twitterUrl: '',
    isPublicProfile: false,
  })
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileStatus, setProfileStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [profileError, setProfileError] = useState('')
  const [usernameError, setUsernameError] = useState('')

  const [avatarImage, setAvatarImage] = useState<string | null>(null)
  const [avatarImageError, setAvatarImageError] = useState('')
  const MAX_AVATAR_BYTES = 512 * 1024

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

  // Load profile on mount
  useEffect(() => {
    if (profileLoaded) return
    ;(async () => {
      const res = await fetch(`${SERVER_URL}/api/users/profile`, {
        headers: await getAuthHeaders(),
      })
      if (res.ok) {
        const data = await res.json()
        const u = data.user
        setProfile(p => ({ ...p, ...u, bio: u.bio ?? '', username: u.username ?? '', displayName: u.displayName ?? '', githubUrl: u.githubUrl ?? '', websiteUrl: u.websiteUrl ?? '', twitterUrl: u.twitterUrl ?? '' }))
        if (u.avatarImage) setAvatarImage(u.avatarImage)
      }
      setProfileLoaded(true)
    })()
  }, [profileLoaded])

  async function handleSaveProfile() {
    setUsernameError('')
    setProfileError('')
    setSavingProfile(true)
    setProfileStatus('idle')
    try {
      const res = await fetch(`${SERVER_URL}/api/users/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...await getAuthHeaders() },
        body: JSON.stringify({ ...profile, ...(avatarImage !== null ? { avatarImage } : {}) }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.code === 'INVALID_USERNAME' || data.code === 'USERNAME_TAKEN') {
          setUsernameError(data.error)
        } else {
          setProfileError(data.error || 'Save failed')
        }
        setProfileStatus('error')
      } else {
        const u = data.user
        setProfile(p => ({ ...p, ...u, bio: u.bio ?? '', username: u.username ?? '', displayName: u.displayName ?? '', githubUrl: u.githubUrl ?? '', websiteUrl: u.websiteUrl ?? '', twitterUrl: u.twitterUrl ?? '' }))
        setProfileStatus('success')
        setTimeout(() => setProfileStatus('idle'), 3000)
      }
    } catch {
      setProfileError('Network error')
      setProfileStatus('error')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleNetworkSwitch(network: string) {
    if (togglingNetwork) return
    setTargetNetwork(network)
    setTogglingNetwork(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.metera.xyz'
      const res = await fetch(`${SERVER_URL}/api/users/network`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...await getAuthHeaders() },
        body: JSON.stringify({ network }),
      })
      const data = await res.json()
      if (res.ok) {
        // wait for animation to finish before reload
        await new Promise(r => setTimeout(r, 3200))
        window.location.reload()
      } else {
        alert(data.error)
        setTogglingNetwork(false)
      }
    } catch (err) {
      console.error('[handleNetworkSwitch]', err)
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
      const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.metera.xyz'
      const res = await fetch(`${SERVER_URL}/api/users/email-alerts`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...await getAuthHeaders() },
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
      const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.metera.xyz'
      await fetch(`${SERVER_URL}/api/users/wallet`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...await getAuthHeaders() },
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
      const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.metera.xyz'
      await fetch(`${SERVER_URL}/api/users/rotate-key`, {
        method: 'POST',
        headers: { ...await getAuthHeaders() },
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
      headers: { 'Content-Type': 'application/json', ...await getAuthHeaders() },
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
      headers: { ...await getAuthHeaders() },
    })
    setTestStatus(res.ok ? 'success' : 'error')
    setTesting(false)
    setTimeout(() => setTestStatus('idle'), 3000)
  }

  async function handleSignOut() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {}
    window.location.href = '/auth/login'
  }

  const skeletonBox = (
    <div style={{
      ...valueBoxStyle,
      background: 'rgba(0,0,0,0.3)',
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
          {(!mounted || loading) ? skeletonBox : (
            <div style={valueBoxStyle}>{userData?.apiKey ?? '—'}</div>
          )}
          <CopyButton text={userData?.apiKey ?? ''} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={subtextStyle}>
              Use this key in <span style={{ color: 'var(--text-secondary)' }}>gate402{'({ apiKey: \'...\' })'}</span>
            </div>
            <button
              onClick={handleRotateKey}
              disabled={rotatingKey || !mounted || loading}
              style={{
                background: 'transparent',
                border: '1px solid #2A2E2A',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 13,
                fontFamily: 'var(--font-label)',
                color: '#7A8C79',
                cursor: rotatingKey ? 'not-allowed' : 'pointer',
                opacity: rotatingKey ? 0.5 : 1,
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { if (!rotatingKey) { e.currentTarget.style.borderColor = '#ff4444'; e.currentTarget.style.color = '#ff4444' } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2E2A'; e.currentTarget.style.color = '#7A8C79' }}
            >
              {rotatingKey ? 'Rotating...' : 'Rotate key'}
            </button>
          </div>
        </Card>

        {/* Wallet */}
        <Card style={{ marginBottom: 16 }}>
          <div style={labelStyle}>Solana wallet ({userData?.network ?? 'devnet'})</div>

          {(!mounted || loading) ? skeletonBox : userData?.walletAddress ? (
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
                style={{ fontSize: 12, color: '#7AF279', fontFamily: 'var(--font-label)', textDecoration: 'none' }}
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
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid #2A2E2A',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontFamily: 'var(--font-label)',
                  fontSize: 13,
                  color: '#E8F4EE',
                  outline: 'none',
                  marginBottom: 10,
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#7AF279')}
                onBlur={e => (e.currentTarget.style.borderColor = '#2A2E2A')}
              />
              <button
                onClick={handleSaveWallet}
                disabled={savingWallet || !walletInput.trim()}
                style={{
                  background: '#7AF279',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 20px',
                  fontSize: 14,
                  fontFamily: 'var(--font-label)',
                  fontWeight: 600,
                  color: '#1B1E1B',
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
          <NetworkSwitch
            defaultValue={userData?.network ?? 'devnet'}
            onChange={(val) => {
              if (val !== userData?.network) handleNetworkSwitch(val)
            }}
          >
            <NetworkSwitch.Control label="Devnet" value="devnet" disabled={!mounted || loading || togglingNetwork} />
            <NetworkSwitch.Control label="Mainnet" value="mainnet" disabled={!mounted || loading || togglingNetwork} />
          </NetworkSwitch>

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
              disabled={!mounted || loading || togglingEmail}
              aria-pressed={resolvedEmailAlerts}
              style={{
                flexShrink: 0,
                width: 44,
                height: 24,
                borderRadius: 6,
                border: 'none',
                background: resolvedEmailAlerts ? '#7AF279' : '#2A2E2A',
                cursor: (!mounted || loading || togglingEmail) ? 'not-allowed' : 'pointer',
                position: 'relative',
                transition: 'background 200ms',
                opacity: (!mounted || loading) ? 0.5 : 1,
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
          <div style={{ marginTop: 12, fontSize: 12, fontFamily: 'var(--font-label)', color: '#4A5549' }}>
            {(!mounted || loading) ? '...' : resolvedEmailAlerts ? 'Alerts enabled' : 'Alerts disabled'}
          </div>
        </Card>

        {/* Public Profile */}
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--font-label)', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 6 }}>Public Profile</div>
          <div style={{ ...subtextStyle, marginBottom: 16 }}>Visible at <span style={{ color: '#7AF279' }}>metera.xyz/provider/{profile.username || 'your-username'}</span></div>

          {/* Avatar */}
          <div style={{ marginBottom: 16 }}>
            <div style={labelStyle}>Photo (optional · max 512KB)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* Preview */}
              <div style={{
                width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                background: '#2A2E2A', border: '1px solid #3A3E3A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {avatarImage
                  ? <img src={avatarImage} alt="" style={{ width: 64, height: 64, objectFit: 'cover', display: 'block' }} />
                  : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4A5549" strokeWidth="1.5">
                      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                  )
                }
              </div>
              <div>
                <label style={{
                  display: 'inline-block', padding: '7px 14px', fontSize: 12,
                  border: '1px solid #2A2E2A', borderRadius: 8, cursor: 'pointer',
                  color: '#7A8C79', fontFamily: 'var(--font-label)', background: 'rgba(0,0,0,0.3)',
                }}>
                  Choose photo
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    style={{ display: 'none' }}
                    onChange={e => {
                      setAvatarImageError('')
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (file.size > MAX_AVATAR_BYTES) {
                        setAvatarImageError(`Too large (${(file.size/1024).toFixed(0)}KB). Max 512KB.`)
                        e.target.value = ''
                        return
                      }
                      const reader = new FileReader()
                      reader.onload = ev => setAvatarImage(ev.target?.result as string)
                      reader.readAsDataURL(file)
                    }}
                  />
                </label>
                {avatarImage && (
                  <button onClick={() => setAvatarImage(null)} style={{
                    marginLeft: 8, background: 'none', border: 'none',
                    color: '#4A5549', cursor: 'pointer', fontSize: 12,
                    fontFamily: 'var(--font-label)',
                  }}>Remove</button>
                )}
                {avatarImageError && (
                  <p style={{ fontSize: 11, color: '#f87171', marginTop: 4, fontFamily: 'var(--font-label)' }}>{avatarImageError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>Display Name</label>
            <input
              placeholder="Your name or team name"
              value={profile.displayName}
              onChange={e => setProfile(p => ({ ...p, displayName: e.target.value }))}
              style={{
                width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid #2A2E2A',
                borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-label)',
                fontSize: 13, color: '#E8F4EE', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#7AF279')}
              onBlur={e => (e.currentTarget.style.borderColor = '#2A2E2A')}
            />
          </div>

          {/* Username */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>Username</label>
            <input
              placeholder="your-username (lowercase, 3-30 chars)"
              value={profile.username}
              onChange={e => { setProfile(p => ({ ...p, username: e.target.value.toLowerCase() })); setUsernameError('') }}
              style={{
                width: '100%', background: 'rgba(0,0,0,0.3)',
                border: `1px solid ${usernameError ? 'rgba(255,68,68,0.5)' : '#2A2E2A'}`,
                borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-label)',
                fontSize: 13, color: '#E8F4EE', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = usernameError ? 'rgba(255,68,68,0.7)' : '#7AF279')}
              onBlur={e => (e.currentTarget.style.borderColor = usernameError ? 'rgba(255,68,68,0.5)' : '#2A2E2A')}
            />
            {usernameError && <div style={{ fontSize: 12, color: '#ff4444', marginTop: 4, fontFamily: 'var(--font-label)' }}>{usernameError}</div>}
          </div>

          {/* Bio */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>Bio <span style={{ opacity: 0.5, textTransform: 'none', fontSize: 11 }}>({(profile.bio || '').length}/160)</span></label>
            <textarea
              placeholder="Brief description of your APIs..."
              value={profile.bio}
              maxLength={160}
              rows={2}
              onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
              style={{
                width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid #2A2E2A',
                borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-label)',
                fontSize: 13, color: '#E8F4EE', outline: 'none', resize: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#7AF279')}
              onBlur={e => (e.currentTarget.style.borderColor = '#2A2E2A')}
            />
          </div>

          {/* Social links */}
          {(['githubUrl', 'websiteUrl', 'twitterUrl'] as const).map((key) => (
            <div key={key} style={{ marginBottom: 12 }}>
              <label style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>
                {key === 'githubUrl' ? 'GitHub URL' : key === 'websiteUrl' ? 'Website URL' : 'Twitter/X URL'}
              </label>
              <input
                type="url"
                placeholder={key === 'githubUrl' ? 'https://github.com/you' : key === 'websiteUrl' ? 'https://yoursite.com' : 'https://x.com/you'}
                value={profile[key]}
                onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                style={{
                  width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid #2A2E2A',
                  borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-label)',
                  fontSize: 13, color: '#E8F4EE', outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#7AF279')}
                onBlur={e => (e.currentTarget.style.borderColor = '#2A2E2A')}
              />
            </div>
          ))}

          {/* Public toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 2 }}>Make profile public</div>
              <div style={subtextStyle}>Visible at metera.xyz/provider/{profile.username || '...'}</div>
            </div>
            <button
              onClick={() => setProfile(p => ({ ...p, isPublicProfile: !p.isPublicProfile }))}
              style={{
                flexShrink: 0, width: 44, height: 24, borderRadius: 6, border: 'none',
                background: profile.isPublicProfile ? '#7AF279' : '#2A2E2A',
                cursor: 'pointer', position: 'relative', transition: 'background 200ms', padding: 0,
              }}
            >
              <span style={{
                position: 'absolute', top: 3,
                left: profile.isPublicProfile ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%',
                background: '#fff', transition: 'left 200ms',
              }} />
            </button>
          </div>

          {profileError && <div style={{ fontSize: 12, color: '#ff4444', marginBottom: 8, fontFamily: 'var(--font-label)' }}>{profileError}</div>}

          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            style={{
              background: profileStatus === 'success' ? 'rgba(122,242,121,0.5)' : '#7AF279',
              border: 'none', borderRadius: 8, padding: '8px 20px',
              fontSize: 13, fontFamily: 'var(--font-label)', fontWeight: 600,
              color: '#1B1E1B', cursor: savingProfile ? 'not-allowed' : 'pointer',
              opacity: savingProfile ? 0.7 : 1, transition: 'all 150ms',
            }}
          >
            {savingProfile ? 'Saving...' : profileStatus === 'success' ? 'Saved ✓' : profileStatus === 'error' ? 'Error — retry' : 'Save profile'}
          </button>
        </Card>

        {/* Webhooks */}
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--font-label)', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 6 }}>Webhooks</div>
          <div style={{ ...subtextStyle, marginBottom: 16 }}>Receive a POST request after each confirmed payment.</div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>Endpoint URL</label>
            <input
              type="url"
              placeholder="https://your-server.com/webhook"
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              style={{
                width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid #2A2E2A',
                borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-label)',
                fontSize: 13, color: '#E8F4EE', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#7AF279')}
              onBlur={e => (e.currentTarget.style.borderColor = '#2A2E2A')}
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
                width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid #2A2E2A',
                borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-label)',
                fontSize: 13, color: '#E8F4EE', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#7AF279')}
              onBlur={e => (e.currentTarget.style.borderColor = '#2A2E2A')}
            />
          </div>

          {/* Signature verification example */}
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={() => setShowSigExample(v => !v)}
              style={{
                background: 'transparent', border: 'none', padding: 0,
                fontSize: 12, fontFamily: 'var(--font-label)', color: '#7A8C79',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <span style={{ fontSize: 10 }}>{showSigExample ? '▼' : '▶'}</span>
              How to verify signatures
            </button>
            {showSigExample && (
              <pre style={{
                marginTop: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid #2A2E2A',
                borderRadius: 8, padding: '12px 14px', fontFamily: 'var(--font-label)',
                fontSize: 12, color: '#7A8C79', overflowX: 'auto', lineHeight: 1.6,
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
                background: saveStatus === 'success' ? 'rgba(122,242,121,0.5)' : '#7AF279',
                border: 'none',
                borderRadius: 8, padding: '8px 20px', fontSize: 13,
                fontFamily: 'var(--font-label)', fontWeight: 600,
                color: '#1B1E1B',
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
                border: `1px solid ${testStatus === 'success' ? 'rgba(122,242,121,0.4)' : testStatus === 'error' ? 'rgba(255,68,68,0.4)' : '#2A2E2A'}`,
                borderRadius: 8, padding: '8px 20px', fontSize: 13,
                fontFamily: 'var(--font-label)',
                color: testStatus === 'success' ? '#7AF279' : testStatus === 'error' ? '#ff4444' : '#7A8C79',
                cursor: testing || !webhookUrl ? 'not-allowed' : 'pointer',
                opacity: !webhookUrl ? 0.4 : testing ? 0.7 : 1, transition: 'all 150ms',
              }}
            >
              {testing ? 'Sending...' : testStatus === 'success' ? 'Sent ✓' : testStatus === 'error' ? 'Failed' : 'Send test'}
            </button>
          </div>

          {/* Payload example */}
          <div style={{ fontSize: 12, fontFamily: 'var(--font-label)', color: '#7A8C79', marginBottom: 6 }}>Example payload</div>
          <pre style={{
            background: 'rgba(0,0,0,0.3)', border: '1px solid #2A2E2A',
            borderRadius: 8, padding: '12px 14px', fontFamily: 'var(--font-label)',
            fontSize: 12, color: '#7A8C79', overflowX: 'auto', lineHeight: 1.6, margin: 0,
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
            {(!mounted || loading) ? '...' : (userData ? `Plan: ${userData.plan} · ${userData.totalCalls} calls · ${userData.totalEndpoints} endpoints` : '—')}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={handleSignOut}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid #2A2E2A',
                borderRadius: 8,
                padding: '7px 16px',
                fontSize: 13,
                fontFamily: 'var(--font-label)',
                color: '#E8F4EE',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#4A5549' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2E2A' }}
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
                fontFamily: 'var(--font-label)',
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

      {/* Network switch animation — fixed bottom-right */}
      <AnimatePresence>
        {togglingNetwork && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              bottom: 28,
              right: 28,
              zIndex: 9999,
            }}
          >
            <OnboardCard
              duration={3000}
              step1={userData?.network === 'mainnet' ? 'Mainnet Active' : 'Devnet Active'}
              step2="Switching Network"
              step3={targetNetwork === 'mainnet' ? 'Mainnet' : 'Devnet'}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  )
}

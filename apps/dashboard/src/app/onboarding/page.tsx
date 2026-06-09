'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { createClient } from '../../../lib/supabase/client'
import { getAuthHeaders } from '../lib/api'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.metera.xyz'

const cardStyle: React.CSSProperties = {
  background: '#111',
  border: '1px solid #222',
  borderRadius: 6,
  padding: 24,
  marginBottom: 24,
}

const labelStyle: React.CSSProperties = {
  color: '#00bc7d',
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  margin: '0 0 12px',
}

const primaryBtn: React.CSSProperties = {
  background: '#006239',
  color: '#fff',
  border: '0.5px solid #128353',
  borderRadius: 6,
  padding: '12px 20px',
  fontFamily: 'monospace',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  width: '100%',
  marginBottom: 12,
}

const ghostBtn: React.CSSProperties = {
  background: '#242424',
  color: '#fff',
  border: '0.5px solid #363636',
  borderRadius: 6,
  padding: '12px 20px',
  fontFamily: 'monospace',
  fontSize: 13,
  cursor: 'pointer',
  width: '100%',
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          style={{
            width: 28,
            height: 4,
            borderRadius: 6,
            background: n <= current ? '#00bc7d' : '#222',
            transition: 'background 0.3s',
          }}
        />
      ))}
    </div>
  )
}

export default function OnboardingPage() {
  const { userData, loading } = useUser()
  const [step, setStep] = useState(1)
  const [copied, setCopied] = useState(false)
  const [wallet, setWallet] = useState('')
  const [walletError, setWalletError] = useState('')
  const [savingWallet, setSavingWallet] = useState(false)
  const router = useRouter()

  // Redirect if onboarding already completed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('onboarding_completed') === 'true') {
        router.push('/dashboard')
      }
    }
  }, [router])

  // Pre-fill wallet if already set
  useEffect(() => {
    if (userData?.walletAddress) {
      setWallet(userData.walletAddress)
    }
  }, [userData])

  function handleCopy() {
    if (!userData?.apiKey) return
    navigator.clipboard.writeText(userData.apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function goToStep2() {
    // Skip step 2 if wallet already configured
    if (userData?.walletAddress) {
      setStep(3)
    } else {
      setStep(2)
    }
  }

  async function saveWallet() {
    const trimmed = wallet.trim()
    if (trimmed.length < 32 || trimmed.length > 44) {
      setWalletError('Wallet address must be between 32 and 44 characters.')
      return
    }
    setWalletError('')
    setSavingWallet(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const res = await fetch(`${SERVER_URL}/api/users/wallet`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...await getAuthHeaders(),
        },
        body: JSON.stringify({ walletAddress: trimmed }),
      })

      if (res.ok) {
        setStep(3)
      } else {
        setWalletError('Failed to save wallet. Please try again.')
      }
    } catch {
      setWalletError('Failed to save wallet. Please try again.')
    } finally {
      setSavingWallet(false)
    }
  }

  function finishOnboarding() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_completed', 'true')
    }
    router.push('/dashboard')
  }

  const displayWallet = wallet || userData?.walletAddress || 'YOUR_WALLET'
  const displayApiKey = userData?.apiKey || 'YOUR_API_KEY'

  const codeSnippet = `npm install gate402

import { gate402 } from 'gate402'

app.use(gate402({
  apiKey: '${displayApiKey}',
  walletAddress: '${displayWallet}',
  serverUrl: 'https://api.metera.xyz',
  endpoints: {
    '/api/data': 0.001
  }
}))`

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>

        {/* Logo */}
        <div style={{ marginBottom: 40 }}>
          <a href="/" style={{ display: 'inline-block', textDecoration: 'none' }}>
            <img src="/logo-gate.png" alt="Metera" style={{ height: 24, width: 'auto' }} />
          </a>
        </div>

        <StepIndicator current={step} />

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 600, margin: '0 0 8px', color: '#fff' }}>
              Welcome to Metera
            </h1>
            <p style={{ color: '#666', fontSize: 14, margin: '0 0 32px' }}>
              Your account is ready. Here's your API key to get started.
            </p>

            <div style={cardStyle}>
              <p style={labelStyle}>API KEY</p>
              <p style={{ fontFamily: 'monospace', fontSize: 13, color: '#ccc', wordBreak: 'break-all', margin: '0 0 16px' }}>
                {loading ? '—' : displayApiKey}
              </p>
              <button
                onClick={handleCopy}
                disabled={loading || !userData?.apiKey}
                style={{
                  background: copied ? '#00bc7d20' : '#1a1a1a',
                  border: `1px solid ${copied ? '#00bc7d40' : '#333'}`,
                  color: copied ? '#00bc7d' : '#888',
                  borderRadius: 6,
                  padding: '8px 16px',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {copied ? 'Copied ✓' : 'Copy API Key'}
              </button>
              <p style={{ fontSize: 12, color: '#444', margin: '12px 0 0' }}>
                This is your API key. Keep it safe.
              </p>
            </div>

            <button onClick={goToStep2} style={primaryBtn} disabled={loading}>
              Continue →
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 600, margin: '0 0 8px', color: '#fff' }}>
              Add your Solana wallet
            </h1>
            <p style={{ color: '#666', fontSize: 14, margin: '0 0 32px' }}>
              Payments go directly to this wallet. You can use any Solana wallet: Phantom, Backpack, etc.
            </p>

            <div style={cardStyle}>
              <p style={labelStyle}>WALLET ADDRESS</p>
              <input
                type="text"
                value={wallet}
                onChange={(e) => { setWallet(e.target.value); setWalletError('') }}
                placeholder="e.g. 7xKXtg2CW87d97TXJSDpbD..."
                style={{
                  width: '100%',
                  background: '#0a0a0a',
                  border: `1px solid ${walletError ? '#ff4444' : '#333'}`,
                  borderRadius: 6,
                  padding: '10px 12px',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  color: '#ccc',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {walletError && (
                <p style={{ fontSize: 12, color: '#ff4444', margin: '8px 0 0' }}>{walletError}</p>
              )}
            </div>

            <button
              onClick={saveWallet}
              disabled={savingWallet || !wallet.trim()}
              style={{ ...primaryBtn, opacity: savingWallet || !wallet.trim() ? 0.5 : 1 }}
            >
              {savingWallet ? 'Saving…' : 'Save wallet'}
            </button>
            <button onClick={() => setStep(3)} style={ghostBtn}>
              Skip for now
            </button>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 600, margin: '0 0 8px', color: '#fff' }}>
              You're ready
            </h1>
            <p style={{ color: '#666', fontSize: 14, margin: '0 0 32px' }}>
              Add Metera to your Express app with your API key already configured.
            </p>

            <div style={cardStyle}>
              <p style={labelStyle}>QUICK START</p>
              <pre style={{
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: 6,
                padding: 16,
                fontFamily: 'monospace',
                fontSize: 12,
                color: '#ccc',
                margin: 0,
                overflowX: 'auto',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}>
                {codeSnippet}
              </pre>
            </div>

            <button onClick={finishOnboarding} style={primaryBtn}>
              Open Dashboard →
            </button>
            <button
              onClick={() => router.push('/docs')}
              style={ghostBtn}
            >
              Read Docs →
            </button>
          </>
        )}

      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import DashboardLayout from '../components/DashboardLayout'
import PageContainer from '../components/PageContainer'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'

const WALLET = '7UQctUWgfH87jjz9xjnCCKVY6Q1tMWZ8i1ZB3Whx939D'

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
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser({ id: user.id, email: user.email })
    }
    load()
  }, [router])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <DashboardLayout>
      <PageContainer>
        <PageHeader eyebrow="SETTINGS" title="Settings" />

        {/* API Key */}
        <Card style={{ marginBottom: 16 }}>
          <div style={labelStyle}>API KEY</div>
          <div style={valueBoxStyle}>{user?.id ?? '—'}</div>
          <CopyButton text={user?.id ?? ''} />
          <div style={subtextStyle}>
            Use this key in <span style={{ color: 'var(--text-secondary)' }}>gate402{'({ apiKey: \'...\' })'}</span>
          </div>
        </Card>

        {/* Wallet */}
        <Card style={{ marginBottom: 16 }}>
          <div style={labelStyle}>SOLANA WALLET (DEVNET)</div>
          <div style={valueBoxStyle}>{WALLET}</div>
          <CopyButton text={WALLET} />
          <div style={{ ...subtextStyle, marginBottom: 10 }}>
            Agents send USDC to this address on Solana devnet
          </div>
          <a
            href={`https://explorer.solana.com/address/${WALLET}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: 'var(--green)', fontFamily: 'var(--font-code)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
          >
            View on Solana Explorer →
          </a>
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
              DEVNET
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
            {user?.email ?? '—'}
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

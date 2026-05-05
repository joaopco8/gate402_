'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'

const cardStyle: React.CSSProperties = {
  background: '#111',
  border: '1px solid #222',
  borderRadius: 8,
  padding: 20,
  marginBottom: 24,
}

const labelStyle: React.CSSProperties = {
  color: '#00ff88',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  margin: '0 0 12px',
}

export default function OnboardingPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser({ id: user.id, email: user.email })
    }
    load()
  }, [router])

  async function handleCopy() {
    if (!user) return
    await navigator.clipboard.writeText(user.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const codeSnippet = `# Install the SDK
npm install gate402

# Add to your Express app (apps/server/src/index.ts)
import { gate402 } from 'gate402'

app.use(gate402({
  apiKey: '${user?.id ?? 'YOUR_API_KEY'}',
  endpoints: {
    '/api/seu-endpoint': 0.001,  // price in USDC
  }
}))`

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <a href="/" style={{ display: 'inline-block', textDecoration: 'none' }}>
            <img src="/logo-gate.png" alt="Gate402" style={{ height: 24, width: 'auto' }} />
          </a>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 600, margin: '12px 0 0', color: '#fff' }}>
            Welcome, {user?.email ?? '…'} 👋
          </h1>
        </div>

        {/* Card: API Key */}
        <div style={cardStyle}>
          <p style={labelStyle}>API KEY</p>
          <p style={{ fontFamily: 'monospace', fontSize: 13, color: '#ccc', wordBreak: 'break-all', margin: '0 0 16px' }}>
            {user?.id ?? '—'}
          </p>
          <button
            onClick={handleCopy}
            style={{
              background: copied ? '#00ff8820' : '#1a1a1a',
              border: `1px solid ${copied ? '#00ff8840' : '#333'}`,
              color: copied ? '#00ff88' : '#888',
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
        </div>

        {/* Card: Quick Start */}
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
          }}>
            {codeSnippet}
          </pre>
        </div>

        {/* Card: What happens next */}
        <div style={cardStyle}>
          <p style={labelStyle}>WHAT HAPPENS NEXT</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              'Agents call your API normally',
              'Gate402 intercepts and requests USDC payment',
              'Payment confirmed → API responds → you see it here',
            ].map((text) => (
              <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ color: '#00ff88', flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 14, color: '#ccc' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push('/')}
          style={{
            background: '#00ff88',
            color: '#000',
            border: 'none',
            borderRadius: 8,
            padding: 14,
            width: '100%',
            fontFamily: 'monospace',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: 16,
          }}
        >
          Open Dashboard →
        </button>

        <div style={{ textAlign: 'center' }}>
          <a
            href="/"
            style={{ fontSize: 13, color: '#555', textDecoration: 'none' }}
          >
            Skip for now →
          </a>
        </div>

      </div>
    </div>
  )
}

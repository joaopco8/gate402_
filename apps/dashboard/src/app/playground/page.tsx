'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import PageContainer from '../components/PageContainer'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'

const SERVER = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3001'
const CHIPS = ['/api/weather', '/api/news']

type CallResult = {
  status: number
  data: unknown
  timeMs: number
  endpoint: string
  paid: boolean
} | null

function syntaxHighlight(json: string): React.ReactNode[] {
  const lines = json.split('\n')
  return lines.map((line, i) => {
    const keyMatch = line.match(/^(\s*)("[\w\s]+")(: )(.*)/)
    if (keyMatch) {
      const [, indent, key, colon, val] = keyMatch
      let valueEl: React.ReactNode = val

      if (val.startsWith('"')) {
        valueEl = <span style={{ color: 'var(--green)' }}>{val}</span>
      } else if (!isNaN(Number(val.replace(',', '')))) {
        valueEl = <span style={{ color: 'var(--blue)' }}>{val}</span>
      } else if (val === 'true,' || val === 'true' || val === 'false,' || val === 'false') {
        valueEl = <span style={{ color: '#f59e0b' }}>{val}</span>
      }

      const rawKey = key.replace(/"/g, '')
      if (rawKey === 'error') {
        valueEl = <span style={{ color: '#ef4444' }}>{val}</span>
      } else if (rawKey === 'price' || rawKey === 'priceUsdc') {
        valueEl = <span style={{ color: '#f59e0b' }}>{val}</span>
      } else if (rawKey === 'payTo' || rawKey === 'walletAddress') {
        valueEl = <span style={{ color: 'var(--purple)' }}>{val}</span>
      }

      return (
        <div key={i}>
          {indent}
          <span style={{ color: '#ccc' }}>{key}</span>
          <span style={{ color: '#666' }}>{colon}</span>
          {valueEl}
        </div>
      )
    }
    return <div key={i} style={{ color: '#555' }}>{line}</div>
  })
}

function StatusBadge({ status }: { status: number }) {
  const ok = status === 200
  const color = ok ? 'var(--green)' : status === 0 ? '#888' : '#ef4444'
  const label = status === 200 ? '200 OK' : status === 402 ? '402 Payment Required' : status === 0 ? 'Connection Error' : `${status}`
  return (
    <span style={{
      background: ok ? 'rgba(0,255,136,0.1)' : status === 402 ? 'rgba(239,68,68,0.1)' : 'rgba(136,136,136,0.1)',
      color,
      border: `1px solid ${ok ? 'rgba(0,255,136,0.25)' : status === 402 ? 'rgba(239,68,68,0.25)' : 'rgba(136,136,136,0.25)'}`,
      borderRadius: 4,
      padding: '2px 8px',
      fontSize: 11,
      fontFamily: 'var(--font-code)',
      fontWeight: 500,
      letterSpacing: '0.05em',
    }}>
      {label}
    </span>
  )
}

function LoadingDots() {
  const [dots, setDots] = useState(1)
  useEffect(() => {
    const t = setInterval(() => setDots(d => d === 3 ? 1 : d + 1), 400)
    return () => clearInterval(t)
  }, [])
  return <span>{'Calling' + '.'.repeat(dots)}</span>
}

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-code)',
  letterSpacing: '0.08em',
  marginBottom: 12,
}

export default function PlaygroundPage() {
  const [endpoint, setEndpoint] = useState('/api/weather')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<CallResult>(null)
  const [history, setHistory] = useState<CallResult[]>([])

  async function callEndpoint(withPayment: boolean) {
    setLoading(true)
    const start = Date.now()
    const { createClient } = await import('../../../lib/supabase/client')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id ?? null
    try {
      const headers: Record<string, string> = {}
      if (withPayment) {
        headers['X-Payment-Payload'] = `demo_playground_${Date.now()}`
      }
      if (userId) {
        headers['x-user-id'] = userId
      }
      const res = await fetch(`${SERVER}${endpoint}`, { headers })
      const data = await res.json()
      const result: CallResult = {
        status: res.status,
        data,
        timeMs: Date.now() - start,
        endpoint,
        paid: withPayment,
      }
      setResponse(result)
      setHistory(prev => [result, ...prev].slice(0, 5))
    } catch {
      const result: CallResult = {
        status: 0,
        data: { error: `Could not connect to ${SERVER}. Check server status.` },
        timeMs: Date.now() - start,
        endpoint,
        paid: false,
      }
      setResponse(result)
      setHistory(prev => [result, ...prev].slice(0, 5))
    } finally {
      setLoading(false)
    }
  }

  const responseData = response?.data as Record<string, unknown> | undefined
  const price = responseData?.price ?? responseData?.priceUsdc
  const payTo = responseData?.payTo ?? responseData?.walletAddress

  return (
    <DashboardLayout>
      <PageContainer>
        <PageHeader eyebrow="PLAYGROUND" title="Test your API" subtitle="Simulate the full payment flow without writing any code." />

        {/* Section 1 — Config */}
        <Card style={{ marginBottom: 16 }}>
          <div style={sectionLabel}>ENDPOINT</div>
          <input
            type="text"
            value={endpoint}
            onChange={e => setEndpoint(e.target.value)}
            placeholder="/api/weather"
            style={{
              width: '100%',
              background: '#0a0a0a',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '12px 16px',
              color: '#fff',
              fontFamily: 'var(--font-code)',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: 12,
              transition: 'border-color 150ms',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--green)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            {CHIPS.map(chip => {
              const active = endpoint === chip
              return (
                <button
                  key={chip}
                  onClick={() => setEndpoint(chip)}
                  style={{
                    background: '#0a0a0a',
                    border: `1px solid ${active ? 'var(--green)' : 'var(--border)'}`,
                    borderRadius: 6,
                    padding: '4px 12px',
                    fontSize: 12,
                    fontFamily: 'var(--font-code)',
                    color: active ? 'var(--green)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 150ms',
                  }}
                >
                  {chip}
                </button>
              )
            })}
          </div>
        </Card>

        {/* Section 2 — Action buttons */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button
            onClick={() => callEndpoint(false)}
            disabled={loading}
            style={{
              flex: 1,
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '12px 20px',
              fontSize: 14,
              fontFamily: 'var(--font-display)',
              color: 'var(--text-secondary)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 150ms',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#fff' } }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            {loading ? <LoadingDots /> : 'Call without payment →'}
          </button>
          <button
            onClick={() => callEndpoint(true)}
            disabled={loading}
            style={{
              flex: 1,
              background: 'var(--green)',
              border: '1px solid var(--green)',
              borderRadius: 8,
              padding: '12px 20px',
              fontSize: 14,
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              color: '#000',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'opacity 150ms',
            }}
          >
            {loading ? <LoadingDots /> : 'Pay and call →'}
          </button>
        </div>

        {/* Section 3 — Response viewer */}
        {response && (
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StatusBadge status={response.status} />
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>
                  {response.endpoint}
                </span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>
                {response.timeMs}ms
              </span>
            </div>
            <div style={{
              background: '#0a0a0a',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: 16,
              fontFamily: 'var(--font-code)',
              fontSize: 13,
              lineHeight: 1.7,
              overflowX: 'auto',
            }}>
              {syntaxHighlight(JSON.stringify(response.data, null, 2))}
            </div>
          </Card>
        )}

        {/* Section 4 — Explanation */}
        {response && response.status === 402 && (
          <div style={{
            background: 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: 8,
            padding: 20,
            marginBottom: 16,
            display: 'flex',
            gap: 14,
            alignItems: 'flex-start',
          }}>
            <span style={{ color: '#ef4444', fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>✗</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#ef4444', marginBottom: 6 }}>Payment required</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
                Your API blocked this request because no payment was provided.
                An AI agent would now send{' '}
                <span style={{ color: '#f59e0b', fontFamily: 'var(--font-code)' }}>{price != null ? String(price) : '0.001'} USDC</span>
                {' '}to{' '}
                <span style={{ color: 'var(--purple)', fontFamily: 'var(--font-code)', fontSize: 12 }}>
                  {payTo != null ? String(payTo) : '7UQctU...939D'}
                </span>
                {' '}on Solana devnet.
              </div>
              <button
                onClick={() => callEndpoint(true)}
                disabled={loading}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(239,68,68,0.4)',
                  borderRadius: 6,
                  padding: '7px 16px',
                  fontSize: 12,
                  fontFamily: 'var(--font-code)',
                  color: '#ef4444',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 150ms',
                  opacity: loading ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; e.currentTarget.style.background = 'transparent' }}
              >
                Now pay and retry →
              </button>
            </div>
          </div>
        )}

        {response && response.status === 200 && (
          <div style={{
            background: 'rgba(0,255,136,0.05)',
            border: '1px solid rgba(0,255,136,0.15)',
            borderRadius: 8,
            padding: 20,
            marginBottom: 16,
            display: 'flex',
            gap: 14,
            alignItems: 'flex-start',
          }}>
            <span style={{ color: 'var(--green)', fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>✓</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--green)', marginBottom: 6 }}>Payment accepted</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
                Gate402 verified the payment and released access to your API.
                This call was logged to your dashboard.
              </div>
              <a
                href="/dashboard"
                style={{ fontSize: 12, color: 'var(--green)', fontFamily: 'var(--font-code)', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
              >
                View in dashboard →
              </a>
            </div>
          </div>
        )}

        {/* Section 5 — Session History */}
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-code)', letterSpacing: '0.1em', marginBottom: 12 }}>
            SESSION HISTORY
          </div>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '24px 0', fontFamily: 'var(--font-code)' }}>
              No calls yet. Try calling an endpoint above.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {history.map((h, i) => h && (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 16px',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  fontSize: 13,
                }}>
                  <span style={{ fontFamily: 'var(--font-code)', color: 'var(--text-secondary)', flex: 1 }}>
                    {h.endpoint}
                  </span>
                  <StatusBadge status={h.status} />
                  <span style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: 'var(--text-muted)', minWidth: 48, textAlign: 'right' }}>
                    {h.timeMs}ms
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-code)',
                    fontSize: 11,
                    color: h.paid ? 'var(--green)' : '#ef4444',
                    minWidth: 44,
                    textAlign: 'right',
                  }}>
                    {h.paid ? 'paid' : 'blocked'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </PageContainer>
    </DashboardLayout>
  )
}

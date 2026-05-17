'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
import DashboardLayout from '../components/DashboardLayout'
import PageContainer from '../components/PageContainer'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'

const SERVER = process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://api.gate402.dev'
const MONO = 'var(--font-code)'
const SANS = 'var(--font-display)'

// ── Types ────────────────────────────────────────────────────────────────────

interface Endpoint { id: string; path: string; priceUsdc: number }

interface CallResult {
  status: number
  data: unknown
  headers: Record<string, string>
  timeMs: number
  endpoint: string
  method: string
  paid: boolean
  curlCmd: string
  timestamp: number
}

// ── Syntax highlight ──────────────────────────────────────────────────────────

function syntaxHighlight(json: string): React.ReactNode[] {
  return json.split('\n').map((line, i) => {
    const m = line.match(/^(\s*)("[\w\s]+")(: )(.*)/)
    if (m) {
      const [, indent, key, colon, val] = m
      const rawKey = key.replace(/"/g, '')
      let valueEl: React.ReactNode = val
      if (rawKey === 'error') {
        valueEl = <span style={{ color: '#ef4444' }}>{val}</span>
      } else if (rawKey === 'total' || rawKey === 'amount' || rawKey === 'price') {
        valueEl = <span style={{ color: '#f59e0b' }}>{val}</span>
      } else if (rawKey === 'currency' || rawKey === 'network') {
        valueEl = <span style={{ color: '#00bc7d' }}>{val}</span>
      } else if (val.startsWith('"')) {
        valueEl = <span style={{ color: '#a3e635' }}>{val}</span>
      } else if (!isNaN(Number(val.replace(',', '')))) {
        valueEl = <span style={{ color: '#f59e0b' }}>{val}</span>
      } else if (val === 'true,' || val === 'true' || val === 'false,' || val === 'false') {
        valueEl = <span style={{ color: '#f59e0b' }}>{val}</span>
      }
      return (
        <div key={i}>
          {indent}
          <span style={{ color: '#8b8b8b' }}>{key}</span>
          <span style={{ color: '#444' }}>{colon}</span>
          {valueEl}
        </div>
      )
    }
    return <div key={i} style={{ color: '#444' }}>{line}</div>
  })
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: number }) {
  const cfg =
    status === 200 ? { bg: 'rgba(0,188,125,0.1)', border: 'rgba(0,188,125,0.3)', color: '#00bc7d', label: '200 OK' }
    : status === 402 ? { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b', label: '402 Payment Required' }
    : status === 0 ? { bg: 'rgba(100,100,100,0.1)', border: 'rgba(100,100,100,0.3)', color: '#888', label: 'Error' }
    : { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', color: '#ef4444', label: `${status}` }
  return (
    <span style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, borderRadius: 4, padding: '3px 8px', fontSize: 11, fontFamily: MONO, fontWeight: 500, letterSpacing: '0.05em' }}>
      {cfg.label}
    </span>
  )
}

// ── Time ago ─────────────────────────────────────────────────────────────────

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  return `${Math.floor(s / 60)}m ago`
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PlaygroundPage() {
  const [supabaseId, setSupabaseId] = useState<string | null>(null)
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [selectedPath, setSelectedPath] = useState('')
  const [method, setMethod] = useState<'GET' | 'POST'>('GET')
  const [body, setBody] = useState('{\n  "key": "value"\n}')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<CallResult | null>(null)
  const [activeTab, setActiveTab] = useState<'response' | 'headers' | 'request'>('response')
  const [history, setHistory] = useState<CallResult[]>([])
  const [expandedHistory, setExpandedHistory] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [curlCopied, setCurlCopied] = useState(false)

  // Load user + endpoints
  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setSupabaseId(user.id)
      fetch(`${SERVER}/api/endpoints`, { headers: { 'x-user-id': user.id } })
        .then(r => r.ok ? r.json() : [])
        .then((eps: Endpoint[]) => {
          setEndpoints(eps)
          if (eps.length > 0) setSelectedPath(eps[0].path)
        })
        .catch(() => {})
    })
  }, [])

  const selectedEp = endpoints.find(e => e.path === selectedPath)

  async function callEndpoint(withPayment: boolean) {
    if (!selectedPath) return
    setLoading(true)
    const start = Date.now()
    const payloadHeader = withPayment ? `demo_playground_${Date.now()}` : undefined
    const curlParts = [
      `curl -s ${SERVER}${selectedPath}`,
      payloadHeader ? `  -H "X-Payment-Payload: ${payloadHeader}"` : null,
      supabaseId ? `  -H "x-user-id: ${supabaseId}"` : null,
      method === 'POST' ? `  -X POST` : null,
      method === 'POST' ? `  -H "Content-Type: application/json"` : null,
      method === 'POST' ? `  -d '${body}'` : null,
    ].filter(Boolean).join(' \\\n')

    try {
      const headers: Record<string, string> = {}
      if (payloadHeader) headers['X-Payment-Payload'] = payloadHeader
      if (supabaseId) headers['x-user-id'] = supabaseId
      if (method === 'POST') headers['Content-Type'] = 'application/json'

      const res = await fetch(`${SERVER}${selectedPath}`, {
        method,
        headers,
        body: method === 'POST' ? body : undefined,
      })

      const data = await res.json()
      const resHeaders: Record<string, string> = {}
      res.headers.forEach((v, k) => { resHeaders[k] = v })

      const result: CallResult = {
        status: res.status, data, headers: resHeaders,
        timeMs: Date.now() - start, endpoint: selectedPath,
        method, paid: withPayment, curlCmd: curlParts, timestamp: Date.now(),
      }
      setResponse(result)
      setActiveTab('response')
      setHistory(prev => [result, ...prev].slice(0, 20))
    } catch {
      const result: CallResult = {
        status: 0, data: { error: `Could not connect to ${SERVER}` }, headers: {},
        timeMs: Date.now() - start, endpoint: selectedPath,
        method, paid: false, curlCmd: curlParts, timestamp: Date.now(),
      }
      setResponse(result)
      setHistory(prev => [result, ...prev].slice(0, 20))
    } finally {
      setLoading(false)
    }
  }

  function copyResponse() {
    if (!response) return
    navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  function copyCurl() {
    if (!response) return
    navigator.clipboard.writeText(response.curlCmd)
    setCurlCopied(true); setTimeout(() => setCurlCopied(false), 2000)
  }

  const codeBlockStyle: React.CSSProperties = {
    background: '#000', border: '1px solid #1a1a1a', borderRadius: 8,
    padding: 20, fontFamily: MONO, fontSize: 13, lineHeight: 1.7,
    overflowX: 'auto', minHeight: 120,
  }

  return (
    <DashboardLayout>
      <PageContainer>
        <PageHeader
          eyebrow="PLAYGROUND"
          title="Test your API"
          subtitle="Simulate the full x402 payment flow without writing any code."
        />

        {/* ── Two-column layout ── */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 'var(--space-xl)' }}>

          {/* ── Left: control panel (400px) ── */}
          <div style={{ width: 400, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Card 1 — Endpoint selector */}
            <Card>
              <div style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Endpoint</div>
              <select
                value={selectedPath}
                onChange={e => setSelectedPath(e.target.value)}
                style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', fontSize: 13, color: 'var(--text-primary)', fontFamily: MONO, outline: 'none', cursor: 'pointer', appearance: 'none' }}
              >
                {endpoints.length === 0 && (
                  <option value="">No endpoints configured</option>
                )}
                {endpoints.map(ep => (
                  <option key={ep.id} value={ep.path}>{ep.path} — {ep.priceUsdc} USDC</option>
                ))}
              </select>
              {selectedEp && (
                <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 12, color: 'var(--green)' }}>
                  Price: {selectedEp.priceUsdc} USDC per call
                </div>
              )}
              {endpoints.length === 0 && (
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)', fontFamily: SANS }}>
                  <a href="/endpoints" style={{ color: 'var(--green)', textDecoration: 'none' }}>Add an endpoint →</a> to start testing.
                </div>
              )}
            </Card>

            {/* Card 2 — Method + body */}
            <Card>
              <div style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Method</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: method === 'POST' ? 16 : 0 }}>
                {(['GET', 'POST'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    style={{
                      padding: '7px 18px', borderRadius: 6, fontSize: 12, fontFamily: MONO,
                      border: method === m ? '1px solid var(--green)' : '1px solid var(--border)',
                      background: method === m ? 'rgba(0,188,125,0.08)' : 'var(--surface)',
                      color: method === m ? 'var(--green)' : 'var(--text-muted)',
                      cursor: 'pointer', fontWeight: method === m ? 600 : 400,
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {method === 'POST' && (
                <>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Request Body</div>
                  <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', background: '#000', border: '1px solid #1a1a1a', borderRadius: 6, padding: 12, fontSize: 13, color: '#ccc', fontFamily: MONO, lineHeight: 1.6, height: 120, resize: 'vertical', outline: 'none' }}
                    spellCheck={false}
                  />
                </>
              )}
            </Card>

            {/* Card 3 — Actions */}
            <Card>
              <button
                onClick={() => callEndpoint(false)}
                disabled={loading || !selectedPath}
                style={{ width: '100%', padding: '11px 0', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, color: loading ? 'var(--text-muted)' : 'var(--text-primary)', fontFamily: SANS, fontWeight: 500, cursor: loading || !selectedPath ? 'not-allowed' : 'pointer', opacity: !selectedPath ? 0.4 : 1, marginBottom: 8 }}
              >
                {loading ? 'Calling...' : 'Call without payment →'}
              </button>

              <div style={{ textAlign: 'center', fontSize: 11, color: '#333', fontFamily: MONO, marginBottom: 8 }}>or</div>

              <button
                onClick={() => callEndpoint(true)}
                disabled={loading || !selectedPath}
                style={{ width: '100%', padding: '11px 0', background: !selectedPath ? 'var(--surface)' : 'var(--green)', border: 'none', borderRadius: 6, fontSize: 13, color: '#000', fontFamily: SANS, fontWeight: 600, cursor: loading || !selectedPath ? 'not-allowed' : 'pointer', opacity: loading || !selectedPath ? 0.5 : 1 }}
              >
                {loading ? 'Paying...' : 'Pay and call →'}
              </button>
            </Card>
          </div>

          {/* ── Right: response viewer (flex-1) ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {!response ? (
              <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360, gap: 12 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                  <path d="M6 7h.01M10 7h8M6 11h.01M10 11h8" />
                </svg>
                <div style={{ fontSize: 14, color: '#333', fontFamily: MONO }}>No response yet</div>
                <div style={{ fontSize: 12, color: '#333', fontFamily: MONO, textAlign: 'center' }}>Click a button to simulate an agent call</div>
              </Card>
            ) : (
              <Card style={{ padding: 0 }}>
                {/* Response header */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <StatusBadge status={response.status} />
                    <span style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)' }}>{response.method} {response.endpoint}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: '#555' }}>{response.timeMs}ms</span>
                    <button onClick={copyResponse} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, color: copied ? 'var(--green)' : '#444', fontSize: 11, fontFamily: MONO, padding: '3px 10px', cursor: 'pointer' }}>
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px' }}>
                  {(['response', 'headers', 'request'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        background: 'none', border: 'none', padding: '10px 14px', fontSize: 12, fontFamily: MONO, cursor: 'pointer', textTransform: 'capitalize',
                        color: activeTab === tab ? '#fff' : '#444',
                        borderBottom: activeTab === tab ? '1px solid var(--green)' : '1px solid transparent',
                        marginBottom: -1,
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div style={{ padding: 20 }}>
                  {activeTab === 'response' && (
                    <div style={codeBlockStyle}>
                      {syntaxHighlight(JSON.stringify(response.data, null, 2))}
                    </div>
                  )}

                  {activeTab === 'headers' && (
                    <div style={codeBlockStyle}>
                      {Object.entries(response.headers).map(([k, v]) => (
                        <div key={k} style={{ marginBottom: 4 }}>
                          <span style={{ color: '#888', fontFamily: MONO, fontSize: 12 }}>{k}: </span>
                          <span style={{ color: '#ccc', fontFamily: MONO, fontSize: 12 }}>{v}</span>
                        </div>
                      ))}
                      {Object.keys(response.headers).length === 0 && (
                        <span style={{ color: '#444' }}>no headers captured</span>
                      )}
                    </div>
                  )}

                  {activeTab === 'request' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                        <button onClick={copyCurl} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, color: curlCopied ? 'var(--green)' : '#444', fontSize: 11, fontFamily: MONO, padding: '3px 10px', cursor: 'pointer' }}>
                          {curlCopied ? 'Copied' : 'Copy curl'}
                        </button>
                      </div>
                      <div style={codeBlockStyle}>
                        <pre style={{ margin: 0, color: '#ccc', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{response.curlCmd}</pre>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* ── Session History ── */}
        <div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Session History
          </div>

          {history.length === 0 ? (
            <div style={{ fontSize: 13, color: '#333', fontFamily: MONO, padding: '24px 0' }}>
              No calls yet. Try calling an endpoint above.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {history.map((h, i) => (
                <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                  {/* Collapsed row */}
                  <div
                    onClick={() => setExpandedHistory(expandedHistory === i ? null : i)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer', background: expandedHistory === i ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: h.status === 200 ? 'var(--green)' : '#f59e0b', flexShrink: 0 }} />
                    <span style={{ fontFamily: MONO, fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{h.endpoint}</span>
                    <span style={{
                      fontSize: 11, fontFamily: MONO, padding: '2px 8px', borderRadius: 20,
                      background: h.paid ? 'rgba(0,188,125,0.08)' : 'rgba(245,158,11,0.08)',
                      border: h.paid ? '1px solid rgba(0,188,125,0.2)' : '1px solid rgba(245,158,11,0.2)',
                      color: h.paid ? 'var(--green)' : '#f59e0b',
                    }}>
                      {h.paid ? 'paid' : 'unpaid'}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: '#555', minWidth: 40, textAlign: 'right' }}>{h.timeMs}ms</span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: '#444', minWidth: 70, textAlign: 'right' }}>{timeAgo(h.timestamp)}</span>
                  </div>

                  {/* Expanded content */}
                  {expandedHistory === i && (
                    <div style={{ padding: '0 16px 16px' }}>
                      <div style={codeBlockStyle}>
                        {syntaxHighlight(JSON.stringify(h.data, null, 2))}
                      </div>
                      <button
                        onClick={() => { setResponse(h); setActiveTab('response'); setExpandedHistory(null) }}
                        style={{ marginTop: 10, padding: '6px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, color: 'var(--text-muted)', fontFamily: SANS, cursor: 'pointer' }}
                      >
                        Use this response
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </PageContainer>
    </DashboardLayout>
  )
}

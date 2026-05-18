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
  statusText: string
  data: unknown
  headers: Record<string, string>
  timeMs: number
  endpoint: string
  method: string
  type: 'unpaid' | 'paid' | 'error'
  curlCmd: string
  timestamp: number
}

// ── JSON display with syntax highlight ───────────────────────────────────────

function JsonDisplay({ data }: { data: unknown }) {
  const json = JSON.stringify(data, null, 2)
  const highlighted = json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // keys
    .replace(/"([^"]+)":/g, '<span style="color:#7dd3fc">"$1":</span>')
    // string values
    .replace(/: "([^"]+)"/g, ': <span style="color:#86efac">"$1"</span>')
    // numbers
    .replace(/: (-?\d+\.?\d*)/g, ': <span style="color:#fcd34d">$1</span>')
    // booleans
    .replace(/: (true|false)/g, ': <span style="color:#f59e0b">$1</span>')
    // null
    .replace(/: (null)/g, ': <span style="color:#6b7280">$1</span>')
  return (
    <pre
      style={{ margin: 0, fontFamily: MONO, fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: number }) {
  const cfg =
    status === 200 ? { bg: 'rgba(0,188,125,0.1)', border: 'rgba(0,188,125,0.3)', color: '#00bc7d', label: '200 OK' }
    : status === 402 ? { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b', label: '402 Payment Required' }
    : status === 0 ? { bg: 'rgba(100,100,100,0.1)', border: 'rgba(100,100,100,0.3)', color: '#888', label: 'Error' }
    : { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', color: '#ef4444', label: `${status}` }
  return (
    <span style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, borderRadius: 4, padding: '3px 8px', fontSize: 11, fontFamily: MONO, fontWeight: 500, }}>
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
  const [loading, setLoading] = useState<'unpaid' | 'paid' | null>(null)
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

  async function callWithoutPayment() {
    if (!selectedPath) return
    setLoading('unpaid')
    setActiveTab('response')
    const start = Date.now()
    const url = `${SERVER}${selectedPath}`
    const curlCmd = [
      `curl ${url}`,
      method === 'POST' ? `  -X POST` : null,
      method === 'POST' ? `  -H "Content-Type: application/json"` : null,
      method === 'POST' && body ? `  -d '${body}'` : null,
    ].filter(Boolean).join(' \\\n')

    try {
      const headers: Record<string, string> = {}
      if (method === 'POST' && body) headers['Content-Type'] = 'application/json'
      const res = await fetch(url, { method, headers, body: method === 'POST' ? body : undefined })
      const data = await res.json()
      const resHeaders: Record<string, string> = {}
      res.headers.forEach((v, k) => { resHeaders[k] = v })
      const result: CallResult = {
        status: res.status, statusText: res.statusText, data, headers: resHeaders,
        timeMs: Date.now() - start, endpoint: selectedPath, method,
        type: 'unpaid', curlCmd, timestamp: Date.now(),
      }
      setResponse(result)
      setHistory(prev => [result, ...prev].slice(0, 20))
    } catch (e: unknown) {
      const result: CallResult = {
        status: 0, statusText: 'Network Error',
        data: { error: (e as Error).message ?? `Could not connect to ${SERVER}` },
        headers: {}, timeMs: Date.now() - start, endpoint: selectedPath, method,
        type: 'error', curlCmd, timestamp: Date.now(),
      }
      setResponse(result)
      setHistory(prev => [result, ...prev].slice(0, 20))
    } finally {
      setLoading(null)
    }
  }

  async function payAndCall() {
    if (!selectedPath) return
    setLoading('paid')
    setActiveTab('response')
    const start = Date.now()
    const demoHash = `demo_playground_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const url = `${SERVER}${selectedPath}`

    // Fetch apiKey for the logged-in user
    let apiKey = ''
    if (supabaseId) {
      try {
        const meRes = await fetch(`${SERVER}/api/users/me`, { headers: { 'x-user-id': supabaseId } })
        if (meRes.ok) { const me = await meRes.json(); apiKey = me.apiKey ?? '' }
      } catch { /* ignore */ }
    }

    const curlCmd = [
      `curl ${url}`,
      `  -H "X-Payment-Payload: ${demoHash}"`,
      apiKey ? `  -H "x-api-key: ${apiKey}"` : null,
      method === 'POST' ? `  -X POST` : null,
      method === 'POST' ? `  -H "Content-Type: application/json"` : null,
      method === 'POST' && body ? `  -d '${body}'` : null,
    ].filter(Boolean).join(' \\\n')

    try {
      const headers: Record<string, string> = { 'X-Payment-Payload': demoHash }
      if (apiKey) headers['x-api-key'] = apiKey
      if (method === 'POST' && body) headers['Content-Type'] = 'application/json'
      const res = await fetch(url, { method, headers, body: method === 'POST' ? body : undefined })
      const data = await res.json()
      const resHeaders: Record<string, string> = {}
      res.headers.forEach((v, k) => { resHeaders[k] = v })
      const result: CallResult = {
        status: res.status, statusText: res.statusText, data, headers: resHeaders,
        timeMs: Date.now() - start, endpoint: selectedPath, method,
        type: 'paid', curlCmd, timestamp: Date.now(),
      }
      setResponse(result)
      setHistory(prev => [result, ...prev].slice(0, 20))
    } catch (e: unknown) {
      const result: CallResult = {
        status: 0, statusText: 'Network Error',
        data: { error: (e as Error).message ?? `Could not connect to ${SERVER}` },
        headers: {}, timeMs: Date.now() - start, endpoint: selectedPath, method,
        type: 'error', curlCmd, timestamp: Date.now(),
      }
      setResponse(result)
      setHistory(prev => [result, ...prev].slice(0, 20))
    } finally {
      setLoading(null)
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
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8,
    padding: 20, fontFamily: MONO, fontSize: 13, lineHeight: 1.7,
    overflowX: 'auto', minHeight: 120,
  }

  return (
    <DashboardLayout>
      <PageContainer>
        <PageHeader
          eyebrow="Playground"
          title="Test your API"
          subtitle="Simulate the full x402 payment flow without writing any code."
        />

        {/* ── Two-column layout ── */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 'var(--space-xl)' }}>

          {/* ── Left: control panel (400px) ── */}
          <div style={{ width: 400, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Card 1 — Endpoint selector */}
            <Card>
              <div style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>Endpoint</div>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedPath}
                  onChange={e => setSelectedPath(e.target.value)}
                  style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 36px 9px 12px', fontSize: 13, color: 'var(--text-primary)', fontFamily: MONO, outline: 'none', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                >
                  {endpoints.length === 0 && (
                    <option value="">No endpoints configured</option>
                  )}
                  {endpoints.map(ep => (
                    <option key={ep.id} value={ep.path}>{ep.path} — {ep.priceUsdc} USDC</option>
                  ))}
                </select>
                <svg
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  width="14" height="14" viewBox="0 0 14 14" fill="none"
                >
                  <path d="M3 5l4 4 4-4" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
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
              <div style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>Method</div>
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
                  <div style={{ fontFamily: MONO, fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Request Body</div>
                  <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: 12, fontSize: 13, color: 'var(--text-primary)', fontFamily: MONO, lineHeight: 1.6, height: 120, resize: 'vertical', outline: 'none' }}
                    spellCheck={false}
                  />
                </>
              )}
            </Card>

            {/* Card 3 — Actions */}
            <Card>
              <button
                onClick={callWithoutPayment}
                disabled={loading !== null || !selectedPath}
                style={{ width: '100%', padding: '11px 0', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, color: loading ? 'var(--text-muted)' : 'var(--text-primary)', fontFamily: SANS, fontWeight: 500, cursor: loading !== null || !selectedPath ? 'not-allowed' : 'pointer', opacity: !selectedPath ? 0.4 : 1, marginBottom: 8 }}
              >
                {loading === 'unpaid' ? 'Calling...' : 'Call without payment →'}
              </button>

              <div style={{ textAlign: 'center', fontSize: 11, color: '#333', fontFamily: MONO, marginBottom: 8 }}>or</div>

              <button
                onClick={payAndCall}
                disabled={loading !== null || !selectedPath}
                style={{ width: '100%', padding: '11px 0', background: !selectedPath ? 'var(--surface)' : 'var(--green)', border: 'none', borderRadius: 6, fontSize: 13, color: '#000', fontFamily: SANS, fontWeight: 600, cursor: loading !== null || !selectedPath ? 'not-allowed' : 'pointer', opacity: loading !== null || !selectedPath ? 0.5 : 1 }}
              >
                {loading === 'paid' ? 'Paying...' : 'Pay and call →'}
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
                      <JsonDisplay data={response.data} />
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
          <div style={{ fontFamily: MONO, fontSize: 11, color: '#333', marginBottom: 12 }}>
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
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: h.status === 200 ? 'var(--green)' : h.status === 402 ? '#f59e0b' : '#888', flexShrink: 0 }} />
                    <span style={{ fontFamily: MONO, fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{h.endpoint}</span>
                    <span style={{
                      fontSize: 11, fontFamily: MONO, padding: '2px 8px', borderRadius: 20,
                      background: h.type === 'paid' ? 'rgba(0,188,125,0.08)' : 'rgba(245,158,11,0.08)',
                      border: h.type === 'paid' ? '1px solid rgba(0,188,125,0.2)' : '1px solid rgba(245,158,11,0.2)',
                      color: h.type === 'paid' ? 'var(--green)' : '#f59e0b',
                    }}>
                      {h.type === 'paid' ? 'paid' : 'unpaid'}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: '#555', minWidth: 40, textAlign: 'right' }}>{h.timeMs}ms</span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: '#444', minWidth: 70, textAlign: 'right' }}>{timeAgo(h.timestamp)}</span>
                  </div>

                  {/* Expanded content */}
                  {expandedHistory === i && (
                    <div style={{ padding: '0 16px 16px' }}>
                      <div style={codeBlockStyle}>
                        <JsonDisplay data={h.data} />
                      </div>
                      <button
                        onClick={() => { setResponse(h); setActiveTab('response'); setExpandedHistory(null); }}
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

'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
import DashboardLayout from '../components/DashboardLayout'
import PageHeader from '../components/PageHeader'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'

const SERVER = process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://api.gate402.dev'
const MONO = 'var(--font-code)'
const SANS = 'var(--font-display)'

interface Endpoint { id: string; path: string; priceUsdc: number }
interface CallResult {
  status: number; statusText: string; data: unknown
  headers: Record<string, string>; timeMs: number
  endpoint: string; method: string; type: 'unpaid' | 'paid' | 'error'
  curlCmd: string; timestamp: number
}

function JsonDisplay({ data }: { data: unknown }) {
  const json = JSON.stringify(data, null, 2)
  const highlighted = json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"([^"]+)":/g, '<span style="color:#7dd3fc">"$1":</span>')
    .replace(/: "([^"]+)"/g, ': <span style="color:#86efac">"$1"</span>')
    .replace(/: (-?\d+\.?\d*)/g, ': <span style="color:#fcd34d">$1</span>')
    .replace(/: (true|false)/g, ': <span style="color:#f59e0b">$1</span>')
    .replace(/: (null)/g, ': <span style="color:#6b7280">$1</span>')
  return <pre style={{ margin: 0, fontFamily: MONO, fontSize: 12, lineHeight: 1.7, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }} dangerouslySetInnerHTML={{ __html: highlighted }} />
}

function StatusBadge({ status }: { status: number }) {
  const cfg = status === 200
    ? { bg: 'rgba(0,188,125,0.1)', border: 'rgba(0,188,125,0.3)', color: '#00bc7d', label: '200 OK' }
    : status === 402
    ? { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b', label: '402 Payment Required' }
    : status === 0
    ? { bg: 'rgba(100,100,100,0.1)', border: 'rgba(100,100,100,0.3)', color: '#888', label: 'Error' }
    : { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', color: '#ef4444', label: String(status) }
  return <span style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontFamily: MONO, fontWeight: 500 }}>{cfg.label}</span>
}

const METHOD_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  GET:  { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.2)' },
  POST: { color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.2)' },
}

function MethodBadge({ method }: { method: string }) {
  const cfg = METHOD_COLORS[method] ?? METHOD_COLORS.GET
  return <span style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontFamily: MONO, fontWeight: 600 }}>{method}</span>
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  return `${Math.floor(s / 60)}m ago`
}

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

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setSupabaseId(user.id)
      fetch(`${SERVER}/api/endpoints`, { headers: { 'x-user-id': user.id } })
        .then(r => r.ok ? r.json() : [])
        .then((eps: Endpoint[]) => { setEndpoints(eps); if (eps.length > 0) setSelectedPath(eps[0].path) })
        .catch(() => {})
    })
  }, [])

  const selectedEp = endpoints.find(e => e.path === selectedPath)
  const hasBody = method === 'POST'

  async function doCall(paid: boolean) {
    if (!selectedPath) return
    setLoading(paid ? 'paid' : 'unpaid')
    setActiveTab('response')
    const start = Date.now()
    const url = `${SERVER}${selectedPath}`
    let apiKey = ''
    if (paid && supabaseId) {
      try {
        const meRes = await fetch(`${SERVER}/api/users/me`, { headers: { 'x-user-id': supabaseId } })
        if (meRes.ok) { const me = await meRes.json(); apiKey = me.apiKey ?? '' }
      } catch { /* ignore */ }
    }
    const demoHash = paid ? `demo_playground_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` : ''
    const curlParts: (string | null)[] = [
      `curl ${url}`,
      paid ? `  -H "X-Payment-Payload: ${demoHash}"` : null,
      paid && apiKey ? `  -H "x-api-key: ${apiKey}"` : null,
      method !== 'GET' ? `  -X ${method}` : null,
      hasBody ? `  -H "Content-Type: application/json"` : null,
      hasBody && body ? `  -d '${body}'` : null,
    ]
    const curlCmd = curlParts.filter(Boolean).join(' \\\n')
    try {
      const headers: Record<string, string> = {}
      if (paid) { headers['X-Payment-Payload'] = demoHash; if (apiKey) headers['x-api-key'] = apiKey }
      if (hasBody && body) headers['Content-Type'] = 'application/json'
      const res = await fetch(url, { method, headers, body: hasBody ? body : undefined })
      const data = await res.json()
      const resHeaders: Record<string, string> = {}
      res.headers.forEach((v, k) => { resHeaders[k] = v })
      const result: CallResult = { status: res.status, statusText: res.statusText, data, headers: resHeaders, timeMs: Date.now() - start, endpoint: selectedPath, method, type: paid ? 'paid' : 'unpaid', curlCmd, timestamp: Date.now() }
      setResponse(result); setHistory(prev => [result, ...prev].slice(0, 20))
    } catch (e: unknown) {
      const result: CallResult = { status: 0, statusText: 'Network Error', data: { error: (e as Error).message }, headers: {}, timeMs: Date.now() - start, endpoint: selectedPath, method, type: 'error', curlCmd, timestamp: Date.now() }
      setResponse(result); setHistory(prev => [result, ...prev].slice(0, 20))
    } finally { setLoading(null) }
  }

  const panelBox: React.CSSProperties = { background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 10, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '32px 32px 24px', gap: 20, boxSizing: 'border-box' }}>

        <PageHeader title="Playground" subtitle="Simulate the full x402 payment flow without writing any code." />

        <div style={{ flex: 1, minHeight: 0 }}>
          <PanelGroup direction="horizontal" style={{ height: '100%' }}>

            {/* LEFT CONFIG PANEL */}
            <Panel defaultSize={36} minSize={26}>
              <div style={panelBox}>

                {/* Method + endpoint */}
                <div style={{ padding: '16px 16px 0', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ display: 'flex', background: '#111', border: '1px solid #1a1a1a', borderRadius: 6, padding: 2, flexShrink: 0 }}>
                    {(['GET', 'POST'] as const).map(m => (
                      <button key={m} onClick={() => setMethod(m)}
                        style={{ padding: '6px 14px', borderRadius: 4, border: 'none', cursor: 'pointer', fontFamily: MONO, fontSize: 12, fontWeight: 600, transition: 'all 150ms',
                          background: method === m ? METHOD_COLORS[m].bg : 'transparent',
                          color: method === m ? METHOD_COLORS[m].color : '#444',
                          outline: method === m ? `1px solid ${METHOD_COLORS[m].border}` : 'none',
                        }}>
                        {m}
                      </button>
                    ))}
                  </div>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <select value={selectedPath} onChange={e => setSelectedPath(e.target.value)}
                      style={{ width: '100%', background: '#111', border: '1px solid #1a1a1a', borderRadius: 6, padding: '8px 32px 8px 12px', fontSize: 13, color: '#ccc', fontFamily: MONO, outline: 'none', cursor: 'pointer', appearance: 'none' }}>
                      {endpoints.length === 0 && <option value="">No endpoints configured</option>}
                      {endpoints.map(ep => <option key={ep.id} value={ep.path}>{ep.path}</option>)}
                    </select>
                    <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round"><path d="M2 4l4 4 4-4"/></svg>
                  </div>
                </div>

                <div style={{ padding: '8px 16px 12px' }}>
                  {selectedEp
                    ? <span style={{ fontFamily: MONO, fontSize: 11, color: '#00bc7d' }}>{selectedEp.priceUsdc} USDC / call</span>
                    : <a href="/endpoints" style={{ fontFamily: MONO, fontSize: 11, color: '#00bc7d' }}>Add an endpoint →</a>}
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #1a1a1a', padding: '0 16px' }}>
                  {(['response', 'headers', 'request'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      style={{ background: 'none', border: 'none', padding: '8px 12px', fontSize: 12, fontFamily: MONO, cursor: 'pointer', color: activeTab === tab ? '#fff' : '#444', borderBottom: activeTab === tab ? '2px solid #00bc7d' : '2px solid transparent', marginBottom: -1 }}>
                      {tab === 'response' ? 'Response' : tab === 'headers' ? 'Headers' : 'cURL'}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 16, minHeight: 0 }}>
                  {activeTab === 'response' && !response && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10, color: '#2a2a2a' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 8l2 2-2 2M11 10h4"/></svg>
                      <span style={{ fontFamily: MONO, fontSize: 12 }}>No response yet</span>
                    </div>
                  )}
                  {activeTab === 'response' && response && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                        <StatusBadge status={response.status} />
                        <MethodBadge method={response.method} />
                        <span style={{ fontFamily: MONO, fontSize: 11, color: '#444' }}>{response.timeMs}ms</span>
                        <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(response.data, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                          style={{ marginLeft: 'auto', background: 'none', border: '1px solid #1a1a1a', borderRadius: 4, color: copied ? '#00bc7d' : '#444', fontSize: 11, fontFamily: MONO, padding: '3px 10px', cursor: 'pointer' }}>
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 8, padding: 14 }}>
                        <JsonDisplay data={response.data} />
                      </div>
                    </div>
                  )}
                  {activeTab === 'headers' && !response && <div style={{ color: '#2a2a2a', fontFamily: MONO, fontSize: 12 }}>Make a request to see headers</div>}
                  {activeTab === 'headers' && response && (
                    <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 8, padding: 14 }}>
                      {Object.entries(response.headers).map(([k, v]) => (
                        <div key={k} style={{ marginBottom: 6 }}><span style={{ color: '#555', fontFamily: MONO, fontSize: 12 }}>{k}: </span><span style={{ color: '#aaa', fontFamily: MONO, fontSize: 12 }}>{v}</span></div>
                      ))}
                      {Object.keys(response.headers).length === 0 && <span style={{ color: '#333', fontFamily: MONO, fontSize: 12 }}>no headers captured</span>}
                    </div>
                  )}
                  {activeTab === 'request' && !response && <div style={{ color: '#2a2a2a', fontFamily: MONO, fontSize: 12 }}>Make a request to see the cURL</div>}
                  {activeTab === 'request' && response && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                        <button onClick={() => { navigator.clipboard.writeText(response.curlCmd); setCurlCopied(true); setTimeout(() => setCurlCopied(false), 2000) }}
                          style={{ background: 'none', border: '1px solid #1a1a1a', borderRadius: 4, color: curlCopied ? '#00bc7d' : '#444', fontSize: 11, fontFamily: MONO, padding: '3px 10px', cursor: 'pointer' }}>
                          {curlCopied ? 'Copied' : 'Copy cURL'}
                        </button>
                      </div>
                      <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 8, padding: 14 }}>
                        <pre style={{ margin: 0, color: '#aaa', fontFamily: MONO, fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{response.curlCmd}</pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Body */}
                {hasBody && (
                  <div style={{ padding: '0 16px 12px', borderTop: '1px solid #111' }}>
                    <div style={{ fontFamily: MONO, fontSize: 11, color: '#444', fontWeight: 500, marginBottom: 8, marginTop: 12 }}>Request body</div>
                    <textarea value={body} onChange={e => setBody(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 6, padding: 12, fontSize: 12, color: '#ccc', fontFamily: MONO, lineHeight: 1.6, height: 90, resize: 'vertical', outline: 'none' }}
                      spellCheck={false} />
                  </div>
                )}

                {/* Actions */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid #1a1a1a', display: 'flex', gap: 8 }}>
                  <button onClick={() => doCall(false)} disabled={loading !== null || !selectedPath}
                    style={{ flex: 1, padding: '10px 0', background: 'transparent', border: '1px solid #1a1a1a', borderRadius: 6, fontSize: 13, color: loading ? '#333' : '#666', fontFamily: SANS, fontWeight: 500, cursor: loading !== null || !selectedPath ? 'not-allowed' : 'pointer', opacity: !selectedPath ? 0.4 : 1, transition: 'all 150ms' }}
                    onMouseEnter={e => { if (!loading && selectedPath) { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#fff' } }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.color = loading ? '#333' : '#666' }}>
                    {loading === 'unpaid' ? 'Calling...' : 'Call free'}
                  </button>
                  <button onClick={() => doCall(true)} disabled={loading !== null || !selectedPath}
                    style={{ flex: 1, padding: '10px 0', background: !selectedPath ? '#0d0d0d' : '#00bc7d', border: 'none', borderRadius: 6, fontSize: 13, color: '#000', fontFamily: SANS, fontWeight: 600, cursor: loading !== null || !selectedPath ? 'not-allowed' : 'pointer', opacity: loading !== null || !selectedPath ? 0.4 : 1, transition: 'opacity 150ms' }}>
                    {loading === 'paid' ? 'Paying...' : 'Pay & call \u2192'}
                  </button>
                </div>
              </div>
            </Panel>

            <PanelResizeHandle style={{ width: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'col-resize', flexShrink: 0 }}>
              <div style={{ width: 2, height: 40, background: '#1a1a1a', borderRadius: 2 }} />
            </PanelResizeHandle>

            {/* RIGHT PANELS */}
            <Panel defaultSize={64} minSize={35}>
              <PanelGroup direction="vertical" style={{ height: '100%' }}>

                <Panel defaultSize={history.length > 0 ? 65 : 100} minSize={40}>
                  <div style={panelBox}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: '#555', fontWeight: 500 }}>Response</span>
                      {response && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <StatusBadge status={response.status} />
                          <MethodBadge method={response.method} />
                          <span style={{ fontFamily: MONO, fontSize: 11, color: '#444' }}>{response.timeMs}ms</span>
                          <span style={{ fontFamily: MONO, fontSize: 11, color: '#2a2a2a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{response.endpoint}</span>
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                      {!response ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: '#1e1e1e' }}>
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 8l2 2-2 2M11 10h4"/></svg>
                          <span style={{ fontFamily: MONO, fontSize: 12 }}>Click a button to simulate an agent call</span>
                        </div>
                      ) : (
                        <JsonDisplay data={response.data} />
                      )}
                    </div>
                  </div>
                </Panel>

                {history.length > 0 && (
                  <>
                    <PanelResizeHandle style={{ height: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'row-resize', flexShrink: 0 }}>
                      <div style={{ height: 2, width: 40, background: '#1a1a1a', borderRadius: 2 }} />
                    </PanelResizeHandle>
                    <Panel defaultSize={35} minSize={18}>
                      <div style={panelBox}>
                        <div style={{ padding: '10px 16px', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontFamily: MONO, fontSize: 11, color: '#555', fontWeight: 500 }}>Session history</span>
                          <span style={{ fontFamily: MONO, fontSize: 11, color: '#333' }}>{history.length} call{history.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                          {history.map((h, i) => (
                            <div key={i}>
                              <div onClick={() => setExpandedHistory(expandedHistory === i ? null : i)}
                                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', cursor: 'pointer', borderBottom: '1px solid #111', background: expandedHistory === i ? '#0f0f0f' : 'transparent', transition: 'background 100ms' }}
                                onMouseEnter={e => { if (expandedHistory !== i) e.currentTarget.style.background = '#0a0a0a' }}
                                onMouseLeave={e => { if (expandedHistory !== i) e.currentTarget.style.background = 'transparent' }}>
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: h.status === 200 ? '#00bc7d' : h.status === 402 ? '#f59e0b' : '#555', flexShrink: 0 }} />
                                <MethodBadge method={h.method} />
                                <span style={{ fontFamily: MONO, fontSize: 12, color: '#666', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.endpoint}</span>
                                <span style={{ fontFamily: MONO, fontSize: 11, color: h.type === 'paid' ? '#00bc7d' : '#f59e0b', flexShrink: 0 }}>{h.type}</span>
                                <span style={{ fontFamily: MONO, fontSize: 11, color: '#333', flexShrink: 0 }}>{h.timeMs}ms</span>
                                <span style={{ fontFamily: MONO, fontSize: 11, color: '#222', flexShrink: 0, minWidth: 56, textAlign: 'right' }}>{timeAgo(h.timestamp)}</span>
                              </div>
                              {expandedHistory === i && (
                                <div style={{ padding: '12px 16px', background: '#0a0a0a', borderBottom: '1px solid #111' }}>
                                  <div style={{ background: '#000', border: '1px solid #1a1a1a', borderRadius: 6, padding: 12, marginBottom: 8 }}>
                                    <JsonDisplay data={h.data} />
                                  </div>
                                  <button onClick={() => { setResponse(h); setActiveTab('response'); setExpandedHistory(null) }}
                                    style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #1a1a1a', borderRadius: 5, fontSize: 12, color: '#555', fontFamily: SANS, cursor: 'pointer' }}>
                                    Use this response
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </Panel>
                  </>
                )}
              </PanelGroup>
            </Panel>

          </PanelGroup>
        </div>
      </div>
    </DashboardLayout>
  )
}


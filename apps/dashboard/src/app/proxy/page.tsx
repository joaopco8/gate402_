'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { useUser } from '../../contexts/UserContext'

const MONO = "'Geist Mono', monospace"
const SANS = "'Geist Mono', monospace"

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'

const CATEGORIES = ['data', 'ai', 'media', 'finance', 'other']

function makeAuthHeader(accessToken: string | null): Record<string, string> {
  if (accessToken) return { Authorization: `Bearer ${accessToken}` }
  return {}
}

interface ProxyEndpoint {
  id: string
  slug: string
  name: string
  description?: string
  longDescription?: string
  category: string
  targetUrl: string
  pricePerCall: number
  totalCalls: number
  totalEarned: number
  lastCallAt?: string
  isPublic: boolean
  isActive: boolean
  avatarEmoji?: string
  avatarColor?: string
  avatarImage?: string
  tags?: string[]
  docsUrl?: string
  methods?: string[]
  responseExample?: string
  createdAt: string
}

const MAX_IMAGE_BYTES = 512 * 1024 // 512KB

export default function ProxyPage() {
  const [endpoints, setEndpoints] = useState<ProxyEndpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [copied, setCopied] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editEp, setEditEp] = useState<ProxyEndpoint | null>(null)
  const [editForm, setEditForm] = useState<typeof form | null>(null)
  const [editTagInput, setEditTagInput] = useState('')
  const [editAvatarImage, setEditAvatarImage] = useState<string | null>(null)
  const [editImageError, setEditImageError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const { userData, accessToken, loading: authLoading } = useUser()

  const isPro = userData?.plan === 'pro' || userData?.plan === 'enterprise'
  const atLimit = !isPro && endpoints.length >= 3

  const [form, setForm] = useState({
    name: '',
    description: '',
    longDescription: '',
    category: 'data',
    targetUrl: '',
    pricePerCall: '0.001',
    targetApiKey: '',
    isPublic: true,
    tags: [] as string[],
    docsUrl: '',
    methods: ['GET'] as string[],
    responseExample: '',
  })
  const [avatarImage, setAvatarImage] = useState<string | null>(null)
  const [imageError, setImageError] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const publicUrl = (slug: string) =>
    `${SERVER_URL.replace('localhost:3001', 'api.gate402.dev')}/p/${slug}`

  useEffect(() => {
    if (!authLoading && accessToken) fetchEndpoints()
  }, [authLoading, accessToken])

  async function fetchEndpoints() {
    try {
      const headers = makeAuthHeader(accessToken)
      const res = await fetch(`${SERVER_URL}/api/proxy-endpoints`, { headers })
      const data = await res.json()
      setEndpoints(data.endpoints || [])
    } catch {
      setEndpoints([])
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    setCreating(true)
    setError('')
    try {
      const headers = { 'Content-Type': 'application/json', ...(makeAuthHeader(accessToken)) }
      const res = await fetch(`${SERVER_URL}/api/proxy-endpoints`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...form,
          pricePerCall: Number(form.pricePerCall),
          targetApiKey: form.targetApiKey || undefined,
          avatarImage: avatarImage || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create endpoint')
        return
      }
      setEndpoints((e) => [data.endpoint, ...e])
      setCreateOpen(false)
      setForm({
        name: '',
        description: '',
        longDescription: '',
        category: 'data',
        targetUrl: '',
        pricePerCall: '0.001',
        targetApiKey: '',
        isPublic: true,
        tags: [],
        docsUrl: '',
        methods: ['GET'],
        responseExample: '',
      })
      setAvatarImage(null)
      setImageError('')
      setTagInput('')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string) {
    const headers = makeAuthHeader(accessToken)
    await fetch(`${SERVER_URL}/api/proxy-endpoints/${id}`, {
      method: 'DELETE',
      headers,
    })
    setEndpoints((e) => e.filter((x) => x.id !== id))
    setDeleteConfirm(null)
  }

  function openEdit(ep: ProxyEndpoint) {
    setEditEp(ep)
    setEditAvatarImage(ep.avatarImage || null)
    setEditImageError('')
    setEditTagInput('')
    setSaveError('')
    setEditForm({
      name: ep.name,
      description: ep.description ?? '',
      longDescription: ep.longDescription ?? '',
      category: ep.category,
      targetUrl: ep.targetUrl,
      pricePerCall: ep.pricePerCall.toString(),
      targetApiKey: '',
      isPublic: ep.isPublic,
      tags: ep.tags ?? [],
      docsUrl: ep.docsUrl ?? '',
      methods: ep.methods ?? ['GET'],
      responseExample: ep.responseExample ?? '',
    })
  }

  async function handleUpdate() {
    if (!editEp || !editForm) return
    setSaving(true)
    setSaveError('')
    try {
      const headers = { 'Content-Type': 'application/json', ...(makeAuthHeader(accessToken)) }
      const res = await fetch(`${SERVER_URL}/api/proxy-endpoints/${editEp.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          ...editForm,
          pricePerCall: Number(editForm.pricePerCall),
          targetApiKey: editForm.targetApiKey || undefined,
          avatarImage: editAvatarImage || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setSaveError(data.error || 'Failed to save'); return }
      setEndpoints(prev => prev.map(e => e.id === editEp.id ? { ...e, ...data.endpoint } : e))
      setEditEp(null)
      setEditForm(null)
    } catch {
      setSaveError('Network error. Try again.')
    } finally {
      setSaving(false)
    }
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#111311',
    border: '1px solid #2A2E2A',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    color: '#E8F4EE',
    fontFamily: MONO,
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    color: '#7A8C79',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 6,
    fontFamily: SANS,
  }

  return (
    <DashboardLayout>

      {/* ── Edit Modal ── */}
      {editEp && editForm && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', overflowY: 'auto', padding: '40px 16px' }}
          onClick={e => { if (e.target === e.currentTarget) { setEditEp(null); setEditForm(null) } }}
        >
          <div style={{ background: '#1F221F', border: '1px solid #2A2E2A', borderRadius: 12, width: 600, maxWidth: '100%', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#E8F4EE', fontFamily: SANS }}>Edit — {editEp.name}</span>
              <button onClick={() => { setEditEp(null); setEditForm(null) }} style={{ background: 'none', border: 'none', color: '#4A5549', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
            </div>

            {/* Avatar */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Image (optional · max 512KB)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', flexShrink: 0, border: '1px solid #2A2E2A', background: '#111311' }}>
                  <img src={editAvatarImage || '/icon-api.jpg'} alt="preview" style={{ width: 56, height: 56, objectFit: 'cover', display: 'block' }} />
                </div>
                <label style={{ display: 'inline-block', padding: '7px 14px', fontSize: 12, border: '1px solid #2A2E2A', borderRadius: 8, cursor: 'pointer', color: '#7A8C79', fontFamily: MONO, background: '#111311' }}>
                  Choose image
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" style={{ display: 'none' }} onChange={e => {
                    setEditImageError('')
                    const file = e.target.files?.[0]
                    if (!file) return
                    if (file.size > MAX_IMAGE_BYTES) { setEditImageError(`Too large (${(file.size/1024).toFixed(0)}KB). Max 512KB.`); e.target.value = ''; return }
                    const reader = new FileReader()
                    reader.onload = ev => setEditAvatarImage(ev.target?.result as string)
                    reader.readAsDataURL(file)
                  }} />
                </label>
                {editAvatarImage && <button onClick={() => setEditAvatarImage(null)} style={{ background: 'none', border: 'none', color: '#4A5549', cursor: 'pointer', fontSize: 12, fontFamily: MONO }}>Remove</button>}
                {editImageError && <p style={{ fontSize: 11, color: '#f87171', fontFamily: MONO, margin: 0 }}>{editImageError}</p>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Name *</label>
                <input style={inputStyle} value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select style={inputStyle} value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Target URL *</label>
              <input style={inputStyle} value={editForm.targetUrl} onChange={e => setEditForm({ ...editForm, targetUrl: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Price per call (USDC)</label>
                <input style={inputStyle} type="number" step="0.001" value={editForm.pricePerCall} onChange={e => setEditForm({ ...editForm, pricePerCall: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>New API key (optional)</label>
                <input style={inputStyle} type="password" placeholder="Leave blank to keep current" value={editForm.targetApiKey} onChange={e => setEditForm({ ...editForm, targetApiKey: e.target.value })} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Description</label>
              <input style={inputStyle} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Accepted Methods</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(method => (
                  <button key={method} onClick={() => {
                    const next = editForm.methods.includes(method) ? editForm.methods.filter(m => m !== method) : [...editForm.methods, method]
                    setEditForm({ ...editForm, methods: next })
                  }} style={{
                    padding: '5px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                    border: editForm.methods.includes(method) ? '1px solid #7AF279' : '1px solid #2A2E2A',
                    background: editForm.methods.includes(method) ? 'rgba(122,242,121,0.06)' : 'transparent',
                    color: editForm.methods.includes(method) ? '#7AF279' : '#4A5549',
                    fontFamily: MONO,
                  }}>{method}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Tags</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {editForm.tags.map(tag => (
                  <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(122,242,121,0.08)', border: '1px solid rgba(122,242,121,0.2)', borderRadius: 6, padding: '3px 8px', fontSize: 12, color: '#7AF279' }}>
                    {tag}
                    <button onClick={() => setEditForm({ ...editForm, tags: editForm.tags.filter(t => t !== tag) })} style={{ background: 'none', border: 'none', color: '#7AF279', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
                  </span>
                ))}
              </div>
              <input style={inputStyle} placeholder="Add tag (press Enter)" value={editTagInput} onChange={e => setEditTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && editTagInput.trim()) {
                    e.preventDefault()
                    if (!editForm.tags.includes(editTagInput.trim())) setEditForm({ ...editForm, tags: [...editForm.tags, editTagInput.trim()] })
                    setEditTagInput('')
                  }
                }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Documentation URL (optional)</label>
              <input style={inputStyle} value={editForm.docsUrl} onChange={e => setEditForm({ ...editForm, docsUrl: e.target.value })} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Response Example (JSON)</label>
              <textarea style={{ ...inputStyle, resize: 'vertical' as const }} value={editForm.responseExample} onChange={e => setEditForm({ ...editForm, responseExample: e.target.value })} rows={4} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <button onClick={() => setEditForm({ ...editForm, isPublic: !editForm.isPublic })} style={{
                padding: '6px 12px', borderRadius: 8,
                border: editForm.isPublic ? '1px solid rgba(122,242,121,0.4)' : '1px solid #2A2E2A',
                background: editForm.isPublic ? 'rgba(122,242,121,0.06)' : 'transparent',
                color: editForm.isPublic ? '#7AF279' : '#4A5549',
                fontSize: 12, fontFamily: SANS, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                  {editForm.isPublic
                    ? <><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>
                    : <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>}
                </svg>
                {editForm.isPublic ? 'Public — visible in marketplace' : 'Private — hidden'}
              </button>
            </div>

            {saveError && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, fontSize: 12, color: '#f87171', fontFamily: SANS }}>
                {saveError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => { setEditEp(null); setEditForm(null) }} style={{ flex: 1, padding: '11px 0', background: 'transparent', border: '1px solid #2A2E2A', borderRadius: 8, color: '#7A8C79', fontSize: 13, fontFamily: SANS, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleUpdate} disabled={saving || !editForm.name || !editForm.targetUrl} style={{
                flex: 1, padding: '11px 0',
                background: saving || !editForm.name || !editForm.targetUrl ? '#2A2E2A' : '#7AF279',
                border: 'none', borderRadius: 8,
                color: saving || !editForm.name || !editForm.targetUrl ? '#4A5549' : '#1B1E1B',
                fontSize: 13, fontWeight: 600, fontFamily: SANS,
                cursor: saving || !editForm.name || !editForm.targetUrl ? 'not-allowed' : 'pointer',
              }}>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '32px 40px', maxWidth: 900 }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 32,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 400,
                color: '#E8F4EE',
                fontFamily: SANS,
                margin: 0,
              }}
            >
              APIs
            </h1>
            <p
              style={{
                fontSize: 13,
                color: '#4A5549',
                marginTop: 4,
                fontFamily: SANS,
              }}
            >
              Register any API URL — Metera handles billing automatically
            </p>
          </div>
          <button
            onClick={() => {
              if (!atLimit) setCreateOpen(true)
            }}
            disabled={atLimit}
            title={atLimit ? 'Upgrade to Pro for unlimited endpoints' : undefined}
            style={{
              padding: '9px 18px',
              background: atLimit ? 'rgba(255,255,255,0.04)' : '#7AF279',
              color: atLimit ? '#E8F4EE' : '#1B1E1B',
              border: atLimit ? '1px solid #2A2E2A' : 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: atLimit ? 'not-allowed' : 'pointer',
              fontFamily: SANS,
              opacity: atLimit ? 0.5 : 1,
            }}
          >
            + Add endpoint
          </button>
        </div>

        {atLimit && (
          <div
            style={{
              marginBottom: 20,
              padding: '12px 16px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 13, color: '#fff', fontFamily: SANS }}>
              Free plan: 3/3 proxy endpoints used
            </span>
            <a
              href="/billing"
              style={{ fontSize: 13, color: '#7AF279', fontFamily: SANS, textDecoration: 'none' }}
            >
              Upgrade to Pro →
            </a>
          </div>
        )}

        {/* Create form */}
        {createOpen && (
          <div
            style={{
              marginBottom: 24,
              padding: 24,
              background: '#1F221F',
              border: '1px solid #2A2E2A',
              borderRadius: 12,
            }}
          >
            <h2
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: '#E8F4EE',
                fontFamily: SANS,
                margin: '0 0 20px',
              }}
            >
              New hosted endpoint
            </h2>

            {/* Image */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Image (optional · max 512KB)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Preview */}
                <div style={{
                  width: 56, height: 56, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
                  border: '1px solid #2A2E2A', background: '#111311',
                }}>
                  <img
                    src={avatarImage || '/icon-api.jpg'}
                    alt="preview"
                    style={{ width: 56, height: 56, objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'inline-block', padding: '7px 14px', fontSize: 12,
                    border: '1px solid #2A2E2A', borderRadius: 8, cursor: 'pointer',
                    color: '#7A8C79', fontFamily: MONO, background: '#111311',
                  }}>
                    Choose image
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      style={{ display: 'none' }}
                      onChange={e => {
                        setImageError('')
                        const file = e.target.files?.[0]
                        if (!file) return
                        if (file.size > MAX_IMAGE_BYTES) {
                          setImageError(`Image too large (${(file.size / 1024).toFixed(0)}KB). Max 512KB.`)
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
                      color: '#4A5549', cursor: 'pointer', fontSize: 12, fontFamily: MONO,
                    }}>
                      Remove
                    </button>
                  )}
                  {imageError && (
                    <p style={{ fontSize: 11, color: '#f87171', marginTop: 4, fontFamily: MONO }}>{imageError}</p>
                  )}
                  <p style={{ fontSize: 11, color: '#4A5549', marginTop: 4, fontFamily: MONO }}>
                    PNG, JPG, WebP. Default used if none uploaded.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Name *</label>
                <input style={inputStyle} placeholder="weather-api" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select style={inputStyle} value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Target URL *</label>
              <input style={inputStyle} placeholder="https://your-api.com/endpoint" value={form.targetUrl}
                onChange={(e) => setForm({ ...form, targetUrl: e.target.value })} />
              <p style={{ fontSize: 11, color: '#4A5549', marginTop: 4, fontFamily: SANS }}>
                Gate402 proxies requests to this URL
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Price per call (USDC)</label>
                <input style={inputStyle} placeholder="0.001" type="number" step="0.001"
                  value={form.pricePerCall}
                  onChange={(e) => setForm({ ...form, pricePerCall: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Target API key (optional)</label>
                <input style={inputStyle} placeholder="sk_live_..." type="password"
                  value={form.targetApiKey}
                  onChange={(e) => setForm({ ...form, targetApiKey: e.target.value })} />
                <p style={{ fontSize: 11, color: '#4A5549', marginTop: 4, fontFamily: SANS }}>
                  Forwarded securely — never exposed
                </p>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Description</label>
              <input style={inputStyle} placeholder="Real-time weather data for any location"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            {/* Accepted methods */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Accepted Methods</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(method => (
                  <button key={method} onClick={() => {
                    const next = form.methods.includes(method)
                      ? form.methods.filter(m => m !== method)
                      : [...form.methods, method]
                    setForm({ ...form, methods: next })
                  }} style={{
                    padding: '5px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                    border: form.methods.includes(method) ? '1px solid #7AF279' : '1px solid #2A2E2A',
                    background: form.methods.includes(method) ? 'rgba(122,242,121,0.06)' : 'transparent',
                    color: form.methods.includes(method) ? '#7AF279' : '#4A5549',
                    fontFamily: MONO,
                  }}>
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Tags</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {form.tags.map(tag => (
                  <span key={tag} style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'rgba(122,242,121,0.08)', border: '1px solid rgba(122,242,121,0.2)',
                    borderRadius: 6, padding: '3px 8px', fontSize: 12, color: '#7AF279',
                  }}>
                    {tag}
                    <button onClick={() => setForm({ ...form, tags: form.tags.filter(t => t !== tag) })}
                      style={{ background: 'none', border: 'none', color: '#7AF279', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
                  </span>
                ))}
              </div>
              <input style={inputStyle} placeholder="Add tag (press Enter)"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && tagInput.trim()) {
                    e.preventDefault()
                    if (!form.tags.includes(tagInput.trim()))
                      setForm({ ...form, tags: [...form.tags, tagInput.trim()] })
                    setTagInput('')
                  }
                }} />
            </div>

            {/* Docs URL */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Documentation URL (optional)</label>
              <input style={inputStyle} placeholder="https://your-api.com/docs"
                value={form.docsUrl}
                onChange={(e) => setForm({ ...form, docsUrl: e.target.value })} />
            </div>

            {/* Response example */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Response Example (JSON)</label>
              <textarea style={{ ...inputStyle, resize: 'vertical' as const }}
                placeholder={'{\n  "result": "example"\n}'}
                value={form.responseExample}
                onChange={(e) => setForm({ ...form, responseExample: e.target.value })}
                rows={4} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <button onClick={() => setForm({ ...form, isPublic: !form.isPublic })} style={{
                padding: '6px 12px', borderRadius: 8,
                border: form.isPublic ? '1px solid rgba(122,242,121,0.4)' : '1px solid #2A2E2A',
                background: form.isPublic ? 'rgba(122,242,121,0.06)' : 'transparent',
                color: form.isPublic ? '#7AF279' : '#4A5549',
                fontSize: 12, fontFamily: SANS, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                  {form.isPublic
                    ? <><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>
                    : <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>
                  }
                </svg>
                {form.isPublic ? 'Public — visible in marketplace' : 'Private — hidden'}
              </button>
            </div>

            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#f87171',
                  fontFamily: SANS,
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setCreateOpen(false)}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  background: 'transparent',
                  border: '1px solid #2A2E2A',
                  borderRadius: 8,
                  color: '#7A8C79',
                  fontSize: 13,
                  fontFamily: SANS,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !form.name || !form.targetUrl}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  background: creating || !form.name || !form.targetUrl ? '#2A2E2A' : '#7AF279',
                  border: 'none',
                  borderRadius: 8,
                  color: creating || !form.name || !form.targetUrl ? '#4A5549' : '#1B1E1B',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: SANS,
                  cursor: creating || !form.name || !form.targetUrl ? 'not-allowed' : 'pointer',
                }}
              >
                {creating ? 'Creating...' : 'Create endpoint'}
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '60px 0',
              color: '#4A5549',
              fontSize: 13,
              fontFamily: SANS,
            }}
          >
            Loading...
          </div>
        )}

        {/* Empty state */}
        {!loading && endpoints.length === 0 && !createOpen && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 0',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'rgba(122,242,121,0.06)',
                border: '1px solid rgba(122,242,121,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(122,242,121,0.6)" strokeWidth="1.5">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 400,
                color: '#E8F4EE',
                fontFamily: SANS,
                margin: '0 0 8px',
              }}
            >
              No APIs yet
            </h3>
            <p
              style={{
                fontSize: 13,
                color: '#4A5549',
                maxWidth: 320,
                lineHeight: 1.6,
                fontFamily: SANS,
                margin: '0 0 32px',
              }}
            >
              Register any API URL and Gate402 handles billing automatically. No code needed.
            </p>
            <button
              onClick={() => setCreateOpen(true)}
              style={{
                padding: '10px 24px',
                background: '#7AF279',
                border: 'none',
                borderRadius: 8,
                color: '#1B1E1B',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: SANS,
                cursor: 'pointer',
              }}
            >
              Add your first endpoint
            </button>
          </div>
        )}

        {/* Endpoints list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {endpoints.map((ep) => (
            <div
              key={ep.id}
              style={{
                padding: 20,
                background: '#1F221F',
                border: '1px solid #2A2E2A',
                borderRadius: 12,
              }}
            >
              {/* Top row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 14,
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#E8F4EE',
                        fontFamily: SANS,
                      }}
                    >
                      {ep.name}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        padding: '2px 7px',
                        borderRadius: 99,
                        border: ep.isPublic
                          ? '1px solid rgba(122,242,121,0.3)'
                          : '1px solid #2A2E2A',
                        color: ep.isPublic ? '#7AF279' : '#4A5549',
                        background: ep.isPublic ? 'rgba(122,242,121,0.06)' : 'transparent',
                        fontFamily: MONO,
                      }}
                    >
                      {ep.isPublic ? 'public' : 'private'}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        padding: '2px 7px',
                        borderRadius: 99,
                        border: '1px solid #2A2E2A',
                        color: '#4A5549',
                        fontFamily: MONO,
                      }}
                    >
                      {ep.category}
                    </span>
                  </div>
                  {ep.description && (
                    <p
                      style={{
                        fontSize: 12,
                        color: '#4A5549',
                        margin: 0,
                        fontFamily: SANS,
                      }}
                    >
                      {ep.description}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <a
                    href={publicUrl(ep.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '6px 8px',
                      color: '#4A5549',
                      textDecoration: 'none',
                      fontSize: 16,
                    }}
                    title="Open endpoint"
                  >
                    ↗
                  </a>
                  <button
                    onClick={() => openEdit(ep)}
                    title="Edit endpoint"
                    style={{
                      padding: '6px 8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#4A5549',
                      fontSize: 14,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'color 150ms',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#7AF279')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#4A5549')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  {deleteConfirm === ep.id ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#f87171', fontFamily: SANS }}>
                        Delete?
                      </span>
                      <button
                        onClick={() => handleDelete(ep.id)}
                        style={{
                          padding: '4px 10px',
                          background: 'rgba(239,68,68,0.12)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          borderRadius: 6,
                          color: '#f87171',
                          fontSize: 11,
                          fontFamily: SANS,
                          cursor: 'pointer',
                        }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        style={{
                          padding: '4px 10px',
                          background: 'transparent',
                          border: '1px solid #2A2E2A',
                          borderRadius: 6,
                          color: '#7A8C79',
                          fontSize: 11,
                          fontFamily: SANS,
                          cursor: 'pointer',
                        }}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(ep.id)}
                      style={{
                        padding: '6px 8px',
                        background: 'transparent',
                        border: 'none',
                        color: '#4A5549',
                        fontSize: 14,
                        cursor: 'pointer',
                      }}
                      title="Delete endpoint"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Public URL */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: '#111311',
                  border: '1px solid #2A2E2A',
                  borderRadius: 8,
                  padding: '8px 12px',
                  marginBottom: 14,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4A5549" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <span
                  style={{
                    flex: 1,
                    fontSize: 12,
                    fontFamily: MONO,
                    color: '#7AF279',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {publicUrl(ep.slug)}
                </span>
                <button
                  onClick={() => copy(publicUrl(ep.slug), ep.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: copied === ep.id ? '#7AF279' : '#4A5549',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontFamily: SANS,
                    padding: 0,
                  }}
                >
                  {copied === ep.id ? '✓ copied' : 'copy'}
                </button>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'Price', value: `$${ep.pricePerCall}/call` },
                  { label: 'Total calls', value: ep.totalCalls.toLocaleString() },
                  { label: 'Earned', value: `$${ep.totalEarned.toFixed(4)}`, accent: true },
                ].map(({ label, value, accent }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <p
                      style={{
                        fontSize: 11,
                        color: '#4A5549',
                        fontFamily: SANS,
                        margin: '0 0 4px',
                      }}
                    >
                      {label}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        fontFamily: MONO,
                        color: accent ? '#7AF279' : '#E8F4EE',
                        margin: 0,
                      }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

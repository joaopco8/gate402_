'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
import DashboardLayout from '../components/DashboardLayout'
import PageContainer from '../components/PageContainer'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import { useUser } from '../hooks/useUser'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'
const MONO = 'var(--font-code)'
const SANS = 'var(--font-display)'

interface Endpoint {
  id: string
  path: string
  priceUsdc: number
  active: boolean
  description: string | null
  totalCalls: number
  revenue: number
  netRevenue: number
  createdAt: string
}

// ── Modal shell ───────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#0d0d0d', border: '1px solid var(--border)', borderRadius: 12, width: 440, maxWidth: '90vw', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: SANS }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: MONO, fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6,
  padding: '9px 12px', fontSize: 13, color: 'var(--text-primary)',
  fontFamily: MONO, outline: 'none',
}

const btnPrimary: React.CSSProperties = {
  padding: '9px 20px', background: 'var(--green)', color: '#000',
  border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600,
  cursor: 'pointer', fontFamily: SANS,
}

// ── Add Modal ────────────────────────────────────────────────────────────────

function AddModal({ supabaseId, onClose, onAdded }: { supabaseId: string; onClose: () => void; onAdded: () => void }) {
  const [path, setPath] = useState('/')
  const [price, setPrice] = useState('0.001')
  const [desc, setDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!path.startsWith('/')) { setError('Path must start with /'); return }
    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum < 0.0001) { setError('Minimum price is 0.0001 USDC'); return }
    setSaving(true); setError(null)
    try {
      const res = await fetch(`${SERVER_URL}/api/endpoints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': supabaseId },
        body: JSON.stringify({ path, priceUsdc: priceNum, description: desc || undefined }),
      })
      const d = await res.json()
      if (res.ok) { onAdded(); onClose(); return }
      if (res.status === 403 && d.code === 'UPGRADE_REQUIRED') {
        setError("You've reached the 3 endpoint limit on the Free plan.")
      } else if (res.status === 409) {
        setError('This endpoint path already exists.')
      } else {
        setError(d.error ?? 'Failed to create endpoint')
      }
    } catch {
      setError('Network error. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Add Endpoint" onClose={onClose}>
      <Field label="Endpoint Path">
        <input style={inputStyle} value={path} onChange={e => setPath(e.target.value)} placeholder="/api/your-endpoint" />
      </Field>
      <Field label="Price (USDC)">
        <input style={inputStyle} type="number" value={price} onChange={e => setPrice(e.target.value)} min="0.0001" step="0.0001" placeholder="0.001" />
      </Field>
      <Field label="Description (optional)">
        <input style={inputStyle} value={desc} onChange={e => setDesc(e.target.value)} placeholder="What does this endpoint do?" />
      </Field>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, fontSize: 12, color: '#f87171', fontFamily: SANS }}>
          {error}
          {error.includes('limit') && (
            <> <a href="/billing" style={{ color: 'var(--green)' }}>Upgrade to Pro →</a></>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ padding: '9px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: SANS }}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Adding...' : 'Add Endpoint'}
        </button>
      </div>
    </Modal>
  )
}

// ── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ ep, supabaseId, onClose, onSaved }: { ep: Endpoint; supabaseId: string; onClose: () => void; onSaved: () => void }) {
  const [price, setPrice] = useState(ep.priceUsdc.toString())
  const [desc, setDesc] = useState(ep.description ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum < 0.0001) { setError('Minimum price is 0.0001 USDC'); return }
    setSaving(true); setError(null)
    try {
      const res = await fetch(`${SERVER_URL}/api/endpoints/${ep.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': supabaseId },
        body: JSON.stringify({ priceUsdc: priceNum, description: desc || null }),
      })
      if (res.ok) { onSaved(); onClose(); return }
      const d = await res.json()
      setError(d.error ?? 'Failed to update')
    } catch {
      setError('Network error. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={`Edit ${ep.path}`} onClose={onClose}>
      <Field label="Price (USDC)">
        <input style={inputStyle} type="number" value={price} onChange={e => setPrice(e.target.value)} min="0.0001" step="0.0001" />
      </Field>
      <Field label="Description (optional)">
        <input style={inputStyle} value={desc} onChange={e => setDesc(e.target.value)} placeholder="What does this endpoint do?" />
      </Field>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, fontSize: 12, color: '#f87171', fontFamily: SANS }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ padding: '9px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: SANS }}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </Modal>
  )
}

// ── Actions Menu ─────────────────────────────────────────────────────────────

function ActionsMenu({ ep, supabaseId, onRefresh, onEdit }: { ep: Endpoint; supabaseId: string; onRefresh: () => void; onEdit: () => void }) {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setConfirming(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function toggleActive() {
    setOpen(false)
    await fetch(`${SERVER_URL}/api/endpoints/${ep.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-id': supabaseId },
      body: JSON.stringify({ active: !ep.active }),
    })
    onRefresh()
  }

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return }
    setOpen(false); setConfirming(false)
    await fetch(`${SERVER_URL}/api/endpoints/${ep.id}`, {
      method: 'DELETE',
      headers: { 'x-user-id': supabaseId },
    })
    onRefresh()
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', padding: '4px 10px', fontSize: 16, lineHeight: 1 }}
      >
        ⋯
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: '#0d0d0d', border: '1px solid var(--border)', borderRadius: 8, minWidth: 170, zIndex: 100, overflow: 'hidden' }}>
          <button
            onClick={() => { setOpen(false); onEdit() }}
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer', fontFamily: SANS }}
          >
            Edit price
          </button>
          <button
            onClick={toggleActive}
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer', fontFamily: SANS }}
          >
            {ep.active ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={handleDelete}
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', background: 'none', border: 'none', color: confirming ? '#f87171' : 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: SANS }}
          >
            {confirming ? 'Click again to confirm' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EndpointsPage() {
  const { userData } = useUser()
  const [supabaseId, setSupabaseId] = useState<string | null>(null)
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editEp, setEditEp] = useState<Endpoint | null>(null)

  const isPro = userData?.plan === 'pro' || userData?.plan === 'enterprise'
  const count = endpoints.length
  const atLimit = !isPro && count >= 3

  async function loadEndpoints(uid: string) {
    try {
      const res = await fetch(`${SERVER_URL}/api/endpoints`, { headers: { 'x-user-id': uid } })
      if (res.ok) setEndpoints(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setSupabaseId(user.id)
      loadEndpoints(user.id)
    })
  }, [])

  function refresh() {
    if (supabaseId) loadEndpoints(supabaseId)
  }

  const badgeColor = count >= 3 ? '#f87171' : count >= 2 ? '#f59e0b' : 'var(--text-muted)'
  const badgeBg = count >= 3 ? 'rgba(239,68,68,0.08)' : count >= 2 ? 'rgba(245,158,11,0.08)' : 'var(--surface)'
  const badgeBorder = count >= 3 ? 'rgba(239,68,68,0.2)' : count >= 2 ? 'rgba(245,158,11,0.2)' : 'var(--border)'

  return (
    <DashboardLayout>
      {showAdd && supabaseId && (
        <AddModal supabaseId={supabaseId} onClose={() => setShowAdd(false)} onAdded={refresh} />
      )}
      {editEp && supabaseId && (
        <EditModal ep={editEp} supabaseId={supabaseId} onClose={() => setEditEp(null)} onSaved={refresh} />
      )}

      <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>

      <PageContainer>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)' }}>
          <PageHeader
            eyebrow="GATE402"
            title="Endpoints"
            subtitle="Manage your priced API endpoints"
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8, flexShrink: 0 }}>
            {!isPro && (
              <span style={{ fontSize: 11, fontFamily: MONO, color: badgeColor, background: badgeBg, border: `1px solid ${badgeBorder}`, borderRadius: 20, padding: '4px 10px', whiteSpace: 'nowrap' }}>
                {count}/3 endpoints{count >= 3 ? ' — Limit reached' : ' used'}
              </span>
            )}
            <button
              onClick={() => { if (!atLimit) setShowAdd(true) }}
              disabled={atLimit}
              title={atLimit ? 'Upgrade to Pro for unlimited endpoints' : undefined}
              style={{
                padding: '9px 18px',
                background: atLimit ? 'var(--surface)' : 'var(--green)',
                color: atLimit ? 'var(--text-muted)' : '#000',
                border: atLimit ? '1px solid var(--border)' : 'none',
                borderRadius: 6, fontSize: 13, fontWeight: 600,
                cursor: atLimit ? 'not-allowed' : 'pointer',
                fontFamily: SANS, opacity: atLimit ? 0.5 : 1,
              }}
            >
              + Add Endpoint
            </button>
          </div>
        </div>

        {atLimit && (
          <div style={{ marginBottom: 'var(--space-md)', padding: '12px 16px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#f59e0b', fontFamily: SANS }}>Free plan: 3/3 endpoints used</span>
            <a href="/billing" style={{ fontSize: 13, color: 'var(--green)', fontFamily: SANS, textDecoration: 'none' }}>Upgrade to Pro →</a>
          </div>
        )}

        <Card style={{ padding: 0 }}>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 70px 120px 90px 52px', padding: '10px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', borderRadius: '12px 12px 0 0' }}>
            {['Path', 'Price', 'Calls', 'Net Revenue', 'Status', ''].map(h => (
              <span key={h} style={{ fontFamily: MONO, fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ height: 13, borderRadius: 4, background: 'linear-gradient(90deg, var(--surface) 25%, var(--card-raised,#111) 50%, var(--surface) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              </div>
            ))
          ) : endpoints.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, fontFamily: SANS }}>No endpoints yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, fontFamily: SANS }}>Add your first endpoint to start charging agents.</div>
              <button onClick={() => setShowAdd(true)} style={btnPrimary}>+ Add Endpoint</button>
            </div>
          ) : (
            endpoints.map((ep, i) => (
              <div
                key={ep.id}
                style={{ display: 'grid', gridTemplateColumns: '1fr 110px 70px 120px 90px 52px', padding: '14px 24px', borderBottom: i < endpoints.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}
              >
                <span style={{ fontFamily: MONO, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ep.path}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-secondary)' }}>
                  {ep.priceUsdc} USDC
                </span>
                <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-secondary)' }}>
                  {ep.totalCalls}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--green)' }}>
                  ${(ep.netRevenue ?? 0).toFixed(5)}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: MONO, color: ep.active ? 'var(--green)' : 'var(--text-muted)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: ep.active ? 'var(--green)' : 'var(--text-muted)', flexShrink: 0 }} />
                  {ep.active ? 'Active' : 'Inactive'}
                </span>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {supabaseId && (
                    <ActionsMenu ep={ep} supabaseId={supabaseId} onRefresh={refresh} onEdit={() => setEditEp(ep)} />
                  )}
                </div>
              </div>
            ))
          )}
        </Card>
      </PageContainer>
    </DashboardLayout>
  )
}

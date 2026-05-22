'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { HiOutlineShieldCheck, HiOutlineShieldExclamation } from 'react-icons/hi'
import { LuServerCog } from 'react-icons/lu'
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

// ── Endpoint Card ─────────────────────────────────────────────────────────────

function EndpointCard({
  ep,
  supabaseId,
  onRefresh,
  onAdd,
  atLimit,
}: {
  ep: Endpoint | null
  supabaseId: string | null
  onRefresh: () => void
  onAdd: () => void
  atLimit: boolean
}) {
  const controls = useAnimation()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const isThrottled = ep ? !ep.active : false

  useEffect(() => {
    let alive = true
    const sequence = async () => {
      while (alive) {
        await controls.start((i: number) => ({
          opacity: [0, 1, 0],
          x: [-120, 0, 120],
          y: [Math.random() * 80 - 40, 0, Math.random() * 80 - 40],
          transition: { duration: 2, ease: 'easeInOut', delay: i * 0.3 },
        }))
        await new Promise(r => setTimeout(r, 1000))
      }
    }
    sequence()
    return () => { alive = false }
  }, [controls])

  async function confirmDelete() {
    if (!ep || !supabaseId) return
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch(`${SERVER_URL}/api/endpoints/${ep.id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': supabaseId },
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setDeleteError(d.error ?? `Error ${res.status}`)
        return
      }
      setShowDeleteModal(false)
      onRefresh()
    } catch {
      setDeleteError('Network error. Try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className="relative overflow-hidden rounded-md"
      style={{
        height: '28rem',
        width: '100%',
        background: '#1F1F1F',
        border: ep ? '1px solid rgba(38,38,38,0.5)' : '1px solid rgba(38,38,38,0.25)',
      }}
    >
      {/* Inner content — blurred when empty */}
      <div style={{ position: 'absolute', inset: 0, filter: ep ? 'none' : 'blur(4px)', opacity: ep ? 1 : 0.18, pointerEvents: 'none' }}>
        {/* Animation canvas */}
        <div className="absolute inset-x-0 top-10 flex h-48 items-center justify-center">
          <div className="relative flex h-full w-full items-center justify-center">
            <motion.div
              className="z-10 flex items-center justify-center rounded-full"
              style={{ width: 144, height: 144, background: '#111', border: '1px solid #404040', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
              animate={{
                borderColor: isThrottled ? 'rgba(239,68,68,0.5)' : 'rgba(52,211,153,0.5)',
                transition: { duration: 0.5, ease: 'easeInOut' },
              }}
            >
              <LuServerCog style={{ width: 58, height: 58, color: '#a3a3a3' }} />
            </motion.div>

            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                custom={i}
                animate={controls}
                style={{
                  position: 'absolute', left: '50%', top: '50%',
                  width: 8, height: 8, borderRadius: '50%',
                  background: isThrottled ? '#ef4444' : '#10b981',
                }}
              />
            ))}

            <motion.div
              className="absolute flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: isThrottled ? 1 : 0,
                scale: isThrottled ? 1 : 0.8,
                transition: { duration: 0.3, ease: 'easeOut' },
              }}
            >
              <HiOutlineShieldExclamation style={{ width: 128, height: 128, color: 'rgba(239,68,68,0.5)' }} />
            </motion.div>
          </div>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 w-full" style={{ padding: '0 16px 16px' }}>
          {/* Status row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <motion.div
              animate={{ color: isThrottled ? '#ef4444' : '#10b981' }}
              transition={{ duration: 0.5 }}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {isThrottled
                ? <HiOutlineShieldExclamation style={{ width: 16, height: 16 }} />
                : <HiOutlineShieldCheck style={{ width: 16, height: 16 }} />}
            </motion.div>
            <motion.p
              style={{ fontSize: 12, fontWeight: 500, margin: 0 }}
              animate={{ color: isThrottled ? '#ef4444' : '#10b981' }}
              transition={{ duration: 0.5 }}
            >
              {isThrottled ? 'Inactive' : 'All Systems Normal'}
            </motion.p>
          </div>

          {/* Path */}
          <div style={{ marginTop: 10, fontSize: 14, fontWeight: 600, color: '#ffffff', fontFamily: MONO, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ep?.path ?? '/endpoint'}
          </div>

          {/* Stats row */}
          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
            <div>
              <div style={{ fontSize: 10, color: '#555', fontFamily: MONO, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</div>
              <div style={{ fontSize: 12, color: '#a3a3a3', fontFamily: MONO }}>{ep?.priceUsdc ?? '—'} USDC</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#555', fontFamily: MONO, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calls</div>
              <div style={{ fontSize: 12, color: '#a3a3a3', fontFamily: MONO }}>{ep?.totalCalls?.toLocaleString() ?? '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#555', fontFamily: MONO, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Rev</div>
              <div style={{ fontSize: 12, color: '#10b981', fontFamily: MONO }}>${ep ? (ep.netRevenue ?? 0).toFixed(4) : '—'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete button — only on filled cards */}
      {ep && supabaseId && (
        <>
          <button
            onClick={() => setShowDeleteModal(true)}
            title="Delete endpoint"
            style={{
              position: 'absolute', top: 12, right: 12, zIndex: 10,
              background: 'rgba(0,0,0,0.55)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 6, color: '#555',
              cursor: 'pointer', padding: '6px 7px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>

          {showDeleteModal && (
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
              onClick={e => { if (e.target === e.currentTarget && !deleting) { setShowDeleteModal(false); setDeleteError(null) } }}
            >
              <div style={{ background: '#0d0d0d', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, width: 400, maxWidth: '90vw', padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', fontFamily: SANS }}>Delete endpoint</div>
                    <div style={{ fontSize: 12, color: '#666', fontFamily: MONO, marginTop: 2 }}>{ep.path}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#a3a3a3', fontFamily: SANS, lineHeight: 1.6, margin: '0 0 24px' }}>
                  This will permanently delete <span style={{ color: '#fff', fontFamily: MONO }}>{ep.path}</span> and all its data. This action cannot be undone.
                </p>
                {deleteError && (
                  <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6, fontSize: 12, color: '#f87171' }}>
                    {deleteError}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => { setShowDeleteModal(false); setDeleteError(null) }}
                    disabled={deleting}
                    style={{ padding: '9px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, fontSize: 13, color: '#a3a3a3', cursor: 'pointer', fontFamily: SANS }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    style={{ padding: '9px 20px', background: 'rgba(239,68,68,0.9)', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, color: '#fff', cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: SANS, opacity: deleting ? 0.6 : 1 }}
                  >
                    {deleting ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add overlay — only on empty slots */}
      {!ep && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <button
            onClick={atLimit ? undefined : onAdd}
            title={atLimit ? 'Upgrade to Pro for unlimited endpoints' : 'Add endpoint'}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              cursor: atLimit ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 200ms ease',
              padding: 0,
            }}
            onMouseEnter={e => {
              if (!atLimit) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
            }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <line x1="14" y1="5" x2="14" y2="23" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
              <line x1="5" y1="14" x2="23" y2="14" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          {atLimit && (
            <a href="/billing" style={{ fontSize: 11, color: '#10b981', fontFamily: MONO, textDecoration: 'none' }}>Upgrade to Pro →</a>
          )}
        </div>
      )}
    </div>
  )
}

// ── Modal shell ───────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#0d0d0d', border: '1px solid var(--border)', borderRadius: 6, width: 440, maxWidth: '90vw', padding: 28 }}>
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
      <div style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{label}</div>
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
  const [deleteStep, setDeleteStep] = useState<'idle' | 'confirm' | 'deleting'>('idle')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setDeleteStep('idle')
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
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

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (deleteStep === 'idle') {
      setDeleteStep('confirm')
      return
    }
    if (deleteStep === 'confirm') {
      setDeleteStep('deleting')
      try {
        await fetch(`${SERVER_URL}/api/endpoints/${ep.id}`, {
          method: 'DELETE',
          headers: { 'x-user-id': supabaseId },
        })
      } finally {
        setOpen(false)
        setDeleteStep('idle')
        onRefresh()
      }
    }
  }

  const itemStyle: React.CSSProperties = {
    display: 'block', width: '100%', textAlign: 'left',
    padding: '9px 14px', background: 'none', border: 'none',
    fontSize: 13, cursor: 'pointer', fontFamily: SANS,
    color: 'var(--text-primary)', borderRadius: 6,
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(v => !v); setDeleteStep('idle') }}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 6, color: 'var(--text-secondary)', cursor: 'pointer',
          padding: '5px 12px', fontSize: 14, lineHeight: 1,
          display: 'flex', alignItems: 'center', gap: 2,
        }}
      >
        •••
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 4px)',
          background: '#0e0e0e', border: '1px solid var(--border)',
          borderRadius: 6, minWidth: 180, zIndex: 200,
          padding: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          <button
            onClick={() => { setOpen(false); setDeleteStep('idle'); onEdit() }}
            style={itemStyle}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            Edit price & description
          </button>

          <button
            onClick={toggleActive}
            style={itemStyle}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            {ep.active ? 'Deactivate' : 'Activate'}
          </button>

          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

          <button
            onClick={handleDelete}
            disabled={deleteStep === 'deleting'}
            style={{
              ...itemStyle,
              color: deleteStep === 'idle' ? '#f87171' : '#fca5a5',
              fontWeight: deleteStep === 'confirm' ? 600 : 400,
              opacity: deleteStep === 'deleting' ? 0.5 : 1,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            {deleteStep === 'idle' && 'Delete endpoint'}
            {deleteStep === 'confirm' && '⚠ Confirm delete'}
            {deleteStep === 'deleting' && 'Deleting...'}
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

  const badgeColor = count >= 3 ? '#ef4444' : count >= 2 ? '#f59e0b' : 'var(--text-muted)'
  const badgeBg = count >= 3 ? 'rgba(239,68,68,0.08)' : count >= 2 ? 'rgba(245,158,11,0.08)' : 'var(--surface)'
  const badgeBorder = count >= 3 ? 'rgba(239,68,68,0.25)' : count >= 2 ? 'rgba(245,158,11,0.2)' : 'var(--border)'

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
            title="Endpoints"
            subtitle="Manage your priced API endpoints"
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8, flexShrink: 0 }}>
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
          <div style={{ marginBottom: 'var(--space-md)', padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#fff', fontFamily: SANS }}>Free plan: 3/3 endpoints used</span>
            <a href="/billing" style={{ fontSize: 13, color: '#fff', fontFamily: SANS, textDecoration: 'none' }}>Upgrade to Pro →</a>
          </div>
        )}

        {/* ── 3 endpoint cards ── */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
            {[0, 1, 2].map(i => (
              <EndpointCard
                key={endpoints[i]?.id ?? `empty-${i}`}
                ep={endpoints[i] ?? null}
                supabaseId={supabaseId}
                onRefresh={refresh}
                onAdd={() => setShowAdd(true)}
                atLimit={atLimit}
              />
            ))}
          </div>
        )}

      </PageContainer>
    </DashboardLayout>
  )
}

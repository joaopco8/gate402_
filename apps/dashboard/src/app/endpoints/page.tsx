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

// ── Endpoint Stat Card — 100% css/animation from api-rate-limiting-card ──────

function EndpointStatCard({
  cardTitle,
  cardDescription,
  isThrottled,
  icon: Icon,
}: {
  cardTitle: string
  cardDescription: string
  isThrottled: boolean
  icon: React.ElementType
}) {
  const controls = useAnimation()

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

  return (
    <div
      className="relative flex flex-col justify-between overflow-hidden rounded-md"
      style={{
        height: '28rem',
        width: '100%',
        background: '#0A0A0A',
        border: '1px solid rgba(38,38,38,0.5)',
        gap: 16,
      }}
    >
      {/* Animation canvas */}
      <div className="absolute inset-x-0 top-10 flex h-48 items-center justify-center">
        <div className="relative flex h-full w-full items-center justify-center">

          {/* Central icon — 80% bigger: 80→144, icon 32→58 */}
          <motion.div
            className="z-10 flex items-center justify-center rounded-full"
            style={{ width: 144, height: 144, background: '#111', border: '1px solid #404040', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
            animate={{
              borderColor: isThrottled ? 'rgba(239,68,68,0.5)' : 'rgba(52,211,153,0.5)',
              transition: { duration: 0.5, ease: 'easeInOut' },
            }}
          >
            <Icon style={{ width: 58, height: 58, color: '#a3a3a3' }} />
          </motion.div>

          {/* Animated dots */}
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

          {/* Shield overlay */}
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

      {/* Text */}
      <div className="absolute bottom-0 w-full" style={{ padding: '0 16px 16px' }}>
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
            {isThrottled ? 'Attention Required' : 'All Systems Normal'}
          </motion.p>
        </div>
        <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600, color: '#ffffff' }}>{cardTitle}</div>
        <div style={{ marginTop: 8, fontSize: 12, color: '#a3a3a3', lineHeight: 1.5 }}>{cardDescription}</div>
      </div>
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
    color: 'var(--text-primary)', borderRadius: 4,
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
          borderRadius: 8, minWidth: 180, zIndex: 200,
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
            eyebrow="Gate402"
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

        {/* ── 3 stat cards ── */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
            <EndpointStatCard
              icon={LuServerCog}
              isThrottled={!isPro && count >= 3}
              cardTitle={`${endpoints.filter(e => e.active).length} / ${count} Active`}
              cardDescription={
                count === 0
                  ? 'No endpoints yet. Add your first to start receiving payments from AI agents.'
                  : `${endpoints.filter(e => e.active).length} endpoint${endpoints.filter(e => e.active).length !== 1 ? 's' : ''} active and accepting paid calls right now.`
              }
            />
            <EndpointStatCard
              icon={LuServerCog}
              isThrottled={false}
              cardTitle={`${endpoints.reduce((s, e) => s + (e.totalCalls ?? 0), 0).toLocaleString()} Total Calls`}
              cardDescription="Cumulative paid API calls received across all your registered endpoints."
            />
            <EndpointStatCard
              icon={LuServerCog}
              isThrottled={false}
              cardTitle={`$${endpoints.reduce((s, e) => s + (e.netRevenue ?? 0), 0).toFixed(4)} Net Revenue`}
              cardDescription="Total USDC earned after the 1% platform fee. Paid directly to your Solana wallet."
            />
          </div>
        )}

        <Card style={{ padding: 0 }}>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 70px 120px 90px 52px', padding: '10px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', borderRadius: '12px 12px 0 0' }}>
            {['Path', 'Price', 'Calls', 'Net Revenue', 'Status', ''].map(h => (
              <span key={h} style={{ fontFamily: MONO, fontSize: 12, color: 'var(--text-muted)', }}>{h}</span>
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

'use client'

import { useState, useEffect } from 'react'

interface AgentWallet {
  id: string
  name: string
  description?: string
  maxPerCall?: number
  maxPerHour?: number
  maxPerDay?: number
  maxPerMonth?: number
}

interface EditAgentWalletModalProps {
  open: boolean
  wallet: AgentWallet | null
  onClose: () => void
  onSuccess: (updated: Partial<AgentWallet> & { id: string }) => void
  serverUrl: string
  authHeader: () => Promise<Record<string, string>>
}

export function EditAgentWalletModal({ open, wallet, onClose, onSuccess, serverUrl, authHeader }: EditAgentWalletModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm]       = useState({
    name: '', description: '',
    maxPerCall: '', maxPerHour: '', maxPerDay: '', maxPerMonth: '',
  })

  useEffect(() => {
    if (wallet) {
      setForm({
        name:        wallet.name,
        description: wallet.description || '',
        maxPerCall:  wallet.maxPerCall  != null ? String(wallet.maxPerCall)  : '',
        maxPerHour:  wallet.maxPerHour  != null ? String(wallet.maxPerHour)  : '',
        maxPerDay:   wallet.maxPerDay   != null ? String(wallet.maxPerDay)   : '',
        maxPerMonth: wallet.maxPerMonth != null ? String(wallet.maxPerMonth) : '',
      })
      setError('')
    }
  }, [wallet])

  if (!open || !wallet) return null

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit() {
    if (!form.name.trim()) { setError('Name is required'); return }
    setLoading(true)
    setError('')
    try {
      const headers = await authHeader()
      const res = await fetch(`${serverUrl}/api/agent-wallets/${wallet.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          name:        form.name.trim(),
          description: form.description.trim() || null,
          maxPerCall:  form.maxPerCall  !== '' ? Number(form.maxPerCall)  : null,
          maxPerHour:  form.maxPerHour  !== '' ? Number(form.maxPerHour)  : null,
          maxPerDay:   form.maxPerDay   !== '' ? Number(form.maxPerDay)   : null,
          maxPerMonth: form.maxPerMonth !== '' ? Number(form.maxPerMonth) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to update wallet'); return }
      onSuccess({ id: wallet.id, ...data.wallet })
    } catch { setError('Connection error') }
    finally { setLoading(false) }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#111311', border: '1px solid #2A2E2A', borderRadius: 8,
    padding: '12px 16px', fontSize: 13, color: '#E8F4EE', fontFamily: 'var(--font-code)',
    outline: 'none', boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 12, color: '#7A8C79', textTransform: 'uppercase',
    letterSpacing: '0.08em', marginBottom: 6, fontFamily: 'var(--font-code)',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'relative', width: '100%', maxWidth: 480, margin: '0 16px',
        background: '#1B1E1B', border: '1px solid #2A2E2A', borderRadius: 12,
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #2A2E2A' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(122,242,121,0.08)', border: '1px solid rgba(122,242,121,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7AF279" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', fontFamily: 'var(--font-display)' }}>Edit Agent Wallet</div>
              <div style={{ fontSize: 12, color: '#4A5549', fontFamily: 'var(--font-code)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>{wallet.name}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5549', padding: 4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Name *</label>
            <input style={inputStyle} value={form.name} onChange={update('name')} />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <input style={inputStyle} placeholder="Optional description" value={form.description} onChange={update('description')} />
          </div>

          <div>
            <label style={{ ...labelStyle, marginBottom: 10 }}>Spending limits (USDC — leave blank for no limit)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {([
                ['maxPerCall',  'Max per call',  '0.01'],
                ['maxPerHour',  'Max per hour',  '1.00'],
                ['maxPerDay',   'Max per day',   '10.00'],
                ['maxPerMonth', 'Max per month', '100.00'],
              ] as const).map(([k, l, ph]) => (
                <div key={k}>
                  <label style={{ ...labelStyle, fontSize: 11 }}>{l}</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4A5549', fontSize: 13 }}>$</span>
                    <input
                      style={{ ...inputStyle, paddingLeft: 24 }}
                      placeholder={ph}
                      type="number"
                      step="0.001"
                      min="0"
                      value={form[k]}
                      onChange={update(k)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ fontSize: 12, color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px', fontFamily: 'var(--font-display)' }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, padding: '0 24px 24px' }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px 0', fontSize: 13, border: '1px solid #2A2E2A', color: '#7A8C79',
            background: 'transparent', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-display)',
          }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} style={{
            flex: 1, padding: '12px 0', fontSize: 13, fontWeight: 500, background: '#7AF279',
            color: '#1B1E1B', border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1, fontFamily: 'var(--font-display)',
          }}>
            {loading ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

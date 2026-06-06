'use client'

import { useState } from 'react'

interface CreateAgentWalletModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (wallet: any) => void
  serverUrl: string
  authHeader: () => Promise<Record<string, string>>
}

export function CreateAgentWalletModal({ open, onClose, onSuccess, serverUrl, authHeader }: CreateAgentWalletModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [step, setStep]     = useState(1)
  const [form, setForm]     = useState({
    name: '', description: '',
    maxPerCall: '', maxPerHour: '', maxPerDay: '', maxPerMonth: '',
  })

  if (!open) return null

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const headers = await authHeader()
      const res = await fetch(`${serverUrl}/api/agent-wallets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          maxPerCall:  form.maxPerCall  ? Number(form.maxPerCall)  : null,
          maxPerHour:  form.maxPerHour  ? Number(form.maxPerHour)  : null,
          maxPerDay:   form.maxPerDay   ? Number(form.maxPerDay)   : null,
          maxPerMonth: form.maxPerMonth ? Number(form.maxPerMonth) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error creating wallet'); return }
      onSuccess(data.wallet)
      onClose()
      setForm({ name: '', description: '', maxPerCall: '', maxPerHour: '', maxPerDay: '', maxPerMonth: '' })
      setStep(1)
    } catch { setError('Connection error') }
    finally { setLoading(false) }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#111311', border: '1px solid #2A2E2A', borderRadius: 8,
    padding: '12px 16px', fontSize: 13, color: '#E8F4EE', fontFamily: 'var(--font-code)',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 150ms',
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
                <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><path d="M8 15h.01M12 15h.01M16 15h.01"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', fontFamily: 'var(--font-display)' }}>New Agent Wallet</div>
              <div style={{ fontSize: 12, color: '#4A5549', fontFamily: 'var(--font-code)' }}>Step {step} of 2</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5549', padding: 4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, padding: '12px 24px 0' }}>
          {[1, 2].map(s => (
            <div key={s} style={{ flex: 1, height: 2, borderRadius: 99, background: s <= step ? '#7AF279' : '#2A2E2A', transition: 'background 300ms' }} />
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {step === 1 && (
            <>
              <div>
                <label style={labelStyle}>Agent name *</label>
                <input style={inputStyle} placeholder="customer-support-bot" value={form.name} onChange={update('name')} />
                <p style={{ fontSize: 12, color: '#4A5549', marginTop: 6, fontFamily: 'var(--font-display)' }}>
                  Use lowercase letters, numbers and hyphens only.
                </p>
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <input style={inputStyle} placeholder="Agent that handles customer support..." value={form.description} onChange={update('description')} />
              </div>
              {/* Info box */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'rgba(122,242,121,0.04)', border: '1px solid rgba(122,242,121,0.12)', borderRadius: 8, padding: 14 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(122,242,121,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <span style={{ color: '#7AF279', fontSize: 12 }}>✓</span>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: '#7AF279', fontWeight: 500, marginBottom: 4, fontFamily: 'var(--font-display)' }}>
                    Wallet created automatically
                  </p>
                  <p style={{ fontSize: 12, color: '#4A5549', lineHeight: 1.6, fontFamily: 'var(--font-display)' }}>
                    A Solana wallet will be created and managed securely. No seed phrase or private key setup needed.
                  </p>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p style={{ fontSize: 12, color: '#4A5549', fontFamily: 'var(--font-display)' }}>
                Leave blank for no limit. Values in USDC.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {([['maxPerCall', 'Max per call', '0.01'], ['maxPerHour', 'Max per hour', '1.00'], ['maxPerDay', 'Max per day', '10.00'], ['maxPerMonth', 'Max per month', '100.00']] as const).map(([k, l, ph]) => (
                  <div key={k}>
                    <label style={labelStyle}>{l}</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4A5549', fontSize: 13 }}>$</span>
                      <input style={{ ...inputStyle, paddingLeft: 24 }} placeholder={ph} type="number" step="0.001" value={form[k]} onChange={update(k)} />
                    </div>
                  </div>
                ))}
              </div>

              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#111311', border: '1px solid #2A2E2A', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ width: 16, height: 16, border: '2px solid #7AF279', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 12, color: '#7AF279', fontFamily: 'var(--font-display)' }}>Creating wallet...</p>
                    <p style={{ fontSize: 12, color: '#4A5549', fontFamily: 'var(--font-display)' }}>Setting up your Solana wallet via Privy</p>
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div style={{ fontSize: 12, color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px', fontFamily: 'var(--font-display)' }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, padding: '0 24px 24px' }}>
          <button onClick={step === 2 ? () => setStep(1) : onClose} style={{
            flex: 1, padding: '12px 0', fontSize: 13, border: '1px solid #2A2E2A', color: '#7A8C79',
            background: 'transparent', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-display)',
          }}>
            {step === 2 ? '← Back' : 'Cancel'}
          </button>
          {step === 1 ? (
            <button onClick={() => {
              if (!form.name) { setError('Name is required'); return }
              setError(''); setStep(2)
            }} style={{
              flex: 1, padding: '12px 0', fontSize: 13, fontWeight: 500, background: '#7AF279',
              color: '#1B1E1B', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-display)',
            }}>
              Next →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} style={{
              flex: 1, padding: '12px 0', fontSize: 13, fontWeight: 500, background: '#7AF279',
              color: '#1B1E1B', border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1, fontFamily: 'var(--font-display)',
            }}>
              {loading ? 'Creating...' : 'Create Agent Wallet'}
            </button>
          )}
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}

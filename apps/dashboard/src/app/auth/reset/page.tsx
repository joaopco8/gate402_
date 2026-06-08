'use client'

import * as React from 'react'
import { useState } from 'react'
import { createClient } from '../../../../lib/supabase/client'
import { DitheringShader } from '../../../components/v2/dithering-shader'
import '../../../styles/v2/tokens.css'

const BG    = '#1B1E1B'
const CARD  = 'rgba(27,30,27,0.82)'
const LINE  = '1px solid #2A2E2A'
const TEXT  = '#E8F4EE'
const MUTED = '#7A8C79'
const DIM   = '#4A5549'
const GREEN = '#7AF279'
const SANS  = "'Inter', sans-serif"
const MONO  = "'JetBrains Mono', monospace"

function Field({ id, label, type, placeholder, value, onChange }: {
  id: string; label: string; type: string; placeholder: string
  value: string; onChange: (v: string) => void
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 12, color: MUTED, fontFamily: SANS, fontWeight: 300 }}>{label}</label>
      <input
        id={id} type={type} placeholder={placeholder} required value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: 'rgba(0,0,0,0.35)',
          border: `1px solid ${focused ? '#4A5549' : '#2A2E2A'}`,
          borderRadius: 6, padding: '10px 12px',
          fontSize: 14, color: TEXT, fontFamily: SANS, fontWeight: 300,
          outline: 'none', transition: 'border-color 0.15s',
        }}
      />
    </div>
  )
}

export default function ResetPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true); setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, fontFamily: SANS, color: TEXT, overflow: 'hidden' }}>

      <DitheringShader
        shape="wave" type="8x8" colorBack={BG} colorFront="#BC86FF"
        pxSize={3} speed={0.6}
        style={{ opacity: 0.18, pointerEvents: 'none', position: 'absolute', inset: 0, zIndex: 0 }}
      />

      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'radial-gradient(ellipse at center, transparent 40%, rgba(27,30,27,0.85) 100%)' }} />

      <a href="/v2" style={{ position: 'absolute', top: 20, left: 24, zIndex: 10, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: MUTED, textDecoration: 'none', fontFamily: SANS, transition: 'color 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
        onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
      >
        <svg width="12" height="12" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 1L2 5.5 7 10" /></svg>
        Home
      </a>

      <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ width: '100%', maxWidth: 400, background: CARD, backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', border: LINE, borderRadius: 10, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)' }}>

          {/* header */}
          <div style={{ padding: '28px 28px 20px', borderBottom: LINE }}>
            <a href="/v2" style={{ display: 'inline-block', marginBottom: 20, textDecoration: 'none' }}>
              <img src="/logo-metera.png" alt="Metera" style={{ height: 22, width: 'auto', filter: 'brightness(0) invert(1)', display: 'block' }} />
            </a>
            <h1 style={{ fontSize: 20, fontWeight: 300, letterSpacing: '-0.03em', color: TEXT, margin: '0 0 4px', fontFamily: SANS }}>
              Reset password
            </h1>
            <p style={{ fontSize: 13, color: MUTED, margin: 0, fontWeight: 300, fontFamily: SANS }}>
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          {/* body */}
          <div style={{ padding: '24px 28px 28px' }}>
            {success ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '16px 0', textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', border: `1px solid ${GREEN}33`, background: `${GREEN}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10l4 4 8-8" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p style={{ fontSize: 14, color: TEXT, fontFamily: SANS, fontWeight: 300, margin: 0 }}>Check your email for a reset link.</p>
                <a href="/auth/login" style={{ fontSize: 13, color: MUTED, fontFamily: SANS, textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
                  onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                >
                  ← Back to sign in
                </a>
              </div>
            ) : (
              <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field id="reset-email" label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} />

                {error && (
                  <div style={{ fontSize: 13, color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 6, padding: '9px 12px', fontFamily: SANS, fontWeight: 300 }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  style={{ width: '100%', background: GREEN, border: 'none', borderRadius: 6, padding: '11px 0', fontSize: 14, fontFamily: SANS, fontWeight: 500, color: BG, cursor: loading ? 'not-allowed' : 'pointer', transition: 'opacity 0.15s', opacity: loading ? 0.65 : 1 }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.85' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = loading ? '0.65' : '1' }}
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>

                <a href="/auth/login" style={{ fontSize: 13, color: MUTED, textDecoration: 'none', textAlign: 'center', fontFamily: SANS, transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
                  onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                >
                  ← Back to sign in
                </a>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

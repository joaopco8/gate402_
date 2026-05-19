'use client'

import { useState } from 'react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

type Status = 'idle' | 'loading' | 'success' | 'error' | 'duplicate'

export function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !email.includes('@')) return

    setStatus('loading')

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          source: 'landing',
        }),
      })

      if (res.status === 201) {
        setStatus('success')
        setEmail('')
        return
      }

      if (res.status === 409) {
        setStatus('duplicate')
        return
      }

      const errorBody = await res.text()
      console.error('[waitlist] error:', res.status, errorBody)
      setStatus('error')
    } catch (err) {
      console.error('[waitlist] fetch error:', err)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px',
        background: 'rgba(0,188,125,0.08)',
        border: '1px solid rgba(0,188,125,0.2)',
        borderRadius: 6, fontFamily: 'monospace', fontSize: 13, color: '#00bc7d',
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7l3.5 3.5L12 3.5" stroke="#00bc7d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        You&apos;re on the list. We&apos;ll reach out soon.
      </div>
    )
  }

  if (status === 'duplicate') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px',
        background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: 6, fontFamily: 'monospace', fontSize: 13, color: '#f59e0b',
      }}>
        Already on the list. We&apos;ll be in touch.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex', gap: 8, alignItems: 'center',
      flexWrap: 'wrap', justifyContent: 'center',
    }}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        disabled={status === 'loading'}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 6, padding: '9px 14px',
          fontFamily: 'monospace', fontSize: 13, color: '#fff',
          outline: 'none', width: 220,
        }}
      />
      <button
        type="submit"
        disabled={status === 'loading' || !email}
        style={{
          padding: '9px 18px',
          background: status === 'loading' ? 'rgba(0,188,125,0.5)' : '#00bc7d',
          color: '#000', border: 'none', borderRadius: 6,
          fontFamily: 'monospace', fontSize: 13, fontWeight: 600,
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {status === 'loading' ? 'Joining...' : 'Get early access →'}
      </button>
      {status === 'error' && (
        <span style={{
          fontFamily: 'monospace', fontSize: 12, color: '#ef4444', width: '100%',
        }}>
          Something went wrong. Try again.
        </span>
      )}
    </form>
  )
}

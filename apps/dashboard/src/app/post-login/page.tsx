'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { getAuthHeaders } from '../lib/api'
import { clearUserCacheCompat as clearUserCache } from '@/contexts/UserContext'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'

const BG   = '#1B1E1B'
const TEXT = '#E8F4EE'
const MUTED= '#7A8C79'
const DIM  = '#4A5549'
const GREEN= '#7AF279'
const LINE = '#2A2E2A'
const MONO = "'Geist Mono', monospace"
const SANS = "'Geist Mono', monospace"

function getIntent(): string | null {
  const urlIntent = new URLSearchParams(window.location.search).get('intent')
  if (urlIntent) return urlIntent
  try { const s = sessionStorage.getItem('gate402_intent'); if (s) return s } catch {}
  try { const l = localStorage.getItem('gate402_intent'); if (l) return l } catch {}
  return null
}

function clearIntent() {
  try { sessionStorage.removeItem('gate402_intent') } catch {}
  try { localStorage.removeItem('gate402_intent') } catch {}
}

const PHRASES = [
  '( your infrastructure is coming online )',
  '( agents await your command )',
  '( monetization layer initializing )',
  '( payment rails warming up )',
  '( your workspace is loading )',
]

const LOG_LINES = [
  { ok: true,  text: 'Solana RPC            connected' },
  { ok: true,  text: 'USDC rails            verified' },
  { ok: true,  text: 'payment middleware    active' },
  { ok: null,  text: 'workspace             loading' },
]

export default function PostLoginPage() {
  const [visible, setVisible] = useState(false)
  const [phrase]  = useState(() => PHRASES[Math.floor(Math.random() * PHRASES.length)])
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (step >= LOG_LINES.length) return
    const id = setTimeout(() => setStep(s => s + 1), 320)
    return () => clearTimeout(id)
  }, [step])

  useEffect(() => {
    async function go() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/auth/login'
        return
      }

      clearUserCache()
      const intent = getIntent()
      clearIntent()

      if (intent === 'checkout') {
        try {
          const res = await fetch(`${SERVER_URL}/api/billing/checkout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...await getAuthHeaders(),
            },
          })
          const data = await res.json()
          if (res.ok && data.url) {
            window.location.href = data.url
            return
          }
          const reason = encodeURIComponent(data.error || `HTTP ${res.status}`)
          console.error('[post-login] checkout failed:', data)
          window.location.href = `/billing?error=${reason}`
          return
        } catch (e: any) {
          console.error('[post-login] checkout error:', e)
          window.location.href = `/billing?error=${encodeURIComponent(e?.message || 'Network error')}`
          return
        }
      }

      try {
        const res = await fetch(`${SERVER_URL}/api/users/me`, {
          headers: { ...await getAuthHeaders() },
        })
        if (res.ok) {
          const userData = await res.json()
          if (userData.totalEndpoints === 0 && userData.totalCalls === 0) {
            window.location.href = '/onboarding'
            return
          }
        }
      } catch {}

      window.location.href = '/dashboard'
    }
    go()
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: BG,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: SANS,
      color: TEXT,
      overflow: 'hidden',
    }}>

      {/* subtle grid bg */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(${LINE} 1px, transparent 1px), linear-gradient(90deg, ${LINE} 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
        opacity: 0.35,
      }} />

      {/* vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse at center, transparent 30%, ${BG} 85%)`,
      }} />

      {/* content */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        width: '100%', maxWidth: 480, padding: '0 32px',
      }}>

        {/* logo */}
        <img
          src="/logos/metera-logo.png"
          alt="Metera"
          style={{ height: 34, width: 'auto', filter: 'brightness(0) invert(1)', marginBottom: 56, opacity: 0.9 }}
        />

        {/* phrase */}
        <div style={{
          fontFamily: MONO,
          fontSize: 16,
          fontWeight: 400,
          letterSpacing: '-0.01em',
          color: GREEN,
          textAlign: 'center',
          marginBottom: 40,
          lineHeight: 1.5,
        }}>
          {phrase}
        </div>

        {/* terminal log */}
        <div style={{
          width: '100%',
          border: `1px solid ${LINE}`,
          borderRadius: 8,
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.02)',
        }}>
          {/* titlebar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px',
            borderBottom: `1px solid ${LINE}`,
            background: 'rgba(255,255,255,0.03)',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5F57' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FEBC2E' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#28C840' }} />
            <span style={{ fontFamily: MONO, fontSize: 11, color: DIM, marginLeft: 8 }}>metera — init</span>
          </div>

          {/* log lines */}
          <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LOG_LINES.slice(0, step).map((line, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                fontFamily: MONO, fontSize: 13,
                opacity: 0,
                animation: 'fade-line 0.25s ease forwards',
              }}>
                <span style={{ color: line.ok === true ? GREEN : MUTED, flexShrink: 0 }}>
                  {line.ok === true ? '✓' : '⠸'}
                </span>
                <span style={{ color: line.ok === true ? MUTED : TEXT, whiteSpace: 'pre' }}>
                  {line.text}
                </span>
                {line.ok === null && (
                  <span style={{ color: DIM, animation: 'blink-cursor 1s step-end infinite' }}>_</span>
                )}
              </div>
            ))}
            {step < LOG_LINES.length && (
              <div style={{ fontFamily: MONO, fontSize: 13, color: DIM }}>
                <span style={{ animation: 'blink-cursor 1s step-end infinite' }}>█</span>
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fade-line {
          from { opacity: 0; transform: translateX(-4px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  )
}

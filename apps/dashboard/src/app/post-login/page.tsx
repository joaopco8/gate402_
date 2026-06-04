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
const MONO = "'JetBrains Mono', monospace"
const SANS = "'Inter', sans-serif"

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

export default function PostLoginPage() {
  const [visible, setVisible] = useState(false)
  const [phrase]  = useState(() => PHRASES[Math.floor(Math.random() * PHRASES.length)])
  const [dots, setDots] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      i = (i + 1) % 4
      setDots('.'.repeat(i))
    }, 380)
    return () => clearInterval(id)
  }, [])

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
        gap: 0,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        width: '100%', maxWidth: 560, padding: '0 24px',
      }}>

        {/* logo */}
        <img
          src="/logos/metera-logo.png"
          alt="Metera"
          style={{ height: 20, width: 'auto', filter: 'brightness(0) invert(1)', marginBottom: 48, opacity: 0.7 }}
        />

        {/* top line */}
        <div style={{ width: '100%', height: 1, background: LINE }} />

        {/* phrase */}
        <div style={{
          padding: '20px 0',
          fontFamily: MONO,
          fontSize: 13,
          fontWeight: 400,
          letterSpacing: '0.04em',
          color: GREEN,
          textAlign: 'center',
          width: '100%',
        }}>
          {phrase}
        </div>

        {/* bottom line */}
        <div style={{ width: '100%', height: 1, background: LINE }} />

        {/* sub-label */}
        <div style={{
          marginTop: 32,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            {/* pulse dot */}
            <span style={{
              display: 'inline-block',
              width: 6, height: 6,
              borderRadius: '50%',
              background: GREEN,
              boxShadow: `0 0 8px ${GREEN}`,
              animation: 'pulse-dot 1.4s ease-in-out infinite',
            }} />
            <span style={{
              fontFamily: MONO, fontSize: 11,
              color: MUTED, letterSpacing: '0.08em',
            }}>
              loading{dots}
            </span>
          </div>

          <p style={{
            fontFamily: SANS, fontSize: 12,
            color: DIM, fontWeight: 300,
            letterSpacing: '0.01em', margin: 0,
            textAlign: 'center', lineHeight: 1.6,
          }}>
            Enjoy the experience.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { clearUserCacheCompat as clearUserCache } from '@/contexts/UserContext'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'

function getIntent(): string | null {
  // 1. URL param (set by login page via window.location.href)
  const urlIntent = new URLSearchParams(window.location.search).get('intent')
  if (urlIntent) return urlIntent
  // 2. sessionStorage (set by login page useEffect)
  try { const s = sessionStorage.getItem('gate402_intent'); if (s) return s } catch {}
  // 3. localStorage (set by billing page for non-logged-in users)
  try { const l = localStorage.getItem('gate402_intent'); if (l) return l } catch {}
  return null
}

function clearIntent() {
  try { sessionStorage.removeItem('gate402_intent') } catch {}
  try { localStorage.removeItem('gate402_intent') } catch {}
}

export default function PostLoginPage() {
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
              'x-user-id': user.id,
            },
          })
          const data = await res.json()
          console.log('[post-login] checkout response:', res.status, data)
          if (res.ok && data.url) {
            window.location.href = data.url
            return
          }
          // Checkout failed — go to billing page so user sees the error
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

      // No intent — normal post-login flow
      try {
        const res = await fetch(`${SERVER_URL}/api/users/me`, {
          headers: { 'x-user-id': user.id },
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
      background: '#0A0A0A',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
      color: '#555',
      fontSize: 13,
    }}>
      Redirecting...
    </div>
  )
}

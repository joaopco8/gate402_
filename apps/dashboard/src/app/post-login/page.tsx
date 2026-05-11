'use client'

import { useEffect } from 'react'
import { createClient } from '../../../lib/supabase/client'

export default function PostLoginPage() {
  useEffect(() => {
    async function handle() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'

      // Check for pending checkout intent set before login
      const intent = localStorage.getItem('gate402_intent')
      if (intent === 'checkout') {
        localStorage.removeItem('gate402_intent')
        try {
          const res = await fetch(`${SERVER_URL}/api/billing/checkout`, {
            method: 'POST',
            headers: { 'x-user-id': user.id },
          })
          const data = await res.json()
          if (data.url) {
            window.location.href = data.url
            return
          }
        } catch {}
        window.location.href = '/dashboard'
        return
      }

      // Normal post-login: check if new user → onboarding, else → dashboard
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
    handle()
  }, [])

  return (
    <div style={{
      background: '#000',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
      color: '#555',
      fontSize: 13,
    }}>
      Loading...
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { createClient } from '../../../../lib/supabase/client'

export default function CheckoutPage() {
  useEffect(() => {
    async function go() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login?next=/checkout'
        return
      }

      const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'
      try {
        const res = await fetch(`${SERVER_URL}/api/billing/checkout`, {
          method: 'POST',
          headers: { 'x-user-id': user.id },
        })
        const data = await res.json()
        if (data.url) {
          window.location.href = data.url
        } else {
          window.location.href = '/dashboard'
        }
      } catch {
        window.location.href = '/dashboard'
      }
    }
    go()
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
      Redirecting to checkout...
    </div>
  )
}

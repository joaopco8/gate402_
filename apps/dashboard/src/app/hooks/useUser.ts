'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'

interface UserData {
  id: string
  apiKey: string
  walletAddress: string | null
  plan: string
  network: string
  totalCalls: number
  totalEndpoints: number
}

export function useUser() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function syncUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoading(false); return }

        const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'

        // Create user record if it doesn't exist yet
        await fetch(`${SERVER_URL}/api/users/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ supabaseId: user.id, email: user.email }),
        })

        // Fetch full user profile
        const res = await fetch(`${SERVER_URL}/api/users/me`, {
          headers: { 'x-user-id': user.id },
        })

        if (res.ok) {
          const data = await res.json()
          setUserData(data)
        }
      } catch (error) {
        console.error('[useUser] Error:', error)
      } finally {
        setLoading(false)
      }
    }

    syncUser()
  }, [])

  return { userData, loading }
}

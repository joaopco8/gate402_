'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'

export interface PlanLimits {
  maxEndpoints: number
  recentCallsLimit: number
  chartDays: number
  hasAnalytics: boolean
  hasMetering: boolean
  hasExport: boolean
  hasLatency: boolean
  hasWallet: boolean
  hasMRR: boolean
}

export interface UserData {
  id: string
  apiKey: string
  walletAddress: string | null
  plan: 'free' | 'pro' | 'enterprise'
  network: string
  totalCalls: number
  totalEndpoints: number
  emailAlerts: boolean
  limits: PlanLimits
  createdAt: string
}

function buildLimits(plan: UserData['plan']): PlanLimits {
  const isPro = plan === 'pro' || plan === 'enterprise'
  return {
    maxEndpoints: isPro ? Infinity : 3,
    recentCallsLimit: isPro ? 100 : 10,
    chartDays: isPro ? 30 : 7,
    hasAnalytics: isPro,
    hasMetering: isPro,
    hasExport: isPro,
    hasLatency: isPro,
    hasWallet: isPro,
    hasMRR: isPro,
  }
}

export function useUser() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    async function syncUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoading(false); return }

        const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'

        try {
          fetch(`${SERVER_URL}/api/users/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ supabaseId: user.id, email: user.email }),
          }).catch(() => {})

          // Fetch full user profile
          const res = await fetch(`${SERVER_URL}/api/users/me`, {
            headers: { 'x-user-id': user.id },
          })

          if (res.ok) {
            const data = await res.json()
            setUserData(data)
            return
          }
        } catch {
          // server unreachable — fall through to Supabase fallback
        }

        // Fallback: read plan directly from Supabase when server is down
        const { data: row } = await supabase
          .from('User')
          .select('plan, walletAddress, network, apiKey, emailAlerts, createdAt')
          .eq('supabaseId', user.id)
          .single()

        if (row) {
          setUserData({
            id: user.id,
            apiKey: row.apiKey ?? '',
            walletAddress: row.walletAddress ?? null,
            plan: row.plan ?? 'free',
            network: row.network ?? 'devnet',
            totalCalls: 0,
            totalEndpoints: 0,
            emailAlerts: row.emailAlerts ?? false,
            limits: buildLimits(row.plan ?? 'free'),
            createdAt: row.createdAt ?? '',
          })
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

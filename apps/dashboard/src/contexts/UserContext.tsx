'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '../../lib/supabase/client'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'

// ── Types ─────────────────────────────────────────────────────────────────────

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
  webhookUrl?: string | null
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

// ── Context ───────────────────────────────────────────────────────────────────

interface UserContextValue {
  userData: UserData | null
  supabaseUserId: string | null
  supabaseUser: any | null
  accessToken: string | null
  isPro: boolean
  loading: boolean
  refresh: () => Promise<void>
  clearUserCache: () => void
}

const UserContext = createContext<UserContextValue>({
  userData: null,
  supabaseUserId: null,
  supabaseUser: null,
  accessToken: null,
  isPro: false,
  loading: true,
  refresh: async () => {},
  clearUserCache: () => {},
})

// ── Provider ──────────────────────────────────────────────────────────────────

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<any>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadUser = useCallback(async (token: string, sbUser: any) => {
    try {
      // Ensure user record exists (creates if first login)
      fetch(`${SERVER_URL}/api/users/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ supabaseId: sbUser.id, email: sbUser.email }),
      }).catch(() => {})

      const res = await fetch(`${SERVER_URL}/api/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        if (!data.limits) data.limits = buildLimits(data.plan ?? 'free')
        setUserData(data)
        setSupabaseUser(sbUser)
        setAccessToken(token)
        console.log('[UserContext] user loaded:', data.plan, sbUser.id.slice(0, 8))
      } else {
        console.error('[UserContext] /api/users/me failed:', res.status)
        setUserData(null)
      }
    } catch (e) {
      console.error('[UserContext] fetch error:', e)
      setUserData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) await loadUser(session.access_token, session.user)
  }, [supabase, loadUser])

  const clearUserCache = useCallback(() => {
    setUserData(null)
  }, [])

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION immediately for logged-in users
    // — no need to also call getSession() separately (avoids double loadUser call)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[UserContext] auth event:', event, !!session)
        if (event === 'SIGNED_OUT') {
          setUserData(null)
          setSupabaseUser(null)
          setAccessToken(null)
          setLoading(false)
          return
        }
        if (session?.access_token) {
          await loadUser(session.access_token, session.user)
        } else if (event === 'INITIAL_SESSION') {
          // Not logged in
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const isPro = userData?.plan === 'pro' || userData?.plan === 'enterprise'

  return (
    <UserContext.Provider value={{
      userData,
      supabaseUserId: supabaseUser?.id ?? null,
      supabaseUser,
      accessToken,
      isPro,
      loading,
      refresh,
      clearUserCache,
    }}>
      {children}
    </UserContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useUser() {
  return useContext(UserContext)
}

// Backward-compat export for post-login page
export function clearUserCacheCompat() {}

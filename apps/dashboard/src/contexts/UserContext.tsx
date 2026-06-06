'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
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

const CACHE_KEY = 'g402_user'
const CACHE_TTL = 5 * 60 * 1000 // 5 min

function readCache(): UserData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts < CACHE_TTL) return data
  } catch {}
  return null
}

function writeCache(data: UserData) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

function clearCache() {
  try { localStorage.removeItem(CACHE_KEY) } catch {}
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(() => {
    if (typeof window === 'undefined') return null
    return readCache()
  })
  const [supabaseUser, setSupabaseUser] = useState<any>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return true
    return readCache() === null
  })
  const fetchingRef = useRef(false)
  const loadedRef = useRef(false)
  const lastSyncRef = useRef(0)
  const supabase = createClient()

  const loadUser = useCallback(async (token: string, sbUser: any, force = false) => {
    // Prevent concurrent fetches and skip if already loaded (unless forced)
    if (fetchingRef.current) return
    if (loadedRef.current && !force) return
    fetchingRef.current = true
    try {
      // Ensure user record exists — debounced to 2min to avoid duplicate calls
      const now = Date.now()
      if (now - lastSyncRef.current > 120_000) {
        lastSyncRef.current = now
        fetch(`${SERVER_URL}/api/users/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ supabaseId: sbUser.id, email: sbUser.email }),
        }).catch(() => {})
      }

      const res = await fetch(`${SERVER_URL}/api/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        if (!data.limits) data.limits = buildLimits(data.plan ?? 'free')
        writeCache(data)
        setUserData(data)
        setSupabaseUser(sbUser)
        setAccessToken(token)
        loadedRef.current = true
      } else {
        console.error('[UserContext] /api/users/me failed:', res.status)
        setUserData(null)
      }
    } catch (e: any) {
      // "Failed to fetch" = network unreachable (server down / CORS). Fail silently.
      if (e?.name !== 'TypeError') {
        console.error('[UserContext] fetch error:', e)
      }
      setUserData(null)
    } finally {
      fetchingRef.current = false
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) await loadUser(session.access_token, session.user, true)
  }, [supabase, loadUser])

  const clearUserCache = useCallback(() => {
    setUserData(null)
  }, [])

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION immediately for logged-in users
    // — no need to also call getSession() separately (avoids double loadUser call)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          clearCache()
          setUserData(null)
          setSupabaseUser(null)
          setAccessToken(null)
          loadedRef.current = false
          setLoading(false)
          return
        }
        if (event === 'SIGNED_IN') {
          // Fresh login — force reload user data
          loadedRef.current = false
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

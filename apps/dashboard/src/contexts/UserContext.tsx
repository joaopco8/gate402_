'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react'
import { createClient } from '../../lib/supabase/client'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'
const CACHE_KEY = 'gate402_user_v2'
const CACHE_TTL = 60_000

// ── Types (keep backward-compat with old useUser hook) ───────────────────────

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

// ── Cache helpers ─────────────────────────────────────────────────────────────

function readCache(): UserData | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) { sessionStorage.removeItem(CACHE_KEY); return null }
    return data as UserData
  } catch { return null }
}

function writeCache(data: UserData) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

function clearCache() {
  try { sessionStorage.removeItem(CACHE_KEY) } catch {}
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
  const initialCache = typeof window !== 'undefined' ? readCache() : null
  const [userData, setUserData] = useState<UserData | null>(initialCache)
  const [supabaseUser, setSupabaseUser] = useState<any>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(!initialCache)
  const fetchedRef = useRef(false)
  const supabase = createClient()

  const fetchDbUser = useCallback(async (userId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    const authH: Record<string, string> = session
      ? { 'Authorization': `Bearer ${session.access_token}` }
      : {}
    try {
      // Fire-and-forget sync
      fetch(`${SERVER_URL}/api/users/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supabaseId: userId }),
      }).catch(() => {})

      const res = await fetch(`${SERVER_URL}/api/users/me`, { headers: authH })
      if (res.ok) {
        const data = await res.json()
        // Ensure limits exist
        if (!data.limits) data.limits = buildLimits(data.plan ?? 'free')
        setUserData(data)
        writeCache(data)
        return data
      }
    } catch {}

    // Fallback: Supabase direct
    try {
      const { data: row } = await supabase
        .from('User')
        .select('plan, walletAddress, network, apiKey, emailAlerts, createdAt')
        .eq('supabaseId', userId)
        .single()
      if (row) {
        const fallback: UserData = {
          id: userId,
          apiKey: row.apiKey ?? '',
          walletAddress: row.walletAddress ?? null,
          plan: row.plan ?? 'free',
          network: row.network ?? 'devnet',
          totalCalls: 0,
          totalEndpoints: 0,
          emailAlerts: row.emailAlerts ?? false,
          limits: buildLimits(row.plan ?? 'free'),
          createdAt: row.createdAt ?? '',
        }
        setUserData(fallback)
        return fallback
      }
    } catch {}
    return null
  }, [supabase])

  const refresh = useCallback(async () => {
    if (!supabaseUser) return
    clearCache()
    await fetchDbUser(supabaseUser.id)
  }, [supabaseUser, fetchDbUser])

  const clearUserCache = useCallback(() => {
    clearCache()
    setUserData(null)
    fetchedRef.current = false
  }, [])

  useEffect(() => {
    // Only fetch once per session
    if (fetchedRef.current) return
    fetchedRef.current = true

    async function init() {
      try {
        const { data: { session: initSession } } = await supabase.auth.getSession()
        const sbUser = initSession?.user ?? null
        if (!sbUser) { setLoading(false); return }

        setSupabaseUser(sbUser)
        setAccessToken(initSession?.access_token ?? null)

        const cached = readCache()
        if (cached) {
          setUserData(cached)
          setLoading(false)
          // Silent background refresh
          fetchDbUser(sbUser.id)
          return
        }

        await fetchDbUser(sbUser.id)
      } catch (e) {
        console.error('[UserContext] init error:', e)
      } finally {
        setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setSupabaseUser(null)
          setUserData(null)
          setAccessToken(null)
          clearCache()
          fetchedRef.current = false
        }
        if (event === 'SIGNED_IN' && session?.user) {
          setSupabaseUser(session.user)
          setAccessToken(session.access_token ?? null)
          fetchedRef.current = false
          clearCache()
          await fetchDbUser(session.user.id)
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

// ── Hook (backward-compatible with old useUser) ───────────────────────────────

export function useUser() {
  return useContext(UserContext)
}

// Keep old named export for post-login page
export function clearUserCacheCompat() {
  clearCache()
}

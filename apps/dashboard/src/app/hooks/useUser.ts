'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'

const CACHE_KEY = 'gate402_user_v1'
const CACHE_TTL = 30_000

function readCache(): UserData | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return data as UserData
  } catch { return null }
}

function writeCache(data: UserData) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

function clearCache() {
  try { sessionStorage.removeItem(CACHE_KEY) } catch {}
}

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
  const cached = typeof window !== 'undefined' ? readCache() : null
  const [userData, setUserData] = useState<UserData | null>(cached)
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(!cached)

  useEffect(() => {
    const supabase = createClient()
    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'

    async function syncUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoading(false); return }
        setSupabaseUserId(user.id)

        // Return immediately if cache still valid
        const hit = readCache()
        if (hit) { setUserData(hit); setLoading(false); return }

        // Fire-and-forget sync
        fetch(`${SERVER_URL}/api/users/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ supabaseId: user.id, email: user.email }),
        }).catch(() => {})

        try {
          const res = await fetch(`${SERVER_URL}/api/users/me`, {
            headers: { 'x-user-id': user.id },
          })
          if (res.ok) {
            const data = await res.json()
            setUserData(data)
            writeCache(data)
            return
          }
        } catch {
          // server unreachable — fall through to Supabase fallback
        }

        // Fallback: read plan directly from Supabase when server is down
        clearCache()
        const { data: row } = await supabase
          .from('User')
          .select('plan, walletAddress, network, apiKey, emailAlerts, createdAt')
          .eq('supabaseId', user.id)
          .single()

        if (row) {
          const fallback: UserData = {
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
          }
          setUserData(fallback)
        }
      } catch (error) {
        console.error('[useUser] Error:', error)
      } finally {
        setLoading(false)
      }
    }

    syncUser()
  }, [])

  const isPro = userData?.plan === 'pro' || userData?.plan === 'enterprise'

  return { userData, supabaseUserId, loading, isPro }
}

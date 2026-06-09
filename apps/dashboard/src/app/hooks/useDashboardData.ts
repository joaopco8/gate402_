'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.metera.xyz'
const MEM_TTL = 30_000   // 30s in-memory (matches Redis TTL)
const SESS_TTL = 120_000 // 2min sessionStorage (stale-while-revalidate)
const SESS_KEY = (url: string) => `g402_dash_${btoa(url).slice(0, 32)}`

const memCache = new Map<string, { data: any; ts: number }>()

function readSession(url: string): any | null {
  try {
    const raw = sessionStorage.getItem(SESS_KEY(url))
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > SESS_TTL) { sessionStorage.removeItem(SESS_KEY(url)); return null }
    return data
  } catch { return null }
}

function writeSession(url: string, data: any) {
  try { sessionStorage.setItem(SESS_KEY(url), JSON.stringify({ data, ts: Date.now() })) } catch {}
}

async function fetchWithCache(url: string, headers: Record<string, string>, onStale?: (d: any) => void) {
  // 1. In-memory cache (fresh)
  const mem = memCache.get(url)
  if (mem && Date.now() - mem.ts < MEM_TTL) return mem.data

  // 2. sessionStorage (stale) — return immediately, revalidate in background
  const stale = readSession(url)
  if (stale && onStale) {
    onStale(stale)
    // fall through to fetch fresh data
  }

  const res = await window.fetch(url, { headers })
  if (!res.ok) throw new Error(`fetch ${url} failed: ${res.status}`)
  const data = await res.json()
  memCache.set(url, { data, ts: Date.now() })
  writeSession(url, data)
  return data
}

export interface DashboardData {
  totalCalls: number
  totalUsdc: number
  callsToday: number
  callsYesterday: number
  usdcToday: number
  usdcYesterday: number
  callsThisWeek: number
  callsLastWeek: number
  revenueThisWeek: number
  revenueLastWeek: number
  recentCalls: Array<{
    id: string
    endpoint: string
    amountUsdc: number
    payerWallet: string | null
    status: string
    createdAt: string
  }>
  callsPerDay: Array<{
    date: string
    count: number
    amount: number
  }>
  endpoints: Array<{
    id: string
    path: string
    priceUsdc: number
    active: boolean
    totalCalls: number
  }>
  // raw server response for wallet page
  _raw?: any
}

function parseJson(json: any): DashboardData {
  const metrics = json.metrics ?? {}
  const rawPerDay = json.callsPerDay ?? []
  const callsPerDay = rawPerDay.map((d: any) => ({
    date: d.date, count: d.count ?? 0, amount: d.amount ?? 0,
  }))
  return {
    totalCalls: metrics.totalCalls ?? 0,
    totalUsdc: metrics.totalUsdc ?? 0,
    callsToday: metrics.callsToday ?? 0,
    callsYesterday: metrics.callsYesterday ?? 0,
    usdcToday: metrics.usdcToday ?? 0,
    usdcYesterday: metrics.usdcYesterday ?? 0,
    callsThisWeek: metrics.callsThisWeek ?? 0,
    callsLastWeek: metrics.callsLastWeek ?? 0,
    revenueThisWeek: metrics.revenueThisWeek ?? 0,
    revenueLastWeek: metrics.revenueLastWeek ?? 0,
    recentCalls: json.recentCalls ?? [],
    callsPerDay,
    endpoints: json.endpoints ?? [],
    _raw: json,
  }
}

export function useDashboardData(userId: string | null, isPro?: boolean, days = 7) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let isFetching = false

    async function fetchAll() {
      if (isFetching) return
      isFetching = true
      try {
        const supabase = createClient()

        // Get session — try refresh if expired
        let { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          const { data } = await supabase.auth.refreshSession()
          session = data.session
        }

        // Not logged in — don't fetch
        if (!session) {
          if (!cancelled) setLoading(false)
          return
        }

        const chartDays = isPro ? 30 : 7
        const effectiveDays = Math.min(days, chartDays)
        const url = `${SERVER_URL}/api/dashboard?days=${effectiveDays}`

        const authHeaders: Record<string, string> = { 'Authorization': `Bearer ${session.access_token}` }
        const json = await fetchWithCache(url, authHeaders, (stale) => {
          if (!cancelled) { setData(parseJson(stale)); setLoading(false) }
        })

        if (cancelled) return
        setData(parseJson(json))
        setLoading(false)
      } catch (e: any) {
        if (!cancelled) { setError(e.message); setLoading(false) }
      } finally {
        isFetching = false
      }
    }

    // Bust in-memory cache when period changes
    const chartDays = isPro ? 30 : 7
    const effectiveDays = Math.min(days, chartDays)
    memCache.delete(`${SERVER_URL}/api/dashboard?days=${effectiveDays}`)
    setLoading(true)
    fetchAll()
    const interval = setInterval(fetchAll, 300_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [userId, days, isPro])

  return { data, loading, error }
}

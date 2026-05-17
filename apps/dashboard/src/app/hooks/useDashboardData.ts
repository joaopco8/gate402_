'use client'
import { useEffect, useState } from 'react'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'
const CACHE_TTL = 10_000 // 10 seconds

const cache = new Map<string, { data: any; timestamp: number }>()

async function fetchWithCache(url: string, headers: Record<string, string>) {
  const cached = cache.get(url)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  const res = await window.fetch(url, { headers })
  if (!res.ok) throw new Error(`fetch ${url} failed: ${res.status}`)
  const data = await res.json()
  cache.set(url, { data, timestamp: Date.now() })
  return data
}

export interface DashboardData {
  totalCalls: number
  totalUsdc: number
  callsToday: number
  usdcToday: number
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

export function useDashboardData(userId: string | null, _isPro?: boolean) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    let cancelled = false

    async function fetchAll() {
      try {
        const url = `${SERVER_URL}/api/dashboard`
        const json = await fetchWithCache(url, { 'x-user-id': userId! })

        if (cancelled) return

        const metrics = json.metrics ?? {}
        const rawPerDay = json.callsPerDay ?? []

        // callsPerDay already has ISO dates from new route
        const callsPerDay = rawPerDay.map((d: any) => ({
          date: d.date,
          count: d.count ?? 0,
          amount: d.amount ?? 0,
        }))

        setData({
          totalCalls: metrics.totalCalls ?? 0,
          totalUsdc: metrics.totalUsdc ?? 0,
          callsToday: metrics.callsToday ?? 0,
          usdcToday: metrics.usdcToday ?? 0,
          recentCalls: json.recentCalls ?? [],
          callsPerDay,
          endpoints: json.endpoints ?? [],
          _raw: json,
        })
        setLoading(false)
      } catch (e: any) {
        if (!cancelled) setError(e.message)
      }
    }

    fetchAll()
    const interval = setInterval(fetchAll, 15_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [userId])

  return { data, loading, error }
}

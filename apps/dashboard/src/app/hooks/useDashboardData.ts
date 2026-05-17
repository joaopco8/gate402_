'use client'
import { useEffect, useState } from 'react'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.gate402.dev'

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
}

export function useDashboardData(userId: string | null, isPro: boolean) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    async function fetchAll() {
      try {
        const headers: Record<string, string> = { 'x-user-id': userId! }

        const [metricsRes, callsRes, perDayRes, endpointsRes] = await Promise.all([
          fetch(`${SERVER_URL}/api/metrics`, { headers }),
          fetch(`${SERVER_URL}/api/calls/recent`, { headers }),
          fetch(`${SERVER_URL}/api/calls/per-day`, { headers }),
          fetch(`${SERVER_URL}/api/endpoints`, { headers }),
        ])

        const [metrics, rawCalls, rawPerDay, endpoints]: [any, any[], any[], any[]] = await Promise.all([
          metricsRes.ok ? metricsRes.json() : {},
          callsRes.ok ? callsRes.json() : [],
          perDayRes.ok ? perDayRes.json() : [],
          endpointsRes.ok ? endpointsRes.json() : [],
        ])

        // Map per-day: API returns { date: "DD/MM", calls, usdc }
        const callsPerDay = (rawPerDay as any[]).map(d => ({
          date: d.date,
          count: d.calls ?? d.count ?? 0,
          amount: d.usdc ?? d.amount ?? 0,
        }))

        // Map recent calls: API returns { endpoint: { path }, amountUsdc, ... }
        const limit = isPro ? 50 : 5
        const recentCalls = (rawCalls as any[]).slice(0, limit).map((c: any) => ({
          id: c.id,
          endpoint: c.endpoint?.path ?? c.endpoint ?? '—',
          amountUsdc: c.amountUsdc ?? 0,
          payerWallet: c.payerWallet ?? null,
          status: c.status ?? 'unknown',
          createdAt: c.createdAt,
        }))

        setData({
          totalCalls: metrics.totalCalls ?? 0,
          totalUsdc: metrics.totalUsdc ?? 0,
          callsToday: metrics.todayCalls ?? metrics.callsToday ?? 0,
          usdcToday: metrics.todayUsdc ?? metrics.usdcToday ?? 0,
          recentCalls,
          callsPerDay,
          endpoints: endpoints ?? [],
        })
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
    const interval = setInterval(fetchAll, 10000)
    return () => clearInterval(interval)
  }, [userId, isPro])

  return { data, loading, error }
}

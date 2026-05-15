'use client'
import { useUser } from './useUser'

export function usePlan() {
  const { userData, loading } = useUser()
  const isPro = userData?.plan === 'pro' || userData?.plan === 'enterprise'
  return { userData, isPro, loading, limits: userData?.limits }
}

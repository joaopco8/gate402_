import { redis } from '../lib/redis'
import { prisma } from '../lib/prisma'

export type LimitCheckResult =
  | { allowed: true }
  | { allowed: false; reason: string; code: string; limit: number; current: number }

// ─── Bucket helpers ───────────────────────────────────────────────────────────

export function getHourBucket(): string {
  const n = new Date()
  return `${n.getUTCFullYear()}-${n.getUTCMonth()}-${n.getUTCDate()}-${n.getUTCHours()}`
}

export function getDayBucket(): string {
  const n = new Date()
  return `${n.getUTCFullYear()}-${n.getUTCMonth()}-${n.getUTCDate()}`
}

export function getMonthBucket(): string {
  const n = new Date()
  return `${n.getUTCFullYear()}-${n.getUTCMonth()}`
}

// ─── Resolve agentWalletId from agentKey header ───────────────────────────────

export async function resolveAgentWalletId(agentKey: string): Promise<string | null> {
  const cacheKey = `agentkey:${agentKey}:id`
  if (redis) {
    const cached = await redis.get(cacheKey).catch(() => null)
    if (cached) return cached
  }
  const wallet = await prisma.agentWallet.findUnique({
    where: { agentKey },
    select: { id: true },
  })
  if (!wallet) return null
  if (redis) redis.setex(cacheKey, 300, wallet.id).catch(() => {})
  return wallet.id
}

// ─── Load limits (cached 5 min) ───────────────────────────────────────────────

async function loadLimits(agentWalletId: string) {
  const cacheKey = `agent:${agentWalletId}:limits`
  if (redis) {
    const cached = await redis.get(cacheKey).catch(() => null)
    if (cached) return JSON.parse(cached)
  }
  const wallet = await prisma.agentWallet.findUnique({
    where: { id: agentWalletId },
    select: {
      maxPerCall: true,
      maxPerHour: true,
      maxPerDay: true,
      maxPerMonth: true,
      isActive: true,
      allowedEndpoints: true,
      blockedEndpoints: true,
    },
  })
  if (!wallet) return null
  if (redis) redis.setex(cacheKey, 300, JSON.stringify(wallet)).catch(() => {})
  return wallet
}

// ─── Check spending limits ────────────────────────────────────────────────────

export async function checkSpendingLimits(
  agentWalletId: string,
  amount: number,
): Promise<LimitCheckResult> {
  const limits = await loadLimits(agentWalletId)

  if (!limits) {
    return { allowed: false, reason: 'Agent wallet not found', code: 'WALLET_NOT_FOUND', limit: 0, current: 0 }
  }

  if (!limits.isActive) {
    return { allowed: false, reason: 'Agent wallet is inactive', code: 'WALLET_INACTIVE', limit: 0, current: 0 }
  }

  // 1. maxPerCall
  if (limits.maxPerCall !== null && amount > limits.maxPerCall) {
    return {
      allowed: false,
      reason: `Call amount $${amount} exceeds maxPerCall limit of $${limits.maxPerCall}`,
      code: 'MAX_PER_CALL_EXCEEDED',
      limit: limits.maxPerCall,
      current: amount,
    }
  }

  if (redis) {
    // 2. maxPerHour
    if (limits.maxPerHour !== null) {
      const spentHour = parseFloat(await redis.get(`agent:${agentWalletId}:spent:hour:${getHourBucket()}`).catch(() => null) || '0')
      if (spentHour + amount > limits.maxPerHour) {
        return {
          allowed: false,
          reason: `Hourly limit reached. Spent $${spentHour.toFixed(4)} of $${limits.maxPerHour}`,
          code: 'MAX_PER_HOUR_EXCEEDED',
          limit: limits.maxPerHour,
          current: spentHour,
        }
      }
    }

    // 3. maxPerDay
    if (limits.maxPerDay !== null) {
      const spentDay = parseFloat(await redis.get(`agent:${agentWalletId}:spent:day:${getDayBucket()}`).catch(() => null) || '0')
      if (spentDay + amount > limits.maxPerDay) {
        return {
          allowed: false,
          reason: `Daily limit reached. Spent $${spentDay.toFixed(4)} of $${limits.maxPerDay}`,
          code: 'MAX_PER_DAY_EXCEEDED',
          limit: limits.maxPerDay,
          current: spentDay,
        }
      }
    }

    // 4. maxPerMonth
    if (limits.maxPerMonth !== null) {
      const spentMonth = parseFloat(await redis.get(`agent:${agentWalletId}:spent:month:${getMonthBucket()}`).catch(() => null) || '0')
      if (spentMonth + amount > limits.maxPerMonth) {
        return {
          allowed: false,
          reason: `Monthly limit reached. Spent $${spentMonth.toFixed(4)} of $${limits.maxPerMonth}`,
          code: 'MAX_PER_MONTH_EXCEEDED',
          limit: limits.maxPerMonth,
          current: spentMonth,
        }
      }
    }
  }

  return { allowed: true }
}

// ─── Check endpoint access ────────────────────────────────────────────────────

export async function checkEndpointAccess(
  agentWalletId: string,
  endpoint: string,
): Promise<LimitCheckResult> {
  const cacheKey = `agent:${agentWalletId}:limits`
  const cached = redis ? await redis.get(cacheKey).catch(() => null) : null
  const limits = cached ? JSON.parse(cached) : await loadLimits(agentWalletId)

  if (!limits) return { allowed: true }

  if (limits.blockedEndpoints?.length > 0) {
    const blocked = limits.blockedEndpoints.some((b: string) => endpoint.startsWith(b))
    if (blocked) {
      return { allowed: false, reason: `Endpoint ${endpoint} is blocked for this agent`, code: 'ENDPOINT_BLOCKED', limit: 0, current: 0 }
    }
  }

  if (limits.allowedEndpoints?.length > 0) {
    const allowed = limits.allowedEndpoints.some((a: string) => endpoint.startsWith(a))
    if (!allowed) {
      return { allowed: false, reason: `Endpoint ${endpoint} is not in the allowed list`, code: 'ENDPOINT_NOT_ALLOWED', limit: 0, current: 0 }
    }
  }

  return { allowed: true }
}

// ─── Record spending after successful payment ─────────────────────────────────

export async function recordSpending(agentWalletId: string, amount: number): Promise<void> {
  if (redis) {
    const pipeline = redis.pipeline()
    const hourKey  = `agent:${agentWalletId}:spent:hour:${getHourBucket()}`
    const dayKey   = `agent:${agentWalletId}:spent:day:${getDayBucket()}`
    const monthKey = `agent:${agentWalletId}:spent:month:${getMonthBucket()}`

    pipeline.incrbyfloat(hourKey, amount)
    pipeline.expire(hourKey, 7200)
    pipeline.incrbyfloat(dayKey, amount)
    pipeline.expire(dayKey, 172800)
    pipeline.incrbyfloat(monthKey, amount)
    pipeline.expire(monthKey, 5356800)

    await pipeline.exec()
    redis.del(`agent:${agentWalletId}:stats`).catch(() => {})
  }

  // Update DB stats (non-blocking)
  prisma.agentWallet.update({
    where: { id: agentWalletId },
    data: {
      totalSpent: { increment: amount },
      totalCalls: { increment: 1 },
      lastCallAt: new Date(),
    },
  }).catch(console.error)
}

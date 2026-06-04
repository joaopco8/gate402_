export {}

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPipeline = {
  incrbyfloat: jest.fn().mockReturnThis(),
  expire: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([]),
}

jest.mock('../lib/redis', () => ({
  redis: {
    get: jest.fn().mockResolvedValue(null),
    setex: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    pipeline: jest.fn().mockReturnValue(mockPipeline),
  },
}))

jest.mock('../lib/prisma', () => ({
  prisma: {
    agentWallet: {
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    },
  },
}))

import {
  checkSpendingLimits,
  checkEndpointAccess,
  recordSpending,
} from '../services/spendingLimits'
import { prisma } from '../lib/prisma'
import { redis } from '../lib/redis'

const mockWallet = {
  maxPerCall: 0.01,
  maxPerHour: 1.00,
  maxPerDay: 10.00,
  maxPerMonth: 100.00,
  isActive: true,
  allowedEndpoints: [],
  blockedEndpoints: [],
}

// ─── checkSpendingLimits ──────────────────────────────────────────────────────

describe('checkSpendingLimits', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (redis!.get as jest.Mock).mockResolvedValue(null);
    (prisma.agentWallet.findUnique as jest.Mock).mockResolvedValue(mockWallet)
  })

  it('allows payment within all limits', async () => {
    const result = await checkSpendingLimits('agent-1', 0.001)
    expect(result.allowed).toBe(true)
  })

  it('blocks when amount exceeds maxPerCall', async () => {
    const result = await checkSpendingLimits('agent-1', 0.05)
    expect(result.allowed).toBe(false)
    expect((result as any).code).toBe('MAX_PER_CALL_EXCEEDED')
  })

  it('blocks when hourly limit would be exceeded', async () => {
    // amount 0.005 is within maxPerCall (0.01) so reaches hour check
    ;(redis!.get as jest.Mock)
      .mockResolvedValueOnce(null)   // limits cache miss
      .mockResolvedValueOnce('0.999') // hour bucket near limit
    const result = await checkSpendingLimits('agent-1', 0.005)
    expect(result.allowed).toBe(false)
    expect((result as any).code).toBe('MAX_PER_HOUR_EXCEEDED')
  })

  it('blocks when daily limit would be exceeded', async () => {
    ;(redis!.get as jest.Mock)
      .mockResolvedValueOnce(null)   // limits cache miss
      .mockResolvedValueOnce('0.5')  // hour ok (0.5 + 0.005 < 1.00)
      .mockResolvedValueOnce('9.999') // day near limit
    const result = await checkSpendingLimits('agent-1', 0.005)
    expect(result.allowed).toBe(false)
    expect((result as any).code).toBe('MAX_PER_DAY_EXCEEDED')
  })

  it('blocks when monthly limit would be exceeded', async () => {
    ;(redis!.get as jest.Mock)
      .mockResolvedValueOnce(null)    // limits cache miss
      .mockResolvedValueOnce('0')     // hour ok
      .mockResolvedValueOnce('0')     // day ok
      .mockResolvedValueOnce('99.999') // month near limit
    const result = await checkSpendingLimits('agent-1', 0.005)
    expect(result.allowed).toBe(false)
    expect((result as any).code).toBe('MAX_PER_MONTH_EXCEEDED')
  })

  it('returns WALLET_NOT_FOUND for unknown wallet', async () => {
    ;(prisma.agentWallet.findUnique as jest.Mock).mockResolvedValue(null)
    const result = await checkSpendingLimits('unknown', 0.001)
    expect(result.allowed).toBe(false)
    expect((result as any).code).toBe('WALLET_NOT_FOUND')
  })

  it('returns WALLET_INACTIVE for inactive wallet', async () => {
    ;(prisma.agentWallet.findUnique as jest.Mock).mockResolvedValue({ ...mockWallet, isActive: false })
    const result = await checkSpendingLimits('agent-1', 0.001)
    expect(result.allowed).toBe(false)
    expect((result as any).code).toBe('WALLET_INACTIVE')
  })

  it('allows any amount when no limits set', async () => {
    ;(prisma.agentWallet.findUnique as jest.Mock).mockResolvedValue({
      ...mockWallet,
      maxPerCall: null,
      maxPerHour: null,
      maxPerDay: null,
      maxPerMonth: null,
    })
    const result = await checkSpendingLimits('agent-1', 999)
    expect(result.allowed).toBe(true)
  })
})

// ─── checkEndpointAccess ──────────────────────────────────────────────────────

describe('checkEndpointAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (redis!.get as jest.Mock).mockResolvedValue(null);
    (prisma.agentWallet.findUnique as jest.Mock).mockResolvedValue(mockWallet)
  })

  it('allows all endpoints when no restrictions', async () => {
    ;(redis!.get as jest.Mock).mockResolvedValue(
      JSON.stringify({ blockedEndpoints: [], allowedEndpoints: [] })
    )
    const result = await checkEndpointAccess('agent-1', '/api/weather')
    expect(result.allowed).toBe(true)
  })

  it('blocks endpoint in blockedEndpoints', async () => {
    ;(redis!.get as jest.Mock).mockResolvedValue(
      JSON.stringify({ blockedEndpoints: ['/api/premium'], allowedEndpoints: [] })
    )
    const result = await checkEndpointAccess('agent-1', '/api/premium/data')
    expect(result.allowed).toBe(false)
    expect((result as any).code).toBe('ENDPOINT_BLOCKED')
  })

  it('blocks endpoint not in allowedEndpoints', async () => {
    ;(redis!.get as jest.Mock).mockResolvedValue(
      JSON.stringify({ blockedEndpoints: [], allowedEndpoints: ['/api/weather'] })
    )
    const result = await checkEndpointAccess('agent-1', '/api/analyze')
    expect(result.allowed).toBe(false)
    expect((result as any).code).toBe('ENDPOINT_NOT_ALLOWED')
  })

  it('allows endpoint matching allowedEndpoints prefix', async () => {
    ;(redis!.get as jest.Mock).mockResolvedValue(
      JSON.stringify({ blockedEndpoints: [], allowedEndpoints: ['/api/weather'] })
    )
    const result = await checkEndpointAccess('agent-1', '/api/weather')
    expect(result.allowed).toBe(true)
  })

  it('allows all when wallet has no restrictions', async () => {
    // DB fallback when cache miss returns wallet with empty lists
    ;(prisma.agentWallet.findUnique as jest.Mock).mockResolvedValue({ ...mockWallet, blockedEndpoints: [], allowedEndpoints: [] })
    const result = await checkEndpointAccess('agent-1', '/api/anything')
    expect(result.allowed).toBe(true)
  })
})

// ─── recordSpending ───────────────────────────────────────────────────────────

describe('recordSpending', () => {
  beforeEach(() => jest.clearAllMocks())

  it('increments all 3 time buckets via pipeline', async () => {
    await recordSpending('agent-1', 0.001)
    expect(mockPipeline.incrbyfloat).toHaveBeenCalledTimes(3)
    expect(mockPipeline.expire).toHaveBeenCalledTimes(3)
    expect(mockPipeline.exec).toHaveBeenCalledTimes(1)
  })

  it('updates wallet totalSpent + totalCalls in DB', async () => {
    await recordSpending('agent-1', 0.005)
    expect(prisma.agentWallet.update).toHaveBeenCalledWith({
      where: { id: 'agent-1' },
      data: {
        totalSpent: { increment: 0.005 },
        totalCalls: { increment: 1 },
        lastCallAt: expect.any(Date),
      },
    })
  })

  it('invalidates stats cache', async () => {
    await recordSpending('agent-1', 0.001)
    expect(redis!.del).toHaveBeenCalledWith('agent:agent-1:stats')
  })
})

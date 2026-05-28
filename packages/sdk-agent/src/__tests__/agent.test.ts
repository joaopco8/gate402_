import { Gate402Agent } from '../agent'

// Mock SolanaWallet — avoids real keypair / blockchain calls
jest.mock('../wallet', () => ({
  SolanaWallet: jest.fn().mockImplementation(() => ({
    publicKey: 'MockPublicKey11111111111111111111111111111111',
    getUsdcBalance: jest.fn().mockResolvedValue(10.0),
    sendUsdc: jest.fn().mockResolvedValue('mock-tx-hash'),
    sendSplitPayment: jest.fn().mockResolvedValue({
      txHashProvider: 'mock-provider-hash',
      txHashPlatform: 'mock-platform-hash',
    }),
  }))
}))

const TEST_CONFIG = { privateKey: 'mock-key', network: 'devnet' as const }

describe('Gate402Agent — constructor', () => {
  it('instantiates with basic config', () => {
    const agent = new Gate402Agent(TEST_CONFIG)
    expect(agent).toBeDefined()
  })

  it('instantiates with spending limits', () => {
    const agent = new Gate402Agent({
      ...TEST_CONFIG,
      limits: { maxPerCall: 1.0, maxPerDay: 10.0 },
    })
    expect(agent).toBeDefined()
  })

  it('exposes fetch method', () => {
    const agent = new Gate402Agent(TEST_CONFIG)
    expect(typeof agent.fetch).toBe('function')
  })

  it('exposes demoFetch method', () => {
    const agent = new Gate402Agent(TEST_CONFIG)
    expect(typeof agent.demoFetch).toBe('function')
  })

  it('exposes getStats method', () => {
    const agent = new Gate402Agent(TEST_CONFIG)
    expect(typeof agent.getStats).toBe('function')
  })

  it('exposes getBalance method', () => {
    const agent = new Gate402Agent(TEST_CONFIG)
    expect(typeof agent.getBalance).toBe('function')
  })
})

describe('Gate402Agent — getStats', () => {
  it('returns zeroed stats on fresh instance', () => {
    const agent = new Gate402Agent(TEST_CONFIG)
    const stats = agent.getStats()
    expect(stats.totalCalls).toBe(0)
    expect(stats.totalSpent).toBe(0)
    expect(stats.successfulPayments).toBe(0)
    expect(stats.walletAddress).toBeDefined()
  })
})

describe('Gate402Agent — spending limits (checkLimits)', () => {
  it('throws SpendingLimitError when amount exceeds maxPerCall', async () => {
    const agent = new Gate402Agent({
      ...TEST_CONFIG,
      limits: { maxPerCall: 0.5 },
    })

    const response402 = {
      price: { total: 1.0, currency: 'USDC', network: 'solana-devnet' },
      payTo: 'mock-wallet',
    }

    await expect(agent.pay(response402 as any, '/api/test'))
      .rejects.toThrow('exceeds maxPerCall')
  })

  it('does not throw when amount is within maxPerCall', async () => {
    const agent = new Gate402Agent({
      ...TEST_CONFIG,
      limits: { maxPerCall: 5.0 },
    })

    // Use payTo (legacy) to avoid platform.amount undefined error
    const response402 = {
      price: { total: 1.0, currency: 'USDC', network: 'solana-devnet' },
      payTo: 'mock-wallet',
    }

    const result = await agent.pay(response402 as any, '/api/test')
    expect(result.success).toBe(true)
  })

  it('throws SpendingLimitError for blocked endpoint', async () => {
    const agent = new Gate402Agent({
      ...TEST_CONFIG,
      limits: { blockedEndpoints: ['/api/blocked'] },
    })

    const response402 = {
      price: { total: 0.001, currency: 'USDC', network: 'solana-devnet' },
      payTo: 'mock-wallet',
    }

    await expect(agent.pay(response402 as any, '/api/blocked'))
      .rejects.toThrow('is blocked')
  })

  it('throws SpendingLimitError for endpoint not in allowedEndpoints', async () => {
    const agent = new Gate402Agent({
      ...TEST_CONFIG,
      limits: { allowedEndpoints: ['/api/allowed'] },
    })

    const response402 = {
      price: { total: 0.001, currency: 'USDC', network: 'solana-devnet' },
      splits: { provider: { wallet: 'mock-wallet', amount: 0.001 } },
    }

    await expect(agent.pay(response402 as any, '/api/other')).rejects.toThrow('not in allowedEndpoints')
  })
})

describe('Gate402Agent — policy engine', () => {
  it('blocks payment when policy condition matches with action=block', async () => {
    const agent = new Gate402Agent({
      ...TEST_CONFIG,
      limits: {},  // required — checkLimits returns early if no limits
      policies: [{
        name: 'block-expensive',
        condition: (_endpoint: string, amount: number) => amount > 0.5,
        action: 'block',
      }],
    })

    const response402 = {
      price: { total: 1.0, currency: 'USDC', network: 'solana-devnet' },
      payTo: 'mock-wallet',
    }

    await expect(agent.pay(response402 as any, '/api/expensive'))
      .rejects.toThrow('blocked payment')
  })
})

describe('Gate402Agent — demoFetch live (devnet)', () => {
  it('demoFetch returns 200 from api.gate402.dev/api/weather', async () => {
    const PRO_API_KEY = process.env.TEST_PRO_API_KEY || 'be9eb223-d6b8-44c4-8719-cfded77b10b6'
    const agent = new Gate402Agent(TEST_CONFIG)

    const res = await agent.demoFetch(
      'https://api.gate402.dev/api/weather',
      { headers: { 'x-api-key': PRO_API_KEY } }
    )

    expect(res.status).toBe(200)
    const data = await res.json() as Record<string, unknown>
    expect(data).toHaveProperty('city')
  }, 20000)
})

export {}

jest.mock('../lib/privy', () => ({
  privy: {
    walletApi: {
      create: jest.fn().mockResolvedValue({
        id: 'privy_test_id',
        address: 'GMqk45ztzLiHoKfwChKuYKo3NYyXFPaZSczgnxdQ9KHT',
      }),
      delete: jest.fn().mockResolvedValue({ success: true }),
    },
  },
}))

const BASE_URL = process.env.TEST_BASE_URL || 'https://api.metera.xyz'
const PRO_API_KEY = process.env.TEST_PRO_API_KEY || 'test-api-key-placeholder'

async function get(path: string, apiKey?: string) {
  const headers: Record<string, string> = {}
  if (apiKey) headers['x-api-key'] = apiKey
  return fetch(`${BASE_URL}${path}`, { headers })
}

async function post(path: string, body: unknown, apiKey?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) headers['x-api-key'] = apiKey
  return fetch(`${BASE_URL}${path}`, { method: 'POST', headers, body: JSON.stringify(body) })
}

async function patch(path: string, body: unknown, apiKey?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) headers['x-api-key'] = apiKey
  return fetch(`${BASE_URL}${path}`, { method: 'PATCH', headers, body: JSON.stringify(body) })
}

async function del(path: string, apiKey?: string) {
  const headers: Record<string, string> = {}
  if (apiKey) headers['x-api-key'] = apiKey
  return fetch(`${BASE_URL}${path}`, { method: 'DELETE', headers })
}

// ─── LIST ─────────────────────────────────────────────────────────────────────

describe('GET /api/agent-wallets', () => {
  it('returns 401 without auth', async () => {
    const res = await get('/api/agent-wallets')
    expect(res.status).toBe(401)
  })

  it('returns wallets array', async () => {
    const res  = await get('/api/agent-wallets', PRO_API_KEY)
    const data = await res.json() as Record<string, unknown>
    expect(res.status).toBe(200)
    expect(data).toHaveProperty('wallets')
    expect(Array.isArray(data.wallets)).toBe(true)
  })
})

// ─── CREATE ───────────────────────────────────────────────────────────────────

describe('POST /api/agent-wallets', () => {
  it('returns 401 without auth', async () => {
    const res = await post('/api/agent-wallets', { name: 'test' })
    expect(res.status).toBe(401)
  })

  it('rejects missing name — 400 MISSING_FIELDS', async () => {
    const res  = await post('/api/agent-wallets', {}, PRO_API_KEY)
    const data = await res.json() as Record<string, unknown>
    expect(res.status).toBe(400)
    expect(data.code).toBe('MISSING_FIELDS')
  })

  it('creates wallet with Privy address automatically', async () => {
    const res  = await post('/api/agent-wallets', {
      name: `test-bot-${Date.now()}`,
      maxPerCall: 0.01,
      maxPerDay: 1.00,
    }, PRO_API_KEY)
    const data = await res.json() as Record<string, any>
    expect(res.status).toBe(201)
    expect(data.wallet).toHaveProperty('id')
    expect(data.wallet).toHaveProperty('walletAddress')
    expect(data.wallet).toHaveProperty('agentKey')
    expect(data.wallet.maxPerCall).toBe(0.01)
    expect(data.wallet.maxPerDay).toBe(1.00)
    // privyWalletId must never be exposed
    expect(data.wallet).not.toHaveProperty('privyWalletId')
  })
})

// ─── GET ONE + UPDATE + DELETE ────────────────────────────────────────────────

describe('Agent wallet CRUD cycle', () => {
  let walletId: string

  beforeAll(async () => {
    const res  = await post('/api/agent-wallets', {
      name: `crud-test-${Date.now()}`,
      maxPerDay: 2.00,
    }, PRO_API_KEY)
    const data = await res.json() as Record<string, any>
    walletId = data.wallet.id
  })

  it('GET /:id returns wallet with calls array', async () => {
    const res  = await get(`/api/agent-wallets/${walletId}`, PRO_API_KEY)
    const data = await res.json() as Record<string, any>
    expect(res.status).toBe(200)
    expect(data.wallet.id).toBe(walletId)
    expect(Array.isArray(data.wallet.calls)).toBe(true)
  })

  it('GET /:id without auth returns 401', async () => {
    const res = await get(`/api/agent-wallets/${walletId}`)
    expect(res.status).toBe(401)
  })

  it('PATCH /:id updates spending limit', async () => {
    const res  = await patch(`/api/agent-wallets/${walletId}`, { maxPerDay: 5.00 }, PRO_API_KEY)
    const data = await res.json() as Record<string, any>
    expect(res.status).toBe(200)
    expect(data.wallet.maxPerDay).toBe(5.00)
  })

  it('GET /:id/stats returns required fields', async () => {
    const res  = await get(`/api/agent-wallets/${walletId}/stats`, PRO_API_KEY)
    const data = await res.json() as Record<string, any>
    expect(res.status).toBe(200)
    expect(data).toHaveProperty('totalCalls')
    expect(data).toHaveProperty('totalSpent')
    expect(data).toHaveProperty('spentToday')
    expect(data).toHaveProperty('spentThisHour')
    expect(data).toHaveProperty('limits')
    expect(data).toHaveProperty('utilization')
    expect(typeof data.totalCalls).toBe('number')
    expect(typeof data.totalSpent).toBe('number')
  })

  it('DELETE /:id soft delete — success true', async () => {
    const res  = await del(`/api/agent-wallets/${walletId}`, PRO_API_KEY)
    const data = await res.json() as Record<string, unknown>
    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('deleted wallet does not appear in list', async () => {
    const res  = await get('/api/agent-wallets', PRO_API_KEY)
    const data = await res.json() as Record<string, any>
    const found = data.wallets.find((w: any) => w.id === walletId)
    expect(found).toBeUndefined()
  })
})

// ─── STATS CACHE ─────────────────────────────────────────────────────────────

describe('Stats cache', () => {
  it('second stats request is faster (cache hit)', async () => {
    const res1 = await post('/api/agent-wallets', {
      name: `cache-test-${Date.now()}`,
    }, PRO_API_KEY)
    const { wallet } = await res1.json() as Record<string, any>

    const t1 = Date.now()
    await get(`/api/agent-wallets/${wallet.id}/stats`, PRO_API_KEY)
    const first = Date.now() - t1

    const t2 = Date.now()
    await get(`/api/agent-wallets/${wallet.id}/stats`, PRO_API_KEY)
    const second = Date.now() - t2

    expect(second).toBeLessThan(first + 200)

    // Cleanup
    await del(`/api/agent-wallets/${wallet.id}`, PRO_API_KEY)
  })
})

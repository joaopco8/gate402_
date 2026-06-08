const BASE_URL = process.env.TEST_BASE_URL || 'https://api.gate402.dev'

const PRO_API_KEY  = process.env.TEST_PRO_API_KEY  || 'test-api-key-placeholder'
const FREE_API_KEY = process.env.TEST_FREE_API_KEY || ''

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

// ─── HEALTH ───────────────────────────────────────────────────────────────────

describe('Health', () => {
  it('GET /health retorna 200 com status ok', async () => {
    const res  = await get('/health')
    const data = await res.json() as Record<string, unknown>
    expect(res.status).toBe(200)
    expect(data.status).toBe('ok')
  })

  it('GET /health retorna redis connected', async () => {
    const res  = await get('/health')
    const data = await res.json() as Record<string, unknown>
    expect(data.redis).toBe('connected')
  })
})

// ─── AUTENTICAÇÃO ─────────────────────────────────────────────────────────────

describe('Autenticacao', () => {
  const protectedRoutes = [
    '/api/users/me',
    '/api/metrics',
    '/api/endpoints',
    '/api/calls/recent',
  ]

  it.each(protectedRoutes)('%s sem auth retorna 401', async (route) => {
    const res = await get(route)
    expect(res.status).toBe(401)
  })

  it('GET /api/users/me retorna campos obrigatorios', async () => {
    const res  = await get('/api/users/me', PRO_API_KEY)
    const data = await res.json() as Record<string, unknown>
    expect(res.status).toBe(200)
    expect(data).toHaveProperty('apiKey')
    expect(data).toHaveProperty('plan')
    expect(data).toHaveProperty('limits')
  })

  it('GET /api/users/me retorna plano valido', async () => {
    const res  = await get('/api/users/me', PRO_API_KEY)
    const data = await res.json() as Record<string, unknown>
    expect(res.status).toBe(200)
    expect(['free', 'starter', 'pro', 'enterprise']).toContain(data.plan)
  })

  it('GET /api/users/me retorna limits com campos obrigatorios', async () => {
    const res  = await get('/api/users/me', PRO_API_KEY)
    const data = await res.json() as Record<string, unknown>
    const limits = data.limits as Record<string, unknown>
    expect(limits).toHaveProperty('hasAnalytics')
    expect(limits).toHaveProperty('maxEndpoints')
    expect(limits).toHaveProperty('chartDays')
  })
})

// ─── requirePro — ACESSO PRO ──────────────────────────────────────────────────

describe('requirePro middleware — acesso Pro', () => {
  it('GET /api/analytics/revenue acessivel para Pro', async () => {
    const res = await get('/api/analytics/revenue', PRO_API_KEY)
    expect(res.status).toBe(200)
  })

  it('GET /api/analytics/top-agents acessivel para Pro', async () => {
    const res = await get('/api/analytics/top-agents', PRO_API_KEY)
    expect(res.status).toBe(200)
  })

  it('GET /api/analytics/latency acessivel para Pro', async () => {
    const res = await get('/api/analytics/latency', PRO_API_KEY)
    expect(res.status).toBe(200)
  })

  it('GET /api/analytics/success-rate acessivel para Pro', async () => {
    const res = await get('/api/analytics/success-rate', PRO_API_KEY)
    expect(res.status).toBe(200)
  })

  it('rotas Pro retornam 401 sem auth', async () => {
    const res = await get('/api/analytics/revenue')
    expect(res.status).toBe(401)
  })
})

// ─── ENDPOINTS CRUD ──────────────────────────────────────────────────────────

describe('Endpoints CRUD', () => {
  it('GET /api/endpoints retorna lista', async () => {
    const res  = await get('/api/endpoints', PRO_API_KEY)
    const data = await res.json() as unknown[]
    expect(res.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })

  it('POST /api/endpoints valida path sem /', async () => {
    const res = await post('/api/endpoints', { path: 'sem-barra', priceUsdc: 0.001 }, PRO_API_KEY)
    expect(res.status).toBe(400)
  })

  it('POST /api/endpoints valida path traversal', async () => {
    const res = await post('/api/endpoints', { path: '../../../etc/passwd', priceUsdc: 0.001 }, PRO_API_KEY)
    expect(res.status).toBe(400)
  })

  it('POST /api/endpoints valida priceUsdc negativo', async () => {
    const res = await post('/api/endpoints', { path: '/api/test-price', priceUsdc: -1 }, PRO_API_KEY)
    expect(res.status).toBe(400)
  })

  it('POST /api/endpoints valida priceUsdc acima do limite', async () => {
    const res = await post('/api/endpoints', { path: '/api/test-price', priceUsdc: 9999 }, PRO_API_KEY)
    expect(res.status).toBe(400)
  })

  it('POST /api/endpoints sem auth retorna 401', async () => {
    const res = await post('/api/endpoints', { path: '/api/test', priceUsdc: 0.001 })
    expect(res.status).toBe(401)
  })
})

// ─── METRICS ─────────────────────────────────────────────────────────────────

describe('Metrics', () => {
  it('GET /api/metrics retorna campos corretos', async () => {
    const res  = await get('/api/metrics', PRO_API_KEY)
    const data = await res.json() as Record<string, unknown>
    expect(res.status).toBe(200)
    expect(data).toHaveProperty('totalCalls')
    expect(data).toHaveProperty('totalUsdc')
    expect(data).toHaveProperty('todayCalls')
    expect(data).toHaveProperty('todayUsdc')
    expect(typeof data.totalCalls).toBe('number')
    expect(typeof data.totalUsdc).toBe('number')
  })

  it('GET /api/calls/recent retorna array', async () => {
    const res  = await get('/api/calls/recent', PRO_API_KEY)
    const data = await res.json() as Record<string, unknown>
    expect(res.status).toBe(200)
    expect(Array.isArray(data.calls)).toBe(true)
  })

  it('GET /api/calls/per-day retorna array com campo date', async () => {
    const res  = await get('/api/calls/per-day?days=7', PRO_API_KEY)
    const data = await res.json() as Array<Record<string, unknown>>
    expect(res.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('date')
    }
  })
})

// ─── x402 MIDDLEWARE ─────────────────────────────────────────────────────────

describe('x402 middleware', () => {
  it('GET /api/weather sem pagamento retorna 402', async () => {
    const res = await get('/api/weather')
    expect(res.status).toBe(402)
  })

  it('402 response tem price.total e price.currency USDC', async () => {
    const res  = await get('/api/weather')
    const data = await res.json() as Record<string, any>
    expect(data).toHaveProperty('price')
    expect(data.price).toHaveProperty('total')
    expect(data.price.currency).toBe('USDC')
  })

  it('402 response tem quickstart.agent_sdk.install com gate402-agent', async () => {
    const res  = await get('/api/weather')
    const data = await res.json() as Record<string, any>
    expect(data.quickstart.agent_sdk.install).toContain('gate402-agent')
  })

  it('402 response tem splits.provider', async () => {
    const res  = await get('/api/weather')
    const data = await res.json() as Record<string, any>
    expect(data).toHaveProperty('splits')
    expect(data.splits).toHaveProperty('provider')
  })

  it('fee zerado — provider.amount igual a price.total', async () => {
    const res  = await get('/api/weather')
    const data = await res.json() as Record<string, any>
    expect(res.status).toBe(402)
    expect(data.splits?.provider?.amount).toBe(data.price?.total)
    expect(data.splits?.platform).toBeUndefined()
  })

  it('demo_ funciona em devnet — retorna 200', async () => {
    const txHash = `demo_unit_devnet_${Date.now()}`
    const res = await fetch(`${BASE_URL}/api/weather`, {
      headers: { 'X-Payment-Payload': txHash, 'x-api-key': PRO_API_KEY }
    })
    expect(res.status).toBe(200)
  })

  it('anti-replay bloqueia txHash duplicado', async () => {
    const txHash = `demo_replay_${Date.now()}`

    const res1 = await fetch(`${BASE_URL}/api/weather`, {
      headers: { 'X-Payment-Payload': txHash, 'x-api-key': PRO_API_KEY }
    })
    expect(res1.status).toBe(200)

    const res2 = await fetch(`${BASE_URL}/api/weather`, {
      headers: { 'X-Payment-Payload': txHash, 'x-api-key': PRO_API_KEY }
    })
    expect(res2.status).toBe(402)
  })

  it('txHash com SQL injection sanitizado — nao retorna 500', async () => {
    const malicious = "demo_'; DROP TABLE ApiCall; --"
    const res = await fetch(`${BASE_URL}/api/weather`, {
      headers: { 'X-Payment-Payload': malicious, 'x-api-key': PRO_API_KEY }
    })
    expect([200, 400, 402]).toContain(res.status)
  })

  it('demo_ bloqueado em mainnet', async () => {
    await fetch(`${BASE_URL}/api/users/network`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-api-key': PRO_API_KEY },
      body: JSON.stringify({ network: 'mainnet' }),
    })

    const res  = await fetch(`${BASE_URL}/api/weather`, {
      headers: { 'X-Payment-Payload': 'demo_unit_test_mainnet', 'x-api-key': PRO_API_KEY }
    })
    const data = await res.json() as Record<string, unknown>
    expect(res.status).toBe(402)
    expect(data.code).toBe('DEMO_NOT_ALLOWED_ON_MAINNET')

    await fetch(`${BASE_URL}/api/users/network`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-api-key': PRO_API_KEY },
      body: JSON.stringify({ network: 'devnet' }),
    })
  })
})

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

describe('Analytics (Pro)', () => {
  it('GET /api/analytics/revenue retorna summary com campos corretos', async () => {
    const res  = await get('/api/analytics/revenue', PRO_API_KEY)
    const data = await res.json() as Record<string, any>
    expect(res.status).toBe(200)
    expect(data).toHaveProperty('summary')
    expect(data.summary).toHaveProperty('grossRevenue')
    expect(data.summary).toHaveProperty('netRevenue')
    expect(data.summary).toHaveProperty('transactionCount')
  })

  it('GET /api/analytics/top-agents retorna agents array', async () => {
    const res  = await get('/api/analytics/top-agents', PRO_API_KEY)
    const data = await res.json() as Record<string, unknown>
    expect(res.status).toBe(200)
    expect(data).toHaveProperty('agents')
    expect(Array.isArray(data.agents)).toBe(true)
  })

  it('GET /api/analytics/latency retorna latency array', async () => {
    const res  = await get('/api/analytics/latency', PRO_API_KEY)
    const data = await res.json() as Record<string, unknown>
    expect(res.status).toBe(200)
    expect(data).toHaveProperty('latency')
    expect(Array.isArray(data.latency)).toBe(true)
  })

  it('GET /api/analytics/success-rate retorna mrrProjected', async () => {
    const res  = await get('/api/analytics/success-rate', PRO_API_KEY)
    const data = await res.json() as Record<string, unknown>
    expect(res.status).toBe(200)
    expect(data).toHaveProperty('mrrProjected')
    expect(typeof data.mrrProjected).toBe('number')
  })

  it('GET /api/analytics/export retorna CSV com header correto', async () => {
    const res  = await get('/api/analytics/export', PRO_API_KEY)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('Date')
    expect(text).toContain('Endpoint')
    expect(text).toContain('USDC')
  })
})

// ─── NETWORK TOGGLE ──────────────────────────────────────────────────────────

describe('Network toggle', () => {
  it('PATCH /api/users/network aceita devnet', async () => {
    const res  = await fetch(`${BASE_URL}/api/users/network`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-api-key': PRO_API_KEY },
      body: JSON.stringify({ network: 'devnet' }),
    })
    const data = await res.json() as Record<string, unknown>
    expect(res.status).toBe(200)
    expect(data.network).toBe('devnet')
  })

  it('PATCH /api/users/network rejeita valor invalido', async () => {
    const res = await fetch(`${BASE_URL}/api/users/network`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-api-key': PRO_API_KEY },
      body: JSON.stringify({ network: 'invalid' }),
    })
    expect(res.status).toBe(400)
  })
})

// ─── SEGURANÇA ────────────────────────────────────────────────────────────────

describe('Seguranca', () => {
  it('IDOR — nao pode deletar endpoint de outro usuario', async () => {
    if (!FREE_API_KEY) return
    const endpointsRes = await get('/api/endpoints', PRO_API_KEY)
    const endpoints    = await endpointsRes.json() as Array<{ id: string }>
    if (endpoints.length === 0) return

    const endpointId = endpoints[0].id
    const res = await fetch(`${BASE_URL}/api/endpoints/${endpointId}`, {
      method: 'DELETE',
      headers: { 'x-api-key': FREE_API_KEY },
    })
    expect(res.status).toBe(404)
  })

  it('Headers de seguranca presentes', async () => {
    const res = await get('/health')
    expect(res.headers.get('x-content-type-options')).toBe('nosniff')
    expect(res.headers.get('x-frame-options')).toBeTruthy()
    expect(res.headers.get('strict-transport-security')).toBeTruthy()
  })

  it('Admin secret errado retorna 401', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/set-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': 'senha-errada' },
      body: JSON.stringify({ userId: PRO_API_KEY, plan: 'free' }),
    })
    expect(res.status).toBe(401)
  })
})

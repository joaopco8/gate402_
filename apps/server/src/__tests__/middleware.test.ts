const BASE_URL = 'https://api.gate402.dev'

// Free plan user (jpoliveiraa.coo@gmail.com)
const FREE_USER_ID = '694bd610-19c5-4eef-8da2-50e1b72da950'
// Pro/test user
const PRO_USER_ID = '4b25eb5d-7e35-4e5b-b631-9f1e9637269c'

describe('API health', () => {
  it('GET /health retorna 200', async () => {
    const res = await fetch(`${BASE_URL}/health`)
    const data = await res.json() as Record<string, unknown>
    expect(res.status).toBe(200)
    expect(data.status).toBe('ok')
  })
})

describe('Auth middleware', () => {
  it('GET /api/analytics/revenue sem auth retorna 401', async () => {
    const res = await fetch(`${BASE_URL}/api/analytics/revenue`)
    expect(res.status).toBe(401)
  })

  it('GET /api/analytics/revenue com user valido retorna 200', async () => {
    const res = await fetch(`${BASE_URL}/api/analytics/revenue`, {
      headers: { 'x-user-id': FREE_USER_ID },
    })
    // Endpoint retorna dados — usuario tem acesso
    expect(res.status).toBe(200)
  })

  it('POST /api/endpoints sem auth retorna 401', async () => {
    const res = await fetch(`${BASE_URL}/api/endpoints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: '/test', priceUsdc: 0.001 }),
    })
    expect(res.status).toBe(401)
  })
})

describe('Input validation', () => {
  it('Path invalido (../etc/passwd) retorna 400', async () => {
    const res = await fetch(`${BASE_URL}/api/endpoints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': PRO_USER_ID,
      },
      body: JSON.stringify({ path: '../etc/passwd', priceUsdc: 0.001 }),
    })
    expect(res.status).toBe(400)
  })
})

describe('demo_ payload bloqueado em mainnet', () => {
  it('demo_ em mainnet retorna 402 com DEMO_NOT_ALLOWED_ON_MAINNET', async () => {
    // Ativa mainnet
    await fetch(`${BASE_URL}/api/users/network`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': PRO_USER_ID,
      },
      body: JSON.stringify({ network: 'mainnet' }),
    })

    const res = await fetch(`${BASE_URL}/api/weather`, {
      headers: {
        'X-Payment-Payload': 'demo_mainnet_test_jest',
        'x-api-key': 'be9eb223-d6b8-44c4-8719-cfded77b10b6',
      },
    })
    expect(res.status).toBe(402)
    const data = await res.json() as Record<string, unknown>
    expect(data.code).toBe('DEMO_NOT_ALLOWED_ON_MAINNET')

    // Volta para devnet
    await fetch(`${BASE_URL}/api/users/network`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': PRO_USER_ID,
      },
      body: JSON.stringify({ network: 'devnet' }),
    })
  })
})

import express from 'express'
import { gate402, tokenMeter, computeMeter } from 'gate402'

const app = express()
app.use(express.json())

const SERVER_URL = 'https://api.gate402.dev'
const API_KEY = process.env.GATE402_API_KEY || 'your-key'

// Endpoint 1 — request-based (fixed price per call)
app.use('/api/search', gate402({
  apiKey: API_KEY,
  serverUrl: SERVER_URL,
  endpoints: { '/api/search': 0.001 }
}))

// Endpoint 2 — token-based (upfront entry + post-execution token billing)
app.use('/api/chat', gate402({
  apiKey: API_KEY,
  serverUrl: SERVER_URL,
  endpoints: { '/api/chat': 0.001 }
}))
app.use('/api/chat', tokenMeter({
  pricePerToken: 0.000001,
  serverUrl: SERVER_URL,
  apiKey: API_KEY,
  tokenCounter: (_req, res) => res.locals.tokensUsed || 0
}))

// Endpoint 3 — compute-based (upfront entry + ms billing)
app.use('/api/process', gate402({
  apiKey: API_KEY,
  serverUrl: SERVER_URL,
  endpoints: { '/api/process': 0.001 }
}))
app.use('/api/process', computeMeter({
  pricePerMs: 0.0000001,
  serverUrl: SERVER_URL,
  apiKey: API_KEY,
}))

// Handlers
app.post('/api/search', (req, res) => {
  res.json({ results: ['result 1', 'result 2'], query: req.body.q })
})

app.post('/api/chat', (req, res) => {
  const response = `Response to: ${req.body.message}`
  res.locals.tokensUsed = Math.ceil(response.length / 4)
  res.json({ response, model: 'gpt-4' })
})

app.post('/api/process', async (_req, res) => {
  await new Promise(r => setTimeout(r, 500))
  res.json({ processed: true })
})

app.listen(3000, () => {
  console.log('Metering example running on 3000')
  console.log('Request billing: /api/search')
  console.log('Token billing:   /api/chat')
  console.log('Compute billing: /api/process')
})

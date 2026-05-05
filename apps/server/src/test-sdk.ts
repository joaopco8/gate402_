import { gate402 } from 'gate402'
import express from 'express'

const app = express()

// Teste: usar o SDK em vez do middleware manual
app.use(gate402({
  apiKey: '694bd610-19c5-4eef-8da2-50e1b72da950',
  endpoints: {
    '/api/weather': 0.001,
    '/api/news': 0.002,
  },
  walletAddress: '7UQctUWgfH87jjz9xjnCCKVY6Q1tMWZ8i1ZB3Whx939D',
  network: 'devnet'
}))

app.get('/api/weather', (req, res) => {
  res.json({ city: 'São Paulo', temp: '28°C' })
})

app.listen(3002, () => {
  console.log('SDK test server running on port 3002')
})

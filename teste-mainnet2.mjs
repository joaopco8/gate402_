import { Gate402Agent } from 'gate402-agent'

const agent = new Gate402Agent({
  privateKey: '2CnXpwucXT7AqjzFs4JJDQ3MsQvpR4nWEJtYkYwBfbRLcGmSvCNuVvGdaFSWLvJ3Pm2wmQsA1HjYHiaguhmfPWqz',
  network: 'mainnet',
  debug: true,
  limits: { maxPerCall: 0.01, maxPerDay: 0.10 }
})

console.log('Carteira 1 pagando para Carteira 2...')

const res = await agent.fetch(
  'https://api.gate402.dev/api/weather',
  { headers: { 'x-api-key': '4d952da4-d9af-4737-80ae-f2568b88b1a5' } }
)

const data = await res.json()
console.log('Status:', res.status)
console.log('Resposta:', JSON.stringify(data, null, 2))

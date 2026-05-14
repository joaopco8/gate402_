import express from 'express'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { z } from 'zod'
import { gate402MCP } from 'gate402'

const app = express()
app.use(express.json())

// Gate402 MCP middleware — charges per tool call
app.use(gate402MCP({
  apiKey: process.env.GATE402_API_KEY || 'your-key',
  walletAddress: process.env.SOLANA_WALLET || 'your-wallet',
  network: 'devnet',
  serverUrl: 'https://api.gate402.dev',
  defaultToolPrice: 0.001,
  toolPricing: {
    'analyze_data': 0.005,
    'search_web': 0.002,
    'generate_report': 0.010,
  }
}))

const server = new McpServer({
  name: 'gate402-example-mcp',
  version: '1.0.0'
})

server.tool(
  'get_weather',
  'Get current weather for a city',
  { city: z.string().describe('City name') },
  async ({ city }) => ({
    content: [{
      type: 'text',
      text: JSON.stringify({
        city,
        temp: '28°C',
        condition: 'Sunny',
        paid: true
      })
    }]
  })
)

server.tool(
  'analyze_data',
  'Analyze a dataset',
  { data: z.string().describe('Data to analyze') },
  async ({ data }) => ({
    content: [{
      type: 'text',
      text: `Analysis of: ${data} — completed. Paid 0.005 USDC.`
    }]
  })
)

app.post('/mcp', async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  })
  await server.connect(transport)
  await transport.handleRequest(req, res, req.body)
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', name: 'gate402-example-mcp' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`)
  console.log(`Gate402 MCP middleware active`)
})

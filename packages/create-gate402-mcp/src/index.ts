#!/usr/bin/env node
import * as fs from 'fs'
import * as path from 'path'
import prompts from 'prompts'

async function main() {
  console.log('\n  gate402 MCP server generator\n')

  const answers = await prompts([
    {
      type: 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: 'my-mcp-server'
    },
    {
      type: 'text',
      name: 'apiKey',
      message: 'Gate402 API key (from gate402.dev/settings):',
      initial: 'your-api-key'
    },
    {
      type: 'text',
      name: 'walletAddress',
      message: 'Solana wallet address:',
      initial: 'your-wallet-address'
    },
    {
      type: 'number',
      name: 'defaultPrice',
      message: 'Default price per tool call (USDC):',
      initial: 0.001,
      float: true
    },
    {
      type: 'select',
      name: 'network',
      message: 'Network:',
      choices: [
        { title: 'Devnet (testing)', value: 'devnet' },
        { title: 'Mainnet (production)', value: 'mainnet' }
      ]
    }
  ])

  const projectDir = path.join(process.cwd(), answers.projectName)

  if (fs.existsSync(projectDir)) {
    console.error(`\n  Error: directory ${answers.projectName} already exists\n`)
    process.exit(1)
  }

  fs.mkdirSync(projectDir, { recursive: true })
  fs.mkdirSync(path.join(projectDir, 'src'))

  const packageJson = {
    name: answers.projectName,
    version: '0.1.0',
    scripts: {
      dev: 'ts-node src/index.ts',
      build: 'tsc',
      start: 'node dist/index.js'
    },
    dependencies: {
      'gate402': '^0.4.0',
      '@modelcontextprotocol/sdk': '^1.0.0',
      'express': '^4.18.0',
      'zod': '^3.22.0',
      'dotenv': '^16.0.0'
    },
    devDependencies: {
      'typescript': '^5.0.0',
      'ts-node': '^10.9.0',
      '@types/express': '^4.17.0',
      '@types/node': '^20.0.0'
    }
  }

  fs.writeFileSync(
    path.join(projectDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  )

  fs.writeFileSync(path.join(projectDir, '.env'), [
    `GATE402_API_KEY=${answers.apiKey}`,
    `SOLANA_WALLET=${answers.walletAddress}`,
    `GATE402_NETWORK=${answers.network}`,
    `PORT=3001`,
  ].join('\n'))

  fs.writeFileSync(path.join(projectDir, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      module: 'commonjs',
      outDir: 'dist',
      rootDir: 'src',
      strict: false,
      esModuleInterop: true,
      skipLibCheck: true
    },
    include: ['src/**/*']
  }, null, 2))

  const serverCode = `import express from 'express'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { z } from 'zod'
import { gate402MCP } from 'gate402'
import * as dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(express.json())

// Gate402 — charges per tool call
app.use(gate402MCP({
  apiKey: process.env.GATE402_API_KEY!,
  walletAddress: process.env.SOLANA_WALLET!,
  network: (process.env.GATE402_NETWORK as 'devnet' | 'mainnet') || 'devnet',
  serverUrl: 'https://api.gate402.dev',
  defaultToolPrice: ${answers.defaultPrice},
  toolPricing: {
    // Add per-tool pricing here
    // 'my_tool': 0.005,
  }
}))

const server = new McpServer({
  name: '${answers.projectName}',
  version: '0.1.0'
})

// Add your tools here
server.tool(
  'hello',
  'A simple hello tool',
  { name: z.string().describe('Your name') },
  async ({ name }) => ({
    content: [{
      type: 'text' as const,
      text: \`Hello \${name}! You paid ${answers.defaultPrice} USDC.\`
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
  res.json({ status: 'ok', name: '${answers.projectName}', network: process.env.GATE402_NETWORK })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(\`\\n  ${answers.projectName} running on port \${PORT}\`)
  console.log(\`  Gate402: \${process.env.GATE402_NETWORK} | ${answers.defaultPrice} USDC/call\\n\`)
})
`

  fs.writeFileSync(path.join(projectDir, 'src', 'index.ts'), serverCode)

  fs.writeFileSync(path.join(projectDir, 'README.md'), `# ${answers.projectName}

MCP server powered by Gate402.

## Start

\`\`\`bash
npm install
npm run dev
\`\`\`

## Test (without payment)

\`\`\`bash
curl -X POST http://localhost:3001/mcp \\
  -H "Content-Type: application/json" \\
  -H "X-Payment-Payload: demo_test_001" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"hello","arguments":{"name":"World"}}}'
\`\`\`

## Dashboard
https://gate402.dev/dashboard
`)

  console.log(`\n  Created ${answers.projectName}`)
  console.log(`\n  Next steps:`)
  console.log(`    cd ${answers.projectName}`)
  console.log(`    npm install`)
  console.log(`    npm run dev\n`)
}

main().catch(console.error)

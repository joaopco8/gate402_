# gate402-agent

Agent-side SDK for Gate402. Automatic x402 payment handling for AI agents.

## Install

```bash
npm install gate402-agent
```

## Usage

```typescript
import { Gate402Agent } from 'gate402-agent'

const agent = new Gate402Agent({
  privateKey: process.env.AGENT_WALLET_KEY,
  network: 'devnet',
  debug: true,
  limits: {
    maxPerCall: 0.10,
    maxPerDay: 5.00,
  }
})

// fetch() with automatic payment on HTTP 402
const response = await agent.fetch('https://api.dev/data')
const data = await response.json()

// Check spending stats
console.log(agent.getStats())
```

## Links

- [gate402.dev](https://gate402.dev)
- [npmjs.com/package/gate402-agent](https://npmjs.com/package/gate402-agent)

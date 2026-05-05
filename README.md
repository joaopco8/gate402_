![Gate402](apps/dashboard/public/foto-git.png)

[![npm](https://img.shields.io/npm/v/gate402?color=00ff88&label=npm)](https://www.npmjs.com/package/gate402)
[![license](https://img.shields.io/badge/license-MIT-00ff88)](#license)
[![Solana](https://img.shields.io/badge/Solana-devnet-9945FF)](https://solana.com)
[![x402](https://img.shields.io/badge/x402-protocol-3b82f6)](https://x402.org)

# Gate402

> Billing infrastructure for AI agents — x402 + Solana in 5 minutes.

## What is Gate402?

Gate402 is a drop-in middleware that puts a paywall on any API endpoint.
AI agents pay in USDC on Solana. Settlement in 400ms.
You see every call and every payment in a real-time dashboard.

No banks. No credit cards. No KYC. No weekends.

## The Problem

11,000+ MCP servers exist today. Less than 5% charge for usage.

Stripe doesn't work for autonomous AI agents — they have no credit cards
or bank accounts. There was no billing infrastructure for the agent economy.

Gate402 fixes this.

## How It Works

```
Agent calls /api/weather
        ↓
Gate402 intercepts → HTTP 402
{
  "price":   "0.001 USDC",
  "payTo":   "7UQctU...939D",
  "network": "solana-devnet"
}
        ↓
Agent sends USDC → Solana confirms in 400ms
        ↓
API responds → Call logged to dashboard
```

## Quick Start

```bash
npm install gate402
```

```typescript
import { gate402 } from 'gate402'
import express from 'express'

const app = express()

app.use(gate402({
  apiKey:        'your-api-key',        // from gate402.dev dashboard
  walletAddress: 'your-solana-wallet',
  endpoints: {
    '/api/weather': 0.001,              // 0.001 USDC per call
    '/api/data':    0.005,
  }
}))

app.get('/api/weather', (req, res) => {
  res.json({ city: 'São Paulo', temp: '28°C' })
})

app.listen(3000)
```

That's it. Agents pay. You collect.

## Stack

| Layer      | Tech                             |
|------------|----------------------------------|
| Middleware | Node.js + Express + TypeScript   |
| Protocol   | x402 (HTTP 402 Payment Standard) |
| Blockchain | Solana (devnet + mainnet ready)  |
| Token      | USDC                             |
| Database   | PostgreSQL (Supabase)            |
| ORM        | Prisma                           |
| Dashboard  | Next.js + Recharts               |
| Auth       | Supabase Auth (GitHub OAuth)     |
| SDK        | Published on npm                 |

## Project Structure

```
gate402/
├── apps/
│   ├── server/          # Express + x402 middleware
│   ├── dashboard/       # Next.js real-time dashboard
│   └── mcp-demo/        # MCP server demo (Claude Desktop)
├── packages/
│   └── sdk/             # npm package: gate402
└── README.md
```

## Running Locally

### 1. Clone and install

```bash
git clone https://github.com/your-username/gate402.git
cd gate402
npm install
```

### 2. Set up environment variables

**`apps/server/.env`**

```env
DATABASE_URL="postgresql://user:password@host:5432/gate402"
DIRECT_URL="postgresql://user:password@host:5432/gate402"
SOLANA_RPC_URL="https://api.devnet.solana.com"
SOLANA_WALLET_ADDRESS="your-solana-wallet-address"
SOLANA_WALLET_PRIVATE_KEY="your-wallet-private-key"
PORT=3001
```

**`apps/dashboard/.env.local`**

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run database migrations

```bash
cd apps/server
npx prisma migrate dev
```

### 4. Start the server

```bash
cd apps/server
npm run dev
```

### 5. Start the dashboard

```bash
cd apps/dashboard
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Dashboard

- **Real-time call monitoring** — every API call appears live
- **USDC revenue tracking** — total and daily earnings
- **Per-endpoint analytics** — see which routes earn the most
- **7-day chart** with endpoint filtering
- **CSV export** — download your full call history
- **Monthly revenue projection** — based on last 7-day average
- **Wallet balance + withdrawal simulation** — USDC balance with devnet demo

## MCP Server Demo

Connect Gate402 to Claude Desktop to let Claude pay for your APIs autonomously.

### 1. Build the MCP server

```bash
cd apps/mcp-demo
npm run build
```

### 2. Add to Claude Desktop config

**macOS** — `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows** — `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "gate402-demo": {
      "command": "node",
      "args": ["/absolute/path/to/gate402/apps/mcp-demo/dist/index.js"],
      "env": {
        "SERVER_URL": "http://localhost:3001"
      }
    }
  }
}
```

### 3. Restart Claude Desktop

Claude will now have access to your paywalled tools and will pay per call automatically.

## Environment Variables

### `apps/server`

| Variable                    | Description                                         |
|-----------------------------|-----------------------------------------------------|
| `DATABASE_URL`              | PostgreSQL connection string (pooled, Supabase)     |
| `DIRECT_URL`                | PostgreSQL direct connection (for Prisma migrations)|
| `SOLANA_RPC_URL`            | Solana RPC endpoint (`devnet` or `mainnet-beta`)    |
| `SOLANA_WALLET_ADDRESS`     | Your Solana wallet public key                       |
| `SOLANA_WALLET_PRIVATE_KEY` | Your Solana wallet private key (**keep secret**)    |
| `PORT`                      | HTTP port for the server (default: `3001`)          |

### `apps/dashboard`

| Variable                        | Description                           |
|---------------------------------|---------------------------------------|
| `NEXT_PUBLIC_SERVER_URL`        | URL of the Gate402 server             |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous (public) key       |

## License

MIT — Built with ❤️ for the Frontier Hackathon 2026

---

*Built with x402 Protocol · Powered by Solana · Frontier Hackathon 2026*

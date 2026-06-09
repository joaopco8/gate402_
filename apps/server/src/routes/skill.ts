import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { redis } from '../lib/redis'

const router = Router()

// GET /skill/:agentKey — public, no auth
router.get('/:agentKey', async (req, res) => {
  try {
    const { agentKey } = req.params

    const cacheKey = `skill:${agentKey}`
    if (redis) {
      const cached = await redis.get(cacheKey).catch(() => null)
      if (cached) {
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
        res.setHeader('Cache-Control', 'public, max-age=60')
        res.setHeader('Access-Control-Allow-Origin', '*')
        return res.send(cached)
      }
    }

    const wallet = await prisma.agentWallet.findFirst({
      where: { agentKey, isActive: true },
      select: {
        id: true,
        name: true,
        walletAddress: true,
        network: true,
        maxPerCall: true,
        maxPerHour: true,
        maxPerDay: true,
        maxPerMonth: true,
        allowedEndpoints: true,
        blockedEndpoints: true,
        totalCalls: true,
        totalSpent: true,
        agentKey: true,
      },
    })

    if (!wallet) {
      return res.status(404).json({ error: 'Agent wallet not found', code: 'NOT_FOUND' })
    }

    // USDC balance from Helius
    let balance = '0'
    try {
      const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
      const balRes = await fetch(heliusUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0', id: 1,
          method: 'getTokenAccountsByOwner',
          params: [
            wallet.walletAddress,
            { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
            { encoding: 'jsonParsed' },
          ],
        }),
      })
      const balData = await balRes.json() as any
      const accounts = balData?.result?.value || []
      if (accounts.length > 0) {
        balance = accounts[0].account.data.parsed.info.tokenAmount.uiAmount?.toString() || '0'
      }
    } catch { /* continue with 0 */ }

    const limitsLines: string[] = []
    if (wallet.maxPerCall)  limitsLines.push(`- Max per call: $${wallet.maxPerCall} USDC`)
    if (wallet.maxPerHour)  limitsLines.push(`- Max per hour: $${wallet.maxPerHour} USDC`)
    if (wallet.maxPerDay)   limitsLines.push(`- Max per day: $${wallet.maxPerDay} USDC`)
    if (wallet.maxPerMonth) limitsLines.push(`- Max per month: $${wallet.maxPerMonth} USDC`)
    if (limitsLines.length === 0) limitsLines.push('- No spending limits configured')

    const restrictionLines: string[] = []
    if (wallet.allowedEndpoints.length > 0)
      restrictionLines.push(`- Allowed endpoints: ${wallet.allowedEndpoints.join(', ')}`)
    if (wallet.blockedEndpoints.length > 0)
      restrictionLines.push(`- Blocked endpoints: ${wallet.blockedEndpoints.join(', ')}`)

    const BASE = process.env.API_BASE_URL || 'https://api.metera.xyz'

    const marketplaceApis = await prisma.proxyEndpoint.findMany({
      where: { isPublic: true, isActive: true },
      select: { slug: true, name: true, pricePerCall: true, description: true, category: true },
      orderBy: { totalCalls: 'desc' },
      take: 10,
    })
    const marketplaceLines = marketplaceApis.length > 0
      ? marketplaceApis
          .map(a => `| ${a.name} | ${BASE}/p/${a.slug} | $${a.pricePerCall}/call | ${a.description || a.category} |`)
          .join('\n')
      : '| — | No APIs listed yet | — | — |'

    const skillMd = `---
name: gate402-agent
version: 1.0.0
description: Pay for APIs automatically using USDC on Solana. No crypto knowledge needed.
homepage: https://metera.xyz
metadata:
  x402:
    supported: true
    chains: ["solana"]
    networks: ["solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"]
    tokens: ["USDC"]
    endpoint: "${BASE}/agent/${wallet.agentKey}/fetch"
---

# Metera Agent

You are connected to Metera — billing infrastructure for AI agents.
This wallet lets you pay for APIs automatically using USDC on Solana.

---

## TL;DR — Quick Reference

**Your wallet is ready.** Use the fetch proxy below to call any x402-compatible API.
Metera detects the 402 payment request, signs it, and retries automatically.

Check balance before making paid calls.
Spending limits are enforced — calls are blocked if caps are exceeded.

---

## Wallet Info

| Field | Value |
|-------|-------|
| Agent name | ${wallet.name} |
| Wallet address | \`${wallet.walletAddress}\` |
| Network | ${wallet.network} |
| USDC Balance | $${balance} |
| Total calls made | ${wallet.totalCalls} |
| Total spent | $${wallet.totalSpent.toFixed(4)} USDC |

---

## Spending Limits

${limitsLines.join('\n')}
${restrictionLines.length > 0 ? '\n**Endpoint restrictions:**\n' + restrictionLines.join('\n') : ''}

---

## How to Pay for APIs — One Step

POST your target URL to the Metera fetch proxy.
It detects the 402, pays automatically, and returns the real response.

\`\`\`bash
curl -X POST "${BASE}/agent/${wallet.agentKey}/fetch" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://target-api.com/endpoint",
    "method": "GET"
  }'
\`\`\`

Response:
\`\`\`json
{
  "success": true,
  "response": { "status": 200, "body": {} },
  "payment": {
    "amount": "0.001",
    "token": "USDC",
    "chain": "solana",
    "txHash": "..."
  },
  "paid": true
}
\`\`\`

---

## Check Balance

\`\`\`bash
curl "${BASE}/agent/${wallet.agentKey}/balance"
\`\`\`

---

## Available APIs — Marketplace

| Name | Endpoint | Price | Description |
|------|----------|-------|-------------|
${marketplaceLines}

Browse all: https://metera.xyz/marketplace

---

## Error Reference

| Code | Meaning |
|------|---------|
| \`MAX_PER_CALL_EXCEEDED\` | Amount exceeds per-call limit |
| \`MAX_PER_DAY_EXCEEDED\` | Daily spending cap reached |
| \`MAX_PER_HOUR_EXCEEDED\` | Hourly spending cap reached |
| \`ENDPOINT_BLOCKED\` | This endpoint is blocked for your wallet |
| \`INSUFFICIENT_BALANCE\` | Deposit more USDC at metera.xyz/agents |
| \`WALLET_INACTIVE\` | Wallet has been deactivated |

---

## Security

- Never share your agentKey — it controls payment signing
- All payments verified on-chain before execution
- Anti-replay protection prevents duplicate payments
- Spending limits cannot be exceeded

**Deposit USDC:** https://metera.xyz/agents
**View activity:** https://metera.xyz/agents
**Docs:** https://metera.xyz/docs

---

*Powered by Metera — HTTP 402, finally works.*
*metera.xyz · Solana · x402 protocol*
`

    if (redis) redis.setex(cacheKey, 60, skillMd).catch(() => {})

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=60')
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.send(skillMd)

  } catch (error) {
    console.error('[skill] error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

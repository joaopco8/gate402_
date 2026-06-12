'use client'
import { useState } from 'react'

const FULL_CONTENT = `# METERA — COMPLETE AGENT CONTEXT

${[
  '## What is Metera',
  `Metera is billing infrastructure for AI agents on Solana.
Any API can charge agents automatically in USDC via the x402 protocol.
Any agent can pay for APIs instantly with a Solana wallet.
No code changes. No KYC. No bank. No human in the loop.

Protocol: x402 (HTTP 402 Payment Required)
Chain: Solana mainnet
Token: USDC
Settlement time: ~400ms
Transaction fee: ~$0.00025`,
  '## For API Providers',
  `Register any API URL at metera.xyz/proxy
Set a price per call (e.g. $0.001)
Metera generates a public endpoint:
  https://api.metera.xyz/p/your-slug

When an agent calls without payment:
  → Returns HTTP 402 with payment instructions

When an agent pays:
  → Verifies on-chain
  → Proxies to your original API
  → Returns response
  → Records in dashboard

You receive 100% directly to your Solana wallet.
Metera never holds funds.`,
  '## For AI Agents',
  `Create an agent wallet at metera.xyz/agents
One click. Solana wallet created automatically via Privy.
Deposit USDC via Pix or credit card.

Connect to Claude Code or Cursor:
  Read https://metera.xyz/skill/YOUR_AGENT_KEY
  and follow the instructions

The agent instantly knows:
  → Which wallet to use
  → How to pay for APIs (POST to fetch proxy)
  → Spending limits per call / day / month
  → All available APIs in the marketplace`,
  '## How to Pay for an API (One Step)',
  `POST https://api.metera.xyz/agent/YOUR_AGENT_KEY/fetch
Content-Type: application/json

{
  "url": "https://api.metera.xyz/p/weather-api",
  "method": "GET"
}

Response:
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
}`,
  '## Marketplace APIs',
  `Browse all available APIs:
GET https://api.metera.xyz/api/marketplace

Each API includes:
  name, slug, description, category,
  pricePerCall, totalCalls, uptimePercent,
  avgLatencyMs, methods

Call any API via proxy:
  https://api.metera.xyz/p/{slug}`,
  '## Spending Limits',
  `Every agent wallet has configurable limits:
  maxPerCall:   never pay more than this per request
  maxPerHour:   hourly budget cap
  maxPerDay:    daily budget cap
  maxPerMonth:  monthly budget cap

If a limit is reached:
  → Returns 402 with PLAN_LIMIT_REACHED
  → No payment processed
  → Agent is notified immediately`,
  '## x402 Protocol',
  `HTTP 402 exists since 1991.
x402 Foundation (Linux Foundation, April 2026):
  Members: Google, AWS, Microsoft, Stripe, Visa, Mastercard

Payment flow:
  1. Agent calls API
  2. API returns 402 with payment details
  3. Agent signs USDC transaction on Solana
  4. Agent retries with x-payment-signature header
  5. API verifies on-chain and returns response
  6. Full flow completes in ~400ms`,
  '## Links',
  `Dashboard:   metera.xyz
Marketplace: metera.xyz/marketplace
Docs:        metera.xyz/docs
API:         api.metera.xyz
skill.md:    api.metera.xyz/skill/:agentKey
Marketplace JSON: api.metera.xyz/api/marketplace
GitHub:      github.com/joaopco8/gate402_
X:           x.com/metera_xyz
Email:       hello@metera.xyz`,
].join('\n\n')}`

const SECTIONS = [
  {
    title: '## What is Metera',
    content: `Metera is billing infrastructure for AI agents on Solana.
Any API can charge agents automatically in USDC via the x402 protocol.
Any agent can pay for APIs instantly with a Solana wallet.
No code changes. No KYC. No bank. No human in the loop.

Protocol: x402 (HTTP 402 Payment Required)
Chain: Solana mainnet
Token: USDC
Settlement time: ~400ms
Transaction fee: ~$0.00025`,
  },
  {
    title: '## For API Providers',
    content: `Register any API URL at metera.xyz/proxy
Set a price per call (e.g. $0.001)
Metera generates a public endpoint:
  https://api.metera.xyz/p/your-slug

When an agent calls without payment:
  → Returns HTTP 402 with payment instructions

When an agent pays:
  → Verifies on-chain
  → Proxies to your original API
  → Returns response
  → Records in dashboard

You receive 100% directly to your Solana wallet.
Metera never holds funds.`,
  },
  {
    title: '## For AI Agents',
    content: `Create an agent wallet at metera.xyz/agents
One click. Solana wallet created automatically via Privy.
Deposit USDC via Pix or credit card.

Connect to Claude Code or Cursor:
  Read https://metera.xyz/skill/YOUR_AGENT_KEY
  and follow the instructions

The agent instantly knows:
  → Which wallet to use
  → How to pay for APIs (POST to fetch proxy)
  → Spending limits per call / day / month
  → All available APIs in the marketplace`,
  },
  {
    title: '## How to Pay for an API (One Step)',
    content: `POST https://api.metera.xyz/agent/YOUR_AGENT_KEY/fetch
Content-Type: application/json

{
  "url": "https://api.metera.xyz/p/weather-api",
  "method": "GET"
}

Response:
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
}`,
  },
  {
    title: '## Marketplace APIs',
    content: `Browse all available APIs:
GET https://api.metera.xyz/api/marketplace

Each API includes:
  name, slug, description, category,
  pricePerCall, totalCalls, uptimePercent,
  avgLatencyMs, methods

Call any API via proxy:
  https://api.metera.xyz/p/{slug}`,
  },
  {
    title: '## Spending Limits',
    content: `Every agent wallet has configurable limits:
  maxPerCall:   never pay more than this per request
  maxPerHour:   hourly budget cap
  maxPerDay:    daily budget cap
  maxPerMonth:  monthly budget cap

If a limit is reached:
  → Returns 402 with PLAN_LIMIT_REACHED
  → No payment processed
  → Agent is notified immediately`,
  },
  {
    title: '## x402 Protocol',
    content: `HTTP 402 exists since 1991.
x402 Foundation (Linux Foundation, April 2026):
  Members: Google, AWS, Microsoft, Stripe, Visa, Mastercard

Payment flow:
  1. Agent calls API
  2. API returns 402 with payment details
  3. Agent signs USDC transaction on Solana
  4. Agent retries with x-payment-signature header
  5. API verifies on-chain and returns response
  6. Full flow completes in ~400ms`,
  },
  {
    title: '## Links',
    content: `Dashboard:   metera.xyz
Marketplace: metera.xyz/marketplace
Docs:        metera.xyz/docs
API:         api.metera.xyz
skill.md:    api.metera.xyz/skill/:agentKey
Marketplace JSON: api.metera.xyz/api/marketplace
GitHub:      github.com/joaopco8/gate402_
X:           x.com/metera_xyz
Email:       hello@metera.xyz`,
  },
]

export function AgentBanner() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(FULL_CONTENT).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <>
      {/* Sticky banner */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#111311',
        borderBottom: '1px solid #2A2E2A',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <button
          onClick={() => setOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <span style={{
            fontSize: '11px',
            color: '#7AF279',
            fontFamily: 'monospace',
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            Agent-Friendly Information
          </span>
        </button>
      </div>

      {/* Full-screen overlay */}
      {open && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: '#0D0D0D',
          overflowY: 'auto',
          fontFamily: 'monospace',
          padding: '32px 48px',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid #2A2E2A',
          }}>
            <div>
              <p style={{ fontSize: '13px', color: '#7AF279', letterSpacing: '0.06em', marginBottom: '4px' }}>
                METERA — COMPLETE AGENT CONTEXT
              </p>
              <p style={{ fontSize: '11px', color: '#4A5549' }}>
                Everything an AI agent needs to understand and use Metera.
                Also available at api.metera.xyz/skill/:agentKey
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <a
                href="https://api.metera.xyz/api/marketplace"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '11px',
                  color: '#4A5549',
                  textDecoration: 'none',
                  border: '1px solid #2A2E2A',
                  borderRadius: '6px',
                  padding: '6px 12px',
                }}
              >
                View raw JSON →
              </a>
              <button
                onClick={handleCopy}
                style={{
                  background: copied ? '#7AF27920' : 'none',
                  border: '1px solid #2A2E2A',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  color: copied ? '#7AF279' : '#4A5549',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  letterSpacing: '0.06em',
                  transition: 'all 150ms ease',
                }}
              >
                {copied ? 'COPIED ✓' : 'COPY ALL'}
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'none',
                  border: '1px solid #2A2E2A',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  color: '#7AF279',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Sections */}
          {SECTIONS.map((section, i) => (
            <div key={i} style={{
              marginBottom: '28px',
              paddingBottom: '28px',
              borderBottom: i < SECTIONS.length - 1 ? '1px solid #1A2A1A' : 'none',
            }}>
              <p style={{
                fontSize: '12px',
                color: '#7AF279',
                marginBottom: '12px',
                letterSpacing: '0.04em',
              }}>
                {section.title}
              </p>
              <pre style={{
                fontSize: '11px',
                color: '#7A8C79',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                margin: 0,
                fontFamily: 'monospace',
              }}>
                {section.content}
              </pre>
            </div>
          ))}

          {/* Footer */}
          <div style={{
            paddingTop: '16px',
            borderTop: '1px solid #2A2E2A',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <p style={{ fontSize: '10px', color: '#4A5549', fontFamily: 'monospace' }}>
              metera.xyz · Solana · x402 · USDC · June 2026
            </p>
            <p style={{ fontSize: '10px', color: '#4A5549', fontFamily: 'monospace' }}>
              HTTP 402 — finally works.
            </p>
          </div>
        </div>
      )}
    </>
  )
}

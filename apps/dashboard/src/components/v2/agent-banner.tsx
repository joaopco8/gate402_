'use client'
import { useState } from 'react'

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
  const [agentMode, setAgentMode] = useState(false)

  return (
    <>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* Sticky banner */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: agentMode ? '#0A1A0A' : '#111311',
        borderBottom: '1px solid #2A2E2A',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#7AF279',
              boxShadow: '0 0 6px #7AF279',
              animation: 'pulse 2s infinite',
            }} />
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
          </div>
          <span style={{ fontSize: '11px', color: '#4A5549', fontFamily: 'monospace' }}>
            {agentMode
              ? 'Full Metera context loaded for AI agents'
              : 'Click to load complete Metera context'}
          </span>
        </div>

        <button
          onClick={() => setAgentMode(!agentMode)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            background: agentMode ? '#7AF27915' : 'transparent',
            border: agentMode ? '1px solid #7AF27940' : '1px solid #2A2E2A',
            borderRadius: '20px',
            cursor: 'pointer',
            transition: 'all 200ms ease',
          }}
        >
          <div style={{
            width: '32px',
            height: '18px',
            borderRadius: '9px',
            background: agentMode ? '#7AF279' : '#2A2E2A',
            position: 'relative',
            transition: 'background 200ms ease',
          }}>
            <div style={{
              position: 'absolute',
              top: '3px',
              left: agentMode ? '17px' : '3px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: agentMode ? '#1B1E1B' : '#4A5549',
              transition: 'left 200ms ease',
            }} />
          </div>
          <span style={{
            fontSize: '11px',
            color: agentMode ? '#7AF279' : '#4A5549',
            fontFamily: 'monospace',
          }}>
            {agentMode ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Expanded agent context panel */}
      {agentMode && (
        <div style={{
          background: '#0A1A0A',
          borderBottom: '2px solid #7AF27930',
          padding: '32px 48px',
          fontFamily: 'monospace',
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
                This content is also available at api.metera.xyz/skill/:agentKey
              </p>
            </div>
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

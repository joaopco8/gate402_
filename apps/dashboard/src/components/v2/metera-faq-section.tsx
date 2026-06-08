"use client"

import { useState } from "react"

const LINE = "1px solid #2A2E2A"

type FAQItem = { q: string; a: string }
type FAQGroup = { label: string; items: FAQItem[] }

const GROUPS: FAQGroup[] = [
  {
    label: "For providers — monetizing APIs",
    items: [
      {
        q: "Do I need to know how to code to use Gate402?",
        a: "No. Paste your API URL in the dashboard, set a price, done.\nIf your API already exists, you're live in 2 minutes.",
      },
      {
        q: "Does my API need to be in a specific language?",
        a: "No. Any HTTP API works.\nNode.js, Python, Ruby, Go, PHP — doesn't matter.\nIf it responds to an HTTP request, Gate402 works.",
      },
      {
        q: "Does Gate402 sit in the middle of all my requests?",
        a: "Depends on how you integrate.\n\nHosted mode (no code):\n→ Yes, Gate402 acts as a proxy\n→ You register the URL, it intercepts and charges\n\nMiddleware mode (npm):\n→ No, runs inside your server\n→ More control, less latency",
      },
      {
        q: "How long does it take for USDC to reach my wallet?",
        a: "400ms after the call is verified on-chain.\nMoney goes directly to your Solana wallet.\nGate402 never custodies your funds.",
      },
      {
        q: "Does Gate402 take a percentage?",
        a: "Free: 0% — you keep everything\nPro: $99/mo — you keep everything\nEnterprise: 0.5% of volume\n\nDuring early access — fee is zero.",
      },
      {
        q: "Can I charge different prices per endpoint?",
        a: "Yes. Each endpoint has its own price.\n\n/api/search    → $0.001\n/api/analyze   → $0.010\n/api/generate  → $0.050\n\nYou set it, you change it anytime.",
      },
      {
        q: "What happens if my API goes down?",
        a: "The agent receives an error and the payment is not processed.\nYou only get paid when your API responds with success.",
      },
    ],
  },
  {
    label: "For agents — consuming APIs",
    items: [
      {
        q: "Can the agent only consume APIs from the marketplace?",
        a: "No. The agent can call any API that implements the x402 protocol —\ninside or outside the Gate402 marketplace.\n\nThe marketplace is a discovery directory.\nPayment works on any compatible API.",
      },
      {
        q: "How does the agent know which APIs are available?",
        a: "Two ways:\n\n1. Marketplace: gate402.dev/marketplace\n   Public list with prices and descriptions\n\n2. skill.md: gate402.dev/skill/{agentKey}\n   Claude reads it and already knows everything automatically",
      },
      {
        q: "Can the agent spend more than I want?",
        a: "No, if you configure spending limits.\n\nmaxPerCall:   $0.01  — never pays more than this per call\nmaxPerHour:   $1.00  — stops if exceeded in 1 hour\nmaxPerDay:   $10.00  — daily cap\nmaxPerMonth: $100.00 — monthly cap\n\nIf the limit is hit, the agent stops and you are notified.",
      },
      {
        q: "Do I need crypto knowledge to use the agent wallet?",
        a: "Zero. You sign up with GitHub,\nthe Solana wallet is created automatically,\nyou deposit via Pix or card.\n\nYou never see a private key, seed phrase,\nor anything crypto-related.",
      },
      {
        q: "How do I deposit USDC into the agent wallet?",
        a: "Three ways:\n\n1. Pix — via MoonPay, shows up in minutes\n2. Credit card — via MoonPay\n3. Crypto direct — send USDC from any exchange\n   to the generated Solana address\n\nKYC required the first time via Pix or card.",
      },
      {
        q: "What is the skill.md?",
        a: "A file that teaches Claude Code, Cursor or any MCP agent\nhow to use Gate402 automatically.\n\nYou paste one line:\n\"Read https://gate402.dev/skill/your-key\"\n\nThe agent reads it, understands, already knows how to pay.\nNo npm. No install. No config.",
      },
      {
        q: "Does unused balance expire?",
        a: "No. The USDC stays in your Solana wallet\nforever until you use it or withdraw.",
      },
    ],
  },
  {
    label: "Security & protocol",
    items: [
      {
        q: "What is the x402 protocol?",
        a: "An HTTP standard created in 1991 specifically for web payments.\nLeft without implementation for 33 years.\n\nThe x402 Foundation — with Google, Microsoft, Stripe, Coinbase\nand Cloudflare — standardized how it should work\nfor machine-to-machine payments.\n\nGate402 is the production-ready implementation of that protocol.",
      },
      {
        q: "Can Gate402 be hacked and drain my wallet?",
        a: "No. Three reasons:\n\n1. Spending limits — the agent never spends\n   more than you configured\n\n2. Anti-replay — each txHash can only\n   be used once\n\n3. Zero custody — Gate402 never\n   has access to your funds.\n   Money goes directly on-chain.",
      },
      {
        q: "What if the x402 protocol changes?",
        a: "Gate402 is chain-agnostic by design.\nGovernance of x402 is under the Linux Foundation\nbacked by Google, Stripe and Cloudflare.\n\nProtocols with that level of support don't die — they evolve.\nAnd Gate402 evolves with them.",
      },
      {
        q: "Is my API data exposed?",
        a: "Hosted mode: Gate402 acts as a proxy\nand sees requests passing through.\nWe do not store response content.\n\nMiddleware mode (npm): Gate402\nruns inside your server.\nNo data leaves your infrastructure.",
      },
    ],
  },
  {
    label: "Plans & pricing",
    items: [
      {
        q: "What's the difference between Free and Pro?",
        a: "Free:\n→ Up to 3 endpoints\n→ Last 5 calls visible\n→ 7-day analytics\n\nPro ($99/mo):\n→ Unlimited endpoints\n→ Last 50 calls\n→ 90-day analytics\n→ Revenue breakdown\n→ CSV export\n→ Metering engine\n\nEnterprise (0.5% of volume):\n→ Everything in Pro\n→ White-label\n→ Guaranteed SLA\n→ Dedicated support",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes. No contract. No penalty.\nCancel from the dashboard in 1 click.",
      },
      {
        q: "Is Free really free forever?",
        a: "Yes. npm install gate402 is MIT.\nThe Free plan exists forever.\nYou only pay if you want advanced analytics.",
      },
    ],
  },
]

function FAQItem({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ borderBottom: LINE }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "18px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          textAlign: "left",
        }}
      >
        <span style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 13,
          fontWeight: 400,
          color: open ? "#E8F4EE" : "#7A8C79",
          lineHeight: 1.4,
          letterSpacing: "-0.01em",
          transition: "color 150ms",
        }}>
          {item.q}
        </span>
        <span style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 18,
          color: "#4A5549",
          flexShrink: 0,
          lineHeight: 1,
          transform: open ? "rotate(45deg)" : "none",
          transition: "transform 200ms",
        }}>
          +
        </span>
      </button>

      {open && (
        <div style={{ paddingBottom: 18 }}>
          <pre style={{
            margin: 0,
            fontFamily: "'Geist Mono', monospace",
            fontSize: 12,
            color: "#4A5549",
            lineHeight: 1.8,
            whiteSpace: "pre-wrap",
            letterSpacing: 0,
          }}>
            {item.a}
          </pre>
        </div>
      )}
    </div>
  )
}

function FAQGroup({ group, defaultOpen }: { group: FAQGroup; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen)

  return (
    <div style={{ borderBottom: LINE }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="v2r-faq-group"
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "28px 64px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          textAlign: "left",
        }}
      >
        <span style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 11,
          color: open ? "#E8F4EE" : "#B0C4B0",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          transition: "color 150ms",
        }}>
          {group.label}
        </span>
        <span style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 16,
          color: "#4A5549",
          flexShrink: 0,
          lineHeight: 1,
          transform: open ? "rotate(45deg)" : "none",
          transition: "transform 200ms",
        }}>
          +
        </span>
      </button>

      {open && (
        <div className="v2r-faq-items" style={{ padding: "0 64px 8px" }}>
          {group.items.map(item => (
            <FAQItem key={item.q} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

export function MeteraFAQSection() {
  return (
    <div style={{ borderBottom: LINE }}>

      {/* Headline */}
      <div className="v2r-section-head" style={{ padding: "48px 64px", borderBottom: LINE }}>
        <h2 style={{
          fontSize: "clamp(2rem, 3.5vw, 3rem)",
          fontWeight: 300,
          color: "#FFFFFF",
          letterSpacing: "-0.04em",
          lineHeight: 1.05,
          margin: 0,
        }}>
          <span style={{ color: "#7AF279" }}>FAQ</span>
        </h2>
      </div>

      {/* Groups */}
      {GROUPS.map((group, gi) => (
        <FAQGroup
          key={group.label}
          group={group}
          defaultOpen={gi === 0}
        />
      ))}
    </div>
  )
}

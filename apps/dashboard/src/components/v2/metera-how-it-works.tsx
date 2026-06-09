"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "motion/react"

const STEPS = [
  {
    number: "01",
    title: "Add your\nendpoint",
    desc: "Paste any API URL — REST, GraphQL, WebSocket. Metera wraps it in seconds. No code changes required on your API.",
    detail: "Works with any backend",
    code: `gate402 add \\
  --url https://api.yourapp.com \\
  --name "My API"`,
    accent: "#7AF279",
  },
  {
    number: "02",
    title: "Set your\nprice",
    desc: "Choose per-call pricing, metered billing, or spending limits. Full control — update pricing anytime without touching your code.",
    detail: "Flexible pricing models",
    code: `{
  "perCall": 0.001,
  "currency": "USDC",
  "limits": { "perDay": 5.00 }
}`,
    accent: "#BC86FF",
  },
  {
    number: "03",
    title: "Get paid\nautomatically",
    desc: "USDC settles directly to your Solana wallet after every call. No invoices, no payment processors, no humans in the loop.",
    detail: "Real-time settlement",
    code: `// Agent pays → you receive
wallet.balance += 0.001 USDC
// per successful API call`,
    accent: "#7AF279",
  },
]

function StepCard({ step, scrollYProgress, enterStart, enterEnd }: {
  step: typeof STEPS[0]
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"]
  enterStart: number
  enterEnd: number
}) {
  const x = useTransform(scrollYProgress, [enterStart, enterEnd], ["100%", "0%"])

  return (
    <motion.div
      style={{ x, flex: "1 1 0", minWidth: 0 }}
    >
      <div style={{
        height: "100%",
        borderRight: "1px solid #2A2E2A",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Top */}
        <div style={{
          padding: "36px 40px 28px",
          borderBottom: "1px solid #2A2E2A",
        }}>
          <div style={{
            fontSize: 11,
            fontFamily: "'Geist Mono', monospace",
            color: step.accent,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 20,
          }}>
            {step.number}
          </div>
          <h3 style={{
            fontSize: "clamp(1.5rem, 2vw, 2rem)",
            fontWeight: 300,
            color: "#FFFFFF",
            fontFamily: "'Inter', sans-serif",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            margin: 0,
            whiteSpace: "pre-line",
          }}>
            {step.title}
          </h3>
        </div>

        {/* Body */}
        <div style={{
          padding: "28px 40px 36px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          flex: 1,
        }}>
          <p style={{
            fontSize: 14,
            color: "#7A8C79",
            lineHeight: 1.75,
            margin: 0,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
          }}>
            {step.desc}
          </p>

          <div style={{
            background: "#111311",
            border: "1px solid #222522",
            padding: "16px 20px",
          }}>
            <pre style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 12,
              lineHeight: 1.8,
              color: "#4A5549",
              margin: 0,
              whiteSpace: "pre-wrap",
            }}>
              {step.code}
            </pre>
          </div>

          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginTop: "auto",
          }}>
            <div style={{
              width: 6, height: 6,
              borderRadius: "50%",
              background: step.accent,
            }} />
            <span style={{
              fontSize: 12,
              fontFamily: "'Geist Mono', monospace",
              color: "#7A8C79",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}>
              {step.detail}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function MeteraHowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })

  return (
    <div
      ref={containerRef}
      style={{ height: "280vh", borderBottom: "1px solid #2A2E2A" }}
    >
      <div style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "40px 64px 36px",
          borderBottom: "1px solid #2A2E2A",
          flexShrink: 0,
        }}>
          <h2 style={{
            fontSize: "clamp(2rem, 3.5vw, 3.2rem)",
            fontWeight: 300,
            color: "#FFFFFF",
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            margin: 0,
          }}>
            From API to income<br />
            <span style={{ color: "#7AF279" }}>in three steps.</span>
          </h2>
        </div>

        {/* Cards */}
        <div style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
        }}>
          {STEPS.map((step, i) => (
            <StepCard
              key={step.number}
              step={step}
              scrollYProgress={scrollYProgress}
              enterStart={i * 0.22}
              enterEnd={i * 0.22 + 0.25}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

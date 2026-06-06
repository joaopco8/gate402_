"use client"

import { useState } from "react"

const LINE = "1px solid #2A2E2A"
const SKILL_URL = "https://gate402.dev/skill/your-key"

export function MeteraForAgents() {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(`Read ${SKILL_URL}\nand follow the instructions`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ borderBottom: LINE }}>

      {/* ── Headline row ── */}
      <div style={{ padding: "48px 64px", borderBottom: LINE }}>
        <div style={{
          fontSize: 11,
          fontFamily: "'Geist Mono', monospace",
          color: "#4A5549",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          marginBottom: 20,
        }}>
          For AI agents
        </div>
        <h2 style={{
          fontSize: "clamp(2rem, 3.5vw, 3.2rem)",
          fontWeight: 300,
          color: "#FFFFFF",
          letterSpacing: "-0.04em",
          lineHeight: 1.05,
          margin: 0,
        }}>
          One prompt. Your agent<br />
          <span style={{ color: "#7AF279" }}>is live in seconds.</span>
        </h2>
      </div>

      {/* ── Two-column body ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr" }}>

        {/* Left — selling points */}
        <div style={{
          padding: "56px 48px",
          borderRight: LINE,
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}>
          {[
            { dot: "#7AF279", title: "Wallet included", desc: "Agent gets a Solana wallet automatically. No setup, no seed phrases." },
            { dot: "#7AF279", title: "Spending limits built-in", desc: "Set daily or per-call caps. Agent can't spend more than you allow." },
            { dot: "#7AF279", title: "Every marketplace API, ready", desc: "No npm. No config. No crypto knowledge needed." },
          ].map(item => (
            <div key={item.title} style={{ display: "flex", gap: 16 }}>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: item.dot,
                marginTop: 7,
                flexShrink: 0,
              }} />
              <div>
                <div style={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: "#E8F4EE",
                  marginBottom: 4,
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: "-0.01em",
                }}>
                  {item.title}
                </div>
                <div style={{
                  fontSize: 13,
                  color: "#7A8C79",
                  lineHeight: 1.65,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 300,
                }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right — prompt box */}
        <div style={{
          padding: "56px 48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 16,
        }}>

          <div style={{
            fontSize: 11,
            fontFamily: "'Geist Mono', monospace",
            color: "#4A5549",
            letterSpacing: "0.1em",
          }}>
            Paste this in Claude Code, Cursor or any MCP client:
          </div>

          {/* Prompt box */}
          <div style={{
            background: "#111311",
            border: LINE,
          }}>
            {/* titlebar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 16px",
              borderBottom: "1px solid #222522",
              background: "#141614",
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 9, height: 9,
                  borderRadius: "50%",
                  background: i === 0 ? "#FF5F57" : i === 1 ? "#FEBC2E" : "#28C840",
                  display: "block",
                }} />
              ))}
            </div>

            {/* content */}
            <pre style={{
              margin: 0,
              fontFamily: "'Geist Mono', monospace",
              fontSize: 13,
              lineHeight: 1.9,
              color: "#E8F4EE",
              padding: "20px 24px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}>
              {"Read "}<span style={{ color: "#7AF279" }}>{SKILL_URL}</span>{"\nand follow the instructions"}
            </pre>
          </div>

          {/* Copy button */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={copy}
              style={{
                background: "none",
                border: LINE,
                cursor: "pointer",
                padding: "7px 16px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: copied ? "#7AF279" : "#4A5549",
                fontFamily: "'Geist Mono', monospace",
                fontSize: 11,
                letterSpacing: "0.1em",
                transition: "color 150ms, border-color 150ms",
                borderColor: copied ? "#3A5A39" : "#2A2E2A",
              }}
            >
              {copied ? (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

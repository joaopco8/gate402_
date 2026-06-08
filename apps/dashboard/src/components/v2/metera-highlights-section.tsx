'use client'
import { MatrixText } from '@/components/ui/matrix-text'

const LINE = "1px solid #2A2E2A"

const ITEMS = [
  { title: "AUTO WALLET",       sub: "CREATED INSTANTLY"  },
  { title: "PIX & CARD",        sub: "DEPOSIT IN MINUTES" },
  { title: "ON-CHAIN VERIFIED", sub: "HELIUS + SOLANA"    },
  { title: "SPENDING LIMITS",   sub: "PER CALL/DAY/MONTH" },
  { title: "OPEN MARKETPLACE",  sub: "ANY DEV CAN LIST"   },
  { title: "MIT LICENSED",      sub: "FREE FOREVER"       },
]

export function MeteraHighlightsSection() {
  return (
    <div style={{ borderBottom: LINE }}>

      {/* Headline row */}
      <div className="v2r-highlights-head" style={{ padding: "48px 64px", borderBottom: LINE }}>
        <h2 style={{
          fontSize: "clamp(2rem, 3.5vw, 3rem)",
          fontWeight: 300,
          color: "#FFFFFF",
          letterSpacing: "-0.04em",
          lineHeight: 1.05,
          margin: 0,
        }}>
          <MatrixText text="EVERYTHING INCLUDED." /><br />
          <span style={{ color: "#7AF279" }}><MatrixText text="NOTHING TO CONFIGURE." /></span>
        </h2>
      </div>

      <div className="v2r-highlights-grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
      }}>
        {ITEMS.map((item, i) => (
          <div
            key={item.title}
            style={{
              padding: "28px 32px",
              borderRight: (i + 1) % 3 === 0 ? "none" : LINE,
              borderBottom: i < 3 ? LINE : "none",
            }}
          >
            <div style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 15,
              fontWeight: 500,
              color: "#E8F4EE",
              marginBottom: 4,
              letterSpacing: 0,
            }}>
              {item.title}
            </div>
            <div style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 12,
              color: "#4A5549",
              letterSpacing: 0,
            }}>
              {item.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

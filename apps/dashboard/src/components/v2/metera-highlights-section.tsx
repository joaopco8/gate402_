const LINE = "1px solid #2A2E2A"

const ITEMS = [
  { title: "Auto wallet",       sub: "Created instantly"  },
  { title: "Pix & card",        sub: "Deposit in minutes" },
  { title: "On-chain verified", sub: "Helius + Solana"    },
  { title: "Spending limits",   sub: "Per call/day/month" },
  { title: "Open marketplace",  sub: "Any dev can list"   },
  { title: "MIT licensed",      sub: "Free forever"       },
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
          Everything included.<br />
          <span style={{ color: "#7AF279" }}>Nothing to configure.</span>
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

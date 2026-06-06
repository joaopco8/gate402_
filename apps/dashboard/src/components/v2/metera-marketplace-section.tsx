"use client"

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  IMAGE: { bg: "#1565C0", color: "#fff" },
  VIDEO: { bg: "#1B6B3A", color: "#7AF279" },
  DATA:  { bg: "#4A1D96", color: "#C4B5FD" },
}

type Card = {
  provider: string
  model: string
  type: "IMAGE" | "VIDEO" | "DATA"
  logo: React.ReactNode
  price: string
  priceSuffix: string
  maxRes: string
  maxDur: string
  capabilities: string[]
  description: string
}

// ── Logos ────────────────────────────────────────────────────────────────────

function GoogleLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}

function OpenAILogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 41 41" fill="none">
      <path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.52-3.581 10.079 10.079 0 0 0-10.467 4.940 9.967 9.967 0 0 0-6.68 4.834 10.08 10.08 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.52 3.581 10.079 10.079 0 0 0 10.468-4.940 9.967 9.967 0 0 0 6.68-4.834 10.079 10.079 0 0 0-1.241-11.818zm-15.6 21.852a7.48 7.48 0 0 1-4.801-1.734l.237-.135 7.964-4.6a1.32 1.32 0 0 0 .667-1.147v-11.23l3.364 1.944a.12.12 0 0 1 .066.092v9.299a7.505 7.505 0 0 1-7.497 7.511zM4.072 33.32a7.474 7.474 0 0 1-.894-5.037l.237.142 7.964 4.6a1.319 1.319 0 0 0 1.333 0l9.72-5.614v3.888a.12.12 0 0 1-.048.103l-8.051 4.649a7.504 7.504 0 0 1-10.26-2.731zm-1.187-17.36a7.472 7.472 0 0 1 3.907-3.292L6.75 12.81v9.205a1.32 1.32 0 0 0 .666 1.147l9.72 5.613-3.364 1.944a.12.12 0 0 1-.114.012L5.57 25.94a7.504 7.504 0 0 1-2.685-10.08zm27.658 6.437l-9.72-5.615 3.364-1.943a.121.121 0 0 1 .114-.012l8.048 4.648a7.498 7.498 0 0 1-1.158 13.528v-9.205a1.321 1.321 0 0 0-.648-1.4zm3.35-5.043l-.237-.143-7.965-4.6a1.32 1.32 0 0 0-1.333 0L14.64 18.224v-3.888a.12.12 0 0 1 .048-.103l8.051-4.645a7.497 7.497 0 0 1 11.143 7.763zm-21.063 6.929l-3.364-1.944a.12.12 0 0 1-.066-.092v-9.299a7.497 7.497 0 0 1 12.293-5.756l-.237.135-7.964 4.6a1.32 1.32 0 0 0-.667 1.147l-.003 11.209zm1.829-3.943l4.33-2.501 4.332 2.498v4.996l-4.331 2.5-4.331-2.5V20.34z" fill="currentColor"/>
    </svg>
  )
}

function TwitterXLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 5.896zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

function ExaLogo() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#1A1A2E"/>
      <path d="M8 8h16M8 16h10M8 24h16M20 8l4 8-4 8" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Card data ─────────────────────────────────────────────────────────────────

const CARDS: Card[] = [
  {
    provider: "google",
    model: "nano-banana",
    type: "IMAGE",
    logo: <GoogleLogo />,
    price: "$0.05/image",
    priceSuffix: "image",
    maxRes: "2048x2048",
    maxDur: "—",
    capabilities: ["text-to-image", "image-to-image"],
    description: "Fast image generation with image input support",
  },
  {
    provider: "openai",
    model: "sora-2",
    type: "VIDEO",
    logo: <OpenAILogo />,
    price: "$0.12/sec",
    priceSuffix: "second",
    maxRes: "—",
    maxDur: "12s",
    capabilities: ["text-to-video", "image-to-video"],
    description: "Text/image-to-video with synchronized audio, dialogue, and sound effects",
  },
  {
    provider: "twitter",
    model: "trends",
    type: "DATA",
    logo: <TwitterXLogo />,
    price: "$0.01",
    priceSuffix: "call",
    maxRes: "—",
    maxDur: "—",
    capabilities: ["research"],
    description: "Get trending topics for a location by WOEID (1=Worldwide, 23424977=US, 2459115=NYC)",
  },
  {
    provider: "exa",
    model: "search",
    type: "DATA",
    logo: <ExaLogo />,
    price: "$0.01",
    priceSuffix: "call",
    maxRes: "—",
    maxDur: "—",
    capabilities: ["research"],
    description: "Semantic web search",
  },
]

// ── Single card ───────────────────────────────────────────────────────────────

function ApiCard({ card }: { card: Card }) {
  const badge = BADGE_COLORS[card.type]

  return (
    <div style={{
      background: "#1F221F",
      border: "1px solid #2A2E2A",
      display: "flex",
      flexDirection: "column",
      gap: 0,
      overflow: "hidden",
    }}>

      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 20px",
        borderBottom: "1px solid #2A2E2A",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            background: "#252825",
            border: "1px solid #2A2E2A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "#E8F4EE",
          }}>
            {card.logo}
          </div>
          <span style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 14,
            color: "#7A8C79",
            fontWeight: 400,
          }}>
            {card.provider}/
            <span style={{ color: "#E8F4EE", fontWeight: 700 }}>{card.model}</span>
          </span>
        </div>

        <span style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.12em",
          padding: "3px 8px",
          background: badge.bg,
          color: badge.color,
        }}>
          {card.type}
        </span>
      </div>

      {/* Stats */}
      <div style={{ padding: "20px 20px", display: "flex", flexDirection: "column", gap: 14, borderBottom: "1px solid #2A2E2A" }}>
        {[
          { label: "PRICE", value: card.price, suffix: card.priceSuffix },
          { label: "MAX RES", value: card.maxRes, suffix: null },
          { label: "MAX DUR", value: card.maxDur, suffix: null },
        ].map(row => (
          <div key={row.label} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}>
            <span style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 12,
              fontWeight: 500,
              color: "#7B8080",
              letterSpacing: 0,
            }}>
              {row.label}
            </span>
            <span style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 14,
              color: row.value === "—" ? "#2A2E2A" : "#E8F4EE",
              letterSpacing: 0,
            }}>
              {row.value === "—" ? "—" : (
                <>
                  <span style={{ color: "#E8F4EE", fontWeight: 600 }}>{row.value}</span>
                  {row.suffix && <span style={{ color: "#4A5549", marginLeft: 6 }}>{row.suffix}</span>}
                </>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Capabilities */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #1C1F1C" }}>
        <div style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 12,
          fontWeight: 500,
          color: "#7B8080",
          letterSpacing: 0,
          marginBottom: 10,
        }}>
          CAPABILITIES
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {card.capabilities.map(cap => (
            <span key={cap} style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 13,
              color: "#C4D8C2",
              background: "#252825",
              border: "1px solid #2A2E2A",
              padding: "4px 12px",
              letterSpacing: 0,
            }}>
              {cap}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      <div style={{ padding: "0 20px 16px", flexGrow: 1 }}>
        <div style={{
          border: "1px solid #2A2E2A",
          background: "#252825",
          padding: "12px 16px",
        }}>
          <p style={{
            margin: 0,
            fontFamily: "'Geist Mono', monospace",
            fontSize: 13,
            color: "#7A8C79",
            lineHeight: 1.7,
            letterSpacing: 0,
          }}>
            {card.description}
          </p>
        </div>
      </div>

      {/* RUN button */}
      <div style={{ padding: "16px 20px" }}>
        <button style={{
          width: "100%",
          background: "#E8F4EE",
          border: "none",
          padding: "10px",
          fontFamily: "'Geist Mono', monospace",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.14em",
          color: "#0A0C0A",
          cursor: "pointer",
          textAlign: "center",
        }}>
          RUN
        </button>
      </div>
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────

export function MeteraMarketplaceSection() {
  return (
    <section className="v2r-market-section" style={{
      padding: "96px 64px",
      borderBottom: "1px solid #2A2E2A",
    }}>


      {/* Headline */}
      <h2 style={{
        fontSize: "clamp(2rem, 3.5vw, 3rem)",
        fontWeight: 300,
        letterSpacing: "-0.03em",
        color: "#E8F4EE",
        margin: "0 0 48px",
        lineHeight: 1.15,
      }}>
        Every API your agent needs,<br />
        <span style={{ color: "#7AF279" }}>ready to call.</span>
      </h2>

      {/* 2×2 grid */}
      <div className="v2r-market-grid" style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        background: "transparent",
        border: "none",
      }}>
        {CARDS.map(card => (
          <ApiCard key={`${card.provider}/${card.model}`} card={card} />
        ))}
      </div>

      {/* Marketplace CTA */}
      <div style={{ marginTop: 40, display: "flex", justifyContent: "center" }}>
        <a href="/marketplace" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 28px",
          background: "#BC86FF",
          color: "#1B1E1B",
          border: "none",
          borderRadius: 8,
          fontFamily: "'Geist Mono', monospace",
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
          cursor: "pointer",
          transition: "opacity 0.15s",
        }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          Go to marketplace →
        </a>
      </div>

    </section>
  )
}

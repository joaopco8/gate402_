"use client"

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  DATA:    { bg: "#4A1D96", color: "#C4B5FD" },
  FINANCE: { bg: "#1B4A3A", color: "#7AF279" },
}

type Card = {
  provider: string
  model: string
  type: "DATA" | "FINANCE"
  logo: React.ReactNode
  price: string
  priceSuffix: string
  maxRes: string
  maxDur: string
  capabilities: string[]
  description: string
  slug: string
}

// ── Logos ────────────────────────────────────────────────────────────────────

function WeatherLogo() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>
      <path d="M22 10a3 3 0 0 0-3-3h-2.207a5.502 5.502 0 0 0-10.702.5"/>
    </svg>
  )
}

function CryptoLogo() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2h5M9.5 22h5M12 2v3M12 19v3"/>
      <path d="M8 7h4.5a2.5 2.5 0 0 1 0 5H8v5h5a2.5 2.5 0 0 0 0-5"/>
      <path d="M8 7V5M8 17v2"/>
    </svg>
  )
}

function GeoLogo() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="3"/>
      <path d="M12 2a8 8 0 0 1 8 8c0 5.25-8 14-8 14S4 15.25 4 10a8 8 0 0 1 8-8z"/>
    </svg>
  )
}

function ForexLogo() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  )
}

// ── Card data ─────────────────────────────────────────────────────────────────

const CARDS: Card[] = [
  {
    provider: "open-meteo",
    model: "weather",
    type: "DATA",
    logo: <WeatherLogo />,
    price: "$0.001",
    priceSuffix: "call",
    maxRes: "—",
    maxDur: "—",
    capabilities: ["weather", "real-time", "global"],
    description: "Real-time weather data worldwide. Temperature, wind, humidity and more.",
    slug: "weather-api",
  },
  {
    provider: "coingecko",
    model: "crypto-prices",
    type: "FINANCE",
    logo: <CryptoLogo />,
    price: "$0.002",
    priceSuffix: "call",
    maxRes: "—",
    maxDur: "—",
    capabilities: ["crypto", "solana", "bitcoin"],
    description: "Real-time prices for SOL, BTC, ETH and 100+ cryptocurrencies via CoinGecko.",
    slug: "crypto-prices",
  },
  {
    provider: "ip-api",
    model: "geolocation",
    type: "DATA",
    logo: <GeoLogo />,
    price: "$0.001",
    priceSuffix: "call",
    maxRes: "—",
    maxDur: "—",
    capabilities: ["geolocation", "ip", "location"],
    description: "IP address lookup — country, city, timezone, ISP and coordinates.",
    slug: "ip-geolocation",
  },
  {
    provider: "frankfurter",
    model: "forex",
    type: "FINANCE",
    logo: <ForexLogo />,
    price: "$0.001",
    priceSuffix: "call",
    maxRes: "—",
    maxDur: "—",
    capabilities: ["currency", "forex", "rates"],
    description: "Real-time currency exchange rates. USD to BRL, EUR, GBP and 30+ currencies.",
    slug: "currency-exchange-rates",
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
        <a href={`/marketplace/${card.slug}`} style={{
          display: "block",
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
          textDecoration: "none",
          boxSizing: "border-box",
        }}>
          RUN
        </a>
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

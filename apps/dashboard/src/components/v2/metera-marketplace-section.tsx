"use client"

import { useEffect, useState } from "react"

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001"

const CATEGORY_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  finance: { bg: "#1B4A3A", color: "#7AF279",  label: "FINANCE" },
  data:    { bg: "#4A1D96", color: "#C4B5FD",  label: "DATA"    },
  ai:      { bg: "#1565C0", color: "#93C5FD",  label: "AI"      },
  media:   { bg: "#6B1B1B", color: "#FCA5A5",  label: "MEDIA"   },
  other:   { bg: "#2A2E2A", color: "#7A8C79",  label: "OTHER"   },
}

type MarketplaceEndpoint = {
  id: string
  slug: string
  name: string
  description?: string
  category: string
  pricePerCall: number
  avatarImage?: string
  avatarColor?: string
  avatarEmoji?: string
  tags?: string[]
  user?: { username?: string; displayName?: string }
}

// ── Single card ───────────────────────────────────────────────────────────────

function ApiCard({ ep }: { ep: MarketplaceEndpoint }) {
  const badge = CATEGORY_BADGE[ep.category] ?? CATEGORY_BADGE.other
  const providerModel = ep.slug.split("-").slice(0, 2).join("/")

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
            background: ep.avatarColor ?? "#252825",
            border: "1px solid #2A2E2A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            overflow: "hidden",
          }}>
            <img
              src={ep.avatarImage || "/icon-api.jpg"}
              alt={ep.name}
              style={{ width: 36, height: 36, objectFit: "cover", display: "block" }}
            />
          </div>
          <span style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 14,
            color: "#E8F4EE",
            fontWeight: 700,
          }}>
            {ep.name}
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
          {badge.label}
        </span>
      </div>

      {/* Stats */}
      <div style={{ padding: "20px 20px", display: "flex", flexDirection: "column", gap: 14, borderBottom: "1px solid #2A2E2A" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, fontWeight: 500, color: "#7B8080" }}>PRICE</span>
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 14 }}>
            <span style={{ color: "#E8F4EE", fontWeight: 600 }}>${ep.pricePerCall}</span>
            <span style={{ color: "#4A5549", marginLeft: 6 }}>call</span>
          </span>
        </div>
      </div>

      {/* Tags */}
      {ep.tags && ep.tags.length > 0 && (
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #1C1F1C" }}>
          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, fontWeight: 500, color: "#7B8080", marginBottom: 10 }}>
            CAPABILITIES
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ep.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 13,
                color: "#C4D8C2",
                background: "#252825",
                border: "1px solid #2A2E2A",
                padding: "4px 12px",
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div style={{ padding: "0 20px 16px", flexGrow: 1, paddingTop: 16 }}>
        <div style={{ border: "1px solid #2A2E2A", background: "#252825", padding: "12px 16px" }}>
          <p style={{
            margin: 0,
            fontFamily: "'Geist Mono', monospace",
            fontSize: 13,
            color: "#7A8C79",
            lineHeight: 1.7,
          }}>
            {ep.description || "—"}
          </p>
        </div>
      </div>

      {/* RUN button */}
      <div style={{ padding: "16px 20px" }}>
        <a href={`/marketplace/${ep.slug}`} style={{
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
  const [endpoints, setEndpoints] = useState<MarketplaceEndpoint[]>([])

  useEffect(() => {
    fetch(`${API_URL}/api/marketplace?limit=4&sort=popular`)
      .then(r => r.json())
      .then(d => setEndpoints((d.endpoints ?? []).slice(0, 4)))
      .catch(() => {})
  }, [])

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
        {endpoints.map(ep => (
          <ApiCard key={ep.id} ep={ep} />
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

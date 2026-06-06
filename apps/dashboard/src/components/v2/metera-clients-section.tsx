const LINE = "1px solid #2A2E2A"

const CLIENTS = [
  { name: "Claude Code", src: "/logos-ai/claude.png"   },
  { name: "Cursor",      src: "/logos-ai/cursor.png"   },
  { name: "OpenAI",      src: "/logos-ai/open ai.png"  },
  { name: "Gemini CLI",  src: "/logos-ai/gemini.png"   },
  { name: "Copilot",     src: "/logos-ai/copilot.png"  },
]

export function MeteraClientsSection() {
  return (
    <div className="v2r-clients-grid" style={{
      borderBottom: LINE,
      display: "grid",
      gridTemplateColumns: "280px 1fr",
    }}>

      {/* Left — label */}
      <div className="v2r-clients-label" style={{
        padding: "48px 64px",
        borderRight: LINE,
        display: "flex",
        alignItems: "center",
      }}>
        <p style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
          fontWeight: 400,
          color: "#E8F4EE",
          lineHeight: 1.3,
          letterSpacing: "-0.02em",
          margin: 0,
        }}>
          Works with<br />
          <span style={{ color: "#7AF279" }}>every AI agent.</span>
        </p>
      </div>

      {/* Right — logos */}
      <div className="v2r-clients-logos" style={{
        padding: "48px 64px",
        display: "flex",
        alignItems: "center",
        gap: 48,
        flexWrap: "wrap",
      }}>
        {CLIENTS.map(c => (
          <div
            key={c.name}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              opacity: 0.45,
              transition: "opacity 200ms",
              cursor: "default",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0.45")}
          >
            <img
              src={c.src}
              alt={c.name}
              width={44}
              height={44}
              style={{ display: "block", filter: "brightness(0) invert(1)", objectFit: "contain" }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

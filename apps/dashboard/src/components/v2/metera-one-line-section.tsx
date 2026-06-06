'use client'
import { useState, useEffect, useRef } from 'react'

const CARD   = '#1F221F'
const LINE   = '1px solid #2A2E2A'
const TEXT   = '#E8F4EE'
const MUTED  = '#7A8C79'
const DIM    = '#4A5549'
const GREEN  = '#7AF279'
const MONO   = "'Geist Mono', monospace"
const SANS   = "'Inter', sans-serif"

const COMMAND  = 'Read https://metera.dev/skill/your-key\nand follow the instructions'
const RESPONSE = [
  "I've read your Metera skill file.",
  'Your wallet is ready: 4guriz...',
  'Balance: $10.00 USDC',
  'Spending limit: $0.01/call',
  '',
  "I'm ready to pay for APIs automatically.",
  'What would you like me to fetch?',
]

const CLIENTS = [
  { name: 'Claude',  src: '/logos-ai/claude.png'  },
  { name: 'Cursor',  src: '/logos-ai/cursor.png'  },
  { name: 'OpenAI',  src: '/logos-ai/open ai.png' },
  { name: 'Gemini',  src: '/logos-ai/gemini.png'  },
  { name: 'Copilot', src: '/logos-ai/copilot.png' },
]

const BULLETS = [
  'Pay for APIs automatically in USDC',
  'Respect your spending limits',
  'Discover APIs in the marketplace',
  'Check its own balance',
]

// duplicate for seamless loop
const MARQUEE_ITEMS = [...CLIENTS, ...CLIENTS, ...CLIENTS]

export function MeteraOneLineSection() {
  const [typed, setTyped]         = useState('')
  const [showResp, setShowResp]   = useState(false)
  const [respLines, setRespLines] = useState<string[]>([])
  const sectionRef = useRef<HTMLDivElement>(null)
  const started    = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          startTyping()
        }
      },
      { threshold: 0.25 },
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  function startTyping() {
    let i = 0
    setTyped('')
    setShowResp(false)
    setRespLines([])

    const tid = setInterval(() => {
      i++
      setTyped(COMMAND.slice(0, i))
      if (i >= COMMAND.length) {
        clearInterval(tid)
        setTimeout(() => {
          setShowResp(true)
          let lineIdx = 0
          const lid = setInterval(() => {
            lineIdx++
            setRespLines(RESPONSE.slice(0, lineIdx))
            if (lineIdx >= RESPONSE.length) clearInterval(lid)
          }, 160)
        }, 600)
      }
    }, 26)
  }

  return (
    <section ref={sectionRef} style={{ borderBottom: LINE, overflow: 'hidden' }}>

      {/* ── top content ── */}
      <div className="v2r-oneline-pad" style={{ padding: '96px 64px 64px' }}>

        {/* headline + subtitle — full width, centered */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontFamily: SANS, fontWeight: 300, fontSize: 'clamp(2rem, 3.5vw, 3rem)', letterSpacing: '-0.03em', color: TEXT, margin: '0 0 8px', lineHeight: 1.15 }}>
            Connect your AI agent<br />
            <span style={{ color: GREEN }}>in one line.</span>
          </h2>
          <p style={{ fontFamily: SANS, fontWeight: 300, fontSize: 15, color: MUTED, margin: '16px auto 0', lineHeight: 1.6, maxWidth: 480 }}>
            No npm. No config. No crypto knowledge.<br />
            Paste this in Claude, Cursor or any MCP client:
          </p>
        </div>

        {/* two-col: terminal | bullets */}
        <div className="v2r-oneline-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start', maxWidth: 960, margin: '0 auto' }}>

          {/* LEFT — terminals */}
          <div>
            {/* command block */}
            <div style={{ background: '#111311', border: LINE, borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderBottom: LINE, background: CARD }}>
                {['#ef4444', '#f59e0b', GREEN].map((c, i) => (
                  <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
                ))}
                <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11, color: DIM }}>prompt</span>
              </div>
              <div style={{ padding: '20px 20px 20px' }}>
                <pre style={{ margin: 0, fontFamily: MONO, fontSize: 14, lineHeight: 1.7, color: TEXT, whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: 56 }}>
                  <span style={{ color: GREEN }}>{'> '}</span>
                  {typed}
                  <span style={{
                    display: 'inline-block', width: 2, height: '1em',
                    background: GREEN, marginLeft: 1, verticalAlign: 'text-bottom',
                    animation: 'blink 1s step-end infinite',
                  }} />
                </pre>
              </div>
            </div>

            {/* Claude response */}
            <div style={{
              background: CARD,
              border: `1px solid ${showResp ? '#DA7B5C44' : '#2A2E2A'}`,
              borderRadius: 8,
              overflow: 'hidden',
              transition: 'border-color 0.4s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderBottom: LINE, background: showResp ? 'rgba(218,123,92,0.06)' : 'transparent', transition: 'background 0.4s' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: showResp ? '#DA7B5C' : DIM, transition: 'background 0.4s', boxShadow: showResp ? '0 0 6px #DA7B5C' : 'none' }} />
                <span style={{ fontFamily: MONO, fontSize: 11, color: showResp ? '#DA7B5C' : DIM, transition: 'color 0.4s' }}>Claude</span>
              </div>
              <div style={{ padding: '16px 20px', minHeight: 130 }}>
                {respLines.map((line, i) => (
                  <div key={i} style={{
                    fontFamily: MONO, fontSize: 13, lineHeight: '22px',
                    color: line === '' ? 'transparent' : (i === 0 ? TEXT : line.startsWith('Balance') || line.startsWith('Spending') || line.startsWith('Your wallet') ? GREEN : MUTED),
                    opacity: 0,
                    animation: 'fadeIn 0.2s ease forwards',
                    animationDelay: `${i * 0.04}s`,
                  }}>
                    {line || '\u00a0'}
                  </div>
                ))}
                {!showResp && (
                  <div style={{ fontFamily: MONO, fontSize: 12, color: DIM, fontStyle: 'italic' }}>Waiting for command...</div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — bullets */}
          <div style={{ paddingTop: 12 }}>
            <p style={{ fontFamily: MONO, fontSize: 11, color: DIM, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 24, marginTop: 0 }}>
              Your agent instantly knows how to:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {BULLETS.map(b => (
                <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <span style={{ color: GREEN, fontFamily: MONO, fontSize: 16, flexShrink: 0, marginTop: 1 }}>→</span>
                  <span style={{ fontFamily: SANS, fontWeight: 300, fontSize: 16, color: TEXT, lineHeight: 1.5 }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── logos strip ── */}
      <div className="v2r-logos-strip" style={{ borderTop: LINE, padding: '36px 64px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 72 }}>
        {CLIENTS.map((c, i) => (
          <img
            key={c.name}
            src={c.src}
            alt={c.name}
            width={48}
            height={48}
            style={{
              display: 'block',
              objectFit: 'contain',
              filter: 'brightness(0) invert(1)',
              animation: `logo-pulse 4s ease-in-out infinite`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
        @keyframes logo-pulse {
          0%   { opacity: 0.12; filter: brightness(0) invert(1) blur(3px); }
          40%  { opacity: 0.75; filter: brightness(0) invert(1) blur(0px); }
          60%  { opacity: 0.75; filter: brightness(0) invert(1) blur(0px); }
          100% { opacity: 0.12; filter: brightness(0) invert(1) blur(3px); }
        }
      `}</style>
    </section>
  )
}

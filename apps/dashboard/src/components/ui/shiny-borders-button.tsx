'use client'

import { useState } from 'react'

interface RealismButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  style?: React.CSSProperties
  target?: string
  rel?: string
}

const SPIN_CSS = `
  @property --shiny-angle {
    syntax: '<angle>';
    inherits: false;
    initial-value: 0deg;
  }
  @keyframes shinyRotate {
    to { --shiny-angle: 360deg; }
  }
  .realism-btn-border {
    animation: shinyRotate 2.5s linear infinite;
  }
`

export function RealismButton({ children, href, onClick, style, target, rel }: RealismButtonProps) {
  const [hovered, setHovered] = useState(false)

  const accentColor = hovered ? '#9945FF' : '#00ff88'

  const inner = (
    <>
      <style>{SPIN_CSS}</style>
      {/* Animated border layer */}
      <span
        className="realism-btn-border"
        aria-hidden
        style={{
          position: 'absolute',
          inset: -1,
          borderRadius: 7,
          background: `conic-gradient(from var(--shiny-angle, 0deg), transparent 0%, ${accentColor} 20%, transparent 40%)`,
          zIndex: 0,
          transition: 'background 0.3s',
        }}
      />
      {/* Inner fill */}
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          borderRadius: 6,
          padding: '11px 23px',
          color: '#fff',
          fontSize: 14,
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          transition: 'background 0.2s',
        }}
      >
        {children}
      </span>
    </>
  )

  const sharedStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textDecoration: 'none',
    padding: 1,
    ...style,
  }

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        style={sharedStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {inner}
      </a>
    )
  }

  return (
    <button
      onClick={onClick}
      style={sharedStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {inner}
    </button>
  )
}

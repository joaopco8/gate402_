'use client'

import { useRef, useState } from 'react'

interface GlowCardProps {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

export function GlowCard({ children, style, className }: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: '50%', y: '50%' })
  const [hovered, setHovered] = useState(false)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current!.getBoundingClientRect()
    setPos({ x: `${e.clientX - rect.left}px`, y: `${e.clientY - rect.top}px` })
  }

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: '#0d0d0d',
        border: `1px solid ${hovered ? 'rgba(0,255,136,0.25)' : '#1a1a1a'}`,
        borderRadius: 8,
        overflow: 'hidden',
        transition: 'border-color 0.3s ease',
        ...style,
      }}
    >
      {/* Spotlight glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(320px circle at ${pos.x} ${pos.y}, rgba(0,255,136,0.07), transparent 70%)`,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}

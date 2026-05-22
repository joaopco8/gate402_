'use client'

import { useState } from 'react'

interface CardProps {
  children: React.ReactNode
  style?: React.CSSProperties
  accent?: boolean
  glass?: boolean
  hover?: boolean
}

export default function Card({ children, style, accent, glass, hover }: CardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: glass ? 'rgba(23,23,23,0.8)' : 'var(--bg-surface)',
        backdropFilter: glass ? 'blur(12px)' : undefined,
        border: `1px solid ${accent
          ? 'var(--success-border)'
          : hovered
            ? 'var(--border-strong)'
            : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        transition: 'border-color 200ms ease, box-shadow 200ms ease',
        boxShadow: hovered
          ? '0 0 0 1px rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.4)'
          : '0 0 0 1px rgba(255,255,255,0.01)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Shimmer sutil no topo */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
        pointerEvents: 'none',
      }} />
      {children}
    </div>
  )
}

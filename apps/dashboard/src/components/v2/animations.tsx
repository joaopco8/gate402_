'use client'
import React, { useEffect, useRef, useState } from 'react'

/* ── FadeIn ────────────────────────────────────────────────────────────── */
interface FadeInProps {
  children: React.ReactNode
  delay?: number
  y?: number
  blur?: number
  style?: React.CSSProperties
}

export function FadeIn({ children, delay = 0, y = 20, blur = 0, style }: FadeInProps) {
  const ref                     = useRef<HTMLDivElement>(null)
  const [visible, setVisible]   = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.08 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : `translateY(${y}px)`,
        filter:     blur > 0 ? (visible ? 'blur(0px)' : `blur(${blur}px)`) : undefined,
        transition: `opacity 600ms ease ${delay}ms, transform 600ms ease ${delay}ms${blur > 0 ? `, filter 600ms ease ${delay}ms` : ''}`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* ── useStagger ────────────────────────────────────────────────────────── */
export function useStagger(count: number, baseDelay = 0, step = 100) {
  const ref                     = useRef<HTMLDivElement>(null)
  const [visible, setVisible]   = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const itemStyle = (i: number): React.CSSProperties => ({
    opacity:    visible ? 1 : 0,
    transform:  visible ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 400ms ease ${baseDelay + i * step}ms, transform 400ms ease ${baseDelay + i * step}ms`,
  })

  return { ref, visible, itemStyle }
}

/* ── Strikethrough ─────────────────────────────────────────────────────── */
interface StrikeProps {
  children: React.ReactNode
  color?: string
  delay?: number
  style?: React.CSSProperties
}

export function Strikethrough({ children, color = '#7AF279', delay = 300, style }: StrikeProps) {
  const ref                   = useRef<HTMLSpanElement>(null)
  const [done, setDone]       = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setDone(true); obs.disconnect() }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-block', ...style }}>
      {children}
      <span style={{
        position:   'absolute',
        left:        0,
        top:         '52%',
        height:      2,
        background:  color,
        width:       done ? '100%' : '0%',
        transition:  `width 500ms cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
        pointerEvents: 'none',
      }} />
    </span>
  )
}

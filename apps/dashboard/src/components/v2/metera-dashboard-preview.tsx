'use client'
import React, { useState, useEffect, useRef } from 'react'
import { FadeIn } from './animations'

const LINE  = '1px solid #2A2E2A'
const MONO  = "'JetBrains Mono', monospace"
const SANS  = "'Inter', sans-serif"
const GREEN = '#7AF279'
const MUTED = '#7A8C79'
const DIM   = '#4A5549'
const TEXT  = '#E8F4EE'
const BG    = '#1B1E1B'

const NOTIFS = [
  { endpoint: '/api/data',       amount: '0.001 USDC', ms: '387ms' },
  { endpoint: '/api/classify',   amount: '0.001 USDC', ms: '412ms' },
  { endpoint: '/api/summarize',  amount: '0.005 USDC', ms: '298ms' },
  { endpoint: '/api/embed',      amount: '0.002 USDC', ms: '451ms' },
]

export function MeteraDashboardPreview() {
  const [notifVisible, setNotifVisible] = useState(false)
  const [notifIdx, setNotifIdx]         = useState(0)
  const [calls, setCalls]               = useState(1_247)
  const [revenue, setRevenue]           = useState(1.247)
  const sectionRef                      = useRef<HTMLDivElement>(null)
  const [visible, setVisible]           = useState(false)

  /* viewport */
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  /* notification cycling */
  useEffect(() => {
    if (!visible) return
    const show = () => {
      setNotifIdx(i => (i + 1) % NOTIFS.length)
      setNotifVisible(true)
      setTimeout(() => setNotifVisible(false), 2600)
    }
    const t = setTimeout(show, 800)
    const iv = setInterval(show, 4200)
    return () => { clearTimeout(t); clearInterval(iv) }
  }, [visible])

  /* live counter tick */
  useEffect(() => {
    if (!visible) return
    const iv = setInterval(() => {
      const delta = Math.floor(Math.random() * 3) + 1
      setCalls(c => c + delta)
      setRevenue(r => parseFloat((r + delta * 0.001).toFixed(3)))
    }, 2200)
    return () => clearInterval(iv)
  }, [visible])

  const notif = NOTIFS[notifIdx]

  return (
    <div ref={sectionRef} style={{ borderBottom: LINE }}>

      {/* header */}
      <div style={{ padding: '72px 64px 44px', borderBottom: LINE }}>
        <FadeIn>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            fontWeight: 300,
            letterSpacing: '-0.04em',
            color: '#FFFFFF',
            margin: 0,
            lineHeight: 1.05,
            fontFamily: SANS,
          }}>
            Real-time visibility.
          </h2>
        </FadeIn>
      </div>

      {/* dashboard container */}
      <div style={{ position: 'relative', padding: '64px 48px 0', overflow: 'hidden' }}>

        {/* image wrapper with perspective tilt */}
        <div style={{
          position: 'relative',
          transform: 'perspective(1400px) rotateX(6deg) scale(0.97)',
          transformOrigin: '50% 100%',
          borderRadius: '12px 12px 0 0',
          overflow: 'hidden',
          boxShadow: [
            '0 -4px 40px rgba(0,0,0,0.5)',
            '0 0 80px rgba(122,242,121,0.06)',
            '0 0 0 1px rgba(122,242,121,0.08)',
          ].join(', '),
        }}>
          <img
            src="/preview-dash.png"
            alt="Metera Dashboard"
            style={{ display: 'block', width: '100%', height: 'auto' }}
          />

          {/* edge fades */}
          <div style={{ position: 'absolute', inset: 0, left: 0, top: 0, width: 120, background: `linear-gradient(to right, ${BG}, transparent)`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, right: 0, top: 0, left: 'auto', width: 120, background: `linear-gradient(to left, ${BG}, transparent)`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 180, background: `linear-gradient(to top, ${BG}, transparent)`, pointerEvents: 'none' }} />

          {/* live stats overlay — top left */}
          <div style={{
            position: 'absolute',
            top: 20,
            left: 20,
            display: 'flex',
            gap: 8,
          }}>
            {[
              { label: 'total calls', val: calls.toLocaleString() },
              { label: 'revenue',     val: `$${revenue.toFixed(3)}` },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(14,18,14,0.82)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(122,242,121,0.15)',
                borderRadius: 8,
                padding: '8px 14px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
              }}>
                <div style={{ fontSize: 9, color: DIM, fontFamily: MONO, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 15, color: TEXT, fontFamily: MONO, fontWeight: 400, letterSpacing: '-0.02em', transition: 'all 0.3s ease' }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* notification toast — bottom right */}
          <div style={{
            position: 'absolute',
            bottom: 48,
            right: 20,
            maxWidth: 260,
            background: 'rgba(14,18,14,0.88)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(122,242,121,0.2)',
            borderRadius: 10,
            padding: '12px 14px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 24px rgba(122,242,121,0.08)',
            opacity: notifVisible ? 1 : 0,
            transform: notifVisible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            pointerEvents: 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              {/* pulse dot */}
              <span style={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
                <span style={{
                  position: 'absolute', inset: 0, borderRadius: '50%', background: GREEN,
                  animation: 'v2-pulse 1.4s ease-out infinite',
                }} />
                <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: GREEN }} />
              </span>
              <span style={{ fontSize: 12, color: GREEN, fontFamily: MONO, letterSpacing: '0.04em' }}>payment received</span>
            </div>
            <div style={{ fontSize: 13, color: TEXT, fontFamily: MONO, marginBottom: 2 }}>{notif.amount}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: DIM, fontFamily: MONO }}>{notif.endpoint}</span>
              <span style={{ fontSize: 12, color: DIM, fontFamily: MONO }}>{notif.ms}</span>
            </div>
          </div>

        </div>
      </div>

      {/* pulse keyframe */}
      <style>{`
        @keyframes v2-pulse {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>

    </div>
  )
}

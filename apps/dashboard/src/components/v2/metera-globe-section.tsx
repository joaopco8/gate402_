// @ts-nocheck
'use client'
import React, { useEffect, useRef, useCallback } from 'react'
import createGlobe from 'cobe'

interface PulseMarker {
  id: string
  location: [number, number]
  delay: number
}

const DEFAULT_MARKERS: PulseMarker[] = [
  { id: 'pulse-1', location: [51.51,  -0.13],  delay: 0   },
  { id: 'pulse-2', location: [40.71, -74.01],  delay: 0.5 },
  { id: 'pulse-3', location: [35.68, 139.65],  delay: 1   },
  { id: 'pulse-4', location: [-33.87, 151.21], delay: 1.5 },
]

function GlobePulse({
  markers = DEFAULT_MARKERS,
  speed   = 0.003,
}: {
  markers?: PulseMarker[]
  speed?: number
}) {
  const canvasRef        = useRef<HTMLCanvasElement>(null)
  const pointerStart     = useRef<{ x: number; y: number } | null>(null)
  const dragOffset       = useRef({ phi: 0, theta: 0 })
  const phiOffset        = useRef(0)
  const thetaOffset      = useRef(0)
  const isPaused         = useRef(false)
  const phiRef           = useRef(0)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing'
    isPaused.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerStart.current !== null) {
      phiOffset.current   += dragOffset.current.phi
      thetaOffset.current += dragOffset.current.theta
      dragOffset.current   = { phi: 0, theta: 0 }
    }
    pointerStart.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab'
    isPaused.current = false
  }, [])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (pointerStart.current !== null) {
        dragOffset.current = {
          phi:   (e.clientX - pointerStart.current.x) / 300,
          theta: (e.clientY - pointerStart.current.y) / 1000,
        }
      }
    }
    window.addEventListener('pointermove', onMove,          { passive: true })
    window.addEventListener('pointerup',   handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup',   handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let globe: ReturnType<typeof createGlobe> | null = null

    function init() {
      if (!canvas || canvas.offsetWidth === 0 || globe) return
      const w = canvas.offsetWidth

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width:         w,
        height:        w,
        phi:           0,
        theta:         0.2,
        dark:          1,
        diffuse:       1.5,
        mapSamples:    16000,
        mapBrightness: 10,
        baseColor:     [0.5, 0.5, 0.5],
        markerColor:   [0.2, 0.8, 0.9],
        glowColor:     [0.05, 0.05, 0.05],
        markers:       markers.map(m => ({ location: m.location, size: 0.04 })),
        onRender: (state) => {
          if (!isPaused.current) phiRef.current += speed
          state.phi   = phiRef.current + phiOffset.current + dragOffset.current.phi
          state.theta = 0.2 + thetaOffset.current + dragOffset.current.theta
          state.width  = w * 2
          state.height = w * 2
        },
      })

      setTimeout(() => { if (canvas) canvas.style.opacity = '1' })
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver(entries => {
        if ((entries[0]?.contentRect.width ?? 0) > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
      return () => ro.disconnect()
    }

    return () => { if (globe) globe.destroy() }
  }, [markers, speed])

  return (
    <div style={{ position: 'relative', aspectRatio: '1 / 1', userSelect: 'none', width: '100%' }}>
      <style>{`
        @keyframes pulse-expand {
          0%   { transform: scale(0.3); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0;   }
        }
      `}</style>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width:        '100%',
          height:       '100%',
          cursor:       'grab',
          opacity:      0,
          transition:   'opacity 1.2s ease',
          borderRadius: '50%',
          touchAction:  'none',
        }}
      />
    </div>
  )
}

/* ── section ── */
const LINE  = '1px solid #2A2E2A'
const SANS  = "'Inter', sans-serif"
const GREEN = '#7AF279'
const MUTED = '#7A8C79'

export function MeteraGlobeSection() {
  return (
    <section style={{
      position:     'relative',
      width:        '100%',
      overflow:     'hidden',
      borderRadius: 24,
      background:   'rgba(255,255,255,0.03)',
      border:       '1px solid #1f2937',
      boxShadow:    '0 4px 6px -1px rgba(0,0,0,0.1)',
      padding:      '96px 64px',
      marginTop:    192,
    }}>
      <div style={{
        display:        'flex',
        flexDirection:  'row',
        alignItems:     'center',
        justifyContent: 'space-between',
        gap:            40,
      }}>

        {/* left */}
        <div style={{ zIndex: 10, maxWidth: 480, flexShrink: 0 }}>
          <h2 style={{
            fontSize:      'clamp(2rem, 3.5vw, 3rem)',
            fontWeight:    300,
            letterSpacing: '-0.04em',
            color:         '#FFFFFF',
            margin:        '0 0 16px',
            lineHeight:    1.08,
            fontFamily:    SANS,
          }}>
            Payments across<br />
            <span style={{ color: GREEN }}>every timezone.</span>
          </h2>
          <p style={{
            fontSize:   15,
            color:      MUTED,
            lineHeight: 1.7,
            margin:     '0 0 32px',
            fontWeight: 300,
            fontFamily: SANS,
            maxWidth:   380,
          }}>
            Agents running anywhere pay your API instantly.
            No currency conversion. No international fees. Just USDC on Solana.
          </p>
          <a
            href="/auth/login"
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            8,
              background:     GREEN,
              color:          '#1B1E1B',
              fontFamily:     SANS,
              fontSize:       13,
              fontWeight:     500,
              padding:        '10px 20px',
              borderRadius:   6,
              textDecoration: 'none',
              transition:     'opacity 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Start for free →
          </a>
        </div>

        {/* right — globe */}
        <div style={{
          width:    '100%',
          maxWidth: 480,
          flexShrink: 1,
        }}>
          <GlobePulse />
        </div>

      </div>
    </section>
  )
}

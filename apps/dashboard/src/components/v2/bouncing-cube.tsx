'use client'

import { useEffect, useRef } from 'react'
import CubeAnimation from '@/components/ui/ascii-cube'

// Original component renders at text-xs (12px), leading-none
// W=120 chars × ~7.2px/char = ~864px wide
// H=60 lines × 12px/line = ~720px tall
const NATIVE_W = 864
const NATIVE_H = 720

export function BouncingCube({ containerW, containerH }: { containerW: number; containerH: number }) {
  const wrapRef = useRef<HTMLDivElement>(null)

  const scale = containerW / NATIVE_W
  const scaledW = containerW               // = NATIVE_W * scale
  const scaledH = NATIVE_H * scale

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const maxX = Math.max(0, containerW - scaledW)
    const maxY = Math.max(0, containerH - scaledH)

    let x = Math.random() * maxX
    let y = Math.random() * maxY

    const speed = 55
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5
    let vx = Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1)
    let vy = Math.sin(angle) * speed * (Math.random() > 0.5 ? 1 : -1)

    let last = 0
    let frame: number

    function tick(ts: number) {
      const dt = Math.min((ts - last) / 1000, 0.05)
      last = ts

      x += vx * dt
      y += vy * dt

      if (x <= 0)      { x = 0;    vx = Math.abs(vx) }
      if (x >= maxX)   { x = maxX; vx = -Math.abs(vx) }
      if (y <= 0)      { y = 0;    vy = Math.abs(vy) }
      if (y >= maxY)   { y = maxY; vy = -Math.abs(vy) }

      if (el) el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(ts => { last = ts; frame = requestAnimationFrame(tick) })
    return () => cancelAnimationFrame(frame)
  }, [containerW, containerH, scaledW, scaledH])

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
      <div ref={wrapRef} style={{ willChange: 'transform', width: scaledW, height: scaledH, overflow: 'hidden' }}>
        {/* Scale the native 864×720 cube to fit the gutter width */}
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: NATIVE_W, height: NATIVE_H }}>
          <CubeAnimation
            color={true}
            edges={true}
            backfaceCulling={true}
            speedA={0.02}
            speedB={0.015}
            speedC={0.008}
            axis="xyz"
            incrementSpeed={0.02}
          />
        </div>
      </div>
    </div>
  )
}

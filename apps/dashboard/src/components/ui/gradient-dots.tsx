'use client'

interface GradientDotsProps {
  duration?: number
}

export function GradientDots({ duration = 20 }: GradientDotsProps) {
  return (
    <>
      <style>{`
        @keyframes gradientDotsShift {
          0%   { background-position: 0px 0px; }
          100% { background-position: 40px 40px; }
        }
      `}</style>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '-40px',
            backgroundImage: 'radial-gradient(circle, rgba(0,255,136,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.3,
            animation: `gradientDotsShift ${duration}s linear infinite`,
          }}
        />
        {/* Fade vignette so dots don't appear on edges */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 40%, #000 80%)',
          }}
        />
      </div>
    </>
  )
}

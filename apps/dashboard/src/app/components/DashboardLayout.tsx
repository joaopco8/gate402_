'use client'

import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>

      {/* Orbe verde — canto superior direito */}
      <div style={{
        position: 'fixed',
        top: -200,
        right: -200,
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,188,125,0.04) 0%, transparent 65%)',
        pointerEvents: 'none',
        zIndex: 0,
        animation: 'orbFloat 8s ease-in-out infinite',
      }} />

      {/* Orbe roxo — canto inferior esquerdo */}
      <div style={{
        position: 'fixed',
        bottom: -300,
        left: 0,
        width: 700,
        height: 700,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(153,69,255,0.03) 0%, transparent 65%)',
        pointerEvents: 'none',
        zIndex: 0,
        animation: 'orbFloat 12s ease-in-out infinite reverse',
      }} />

      {/* Sidebar desktop */}
      {!isMobile && <Sidebar />}

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
          }}
        />
      )}
      {isMobile && mobileOpen && (
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      )}

      {/* Main content */}
      <main style={{
        marginLeft: isMobile ? 0 : 220,
        flex: 1,
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1,
        transition: 'margin-left 200ms ease',
      }}>
        {isMobile && (
          <div style={{ padding: '16px 20px 0' }}>
            <button
              onClick={() => setMobileOpen(true)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 6,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 18,
                padding: '4px 10px',
                lineHeight: 1,
                fontFamily: 'var(--font-code)',
              }}
            >≡</button>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}

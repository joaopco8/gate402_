'use client'
import { useState, useEffect } from 'react'
import '../styles/v2/tokens.css'
import { MeteraControlSection } from '../components/v2/metera-control-section'
import { MeteraFeaturesSection } from '../components/v2/metera-features-section'
import { MeteraFAQSection } from '../components/v2/metera-faq-section'
import { MeteraDocsCTA } from '../components/v2/metera-docs-cta'
import { V2Navbar } from '../components/v2/v2-navbar'
import { V2Footer } from '../components/v2/v2-footer'
import { MeteraMarketplaceSection } from '../components/v2/metera-marketplace-section'
import { MeteraStepsSection } from '../components/v2/metera-steps-section'
import { MeteraClientsSection } from '../components/v2/metera-clients-section'
import { MeteraHighlightsSection } from '../components/v2/metera-highlights-section'
import { MeteraOneLineSection } from '../components/v2/metera-one-line-section'
import { FadeIn } from '../components/v2/animations'
import { MatrixText } from '../components/ui/matrix-text'

const LINE = '1px solid #2A2E2A'
const MAX_WIDTH = '1200px'


const TYPEWRITER_TEXT = 'AGENTS PAY YOU IN USDC ON SOLANA.\nNO BANKS, NO CREDIT CARDS, NO HUMANS.'

export default function HomePage() {
  const [heroReady, setHeroReady] = useState(false)
  const [typed, setTyped] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 300)
    return () => clearTimeout(t)
  }, [])

  // typewriter starts after h1 blur animation (~900ms)
  useEffect(() => {
    if (!heroReady) return
    let i = 0
    setTyped('')
    const id = setTimeout(() => {
      const interval = setInterval(() => {
        i++
        setTyped(TYPEWRITER_TEXT.slice(0, i))
        if (i >= TYPEWRITER_TEXT.length) clearInterval(interval)
      }, 30)
    }, 900)
    return () => clearTimeout(id)
  }, [heroReady])

  return (
    <div style={{
      background: '#1B1E1B',
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif",
      color: '#E8F4EE',
    }}>

      <V2Navbar />

      {/* ─── HERO ─── full width ─── */}
      <FadeIn blur={6} y={24}>
      <div className="hero-section" style={{
        position: 'relative',
        width: '100%',
        borderBottom: LINE,
        overflow: 'hidden',
      }}>
        {/* desktop bg */}
        <div className="hero-bg-desktop" style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('/BG-DESKTOP-OFC.jpg')",
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          opacity: 0.8,
        }} />
        {/* mobile bg */}
        <div className="hero-bg-mobile" style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/mobile-bg.jpg)',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          opacity: 0.8,
        }} />

        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '0 clamp(24px, 5vw, 96px) clamp(32px, 5vh, 56px)',
          opacity: heroReady ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 3.79vw, 4.38rem)',
            fontWeight: 300,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            marginBottom: 20,
            color: '#FFFFFF',
            opacity: heroReady ? 1 : 0,
            filter: heroReady ? 'blur(0px)' : 'blur(24px)',
            transform: heroReady ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 700ms ease, filter 700ms ease, transform 700ms ease',
          }}>
            <MatrixText text="BILLING INFRASTRUCTURE" letterInterval={40} />
            <br />
            <span style={{ color: '#7AF279' }}><MatrixText text="FOR AI AGENTS." letterInterval={40} /></span>
          </h1>

          <p style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 'clamp(12px, 1.2vw, 16px)',
            fontWeight: 300,
            color: 'rgba(232,244,238,0.7)',
            lineHeight: 1.7,
            marginBottom: 28,
            maxWidth: 480,
            whiteSpace: 'pre-wrap',
            minHeight: '3.4em',
          }}>
            {typed}
            <span style={{
              display: 'inline-block',
              width: '2px',
              height: '1em',
              background: '#7AF279',
              marginLeft: '2px',
              verticalAlign: 'text-bottom',
              animation: 'blink 1s step-end infinite',
              opacity: typed.length < TYPEWRITER_TEXT.length ? 1 : 0,
            }} />
            <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
          </p>

          <div>
            <a href="/auth/login" style={{
              display: 'inline-block',
              padding: '10px 24px',
              border: 'none',
              color: '#1B1E1B',
              fontSize: 14,
              fontFamily: "'Geist Mono', monospace",
              fontWeight: 500,
              textDecoration: 'none',
              background: '#7AF279',
              cursor: 'pointer',
            }}>
              <MatrixText text="Start free →" />
            </a>
          </div>
        </div>
      </div>
      </FadeIn>

      <div className="v2r-page-border" style={{
        maxWidth: MAX_WIDTH,
        margin: '0 auto',
        borderLeft: LINE,
        borderRight: LINE,
        position: 'relative',
        zIndex: 1,
        background: '#1B1E1B',
      }}>

        <FadeIn blur={6} y={24}><MeteraStepsSection /></FadeIn>
        <FadeIn blur={6} y={24}><MeteraOneLineSection /></FadeIn>
        <FadeIn blur={6} y={24}><MeteraHighlightsSection /></FadeIn>
        <FadeIn blur={6} y={24}><MeteraMarketplaceSection /></FadeIn>
        <FadeIn blur={6} y={24}><MeteraControlSection /></FadeIn>
        <FadeIn blur={6} y={24}><MeteraDocsCTA /></FadeIn>
        <FadeIn blur={6} y={24}><MeteraClientsSection /></FadeIn>
        <FadeIn blur={6} y={24}><MeteraFeaturesSection /></FadeIn>
        <FadeIn blur={6} y={24}><MeteraFAQSection /></FadeIn>
        <V2Footer />

      </div>
    </div>
  )
}

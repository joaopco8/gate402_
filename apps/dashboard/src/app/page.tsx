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

const LINE = '1px solid #2A2E2A'
const MAX_WIDTH = '1200px'

const TYPEWRITER_TEXT = 'Agents pay you in USDC on Solana.\nNo banks, no credit cards, no humans.'

export default function HomePage() {
  const [heroReady, setHeroReady] = useState(false)
  const [typed, setTyped] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 300)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!heroReady) return
    let i = 0
    setTyped('')
    const id = setInterval(() => {
      i++
      setTyped(TYPEWRITER_TEXT.slice(0, i))
      if (i >= TYPEWRITER_TEXT.length) clearInterval(id)
    }, 28)
    return () => clearInterval(id)
  }, [heroReady])

  return (
    <div style={{
      background: '#1B1E1B',
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif",
      color: '#E8F4EE',
    }}>

      <V2Navbar />

      <div className="v2r-page-border" style={{
        maxWidth: MAX_WIDTH,
        margin: '0 auto',
        borderLeft: LINE,
        borderRight: LINE,
        position: 'relative',
        zIndex: 1,
        background: '#1B1E1B',
      }}>

        {/* ─── HERO ─── constrained to 1200px, natural image height ─── */}
        <FadeIn blur={6} y={24}>
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '3512 / 2160',
          borderBottom: LINE,
          overflow: 'hidden',
        }}>
          {/* bg image at 80% opacity */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/bg-ofc1.png)',
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            opacity: 0.8,
          }} />

          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 64px',
            opacity: heroReady ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 4.5vw, 5rem)',
              fontWeight: 300,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              marginBottom: '28px',
              color: '#FFFFFF',
            }}>
              Billing infrastructure
              <br />
              <span style={{ color: '#7AF279' }}>for AI agents.</span>
            </h1>

            <p className="v2r-hero-subtitle" style={{
              fontSize: 'clamp(13px, 1.2vw, 18px)',
              color: '#FFFFFF',
              lineHeight: 1.7,
              maxWidth: '540px',
              marginBottom: '40px',
              fontWeight: 300,
              fontFamily: "'Geist Mono', monospace",
              whiteSpace: 'pre',
            }}>
              {typed}
              <span style={{
                display: 'inline-block',
                width: '2px',
                height: '1.1em',
                background: '#7AF279',
                marginLeft: '2px',
                verticalAlign: 'text-bottom',
                animation: 'blink 1s step-end infinite',
              }} />
              <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
            </p>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <a href="/auth/login" style={{
                display: 'inline-block',
                background: 'transparent',
                color: '#7A8C79',
                padding: '6px 0',
                fontSize: '13px',
                fontWeight: 400,
                fontFamily: "'Inter', sans-serif",
                cursor: 'pointer',
                textDecoration: 'none',
              }}>
                Get started free
              </a>
              <span style={{ color: '#2A2E2A', fontSize: '13px' }}>|</span>
              <a href="/docs" style={{
                display: 'inline-block',
                background: 'transparent',
                color: '#7A8C79',
                padding: '6px 0',
                fontSize: '13px',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                cursor: 'pointer',
                textDecoration: 'none',
              }}>
                Read docs →
              </a>
            </div>
          </div>
        </div>
        </FadeIn>

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

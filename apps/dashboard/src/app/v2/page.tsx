'use client'
import { useState, useEffect } from 'react'
import '../../styles/v2/tokens.css'
import { DitheringShader } from '../../components/v2/dithering-shader'
import { MeteraControlSection } from '../../components/v2/metera-control-section'
import { MeteraFeaturesSection } from '../../components/v2/metera-features-section'
import { MeteraFAQSection } from '../../components/v2/metera-faq-section'
import { MeteraDocsCTA } from '../../components/v2/metera-docs-cta'
import { V2Navbar } from '../../components/v2/v2-navbar'
import { V2Footer } from '../../components/v2/v2-footer'
import { MeteraMarketplaceSection } from '../../components/v2/metera-marketplace-section'
import { MeteraStepsSection } from '../../components/v2/metera-steps-section'
import { MeteraClientsSection } from '../../components/v2/metera-clients-section'
import { MeteraHighlightsSection } from '../../components/v2/metera-highlights-section'
import { MeteraOneLineSection } from '../../components/v2/metera-one-line-section'
import { FadeIn } from '../../components/v2/animations'

const LINE = '1px solid #2A2E2A'
const MAX_WIDTH = '1200px'
const PAD = '0 64px'

const TYPEWRITER_TEXT = 'Agents pay you in USDC on Solana.\nNo banks, no credit cards, no humans.'

export default function V2Page() {
  const [heroReady, setHeroReady] = useState(false)
  const [typed, setTyped] = useState('')

  // fallback: show content if WebGL takes too long or fails
  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 800)
    return () => clearTimeout(t)
  }, [])

  // typewriter — starts after hero fades in
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

      {/* ─── NAVBAR ─── */}
      <V2Navbar />

      <div className="v2r-page-border" style={{
        maxWidth: MAX_WIDTH,
        margin: '0 auto',
        borderLeft: LINE,
        borderRight: LINE,
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1,
        background: '#1B1E1B',
      }}>

        {/* ─── HERO ─── */}
        <div className="v2r-hero-pad" style={{
          position: 'relative',
          padding: '120px 64px 120px',
          borderBottom: LINE,
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          overflow: 'hidden',
        }}>

          {/* DitheringShader background — full hero */}
          <DitheringShader
            shape="wave"
            type="8x8"
            colorBack="#1B1E1B"
            colorFront="#BC86FF"
            pxSize={3}
            speed={0.6}
            style={{ opacity: heroReady ? 0.2 : 0, pointerEvents: 'none', transition: 'opacity 0.4s ease' }}
            onFirstFrame={() => setHeroReady(true)}
          />

          <div style={{ position: 'relative', zIndex: 2, opacity: heroReady ? 1 : 0, transition: 'opacity 0.4s ease' }}>

<h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 5rem)',
            fontWeight: 300,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            marginBottom: '28px',
            color: '#FFFFFF',
          }}>
            Billing infrastructure
            <br />
            <span style={{ color: '#7AF279' }}>
              for AI agents.
            </span>
          </h1>

          <p className="v2r-hero-subtitle" style={{
            fontSize: '18px',
            color: '#FFFFFF',
            lineHeight: 1.7,
            maxWidth: '540px',
            marginBottom: '56px',
            fontWeight: 400,
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

          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <a href="/auth/login" style={{
              display: 'inline-block',
              background: '#7AF279',
              color: '#1B1E1B',
              borderRadius: '8px',
              padding: '14px 28px',
              fontSize: '15px',
              fontWeight: 500,
              fontFamily: "'Geist Mono', monospace",
              cursor: 'pointer',
              textDecoration: 'none',
            }}>
              Get started free
            </a>
            <a href="/v2/docs" style={{
              display: 'inline-block',
              background: '#BC86FF',
              color: '#1B1E1B',
              borderRadius: '8px',
              padding: '14px 28px',
              fontSize: '15px',
              fontFamily: "'Geist Mono', monospace",
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'none',
            }}>
              Read docs →
            </a>
          </div>


          </div>{/* end zIndex wrapper */}
        </div>

        {/* ─── STEPS ─── */}
        <FadeIn blur={6} y={24}><MeteraStepsSection /></FadeIn>

        {/* ─── ONE LINE ─── */}
        <FadeIn blur={6} y={24}><MeteraOneLineSection /></FadeIn>

        {/* ─── HIGHLIGHTS ─── */}
        <FadeIn blur={6} y={24}><MeteraHighlightsSection /></FadeIn>

        {/* ─── MARKETPLACE ─── */}
        <FadeIn blur={6} y={24}><MeteraMarketplaceSection /></FadeIn>

        {/* ─── METERA CONTROL ─── */}
        <FadeIn blur={6} y={24}><MeteraControlSection /></FadeIn>

        {/* ─── DOCS CTA ─── */}
        <FadeIn blur={6} y={24}><MeteraDocsCTA /></FadeIn>

        {/* ─── CLIENTS ─── */}
        <FadeIn blur={6} y={24}><MeteraClientsSection /></FadeIn>

        {/* ─── FEATURES ─── */}
        <FadeIn blur={6} y={24}><MeteraFeaturesSection /></FadeIn>

        {/* ─── FAQ ─── */}
        <FadeIn blur={6} y={24}><MeteraFAQSection /></FadeIn>

{/* ─── FOOTER ─── */}
        <V2Footer />

      </div>
    </div>
  )
}

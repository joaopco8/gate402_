'use client'
import React, { useState, useId } from 'react'
import { motion, MotionConfigContext, LayoutGroup } from 'framer-motion'

const LINE   = '1px solid #2A2E2A'
const SANS   = "'Geist Mono', monospace"
const MONO   = "'Geist Mono', monospace"
const BG     = '#1B1E1B'
const FG     = '#E8F4EE'
const MUTED  = '#7A8C79'
const DIM    = '#4A5549'
const GREEN  = '#7AF279'
const PURPLE = '#BC86FF'

// ─── same transitions as original ─────────────────────────────────────────
const spring = {
  bounce: 0, delay: 0, duration: 0.4, type: 'spring' as const,
}
const tween = {
  delay: 0, duration: 0.4, ease: [0.44, 0, 0.56, 1] as [number, number, number, number], type: 'tween' as const,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Transition: React.FC<{ value: Record<string, any>; children: React.ReactNode }> = ({ value, children }) => {
  const config = React.useContext(MotionConfigContext)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ctx = React.useMemo(() => ({ ...config, transition: value }), [JSON.stringify(value)])
  return <MotionConfigContext.Provider value={ctx}>{children}</MotionConfigContext.Provider>
}

const transformTemplate = (_: unknown, t: string) => `translate(-50%, -50%) ${t}`

// ─── one horizontal slice of the cube (6 faces, exact copy of original) ───
function CubeSlice({ isHovered, accent }: { isHovered: boolean; accent: string }) {
  const border = `4px solid ${isHovered ? accent : FG}`
  const face = { border, backgroundColor: BG, overflow: 'hidden' as const }
  return (
    <Transition value={tween}>
      <motion.div style={{
        display: 'flex', flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', overflow: 'visible', position: 'relative',
        transformStyle: 'preserve-3d', width: 'min-content', height: 'min-content',
      }}>
        {/* Front */}
        <motion.div style={{ ...face, width: 240, height: 34, position: 'relative', zIndex: 120 }} />
        {/* Back */}
        <motion.div style={{ ...face, width: 240, position: 'absolute', top: 0, right: 0, bottom: 0, zIndex: 1, rotateY: 180 }} />
        {/* Right */}
        <motion.div style={{ ...face, width: 240, position: 'absolute', left: 120, top: 0, bottom: 0, zIndex: 1, rotateY: 90 }} />
        {/* Left */}
        <motion.div style={{ ...face, width: 240, position: 'absolute', right: 120, top: 0, bottom: 0, zIndex: 1, rotateY: -90 }} />
        {/* Top */}
        <motion.div style={{ ...face, height: 240, position: 'absolute', left: 0, right: 0, top: -120, zIndex: 1, rotateX: 90 }} />
        {/* Bottom */}
        <motion.div style={{ ...face, height: 240, position: 'absolute', left: 0, right: 0, top: -86, zIndex: 1, rotateX: 90 }} />
      </motion.div>
    </Transition>
  )
}

// ─── corner bracket — exact replication of original ───────────────────────
function Corner({
  top, bottom, left, right,
  bt, bb, bl, br,
  isHovered, accent,
}: {
  top?: string; bottom?: string; left?: string; right?: string
  bt?: boolean; bb?: boolean; bl?: boolean; br?: boolean
  isHovered: boolean; accent: string
}) {
  const color = isHovered ? accent : FG
  return (
    <motion.div
      animate={{ scale: isHovered ? 2.2 : 1 }}
      transition={spring}
      style={{
        position: 'absolute', width: 24, height: 24, overflow: 'hidden', zIndex: 2,
        top, bottom, left, right,
        borderTop:    bt ? `4px solid ${color}` : undefined,
        borderBottom: bb ? `4px solid ${color}` : undefined,
        borderLeft:   bl ? `4px solid ${color}` : undefined,
        borderRight:  br ? `4px solid ${color}` : undefined,
        transition: 'border-color 300ms ease',
      }}
    />
  )
}

// ─── single doc card ───────────────────────────────────────────────────────
interface CardProps {
  heading: string
  text: string
  accent?: string
  href?: string
}

function DocCard({ heading, text, accent = GREEN, href }: CardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const layoutId = useId()

  const titleTransition = {
    duration: 0.3,
    ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    type: 'tween' as const,
  }

  return (
    <LayoutGroup id={layoutId}>
      <Transition value={spring}>
        <motion.div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => href && (window.location.href = href)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            padding: 24,
            backgroundColor: BG,
            borderRadius: 12,
            cursor: href ? 'pointer' : 'default',
            position: 'relative',
            border: `1px solid ${isHovered ? `${accent}50` : '#2A2E2A'}`,
            boxShadow: isHovered ? `0 0 40px ${accent}0A` : 'none',
            transition: 'border-color 250ms ease, box-shadow 250ms ease',
            overflow: 'visible',
            width: '100%',
          }}
        >
          {/* ── Icon area (matches original 100x100 with internal 348px scale 0.3) */}
          <div style={{
            width: 96, height: 96,
            border: `1px solid ${isHovered ? `${accent}30` : '#2A2E2A'}`,
            borderRadius: 10,
            position: 'relative',
            overflow: 'visible',
            transition: 'border-color 300ms ease',
            flexShrink: 0,
          }}>
            {/* BG Container: 348x348, scale 0.3 → renders at ~104px */}
            <div style={{
              width: 348, height: 348,
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%) scale(0.275)',
              transformOrigin: 'center center',
              overflow: 'visible',
              zIndex: 2,
            }}>
              {/* Slice Cube — exact variant logic from original */}
              <motion.div
                animate={isHovered
                  ? { rotateX: -28, rotateY: -43, scale: 1.1, rotate: 49 }
                  : { rotateX: 23,  rotateY: 33,  scale: 0.7,  rotate: 49 }
                }
                transition={spring}
                transformTemplate={transformTemplate}
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 28, width: 'min-content', height: 'min-content',
                  position: 'absolute', left: '50%', top: '50%',
                  transformStyle: 'preserve-3d',
                  transformPerspective: 1200,
                  zIndex: 3,
                  overflow: 'visible',
                }}
              >
                <CubeSlice isHovered={isHovered} accent={accent} />
                <CubeSlice isHovered={isHovered} accent={accent} />
                <CubeSlice isHovered={isHovered} accent={accent} />
              </motion.div>

              {/* Corner brackets — exact positions from original */}
              <Corner
                top={isHovered ? '-6px' : '14px'} left={isHovered ? '-6px' : '14px'}
                bt bl isHovered={isHovered} accent={accent}
              />
              <Corner
                top={isHovered ? '330px' : '310px'} left={isHovered ? '-6px' : '14px'}
                bb bl isHovered={isHovered} accent={accent}
              />
              <Corner
                bottom={isHovered ? '-6px' : '14px'} right={isHovered ? '-6px' : '14px'}
                bb br isHovered={isHovered} accent={accent}
              />
              <Corner
                top={isHovered ? '-6px' : '14px'} right={isHovered ? '-6px' : '14px'}
                bt br isHovered={isHovered} accent={accent}
              />
            </div>
          </div>

          {/* ── Text content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

            {/* Heading with slide-fill — exact logic from original */}
            <div style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              height: 30,
              overflow: 'hidden',
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 17,
              color: FG,
              userSelect: 'none',
            }}>
              {/* base text */}
              <span style={{ position: 'relative', zIndex: 1, paddingRight: 2 }}>{heading}</span>

              {/* sliding fill background */}
              <motion.div
                animate={{ scaleX: isHovered ? 1 : 0 }}
                transition={titleTransition}
                style={{
                  position: 'absolute', inset: 0,
                  backgroundColor: accent,
                  transformOrigin: 'left center',
                  zIndex: 1,
                  borderRadius: 2,
                }}
              />

              {/* inverted text on top of fill */}
              <motion.span
                animate={{ clipPath: `inset(0 ${isHovered ? '0%' : '100%'} 0 0)` }}
                transition={titleTransition}
                style={{
                  position: 'absolute', top: 0, left: 0, bottom: 0,
                  display: 'flex', alignItems: 'center',
                  color: BG, zIndex: 2,
                  fontFamily: SANS, fontWeight: 600, fontSize: 17,
                  whiteSpace: 'nowrap', paddingRight: 2,
                }}
              >
                {heading}
              </motion.span>
            </div>

            {/* Description */}
            <p style={{
              fontFamily: SANS,
              fontSize: 13,
              color: MUTED,
              lineHeight: 1.6,
              margin: 0,
            }}>
              {text}
            </p>

            {/* Arrow */}
            <motion.span
              animate={{ x: isHovered ? 4 : 0, color: isHovered ? accent : DIM }}
              transition={{ duration: 0.18 }}
              style={{ fontFamily: MONO, fontSize: 12, display: 'inline-block' }}
            >
              Read docs →
            </motion.span>

          </div>
        </motion.div>
      </Transition>
    </LayoutGroup>
  )
}

// ─── Section ───────────────────────────────────────────────────────────────
export function MeteraDocsCTA() {
  const docs: CardProps[] = [
    {
      heading: 'Quickstart',
      text: 'Paste your API URL, set a price. First USDC hits your wallet in under 5 minutes.',
      accent: GREEN,
      href: '/v2/docs#api-register',
    },
    {
      heading: 'Agent skill',
      text: 'One line. Claude reads it. Your agent knows how to pay — no npm, no config, no crypto.',
      accent: GREEN,
      href: '/v2/docs#agent-connect',
    },
    {
      heading: 'Spending limits',
      text: 'Per call, per day, per month. Set the cap, the agent stops. You stay in control.',
      accent: PURPLE,
      href: '/v2/docs#agent-limits',
    },
  ]

  return (
    <div style={{ borderBottom: LINE }}>

      {/* headline */}
      <div className="v2r-docs-head" style={{ padding: '40px 56px', borderBottom: LINE }}>
        <h2 style={{
          fontSize: 'clamp(2rem, 3.5vw, 3rem)',
          fontWeight: 300,
          letterSpacing: '-0.02em',
          color: '#FFFFFF',
          margin: 0,
        }}>
          Everything an agent needs<br />
          <span style={{ color: '#7AF279' }}>to pay you.</span>
        </h2>
      </div>

      {/* 3-col cards grid */}
      <div className="v2r-docs-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        overflow: 'hidden',
      }}>
        {docs.map((doc, i) => (
          <div
            key={doc.heading}
            className={i < 2 ? 'v2r-docs-card-col' : undefined}
            style={{
              padding: '40px 32px',
              borderRight: i < 2 ? LINE : 'none',
              overflow: 'visible',
            }}
          >
            <DocCard {...doc} />
          </div>
        ))}
      </div>

    </div>
  )
}

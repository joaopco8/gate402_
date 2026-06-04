'use client'
import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LINE = '1px solid #2A2E2A'

type LineKind = 'normal' | 'added' | 'comment' | 'gap'

interface DiffLine {
  ln?: number | null
  text: string
  kind?: LineKind
}

interface DiffBlock {
  fileTag: string
  added: number
  lines: DiffLine[]
}

interface TabItem {
  title: string
  desc: string
  diff: DiffBlock
}

const items: TabItem[] = [
  {
    title: 'Agent pays automatically',
    desc: 'No credit card. No human. Agent signs and settles in USDC.',
    diff: {
      fileTag: 'agent.ts',
      added: 5,
      lines: [
        { ln: null, text: '', kind: 'gap' },
        { ln: 1,    text: "import { MeteraClient } from 'metera'", kind: 'normal' },
        { ln: 2,    text: '', kind: 'gap' },
        { ln: 3,    text: "const res = await fetch('/api/data')", kind: 'normal' },
        { ln: 4,    text: '// → 402 Payment Required', kind: 'comment' },
        { ln: 5,    text: 'const price = res.headers.get(\'x-price\')', kind: 'added' },
        { ln: 6,    text: 'const sig   = await wallet.sign(price)', kind: 'added' },
        { ln: 7,    text: "const paid  = await fetch('/api/data', {", kind: 'added' },
        { ln: 8,    text: "  headers: { 'x-payment': sig },", kind: 'added' },
        { ln: 9,    text: '})', kind: 'added' },
        { ln: 10,   text: '// → 200 OK  •  ~400ms', kind: 'comment' },
        { ln: null, text: '', kind: 'gap' },
      ],
    },
  },
  {
    title: 'Revenue hits instantly',
    desc: 'Every call settles on-chain. No invoices, no net-30.',
    diff: {
      fileTag: 'wallet.balance',
      added: 3,
      lines: [
        { ln: null, text: '', kind: 'gap' },
        { ln: null, text: 'USDC · SOLANA · MAINNET', kind: 'comment' },
        { ln: null, text: '', kind: 'gap' },
        { ln: null, text: '$1,247.83  ↑', kind: 'added' },
        { ln: null, text: '', kind: 'gap' },
        { ln: null, text: '14:32:01   7xKp…3mNq   +$0.001', kind: 'added' },
        { ln: null, text: '14:32:00   9bRt…8vLw   +$0.001', kind: 'added' },
        { ln: null, text: '14:31:59   2mNk…4pXc   +$0.001', kind: 'added' },
        { ln: null, text: '', kind: 'gap' },
        { ln: null, text: '4,219 calls today  ·  $0.001 / call', kind: 'comment' },
        { ln: null, text: '', kind: 'gap' },
      ],
    },
  },
  {
    title: 'Three lines of config',
    desc: 'Drop Metera into any Express or Next.js app. That is it.',
    diff: {
      fileTag: 'server.ts',
      added: 5,
      lines: [
        { ln: null, text: '', kind: 'gap' },
        { ln: 1,    text: "import metera from 'metera'", kind: 'added' },
        { ln: 2,    text: '', kind: 'gap' },
        { ln: 3,    text: 'app.use(metera({', kind: 'added' },
        { ln: 4,    text: "  apiKey:    process.env.METERA_KEY,", kind: 'added' },
        { ln: 5,    text: "  endpoints: { '/api/data': 0.001 },", kind: 'added' },
        { ln: 6,    text: '}))', kind: 'added' },
        { ln: 7,    text: '', kind: 'gap' },
        { ln: 8,    text: '// agents pay you in USDC. done.', kind: 'comment' },
        { ln: null, text: '', kind: 'gap' },
      ],
    },
  },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
}

const lineVariants = {
  hidden: { opacity: 0, y: 4 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.18, ease: 'easeOut' as const } },
}

function CodePanel({ diff }: { diff: DiffBlock }) {
  const lineStyle = useMemo<Record<LineKind, React.CSSProperties>>(() => ({
    normal:  { color: '#E8F4EE' },
    added:   { color: '#E8F4EE', background: '#7AF27914' },
    comment: { color: '#4A5549', fontStyle: 'italic' },
    gap:     { height: 8, opacity: 0, pointerEvents: 'none', userSelect: 'none' },
  }), [])

  return (
    <div style={{
      background: '#141614',
      border: '1px solid #2A2E2A',
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: 'none',
    }}>
      {/* titlebar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '10px 16px',
        borderBottom: '1px solid #2A2E2A',
        background: '#181B18',
      }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
        <span style={{
          marginLeft: 10,
          fontSize: 11,
          color: '#7A8C79',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {diff.fileTag}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{
            width: 6, height: 6,
            borderRadius: '50%',
            background: '#7AF279',
            display: 'inline-block',
          }} />
          <span style={{
            fontSize: 10,
            color: '#7AF279',
            fontFamily: "'JetBrains Mono', monospace",
          }}>+{diff.added}</span>
        </div>
      </div>

      {/* diff body */}
      <motion.div
        key={diff.fileTag}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{
          display: 'grid',
          gridTemplateColumns: '36px 1fr',
          padding: '12px 0',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 13,
          lineHeight: 1.9,
        }}
      >
        {diff.lines.map((l, i) => (
          <React.Fragment key={i}>
            <motion.div
              variants={lineVariants}
              style={{
                paddingRight: 12,
                textAlign: 'right',
                color: '#2E3530',
                userSelect: 'none',
                fontSize: 11,
                ...(l.kind === 'gap' ? { height: 8, opacity: 0 } : {}),
              }}
            >
              {l.ln ?? ''}
            </motion.div>
            <motion.div
              variants={lineVariants}
              style={{
                paddingLeft: 16,
                paddingRight: 24,
                whiteSpace: 'pre',
                ...(l.kind ? lineStyle[l.kind] : { color: '#E8F4EE' }),
              }}
            >
              {l.text}
            </motion.div>
          </React.Fragment>
        ))}
      </motion.div>

      {/* footer hint */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid #2A2E2A',
        padding: '10px 16px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        color: '#3A4039',
      }}>
        <span>metera.dev/docs</span>
        <span style={{ color: '#4A5549' }}>npm install metera</span>
      </div>
    </div>
  )
}

export function MeteraControlSection() {
  const [active, setActive] = useState(0)

  const onKey = useCallback((e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(items.length - 1, i + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => Math.max(0, i - 1)) }
  }, [])

  return (
    <div style={{ borderBottom: LINE }}>

      {/* headline row */}
      <div style={{ padding: '48px 56px', borderBottom: LINE }}>
        <h2 style={{
          fontSize: 'clamp(2rem, 4vw, 3.5rem)',
          fontWeight: 300,
          letterSpacing: '-0.03em',
          color: '#FFFFFF',
          margin: 0,
        }}>
          Your API. Finally making money.
        </h2>
      </div>

      {/* two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr' }}>

        {/* left — tab list */}
        <div style={{ padding: '56px 48px', borderRight: LINE }}>
          <ul
            role="tablist"
            aria-label="Metera features"
            onKeyDown={onKey}
            style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, margin: 0, padding: 0 }}
          >
            {items.map((item, i) => {
              const isActive = i === active
              return (
                <li key={item.title} role="presentation" style={{ position: 'relative' }}>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBg"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: '#7AF27910',
                        border: '1px solid #2A2E2A',
                        borderRadius: 10,
                        zIndex: 0,
                      }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }}
                    />
                  )}
                  <button
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActive(i)}
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      width: '100%',
                      background: 'transparent',
                      border: isActive ? '1px solid transparent' : LINE,
                      borderRadius: 10,
                      padding: '18px 22px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <div style={{
                      fontSize: 15,
                      fontWeight: isActive ? 400 : 400,
                      color: isActive ? '#FFFFFF' : '#7A8C79',
                      marginBottom: 5,
                      letterSpacing: '-0.01em',
                      transition: 'color 200ms ease',
                    }}>
                      {item.title}
                    </div>
                    <div style={{
                      fontSize: 13,
                      color: isActive ? '#7A8C79' : '#4A5549',
                      lineHeight: 1.55,
                      transition: 'color 200ms ease',
                    }}>
                      {item.desc}
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* right — code panel */}
        <div style={{ padding: '56px 48px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <CodePanel diff={items[active].diff} />
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}

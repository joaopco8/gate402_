'use client'
import { useState, useEffect } from 'react'
import { V2Navbar } from '../../components/v2/v2-navbar'
import { V2Footer } from '../../components/v2/v2-footer'

type NavItem = { label: string; id: string }
type NavGroup = { group: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    group: 'Getting started',
    items: [
      { label: 'Introduction',    id: 'introduction' },
      { label: 'What is Metera?', id: 'what-is-metera' },
      { label: 'How it works',    id: 'how-it-works' },
    ],
  },
  {
    group: 'For API owners',
    items: [
      { label: 'Register your API', id: 'api-register' },
      { label: 'How agents pay',    id: 'api-how-pay' },
      { label: 'Pricing',           id: 'api-pricing' },
    ],
  },
  {
    group: 'For AI agents',
    items: [
      { label: 'Create a wallet',  id: 'agent-wallet' },
      { label: 'Deposit USDC',     id: 'agent-deposit' },
      { label: 'Connect to agent', id: 'agent-connect' },
      { label: 'Spending limits',  id: 'agent-limits' },
    ],
  },
  {
    group: 'Marketplace',
    items: [
      { label: 'Discover APIs', id: 'marketplace-discover' },
      { label: 'List your API', id: 'marketplace-list' },
    ],
  },
  {
    group: 'The x402 Protocol',
    items: [
      { label: 'What is x402?', id: 'x402-what' },
      { label: 'Payment flow',  id: 'x402-flow' },
      { label: 'Security',      id: 'x402-security' },
    ],
  },
  {
    group: 'FAQ',
    items: [{ label: 'FAQ', id: 'faq' }],
  },
]

const ALL_IDS = NAV_GROUPS.flatMap(g => g.items.map(i => i.id))

const T = {
  bg:            '#1B1E1B',
  card:          '#1F221F',
  border:        '#2A2E2A',
  textPrimary:   '#E8F4EE',
  textSecondary: '#7A8C79',
  textMuted:     '#4A5549',
  green:         '#7AF279',
  greenBg:       'rgba(122,242,121,0.06)',
  purple:        '#BC86FF',
  blue:          '#60a5fa',
  font:          "'Inter', sans-serif",
  mono:          "'Geist Mono', monospace",
  sideW:         220,
  navH:          64,
}

function DocsNav({ activeId, scrollTo, navOpen }: { activeId: string; scrollTo: (id: string) => void; navOpen?: boolean }) {
  return (
    <aside
      className={`docs-sidebar-aside${navOpen ? ' docs-sidebar-mob-open' : ''}`}
      style={{ width: T.sideW, flexShrink: 0, borderRight: `1px solid ${T.border}`, position: 'sticky', top: T.navH, height: `calc(100vh - ${T.navH}px)`, overflowY: 'auto', paddingBottom: 32 }}
    >
      <div style={{ padding: '24px 12px 8px' }}>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.textMuted, letterSpacing: '0.10em', textTransform: 'uppercase' }}>Documentation</span>
      </div>
      <nav style={{ padding: '4px 0' }}>
        {NAV_GROUPS.map(group => (
          <div key={group.group} style={{ marginBottom: 4 }}>
            <div style={{ padding: '6px 14px', fontFamily: T.font, fontSize: 11, fontWeight: 600, color: T.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{group.group}</div>
            {group.items.map(item => {
              const active = activeId === item.id
              return (
                <button key={item.id} onClick={() => scrollTo(item.id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '5px 14px 5px 18px', fontFamily: T.font, fontSize: 13, color: active ? T.green : T.textSecondary, background: active ? T.greenBg : 'transparent', border: 'none', borderLeft: `2px solid ${active ? T.green : 'transparent'}`, cursor: 'pointer', transition: 'all 0.12s', borderRadius: '0 6px 6px 0', marginRight: 8 }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = T.textPrimary; e.currentTarget.style.background = 'rgba(122,242,121,0.03)' } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = T.textSecondary; e.currentTarget.style.background = 'transparent' } }}
                >{item.label}</button>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div style={{ background: '#111311', border: `1px solid ${T.border}`, borderRadius: 6, overflow: 'hidden', margin: '14px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 14px', borderBottom: `1px solid ${T.border}`, background: T.card }}>
        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.textMuted }}>{lang}</span>
        <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          style={{ background: 'none', border: 'none', fontFamily: T.font, fontSize: 12, color: copied ? T.green : T.textMuted, cursor: 'pointer', transition: 'color 0.15s' }}>
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '16px', fontFamily: T.mono, fontSize: 12, lineHeight: 1.7, overflowX: 'auto', color: '#C8DCC8' }}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

function Callout({ type = 'info', children }: { type?: 'info' | 'warning' | 'danger' | 'success'; children: React.ReactNode }) {
  const colors = {
    info:    { border: T.blue,    bg: 'rgba(96,165,250,0.06)',  icon: 'ℹ' },
    warning: { border: '#f59e0b', bg: 'rgba(245,158,11,0.06)', icon: '⚠' },
    danger:  { border: '#ef4444', bg: 'rgba(239,68,68,0.06)',  icon: '✕' },
    success: { border: T.green,   bg: T.greenBg,               icon: '✓' },
  }
  const c = colors[type]
  return (
    <div style={{ borderLeft: `3px solid ${c.border}`, background: c.bg, borderRadius: '0 6px 6px 0', padding: '12px 16px', margin: '14px 0', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ color: c.border, fontSize: 13, flexShrink: 0, marginTop: 1 }}>{c.icon}</span>
      <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6, fontFamily: T.font }}>{children}</div>
    </div>
  )
}

function Terminal({ title = 'bash', lines }: { title?: string; lines: Array<{ type: 'command' | 'output' | 'comment' | 'success' | 'error' | 'blank'; text: string }> }) {
  const lineStyles: Record<string, React.CSSProperties> = {
    command: { color: T.textPrimary, fontSize: 12, lineHeight: '22px' },
    output:  { color: T.textMuted,   fontSize: 12, lineHeight: '22px', paddingLeft: 16 },
    comment: { color: '#2A2E2A',     fontSize: 11, lineHeight: '22px', fontStyle: 'italic' },
    success: { color: T.green,       fontSize: 12, lineHeight: '22px' },
    error:   { color: '#ef4444',     fontSize: 12, lineHeight: '22px' },
    blank:   { height: 8 },
  }
  const prefix: Record<string, string> = { command: '$ ', output: '', comment: '# ', success: '✓ ', error: '✗ ', blank: '' }
  return (
    <div style={{ background: '#111311', border: `1px solid ${T.border}`, borderRadius: 6, overflow: 'hidden', margin: '16px 0', fontFamily: T.mono }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderBottom: `1px solid ${T.border}`, background: T.card }}>
        {['#ef4444', '#f59e0b', T.green].map((c, i) => <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: T.textMuted, letterSpacing: '0.05em' }}>{title}</span>
      </div>
      <div style={{ padding: '14px 18px' }}>
        {lines.map((line, i) => (
          <div key={i} style={lineStyles[line.type]}>
            {line.type !== 'blank' && <span style={{ color: line.type === 'command' ? T.green : 'inherit' }}>{prefix[line.type]}</span>}
            {line.text}
          </div>
        ))}
      </div>
    </div>
  )
}

function StepList({ steps }: { steps: Array<{ title: string; description: string | React.ReactNode }> }) {
  return (
    <div style={{ margin: '16px 0' }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'flex-start' }}>
          <div style={{ width: 26, height: 26, flexShrink: 0, border: `1px solid ${T.border}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.mono, fontSize: 11, color: T.green, background: '#111311' }}>
            {String(i + 1).padStart(2, '0')}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: T.textPrimary, marginBottom: 5, fontFamily: T.font }}>{step.title}</div>
            <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.7, fontFamily: T.font }}>{step.description}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

const H2 = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <h2 id={id} style={{ fontFamily: T.font, fontWeight: 600, fontSize: 20, color: T.textPrimary, borderBottom: `1px solid ${T.border}`, paddingBottom: 10, marginTop: 56, marginBottom: 18, scrollMarginTop: T.navH + 16, lineHeight: 1.2 }}>{children}</h2>
)
const H3 = ({ id, children }: { id?: string; children: React.ReactNode }) => (
  <h3 id={id} style={{ fontFamily: T.font, fontWeight: 600, fontSize: 14, color: T.textPrimary, marginTop: 24, marginBottom: 6, scrollMarginTop: T.navH + 16 }}>{children}</h3>
)
const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ color: T.textSecondary, fontSize: 13, lineHeight: 1.8, marginBottom: 10, fontFamily: T.font }}>{children}</p>
)

export default function DocsPublicPage() {
  const [activeId, setActiveId] = useState('introduction')
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => { for (const e of entries) { if (e.isIntersecting) setActiveId(e.target.id) } },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 },
    )
    ALL_IDS.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.textPrimary }}>
      <V2Navbar />

      <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto', borderLeft: `1px solid ${T.border}`, borderRight: `1px solid ${T.border}`, minHeight: `calc(100vh - ${T.navH}px)` }}>
        <DocsNav activeId={activeId} scrollTo={(id) => { scrollTo(id); setNavOpen(false) }} navOpen={navOpen} />

        {navOpen && (
          <div onClick={() => setNavOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} />
        )}

        <main style={{ flex: 1, minWidth: 0 }}>
          <button
            className="docs-mob-nav-btn"
            onClick={() => setNavOpen(o => !o)}
            style={{
              position: 'sticky', top: 0, zIndex: 10,
              width: '100%', padding: '10px 16px',
              background: T.bg, borderBottom: `1px solid ${T.border}`,
              border: 'none', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: T.border,
              cursor: 'pointer', color: T.textSecondary, fontSize: 13, fontFamily: T.font,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="1" y1="3" x2="13" y2="3"/><line x1="1" y1="7" x2="13" y2="7"/><line x1="1" y1="11" x2="13" y2="11"/></svg>
            Navigation
          </button>
          <div style={{ maxWidth: 800, padding: '40px clamp(24px, 4vw, 56px) 80px', margin: '0 auto' }}>

            <section id="introduction">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {[
                  { label: 'v1.0',   color: T.textMuted, border: T.border,                      bg: T.card },
                  { label: 'MIT',    color: T.textMuted, border: T.border,                      bg: T.card },
                  { label: 'Solana', color: T.purple,    border: 'rgba(188,134,255,0.3)',        bg: 'rgba(188,134,255,0.06)' },
                  { label: 'x402',   color: T.blue,      border: 'rgba(96,165,250,0.3)',         bg: 'rgba(96,165,250,0.06)' },
                ].map(b => (
                  <span key={b.label} style={{ fontFamily: T.mono, fontSize: 11, background: b.bg, border: `1px solid ${b.border}`, color: b.color, borderRadius: 4, padding: '2px 7px' }}>{b.label}</span>
                ))}
              </div>
              <h1 style={{ fontFamily: T.font, fontWeight: 600, fontSize: 28, color: T.textPrimary, marginBottom: 8, lineHeight: 1.15, letterSpacing: '-0.3px' }}>Documentation</h1>
              <P>Everything you need to monetize your API or connect your AI agent to paid services.</P>
              <div className="resp-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '24px 0' }}>
                {[
                  { label: 'For API owners', desc: 'Register your API URL and set a price. Metera generates a public endpoint — agents pay automatically in USDC.', href: '#api-register', color: T.green },
                  { label: 'For AI agents',  desc: 'Create a wallet, deposit USDC via Pix or card, and connect to your agent with one line of code.',             href: '#agent-wallet', color: T.purple },
                ].map(card => (
                  <a key={card.label} href={card.href} style={{ textDecoration: 'none', border: `1px solid ${T.border}`, borderRadius: 6, padding: 16, background: T.card, display: 'block', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = card.color)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: card.color, marginBottom: 6, fontFamily: T.font }}>{card.label}</div>
                    <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.6, fontFamily: T.font }}>{card.desc}</div>
                  </a>
                ))}
              </div>
              <Callout type="success">Metera is MIT licensed. The npm packages are free forever. The hosted platform at metera.dev is the commercial offering.</Callout>
            </section>

            <H2 id="what-is-metera">What is Metera?</H2>
            <P>Metera is the economic layer for AI agents.</P>
            <P>If you have an API, Metera lets AI agents pay you automatically in USDC on Solana.</P>
            <P>If you have an AI agent, Metera gives it a wallet, spending limits, and access to hundreds of paid APIs — with one line of code.</P>
            <Callout type="info">No banks. No credit cards. No humans in the loop.</Callout>

            <H2 id="how-it-works">How it works</H2>
            <div className="resp-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '16px 0' }}>
              <div style={{ border: `1px solid ${T.border}`, borderRadius: 6, padding: 16, background: T.card }}>
                <div style={{ fontSize: 10, color: T.green, fontFamily: T.mono, letterSpacing: '0.10em', marginBottom: 14, textTransform: 'uppercase' as const }}>For API owners</div>
                <StepList steps={[
                  { title: 'Register your API',        description: <><span style={{ fontFamily: T.mono, fontSize: 11, color: T.textMuted }}>metera.dev/proxy</span><br />Paste your URL · Set a price</> },
                  { title: 'Get your public endpoint', description: <code style={{ fontFamily: T.mono, fontSize: 11, color: T.green }}>api.metera.dev/p/your-api</code> },
                  { title: 'Agents call your API',     description: 'Metera charges automatically. USDC lands in your wallet.' },
                ]} />
              </div>
              <div style={{ border: `1px solid ${T.border}`, borderRadius: 6, padding: 16, background: T.card }}>
                <div style={{ fontSize: 10, color: T.purple, fontFamily: T.mono, letterSpacing: '0.10em', marginBottom: 14, textTransform: 'uppercase' as const }}>For AI agents</div>
                <StepList steps={[
                  { title: 'Create an agent wallet',        description: <><span style={{ fontFamily: T.mono, fontSize: 11, color: T.textMuted }}>metera.dev/agents</span><br />Wallet created automatically · Deposit via Pix or card</> },
                  { title: 'Connect to your agent',         description: <>Paste one line in Claude Code or Cursor:<br /><code style={{ fontFamily: T.mono, fontSize: 11, color: T.green }}>Read metera.dev/skill/your-key</code></> },
                  { title: 'Your agent pays automatically', description: 'Detects x402, pays in USDC, retries — zero extra code.' },
                ]} />
              </div>
            </div>

            <H2 id="api-register">Register your API</H2>
            <P>No code required. Go to metera.dev/proxy, paste your API URL and set a price. Metera generates a public endpoint instantly.</P>
            <Terminal title="example" lines={[
              { type: 'comment', text: 'Your API URL:' },
              { type: 'output',  text: 'https://your-api.com/weather' },
              { type: 'blank',   text: '' },
              { type: 'comment', text: 'Metera endpoint:' },
              { type: 'success', text: 'https://api.metera.dev/p/weather-api' },
            ]} />

            <H2 id="api-how-pay">How agents pay</H2>
            <P>When an agent calls your endpoint without payment, Metera returns HTTP 402 with payment instructions. The agent pays in USDC on Solana in ~400ms. Metera verifies the payment on-chain and proxies the request to your original API.</P>
            <Callout type="success">You receive 100% of the payment directly in your Solana wallet. No custody. No intermediary.</Callout>

            <H2 id="api-pricing">Pricing</H2>
            <div style={{ border: `1px solid ${T.border}`, borderRadius: 6, overflow: 'hidden', margin: '14px 0' }}>
              {[
                { plan: 'Free',       desc: 'Up to 3 endpoints · 0% fee',               color: T.textSecondary },
                { plan: 'Pro',        desc: 'Unlimited endpoints · $99/month · 0% fee', color: T.green },
                { plan: 'Enterprise', desc: '0.5% of volume · white-label · SLA',        color: T.purple },
              ].map((row, i) => (
                <div key={row.plan} style={{ display: 'flex', gap: 16, padding: '12px 16px', borderBottom: i < 2 ? `1px solid ${T.border}` : 'none', background: i % 2 === 0 ? '#111311' : T.card, alignItems: 'center' }}>
                  <span style={{ fontFamily: T.mono, fontSize: 12, color: row.color, minWidth: 80 }}>{row.plan}</span>
                  <span style={{ fontSize: 12, color: T.textMuted, fontFamily: T.font }}>{row.desc}</span>
                </div>
              ))}
            </div>

            <H2 id="agent-wallet">Create an agent wallet</H2>
            <StepList steps={[
              { title: 'Go to metera.dev/agents', description: 'Sign in with GitHub.' },
              { title: 'Click "Create agent wallet"', description: 'A Solana wallet is created automatically. No seed phrase. No private key setup. No crypto knowledge needed.' },
            ]} />

            <H2 id="agent-deposit">Deposit USDC</H2>
            <StepList steps={[
              { title: 'Click "Deposit" on your agent wallet', description: 'Pay with Pix or credit card via MoonPay.' },
              { title: 'USDC arrives in your wallet in minutes', description: 'No crypto knowledge required.' },
            ]} />

            <H2 id="agent-connect">Connect to your AI agent</H2>
            <P>Copy your skill URL from the dashboard and paste it in Claude Code, Cursor, or any MCP-compatible client:</P>
            <CodeBlock lang="bash" code={`Read https://metera.dev/skill/your-agent-key and follow the instructions`} />
            <P>Your agent now knows:</P>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '8px 0 14px', paddingLeft: 8 }}>
              {['Which wallet to use', 'How to pay for APIs automatically', 'What your spending limits are', 'Which APIs are available in the marketplace'].map(item => (
                <div key={item} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: T.green, fontFamily: T.mono, fontSize: 12 }}>→</span>
                  <span style={{ color: T.textSecondary, fontSize: 13, fontFamily: T.font }}>{item}</span>
                </div>
              ))}
            </div>

            <H2 id="agent-limits">Spending limits</H2>
            <P>Protect your agent from unexpected costs. Set limits per call, per hour, per day or per month. If a limit is reached, the agent stops and you are notified.</P>
            <div style={{ border: `1px solid ${T.border}`, borderRadius: 6, overflow: 'hidden', margin: '14px 0' }}>
              {[
                { label: 'Max per call',  value: '$0.01',  desc: 'Never pay more than this per request' },
                { label: 'Max per day',   value: '$1.00',  desc: 'Daily budget cap' },
                { label: 'Max per month', value: '$10.00', desc: 'Monthly budget cap' },
              ].map((row, i) => (
                <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '130px 70px 1fr', padding: '10px 16px', borderBottom: i < 2 ? `1px solid ${T.border}` : 'none', background: i % 2 === 0 ? '#111311' : T.card, gap: 12, alignItems: 'center' }}>
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: T.textMuted }}>{row.label}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 12, color: T.green }}>{row.value}</span>
                  <span style={{ fontSize: 12, color: T.textMuted, fontFamily: T.font }}>{row.desc}</span>
                </div>
              ))}
            </div>

            <H2 id="marketplace-discover">Discover paid APIs</H2>
            <P>The Metera Marketplace lists all APIs available for AI agents to consume. Browse by category: data, AI, media, finance. Each API shows price, uptime, latency and total calls.</P>
            <Callout type="info">
              Browse the marketplace at <a href="/marketplace" style={{ color: T.green, textDecoration: 'none' }}>metera.dev/marketplace</a>
            </Callout>

            <H2 id="marketplace-list">List your API</H2>
            <P>Any API registered as a hosted endpoint appears automatically in the marketplace when marked as public. Agents discover your API via:</P>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '8px 0 14px', paddingLeft: 8 }}>
              {['The marketplace page', 'Their skill.md (updated automatically)', 'GET api.metera.dev/api/marketplace'].map(item => (
                <div key={item} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: T.green, fontFamily: T.mono, fontSize: 12 }}>→</span>
                  <span style={{ color: T.textSecondary, fontSize: 13, fontFamily: T.font }}>{item}</span>
                </div>
              ))}
            </div>

            <H2 id="x402-what">What is x402?</H2>
            <P>x402 is an open HTTP standard for machine-to-machine payments. When a server returns HTTP 402, it means: "This resource costs money. Here is how to pay."</P>
            <Callout type="info">The x402 Foundation — backed by Google, Microsoft, Stripe, Coinbase and Cloudflare — defines the standard. Metera is the implementation.</Callout>

            <H2 id="x402-flow">How the payment flow works</H2>
            <Terminal title="payment flow" lines={[
              { type: 'command', text: 'Agent calls API' },
              { type: 'output',  text: '→ API returns HTTP 402 with payment details' },
              { type: 'output',  text: '→ Agent signs a USDC transaction on Solana' },
              { type: 'output',  text: '→ Sends payment proof in the next request header' },
              { type: 'output',  text: '→ API verifies payment on-chain' },
              { type: 'success', text: '→ Returns the response' },
              { type: 'blank',   text: '' },
              { type: 'comment', text: 'This happens in ~400ms. No human involved. No checkout. No invoice.' },
            ]} />

            <H2 id="x402-security">Security</H2>
            <H3>Anti-replay protection</H3>
            <P>Every transaction hash can only be used once. Replay attacks are blocked at the network level.</P>
            <H3>On-chain verification</H3>
            <P>Every payment is verified on the Solana blockchain before any data is returned.</P>
            <H3>Spending limits</H3>
            <P>Hard caps enforced server-side. No agent can exceed the limits you set.</P>
            <H3>Non-custodial</H3>
            <P>Metera never holds your funds. Payments go directly wallet-to-wallet on-chain.</P>

            <H2 id="faq">FAQ</H2>
            {[
              { q: 'Do I need to know crypto to use Metera?',  a: 'No. Everything works with Pix, credit card and a GitHub login.' },
              { q: 'What currency does Metera use?',            a: 'USDC on Solana. It is a stablecoin pegged to the US dollar. $1 USDC = $1 USD, always.' },
              { q: 'How fast are payments?',                    a: '~400ms. Solana settles transactions in under a second.' },
              { q: 'What if my API goes down?',                 a: 'If your API does not respond, the payment is not charged. Agents only pay for successful responses.' },
              { q: 'Can I use Metera with any AI agent?',       a: 'Yes. Any agent that supports MCP or can read a URL works with Metera — Claude, GPT, Cursor and others.' },
              { q: 'Is Metera open source?',                    a: 'Yes. MIT licensed. github.com/metera-dev' },
            ].map(item => (
              <div key={item.q} style={{ borderBottom: `1px solid ${T.border}`, padding: '14px 0' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, marginBottom: 6, fontFamily: T.font }}>{item.q}</div>
                <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.7, fontFamily: T.font }}>{item.a}</div>
              </div>
            ))}

            <div className="resp-grid-2" style={{ marginTop: 56, padding: 24, border: `1px solid ${T.border}`, borderRadius: 8, background: T.card, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.mono, letterSpacing: '0.10em', marginBottom: 10, textTransform: 'uppercase' as const }}>For API owners</div>
                <a href="/proxy" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: T.green, color: '#1B1E1B', borderRadius: 6, textDecoration: 'none', fontSize: 13, fontWeight: 600, fontFamily: T.font }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >Register your API →</a>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 6, fontFamily: T.mono }}>metera.dev/proxy</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.mono, letterSpacing: '0.10em', marginBottom: 10, textTransform: 'uppercase' as const }}>For AI agents</div>
                <a href="/agents" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: T.purple, color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: 13, fontWeight: 600, fontFamily: T.font }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >Create agent wallet →</a>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 6, fontFamily: T.mono }}>metera.dev/agents</div>
              </div>
            </div>

            <div style={{ height: 64 }} />
          </div>
          </div>
        </main>
      </div>

      <V2Footer />
    </div>
  )
}

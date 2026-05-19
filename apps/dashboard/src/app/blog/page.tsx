'use client'

import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { Component as FlickeringFooter } from '@/components/ui/flickering-footer'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-space',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #000;
    color: #fff;
    -webkit-font-smoothing: antialiased;
  }

  a { color: inherit; text-decoration: none; }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes gradientShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes pulseSlow {
    0%, 100% { opacity: 0.4; }
    50%       { opacity: 1; }
  }

  .gradient-text {
    background: linear-gradient(135deg, #00bc7d, #9945FF, #00bc7d, #9945FF);
    background-size: 300% 300%;
    animation: gradientShift 3s ease infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .live-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #00bc7d;
    display: inline-block;
    animation: pulseSlow 2s ease-in-out infinite;
    flex-shrink: 0;
  }

  .post-card {
    display: block;
    background: #000;
    border-right: 1px solid #1a1a1a;
    transition: background 200ms ease;
    cursor: pointer;
  }
  .post-card:hover { background: #111111; }
  .post-card:last-child { border-right: none; }

  html, body { overflow-x: hidden; }

  @media (max-width: 768px) {
    .nav-links { display: none !important; }
    .blog-hero-title { font-size: 40px !important; }
    .featured-grid { grid-template-columns: 1fr !important; }
    .posts-grid { grid-template-columns: 1fr !important; }
    .posts-grid .post-card { border-right: none !important; border-bottom: 1px solid #1a1a1a; }
    .posts-grid .post-card:last-child { border-bottom: none; }
  }
`

const FONT = 'var(--font-space, sans-serif)'
const MONO = 'var(--font-mono, monospace)'

function Nav() {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 clamp(20px, 10vw, 250px)',
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #1a1a1a',
    }}>
      <a href="/">
        <img src="/logo-gate.png" alt="Gate402" style={{ height: 22, width: 'auto', display: 'block' }} />
      </a>

      <div className="nav-links" style={{
        position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 32, alignItems: 'center',
      }}>
        {[
          { label: 'How it works', href: '/#how-it-works' },
          { label: 'Docs',         href: '/docs' },
          { label: 'Pricing',      href: '/pricing' },
          { label: 'GitHub',       href: 'https://github.com/joaopco8/gate402_', target: '_blank' },
        ].map(({ label, href, target }) => (
          <a key={label} href={href} target={target}
            rel={target === '_blank' ? 'noopener noreferrer' : undefined}
            style={{ fontSize: 14, color: '#666', fontFamily: FONT, transition: 'color 150ms' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#666')}
          >{label}</a>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <a href="/auth/login" style={{ fontSize: 14, color: '#666', fontFamily: FONT }}>Sign in</a>
        <a href="/auth/login" style={{
          fontSize: 14, fontFamily: FONT, fontWeight: 500,
          color: '#000', background: '#00bc7d', padding: '8px 18px', borderRadius: 6,
        }}>Start free →</a>
      </div>
    </nav>
  )
}

type Post = {
  slug: string
  tag: string
  tagColor: string
  tagBg: string
  tagBorder: string
  date: string
  title: string
  excerpt: string
  readTime: string
  featured?: boolean
}

const POSTS: Post[] = [
  {
    slug: 'introducing-gate402',
    tag: 'Announcement',
    tagColor: '#00bc7d',
    tagBg: 'rgba(0,188,125,0.06)',
    tagBorder: 'rgba(0,188,125,0.25)',
    date: 'May 14, 2025',
    title: 'Introducing Gate402: charge for any API endpoint with one line of code',
    excerpt: 'Today we\'re opening early access to Gate402 — a developer platform that lets you monetize HTTP endpoints with per-call USDC payments, powered by the x402 protocol.',
    readTime: '5 min read',
    featured: true,
  },
  {
    slug: 'x402-protocol-explained',
    tag: 'Technical',
    tagColor: '#9945FF',
    tagBg: 'rgba(153,69,255,0.06)',
    tagBorder: 'rgba(153,69,255,0.25)',
    date: 'May 10, 2025',
    title: 'x402: the HTTP payment extension and how it works',
    excerpt: 'HTTP 402 "Payment Required" has been reserved since 1991 but never formally defined. The x402 standard finally gives it a machine-readable shape — here\'s how it works.',
    readTime: '8 min read',
  },
  {
    slug: 'ai-agents-need-wallets',
    tag: 'Product',
    tagColor: '#00bc7d',
    tagBg: 'rgba(0,188,125,0.06)',
    tagBorder: 'rgba(0,188,125,0.25)',
    date: 'May 6, 2025',
    title: 'Why every AI agent needs a wallet',
    excerpt: 'As LLM agents become capable of taking actions on the web, they need to pay for the resources they consume. Crypto micropayments are the only practical solution at machine speed.',
    readTime: '6 min read',
  },
  {
    slug: 'usdc-vs-stripe',
    tag: 'Technical',
    tagColor: '#9945FF',
    tagBg: 'rgba(153,69,255,0.06)',
    tagBorder: 'rgba(153,69,255,0.25)',
    date: 'Apr 29, 2025',
    title: 'USDC payments vs Stripe for API monetization',
    excerpt: 'Stripe is great for SaaS. For per-call API payments with no minimum invoice, instant settlement, and global reach — stablecoins win on every dimension.',
    readTime: '7 min read',
  },
  {
    slug: 'zero-to-paid-api',
    tag: 'Tutorial',
    tagColor: '#f59e0b',
    tagBg: 'rgba(245,158,11,0.06)',
    tagBorder: 'rgba(245,158,11,0.25)',
    date: 'Apr 22, 2025',
    title: 'Zero to paid API: build a USDC-gated endpoint in 10 minutes',
    excerpt: 'A step-by-step walkthrough of creating your first Gate402 endpoint — from account creation to receiving your first on-chain payment.',
    readTime: '10 min read',
  },
  {
    slug: 'solana-for-payments',
    tag: 'Technical',
    tagColor: '#9945FF',
    tagBg: 'rgba(153,69,255,0.06)',
    tagBorder: 'rgba(153,69,255,0.25)',
    date: 'Apr 15, 2025',
    title: 'Why we chose Solana for micropayments',
    excerpt: 'Sub-cent fees, 400ms finality, and a massive developer ecosystem. Our full reasoning for building Gate402 on Solana and USDC.',
    readTime: '5 min read',
  },
]

function Tag({ post }: { post: Post }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px', borderRadius: 100,
      fontSize: 11, fontFamily: MONO, letterSpacing: '0.04em',
      color: post.tagColor, background: post.tagBg, border: `1px solid ${post.tagBorder}`,
    }}>{post.tag}</span>
  )
}

export default function BlogPage() {
  const featured = POSTS.find(p => p.featured)!
  const rest = POSTS.filter(p => !p.featured)

  return (
    <div
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      style={{ fontFamily: FONT, background: '#000', minHeight: '100vh' }}
    >
      <style>{CSS}</style>
      <Nav />

      {/* ── HERO ── */}
      <section style={{
        padding: '160px clamp(20px, 5vw, 120px) 120px',
        textAlign: 'center',
        borderBottom: '1px solid #1a1a1a',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          border: '1px solid #1a1a1a', borderRadius: 100,
          padding: '5px 14px', fontSize: 11, color: '#666',
          fontFamily: MONO, letterSpacing: '0.04em',
          background: '#000', marginBottom: 32,
        }}>
          <span className="live-dot" />
          Gate402 Blog
        </div>

        <h1
          className="blog-hero-title"
          style={{
            fontFamily: FONT, fontWeight: 300,
            fontSize: 'clamp(40px, 5.5vw, 64px)',
            lineHeight: 1.1, letterSpacing: '-0.03em', color: '#fff',
            marginBottom: 20,
          }}
        >
          Ideas on the{' '}
          <span className="gradient-text">money-native web</span>
        </h1>

        <p style={{ fontFamily: FONT, fontSize: 17, color: '#666', maxWidth: 460, margin: '0 auto', lineHeight: 1.7 }}>
          Tutorials, technical deep-dives, and product updates from the Gate402 team.
        </p>
      </section>

      {/* ── FEATURED ── */}
      <section style={{ background: '#111111', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(20px, 5vw, 120px)' }}>
          <a
            className="featured-grid"
            href={`/blog/${featured.slug}`}
            style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              borderLeft: '1px solid #1a1a1a', borderRight: '1px solid #1a1a1a',
              transition: 'background 200ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.01)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {/* code preview panel */}
            <div style={{
              padding: '60px 48px',
              borderRight: '1px solid #1a1a1a',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
            }}>
              <div style={{ fontFamily: MONO, fontSize: 11, color: '#333', letterSpacing: '0.1em', marginBottom: 28 }}>
                FEATURED
              </div>
              <div style={{
                background: '#000', border: '1px solid #1a1a1a',
                borderRadius: 6, padding: '20px 20px',
                fontFamily: MONO, fontSize: 12, color: '#555', lineHeight: 2,
              }}>
                <div><span style={{ color: '#333' }}># gate402.config.js</span></div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ color: '#9945FF' }}>import </span>
                  <span style={{ color: '#fff' }}>gate402 </span>
                  <span style={{ color: '#9945FF' }}>from </span>
                  <span style={{ color: '#00bc7d' }}>'gate402'</span>
                </div>
                <div>
                  <span style={{ color: '#fff' }}>app</span>
                  <span style={{ color: '#666' }}>.use(</span>
                  <span style={{ color: '#f59e0b' }}>gate402</span>
                  <span style={{ color: '#666' }}>(&#123;</span>
                </div>
                <div style={{ paddingLeft: 16 }}>
                  <span style={{ color: '#666' }}>'/api/data': </span>
                  <span style={{ color: '#fff' }}>0.001</span>
                </div>
                <div><span style={{ color: '#666' }}>&#125;))</span></div>
              </div>
            </div>

            {/* content */}
            <div style={{ padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Tag post={featured} />
                <span style={{ fontFamily: MONO, fontSize: 11, color: '#333' }}>{featured.date}</span>
              </div>
              <h2 style={{
                fontFamily: FONT, fontWeight: 400,
                fontSize: 'clamp(20px, 2.5vw, 28px)',
                lineHeight: 1.3, letterSpacing: '-0.02em',
                color: '#fff', marginBottom: 16,
              }}>{featured.title}</h2>
              <p style={{ fontFamily: FONT, color: '#555', lineHeight: 1.65, fontSize: 14, marginBottom: 32 }}>{featured.excerpt}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: '#333' }}>{featured.readTime}</span>
                <span style={{ fontFamily: FONT, fontSize: 13, color: '#00bc7d' }}>Read post →</span>
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* ── POST GRID ── */}
      <section style={{ background: '#000', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(20px, 5vw, 120px)' }}>
          <div
            className="posts-grid"
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              border: '1px solid #1a1a1a',
              borderTop: 'none',
            }}
          >
            {rest.map((post, i) => (
              <a key={post.slug} href={`/blog/${post.slug}`}
                className="post-card"
                style={{
                  display: 'block',
                  background: '#000',
                  borderRight: i < rest.length - 1 ? '1px solid #1a1a1a' : 'none',
                  transition: 'background 200ms ease',
                  padding: '40px 32px',
                  borderBottom: i < rest.length - 3 ? '1px solid #1a1a1a' : 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#111111')}
                onMouseLeave={e => (e.currentTarget.style.background = '#000')}
              >
                <div style={{
                  height: 2,
                  background: `linear-gradient(90deg, ${post.tagColor}, transparent)`,
                  marginBottom: 28, marginLeft: -32, marginRight: -32, marginTop: -40,
                  position: 'relative', top: -0,
                  borderBottom: '0px',
                }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <Tag post={post} />
                  <span style={{ fontFamily: MONO, fontSize: 11, color: '#333' }}>{post.date}</span>
                </div>
                <h3 style={{ fontFamily: FONT, fontWeight: 400, fontSize: 16, lineHeight: 1.4, letterSpacing: '-0.01em', color: '#fff', marginBottom: 12 }}>
                  {post.title}
                </h3>
                <p style={{ fontFamily: FONT, color: '#555', fontSize: 13, lineHeight: 1.65, marginBottom: 24 }}>{post.excerpt}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: '#333' }}>{post.readTime}</span>
                  <span style={{ fontFamily: FONT, fontSize: 12, color: '#444' }}>Read →</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: '#111111', padding: '120px clamp(20px, 5vw, 120px)', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr auto', gap: 40,
            alignItems: 'center',
            border: '1px solid #1a1a1a', borderRadius: 8,
            background: '#000', padding: '48px 48px',
          }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: '#333', letterSpacing: '0.1em', marginBottom: 12 }}>
                STAY IN THE LOOP
              </div>
              <h2 style={{ fontFamily: FONT, fontWeight: 300, fontSize: 32, letterSpacing: '-0.02em', color: '#fff', marginBottom: 10 }}>
                Get new posts in your inbox
              </h2>
              <p style={{ fontFamily: FONT, color: '#666', fontSize: 14 }}>
                No spam. Tutorials, updates, and ideas on API monetization.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <input
                type="email"
                placeholder="you@example.com"
                style={{
                  background: '#111111', border: '1px solid #1a1a1a',
                  borderRadius: 6, padding: '10px 16px',
                  color: '#fff', fontSize: 13, fontFamily: FONT,
                  outline: 'none', width: 220,
                }}
              />
              <button style={{
                fontSize: 13, fontWeight: 500, color: '#000',
                background: '#00bc7d', padding: '10px 20px',
                borderRadius: 6, border: 'none', cursor: 'pointer',
                fontFamily: FONT, whiteSpace: 'nowrap',
              }}>Subscribe →</button>
            </div>
          </div>
        </div>
      </section>

      <FlickeringFooter />
    </div>
  )
}

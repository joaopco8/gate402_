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
  :root {
    --bg:           #0F0F0F;
    --surface:      #0a0a0a;
    --card:         #0d0d0d;
    --border:       #1a1a1a;
    --border-hover: #2a2a2a;
    --text:         #ffffff;
    --text-muted:   #666666;
    --text-dim:     #333333;
    --green:        #00bc7d;
    --purple:       #9945FF;
  }

  *, *::before, *::after { box-sizing: border-box; }

  body {
    background: var(--bg);
    color: var(--text);
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
    0%, 100% { opacity: 0.35; }
    50%       { opacity: 1; }
  }

  .gradient-animated {
    background: linear-gradient(135deg, #00bc7d, #9945FF, #00bc7d, #9945FF);
    background-size: 300% 300%;
    animation: gradientShift 3s ease infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .fade-in-up { animation: fadeInUp 0.6s ease-out both; }

  .g-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    transition: border-color 0.2s;
  }
  .g-card:hover { border-color: var(--border-hover); }

  .post-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    transition: border-color 0.2s, transform 0.2s;
    cursor: pointer;
    display: block;
  }
  .post-card:hover {
    border-color: var(--border-hover);
    transform: translateY(-2px);
  }

  .badge {
    display: inline-flex; align-items: center; gap: 8px;
    border: 1px solid var(--border); border-radius: 100px;
    padding: 5px 14px; font-size: 11px; color: var(--text-muted);
    font-family: var(--font-mono, monospace); letter-spacing: 0.04em;
    background: var(--card);
  }

  .tag {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 100px;
    font-size: 11px;
    font-family: var(--font-mono, monospace);
    letter-spacing: 0.04em;
    border: 1px solid #1a1a1a;
    color: #555;
  }

  .tag-green {
    border-color: rgba(0,188,125,0.25);
    color: #00bc7d;
    background: rgba(0,188,125,0.06);
  }

  .tag-purple {
    border-color: rgba(153,69,255,0.25);
    color: #9945FF;
    background: rgba(153,69,255,0.06);
  }

  .live-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--green);
    animation: pulseSlow 2s ease-in-out infinite;
  }

  html, body { overflow-x: hidden; }

  @media (max-width: 768px) {
    .nav-links { display: none !important; }
    .blog-grid { grid-template-columns: 1fr !important; }
    .featured-grid { grid-template-columns: 1fr !important; }
    .blog-hero-title { font-size: 40px !important; }
  }
`

function Nav() {
  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 100,
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 clamp(20px, 10vw, 250px)',
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #1a1a1a',
    }}>
      <a href="/">
        <img src="/logo-gate.png" alt="Gate402" style={{ height: 22, width: 'auto', display: 'block' }} />
      </a>

      <div className="nav-links" style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 32,
        alignItems: 'center',
      }}>
        {[
          { label: 'How it works', href: '/#how-it-works' },
          { label: 'Docs',         href: '/docs' },
          { label: 'Pricing',      href: '/pricing' },
          { label: 'GitHub',       href: 'https://github.com/joaopco8/gate402_', target: '_blank' },
        ].map(({ label, href, target }) => (
          <a
            key={label}
            href={href}
            target={target}
            rel={target === '_blank' ? 'noopener noreferrer' : undefined}
            style={{ fontSize: 14, color: '#666', fontFamily: 'var(--font-space)', transition: 'color 150ms' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#666')}
          >{label}</a>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <a href="/auth/login" style={{ fontSize: 14, color: '#666', fontFamily: 'var(--font-space)' }}>Sign in</a>
        <a href="/auth/login" style={{
          fontSize: 14, fontFamily: 'var(--font-space)', fontWeight: 500,
          color: '#000', background: '#00bc7d', padding: '8px 18px', borderRadius: 6,
        }}>Start free →</a>
      </div>
    </nav>
  )
}

type Post = {
  slug: string
  tag: string
  tagStyle: string
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
    tagStyle: 'tag-green',
    date: 'May 14, 2025',
    title: 'Introducing Gate402: charge for any API endpoint with one line of code',
    excerpt: 'Today we\'re opening early access to Gate402 — a developer platform that lets you monetize HTTP endpoints with per-call USDC payments, powered by the x402 protocol.',
    readTime: '5 min read',
    featured: true,
  },
  {
    slug: 'x402-protocol-explained',
    tag: 'Technical',
    tagStyle: 'tag-purple',
    date: 'May 10, 2025',
    title: 'x402: the HTTP payment extension and how it works',
    excerpt: 'HTTP 402 "Payment Required" has been reserved since 1991 but never formally defined. The x402 standard finally gives it a machine-readable shape — here\'s how it works under the hood.',
    readTime: '8 min read',
  },
  {
    slug: 'ai-agents-need-wallets',
    tag: 'Product',
    tagStyle: 'tag-green',
    date: 'May 6, 2025',
    title: 'Why every AI agent needs a wallet',
    excerpt: 'As LLM agents become capable of taking actions on the web, they need to pay for the resources they consume. Crypto micropayments are the only practical solution at machine speed.',
    readTime: '6 min read',
  },
  {
    slug: 'usdc-vs-stripe',
    tag: 'Technical',
    tagStyle: 'tag-purple',
    date: 'Apr 29, 2025',
    title: 'USDC payments vs Stripe for API monetization',
    excerpt: 'Stripe is great for SaaS. For per-call API payments with no minimum invoice, instant settlement, and global reach — stablecoins win on every dimension.',
    readTime: '7 min read',
  },
  {
    slug: 'zero-to-paid-api',
    tag: 'Tutorial',
    tagStyle: '',
    date: 'Apr 22, 2025',
    title: 'Zero to paid API: build a USDC-gated endpoint in 10 minutes',
    excerpt: 'A step-by-step walkthrough of creating your first Gate402 endpoint — from account creation to receiving your first on-chain payment.',
    readTime: '10 min read',
  },
  {
    slug: 'solana-for-payments',
    tag: 'Technical',
    tagStyle: 'tag-purple',
    date: 'Apr 15, 2025',
    title: 'Why we chose Solana for micropayments',
    excerpt: 'Sub-cent fees, 400ms finality, and a massive developer ecosystem. Here\'s our full reasoning for building Gate402 on Solana and USDC.',
    readTime: '5 min read',
  },
]

function PostCard({ post }: { post: Post }) {
  return (
    <a href={`/blog/${post.slug}`} className="post-card">
      <div style={{
        height: 3,
        background: post.tagStyle === 'tag-green'
          ? 'linear-gradient(90deg, #00bc7d, transparent)'
          : post.tagStyle === 'tag-purple'
            ? 'linear-gradient(90deg, #9945FF, transparent)'
            : 'linear-gradient(90deg, #2a2a2a, transparent)',
      }} />
      <div style={{ padding: '28px 28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span className={`tag ${post.tagStyle}`}>{post.tag}</span>
          <span style={{ color: '#333', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{post.date}</span>
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.4, letterSpacing: '-0.01em', marginBottom: 12 }}>
          {post.title}
        </h3>
        <p style={{ color: '#555', fontSize: 14, lineHeight: 1.65, marginBottom: 20 }}>{post.excerpt}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#333', fontFamily: 'var(--font-mono)' }}>{post.readTime}</span>
          <span style={{ fontSize: 13, color: '#444', transition: 'color 150ms' }}>Read →</span>
        </div>
      </div>
    </a>
  )
}

export default function BlogPage() {
  const featured = POSTS.find(p => p.featured)!
  const rest = POSTS.filter(p => !p.featured)

  return (
    <div
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      style={{ fontFamily: 'var(--font-space, sans-serif)', background: '#0F0F0F', minHeight: '100vh' }}
    >
      <style>{CSS}</style>
      <Nav />

      {/* ── HERO ── */}
      <section style={{
        paddingTop: 140,
        paddingBottom: 72,
        padding: '140px clamp(20px, 10vw, 250px) 72px',
        textAlign: 'center',
      }}>
        <div className="badge fade-in-up" style={{ marginBottom: 28 }}>
          <span className="live-dot" />
          The Gate402 Blog
        </div>
        <h1
          className="blog-hero-title fade-in-up"
          style={{
            fontSize: 'clamp(40px, 5.5vw, 64px)',
            fontWeight: 300,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: 20,
            animationDelay: '80ms',
          }}
        >
          Ideas on the{' '}
          <span className="gradient-animated">money-native web</span>
        </h1>
        <p className="fade-in-up" style={{
          fontSize: 17,
          color: '#666',
          maxWidth: 480,
          margin: '0 auto',
          lineHeight: 1.7,
          animationDelay: '160ms',
        }}>
          Tutorials, technical deep-dives, and product updates from the Gate402 team.
        </p>
      </section>

      {/* ── FEATURED POST ── */}
      <section style={{ padding: '0 clamp(20px, 10vw, 250px) 64px' }}>
        <a href={`/blog/${featured.slug}`} className="featured-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 0,
          background: '#0d0d0d',
          border: '1px solid #1a1a1a',
          borderRadius: 12,
          overflow: 'hidden',
          transition: 'border-color 0.2s',
          cursor: 'pointer',
        }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = '#2a2a2a')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = '#1a1a1a')}
        >
          {/* gradient panel */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,188,125,0.08) 0%, rgba(153,69,255,0.08) 100%)',
            borderRight: '1px solid #1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 280,
            padding: 40,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00bc7d, #9945FF)',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
              }}>⚡</div>
              <p style={{ fontSize: 11, color: '#444', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>Featured post</p>
            </div>
          </div>

          {/* content */}
          <div style={{ padding: '44px 44px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span className={`tag ${featured.tagStyle}`}>{featured.tag}</span>
              <span style={{ color: '#333', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{featured.date}</span>
            </div>
            <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 400, lineHeight: 1.3, letterSpacing: '-0.02em', marginBottom: 16 }}>
              {featured.title}
            </h2>
            <p style={{ color: '#555', lineHeight: 1.65, fontSize: 14, marginBottom: 28 }}>{featured.excerpt}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#333', fontFamily: 'var(--font-mono)' }}>{featured.readTime}</span>
              <span style={{ fontSize: 14, color: '#00bc7d' }}>Read post →</span>
            </div>
          </div>
        </a>
      </section>

      {/* ── POST GRID ── */}
      <section style={{ padding: '0 clamp(20px, 10vw, 250px) 120px' }}>
        <div className="blog-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {rest.map(post => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section style={{ padding: '0 clamp(20px, 10vw, 250px) 120px' }}>
        <div style={{
          background: '#0d0d0d',
          border: '1px solid #1a1a1a',
          borderRadius: 12,
          padding: 'clamp(40px, 5vw, 60px)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 11, color: '#444', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            Stay in the loop
          </p>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: 12 }}>
            Get new posts in your inbox
          </h2>
          <p style={{ color: '#555', marginBottom: 28, fontSize: 15 }}>
            No spam. Just tutorials, updates, and ideas on API monetization.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <input
              type="email"
              placeholder="you@example.com"
              style={{
                background: '#0a0a0a',
                border: '1px solid #1a1a1a',
                borderRadius: 6,
                padding: '10px 16px',
                color: '#fff',
                fontSize: 14,
                fontFamily: 'var(--font-space)',
                outline: 'none',
                width: 260,
              }}
            />
            <button style={{
              fontSize: 14, fontWeight: 500, color: '#000',
              background: '#00bc7d', padding: '10px 22px', borderRadius: 6,
              border: 'none', cursor: 'pointer', fontFamily: 'var(--font-space)',
            }}>Subscribe →</button>
          </div>
        </div>
      </section>

      <FlickeringFooter />
    </div>
  )
}

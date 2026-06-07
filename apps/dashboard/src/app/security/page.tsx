'use client'
import '../../styles/v2/tokens.css'
import { V2Navbar } from '../../components/v2/v2-navbar'
import { V2Footer } from '../../components/v2/v2-footer'

const LINE  = '1px solid #2A2E2A'
const SANS  = "'Inter', sans-serif"
const MONO  = "'JetBrains Mono', monospace"
const TEXT  = '#E8F4EE'
const MUTED = '#7A8C79'
const DIM   = '#4A5549'
const GREEN = '#7AF279'

const sections = [
  {
    title: 'Our Security Commitment',
    body: `Security is foundational to Metera. We handle on-chain payment infrastructure for AI agents — a context where vulnerabilities can have direct financial consequences. We take that responsibility seriously.\n\nThis page describes the security practices we follow, how to report vulnerabilities, and what you can expect when you do.`,
  },
  {
    title: 'Data Encryption',
    body: `All data in transit is encrypted using TLS 1.3. Data at rest is encrypted using AES-256. This applies to all user data, API keys, wallet metadata, and payment records stored in our systems.\n\nWe do not store private keys on our servers. Wallet signing operations happen client-side or via hardware security modules where applicable.`,
  },
  {
    title: 'API Key Security',
    body: `API keys are hashed using bcrypt before storage — we never store plaintext keys. Keys are scoped by permission level and can be revoked at any time from your dashboard.\n\nWe recommend rotating API keys regularly and restricting them to specific IP ranges where possible. Keys exposed in public repositories should be rotated immediately.`,
  },
  {
    title: 'Infrastructure',
    body: `Metera infrastructure runs on isolated environments with strict network segmentation. Services communicate over private networks. Production databases are not accessible from the public internet.\n\nWe run automated vulnerability scanning on all dependencies and apply security patches within 48 hours of critical CVE disclosure. Our infrastructure is continuously monitored for anomalous behavior.`,
  },
  {
    title: 'Authentication',
    body: `User authentication is handled via Supabase Auth with support for email/password and OAuth providers. Session tokens are rotated on each request.\n\nWe support and encourage the use of strong, unique passwords. Two-factor authentication is available and recommended for all accounts.`,
  },
  {
    title: 'On-chain Security',
    body: `Payments processed through Metera use the x402 protocol on Solana. On-chain transactions are immutable and publicly verifiable. We validate payment proofs server-side before granting API access.\n\nWe do not custody user funds. Payments flow directly from payer wallet to developer wallet. Metera does not have signing authority over any user wallet.`,
  },
  {
    title: 'Responsible Disclosure',
    body: `We operate a responsible disclosure program. If you discover a security vulnerability in Metera, please report it to us before making it public. We commit to:\n\n— Acknowledge your report within 24 hours\n— Provide a resolution timeline within 72 hours\n— Credit you publicly (if you wish) once the issue is resolved\n— Not take legal action against good-faith security researchers\n\nPlease do not access, modify, or delete user data when testing. Do not perform denial-of-service attacks or automated scanning against production systems.`,
  },
  {
    title: 'Report a Vulnerability',
    body: `Send vulnerability reports to:\n\nsecurity@Metera.dev\n\nInclude a clear description of the vulnerability, steps to reproduce, and your assessment of impact. We respond to all reports.`,
  },
]

export default function SecurityPage() {
  return (
    <div style={{ background: '#1B1E1B', minHeight: '100vh', fontFamily: SANS, color: TEXT }}>
      <V2Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', borderLeft: LINE, borderRight: LINE }}>

        <div style={{ padding: '80px 64px 56px', borderBottom: LINE }}>
          <span style={{ fontSize: 10, fontFamily: MONO, letterSpacing: '0.12em', textTransform: 'uppercase', color: GREEN, display: 'block', marginBottom: 20 }}>
            security
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 300, letterSpacing: '-0.04em', color: '#FFFFFF', margin: '0 0 20px', lineHeight: 1.05, fontFamily: SANS }}>
            Security
          </h1>
          <p style={{ fontSize: 15, color: MUTED, margin: 0, fontWeight: 300, maxWidth: 480 }}>
            How we protect your data, your keys, and your payments.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr' }}>
          <div style={{ borderRight: LINE, padding: '56px 40px', position: 'sticky', top: 64, alignSelf: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 10, fontFamily: MONO, letterSpacing: '0.1em', textTransform: 'uppercase', color: DIM, marginBottom: 12 }}>Contents</span>
              {sections.map((s, i) => (
                <a key={i} href={`#section-${i}`} style={{ fontSize: 13, color: MUTED, textDecoration: 'none', fontFamily: SANS, padding: '4px 0', transition: 'color 0.15s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
                  onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                >
                  {s.title}
                </a>
              ))}
            </div>
          </div>

          <div style={{ padding: '56px 64px 80px' }}>
            {sections.map((s, i) => (
              <div key={i} id={`section-${i}`} style={{ marginBottom: 56 }}>
                <h2 style={{ fontSize: 18, fontWeight: 400, letterSpacing: '-0.02em', color: '#FFFFFF', margin: '0 0 16px', fontFamily: SANS }}>
                  {s.title}
                </h2>
                {s.body.split('\n\n').map((p, j) => (
                  <p key={j} style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, margin: '0 0 16px', fontWeight: 300, fontFamily: s.title === 'Report a Vulnerability' && p.includes('@') ? MONO : SANS, whiteSpace: 'pre-line' }}>
                    {p}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        <V2Footer />
      </div>
    </div>
  )
}

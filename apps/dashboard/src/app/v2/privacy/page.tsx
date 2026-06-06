'use client'
import '../../../styles/v2/tokens.css'
import { V2Navbar } from '../../../components/v2/v2-navbar'
import { V2Footer } from '../../../components/v2/v2-footer'

const LINE  = '1px solid #2A2E2A'
const SANS  = "'Inter', sans-serif"
const MONO  = "'JetBrains Mono', monospace"
const TEXT  = '#E8F4EE'
const MUTED = '#7A8C79'
const DIM   = '#4A5549'
const GREEN = '#7AF279'

const sections = [
  {
    title: 'Information We Collect',
    body: `We collect information you provide directly to us, such as when you create an account, integrate our SDK, or contact support. This includes your email address, API keys, and wallet addresses associated with your account.\n\nWe also automatically collect certain technical data when you use our services: IP addresses, browser type, operating system, referring URLs, and usage data about API calls made through Metera.`,
  },
  {
    title: 'How We Use Your Information',
    body: `We use the information we collect to provide, maintain, and improve our services — including processing payments, detecting fraud, and generating analytics dashboards. We do not sell your personal data to third parties.\n\nOn-chain transaction data (wallet addresses, payment amounts) is publicly visible on the Solana blockchain by nature of the protocol. Metera does not control or obscure this data.`,
  },
  {
    title: 'Data Storage and Security',
    body: `Your data is stored on servers located in the United States and the European Union. We implement industry-standard security measures including encryption at rest and in transit, access controls, and regular security audits.\n\nAPI keys are hashed before storage. We recommend rotating your keys regularly and never sharing them publicly.`,
  },
  {
    title: 'Third-Party Services',
    body: `We use Supabase for database and authentication services, Solana mainnet for payment settlement, and standard cloud infrastructure providers. Each third-party service operates under its own privacy policy.\n\nWe do not share your personal data with advertising networks or data brokers.`,
  },
  {
    title: 'Your Rights',
    body: `You have the right to access, correct, or delete your personal data at any time. You may request a copy of all data we hold about you by contacting us at privacy@Metera.dev.\n\nFor users in the European Economic Area, you have additional rights under GDPR including the right to data portability and the right to object to processing.`,
  },
  {
    title: 'Contact',
    body: `If you have questions about this Privacy Policy or our data practices, contact us at:\n\nprivacy@Metera.dev\n\nThis policy was last updated January 2026.`,
  },
]

export default function PrivacyPage() {
  return (
    <div style={{ background: '#1B1E1B', minHeight: '100vh', fontFamily: SANS, color: TEXT }}>
      <V2Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', borderLeft: LINE, borderRight: LINE }}>

        {/* header */}
        <div style={{ padding: '80px 64px 56px', borderBottom: LINE }}>
          <span style={{
            fontSize: 10, fontFamily: MONO, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: GREEN,
            display: 'block', marginBottom: 20,
          }}>
            legal
          </span>
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 300,
            letterSpacing: '-0.04em', color: '#FFFFFF',
            margin: '0 0 20px', lineHeight: 1.05, fontFamily: SANS,
          }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 15, color: MUTED, margin: 0, fontWeight: 300, maxWidth: 480 }}>
            How Metera collects, uses, and protects your data.
            Effective January 1, 2026.
          </p>
        </div>

        {/* content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr' }}>

          {/* sidebar toc */}
          <div style={{ borderRight: LINE, padding: '56px 40px', position: 'sticky', top: 64, alignSelf: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 10, fontFamily: MONO, letterSpacing: '0.1em', textTransform: 'uppercase', color: DIM, marginBottom: 12 }}>
                Contents
              </span>
              {sections.map((s, i) => (
                <a key={i} href={`#section-${i}`} style={{
                  fontSize: 13, color: MUTED, textDecoration: 'none',
                  fontFamily: SANS, padding: '4px 0',
                  transition: 'color 0.15s ease',
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
                  onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                >
                  {s.title}
                </a>
              ))}
            </div>
          </div>

          {/* body */}
          <div style={{ padding: '56px 64px 80px' }}>
            {sections.map((s, i) => (
              <div key={i} id={`section-${i}`} style={{ marginBottom: 56 }}>
                <h2 style={{
                  fontSize: 18, fontWeight: 400, letterSpacing: '-0.02em',
                  color: '#FFFFFF', margin: '0 0 16px', fontFamily: SANS,
                }}>
                  {s.title}
                </h2>
                {s.body.split('\n\n').map((p, j) => (
                  <p key={j} style={{
                    fontSize: 14, color: MUTED, lineHeight: 1.8,
                    margin: '0 0 16px', fontWeight: 300,
                    fontFamily: s.title === 'Contact' && p.includes('@') ? MONO : SANS,
                  }}>
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

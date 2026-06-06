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
    title: 'What Are Cookies',
    body: `Cookies are small text files placed on your device when you visit a website. They allow the site to remember your preferences and understand how you interact with it.\n\nMetera uses cookies and similar technologies such as local storage and session storage to operate the Service and improve your experience.`,
  },
  {
    title: 'Essential Cookies',
    body: `These cookies are necessary for the Service to function and cannot be disabled. They include:\n\nAuthentication tokens that keep you signed in across sessions. Session identifiers used to maintain your state while using the dashboard. Security cookies that help detect and prevent fraudulent activity.\n\nYou cannot opt out of essential cookies as they are required for the Service to operate.`,
  },
  {
    title: 'Analytics Cookies',
    body: `We use analytics cookies to understand how users interact with the Service. This data is aggregated and anonymous — it helps us improve the dashboard, documentation, and onboarding flow.\n\nAnalytics data includes pages visited, time spent, and general navigation patterns. No personally identifiable information is included in analytics reports.`,
  },
  {
    title: 'Preference Cookies',
    body: `Preference cookies remember your settings and choices within the dashboard, such as selected time ranges, theme preferences, and display options.\n\nThese cookies improve your experience by avoiding the need to reconfigure settings on each visit. They can be cleared by resetting your browser storage.`,
  },
  {
    title: 'Third-Party Cookies',
    body: `Some features of the Service may load resources from third-party providers. These providers may set their own cookies in accordance with their privacy policies.\n\nWe do not use third-party advertising cookies or allow ad networks to place cookies through Metera.`,
  },
  {
    title: 'Managing Your Cookies',
    body: `You can control cookies through your browser settings. Most browsers allow you to block, delete, or be notified when cookies are set. Refer to your browser's documentation for specific instructions.\n\nNote that blocking essential cookies will prevent you from signing in and using authenticated features of the dashboard.`,
  },
  {
    title: 'Contact',
    body: `For questions about our cookie practices, contact us at:\n\nprivacy@Metera.dev\n\nThis policy was last updated January 2026.`,
  },
]

export default function CookiesPage() {
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
            Cookie Settings
          </h1>
          <p style={{ fontSize: 15, color: MUTED, margin: 0, fontWeight: 300, maxWidth: 480 }}>
            How Metera uses cookies and how to manage your preferences.
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

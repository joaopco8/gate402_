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
    title: 'Acceptance of Terms',
    body: `By accessing or using Metera / Metera (the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.\n\nThese terms apply to all users, including developers who integrate the SDK, end users who interact with gated APIs, and visitors to our website.`,
  },
  {
    title: 'Description of Service',
    body: `Metera provides billing infrastructure for AI agents, enabling on-chain micropayments via USDC on the Solana blockchain using the x402 payment protocol. The Service includes the Metera SDK, developer dashboard, metering engine, and related APIs.\n\nWe reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable notice.`,
  },
  {
    title: 'Account Registration',
    body: `To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your credentials and API keys. You agree to notify us immediately of any unauthorized use of your account.\n\nYou must provide accurate and complete information when registering. Accounts may not be transferred to another party without our written consent.`,
  },
  {
    title: 'Acceptable Use',
    body: `You agree not to use the Service to: violate any applicable law or regulation; transmit malware or malicious code; attempt to gain unauthorized access to our systems; interfere with or disrupt the integrity of the Service; or engage in fraudulent transactions.\n\nWe reserve the right to suspend or terminate accounts that violate these terms without prior notice.`,
  },
  {
    title: 'Payments and Fees',
    body: `All payments processed through Metera are settled on-chain in USDC on the Solana blockchain. By using the payment features, you acknowledge that on-chain transactions are irreversible and publicly visible.\n\nMetera charges a platform fee as described on the Pricing page. Fees are subject to change with 30 days notice. You are responsible for all applicable taxes related to your use of the Service.`,
  },
  {
    title: 'Intellectual Property',
    body: `The Metera SDK is licensed under the MIT License. All other Metera software, branding, and documentation are the intellectual property of Metera and may not be reproduced without permission.\n\nBy submitting feedback or contributions, you grant Metera a perpetual, irrevocable license to use and incorporate such feedback.`,
  },
  {
    title: 'Disclaimer of Warranties',
    body: `The Service is provided "as is" without warranties of any kind, express or implied. Metera does not warrant that the Service will be uninterrupted, error-free, or free of vulnerabilities.\n\nOn-chain transactions depend on the Solana network, which operates independently of Metera. We are not responsible for network outages, congestion, or changes to the Solana protocol.`,
  },
  {
    title: 'Limitation of Liability',
    body: `To the maximum extent permitted by law, Metera shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.\n\nOur total liability to you for any claims arising from these terms shall not exceed the amount you paid to Metera in the 12 months preceding the claim.`,
  },
  {
    title: 'Contact',
    body: `Questions about these Terms of Service should be sent to:\n\nlegal@Metera.dev\n\nThese terms were last updated January 2026.`,
  },
]

export default function TermsPage() {
  return (
    <div style={{ background: '#1B1E1B', minHeight: '100vh', fontFamily: SANS, color: TEXT }}>
      <V2Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', borderLeft: LINE, borderRight: LINE }}>

        <div style={{ padding: '80px 64px 56px', borderBottom: LINE }}>
          <span style={{ fontSize: 10, fontFamily: MONO, letterSpacing: '0.12em', textTransform: 'uppercase', color: GREEN, display: 'block', marginBottom: 20 }}>
            legal
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 300, letterSpacing: '-0.04em', color: '#FFFFFF', margin: '0 0 20px', lineHeight: 1.05, fontFamily: SANS }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: 15, color: MUTED, margin: 0, fontWeight: 300, maxWidth: 480 }}>
            The rules and conditions governing your use of Metera. Effective January 1, 2026.
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
                  <p key={j} style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, margin: '0 0 16px', fontWeight: 300, fontFamily: s.title === 'Contact' && p.includes('@') ? MONO : SANS }}>
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

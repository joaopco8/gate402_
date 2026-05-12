'use client'

export default function TermsPage() {
  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: 'monospace', color: '#ccc' }}>

      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#000',
        borderBottom: '1px solid #1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: 52,
      }}>
        <a href="/" style={{ color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em' }}>
          gate402
        </a>
        <a href="/" style={{ color: '#555', textDecoration: 'none', fontSize: 13, transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#aaa')}
          onMouseLeave={e => (e.currentTarget.style.color = '#555')}
        >
          Back to home →
        </a>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '80px 24px 120px' }}>

        <h1 style={{ fontSize: 28, fontWeight: 600, color: '#fff', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Terms of Service
        </h1>
        <p style={{ color: '#555', fontSize: 13, marginBottom: 4, fontStyle: 'italic' }}>Last updated: May 2026</p>
        <p style={{ color: '#555', fontSize: 13, marginBottom: 48, fontStyle: 'italic' }}>Effective date: May 2026</p>

        <p style={prose}>
          Please read these Terms of Service carefully before using Gate402.
          By accessing or using gate402.dev or api.gate402.dev, you agree to be
          bound by these terms.
        </p>

        <Hr />

        <H2>1. Acceptance of Terms</H2>
        <p style={prose}>
          By creating an account or using Gate402, you agree to these Terms of Service
          and our <a href="/privacy" style={inlineLink}>Privacy Policy</a>. If you do not agree, do not use the service.
        </p>

        <Hr />

        <H2>2. Description of Service</H2>
        <p style={prose}>Gate402 provides:</p>
        <Ul items={[
          'Gate402 SDK — An open-source Express middleware for monetizing API endpoints using the x402 protocol and USDC on Solana. Licensed under MIT.',
          'Gate402 Platform (gate402.dev) — A hosted dashboard for analytics, wallet management, and payment verification. Available on Free, Pro, and Enterprise plans.',
          'Gate402 API (api.gate402.dev) — A managed verification service for validating on-chain USDC payments.',
        ]} bold />

        <Hr />

        <H2>3. Accounts</H2>

        <H3>Registration</H3>
        <p style={prose}>
          You must sign in with a valid GitHub account to use the hosted platform.
          You are responsible for maintaining the confidentiality of your API key.
        </p>

        <H3>Account Termination</H3>
        <p style={prose}>We reserve the right to suspend or terminate accounts that:</p>
        <Ul items={[
          'Violate these Terms of Service',
          'Are used for spam, abuse, or fraudulent activity',
          'Remain inactive for more than 12 months on the Free plan',
        ]} />
        <p style={prose}>
          You may delete your account at any time by contacting{' '}
          <a href="mailto:support@gate402.dev" style={inlineLink}>support@gate402.dev</a>.
        </p>

        <Hr />

        <H2>4. Plans and Billing</H2>

        <H3>Free Plan</H3>
        <p style={prose}>
          The Free plan is available at no cost and includes access to the open-source
          SDK and self-hosted infrastructure. No payment information required.
        </p>

        <H3>Pro Plan ($99/month)</H3>
        <p style={prose}>
          The Pro plan is billed monthly via Stripe. By subscribing, you authorize us
          to charge your payment method on a recurring monthly basis.
        </p>
        <p style={prose}>
          <span style={{ color: '#ccc', fontWeight: 600 }}>Cancellation:</span>{' '}
          You may cancel your Pro subscription at any time from your account settings.
          Cancellation takes effect at the end of the current billing period. No refunds
          are issued for partial months.
        </p>
        <p style={prose}>
          <span style={{ color: '#ccc', fontWeight: 600 }}>Changes to pricing:</span>{' '}
          We will provide at least 30 days notice before changing Pro plan pricing.
        </p>

        <H3>Enterprise Plan (0.5% of volume)</H3>
        <p style={prose}>
          Enterprise pricing is custom and based on processed USDC volume.
          Contact us at{' '}
          <a href="mailto:enterprise@gate402.dev" style={inlineLink}>enterprise@gate402.dev</a>{' '}
          for details.
        </p>

        <Hr />

        <H2>5. Acceptable Use</H2>
        <p style={prose}>You may not use Gate402 to:</p>
        <Ul items={[
          'Violate any applicable laws or regulations',
          'Process payments for illegal goods or services',
          'Attempt to circumvent payment verification mechanisms',
          'Conduct denial-of-service attacks against our infrastructure',
          'Resell or white-label the Gate402 platform without an Enterprise agreement',
          'Scrape or extract data from the dashboard without authorization',
        ]} />

        <Hr />

        <H2>6. Cryptocurrency and Blockchain</H2>

        <H3>USDC Payments</H3>
        <p style={prose}>Gate402 facilitates USDC payments on the Solana blockchain. You acknowledge that:</p>
        <Ul items={[
          'Blockchain transactions are irreversible once confirmed',
          'Gate402 does not hold or custody USDC on your behalf',
          'Payments go directly from the payer\'s wallet to your configured wallet',
          'You are responsible for the tax implications of receiving cryptocurrency',
        ]} />

        <H3>Wallet Security</H3>
        <p style={prose}>
          You are solely responsible for the security of your Solana wallet and private keys.
          Gate402 never has access to your private keys. If you lose access to your wallet,
          Gate402 cannot recover your funds.
        </p>

        <H3>Network Conditions</H3>
        <p style={prose}>
          Solana network congestion or outages may affect payment settlement times.
          Gate402 is not responsible for delays caused by third-party blockchain infrastructure.
        </p>

        <Hr />

        <H2>7. API and SDK</H2>

        <H3>MIT License</H3>
        <p style={prose}>
          The Gate402 SDK is open source under the MIT License. You are free to use,
          modify, and distribute it per the terms of that license.
        </p>

        <H3>API Rate Limits</H3>
        <p style={prose}>
          Free plan: 100 requests per minute, 20 unpaid requests per minute.
          Pro plan: Higher limits apply. Contact us for Enterprise limits.
        </p>

        <H3>Service Availability</H3>
        <p style={prose}>
          We target 99.9% uptime for api.gate402.dev but do not guarantee it.
          Scheduled maintenance will be announced in advance when possible.
        </p>

        <Hr />

        <H2>8. Data and Privacy</H2>
        <p style={prose}>
          Your use of Gate402 is also governed by our{' '}
          <a href="/privacy" style={inlineLink}>Privacy Policy</a>.
          By using Gate402, you consent to the data practices described therein.
        </p>

        <Hr />

        <H2>9. Intellectual Property</H2>

        <H3>Gate402 Platform</H3>
        <p style={prose}>
          The Gate402 dashboard, branding, and proprietary infrastructure are owned
          by Gate402 and protected by intellectual property laws.
        </p>

        <H3>Your Data</H3>
        <p style={prose}>
          You retain ownership of your API call data and business analytics.
          You grant us a limited license to process this data to provide the service.
        </p>

        <Hr />

        <H2>10. Disclaimers</H2>
        <p style={{ ...prose, color: '#666', fontSize: 13 }}>
          THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
          IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS
          FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
        <p style={{ ...prose, color: '#666', fontSize: 13 }}>WE DO NOT WARRANT THAT:</p>
        <Ul items={[
          'The service will be uninterrupted or error-free',
          'Payments will be processed within a specific timeframe',
          'The Solana blockchain will operate without disruption',
        ]} small />

        <Hr />

        <H2>11. Limitation of Liability</H2>
        <p style={{ ...prose, color: '#666', fontSize: 13 }}>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, GATE402 SHALL NOT BE LIABLE
          FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
          INCLUDING BUT NOT LIMITED TO LOSS OF REVENUE, LOSS OF DATA, OR LOSS OF BUSINESS
          OPPORTUNITIES, ARISING FROM YOUR USE OF THE SERVICE.
        </p>
        <p style={{ ...prose, color: '#666', fontSize: 13 }}>
          OUR TOTAL LIABILITY TO YOU SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE
          THREE MONTHS PRECEDING THE CLAIM.
        </p>

        <Hr />

        <H2>12. Indemnification</H2>
        <p style={prose}>
          You agree to indemnify and hold harmless Gate402 and its operators from any
          claims, damages, or expenses (including legal fees) arising from:
        </p>
        <Ul items={[
          'Your use of the service',
          'Your violation of these Terms',
          'Content or APIs you make available through Gate402',
          'Any dispute between you and your users or the agents accessing your API',
        ]} />

        <Hr />

        <H2>13. Governing Law</H2>
        <p style={prose}>
          These Terms are governed by the laws of Brazil, without regard to conflict
          of law principles. Any disputes shall be resolved in the courts of Brazil.
        </p>

        <Hr />

        <H2>14. Changes to Terms</H2>
        <p style={prose}>
          We may update these Terms at any time. We will notify you of material changes
          by email or by displaying a notice in the dashboard. Continued use after
          notification constitutes acceptance of the updated Terms.
        </p>

        <Hr />

        <H2>15. Contact</H2>
        <p style={prose}>For questions about these Terms:</p>
        <div style={{ ...prose, lineHeight: 2 }}>
          <div><span style={{ color: '#555' }}>Email</span>{'  '}<a href="mailto:legal@gate402.dev" style={inlineLink}>legal@gate402.dev</a></div>
          <div><span style={{ color: '#555' }}>Website</span>{'  '}<ExternalLink href="https://gate402.dev">gate402.dev</ExternalLink></div>
        </div>

      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #1a1a1a',
        padding: '24px',
        display: 'flex',
        justifyContent: 'center',
        gap: 24,
      }}>
        {[
          { label: 'Home', href: '/' },
          { label: 'Docs', href: '/docs' },
          { label: 'Privacy', href: '/privacy' },
          { label: 'GitHub', href: 'https://github.com/joaopco8/gate402_' },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            style={{ color: '#444', textDecoration: 'none', fontSize: 13, transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#888')}
            onMouseLeave={e => (e.currentTarget.style.color = '#444')}
          >
            {label}
          </a>
        ))}
      </footer>

    </div>
  )
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const prose: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.75,
  color: '#999',
  marginBottom: 16,
}

const inlineLink: React.CSSProperties = {
  color: '#7c6aff',
  textDecoration: 'none',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Hr() {
  return <div style={{ borderTop: '1px solid #1a1a1a', margin: '40px 0' }} />
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 16, marginTop: 0, letterSpacing: '-0.01em' }}>
      {children}
    </h2>
  )
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 10, marginTop: 24, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {children}
    </h3>
  )
}

function Ul({ items, bold, small }: { items: string[]; bold?: boolean; small?: boolean }) {
  return (
    <ul style={{ paddingLeft: 20, marginBottom: 16, marginTop: 0 }}>
      {items.map((item, i) => {
        const [first, ...rest] = item.split(' — ')
        return (
          <li key={i} style={{ fontSize: small ? 13 : 14, lineHeight: 1.75, color: small ? '#666' : '#999', marginBottom: 6 }}>
            {bold && rest.length > 0
              ? <><span style={{ color: '#ccc', fontWeight: 600 }}>{first}</span>{' — '}{rest.join(' — ')}</>
              : item
            }
          </li>
        )
      })}
    </ul>
  )
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: '#7c6aff', textDecoration: 'none' }}
      onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
      onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
    >
      {children}
    </a>
  )
}

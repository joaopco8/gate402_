'use client'

export default function PrivacyPage() {
  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh', fontFamily: 'monospace', color: '#ccc' }}>

      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#0A0A0A',
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
          Privacy Policy
        </h1>
        <p style={{ color: '#555', fontSize: 13, marginBottom: 48, fontStyle: 'italic' }}>
          Last updated: May 2026
        </p>

        <p style={prose}>
          Gate402 ("we", "our", or "us") operates gate402.dev and api.gate402.dev.
          This Privacy Policy explains what information we collect, how we use it,
          and what rights you have regarding your data.
        </p>

        <Hr />

        <H2>1. Information We Collect</H2>

        <H3>Account Information</H3>
        <p style={prose}>When you sign in with GitHub OAuth, we receive and store:</p>
        <Ul items={[
          'Your GitHub username and email address',
          'Your GitHub profile ID (used as your unique identifier)',
          'Your profile avatar URL (for display purposes only)',
        ]} />
        <p style={prose}>We do not receive your GitHub password or private repositories.</p>

        <H3>API Usage Data</H3>
        <p style={prose}>When you use Gate402 to monetize your API, we store:</p>
        <Ul items={[
          'API call logs: timestamp, endpoint path, amount paid, payer wallet address, transaction hash',
          'These logs are used to power your real-time dashboard and revenue analytics',
          'Logs are stored indefinitely unless you request deletion',
        ]} />

        <H3>Payment Information</H3>
        <p style={prose}>
          Gate402 does not process or store credit card information directly.
          All subscription billing for the Pro plan is handled by Stripe.
          For on-chain USDC payments, we store only the public Solana transaction hash —
          we never have access to any private keys.
        </p>

        <H3>Solana Wallet Addresses</H3>
        <p style={prose}>
          When you configure a receiving wallet, we store your public Solana wallet address.
          This is a public blockchain address — not sensitive information. We use it to verify
          that payments were sent to the correct destination.
        </p>

        <H3>Technical Data</H3>
        <p style={prose}>We may collect standard server logs including:</p>
        <Ul items={[
          'IP addresses (for rate limiting and security)',
          'Browser user agent strings',
          'Request timestamps and response codes',
        ]} />

        <Hr />

        <H2>2. How We Use Your Information</H2>
        <p style={prose}>We use the information we collect to:</p>
        <Ul items={[
          'Provide and operate the Gate402 dashboard and API',
          'Verify on-chain payments on the Solana blockchain',
          'Send payment alert emails when you receive USDC (if enabled)',
          'Deliver webhook events to your configured URL',
          'Detect and prevent abuse and fraud',
          'Improve our service and fix bugs',
        ]} />

        <Hr />

        <H2>3. Data Sharing</H2>
        <p style={prose}>We do not sell your personal data. We share data only with:</p>

        <p style={prose}>
          <span style={{ color: '#fff', fontWeight: 600 }}>Supabase</span> — Database and authentication provider. Your account data and
          API call logs are stored in Supabase-managed PostgreSQL databases.{' '}
          <ExternalLink href="https://supabase.com/privacy">supabase.com/privacy</ExternalLink>
        </p>
        <p style={prose}>
          <span style={{ color: '#fff', fontWeight: 600 }}>Stripe</span> — Payment processor for Pro plan subscriptions. When you subscribe,
          Stripe processes your card and stores billing data per their privacy policy.{' '}
          <ExternalLink href="https://stripe.com/privacy">stripe.com/privacy</ExternalLink>
        </p>
        <p style={prose}>
          <span style={{ color: '#fff', fontWeight: 600 }}>Resend</span> — Email delivery service used to send payment alert emails.{' '}
          <ExternalLink href="https://resend.com/legal/privacy-policy">resend.com/legal/privacy-policy</ExternalLink>
        </p>
        <p style={prose}>
          <span style={{ color: '#fff', fontWeight: 600 }}>Railway</span> — Cloud hosting provider for our API server.{' '}
          <ExternalLink href="https://railway.app/legal/privacy">railway.app/legal/privacy</ExternalLink>
        </p>
        <p style={prose}>
          <span style={{ color: '#fff', fontWeight: 600 }}>Vercel</span> — Cloud hosting provider for our dashboard.{' '}
          <ExternalLink href="https://vercel.com/legal/privacy-policy">vercel.com/legal/privacy-policy</ExternalLink>
        </p>
        <p style={prose}>
          We do not share your data with any other third parties for advertising or marketing purposes.
        </p>

        <Hr />

        <H2>4. Blockchain Data</H2>
        <p style={prose}>
          Solana blockchain transactions are public and permanent. When a payment is made
          to your wallet address, the transaction is permanently recorded on the Solana
          blockchain and is publicly visible to anyone. This is inherent to how blockchain
          technology works and is outside our control.
        </p>

        <Hr />

        <H2>5. Data Retention</H2>
        <Ul items={[
          'Account data: retained while your account is active',
          'API call logs: retained indefinitely for analytics; delete-on-request available',
          'Email logs: not retained (Resend does not store email content)',
          'Stripe billing data: retained per Stripe\'s policy (typically 7 years for tax purposes)',
        ]} />

        <Hr />

        <H2>6. Your Rights</H2>
        <p style={prose}>Depending on your location, you may have the right to:</p>
        <Ul items={[
          'Access — the personal data we hold about you',
          'Delete — your account and associated data',
          'Export — your API call logs in CSV format (available in the dashboard)',
          'Correct — inaccurate personal data',
          'Object — to specific processing of your data',
        ]} bold />
        <p style={prose}>
          To exercise any of these rights, email us at:{' '}
          <a href="mailto:privacy@gate402.dev" style={{ color: '#7c6aff', textDecoration: 'none' }}>
            privacy@gate402.dev
          </a>
        </p>

        <Hr />

        <H2>7. Security</H2>
        <p style={prose}>We implement standard security practices including:</p>
        <Ul items={[
          'HTTPS encryption for all data in transit (enforced by Cloudflare)',
          'Row-level security in our database (Supabase RLS)',
          'No storage of private keys or payment credentials',
          'API keys are randomly generated UUIDs that you can rotate at any time',
        ]} />

        <Hr />

        <H2>8. Cookies</H2>
        <p style={prose}>Gate402 uses minimal cookies:</p>
        <Ul items={[
          'Session cookie — required for authentication after GitHub login',
          'Preference cookies — none currently',
        ]} bold />
        <p style={prose}>We do not use advertising or tracking cookies.</p>

        <Hr />

        <H2>9. Children</H2>
        <p style={prose}>
          Gate402 is not directed at children under 13. We do not knowingly collect
          personal information from children under 13. If you believe we have collected
          such information, contact us immediately at{' '}
          <a href="mailto:privacy@gate402.dev" style={{ color: '#7c6aff', textDecoration: 'none' }}>
            privacy@gate402.dev
          </a>.
        </p>

        <Hr />

        <H2>10. Changes to This Policy</H2>
        <p style={prose}>
          We may update this Privacy Policy from time to time. We will notify you of
          significant changes by updating the "Last updated" date at the top of this page.
          Continued use of Gate402 after changes constitutes acceptance of the updated policy.
        </p>

        <Hr />

        <H2>11. Contact</H2>
        <p style={prose}>For privacy questions or to exercise your rights:</p>
        <div style={{ ...prose, lineHeight: 2 }}>
          <div><span style={{ color: '#555' }}>Email</span>{'  '}<a href="mailto:privacy@gate402.dev" style={{ color: '#7c6aff', textDecoration: 'none' }}>privacy@gate402.dev</a></div>
          <div><span style={{ color: '#555' }}>Website</span>{'  '}<ExternalLink href="https://gate402.dev">gate402.dev</ExternalLink></div>
          <div><span style={{ color: '#555' }}>GitHub</span>{'  '}<ExternalLink href="https://github.com/joaopco8/gate402_">github.com/joaopco8/gate402_</ExternalLink></div>
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
          { label: 'Terms', href: '/terms' },
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

function Ul({ items, bold }: { items: string[]; bold?: boolean }) {
  return (
    <ul style={{ paddingLeft: 20, marginBottom: 16, marginTop: 0 }}>
      {items.map((item, i) => {
        const [first, ...rest] = item.split(' — ')
        return (
          <li key={i} style={{ ...prose, marginBottom: 6 }}>
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

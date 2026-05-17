'use client'

export function ProBanner({ isPro }: { isPro: boolean }) {
  if (isPro) return null

  return (
    <div style={{
      background: '#161616',
      border: '1px solid #222',
      borderRadius: 8,
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
      gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          fontFamily: 'var(--font-code)', fontSize: 10,
          color: '#555', letterSpacing: '0.1em',
          background: '#1a1a1a',
          border: '1px solid #222',
          borderRadius: 3, padding: '2px 8px',
          whiteSpace: 'nowrap',
        }}>FREE PLAN</span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Upgrade to unlock analytics, CSV export, wallet management, and unlimited endpoints.
        </span>
      </div>
      <a href="/billing" style={{
        flexShrink: 0,
        padding: '7px 16px',
        background: 'var(--green)',
        color: '#000', borderRadius: 6,
        fontSize: 12, fontWeight: 500,
        textDecoration: 'none',
        fontFamily: 'var(--font-display)',
        whiteSpace: 'nowrap',
      }}>
        Upgrade — $99/mo
      </a>
    </div>
  )
}

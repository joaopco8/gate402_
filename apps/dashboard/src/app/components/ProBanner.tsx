'use client'

export function ProBanner({ isPro }: { isPro: boolean }) {
  if (isPro) return null

  return (
    <div style={{
      background: '#161616',
      border: '1px solid #222',
      borderRadius: 6,
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
      gap: 16,
    }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        Upgrade to unlock analytics, CSV export, wallet management, and unlimited endpoints.
      </span>
      <a href="/billing" style={{
        flexShrink: 0,
        padding: '7px 16px',
        background: '#006239',
        border: '0.5px solid #128353',
        color: '#fff', borderRadius: 6,
        fontSize: 12, fontWeight: 500,
        textDecoration: 'none',
        fontFamily: 'var(--font-display)',
        whiteSpace: 'nowrap',
      }}>
        Upgrade to Pro
      </a>
    </div>
  )
}

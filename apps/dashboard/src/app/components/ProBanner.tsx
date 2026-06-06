'use client'

export function ProBanner({ isPro, loading }: { isPro: boolean; loading?: boolean }) {
  if (loading || isPro) return null

  return (
    <div style={{
      background: '#1F221F',
      border: '1px solid #2A2E2A',
      borderRadius: 0,
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
      gap: 16,
    }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-label)' }}>
        Upgrade to unlock analytics, CSV export, wallet management, and unlimited endpoints.
      </span>
      <a href="/billing" style={{
        flexShrink: 0,
        padding: '7px 16px',
        background: 'rgba(122,242,121,0.08)',
        border: '1px solid rgba(122,242,121,0.25)',
        color: '#7AF279', borderRadius: 0,
        fontSize: 12, fontWeight: 500,
        textDecoration: 'none',
        fontFamily: 'var(--font-label)',
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
      }}>
        Upgrade to Pro
      </a>
    </div>
  )
}

'use client'

export function ProBanner({ isPro }: { isPro: boolean }) {
  if (isPro) return null

  return (
    <div style={{
      background: 'rgba(153,69,255,0.05)',
      border: '1px solid rgba(153,69,255,0.15)',
      borderRadius: 8,
      padding: '14px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
      gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          fontFamily: 'monospace', fontSize: 10,
          color: '#9945FF', letterSpacing: '0.1em',
          background: 'rgba(153,69,255,0.1)',
          border: '1px solid rgba(153,69,255,0.2)',
          borderRadius: 3, padding: '2px 8px',
        }}>FREE PLAN</span>
        <span style={{ fontSize: 13, color: '#666' }}>
          You are on the free plan. Upgrade to unlock advanced analytics, CSV export, wallet management, and unlimited endpoints.
        </span>
      </div>
      <a href="/billing" style={{
        flexShrink: 0,
        padding: '7px 16px',
        background: '#9945FF',
        color: '#fff', borderRadius: 6,
        fontSize: 12, fontWeight: 500,
        textDecoration: 'none',
        fontFamily: 'sans-serif',
        whiteSpace: 'nowrap',
      }}>
        Upgrade — $99/mo
      </a>
    </div>
  )
}

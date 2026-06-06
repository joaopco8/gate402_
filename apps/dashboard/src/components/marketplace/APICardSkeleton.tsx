'use client'

const LINE = '1px solid #2A2E2A'

const shimmer: React.CSSProperties = {
  background: 'linear-gradient(90deg, #222522 25%, #2A2E2A 50%, #222522 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
  borderRadius: 4,
}

export function APICardSkeleton() {
  return (
    <div style={{ background: '#1B1E1B', borderTop: '2px solid #2A2E2A', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px 24px 16px' }}>
        <div style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
          <div style={{ ...shimmer, width: 48, height: 48, borderRadius: 12, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ ...shimmer, height: 14, width: '60%', marginBottom: 8 }} />
            <div style={{ ...shimmer, height: 10, width: '30%' }} />
          </div>
        </div>
        <div style={{ ...shimmer, height: 10, width: '90%', marginBottom: 6 }} />
        <div style={{ ...shimmer, height: 10, width: '70%' }} />
      </div>
      <div style={{ borderTop: LINE, borderBottom: LINE, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ padding: '10px 16px', borderRight: i < 2 ? LINE : 'none' }}>
            <div style={{ ...shimmer, height: 8, width: '40%', margin: '0 auto 4px' }} />
            <div style={{ ...shimmer, height: 12, width: '60%', margin: '0 auto' }} />
          </div>
        ))}
      </div>
      <div style={{ padding: '12px 16px', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <div style={{ ...shimmer, height: 28, width: 60, borderRadius: 6 }} />
        <div style={{ ...shimmer, height: 28, width: 60, borderRadius: 6 }} />
      </div>
    </div>
  )
}

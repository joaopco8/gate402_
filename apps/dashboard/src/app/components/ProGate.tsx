'use client'

interface ProGateProps {
  isPro: boolean
  feature: string
  children: React.ReactNode
}

export function ProGate({ isPro, feature, children }: ProGateProps) {
  if (isPro) return <>{children}</>

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        filter: 'blur(4px)',
        pointerEvents: 'none',
        userSelect: 'none',
        opacity: 0.4,
      }}>
        {children}
      </div>

      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(13,13,13,0.75)',
        borderRadius: 8,
        backdropFilter: 'blur(2px)',
        gap: 10,
      }}>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#fff',
          textAlign: 'center',
        }}>{feature}</div>

        <div style={{
          fontSize: 12,
          color: '#555',
          textAlign: 'center',
          maxWidth: 200,
        }}>Available on the Pro plan</div>

        <a
          href="/billing"
          style={{
            marginTop: 4,
            padding: '8px 20px',
            background: '#00bc7d',
            color: '#000',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            textDecoration: 'none',
            fontFamily: 'var(--font-display)',
          }}
        >
          Upgrade to Pro
        </a>
      </div>
    </div>
  )
}

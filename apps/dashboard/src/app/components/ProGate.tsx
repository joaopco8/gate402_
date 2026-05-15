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
        background: 'rgba(0,0,0,0.6)',
        borderRadius: 8,
        backdropFilter: 'blur(2px)',
        gap: 12,
      }}>
        <div style={{
          fontFamily: 'monospace',
          fontSize: 10,
          color: '#9945FF',
          letterSpacing: '0.12em',
          background: 'rgba(153,69,255,0.1)',
          border: '1px solid rgba(153,69,255,0.2)',
          borderRadius: 4,
          padding: '3px 10px',
        }}>PRO</div>

        <div style={{
          fontSize: 14,
          fontWeight: 600,
          color: '#fff',
          textAlign: 'center',
        }}>{feature}</div>

        <div style={{
          fontSize: 12,
          color: '#666',
          textAlign: 'center',
          maxWidth: 200,
        }}>Available on the Pro plan</div>

        <a
          href="/billing"
          style={{
            marginTop: 4,
            padding: '8px 20px',
            background: '#9945FF',
            color: '#fff',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            textDecoration: 'none',
            fontFamily: 'sans-serif',
          }}
        >
          Upgrade to Pro — $99/mo
        </a>
      </div>
    </div>
  )
}

'use client'

interface ProGateProps {
  isPro: boolean
  feature: string
  children: React.ReactNode
}

export function ProGate({ isPro, feature, children }: ProGateProps) {
  if (isPro) return <>{children}</>

  return (
    <a
      href="/billing"
      title={`${feature} — Pro plan`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 14px',
        background: 'rgba(122,242,121,0.06)',
        border: '1px solid rgba(122,242,121,0.2)',
        color: '#7AF279',
        fontSize: 12,
        fontWeight: 500,
        fontFamily: 'var(--font-label)',
        textTransform: 'uppercase',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
      }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      {feature}
    </a>
  )
}

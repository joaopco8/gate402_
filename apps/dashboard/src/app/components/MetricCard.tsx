interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  positive?: boolean
}

export default function MetricCard({ title, value, subtitle, positive }: MetricCardProps) {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '20px 24px',
      transition: 'border-color 150ms ease',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{
        fontSize: 12,
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-code)',
        fontWeight: 500,
        marginBottom: 12,
      }}>
        {title}
      </div>
      <div style={{
        fontSize: 28,
        fontWeight: 300,
        color: positive ? 'var(--green)' : 'var(--text-primary)',
        letterSpacing: '-0.02em',
        fontFamily: 'var(--font-display)',
        lineHeight: 1,
        marginBottom: 8,
      }}>
        {value}
      </div>
      {subtitle && (
        <div style={{
          fontSize: 12,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-code)',
        }}>
          {subtitle}
        </div>
      )}
    </div>
  )
}

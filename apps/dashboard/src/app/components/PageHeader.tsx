interface PageHeaderProps {
  eyebrow: string
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export default function PageHeader({ eyebrow, title, subtitle, action }: PageHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 40,
      paddingBottom: 32,
      borderBottom: '1px solid var(--border)',
    }}>
      <div>
        <div style={{
          fontSize: 12,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-code)',
          fontWeight: 500,
          marginBottom: 8,
        }}>
          {eyebrow}
        </div>
        <h1 style={{
          fontSize: 28,
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.42px',
          lineHeight: 1.1,
          marginBottom: subtitle ? 8 : 0,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginTop: 6,
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0, marginTop: 4 }}>{action}</div>}
    </div>
  )
}

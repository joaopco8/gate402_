interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  /** @deprecated Use title only */
  eyebrow?: string
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 'var(--space-8)',
    }}>
      <div>
        <h1 style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.3px',
          lineHeight: 1.2,
          marginBottom: subtitle ? 4 : 0,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)',
            marginTop: 4,
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}

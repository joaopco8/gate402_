type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'pro'

export function Badge({
  children,
  variant = 'default'
}: {
  children: React.ReactNode
  variant?: BadgeVariant
}) {
  const styles: Record<BadgeVariant, React.CSSProperties> = {
    default: { color: 'var(--text-muted)', background: 'var(--bg-overlay)', border: '1px solid var(--border-default)' },
    success: { color: 'var(--success)', background: 'var(--success-bg)', border: '1px solid var(--success-border)' },
    warning: { color: 'var(--warning)', background: 'var(--warning-bg)', border: '1px solid var(--warning-border)' },
    error:   { color: 'var(--error)',   background: 'var(--error-bg)',   border: '1px solid var(--error-border)' },
    pro:     { color: 'var(--brand-primary)', background: 'var(--brand-muted)', border: '1px solid var(--brand-border)' },
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: 'var(--radius-sm)',
      fontSize: 'var(--text-xs)',
      fontWeight: 500,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      fontFamily: 'var(--font-mono)',
      ...styles[variant],
    }}>
      {children}
    </span>
  )
}

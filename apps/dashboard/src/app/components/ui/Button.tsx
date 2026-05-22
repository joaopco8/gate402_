type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

export function Button({
  children,
  variant = 'primary',
  disabled,
  onClick,
  style,
  type = 'button',
}: {
  children: React.ReactNode
  variant?: ButtonVariant
  disabled?: boolean
  onClick?: () => void
  style?: React.CSSProperties
  type?: 'button' | 'submit'
}) {
  const styles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      background: 'var(--brand-bg)',
      border: '1px solid var(--brand-border)',
      color: 'var(--brand-primary)',
    },
    secondary: {
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      color: 'var(--text-secondary)',
    },
    ghost: {
      background: 'transparent',
      border: '1px solid transparent',
      color: 'var(--text-secondary)',
    },
    danger: {
      background: 'var(--error-bg)',
      border: '1px solid var(--error-border)',
      color: 'var(--error)',
    },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 14px',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--text-sm)',
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.15s',
        ...styles[variant],
        ...style,
      }}
    >
      {children}
    </button>
  )
}

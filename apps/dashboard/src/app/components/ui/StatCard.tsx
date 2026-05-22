export function StatCard({
  label,
  value,
  sub,
  loading,
}: {
  label: string
  value: string
  sub?: string
  loading?: boolean
}) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-5) var(--space-6)',
    }}>
      <div style={{
        fontSize: 'var(--text-xs)',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-muted)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 8,
      }}>
        {label}
      </div>

      {loading ? (
        <div style={{
          height: 28,
          width: 120,
          background: 'var(--bg-overlay)',
          borderRadius: 6,
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      ) : (
        <div style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.4px',
          marginBottom: sub ? 4 : 0,
        }}>
          {value}
        </div>
      )}

      {sub && (
        <div style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--text-muted)',
        }}>
          {sub}
        </div>
      )}
    </div>
  )
}

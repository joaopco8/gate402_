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
      borderRadius: 0,
      padding: 'var(--space-5) var(--space-6)',
    }}>
      <div style={{
        fontSize: 12,
        fontFamily: 'var(--font-label)',
        color: 'var(--text-secondary)',
        fontWeight: 500,
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
          borderRadius: 0,
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      ) : (
        <div style={{
          fontSize: 'var(--text-2xl)',
          fontFamily: 'var(--font-label)',
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
          fontFamily: 'var(--font-label)',
          color: 'var(--text-muted)',
        }}>
          {sub}
        </div>
      )}
    </div>
  )
}

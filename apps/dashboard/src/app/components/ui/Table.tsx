export function Table({
  headers,
  rows,
  empty,
}: {
  headers: string[]
  rows: React.ReactNode[][]
  empty?: string
}) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${headers.length}, 1fr)`,
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-default)',
        background: 'var(--bg-base)',
      }}>
        {headers.map(h => (
          <span key={h} style={{
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            {h}
          </span>
        ))}
      </div>

      {rows.length === 0 ? (
        <div style={{
          padding: '40px 16px',
          textAlign: 'center',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
        }}>
          {empty || 'No data yet'}
        </div>
      ) : (
        rows.map((row, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${headers.length}, 1fr)`,
            padding: '10px 16px',
            borderBottom: i < rows.length - 1
              ? '1px solid var(--border-default)'
              : 'none',
            alignItems: 'center',
          }}>
            {row.map((cell, j) => (
              <div key={j} style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-primary)',
              }}>
                {cell}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}

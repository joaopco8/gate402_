'use client'

interface SpendingProgressProps {
  label: string
  spent: number
  limit: number
  unit?: string
}

export function SpendingProgress({ label, spent, limit, unit = 'USDC' }: SpendingProgressProps) {
  const percent = Math.min((spent / limit) * 100, 100)
  const barColor = percent >= 90 ? '#ef4444' : percent >= 70 ? '#eab308' : '#7AF279'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-label)' }}>
          {label}
        </span>
        <span style={{ fontSize: 12, color: '#7A8C79', fontFamily: 'var(--font-label)' }}>
          ${spent.toFixed(4)} / ${limit} {unit}
        </span>
      </div>
      <div style={{ height: 6, width: '100%', background: '#2A2E2A', borderRadius: 9999, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${percent}%`,
          background: barColor,
          borderRadius: 9999,
          transition: 'width 500ms ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 12, fontFamily: 'var(--font-label)', color: percent >= 90 ? '#f87171' : percent >= 70 ? '#facc15' : '#4A5549' }}>
          {percent.toFixed(0)}% used
        </span>
      </div>
    </div>
  )
}

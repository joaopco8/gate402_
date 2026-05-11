'use client'

export interface PaymentRow {
  endpoint: string
  amount: string
  wallet: string
  time: string
  status: 'confirmed' | 'pending'
}

interface ContributorsTableProps {
  rows: PaymentRow[]
}

export function ContributorsTable({ rows }: ContributorsTableProps) {
  const cols = ['Endpoint', 'Amount', 'Wallet', 'Time', 'Status']

  return (
    <div
      style={{
        background: '#0d0d0d',
        border: '1px solid #1a1a1a',
        borderRadius: 8,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.2fr 1.8fr 1.2fr 1fr',
          borderBottom: '1px solid #1a1a1a',
          padding: '0 24px',
        }}
      >
        {cols.map(col => (
          <div
            key={col}
            style={{
              padding: '12px 0',
              fontSize: 11,
              fontFamily: 'var(--font-code)',
              color: '#333',
              letterSpacing: '0.08em',
            }}
          >
            {col.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Rows */}
      {rows.map((row, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.2fr 1.8fr 1.2fr 1fr',
            padding: '0 24px',
            borderBottom: i < rows.length - 1 ? '1px solid #1a1a1a' : 'none',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#111')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {/* Endpoint */}
          <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                fontFamily: 'var(--font-code)',
                fontSize: 13,
                color: '#00ff88',
              }}
            >
              {row.endpoint}
            </span>
          </div>

          {/* Amount */}
          <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                fontFamily: 'var(--font-code)',
                fontSize: 13,
                color: '#fff',
              }}
            >
              {row.amount}
            </span>
          </div>

          {/* Wallet */}
          <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                fontFamily: 'var(--font-code)',
                fontSize: 12,
                color: '#555',
              }}
            >
              {row.wallet}
            </span>
          </div>

          {/* Time */}
          <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 13,
                color: '#555',
              }}
            >
              {row.time}
            </span>
          </div>

          {/* Status */}
          <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(0,255,136,0.08)',
                border: '1px solid rgba(0,255,136,0.2)',
                borderRadius: 100,
                padding: '2px 10px',
                fontSize: 11,
                fontFamily: 'var(--font-code)',
                color: '#00ff88',
                letterSpacing: '0.04em',
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: '#00ff88',
                  display: 'inline-block',
                  animation: 'liveBlink 2s ease-in-out infinite',
                }}
              />
              {row.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

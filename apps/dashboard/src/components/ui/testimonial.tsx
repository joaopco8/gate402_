'use client'

export interface TestimonialData {
  name: string
  role: string
  initials: string
  avatarColor: string
  text: string
}

interface TestimonialCardProps {
  data: TestimonialData
  style?: React.CSSProperties
}

export function TestimonialCard({ data, style }: TestimonialCardProps) {
  return (
    <div
      style={{
        background: '#0d0d0d',
        border: '1px solid #1a1a1a',
        borderRadius: 8,
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        transition: 'border-color 0.2s ease',
        ...style,
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#1a1a1a')}
    >
      {/* Quote mark */}
      <div
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: 40,
          color: '#1a1a1a',
          lineHeight: 1,
          marginBottom: -12,
          userSelect: 'none',
        }}
      >
        &ldquo;
      </div>

      {/* Text */}
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 15,
          color: '#888',
          lineHeight: 1.7,
          flex: 1,
        }}
      >
        {data.text}
      </p>

      {/* Author */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: data.avatarColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontFamily: 'var(--font-code)',
            fontWeight: 600,
            color: '#000',
            flexShrink: 0,
          }}
        >
          {data.initials}
        </div>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 14,
              fontWeight: 500,
              color: '#fff',
              lineHeight: 1.2,
            }}
          >
            {data.name}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 12,
              color: '#555',
              marginTop: 2,
            }}
          >
            {data.role}
          </div>
        </div>
      </div>
    </div>
  )
}

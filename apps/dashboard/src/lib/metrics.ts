export type ChangeResult = {
  value: number | null
  direction: 'up' | 'down' | 'neutral' | 'none'
  label: string
  color: string
}

export function calcChange(current: number, previous: number): ChangeResult {
  if (current === 0 && previous === 0) {
    return { value: null, direction: 'none', label: '—', color: '#555555' }
  }

  if (current > 0 && previous === 0) {
    return { value: null, direction: 'none', label: 'New', color: '#555555' }
  }

  if (current === 0 && previous > 0) {
    return { value: -100, direction: 'down', label: '↓ 100%', color: '#ef4444' }
  }

  const pct = ((current - previous) / previous) * 100
  const rounded = Math.round(pct * 10) / 10

  if (rounded > 0) {
    return { value: rounded, direction: 'up', label: `↑ ${rounded}%`, color: '#3ecf8e' }
  }

  if (rounded < 0) {
    return { value: rounded, direction: 'down', label: `↓ ${Math.abs(rounded)}%`, color: '#ef4444' }
  }

  return { value: 0, direction: 'neutral', label: '→ 0%', color: '#555555' }
}

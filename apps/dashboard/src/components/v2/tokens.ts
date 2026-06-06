export const tokens = {
  colors: {
    black:   '#1B1E1B',
    green:   '#7AF279',
    purple:  '#BC86FF',
    mint:    '#E8F4EE',
    white:   '#FFFFFF',
    surface: {
      1: '#1F221F',
      2: '#242724',
      3: '#2A2E2A',
    },
    border:  '#2A2E2A',
    text: {
      primary:   '#E8F4EE',
      secondary: '#7A8C79',
      muted:     '#4A5549',
    },
    green10:  '#7AF27910',
    green20:  '#7AF27920',
    green30:  '#7AF27930',
    purple10: '#BC86FF10',
    purple20: '#BC86FF20',
    purple30: '#BC86FF30',
  },

  fonts: {
    sans: "'Inter', -apple-system, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },

  fontSizes: {
    xs:   '0.75rem',
    sm:   '0.875rem',
    base: '1rem',
    lg:   '1.25rem',
    xl:   '1.75rem',
    '2xl': '2.5rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },

  fontWeights: {
    light:    300,
    regular:  400,
    medium:   500,
    semibold: 600,
    bold:     700,
  },

  // Títulos usam Inter Light (300)
  // Body usa Inter Regular (400)
  // CTAs usam Inter Medium (500)
  // Labels/badges usam Inter SemiBold (600)

  spacing: {
    1:  '0.25rem',
    2:  '0.5rem',
    3:  '0.75rem',
    4:  '1rem',
    6:  '1.5rem',
    8:  '2rem',
    12: '3rem',
    16: '4rem',
    24: '6rem',
    32: '8rem',
  },

  radii: {
    sm:   '4px',
    md:   '8px',
    lg:   '12px',
    xl:   '16px',
    full: '9999px',
  },

  transitions: {
    fast:   '150ms ease',
    normal: '250ms ease',
    slow:   '400ms ease',
  },
} as const

export type Tokens = typeof tokens

export const theme = {
  colors: {
    brand: {
      primary: '#7B5CF6',
      secondary: '#9B7BFF',
      accent: '#00D4AA',
      danger: '#FF4D6D',
      success: '#06D6A0',
      warning: '#F59E0B',
    },
    dark: {
      bg: '#0e1117',
      surface: '#1a1d2e',
      elevated: '#252840',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
      tertiary: '#64748B',
      inverse: '#0e1117',
    },
    status: {
      online: '#22C55E',
      unread: '#F97316',
    },
    icon: {
      surfaceGreen: '#064E3B',
      surfaceRed: '#7F1D1D',
      surfacePurple: '#4C1D95',
    },
    glass: {
      bg: 'rgba(26, 29, 46, 0.7)',
      bgElevated: 'rgba(37, 40, 64, 0.85)',
      bgInput: 'rgba(26, 29, 46, 0.5)',
      border: 'rgba(255, 255, 255, 0.08)',
      borderDashed: 'rgba(255, 255, 255, 0.15)',
      divider: 'rgba(255, 255, 255, 0.05)',
    },
  },
  gradients: {
    cta: ['#7B5CF6', '#9B7BFF'] as const,
    cover: ['#7B5CF6', '#4C1D95'] as const,
    teal: ['#00D4AA', '#00E5C0'] as const,
  },
  spacing: { xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24, '2xl': 32, '3xl': 48 },
  radii: { card: 16, input: 12, pill: 999, modal: 20, btn: 12, icon: 12 },
  avatar: { sm: 32, md: 40, lg: 80, xl: 120 },
  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
} as const;

export type Theme = typeof theme;

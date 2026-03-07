module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Brand ──────────────────────────────────────────────────────────
        brand: {
          primary: '#7B5CF6',
          secondary: '#9B7BFF',
          accent: '#00D4AA',
          danger: '#FF4D6D',
          success: '#06D6A0',
          warning: '#F59E0B',
        },

        // ── Amount / Financial ─────────────────────────────────────────────
        // Maps to text-amount-positive, text-amount-negative, text-amount-neutral
        amount: {
          positive: '#22C55E',
          negative: '#EF4444',
          neutral: '#94A3B8',
        },

        // ── Backgrounds ────────────────────────────────────────────────────
        dark: {
          bg: '#0F172A',
          surface: '#1a1d2e',
          elevated: '#252840',
          border: 'rgba(255, 255, 255, 0.08)',
          divider: 'rgba(255, 255, 255, 0.05)',
        },

        // ── Text ───────────────────────────────────────────────────────────
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          tertiary: '#64748B',
          muted: '#475569',
          inverse: '#0F172A',
        },

        // ── Status ─────────────────────────────────────────────────────────
        status: {
          online: '#22C55E',
          unread: '#F97316',
        },

        // ── Icon surfaces ──────────────────────────────────────────────────
        icon: {
          'surface-green': '#064E3B',
          'surface-red': '#7F1D1D',
          'surface-purple': '#4C1D95',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'display': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'h1':      ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'h2':      ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'h3':      ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'h4':      ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body':    ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '500', letterSpacing: '0.05em' }],
        'tiny':    ['10px', { lineHeight: '14px', fontWeight: '500' }],
        'amount':  ['16px', { lineHeight: '24px', fontWeight: '600' }],
      },

      borderRadius: {
        'sm':    '6px',
        'md':    '10px',
        'card':  '16px',
        'input': '12px',
        'pill':  '999px',
        'modal': '20px',
        'btn':   '12px',
        'icon':  '12px',
      },

      boxShadow: {
        'glow-sm':     '0 0 12px rgba(123, 92, 246, 0.15)',
        'glow-md':     '0 0 24px rgba(123, 92, 246, 0.20)',
        'glow-lg':     '0 0 40px rgba(123, 92, 246, 0.25)',
        'glow-teal':   '0 0 20px rgba(0, 212, 170, 0.20)',
        'glow-green':  '0 0 16px rgba(34, 197, 94, 0.25)',
        'glow-red':    '0 0 16px rgba(239, 68, 68, 0.20)',
        'card':        '0 4px 16px rgba(0, 0, 0, 0.25)',
        'elevated':    '0 8px 32px rgba(0, 0, 0, 0.40)',
        'fab':         '0 0 24px rgba(123, 92, 246, 0.30)',
      },
    },
  },
  plugins: [],
}

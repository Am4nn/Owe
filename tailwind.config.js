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
          border: 'rgba(255, 255, 255, 0.08)',
          divider: 'rgba(255, 255, 255, 0.05)',
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
        'h1': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'h3': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'h4': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '500', letterSpacing: '0.05em' }],
        'amount': ['16px', { lineHeight: '24px', fontWeight: '600' }],
      },
      borderRadius: {
        'card': '16px',
        'input': '12px',
        'pill': '999px',
        'modal': '20px',
        'btn': '12px',
        'icon': '12px',
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(123, 92, 246, 0.15)',
        'glow-md': '0 0 24px rgba(123, 92, 246, 0.20)',
        'glow-lg': '0 0 40px rgba(123, 92, 246, 0.25)',
        'glow-teal': '0 0 20px rgba(0, 212, 170, 0.20)',
        'glow-green': '0 0 16px rgba(6, 214, 160, 0.25)',
        'card': '0 4px 16px rgba(0, 0, 0, 0.25)',
        'elevated': '0 8px 32px rgba(0, 0, 0, 0.40)',
      },
    },
  },
  plugins: [],
}

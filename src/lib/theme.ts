/**
 * Owe Design System — single source of truth for all design tokens.
 * Mirrors the Stitch design spec (artifacts/stitch_owe_design/CONTEXT.stitch.md).
 *
 * All NativeWind className values and StyleSheet styles should reference
 * these constants. tailwind.config.js extends the same palette so that
 * className and style props stay in sync.
 */

export const theme = {
  colors: {
    // ── Brand ──────────────────────────────────────────────────────────────
    brand: {
      primary: '#7B5CF6',    // Purple accent — CTA, active states, FAB
      secondary: '#9B7BFF',  // Lighter purple — gradients, highlights
      accent: '#00D4AA',     // Teal — secondary actions
      danger: '#FF4D6D',     // Red — destructive actions
      success: '#06D6A0',    // Teal-green — positive status badges
      warning: '#F59E0B',    // Amber — warnings
    },

    // ── Amount / Financial ─────────────────────────────────────────────────
    // Used exclusively for money amounts (ExpenseItem, TransactionRow, AmountText).
    amount: {
      positive: '#22C55E',   // Green  — money coming in / you are owed
      negative: '#EF4444',   // Red   — money going out / you owe
      neutral: '#94A3B8',    // Muted — settled / zero balance
    },

    // ── Backgrounds ────────────────────────────────────────────────────────
    dark: {
      bg: '#0F172A',         // Screen background
      surface: '#1a1d2e',    // Card / bottom-sheet surface
      elevated: '#252840',   // Elevated (modals, popovers)
      border: 'rgba(255, 255, 255, 0.08)',
      divider: 'rgba(255, 255, 255, 0.05)',
    },

    // ── Text ───────────────────────────────────────────────────────────────
    text: {
      primary: '#F8FAFC',    // Main content
      secondary: '#94A3B8',  // Subtitles, captions
      tertiary: '#64748B',   // Placeholders, timestamps
      muted: '#475569',      // Disabled / very low emphasis
      inverse: '#0F172A',    // Text on light backgrounds
    },

    // ── Status ─────────────────────────────────────────────────────────────
    status: {
      online: '#22C55E',
      unread: '#F97316',
    },

    // ── Glass / Frosted ────────────────────────────────────────────────────
    glass: {
      bg: 'rgba(26, 29, 46, 0.7)',
      bgElevated: 'rgba(37, 40, 64, 0.85)',
      bgInput: 'rgba(14, 17, 23, 0.6)',
      border: 'rgba(255, 255, 255, 0.08)',
      borderFocus: 'rgba(123, 92, 246, 0.5)',
      borderDashed: 'rgba(255, 255, 255, 0.15)',
      divider: 'rgba(255, 255, 255, 0.05)',
    },

    // ── Icon surfaces ──────────────────────────────────────────────────────
    icon: {
      surfaceGreen: '#064E3B',
      surfaceRed: '#7F1D1D',
      surfacePurple: '#4C1D95',
    },
  },

  // ── Gradients ──────────────────────────────────────────────────────────────
  gradients: {
    cta: ['#9B7BFF', '#7B5CF6'] as const,      // Primary button / FAB
    cover: ['#7B5CF6', '#4C1D95'] as const,    // Group cover header
    teal: ['#00D4AA', '#00E5C0'] as const,     // Accent / settlement success
    success: ['#22C55E', '#16A34A'] as const,  // Success confirmation screens
  },

  // ── Spacing ────────────────────────────────────────────────────────────────
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
  },

  // ── Border Radius ──────────────────────────────────────────────────────────
  radii: {
    sm: 6,
    md: 10,
    card: 16,
    input: 12,
    modal: 20,
    btn: 12,
    icon: 12,
    pill: 999,
  },

  // ── Avatar sizes ───────────────────────────────────────────────────────────
  avatar: { sm: 32, md: 40, lg: 80, xl: 120 },

  // ── Typography scale ───────────────────────────────────────────────────────
  typography: {
    display: 32,
    h1: 28,
    h2: 24,
    h3: 20,
    h4: 18,
    body: 16,
    bodySm: 14,
    caption: 12,
    tiny: 10,
  },

  // ── Animation ──────────────────────────────────────────────────────────────
  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
} as const;

export type Theme = typeof theme;

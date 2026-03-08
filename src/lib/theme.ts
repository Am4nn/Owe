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

  // ── Box Shadows (CSS box-shadow strings — NativeWind / style.boxShadow) ───
  // Used in GlassCard variants and any component that sets boxShadow directly.
  shadows: {
    // Depth elevation
    sm:          '0 2px 4px rgba(0,0,0,0.35)',
    md:          '0 6px 12px rgba(0,0,0,0.35), 0 12px 24px rgba(0,0,0,0.40)',
    lg:          '0 12px 24px rgba(0,0,0,0.40), 0 24px 48px rgba(0,0,0,0.45)',
    xl:          '0 24px 48px rgba(0,0,0,0.45), 0 48px 96px rgba(0,0,0,0.55)',
    // Semantic surfaces
    card:        '0 0 0 1px rgba(255,255,255,0.04), 0 6px 12px rgba(0,0,0,0.35), 0 16px 32px rgba(0,0,0,0.45), 0 32px 64px rgba(0,0,0,0.55)',
    soft:        '0 10px 25px rgba(0,0,0,0.30), 0 20px 40px rgba(0,0,0,0.40)',
    floating:    '0 14px 28px rgba(0,0,0,0.35), 0 28px 60px rgba(0,0,0,0.45)',
    glass:       '0 8px 32px rgba(0,0,0,0.35)',
    glassStrong: '0 20px 60px rgba(0,0,0,0.45)',
    dramatic:    '0 30px 80px rgba(0,0,0,0.55)',
    deep:        '0 40px 120px rgba(0,0,0,0.65)',
    // Inset depth
    inset:       'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -2px 8px rgba(0,0,0,0.40)',
    insetSoft:   'inset 0 2px 4px rgba(0,0,0,0.35)',
    // Interactive
    hoverLift:   '0 14px 28px rgba(0,0,0,0.40), 0 30px 60px rgba(0,0,0,0.50)',
    hoverSoft:   '0 8px 16px rgba(0,0,0,0.35), 0 18px 36px rgba(0,0,0,0.40)',
    // Neumorphism dark
    neu:         '6px 6px 12px rgba(0,0,0,0.5), -6px -6px 12px rgba(255,255,255,0.03)',
  },

  // ── Glows (CSS box-shadow glow strings) ────────────────────────────────────
  // Pure glow variants: use className="shadow-glow-sm/md/lg/fab" in NativeWind
  // (defined in tailwind.config.js). Use these JS strings when setting
  // style.boxShadow directly or inside non-NativeWind style objects.
  glows: {
    // Brand purple — matches Tailwind shadow-glow-* tokens
    sm:     '0 0 12px rgba(123,92,246,0.15)',   // input focus, subtle icon bg
    md:     '0 0 24px rgba(123,92,246,0.20)',   // moderate brand glow
    lg:     '0 0 40px rgba(123,92,246,0.25)',   // hero icons (EmptyState, StatusScreen)
    fab:    '0 0 24px rgba(123,92,246,0.30)',   // FAB primary button
    // Colour variants — matches Tailwind shadow-glow-teal/green/red
    teal:   '0 0 20px rgba(0,212,170,0.20)',    // brand.accent
    green:  '0 0 16px rgba(34,197,94,0.25)',    // brand.success
    red:    '0 0 16px rgba(239,68,68,0.20)',    // brand.danger
    // Ring + glow (card-style glow with 1px border outline)
    purple: '0 0 0 1px rgba(168,85,247,0.18), 0 0 22px rgba(168,85,247,0.28)',
    blue:   '0 0 0 1px rgba(59,130,246,0.15), 0 0 20px rgba(59,130,246,0.25)',
    cyan:   '0 0 0 1px rgba(34,211,238,0.15), 0 0 20px rgba(34,211,238,0.25)',
    subtle: '0 0 0 1px rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.40)',
  },

  // ── React Native shadow presets ────────────────────────────────────────────
  // Spread these into StyleSheet styles. iOS renders all shadow props natively;
  // Android only renders elevation. For dynamic colours use rnGlow() below.
  rnShadows: {
    // Primary CTA button drop shadow (Button.tsx primary variant)
    ctaButton: {
      shadowColor: '#7B5CF6',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.28,
      shadowRadius: 24,
      elevation: 9,
    },
    // Large hero icon glow (OnboardingSlide brand icon, StatusScreen)
    iconGlowLg: {
      shadowColor: '#7B5CF6',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 40,
      elevation: 12,
    },
    // Subtle icon glow (small icon containers, QR corners)
    iconGlowSm: {
      shadowColor: '#7B5CF6',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 6,
    },
  },
} as const;

export type Theme = typeof theme;

/**
 * rnGlow — dynamic-colour React Native shadow preset.
 *
 * Use when the shadow colour is determined at runtime (e.g. icon colour).
 * Spread the result into a StyleSheet style or inline style prop.
 *
 * @example
 *   style={{ ...rnGlow(iconColor, 40, 0.5, 12) }}
 */
export function rnGlow(
  color: string,
  radius = 16,
  opacity = 0.4,
  elevation = 6,
) {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  }
}

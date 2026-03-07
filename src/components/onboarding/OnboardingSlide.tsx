import { View, Text, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { type LucideIcon } from 'lucide-react-native'
import { theme } from '@/lib/theme'

/**
 * OnboardingSlide
 *
 * A single full-screen slide in the onboarding carousel.
 * Top 60%: gradient background + large icon illustration.
 * Bottom 40%: title + subtitle text content.
 *
 * Used in:
 * - splash_onboarding_owe_new_logo (via OnboardingCarousel)
 *
 * Design:
 * - Full-screen gradient background (purple → dark)
 * - Large centred icon in a glass pill (top section)
 * - Bold title, secondary subtitle (bottom section)
 *
 * Usage:
 *   <OnboardingSlide
 *     icon={Wallet}
 *     iconColor="#7B5CF6"
 *     gradientColors={['#9B7BFF', '#4C1D95']}
 *     title="Split expenses easily"
 *     subtitle="Add an expense in seconds and Owe handles the math for your whole group."
 *   />
 */

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')

export interface OnboardingSlideDef {
  icon: LucideIcon
  iconColor?: string
  gradientColors?: readonly [string, string, ...string[]]
  title: string
  subtitle: string
  /** Optional accent badge text below icon */
  badge?: string
}

export type OnboardingSlideProps = OnboardingSlideDef

export function OnboardingSlide({
  icon: Icon,
  iconColor = theme.colors.brand.primary,
  gradientColors = ['#1a1030', '#0F172A'],
  title,
  subtitle,
  badge,
}: OnboardingSlideProps) {
  const iconBg = `${iconColor}20`

  return (
    <View style={{ width: SCREEN_W, flex: 1, backgroundColor: theme.colors.dark.bg }}>
      {/* Illustration area — top 58% */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={{
          height: SCREEN_H * 0.52,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Decorative rings */}
        <View
          style={{
            position: 'absolute',
            width: 260,
            height: 260,
            borderRadius: 130,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.04)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: 100,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.06)',
          }}
        />

        {/* Icon container */}
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: iconBg,
            borderWidth: 2,
            borderColor: `${iconColor}35`,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: iconColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 40,
            elevation: 12,
          }}
        >
          <Icon size={56} color={iconColor} />
        </View>

        {/* Badge */}
        {badge && (
          <View
            style={{
              marginTop: 20,
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: theme.radii.pill,
              backgroundColor: 'rgba(255,255,255,0.10)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.15)',
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.caption,
                fontWeight: '600',
                color: '#FFFFFF',
                letterSpacing: 0.5,
              }}
            >
              {badge}
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Text content area — bottom */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: theme.spacing['2xl'],
          paddingTop: theme.spacing['2xl'],
          paddingBottom: theme.spacing.base,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: theme.typography.h1,
            fontWeight: '800',
            color: theme.colors.text.primary,
            textAlign: 'center',
            letterSpacing: -0.5,
            lineHeight: 36,
            marginBottom: theme.spacing.base,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: theme.typography.body,
            color: theme.colors.text.secondary,
            textAlign: 'center',
            lineHeight: 24,
            maxWidth: 320,
          }}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  )
}

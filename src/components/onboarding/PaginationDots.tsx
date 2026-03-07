import { View } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { theme } from '@/lib/theme'

/**
 * PaginationDots
 *
 * Animated dot indicators for the onboarding carousel.
 * Active dot expands to a wider pill (24px wide), inactive dots are
 * small circles (8px). Transition is spring-animated.
 *
 * Used in:
 * - splash_onboarding_owe_new_logo (via OnboardingCarousel)
 *
 * Usage:
 *   <PaginationDots count={3} activeIndex={currentSlide} />
 */

export interface PaginationDotsProps {
  count: number
  activeIndex: number
  activeColor?: string
  inactiveColor?: string
  dotSize?: number
  activeDotWidth?: number
}

function Dot({
  isActive,
  activeColor,
  inactiveColor,
  dotSize,
  activeDotWidth,
}: {
  isActive: boolean
  activeColor: string
  inactiveColor: string
  dotSize: number
  activeDotWidth: number
}) {
  const animStyle = useAnimatedStyle(() => ({
    width: withSpring(isActive ? activeDotWidth : dotSize, { damping: 18, stiffness: 200 }),
    opacity: withSpring(isActive ? 1 : 0.35, { damping: 18, stiffness: 200 }),
  }))

  return (
    <Animated.View
      style={[
        animStyle,
        {
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: isActive ? activeColor : inactiveColor,
        },
      ]}
    />
  )
}

export function PaginationDots({
  count,
  activeIndex,
  activeColor = theme.colors.brand.primary,
  inactiveColor = theme.colors.brand.primary,
  dotSize = 8,
  activeDotWidth = 24,
}: PaginationDotsProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Dot
          key={i}
          isActive={i === activeIndex}
          activeColor={activeColor}
          inactiveColor={inactiveColor}
          dotSize={dotSize}
          activeDotWidth={activeDotWidth}
        />
      ))}
    </View>
  )
}

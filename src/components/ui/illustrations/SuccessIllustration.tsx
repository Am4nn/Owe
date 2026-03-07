import { useEffect } from 'react'
import { View } from 'react-native'
import Svg, { Circle, Polyline, Defs, LinearGradient, Stop } from 'react-native-svg'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
} from 'react-native-reanimated'
import { theme } from '@/lib/theme'

/**
 * SuccessIllustration
 *
 * Animated SVG illustration used on success confirmation screens.
 * Shows a large green circle with a checkmark, surrounded by pulsing
 * ring animations.
 *
 * Used in:
 * - expense_added_success
 * - settlement_success_strict_dark
 *
 * Usage:
 *   <SuccessIllustration />
 *   <SuccessIllustration size={120} color="#22C55E" />
 */

export interface SuccessIllustrationProps {
  size?: number
  color?: string
}

export function SuccessIllustration({
  size = 140,
  color = theme.colors.brand.success,
}: SuccessIllustrationProps) {
  const scale = useSharedValue(0)
  const ring1Opacity = useSharedValue(0)
  const ring1Scale = useSharedValue(0.6)
  const ring2Opacity = useSharedValue(0)
  const ring2Scale = useSharedValue(0.6)

  useEffect(() => {
    // Pop in
    scale.value = withSpring(1, { damping: 12, stiffness: 160 })
    // Ring pulses
    ring1Opacity.value = withDelay(200, withSequence(
      withTiming(0.4, { duration: 400 }),
      withTiming(0, { duration: 500 }),
    ))
    ring1Scale.value = withDelay(200, withSpring(1.4, { damping: 15, stiffness: 80 }))
    ring2Opacity.value = withDelay(400, withSequence(
      withTiming(0.25, { duration: 400 }),
      withTiming(0, { duration: 500 }),
    ))
    ring2Scale.value = withDelay(400, withSpring(1.8, { damping: 15, stiffness: 60 }))
  }, [])

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const ring1Style = useAnimatedStyle(() => ({
    opacity: ring1Opacity.value,
    transform: [{ scale: ring1Scale.value }],
  }))

  const ring2Style = useAnimatedStyle(() => ({
    opacity: ring2Opacity.value,
    transform: [{ scale: ring2Scale.value }],
  }))

  const r = size / 2

  return (
    <View style={{ width: size * 2, height: size * 2, alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer ring 2 */}
      <Animated.View
        style={[
          ring2Style,
          {
            position: 'absolute',
            width: size * 1.9,
            height: size * 1.9,
            borderRadius: size,
            borderWidth: 1.5,
            borderColor: color,
          },
        ]}
      />
      {/* Outer ring 1 */}
      <Animated.View
        style={[
          ring1Style,
          {
            position: 'absolute',
            width: size * 1.45,
            height: size * 1.45,
            borderRadius: size,
            borderWidth: 2,
            borderColor: color,
          },
        ]}
      />

      {/* Main circle + checkmark */}
      <Animated.View style={containerStyle}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <LinearGradient id="successGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#22C55E" stopOpacity="1" />
              <Stop offset="1" stopColor="#16A34A" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          {/* Background circle */}
          <Circle cx={r} cy={r} r={r - 2} fill="url(#successGrad)" />
          {/* White glow ring */}
          <Circle
            cx={r}
            cy={r}
            r={r - 2}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="4"
          />
          {/* Checkmark */}
          <Polyline
            points={`${r * 0.35},${r} ${r * 0.65},${r + r * 0.28} ${r * 1.35},${r - r * 0.32}`}
            fill="none"
            stroke="white"
            strokeWidth={size * 0.07}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>
    </View>
  )
}

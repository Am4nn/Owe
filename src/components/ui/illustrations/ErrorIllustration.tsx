import { View } from 'react-native'
import Svg, { Circle, Line, Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg'
import { theme } from '@/lib/theme'

/**
 * ErrorIllustration
 *
 * SVG illustration used on error screens (404, general errors).
 * Shows a broken chain / "404" motif in purple and red tones.
 *
 * Used in:
 * - general_error_404
 *
 * Usage:
 *   <ErrorIllustration />
 *   <ErrorIllustration size={160} />
 */

export interface ErrorIllustrationProps {
  size?: number
}

export function ErrorIllustration({ size = 160 }: ErrorIllustrationProps) {
  const cx = size / 2
  const cy = size / 2

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="errCircle" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#4C1D95" stopOpacity="1" />
            <Stop offset="1" stopColor="#1a1d2e" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="errAccent" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FF4D6D" stopOpacity="1" />
            <Stop offset="1" stopColor="#C41340" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Background circle */}
        <Circle cx={cx} cy={cy} r={cx - 4} fill="url(#errCircle)" />
        {/* Subtle ring */}
        <Circle cx={cx} cy={cy} r={cx - 4} fill="none" stroke="rgba(255,77,109,0.15)" strokeWidth="2" />

        {/* Broken link left half */}
        <Path
          d={`M ${cx - 38} ${cy - 12}
              a 18 18 0 0 0 0 24
              l 24 0
              a 18 18 0 0 0 0 -24 Z`}
          fill="none"
          stroke={theme.colors.brand.danger}
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Broken link right half */}
        <Path
          d={`M ${cx + 14} ${cy - 12}
              a 18 18 0 0 1 0 24
              l -20 0
              a 18 18 0 0 1 0 -24 Z`}
          fill="none"
          stroke="rgba(255,77,109,0.45)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Gap indicator lines */}
        <Line
          x1={cx - 6}
          y1={cy - 20}
          x2={cx + 6}
          y2={cy + 20}
          stroke="rgba(255,77,109,0.6)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="4 4"
        />

        {/* Exclamation dot top-right */}
        <Circle cx={cx + 32} cy={cy - 30} r={8} fill="url(#errAccent)" />
        <Line
          x1={cx + 32}
          y1={cy - 34}
          x2={cx + 32}
          y2={cy - 29}
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Circle cx={cx + 32} cy={cy - 26} r={1.2} fill="white" />

        {/* Small decorative dots */}
        <Circle cx={cx - 40} cy={cy + 38} r={3} fill="rgba(123,92,246,0.4)" />
        <Circle cx={cx + 44} cy={cy + 32} r={2} fill="rgba(255,77,109,0.35)" />
        <Circle cx={cx - 8} cy={cy - 42} r={2.5} fill="rgba(123,92,246,0.3)" />
      </Svg>
    </View>
  )
}

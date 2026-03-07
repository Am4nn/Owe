import { View } from 'react-native'
import Svg, { Circle, Path, Line, Defs, LinearGradient, Stop } from 'react-native-svg'
import { theme } from '@/lib/theme'

/**
 * OfflineIllustration
 *
 * SVG illustration used when the device has no internet connectivity.
 * Shows a wifi-off / disconnected cloud motif in blue/purple tones.
 *
 * Used in:
 * - no_internet_connection_fixed_nav
 *
 * Usage:
 *   <OfflineIllustration />
 *   <OfflineIllustration size={160} />
 */

export interface OfflineIllustrationProps {
  size?: number
}

export function OfflineIllustration({ size = 160 }: OfflineIllustrationProps) {
  const cx = size / 2
  const cy = size / 2
  const r = cx - 4

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="offBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#1e3a5f" stopOpacity="1" />
            <Stop offset="1" stopColor="#1a1d2e" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="offCloud" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#64748B" stopOpacity="1" />
            <Stop offset="1" stopColor="#475569" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Background circle */}
        <Circle cx={cx} cy={cy} r={r} fill="url(#offBg)" />
        <Circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(100,116,139,0.2)" strokeWidth="2" />

        {/* Cloud shape — three overlapping circles + rect base */}
        {/* Main cloud body */}
        <Path
          d={`
            M ${cx - 28} ${cy + 14}
            a 16 16 0 0 1 0 -32
            a 20 20 0 0 1 38 -8
            a 16 16 0 0 1 2 32
            Z
          `}
          fill="url(#offCloud)"
          opacity={0.6}
        />

        {/* Wifi arc — outer (crossed out) */}
        <Path
          d={`M ${cx - 32} ${cy - 4} Q ${cx} ${cy - 28} ${cx + 32} ${cy - 4}`}
          fill="none"
          stroke="rgba(100,116,139,0.4)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Wifi arc — middle */}
        <Path
          d={`M ${cx - 20} ${cy + 4} Q ${cx} ${cy - 14} ${cx + 20} ${cy + 4}`}
          fill="none"
          stroke="rgba(100,116,139,0.4)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Wifi arc — inner */}
        <Path
          d={`M ${cx - 10} ${cy + 12} Q ${cx} ${cy + 4} ${cx + 10} ${cy + 12}`}
          fill="none"
          stroke="rgba(100,116,139,0.5)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Wifi center dot */}
        <Circle cx={cx} cy={cy + 18} r={3} fill="rgba(100,116,139,0.5)" />

        {/* X slash across the wifi arcs */}
        <Line
          x1={cx - 34}
          y1={cy - 26}
          x2={cx + 34}
          y2={cy + 26}
          stroke={theme.colors.brand.danger}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Small disconnected plug dots */}
        <Circle cx={cx - 42} cy={cy + 30} r={3} fill="rgba(100,116,139,0.3)" />
        <Circle cx={cx + 44} cy={cy - 34} r={2} fill="rgba(100,116,139,0.25)" />
        <Circle cx={cx + 38} cy={cy + 36} r={2.5} fill="rgba(255,77,109,0.3)" />
      </Svg>
    </View>
  )
}

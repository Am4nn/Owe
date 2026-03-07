import { View } from 'react-native'
import Svg, { Circle, Path, Rect, Line, Defs, LinearGradient, Stop, G } from 'react-native-svg'
import { theme } from '@/lib/theme'

/**
 * MaintenanceIllustration
 *
 * SVG illustration used on system maintenance screens.
 * Shows a wrench and gear motif in purple tones.
 *
 * Used in:
 * - system_maintenance
 *
 * Usage:
 *   <MaintenanceIllustration />
 *   <MaintenanceIllustration size={160} />
 */

export interface MaintenanceIllustrationProps {
  size?: number
}

export function MaintenanceIllustration({ size = 160 }: MaintenanceIllustrationProps) {
  const cx = size / 2
  const cy = size / 2
  const r = cx - 6

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="mntBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#4C1D95" stopOpacity="1" />
            <Stop offset="1" stopColor="#1a1d2e" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="mntWrench" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#9B7BFF" stopOpacity="1" />
            <Stop offset="1" stopColor="#7B5CF6" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="mntGear" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#F59E0B" stopOpacity="1" />
            <Stop offset="1" stopColor="#D97706" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Background circle */}
        <Circle cx={cx} cy={cy} r={r} fill="url(#mntBg)" />
        <Circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(123,92,246,0.2)" strokeWidth="2" />

        {/* Gear (large) — centered slightly left & down */}
        <G transform={`translate(${cx - 10}, ${cy + 4})`}>
          {/* Gear body */}
          <Circle cx={0} cy={0} r={20} fill="url(#mntGear)" opacity={0.85} />
          <Circle cx={0} cy={0} r={8} fill="rgba(26,29,46,0.9)" />
          {/* Gear teeth (8 teeth) */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45 * Math.PI) / 180
            const tx = Math.cos(angle) * 20
            const ty = Math.sin(angle) * 20
            return (
              <Rect
                key={i}
                x={-4}
                y={-4}
                width={8}
                height={8}
                fill="url(#mntGear)"
                transform={`translate(${tx}, ${ty}) rotate(${i * 45})`}
                rx="1"
                opacity={0.85}
              />
            )
          })}
        </G>

        {/* Wrench */}
        <G transform={`translate(${cx + 8}, ${cy - 12}) rotate(-35)`}>
          {/* Wrench handle */}
          <Rect x={-5} y={0} width={10} height={42} rx="5" fill="url(#mntWrench)" />
          {/* Wrench head - simplified as rounded rect */}
          <Rect x={-12} y={-14} width={24} height={16} rx="6" fill="url(#mntWrench)" />
          <Circle cx={-7} cy={-6} r={4} fill="rgba(26,29,46,0.5)" />
          <Circle cx={7} cy={-6} r={4} fill="rgba(26,29,46,0.5)" />
        </G>

        {/* Sparkle dots */}
        <Circle cx={cx - 38} cy={cy - 32} r={3} fill="rgba(155,123,255,0.5)" />
        <Circle cx={cx + 38} cy={cy - 28} r={2} fill="rgba(245,158,11,0.4)" />
        <Circle cx={cx - 32} cy={cy + 38} r={2.5} fill="rgba(123,92,246,0.4)" />

        {/* Small lines suggesting activity */}
        <Line x1={cx - 52} y1={cy - 10} x2={cx - 44} y2={cy - 10} stroke="rgba(155,123,255,0.35)" strokeWidth="2" strokeLinecap="round" />
        <Line x1={cx - 52} y1={cy - 4} x2={cx - 46} y2={cy - 4} stroke="rgba(155,123,255,0.25)" strokeWidth="2" strokeLinecap="round" />
      </Svg>
    </View>
  )
}

import { View, Text, TouchableOpacity } from 'react-native'
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react-native'
import { theme } from '@/lib/theme'

/**
 * InsightsCard
 *
 * A compact analytics stat card for the Insights screen.
 * Shows an icon (top-left), a large metric value, a label, and an
 * optional trend indicator (percentage change up or down).
 *
 * Used in:
 * - insights_updated_navigation
 *
 * Design:
 * - GlassCard-style surface
 * - IconContainer in brand colour top-left
 * - Large bold value (white)
 * - Label below value (text-secondary)
 * - Trend row: arrow icon + percentage, coloured green/red
 *
 * Usage:
 *   <InsightsCard
 *     icon={DollarSign}
 *     label="Total Spent"
 *     value="$1,240.00"
 *     trend={+12.5}
 *     trendLabel="vs last month"
 *   />
 */

export interface InsightsCardProps {
  icon: LucideIcon
  label: string
  value: string
  /** Trend percentage. Positive = up (green), negative = down (red), undefined = no trend */
  trend?: number
  trendLabel?: string
  iconColor?: string
  onPress?: () => void
}

export function InsightsCard({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel = 'vs last month',
  iconColor = theme.colors.brand.primary,
  onPress,
}: InsightsCardProps) {
  const hasTrend = trend !== undefined
  const isUp = hasTrend && trend > 0
  const isDown = hasTrend && trend < 0
  const isFlat = hasTrend && trend === 0

  const trendColor = isUp
    ? theme.colors.amount.positive
    : isDown
      ? theme.colors.amount.negative
      : theme.colors.amount.neutral

  const TrendIcon = isFlat ? Minus : isUp ? TrendingUp : TrendingDown
  const trendText = hasTrend ? `${isUp ? '+' : ''}${trend.toFixed(1)}%` : ''

  const iconBg = `${iconColor}18`
  const iconBorder = `${iconColor}28`

  const card = (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.dark.surface,
        borderRadius: theme.radii.card,
        borderWidth: 1,
        borderColor: theme.colors.glass.border,
        padding: theme.spacing.base,
        gap: theme.spacing.sm,
      }}
    >
      {/* Icon container */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: theme.radii.icon,
          backgroundColor: iconBg,
          borderWidth: 1,
          borderColor: iconBorder,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={20} color={iconColor} />
      </View>

      {/* Value */}
      <Text
        style={{
          fontSize: theme.typography.h2,
          fontWeight: '800',
          color: theme.colors.text.primary,
          letterSpacing: -0.5,
          marginTop: 4,
        }}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {value}
      </Text>

      {/* Label */}
      <Text
        style={{
          fontSize: theme.typography.caption,
          color: theme.colors.text.secondary,
          fontWeight: '500',
        }}
        numberOfLines={1}
      >
        {label}
      </Text>

      {/* Trend */}
      {hasTrend && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <TrendIcon size={12} color={trendColor} />
          <Text style={{ fontSize: 11, fontWeight: '700', color: trendColor }}>
            {trendText}
          </Text>
          <Text style={{ fontSize: 10, color: theme.colors.text.tertiary }}>
            {trendLabel}
          </Text>
        </View>
      )}
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ flex: 1 }}>
        {card}
      </TouchableOpacity>
    )
  }
  return card
}

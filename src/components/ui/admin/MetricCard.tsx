import { View, Text, TouchableOpacity } from 'react-native'
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react-native'
import { theme } from '@/lib/theme'

/**
 * MetricCard
 *
 * Compact admin dashboard card showing a single KPI metric.
 * Displays an icon, large value, label, and optional trend.
 *
 * Used in:
 * - admin_dashboard (via MetricsGrid)
 *
 * Usage:
 *   <MetricCard
 *     icon={Users}
 *     value="1,284"
 *     label="Total Users"
 *     trend={8.2}
 *   />
 */

export interface MetricCardProps {
  icon: LucideIcon
  value: string
  label: string
  trend?: number
  trendLabel?: string
  iconColor?: string
  onPress?: () => void
}

export function MetricCard({
  icon: Icon,
  value,
  label,
  trend,
  trendLabel = 'vs last week',
  iconColor = theme.colors.brand.primary,
  onPress,
}: MetricCardProps) {
  const hasTrend = trend !== undefined
  const isUp = hasTrend && trend > 0
  const isDown = hasTrend && trend < 0
  const trendColor = isUp ? theme.colors.amount.positive : isDown ? theme.colors.amount.negative : theme.colors.amount.neutral
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus
  const trendText = hasTrend ? `${isUp ? '+' : ''}${trend.toFixed(1)}%` : ''

  const card = (
    <View
      style={{
        backgroundColor: theme.colors.dark.elevated,
        borderRadius: theme.radii.card,
        borderWidth: 1,
        borderColor: theme.colors.glass.border,
        padding: theme.spacing.base,
        gap: theme.spacing.sm,
      }}
    >
      {/* Icon + trend in same row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: theme.radii.md,
            backgroundColor: `${iconColor}1A`,
            borderWidth: 1,
            borderColor: `${iconColor}30`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={18} color={iconColor} />
        </View>

        {hasTrend && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
              paddingHorizontal: 7,
              paddingVertical: 3,
              borderRadius: theme.radii.pill,
              backgroundColor: isUp ? 'rgba(34,197,94,0.10)' : isDown ? 'rgba(239,68,68,0.10)' : 'rgba(148,163,184,0.08)',
            }}
          >
            <TrendIcon size={11} color={trendColor} />
            <Text style={{ fontSize: 10, fontWeight: '700', color: trendColor }}>{trendText}</Text>
          </View>
        )}
      </View>

      {/* Value */}
      <Text
        style={{
          fontSize: 26,
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

      {hasTrend && (
        <Text style={{ fontSize: 10, color: theme.colors.text.tertiary }}>{trendLabel}</Text>
      )}
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {card}
      </TouchableOpacity>
    )
  }
  return card
}

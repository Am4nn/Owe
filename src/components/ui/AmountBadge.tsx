import { View, Text } from 'react-native'
import { theme } from '@/lib/theme'

/**
 * AmountBadge
 *
 * Compact, colour-coded money display. Used in:
 * - Group cards (balance under group name)
 * - Activity feed items (right-side amount)
 * - Dashboard summaries
 *
 * Can render as plain coloured text or as a pill-shaped badge.
 *
 * Amount in integer cents. Type overrides auto-detection from sign.
 *
 * Usage:
 *   <AmountBadge amount={12000} />           // auto → green "+$120.00"
 *   <AmountBadge amount={-5000} />           // auto → red  "-$50.00"
 *   <AmountBadge amount={5000} type="negative" /> // force red
 *   <AmountBadge amount={12000} pill />      // pill badge variant
 */
interface AmountBadgeProps {
  /** Amount in integer cents */
  amount: number
  type?: 'positive' | 'negative' | 'neutral'
  currency?: string
  /** Render as a pill-shaped badge instead of plain text */
  pill?: boolean
  fontSize?: number
  fontWeight?: string
}

const COLOR_MAP = {
  positive: theme.colors.amount.positive,
  negative: theme.colors.amount.negative,
  neutral:  theme.colors.amount.neutral,
}

const BG_MAP = {
  positive: 'rgba(34, 197, 94, 0.12)',
  negative: 'rgba(239, 68, 68, 0.12)',
  neutral:  'rgba(148, 163, 184, 0.10)',
}

export function AmountBadge({
  amount,
  type,
  currency = '$',
  pill = false,
  fontSize = 13,
}: AmountBadgeProps) {
  const auto: 'positive' | 'negative' | 'neutral' =
    type ?? (amount > 0 ? 'positive' : amount < 0 ? 'negative' : 'neutral')

  const color = COLOR_MAP[auto]
  const sign  = auto === 'positive' ? '+' : auto === 'negative' ? '-' : ''
  const display = `${sign}${currency}${(Math.abs(amount) / 100).toFixed(2)}`

  if (pill) {
    return (
      <View
        style={{
          backgroundColor: BG_MAP[auto],
          borderRadius: theme.radii.pill,
          paddingHorizontal: 10,
          paddingVertical: 3,
          alignSelf: 'flex-start',
        }}
      >
        <Text style={{ color, fontSize, fontWeight: '700' }}>{display}</Text>
      </View>
    )
  }

  return (
    <Text style={{ color, fontSize, fontWeight: '700' }}>{display}</Text>
  )
}

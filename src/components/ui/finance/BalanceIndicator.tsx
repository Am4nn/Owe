import { View, Text, TouchableOpacity } from 'react-native'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native'
import { theme } from '@/lib/theme'

/**
 * BalanceIndicator
 *
 * Summary balance card with a coloured left-border accent.
 * Used in pairs on the Dashboard ("You Are Owed" / "You Owe")
 * and individually on Group Detail and Friend Balance screens.
 *
 * Amount is in integer cents. Pass a negative value to show "owe" styling.
 *
 * Usage:
 *   <View style={{ flexDirection: 'row', gap: 12 }}>
 *     <BalanceIndicator label="You Are Owed" amount={124000} count={12} />
 *     <BalanceIndicator label="You Owe"      amount={-45000} count={4} />
 *   </View>
 */
export type BalanceIndicatorProps = {
  /** Balance in integer cents. Negative = you owe. */
  amount: number
  label: string
  /** Number of people involved (shown below the amount) */
  count?: number
  countLabel?: string
  currency?: string
  onPress?: () => void
}

export function BalanceIndicator({
  amount,
  label,
  count,
  countLabel = 'people',
  currency = '$',
  onPress,
}: BalanceIndicatorProps) {
  const isPositive = amount >= 0
  const isZero = amount === 0

  const accentColor = isZero
    ? theme.colors.amount.neutral
    : isPositive
      ? theme.colors.amount.positive
      : theme.colors.amount.negative

  const TrendIcon = isZero ? Minus : isPositive ? TrendingUp : TrendingDown

  const absAmount = Math.abs(amount)
  const displayAmount = `${currency}${(absAmount / 100).toFixed(2)}`

  const card = (
    <View
      style={{
        flex: 1,
        borderRadius: theme.radii.card,
        padding: theme.spacing.base,
        backgroundColor: 'rgba(20, 20, 32, 0.8)',
        borderWidth: 1,
        borderColor: theme.colors.glass.border,
        // Coloured left accent border (matches Stitch dashboard design)
        borderLeftWidth: 4,
        borderLeftColor: accentColor,
        gap: 6,
      }}
    >
      {/* Label */}
      <Text
        style={{
          fontSize: 10,
          fontWeight: '700',
          color: theme.colors.text.tertiary,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>

      {/* Amount */}
      <Text
        style={{
          fontSize: 22,
          fontWeight: '700',
          color: accentColor,
          lineHeight: 28,
        }}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {displayAmount}
      </Text>

      {/* Count / trend row */}
      {count !== undefined && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <TrendIcon size={13} color={accentColor} />
          <Text
            style={{
              fontSize: 11,
              color: theme.colors.text.tertiary,
              fontWeight: '500',
            }}
          >
            {count} {countLabel}
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

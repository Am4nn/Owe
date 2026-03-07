import { View, Text, TouchableOpacity } from 'react-native'
import { ArrowDownLeft, ArrowUpRight, Minus } from 'lucide-react-native'
import { theme } from '@/lib/theme'

/**
 * TransactionRow
 *
 * A simpler, divider-separated row for Transaction History and
 * Friend Balance screens. Shows an icon container, title, date,
 * and signed amount.
 *
 * Amount is in integer cents.
 *   type 'credit' → green  (received / settled in your favour)
 *   type 'debit'  → red    (paid out / expense)
 *   type 'neutral'→ muted
 *
 * Usage:
 *   <TransactionRow
 *     title="Settled with Sarah"
 *     date="2:45 PM · Split payment"
 *     amount={4500}
 *     type="credit"
 *   />
 */
export type TransactionRowProps = {
  title: string
  date: string
  /** Amount in integer cents */
  amount: number
  type?: 'credit' | 'debit' | 'neutral'
  currency?: string
  onPress?: () => void
}

const TYPE_CONFIG = {
  credit: {
    color: theme.colors.amount.positive,
    bgColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    prefix: '+',
    Icon: ArrowDownLeft,
  },
  debit: {
    color: theme.colors.amount.negative,
    bgColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    prefix: '-',
    Icon: ArrowUpRight,
  },
  neutral: {
    color: theme.colors.amount.neutral,
    bgColor: 'rgba(148, 163, 184, 0.1)',
    borderColor: 'rgba(148, 163, 184, 0.2)',
    prefix: '',
    Icon: Minus,
  },
}

export function TransactionRow({
  title,
  date,
  amount,
  type = 'neutral',
  currency = '$',
  onPress,
}: TransactionRowProps) {
  const config = TYPE_CONFIG[type]
  const displayAmount = `${config.prefix}${currency}${(Math.abs(amount) / 100).toFixed(2)}`

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.base,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.radii.card,
        backgroundColor: 'rgba(20, 20, 32, 0.8)',
        borderWidth: 1,
        borderColor: theme.colors.glass.border,
        paddingHorizontal: theme.spacing.base,
        marginBottom: theme.spacing.sm,
      }}
    >
      {/* Direction icon */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: theme.radii.icon,
          backgroundColor: config.bgColor,
          borderWidth: 1,
          borderColor: config.borderColor,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <config.Icon size={20} color={config.color} />
      </View>

      {/* Title + date */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            color: theme.colors.text.primary,
            fontSize: theme.typography.bodySm,
            fontWeight: '600',
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          style={{
            color: theme.colors.text.tertiary,
            fontSize: theme.typography.caption,
            marginTop: 2,
          }}
          numberOfLines={1}
        >
          {date}
        </Text>
      </View>

      {/* Amount + status */}
      <View style={{ alignItems: 'flex-end' }}>
        <Text
          style={{
            color: config.color,
            fontSize: 15,
            fontWeight: '700',
          }}
        >
          {displayAmount}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

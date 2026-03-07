import { View, Text, TouchableOpacity } from 'react-native'
import { type LucideIcon } from 'lucide-react-native'
import { Avatar } from '../Avatar'
import { theme } from '@/lib/theme'

/**
 * ExpenseItem
 *
 * List row for a single expense. Used in:
 * - Dashboard "Recent Activity"
 * - Activity Feed
 * - Group Detail expense list
 * - Transaction History
 *
 * Left slot is either a category icon (square rounded container) or an Avatar.
 * Right slot shows the signed amount and optional timestamp.
 *
 * Amount is in integer cents. Status drives the amount colour:
 *   'lent'    → green  (you paid, others owe you)
 *   'owed'    → red    (someone paid, you owe)
 *   'settled' → muted  (all square)
 *
 * Usage:
 *   <ExpenseItem
 *     title="Grocery Store"
 *     subtitle="Paid by You in Roomies"
 *     amount={4550}
 *     status="lent"
 *     timestamp="2h ago"
 *     icon={ShoppingCart}
 *     iconColor="#22C55E"
 *   />
 */
export type ExpenseItemProps = {
  title: string
  subtitle?: string
  /** Amount in integer cents */
  amount: number
  status?: 'owed' | 'lent' | 'settled'
  timestamp?: string
  currency?: string
  /** Avatar image URI (shown when no icon provided) */
  avatar?: string | null
  avatarFallback?: string
  /** Lucide icon for category (shown instead of Avatar) */
  icon?: LucideIcon
  /** Accent colour for the icon container background tint */
  iconColor?: string
  onPress?: () => void
}

const STATUS_COLORS = {
  lent:    theme.colors.amount.positive,  // green — coming in
  owed:    theme.colors.amount.negative,  // red   — going out
  settled: theme.colors.amount.neutral,   // muted
}

const STATUS_SIGNS = {
  lent:    '+',
  owed:    '-',
  settled: '',
}

export function ExpenseItem({
  title,
  subtitle,
  amount,
  status = 'settled',
  timestamp,
  currency = '$',
  avatar,
  avatarFallback,
  icon: Icon,
  iconColor,
  onPress,
}: ExpenseItemProps) {
  const amountColor = STATUS_COLORS[status]
  const sign = STATUS_SIGNS[status]
  const displayAmount = `${sign}${currency}${(Math.abs(amount) / 100).toFixed(2)}`

  // Left content: category icon container OR avatar
  const leftContent = Icon ? (
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: theme.radii.icon,
        backgroundColor: iconColor
          ? `${iconColor}1A`
          : 'rgba(123, 92, 246, 0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={22} color={iconColor ?? theme.colors.brand.primary} />
    </View>
  ) : (
    <Avatar size="md" uri={avatar} fallback={avatarFallback} />
  )

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.md,
        borderRadius: theme.radii.card,
        backgroundColor: 'rgba(20, 20, 32, 0.8)',
        borderWidth: 1,
        borderColor: theme.colors.glass.border,
      }}
    >
      {leftContent}

      {/* Title + subtitle */}
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
        {subtitle ? (
          <Text
            style={{
              color: theme.colors.text.tertiary,
              fontSize: theme.typography.caption,
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* Amount + timestamp */}
      <View style={{ alignItems: 'flex-end' }}>
        <Text
          style={{
            color: amountColor,
            fontSize: 15,
            fontWeight: '700',
            lineHeight: 20,
          }}
        >
          {displayAmount}
        </Text>
        {timestamp ? (
          <Text
            style={{
              color: theme.colors.text.tertiary,
              fontSize: 10,
              marginTop: 2,
            }}
          >
            {timestamp}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  )
}

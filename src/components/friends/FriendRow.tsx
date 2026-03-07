import { View, Text, TouchableOpacity } from 'react-native'
import { Avatar } from '@/components/ui/Avatar'
import { ChevronRight } from 'lucide-react-native'
import { theme } from '@/lib/theme'

/**
 * FriendRow
 *
 * A tappable list row representing a friend and the current balance
 * relationship between you and them. Used in the Friends list and
 * individual Friend Balance screen.
 *
 * Used in:
 * - friend_balance_sarah_miller
 * - search_add_friends_no_scrollbars (as FriendRow in friend list)
 *
 * Design:
 * - Glass card row (dark surface, subtle border)
 * - Avatar (md) + name (bold) + "Friend" label left
 * - Balance badge right: green if they owe you, red if you owe them
 * - Chevron right
 *
 * Usage:
 *   <FriendRow
 *     name="Sarah Miller"
 *     balanceCents={2500}
 *     onPress={() => router.push('/friends/sarah')}
 *   />
 */

export interface FriendRowProps {
  name: string
  avatar?: string | null
  /** Balance in integer cents. Positive = they owe you. Negative = you owe them. Zero = settled. */
  balanceCents: number
  currency?: string
  /** Optional status label overriding the computed one */
  statusLabel?: string
  onPress?: () => void
}

export function FriendRow({
  name,
  avatar,
  balanceCents,
  currency = '$',
  statusLabel,
  onPress,
}: FriendRowProps) {
  const isPositive = balanceCents > 0
  const isNegative = balanceCents < 0
  const isZero = balanceCents === 0

  const amountColor = isZero
    ? theme.colors.amount.neutral
    : isPositive
      ? theme.colors.amount.positive
      : theme.colors.amount.negative

  const amountBg = isZero
    ? 'rgba(148, 163, 184, 0.08)'
    : isPositive
      ? 'rgba(34, 197, 94, 0.10)'
      : 'rgba(239, 68, 68, 0.10)'

  const amountBorder = isZero
    ? 'rgba(148, 163, 184, 0.15)'
    : isPositive
      ? 'rgba(34, 197, 94, 0.20)'
      : 'rgba(239, 68, 68, 0.20)'

  const computedLabel = isZero
    ? 'Settled up'
    : isPositive
      ? 'Owes you'
      : 'You owe'

  const displayLabel = statusLabel ?? computedLabel
  const displayAmount = isZero
    ? 'All clear'
    : `${isPositive ? '' : ''}${currency}${(Math.abs(balanceCents) / 100).toFixed(2)}`

  const row = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.base,
        borderRadius: theme.radii.card,
        backgroundColor: 'rgba(20, 20, 32, 0.8)',
        borderWidth: 1,
        borderColor: theme.colors.glass.border,
      }}
    >
      {/* Avatar */}
      <Avatar size="md" fallback={name} uri={avatar} />

      {/* Name + label */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontSize: theme.typography.bodySm,
            fontWeight: '600',
            color: theme.colors.text.primary,
          }}
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text
          style={{
            fontSize: theme.typography.caption,
            color: theme.colors.text.tertiary,
            marginTop: 2,
          }}
        >
          Friend
        </Text>
      </View>

      {/* Balance badge */}
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: theme.radii.pill,
            backgroundColor: amountBg,
            borderWidth: 1,
            borderColor: amountBorder,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: amountColor,
            }}
          >
            {displayAmount}
          </Text>
        </View>
        <Text style={{ fontSize: 10, color: amountColor, fontWeight: '500' }}>
          {displayLabel}
        </Text>
      </View>

      {/* Chevron */}
      {onPress && (
        <ChevronRight size={16} color={theme.colors.text.tertiary} />
      )}
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
        {row}
      </TouchableOpacity>
    )
  }
  return row
}

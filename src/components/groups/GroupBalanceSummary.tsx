import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { Avatar } from '@/components/ui/Avatar'
import { theme } from '@/lib/theme'

/**
 * GroupBalanceSummary
 *
 * Horizontally scrollable list of per-member balance chips inside a glass card.
 * Each chip shows a member avatar, name, and their net balance within the group.
 *
 * Used in:
 * - group_detail_dark_theme_refined
 *
 * Design:
 * - Section title "BALANCES" in caps
 * - Horizontal scroll of member chips
 * - Each chip: avatar (sm), name truncated, amount coloured green/red/muted
 * - Tap navigates to that member's balance detail
 *
 * Usage:
 *   <GroupBalanceSummary
 *     members={[
 *       { id: '1', name: 'Sarah', netCents: 2500 },
 *       { id: '2', name: 'John', netCents: -1200 },
 *     ]}
 *   />
 */

export interface GroupBalanceMember {
  id: string
  name: string
  avatar?: string | null
  /** Net balance in integer cents. Positive = owed to this member. Negative = member owes you. */
  netCents: number
  currency?: string
  onPress?: () => void
}

export interface GroupBalanceSummaryProps {
  members: GroupBalanceMember[]
  /** When true, show a "Settle up" button next to each member */
  showSettleButton?: boolean
}

function MemberBalanceChip({ member }: { member: GroupBalanceMember }) {
  const isPositive = member.netCents > 0
  const isNegative = member.netCents < 0
  const currency = member.currency ?? '$'

  const amountColor = isPositive
    ? theme.colors.amount.positive
    : isNegative
      ? theme.colors.amount.negative
      : theme.colors.amount.neutral

  const amountBg = isPositive
    ? 'rgba(34, 197, 94, 0.10)'
    : isNegative
      ? 'rgba(239, 68, 68, 0.10)'
      : 'rgba(148, 163, 184, 0.08)'

  const amountBorder = isPositive
    ? 'rgba(34, 197, 94, 0.2)'
    : isNegative
      ? 'rgba(239, 68, 68, 0.2)'
      : 'rgba(148, 163, 184, 0.15)'

  const sign = isPositive ? '+' : isNegative ? '-' : ''
  const displayAmount = `${sign}${currency}${(Math.abs(member.netCents) / 100).toFixed(2)}`
  const statusLabel = isPositive ? 'gets back' : isNegative ? 'owes' : 'settled'

  const chip = (
    <View
      style={{
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.radii.card,
        backgroundColor: theme.colors.dark.elevated,
        borderWidth: 1,
        borderColor: theme.colors.glass.border,
        minWidth: 88,
        maxWidth: 104,
        gap: 6,
      }}
    >
      <Avatar size="sm" fallback={member.name} uri={member.avatar} />

      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: theme.colors.text.primary,
          textAlign: 'center',
        }}
        numberOfLines={1}
      >
        {member.name.split(' ')[0]}
      </Text>

      <View
        style={{
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: theme.radii.pill,
          backgroundColor: amountBg,
          borderWidth: 1,
          borderColor: amountBorder,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: amountColor,
            textAlign: 'center',
          }}
          numberOfLines={1}
        >
          {displayAmount}
        </Text>
      </View>

      <Text
        style={{
          fontSize: 10,
          color: theme.colors.text.tertiary,
          textAlign: 'center',
        }}
      >
        {statusLabel}
      </Text>
    </View>
  )

  if (member.onPress) {
    return (
      <TouchableOpacity onPress={member.onPress} activeOpacity={0.75}>
        {chip}
      </TouchableOpacity>
    )
  }
  return chip
}

export function GroupBalanceSummary({ members }: GroupBalanceSummaryProps) {
  if (members.length === 0) return null

  return (
    <View
      style={{
        backgroundColor: theme.colors.dark.surface,
        borderRadius: theme.radii.card,
        borderWidth: 1,
        borderColor: theme.colors.glass.border,
        paddingTop: theme.spacing.base,
        paddingBottom: theme.spacing.base,
        overflow: 'hidden',
      }}
    >
      {/* Section header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.base,
          marginBottom: theme.spacing.md,
        }}
      >
        <Text
          style={{
            fontSize: theme.typography.caption,
            fontWeight: '700',
            color: theme.colors.text.tertiary,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
          }}
        >
          Balances
        </Text>
        <Text
          style={{
            fontSize: theme.typography.caption,
            color: theme.colors.text.tertiary,
          }}
        >
          {members.length} members
        </Text>
      </View>

      {/* Horizontal scroll of chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.base,
          gap: theme.spacing.sm,
        }}
      >
        {members.map((member) => (
          <MemberBalanceChip key={member.id} member={member} />
        ))}
      </ScrollView>
    </View>
  )
}

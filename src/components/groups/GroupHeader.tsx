import { View, Text, TouchableOpacity } from 'react-native'
import { ChevronLeft, MoreVertical, Users } from 'lucide-react-native'
import { type LucideIcon } from 'lucide-react-native'
import { theme } from '@/lib/theme'

/**
 * GroupHeader
 *
 * Compact dark-surface header section for the Group Detail screen.
 * Sits below the screen's HeaderBar and shows the group icon, name,
 * and member count.
 *
 * Design matches group_detail_dark_theme_refined:
 * - Plain dark surface background (no gradient)
 * - Centred 72×72 rounded-square group icon with tinted bg
 * - Group name in bold white below icon
 * - "X active members" caption row with Users icon
 * - Optional balance chip (green / red pill)
 * - Back chevron top-left + options dots top-right (for standalone header usage)
 *
 * Used in:
 * - group_detail_dark_theme_refined
 *
 * Usage:
 *   <GroupHeader
 *     name="Weekend Trip"
 *     icon={Plane}
 *     memberCount={6}
 *     netBalanceCents={4250}
 *     onBack={() => router.back()}
 *     onOptions={() => setShowMenu(true)}
 *   />
 */

export interface GroupHeaderProps {
  name: string
  /** Lucide icon to show in the group icon container */
  icon?: LucideIcon
  memberCount?: number
  /** Net balance in cents. Positive = owed to you, negative = you owe. Undefined = hidden. */
  netBalanceCents?: number
  currency?: string
  onBack?: () => void
  onOptions?: () => void
}

export function GroupHeader({
  name,
  icon: Icon,
  memberCount = 0,
  netBalanceCents,
  currency = '$',
  onBack,
  onOptions,
}: GroupHeaderProps) {
  const hasBalance = netBalanceCents !== undefined && netBalanceCents !== 0
  const isOwed = hasBalance && netBalanceCents! > 0
  const balanceColor = isOwed ? theme.colors.amount.positive : theme.colors.amount.negative
  const balanceBg = isOwed ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)'
  const balanceBorder = isOwed ? 'rgba(34, 197, 94, 0.28)' : 'rgba(239, 68, 68, 0.28)'
  const balanceLabel = isOwed ? 'You are owed' : 'You owe'
  const balanceAmount = netBalanceCents !== undefined
    ? `${currency}${(Math.abs(netBalanceCents) / 100).toFixed(2)}`
    : null

  return (
    <View style={{ backgroundColor: theme.colors.dark.bg }}>
      {/* Navigation row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.base,
          paddingTop: theme.spacing.base,
          paddingBottom: theme.spacing.md,
        }}
      >
        {onBack ? (
          <TouchableOpacity onPress={onBack} activeOpacity={0.7} hitSlop={8}>
            <ChevronLeft size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}

        <Text
          style={{
            fontSize: theme.typography.bodyLg,
            fontWeight: '700',
            color: theme.colors.text.primary,
            flex: 1,
            textAlign: 'center',
            marginHorizontal: theme.spacing.md,
          }}
          numberOfLines={1}
        >
          {name}
        </Text>

        {onOptions ? (
          <TouchableOpacity onPress={onOptions} activeOpacity={0.7} hitSlop={8}>
            <MoreVertical size={22} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {/* Group icon + member count */}
      <View style={{ alignItems: 'center', paddingVertical: theme.spacing.lg }}>
        {/* Icon container */}
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            backgroundColor: 'rgba(123, 92, 246, 0.15)',
            borderWidth: 1,
            borderColor: 'rgba(123, 92, 246, 0.25)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing.md,
          }}
        >
          {Icon ? (
            <Icon size={34} color={theme.colors.brand.primary} />
          ) : (
            <Users size={34} color={theme.colors.brand.primary} />
          )}
        </View>

        {/* Member count */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Users size={13} color={theme.colors.text.tertiary} />
          <Text
            style={{
              fontSize: theme.typography.caption,
              color: theme.colors.text.tertiary,
              fontWeight: '500',
            }}
          >
            {memberCount} {memberCount === 1 ? 'active member' : 'active members'}
          </Text>
        </View>

        {/* Balance chip */}
        {hasBalance && balanceAmount && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: theme.radii.pill,
              backgroundColor: balanceBg,
              borderWidth: 1,
              borderColor: balanceBorder,
              marginTop: theme.spacing.md,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '500', color: balanceColor }}>
              {balanceLabel}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: balanceColor }}>
              {balanceAmount}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

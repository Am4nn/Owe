import { View, Text, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ChevronLeft, MoreHorizontal, Users } from 'lucide-react-native'
import { AvatarStack } from '@/components/ui/AvatarStack'
import { theme } from '@/lib/theme'

/**
 * GroupHeader
 *
 * Full-bleed gradient header for the Group Detail screen.
 * Shows the group name, member avatar stack, total balance chip,
 * and back/options navigation buttons.
 *
 * Used in:
 * - group_detail_dark_theme_refined
 *
 * Design:
 * - Full-bleed gradient background (purple → deep purple)
 * - Group name in bold white, large text
 * - AvatarStack + member count below name
 * - Balance chip (green "you are owed" or red "you owe")
 * - Back chevron top-left, options dots top-right
 *
 * Usage:
 *   <GroupHeader
 *     name="Roommates"
 *     members={[{ name: 'Sarah' }, { name: 'John' }, { name: 'Mike' }]}
 *     netBalanceCents={4500}
 *     onBack={() => router.back()}
 *     onOptions={() => setShowMenu(true)}
 *   />
 */

export interface GroupHeaderMember {
  name?: string
  uri?: string | null
}

export interface GroupHeaderProps {
  name: string
  members: GroupHeaderMember[]
  /** Net balance in cents. Positive = owed to you, negative = you owe. Undefined = hidden. */
  netBalanceCents?: number
  currency?: string
  onBack?: () => void
  onOptions?: () => void
}

export function GroupHeader({
  name,
  members,
  netBalanceCents,
  currency = '$',
  onBack,
  onOptions,
}: GroupHeaderProps) {
  const hasBalance = netBalanceCents !== undefined && netBalanceCents !== 0
  const isOwed = hasBalance && netBalanceCents! > 0
  const balanceColor = isOwed ? theme.colors.amount.positive : theme.colors.amount.negative
  const balanceBg = isOwed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'
  const balanceBorder = isOwed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'
  const balanceLabel = isOwed ? 'You are owed' : 'You owe'
  const balanceAmount = netBalanceCents !== undefined
    ? `${currency}${(Math.abs(netBalanceCents) / 100).toFixed(2)}`
    : null

  return (
    <LinearGradient
      colors={['#7B5CF6', '#4C1D95']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ paddingBottom: 28 }}
    >
      {/* Navigation row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.base,
          paddingTop: theme.spacing.base,
          paddingBottom: theme.spacing.lg,
        }}
      >
        {onBack ? (
          <TouchableOpacity onPress={onBack} activeOpacity={0.7} hitSlop={8}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(255,255,255,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronLeft size={22} color="#fff" />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}

        {onOptions ? (
          <TouchableOpacity onPress={onOptions} activeOpacity={0.7} hitSlop={8}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(255,255,255,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MoreHorizontal size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {/* Group info */}
      <View style={{ paddingHorizontal: theme.spacing.xl, alignItems: 'flex-start' }}>
        {/* Group name */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: '800',
            color: '#FFFFFF',
            letterSpacing: -0.5,
            marginBottom: theme.spacing.md,
          }}
          numberOfLines={2}
        >
          {name}
        </Text>

        {/* Members row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.base }}>
          <AvatarStack members={members} maxDisplay={4} size="sm" />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Users size={13} color="rgba(255,255,255,0.7)" />
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </Text>
          </View>
        </View>

        {/* Balance chip */}
        {hasBalance && balanceAmount && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: theme.radii.pill,
              backgroundColor: balanceBg,
              borderWidth: 1,
              borderColor: balanceBorder,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: balanceColor }}>
              {balanceLabel}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: balanceColor }}>
              {balanceAmount}
            </Text>
          </View>
        )}
      </View>
    </LinearGradient>
  )
}

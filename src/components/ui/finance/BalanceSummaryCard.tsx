import { View, Text, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { TrendingUp, TrendingDown, Minus, Users } from 'lucide-react-native'
import { theme } from '@/lib/theme'

/**
 * BalanceSummaryCard
 *
 * Large dashboard card summarising the user's overall financial position.
 * Shows the net balance prominently plus two sub-cards for owed vs owing.
 *
 * Used in:
 * - dashboard_strict_dark_refinement (top balance area)
 *
 * Design:
 * - Full-width glass card with purple gradient top border accent
 * - Net balance in large display text, colour-coded green/red/muted
 * - Two sub-cards in a row: "You are owed" (green) and "You owe" (red)
 *
 * Usage:
 *   <BalanceSummaryCard
 *     netCents={12500}
 *     owedCents={18000}
 *     owingCents={5500}
 *     owedCount={3}
 *     owingCount={1}
 *   />
 */

export interface BalanceSummaryCardProps {
  /** Net balance in integer cents (positive = net owed to you, negative = net you owe) */
  netCents: number
  /** Total amount others owe you, in cents (always positive) */
  owedCents: number
  /** Total amount you owe others, in cents (always positive) */
  owingCents: number
  /** Number of people who owe you */
  owedCount?: number
  /** Number of people you owe */
  owingCount?: number
  currency?: string
  onPress?: () => void
}

function formatAmount(cents: number, currency = '$'): string {
  return `${currency}${(Math.abs(cents) / 100).toFixed(2)}`
}

export function BalanceSummaryCard({
  netCents,
  owedCents,
  owingCents,
  owedCount = 0,
  owingCount = 0,
  currency = '$',
  onPress,
}: BalanceSummaryCardProps) {
  const isPositive = netCents > 0
  const isNegative = netCents < 0
  const isZero = netCents === 0

  const netColor = isZero
    ? theme.colors.amount.neutral
    : isPositive
      ? theme.colors.amount.positive
      : theme.colors.amount.negative

  const NetIcon = isZero ? Minus : isPositive ? TrendingUp : TrendingDown
  const netLabel = isZero ? 'All settled up' : isPositive ? 'Overall you are owed' : 'Overall you owe'

  const content = (
    <View
      style={{
        borderRadius: theme.radii.card,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.glass.border,
      }}
    >
      {/* Gradient top accent bar */}
      <LinearGradient
        colors={['#9B7BFF', '#7B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 3 }}
      />

      {/* Card body */}
      <View
        style={{
          backgroundColor: theme.colors.dark.surface,
          padding: theme.spacing.xl,
        }}
      >
        {/* Header label */}
        <Text
          style={{
            fontSize: theme.typography.caption,
            fontWeight: '700',
            color: theme.colors.text.tertiary,
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: theme.spacing.sm,
          }}
        >
          Net Balance
        </Text>

        {/* Net amount */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 4 }}>
          <Text
            style={{
              fontSize: 36,
              fontWeight: '800',
              color: netColor,
              lineHeight: 40,
              letterSpacing: -0.5,
            }}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            numberOfLines={1}
          >
            {formatAmount(netCents, currency)}
          </Text>
        </View>

        {/* Status label row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: theme.spacing.lg }}>
          <NetIcon size={14} color={netColor} />
          <Text style={{ fontSize: theme.typography.caption, color: netColor, fontWeight: '600' }}>
            {netLabel}
          </Text>
        </View>

        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: theme.colors.glass.divider,
            marginBottom: theme.spacing.base,
          }}
        />

        {/* Sub-row: You are owed / You owe */}
        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          {/* Owed to you */}
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(34, 197, 94, 0.08)',
              borderRadius: theme.radii.md,
              borderWidth: 1,
              borderColor: 'rgba(34, 197, 94, 0.18)',
              padding: theme.spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: 9,
                fontWeight: '700',
                color: theme.colors.amount.positive,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: 4,
              }}
            >
              You Are Owed
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: theme.colors.amount.positive,
                lineHeight: 22,
              }}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatAmount(owedCents, currency)}
            </Text>
            {owedCount > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                <Users size={10} color={theme.colors.text.tertiary} />
                <Text style={{ fontSize: 10, color: theme.colors.text.tertiary }}>
                  {owedCount} {owedCount === 1 ? 'person' : 'people'}
                </Text>
              </View>
            )}
          </View>

          {/* You owe */}
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              borderRadius: theme.radii.md,
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.18)',
              padding: theme.spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: 9,
                fontWeight: '700',
                color: theme.colors.amount.negative,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: 4,
              }}
            >
              You Owe
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: theme.colors.amount.negative,
                lineHeight: 22,
              }}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatAmount(owingCents, currency)}
            </Text>
            {owingCount > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                <Users size={10} color={theme.colors.text.tertiary} />
                <Text style={{ fontSize: 10, color: theme.colors.text.tertiary }}>
                  {owingCount} {owingCount === 1 ? 'person' : 'people'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        {content}
      </TouchableOpacity>
    )
  }
  return content
}

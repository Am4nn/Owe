import { View, Text } from 'react-native'
import { SplitMemberRow, SplitMemberRowProps } from './SplitMemberRow'
import { theme } from '@/lib/theme'

/**
 * SplitBreakdownList
 *
 * Vertical list showing each member's share of a split expense.
 * Wraps SplitMemberRow items inside a glass card with a section header
 * and a total validation row at the bottom.
 *
 * Used in:
 * - split_confirmation
 * - expense_detail_dark_theme
 *
 * Usage:
 *   <SplitBreakdownList
 *     totalCents={6000}
 *     members={[
 *       { name: 'Sarah', amountCents: 2000, isPayer: true },
 *       { name: 'John', amountCents: 2000 },
 *       { name: 'Mike', amountCents: 2000 },
 *     ]}
 *   />
 */

export interface SplitBreakdownMember extends SplitMemberRowProps {
  id: string
}

export interface SplitBreakdownListProps {
  totalCents: number
  members: SplitBreakdownMember[]
  currency?: string
  /** Whether rows are editable (Exact / Percentage split modes) */
  editable?: boolean
  editMode?: 'exact' | 'percentage'
  onMemberAmountChange?: (id: string, cents: number) => void
  onMemberPercentageChange?: (id: string, percentage: number) => void
}

export function SplitBreakdownList({
  totalCents,
  members,
  currency = '$',
  editable = false,
  editMode = 'exact',
  onMemberAmountChange,
  onMemberPercentageChange,
}: SplitBreakdownListProps) {
  const assignedCents = members.reduce((sum, m) => sum + m.amountCents, 0)
  const remainder = totalCents - assignedCents
  const isBalanced = Math.abs(remainder) < 1

  return (
    <View
      style={{
        backgroundColor: theme.colors.dark.surface,
        borderRadius: theme.radii.card,
        borderWidth: 1,
        borderColor: theme.colors.glass.border,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.base,
          paddingVertical: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.glass.divider,
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
          Split Breakdown
        </Text>
        <Text
          style={{
            fontSize: theme.typography.caption,
            color: theme.colors.text.tertiary,
          }}
        >
          {members.length} people
        </Text>
      </View>

      {/* Member rows */}
      <View>
        {members.map((member, index) => (
          <View key={member.id}>
            <SplitMemberRow
              {...member}
              currency={currency}
              editable={editable}
              editMode={editMode}
              onAmountChange={
                onMemberAmountChange
                  ? (cents) => onMemberAmountChange(member.id, cents)
                  : undefined
              }
              onPercentageChange={
                onMemberPercentageChange
                  ? (pct) => onMemberPercentageChange(member.id, pct)
                  : undefined
              }
            />
            {index < members.length - 1 && (
              <View
                style={{
                  height: 1,
                  backgroundColor: theme.colors.glass.divider,
                  marginHorizontal: theme.spacing.base,
                }}
              />
            )}
          </View>
        ))}
      </View>

      {/* Total validation row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.base,
          paddingVertical: theme.spacing.md,
          borderTopWidth: 1,
          borderTopColor: theme.colors.glass.divider,
          backgroundColor: isBalanced
            ? 'rgba(34, 197, 94, 0.04)'
            : 'rgba(239, 68, 68, 0.04)',
        }}
      >
        <Text
          style={{
            fontSize: theme.typography.bodySm,
            fontWeight: '600',
            color: isBalanced ? theme.colors.amount.positive : theme.colors.amount.negative,
          }}
        >
          {isBalanced ? 'Perfectly split' : `${Math.abs(remainder) < 1 ? 'Balanced' : `${currency}${(Math.abs(remainder) / 100).toFixed(2)} ${remainder > 0 ? 'unassigned' : 'over-assigned'}`}`}
        </Text>
        <Text
          style={{
            fontSize: theme.typography.bodySm,
            fontWeight: '700',
            color: theme.colors.text.primary,
          }}
        >
          Total: {currency}{(totalCents / 100).toFixed(2)}
        </Text>
      </View>
    </View>
  )
}

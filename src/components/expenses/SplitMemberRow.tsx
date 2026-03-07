import { View, Text, TextInput } from 'react-native'
import { Avatar } from '@/components/ui/Avatar'
import { theme } from '@/lib/theme'

/**
 * SplitMemberRow
 *
 * A single member's share in a split expense. Shows their avatar + name
 * on the left, and their portion amount on the right. Optionally editable
 * when split method is "Exact" or "Percentage".
 *
 * Used in:
 * - split_confirmation
 * - add_expense_strict_dark_theme (SplitBreakdownList)
 *
 * Usage (display):
 *   <SplitMemberRow name="Sarah" amountCents={1500} />
 *
 * Usage (editable exact):
 *   <SplitMemberRow
 *     name="Sarah"
 *     amountCents={1500}
 *     editable
 *     editMode="exact"
 *     onAmountChange={(cents) => updateShare('sarah', cents)}
 *   />
 *
 * Usage (editable percentage):
 *   <SplitMemberRow
 *     name="Sarah"
 *     percentage={33.33}
 *     amountCents={1500}
 *     editable
 *     editMode="percentage"
 *     onPercentageChange={(pct) => updatePct('sarah', pct)}
 *   />
 */

export interface SplitMemberRowProps {
  name: string
  avatar?: string | null
  /** Member's share in integer cents */
  amountCents: number
  /** For percentage mode — current percentage string */
  percentage?: number
  currency?: string
  editable?: boolean
  editMode?: 'exact' | 'percentage'
  onAmountChange?: (cents: number) => void
  onPercentageChange?: (percentage: number) => void
  /** Whether this member is the payer */
  isPayer?: boolean
}

export function SplitMemberRow({
  name,
  avatar,
  amountCents,
  percentage,
  currency = '$',
  editable = false,
  editMode = 'exact',
  onAmountChange,
  onPercentageChange,
  isPayer = false,
}: SplitMemberRowProps) {
  const displayAmount = `${currency}${(amountCents / 100).toFixed(2)}`
  const firstName = name.split(' ')[0]

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.base,
        backgroundColor: isPayer ? 'rgba(123, 92, 246, 0.06)' : 'transparent',
        borderRadius: theme.radii.md,
      }}
    >
      {/* Avatar + name */}
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: theme.spacing.md }}>
        <View style={{ position: 'relative' }}>
          <Avatar size="md" fallback={name} uri={avatar} />
          {isPayer && (
            <View
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: theme.colors.brand.primary,
                borderWidth: 2,
                borderColor: theme.colors.dark.bg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 7, fontWeight: '800', color: '#fff' }}>$</Text>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: theme.typography.bodySm,
              fontWeight: '600',
              color: theme.colors.text.primary,
            }}
            numberOfLines={1}
          >
            {firstName}
          </Text>
          {isPayer && (
            <Text
              style={{
                fontSize: 11,
                color: theme.colors.brand.primary,
                fontWeight: '500',
                marginTop: 1,
              }}
            >
              Paid
            </Text>
          )}
        </View>
      </View>

      {/* Amount / editable field */}
      {editable ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {editMode === 'exact' && (
            <>
              <Text style={{ fontSize: 15, color: theme.colors.text.secondary, fontWeight: '500' }}>
                {currency}
              </Text>
              <TextInput
                value={String((amountCents / 100).toFixed(2))}
                onChangeText={(val) => {
                  const parsed = parseFloat(val)
                  if (!isNaN(parsed)) onAmountChange?.(Math.round(parsed * 100))
                }}
                keyboardType="decimal-pad"
                style={{
                  fontSize: 15,
                  fontWeight: '700',
                  color: theme.colors.text.primary,
                  minWidth: 64,
                  textAlign: 'right',
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.brand.primary,
                  paddingBottom: 2,
                }}
              />
            </>
          )}
          {editMode === 'percentage' && (
            <>
              <TextInput
                value={percentage !== undefined ? String(percentage.toFixed(1)) : ''}
                onChangeText={(val) => {
                  const parsed = parseFloat(val)
                  if (!isNaN(parsed)) onPercentageChange?.(parsed)
                }}
                keyboardType="decimal-pad"
                style={{
                  fontSize: 15,
                  fontWeight: '700',
                  color: theme.colors.text.primary,
                  minWidth: 48,
                  textAlign: 'right',
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.brand.primary,
                  paddingBottom: 2,
                }}
              />
              <Text style={{ fontSize: 15, color: theme.colors.text.secondary, fontWeight: '500' }}>%</Text>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.text.tertiary,
                  marginLeft: 4,
                }}
              >
                ({displayAmount})
              </Text>
            </>
          )}
        </View>
      ) : (
        <Text
          style={{
            fontSize: 15,
            fontWeight: '700',
            color: theme.colors.text.primary,
          }}
        >
          {displayAmount}
        </Text>
      )}
    </View>
  )
}

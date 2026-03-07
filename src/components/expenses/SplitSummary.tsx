import { View, Text } from 'react-native'
import { Divide, Equal, Percent } from 'lucide-react-native'
import { theme } from '@/lib/theme'

/**
 * SplitSummary
 *
 * Compact summary row displayed on the split_confirmation screen showing
 * the active split method and a preview of per-person amounts.
 *
 * Used in:
 * - split_confirmation
 *
 * Usage:
 *   <SplitSummary method="equal" perPersonCents={2000} memberCount={3} totalCents={6000} />
 *   <SplitSummary method="exact" members={[...]} totalCents={6000} />
 *   <SplitSummary method="percentage" members={[...]} totalCents={6000} />
 */

export type SplitMethod = 'equal' | 'exact' | 'percentage'

export interface SplitSummaryProps {
  method: SplitMethod
  totalCents: number
  /** For equal splits: amount per person */
  perPersonCents?: number
  /** Total number of people sharing */
  memberCount?: number
  currency?: string
}

const METHOD_META = {
  equal: {
    label: 'Equal Split',
    description: 'Divided equally',
    Icon: Equal,
    color: theme.colors.brand.primary,
    bg: 'rgba(123, 92, 246, 0.10)',
    border: 'rgba(123, 92, 246, 0.20)',
  },
  exact: {
    label: 'Exact Amounts',
    description: 'Custom per person',
    Icon: Divide,
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.10)',
    border: 'rgba(59, 130, 246, 0.20)',
  },
  percentage: {
    label: 'By Percentage',
    description: 'Custom percentages',
    Icon: Percent,
    color: '#06D6A0',
    bg: 'rgba(6, 214, 160, 0.10)',
    border: 'rgba(6, 214, 160, 0.20)',
  },
} as const

export function SplitSummary({
  method,
  totalCents,
  perPersonCents,
  memberCount,
  currency = '$',
}: SplitSummaryProps) {
  const meta = METHOD_META[method]
  const Icon = meta.Icon

  let subtitle = meta.description
  if (method === 'equal' && perPersonCents !== undefined && memberCount !== undefined) {
    subtitle = `${currency}${(perPersonCents / 100).toFixed(2)} each × ${memberCount} people`
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.base,
        borderRadius: theme.radii.card,
        backgroundColor: theme.colors.dark.surface,
        borderWidth: 1,
        borderColor: theme.colors.glass.border,
      }}
    >
      {/* Method icon pill */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: theme.radii.icon,
          backgroundColor: meta.bg,
          borderWidth: 1,
          borderColor: meta.border,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} color={meta.color} />
      </View>

      {/* Labels */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: theme.typography.bodySm,
            fontWeight: '600',
            color: theme.colors.text.primary,
          }}
        >
          {meta.label}
        </Text>
        <Text
          style={{
            fontSize: theme.typography.caption,
            color: theme.colors.text.tertiary,
            marginTop: 2,
          }}
        >
          {subtitle}
        </Text>
      </View>

      {/* Total amount */}
      <View style={{ alignItems: 'flex-end' }}>
        <Text
          style={{
            fontSize: 11,
            color: theme.colors.text.tertiary,
            marginBottom: 2,
          }}
        >
          Total
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: theme.colors.text.primary,
          }}
        >
          {currency}{(totalCents / 100).toFixed(2)}
        </Text>
      </View>
    </View>
  )
}

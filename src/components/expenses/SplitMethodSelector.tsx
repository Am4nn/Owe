import { View, Text, TouchableOpacity } from 'react-native'
import { Equal, Divide, Percent } from 'lucide-react-native'
import { theme } from '@/lib/theme'

/**
 * SplitMethodSelector
 *
 * Row of three pill chips used to choose how an expense is split.
 * Selected chip gets a solid brand-primary fill.
 *
 * Methods:
 *   equal      — Divide total equally among all members
 *   exact      — Enter custom exact amounts per person
 *   percentage — Enter custom percentages per person
 *
 * Used in:
 * - add_expense_strict_dark_theme
 *
 * Usage:
 *   <SplitMethodSelector
 *     selected="equal"
 *     onSelect={(method) => setSplitMethod(method)}
 *   />
 */

export type SplitMethod = 'equal' | 'exact' | 'percentage'

export interface SplitMethodSelectorProps {
  selected: SplitMethod
  onSelect: (method: SplitMethod) => void
}

const METHODS: { id: SplitMethod; label: string; Icon: typeof Equal }[] = [
  { id: 'equal', label: 'Equal', Icon: Equal },
  { id: 'exact', label: 'Exact', Icon: Divide },
  { id: 'percentage', label: 'Percent', Icon: Percent },
]

export function SplitMethodSelector({ selected, onSelect }: SplitMethodSelectorProps) {
  return (
    <View>
      {/* Label */}
      <Text
        style={{
          fontSize: theme.typography.caption,
          fontWeight: '700',
          color: theme.colors.text.tertiary,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          marginBottom: theme.spacing.md,
        }}
      >
        Split method
      </Text>

      {/* Chip row */}
      <View
        style={{
          flexDirection: 'row',
          gap: theme.spacing.sm,
        }}
      >
        {METHODS.map((method) => {
          const isSelected = selected === method.id
          const Icon = method.Icon

          return (
            <TouchableOpacity
              key={method.id}
              onPress={() => onSelect(method.id)}
              activeOpacity={0.7}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                height: 44,
                borderRadius: theme.radii.pill,
                backgroundColor: isSelected
                  ? theme.colors.brand.primary
                  : 'rgba(123, 92, 246, 0.08)',
                borderWidth: 1,
                borderColor: isSelected
                  ? theme.colors.brand.primary
                  : 'rgba(123, 92, 246, 0.18)',
              }}
            >
              <Icon
                size={14}
                color={isSelected ? '#FFFFFF' : theme.colors.text.secondary}
              />
              <Text
                style={{
                  fontSize: theme.typography.bodySm,
                  fontWeight: isSelected ? '700' : '500',
                  color: isSelected ? '#FFFFFF' : theme.colors.text.secondary,
                }}
              >
                {method.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

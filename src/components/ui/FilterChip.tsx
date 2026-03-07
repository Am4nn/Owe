import { TouchableOpacity, Text, ScrollView, View } from 'react-native'
import { theme } from '@/lib/theme'

/**
 * FilterChip  +  FilterChipGroup
 *
 * Text-only pill filters used in horizontal scrollable filter bars.
 * Seen in:
 * - Transaction History (All / Payments / Settlements / Refunds)
 * - Notifications      (All / Payments / Groups / Reminders)
 * - Activity Feed      (All / Groups / Friends / Settlements)
 *
 * FilterChipGroup renders a horizontally scrollable row of chips.
 *
 * Usage (controlled):
 *   const [filter, setFilter] = useState('All')
 *   <FilterChipGroup
 *     options={['All', 'Payments', 'Settlements']}
 *     selected={filter}
 *     onSelect={setFilter}
 *   />
 *
 * Usage (individual):
 *   <FilterChip label="All" selected onPress={() => ...} />
 */

// ── Single chip ───────────────────────────────────────────────────────────────

interface FilterChipProps {
  label: string
  selected?: boolean
  onPress?: () => void
}

export function FilterChip({ label, selected = false, onPress }: FilterChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        height: 34,
        paddingHorizontal: 18,
        borderRadius: theme.radii.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: selected
          ? theme.colors.brand.primary
          : 'rgba(123, 92, 246, 0.10)',
        borderWidth: 1,
        borderColor: selected
          ? theme.colors.brand.primary
          : 'rgba(123, 92, 246, 0.20)',
      }}
    >
      <Text
        style={{
          color: selected ? '#FFFFFF' : theme.colors.text.secondary,
          fontSize: theme.typography.bodySm,
          fontWeight: selected ? '700' : '500',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}

// ── Chip group (scrollable row) ────────────────────────────────────────────────

interface FilterChipGroupProps {
  options: string[]
  selected: string
  onSelect: (option: string) => void
  paddingHorizontal?: number
}

export function FilterChipGroup({
  options,
  selected,
  onSelect,
  paddingHorizontal = theme.spacing.base,
}: FilterChipGroupProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal,
        gap: 10,
        paddingVertical: 4,
      }}
    >
      {options.map((option) => (
        <FilterChip
          key={option}
          label={option}
          selected={selected === option}
          onPress={() => onSelect(option)}
        />
      ))}
    </ScrollView>
  )
}

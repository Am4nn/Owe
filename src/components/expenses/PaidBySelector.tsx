import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { Avatar } from '@/components/ui/Avatar'
import { theme } from '@/lib/theme'

/**
 * PaidBySelector
 *
 * Horizontally scrollable row of member avatars used to select who paid
 * for an expense. The selected member gets a purple ring + label highlight.
 *
 * Used in:
 * - add_expense_strict_dark_theme
 *
 * Design:
 * - Section label "Paid by" on the left
 * - Horizontal scroll of avatars with first name below
 * - Selected: purple border ring (2px), name bold purple
 * - Tapping a member marks them as payer
 *
 * Usage:
 *   <PaidBySelector
 *     members={[{ id: '1', name: 'You' }, { id: '2', name: 'Sarah' }]}
 *     selectedId="1"
 *     onSelect={(id) => setPayerId(id)}
 *   />
 */

export interface PaidBySelectorMember {
  id: string
  name: string
  avatar?: string | null
}

export interface PaidBySelectorProps {
  members: PaidBySelectorMember[]
  selectedId?: string
  onSelect: (id: string) => void
}

export function PaidBySelector({ members, selectedId, onSelect }: PaidBySelectorProps) {
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
        Paid by
      </Text>

      {/* Avatar row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: theme.spacing.base, paddingVertical: 4 }}
      >
        {members.map((member) => {
          const isSelected = member.id === selectedId
          const firstName = member.name.split(' ')[0]

          return (
            <TouchableOpacity
              key={member.id}
              onPress={() => onSelect(member.id)}
              activeOpacity={0.7}
              style={{ alignItems: 'center', gap: 6 }}
            >
              {/* Avatar with purple ring when selected */}
              <View
                style={{
                  padding: 2,
                  borderRadius: 22,
                  borderWidth: 2,
                  borderColor: isSelected ? theme.colors.brand.primary : 'transparent',
                  backgroundColor: isSelected ? 'rgba(123, 92, 246, 0.15)' : 'transparent',
                }}
              >
                <Avatar size="md" fallback={member.name} uri={member.avatar} />
              </View>

              {/* Name */}
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: isSelected ? '700' : '500',
                  color: isSelected ? theme.colors.brand.primary : theme.colors.text.secondary,
                  maxWidth: 56,
                  textAlign: 'center',
                }}
                numberOfLines={1}
              >
                {firstName}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

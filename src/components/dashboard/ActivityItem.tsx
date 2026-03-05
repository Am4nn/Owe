import { View, Text, TouchableOpacity } from 'react-native'
import { Avatar } from '@/components/ui/Avatar'
import { formatMoney } from '@/lib/format'

interface ActivityItemProps {
  id: string
  actorName: string
  actorAvatar?: string | null
  actionText: string // e.g. "added", "settled up with"
  targetName: string // e.g. "Lunch at Nando's", "you"
  amountCents?: number
  timestamp: string
  onPress: () => void
}

export function ActivityItem({
  actorName,
  actorAvatar,
  actionText,
  targetName,
  amountCents,
  timestamp,
  onPress
}: ActivityItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-row items-start px-4 py-3 active:bg-[rgba(255,255,255,0.02)]"
    >
      <Avatar
        fallback={actorName}
        size="md"
      />

      <View className="flex-1 ml-3 mr-2">
        <Text className="text-base text-text-secondary leading-snug">
          <Text className="text-white font-semibold">{actorName}</Text>
          {' '}{actionText}{' '}
          <Text className="text-white font-medium">{targetName}</Text>
        </Text>
        <Text className="text-text-tertiary text-xs mt-1">{timestamp}</Text>
      </View>

      {amountCents !== undefined && amountCents > 0 && (
        <View className="items-end justify-center pt-1">
          <Text className="text-white font-semibold">{formatMoney(amountCents)}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

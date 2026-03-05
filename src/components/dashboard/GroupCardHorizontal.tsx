import { View, Text, TouchableOpacity, Image } from 'react-native'
import { GlassCard } from '@/components/ui/GlassCard'
import { Users } from 'lucide-react-native'
import { formatMoney } from '@/lib/format'

interface GroupCardHorizontalProps {
  name: string
  memberCount: number
  balanceCents: number // positive = owed, negative = owe, 0 = settled
  onPress: () => void
  coverImage?: string
}

export function GroupCardHorizontal({ name, memberCount, balanceCents, onPress, coverImage }: GroupCardHorizontalProps) {
  const isOwed = balanceCents > 0
  const isOwing = balanceCents < 0

  let balanceDisplay = <Text className="text-text-tertiary text-xs font-medium mt-1">Settled up</Text>
  if (isOwed) {
    balanceDisplay = <Text className="text-status-success text-xs font-semibold mt-1">Owed {formatMoney(balanceCents)}</Text>
  } else if (isOwing) {
    balanceDisplay = <Text className="text-status-error text-xs font-semibold mt-1">Owes {formatMoney(Math.abs(balanceCents))}</Text>
  }

  // Placeholder cover image generator based on name
  const placeholderUri = `https://api.dicebear.com/7.x/shapes/png?seed=${encodeURIComponent(name)}&backgroundColor=0e1117,1e1e24&shape1Color=7B5CF6,10B981,EF4444`

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <GlassCard padding={0} variant="elevated" className="w-[160px] h-[190px] mr-4 overflow-hidden">
        {/* Cover Image */}
        <View className="h-[90px] w-full bg-dark-elevated">
          <Image
            source={{ uri: coverImage || placeholderUri }}
            className="w-full h-full opacity-80"
            resizeMode="cover"
          />
        </View>

        {/* Content */}
        <View className="p-3 flex-1 justify-between">
          <View>
            <Text className="text-white font-semibold text-sm line-clamp-1" numberOfLines={1}>{name}</Text>
            <View className="flex-row items-center gap-1 mt-1">
              <Users size={12} color="#94A3B8" />
              <Text className="text-text-tertiary text-xs">{memberCount} members</Text>
            </View>
          </View>
          {balanceDisplay}
        </View>
      </GlassCard>
    </TouchableOpacity>
  )
}

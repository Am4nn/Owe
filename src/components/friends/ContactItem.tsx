import { View, Text, TouchableOpacity } from 'react-native'
import { Avatar } from '@/components/ui/Avatar'
import { Plus } from 'lucide-react-native'

interface ContactItemProps {
  id: string
  name: string
  phoneOrEmail: string
  avatarUri?: string
  isAdded?: boolean
  onAdd: () => void
}

export function ContactItem({ name, phoneOrEmail, avatarUri, isAdded, onAdd }: ContactItemProps) {
  return (
    <View className="flex-row items-center justify-between py-3 px-4 border-b border-dark-divider">
      <View className="flex-row items-center flex-1">
        <Avatar fallback={name} uri={avatarUri} size="md" />
        <View className="ml-3 flex-1">
          <Text className="text-white font-semibold text-base">{name}</Text>
          <Text className="text-text-tertiary text-xs mt-0.5">{phoneOrEmail}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={onAdd}
        disabled={isAdded}
        className={`w-8 h-8 rounded-full items-center justify-center ${isAdded ? 'bg-status-success/20' : 'bg-brand-primary'}`}
      >
        {isAdded ? (
          <Text className="text-status-success font-bold text-xs">✓</Text>
        ) : (
          <Plus size={16} color="white" />
        )}
      </TouchableOpacity>
    </View>
  )
}

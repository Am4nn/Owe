import { TouchableOpacity, Text, View } from 'react-native'
import { LucideIcon } from 'lucide-react-native'

interface CategoryPillProps {
  icon: LucideIcon
  label: string
  selected?: boolean
  onPress?: () => void
}

export function CategoryPill({ icon: Icon, label, selected = false, onPress }: CategoryPillProps) {
  const bgClass = selected ? 'bg-brand-primary border-brand-primary' : 'bg-dark-elevated border-[rgba(255,255,255,0.08)]'
  const textClass = selected ? 'text-white' : 'text-text-secondary'
  const iconColor = selected ? 'white' : '#94A3B8'

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center h-[40px] px-4 rounded-full border ${bgClass} mr-2`}
    >
      <Icon size={16} color={iconColor} className="mr-2" />
      <Text className={`font-medium text-sm ${textClass}`}>{label}</Text>
    </TouchableOpacity>
  )
}

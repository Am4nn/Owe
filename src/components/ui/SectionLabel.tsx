import { View, Text, TouchableOpacity } from 'react-native'

interface SectionLabelProps {
  label: string
  action?: {
    label: string
    onPress: () => void
  }
}

export function SectionLabel({ label, action }: SectionLabelProps) {
  return (
    <View className="flex-row items-center justify-between mb-3 px-1">
      <Text className="section-label">{label}</Text>

      {action && (
        <TouchableOpacity onPress={action.onPress}>
          <Text className="text-brand-primary text-sm font-medium">{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

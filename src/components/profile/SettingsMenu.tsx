import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { ChevronRight, LucideIcon } from 'lucide-react-native'

export interface SettingsMenuItem {
  id: string
  icon?: LucideIcon
  label: string
  onPress: () => void
  value?: string // e.g., 'English', 'Dark Mode'
}

export interface SettingsSection {
  title?: string
  items: SettingsMenuItem[]
}

export function SettingsMenu({ sections }: { sections: SettingsSection[] }) {
  return (
    <View className="mb-6">
      {sections.map((section, sIndex) => (
        <View key={sIndex} className="mb-6">
          {section.title && (
            <Text className="text-[10px] text-text-tertiary font-bold tracking-wider ml-4 mb-2 uppercase">
              {section.title}
            </Text>
          )}
          <View className="bg-dark-elevated rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.05)] shadow-card">
            {section.items.map((item, iIndex) => {
              const Icon = item.icon
              return (
                <View key={item.id}>
                  <TouchableOpacity
                    className="flex-row items-center px-4 py-4 active:bg-[rgba(255,255,255,0.02)]"
                    activeOpacity={0.7}
                    onPress={item.onPress}
                  >
                    {Icon && <Icon size={20} color="#F8FAFC" className="mr-3" />}
                    <Text className="text-white text-base font-medium flex-1">{item.label}</Text>
                    <View className="flex-row items-center">
                      {item.value && (
                        <Text className="text-text-tertiary text-sm mr-2">{item.value}</Text>
                      )}
                      <ChevronRight size={16} color="#475569" />
                    </View>
                  </TouchableOpacity>
                  {iIndex < section.items.length - 1 && (
                    <View className="h-px bg-dark-divider ml-4" />
                  )}
                </View>
              )
            })}
          </View>
        </View>
      ))}
    </View>
  )
}

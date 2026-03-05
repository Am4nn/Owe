import { View, Text } from 'react-native'
import { LucideIcon } from 'lucide-react-native'
import { GlassCard } from './GlassCard'
import { Button } from './Button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  primaryAction?: {
    label: string
    onPress: () => void
  }
  secondaryAction?: {
    label: string
    onPress: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, primaryAction, secondaryAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-8">
      <GlassCard padding={32} className="w-full max-w-sm items-center">
        <View
          className="w-16 h-16 rounded-full bg-brand-primary border-[rgba(255,255,255,0.08)] items-center justify-center mb-6 shadow-[0_0_40px_rgba(123,92,246,0.25)]"
        >
          <Icon size={32} color="white" />
        </View>

        <Text className="text-2xl font-semibold text-white mb-3 text-center">
          {title}
        </Text>

        <Text className="text-base text-text-secondary text-center mb-8">
          {description}
        </Text>

        <View className="w-full gap-3">
          {primaryAction && (
            <Button
              title={primaryAction.label}
              onPress={primaryAction.onPress}
              fullWidth
            />
          )}
          {secondaryAction && (
            <Button
              variant="secondary"
              title={secondaryAction.label}
              onPress={secondaryAction.onPress}
              fullWidth
            />
          )}
        </View>
      </GlassCard>
    </View>
  )
}

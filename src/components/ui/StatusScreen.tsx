import { View, Text } from 'react-native'
import { LucideIcon } from 'lucide-react-native'
import { GlassCard } from './GlassCard'
import { Button } from './Button'
import { ScreenContainer } from './ScreenContainer'

interface StatusScreenProps {
  type?: 'error' | 'offline' | 'maintenance'
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
  footer?: string
}

export function StatusScreen({
  type = 'error',
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  footer = 'OWE APP'
}: StatusScreenProps) {
  return (
    <ScreenContainer padded>
      <View className="flex-1 items-center justify-center">
        <GlassCard variant="elevated" padding={40} className="w-full max-w-sm items-center">
          <View
            className="w-24 h-24 rounded-full bg-brand-primary border-[rgba(255,255,255,0.08)] items-center justify-center mb-8 shadow-glow-lg"
          >
            <Icon size={48} color="white" />
          </View>

          <Text className="text-[28px] font-bold text-white mb-4 text-center">
            {title}
          </Text>

          <Text className="text-base text-text-secondary text-center mb-10 tracking-wide">
            {description}
          </Text>

          <View className="w-full gap-4 mt-2">
            {primaryAction && (
              <Button
                title={primaryAction.label}
                onPress={primaryAction.onPress}
                size="lg"
                fullWidth
              />
            )}
            {secondaryAction && (
              <Button
                variant="secondary"
                title={secondaryAction.label}
                onPress={secondaryAction.onPress}
                size="lg"
                fullWidth
              />
            )}
          </View>
        </GlassCard>
      </View>

      <View className="items-center pb-8">
        <Text className="text-text-tertiary text-xs font-medium tracking-[0.1em]">{footer}</Text>
      </View>
    </ScreenContainer>
  )
}

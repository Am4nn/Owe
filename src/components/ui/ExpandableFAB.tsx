import React from 'react'
import { View, Text, TouchableOpacity, Alert } from 'react-native'
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from 'react-native-reanimated'
import { router } from 'expo-router'

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export function ExpandableFAB() {
  const isOpen = useSharedValue<number>(0)

  function toggle() {
    isOpen.value = withSpring(isOpen.value === 0 ? 1 : 0, {
      damping: 15,
      stiffness: 200,
    })
  }

  function closeAndNavigate(action: () => void) {
    isOpen.value = withSpring(0, { damping: 15, stiffness: 200 })
    action()
  }

  const childButtons = [
    {
      label: 'Manual Entry',
      offsetY: -80,
      onPress: () => closeAndNavigate(() => router.push('/(app)/expenses/new' as Parameters<typeof router.push>[0])),
    },
    {
      label: 'New Group',
      offsetY: -160,
      onPress: () => closeAndNavigate(() => router.push('/(app)/groups/new' as Parameters<typeof router.push>[0])),
    },
    {
      label: 'Add Transfer',
      offsetY: -240,
      onPress: () => closeAndNavigate(() => Alert.alert('Coming soon', 'Transfer recording coming soon')),
    },
    {
      label: 'Scan Receipt',
      offsetY: -320,
      onPress: () => closeAndNavigate(() => Alert.alert('Coming in v2', 'Receipt scanning arrives in v2')),
    },
  ]

  return (
    <View className="absolute bottom-8 right-6" style={{ elevation: 8 }}>
      {/* Child buttons rendered behind main FAB */}
      {childButtons.map((child, index) => (
        <ChildFABButton
          key={index}
          label={child.label}
          offsetY={child.offsetY}
          isOpen={isOpen}
          onPress={child.onPress}
        />
      ))}

      {/* Main FAB */}
      <TouchableOpacity
        onPress={toggle}
        className="bg-brand-primary w-14 h-14 rounded-full items-center justify-center"
        style={{ elevation: 8 }}
      >
        <Text className="text-white text-2xl font-light">+</Text>
      </TouchableOpacity>
    </View>
  )
}

interface ChildFABButtonProps {
  label: string
  offsetY: number
  isOpen: SharedValue<number>
  onPress: () => void
}

function ChildFABButton({ label, offsetY, isOpen, onPress }: ChildFABButtonProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: isOpen.value,
    transform: [
      {
        translateY: interpolate(isOpen.value, [0, 1], [0, offsetY]),
      },
    ],
  }))

  return (
    <AnimatedTouchable
      onPress={onPress}
      style={[animatedStyle, { position: 'absolute', bottom: 0, right: 0 }]}
      className="bg-dark-surface border border-dark-border rounded-full px-4 py-3 flex-row items-center"
    >
      <Text className="text-white text-sm font-medium">{label}</Text>
    </AnimatedTouchable>
  )
}

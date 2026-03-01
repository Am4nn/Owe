import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from 'react-native-reanimated'
import { router } from 'expo-router'

export function ExpandableFAB() {
  const isOpen = useSharedValue<number>(0)
  // JS-side mirror of isOpen for pointer-events and toast — Reanimated shared
  // values are UI-thread only; React state is needed for JS-side logic on web.
  const [isOpenState, setIsOpenState] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  function toggle() {
    const next = isOpen.value === 0 ? 1 : 0
    isOpen.value = withSpring(next, { damping: 15, stiffness: 200 })
    setIsOpenState(next === 1)
  }

  function closeAndNavigate(action: () => void) {
    isOpen.value = withSpring(0, { damping: 15, stiffness: 200 })
    setIsOpenState(false)
    action()
  }

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 2500)
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
      onPress: () => closeAndNavigate(() => showToast('Transfer recording coming soon')),
    },
    {
      label: 'Scan Receipt',
      offsetY: -320,
      onPress: () => closeAndNavigate(() => showToast('Receipt scanning arrives in v2')),
    },
  ]

  return (
    // zIndex: on web, elevation is ignored — explicit zIndex keeps buttons above content
    <View className="absolute bottom-8 right-6" style={{ elevation: 8, zIndex: 1000 }}>
      {/* Coming-soon toast — shown inline near the FAB to avoid Alert.alert on web */}
      {toastMsg && (
        <View
          className="absolute bg-dark-surface border border-dark-border rounded-xl px-3 py-2"
          style={{ bottom: 72, right: 0, minWidth: 200 }}
          pointerEvents="none"
        >
          <Text className="text-white/80 text-sm">{toastMsg}</Text>
        </View>
      )}

      {/* Child buttons rendered behind main FAB */}
      {childButtons.map((child, index) => (
        <ChildFABButton
          key={index}
          label={child.label}
          offsetY={child.offsetY}
          isOpen={isOpen}
          isVisible={isOpenState}
          onPress={child.onPress}
        />
      ))}

      {/* Main FAB */}
      <TouchableOpacity
        onPress={toggle}
        className="bg-brand-primary w-14 h-14 rounded-full items-center justify-center"
        style={{ elevation: 8, zIndex: 1001 }}
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
  isVisible: boolean
  onPress: () => void
}

function ChildFABButton({ label, offsetY, isOpen, isVisible, onPress }: ChildFABButtonProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: isOpen.value,
    transform: [
      {
        translateY: interpolate(isOpen.value, [0, 1], [0, offsetY]),
      },
    ],
  }))

  return (
    // Animated.View has better web support than createAnimatedComponent(TouchableOpacity).
    // pointerEvents mirrors isOpenState so invisible buttons never intercept touches.
    <Animated.View
      pointerEvents={isVisible ? 'auto' : 'none'}
      style={[animatedStyle, { position: 'absolute', bottom: 0, right: 0, zIndex: 999 }]}
    >
      <TouchableOpacity
        onPress={onPress}
        className="bg-dark-surface border border-dark-border rounded-full px-4 py-3 flex-row items-center"
      >
        <Text className="text-white text-sm font-medium">{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

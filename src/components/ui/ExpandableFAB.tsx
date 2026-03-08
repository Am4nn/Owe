import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  interpolate,
  SharedValue,
  withDelay,
  withTiming,
  withSequence,
} from 'react-native-reanimated'
import { router } from 'expo-router'
import { Plus, X, Camera, Edit2, ArrowRightLeft } from 'lucide-react-native'

export function ExpandableFAB() {
  const isOpen = useSharedValue(0)
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
    setTimeout(action, 200) // wait for animation
  }

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 2500)
  }

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: isOpen.value,
    pointerEvents: isOpen.value > 0 ? 'auto' : 'none'
  }))

  const mainIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(isOpen.value, [0, 1], [0, 135])}deg` }]
  }))

  // The radial positions: left-up, straight-up, right-up
  // Angle starting from top (0) -> -45deg, 0deg, 45deg
  const childButtons = [
    {
      label: 'Scan',
      icon: Camera,
      color: '#06D6A0',
      angle: -45,
      radius: 100,
      delay: 50,
      onPress: () => closeAndNavigate(() => showToast('Receipt scanning arrives in v2')),
    },
    {
      label: 'Manual',
      icon: Edit2,
      color: '#7B5CF6',
      angle: 0,
      radius: 110,
      delay: 0,
      onPress: () => closeAndNavigate(() => router.push('/(app)/expenses/new' as Parameters<typeof router.push>[0])),
    },
    {
      label: 'Transfer',
      icon: ArrowRightLeft,
      color: '#3B82F6',
      angle: 45,
      radius: 100,
      delay: 100,
      onPress: () => closeAndNavigate(() => showToast('Transfer recording coming soon')),
    },
  ]

  return (
    <>
      <Animated.View
        style={[StyleSheet.absoluteFill, backdropStyle, { zIndex: 990, elevation: 7 }]}
        className="bg-black/40"
      >
        <Pressable className="flex-1" onPress={toggle} />
      </Animated.View>

      <View className="absolute bottom-8 right-6" style={{ elevation: 8, zIndex: 1000 }}>
        {toastMsg && (
          <View
            className="absolute bg-dark-surface border border-dark-border rounded-xl px-3 py-2"
            style={{ bottom: 72, right: 0, minWidth: 200 }}
            pointerEvents="none"
          >
            <Text className="text-white/80 text-sm">{toastMsg}</Text>
          </View>
        )}

        {childButtons.map((child, index) => (
          <RadialChildButton
            key={index}
            {...child}
            isOpen={isOpen}
            isVisible={isOpenState}
          />
        ))}

        <TouchableOpacity
          onPress={toggle}
          className="gradient-cta w-[56px] h-[56px] rounded-full items-center justify-center shadow-fab"
          style={{ elevation: 8, zIndex: 1001 }}
        >
          <Animated.View style={mainIconStyle}>
            {/* The + rotates to become roughly an X. 
                Using Lucide Plus since X does not match the exact 135deg rotation of Plus visually perfectly if we swap them */}
            <Plus size={28} color="white" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  )
}

interface RadialChildButtonProps {
  label: string
  icon: any
  color: string
  angle: number
  radius: number
  delay: number
  isOpen: SharedValue<number>
  isVisible: boolean
  onPress: () => void
}

function RadialChildButton({ label, icon: Icon, color, angle, radius, delay, isOpen, isVisible, onPress }: RadialChildButtonProps) {
  const animatedStyle = useAnimatedStyle(() => {
    // Math checks out: 0 degrees is straight UP.
    // X = sin(angle) * r
    // Y = -cos(angle) * r  (negative goes UP in React Native coords)

    // Convert angle to radians
    const radians = angle * (Math.PI / 180)
    const targetX = Math.sin(radians) * radius
    const targetY = -Math.cos(radians) * radius

    const delayVal = isVisible ? delay : (100 - delay) // reverse delay on close
    const springConfig = { damping: 14, stiffness: 200 }

    return {
      opacity: withDelay(delayVal, withTiming(isOpen.value, { duration: 150 })),
      transform: [
        { scale: withDelay(delayVal, withSpring(isOpen.value, springConfig)) },
        { translateX: withDelay(delayVal, withSpring(isOpen.value * targetX, springConfig)) },
        { translateY: withDelay(delayVal, withSpring(isOpen.value * targetY, springConfig)) },
      ],
    }
  })

  return (
    <Animated.View
      pointerEvents={isVisible ? 'auto' : 'none'}
      style={[animatedStyle, { position: 'absolute', top: 4, left: 4, zIndex: 999 }]}
    >
      <TouchableOpacity onPress={onPress} className="items-center">
        <View
          className="w-12 h-12 rounded-full items-center justify-center shadow-card"
          style={{ backgroundColor: color }}
        >
          <Icon size={20} color="white" />
        </View>
        <View className="mt-2 bg-dark-elevated/80 px-2 py-1 rounded border border-[rgba(255,255,255,0.08)]">
          <Text className="text-white text-[10px] font-medium">{label}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

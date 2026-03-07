import React, { useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import ConfettiCannon from 'react-native-confetti-cannon'
import * as Haptics from 'expo-haptics'

interface ConfettiScreenProps {
  onDismiss: () => void
}

export function ConfettiScreen({ onDismiss }: ConfettiScreenProps) {
  const confettiRef = useRef<ConfettiCannon>(null)

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    confettiRef.current?.start()
  }, [])

  return (
    <View className="flex-1 bg-dark-bg items-center justify-center">
      <ConfettiCannon
        ref={confettiRef}
        count={200}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        colors={['#6C63FF', '#00F5D4', '#06D6A0', '#FF4D6D']}
        fallSpeed={3000}
        fadeOut
      />
      <Text className="text-white text-3xl font-bold mb-2">All settled!</Text>
      <Text className="text-white/50 text-base mb-8">Debt cleared</Text>
      <TouchableOpacity
        onPress={onDismiss}
        className="bg-brand-primary px-8 py-3 rounded-full"
      >
        <Text className="text-white font-semibold">Done</Text>
      </TouchableOpacity>
    </View>
  )
}

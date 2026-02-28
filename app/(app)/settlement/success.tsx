import React from 'react'
import { Stack, router } from 'expo-router'
import { ConfettiScreen } from '@/components/settlement/ConfettiScreen'

export default function SettlementSuccessScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ConfettiScreen onDismiss={() => router.replace('/(app)')} />
    </>
  )
}

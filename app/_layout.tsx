import { Stack } from 'expo-router'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { onlineManager } from '@tanstack/react-query'
import { ActivityIndicator, View, Platform, StyleSheet } from 'react-native'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import NetInfo from '@react-native-community/netinfo'
import { queryClient } from '@/lib/queryClient'
import { persister } from '@/lib/persister'
import { useSession } from '@/features/auth/hooks'
import { createExpenseMutationFn, updateExpenseMutationFn, deleteExpenseMutationFn } from '@/features/expenses/hooks'
import { registerPushToken, useNotificationDeepLink } from '@/features/notifications/hooks'
import '../global.css'
import '@/stores/ui'

// NativeWind: use class-based dark mode on web to suppress 'media' warning
if (Platform.OS === 'web') {
  (StyleSheet as unknown as { setFlag?: (k: string, v: string) => void }).setFlag?.('darkMode', 'class')
}

// Module-level setup — runs once when the module loads (before any component mounts)
// Wire React Query's online state to device network connectivity (OFFL-02)
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(
      state.isConnected != null &&
      state.isConnected &&
      Boolean(state.isInternetReachable)
    )
  })
})

// Register mutationFns so paused mutations can resume after app restart (OFFL-02)
// mutationKey MUST exactly match the key used in each useMutation hook
queryClient.setMutationDefaults(['expenses', 'create'], {
  mutationFn: createExpenseMutationFn,
})
queryClient.setMutationDefaults(['expenses', 'update'], {
  mutationFn: updateExpenseMutationFn,
})
queryClient.setMutationDefaults(['expenses', 'delete'], {
  mutationFn: deleteExpenseMutationFn,
})

function RootNavigator() {
  const { session, isLoading } = useSession()

  // NOTF-01/02: Register push token when user is authenticated
  // Never runs on simulators (expo-device guard inside registerPushToken)
  useEffect(() => {
    if (session) {
      registerPushToken()
    }
  }, [session])

  // NOTF-01/02: Handle deep-link navigation on notification tap (cold-start + foreground)
  useNotificationDeepLink()

  if (isLoading) {
    return (
      <View className="flex-1 bg-dark-bg items-center justify-center">
        <ActivityIndicator color="#6C63FF" />
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Unauthenticated route group — only accessible when NOT signed in */}
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      {/* Protected route group — only accessible when signed in */}
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: 1000 * 60 * 60 * 24, // 24 hours
        }}
        onSuccess={() => {
          // Replay any mutations that were queued while offline (OFFL-02)
          queryClient.resumePausedMutations().then(() => {
            queryClient.invalidateQueries()
          })
        }}
      >
        <RootNavigator />
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  )
}

import { Stack } from 'expo-router'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { onlineManager, QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import { ActivityIndicator, View, Platform, StyleSheet } from 'react-native'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import NetInfo from '@react-native-community/netinfo'
import { queryClient } from '@/lib/queryClient'
import { persister } from '@/lib/persister'
import { useSession } from '@/features/auth/hooks'
import { initializeAuthStore } from '@/stores/auth'
import { createExpenseMutationFn, updateExpenseMutationFn, deleteExpenseMutationFn } from '@/features/expenses/hooks'
import { registerPushToken, useNotificationDeepLink } from '@/features/notifications/hooks'
import { useClaimInvites } from '@/features/invites/hooks'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { theme } from '@/lib/theme'
import '../global.css'
import '@/stores/ui'

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
  const { status, isAuthenticated } = useSession()

  useEffect(() => {
    initializeAuthStore()
  }, [])

  // NOTF-01/02: Register push token when user is authenticated
  const { mutate: claimInvites } = useClaimInvites()
  useEffect(() => {
    if (isAuthenticated) {
      registerPushToken()
      claimInvites() // Auto-claim pending invites matching user's email
    }
  }, [isAuthenticated, claimInvites])

  useNotificationDeepLink()

  if (status === 'loading') {
    return (
      <View className="flex-1 bg-dark-bg items-center justify-center">
        <ActivityIndicator color={theme.colors.brand.primary} />
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Dev component showcase — always accessible regardless of auth */}
      <Stack.Screen name="(dev)" />

      {/* Unauthenticated flow always starts with onboarding */}
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      {/* Protected route group */}
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  )
}

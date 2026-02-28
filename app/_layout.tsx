import { Stack } from 'expo-router'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { onlineManager } from '@tanstack/react-query'
import { ActivityIndicator, View } from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import { queryClient } from '@/lib/queryClient'
import { persister } from '@/lib/persister'
import { useSession } from '@/features/auth/hooks'
import { createExpenseMutationFn } from '@/features/expenses/hooks'
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

// Register mutationFn so paused mutations can resume after app restart (OFFL-02)
// mutationKey MUST exactly match ['expenses', 'create'] in useCreateExpense
queryClient.setMutationDefaults(['expenses', 'create'], {
  mutationFn: createExpenseMutationFn,
})

function RootNavigator() {
  const { session, isLoading } = useSession()

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
  )
}

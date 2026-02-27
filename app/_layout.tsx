import { Stack } from 'expo-router'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { ActivityIndicator, View } from 'react-native'
import { queryClient } from '@/lib/queryClient'
import { persister } from '@/lib/persister'
import { useSession } from '@/features/auth/hooks'
import '@/stores/ui'

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
    >
      <RootNavigator />
    </PersistQueryClientProvider>
  )
}

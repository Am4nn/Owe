import { Stack } from 'expo-router'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient } from '@/lib/queryClient'
import { persister } from '@/lib/persister'
// Force dark mode store import (side-effect: sets colorScheme to 'dark')
import '@/stores/ui'

export default function RootLayout() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours — matches gcTime
      }}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </PersistQueryClientProvider>
  )
}

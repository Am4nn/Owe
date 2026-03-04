import { Stack } from 'expo-router'
import { useSession } from '@/features/auth/hooks'
import { useClaimInvites } from '@/features/invites/hooks'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

export const COLORS = {
  headerBg: '#1C1C1E', // dark-bg
  contentBg: '#1C1C1E', // dark-bg
  textPrimary: '#ffffff',
  brandPrimary: '#6C63FF',
} as const

export default function AppLayout() {
  return (
    <ErrorBoundary fallbackTitle="This screen encountered an error">
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.headerBg },
          headerTintColor: COLORS.textPrimary,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: COLORS.contentBg },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Groups' }} />
        <Stack.Screen name="profile" options={{ presentation: 'modal', title: 'Profile' }} />
        <Stack.Screen name="invites" options={{ presentation: 'modal', title: 'Invites' }} />
        <Stack.Screen name="groups/new" options={{ presentation: 'modal', title: 'New group' }} />
        <Stack.Screen name="groups/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="expenses/new" options={{ presentation: 'modal', title: 'Add expense' }} />
        <Stack.Screen name="expenses/[id]/index" options={{ title: 'Expense' }} />
        <Stack.Screen name="expenses/[id]/edit" options={{ presentation: 'modal', title: 'Edit Expense' }} />
        <Stack.Screen name="settlement/new" options={{ presentation: 'modal', title: 'Record settlement' }} />
        <Stack.Screen name="settlement/success" options={{ presentation: 'fullScreenModal', headerShown: false }} />
      </Stack>
    </ErrorBoundary>
  )
}

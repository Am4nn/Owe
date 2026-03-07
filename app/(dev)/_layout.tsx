import { Stack } from 'expo-router'
import { theme } from '@/lib/theme'

export default function DevLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.dark.bg },
      }}
    />
  )
}

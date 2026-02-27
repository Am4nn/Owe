import { Stack } from 'expo-router'

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#131318' },
        headerTintColor: '#ffffff',
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#0A0A0F' },
      }}
    />
  )
}

import { View, Text } from 'react-native'

export function SocialDivider({ className }: { className?: string }) {
  return (
    <View className={`flex-row items-center w-full ${className ?? ''}`}>
      <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />
      <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '500', marginHorizontal: 16, letterSpacing: 1, textTransform: 'uppercase' }}>
        Or
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />
    </View>
  )
}

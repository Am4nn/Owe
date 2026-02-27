import { View, Text } from 'react-native'

export default function SignInScreen() {
  return (
    <View className="flex-1 bg-dark-bg items-center justify-center">
      <Text className="text-white text-2xl font-bold">Sign In</Text>
      <Text className="text-white/50 mt-2">Auth implementation in Plan 01-03</Text>
    </View>
  )
}

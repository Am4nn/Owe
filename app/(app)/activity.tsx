import { View, Text } from 'react-native'
import { ScreenContainer } from '@/components/ui/ScreenContainer'

export default function ActivityScreen() {
  return (
    <ScreenContainer padded>
      <View className="flex-1 justify-center items-center">
        <Text className="text-white text-lg">Activity Feed (Coming Soon)</Text>
      </View>
    </ScreenContainer>
  )
}

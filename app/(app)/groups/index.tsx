import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Stack, router } from 'expo-router'
import { useGroups } from '@/features/groups/hooks'

export default function GroupsListScreen() {
  const { data: groups, isLoading } = useGroups()

  return (
    <View className="flex-1 bg-dark-bg">
      <Stack.Screen options={{ title: 'Groups' }} />
      <FlatList
        data={groups ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/(app)/groups/${item.id}`)}
            className="bg-dark-surface border border-dark-border mx-4 mb-3 rounded-2xl px-4 py-4"
          >
            <Text className="text-white font-semibold text-base">{item.name}</Text>
            <Text className="text-white/40 text-sm mt-1">{item.base_currency}</Text>
          </TouchableOpacity>
        )}
        contentContainerClassName="pt-4 pb-8"
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color="#6C63FF" className="mt-12" />
          ) : (
            <View className="items-center py-12">
              <Text className="text-white/50">No groups yet</Text>
            </View>
          )
        }
      />
    </View>
  )
}

import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Stack, router } from 'expo-router'
import { useGroups } from '@/features/groups/hooks'
import type { Group } from '@/features/groups/types'

function GroupCard({ group }: { group: Group }) {
  return (
    <TouchableOpacity
      onPress={() => router.push(`/(app)/groups/${group.id}`)}
      className="bg-dark-surface border border-dark-border rounded-2xl px-4 py-4 mb-3"
    >
      <Text className="text-white font-semibold text-base">{group.name}</Text>
      <Text className="text-white/40 text-sm mt-1">{group.base_currency}</Text>
    </TouchableOpacity>
  )
}

export default function DashboardScreen() {
  const { data: groups, isLoading, isError } = useGroups()

  return (
    <View className="flex-1 bg-dark-bg">
      <Stack.Screen
        options={{
          title: 'Owe',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/(app)/profile')} className="mr-2">
              <Text className="text-brand-primary font-semibold">Profile</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        data={groups ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <GroupCard group={item} />}
        contentContainerClassName="px-4 pt-4 pb-8"
        ListHeaderComponent={
          <View className="mb-4">
            <Text className="text-white/50 text-sm uppercase tracking-wide mb-4">Your groups</Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color="#6C63FF" />
          ) : (
            <View className="items-center py-12">
              <Text className="text-white/50 text-base">No groups yet</Text>
              <Text className="text-white/30 text-sm mt-1">Create one to get started</Text>
            </View>
          )
        }
      />

      {/* FAB to create group */}
      <TouchableOpacity
        onPress={() => router.push('/(app)/groups/new')}
        className="absolute bottom-8 right-6 bg-brand-primary w-14 h-14 rounded-full items-center justify-center"
        style={{ elevation: 8 }}
      >
        <Text className="text-white text-2xl font-light">+</Text>
      </TouchableOpacity>
    </View>
  )
}

import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Stack, useLocalSearchParams, router } from 'expo-router'
import { useSimplifiedDebts } from '@/features/balances/hooks'
import type { DebtSuggestion } from '@/features/balances/types'

export default function SimplifiedDebtsScreen() {
  const { id: groupId } = useLocalSearchParams<{ id: string }>()
  const { data: suggestions, isLoading } = useSimplifiedDebts(groupId)

  function renderSuggestion({ item: s }: { item: DebtSuggestion }) {
    const amount = (s.amount_cents / 100).toFixed(2)

    return (
      <View className="bg-dark-surface border border-dark-border rounded-2xl px-4 py-4 mb-3 flex-row items-center justify-between">
        <View className="flex-1 mr-4">
          <Text className="text-white font-semibold text-base" numberOfLines={1}>
            {s.from_display_name}
          </Text>
          <Text className="text-white/50 text-sm mt-0.5">
            pays {s.to_display_name}
          </Text>
          <Text className="text-green-400 font-bold text-base mt-1">
            ${amount}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            // Settlement flow built in Plan 02-03 — route placeholder for now
            router.push(
              `/(app)/settlement/new?payer_member_id=${s.from_member_id}&payee_member_id=${s.to_member_id}&amount_cents=${s.amount_cents}&group_id=${groupId}` as Parameters<typeof router.push>[0]
            )
          }
          className="bg-brand-primary rounded-xl px-4 py-2"
        >
          <Text className="text-white font-semibold text-sm">Settle</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-dark-bg">
      <Stack.Screen options={{ title: 'Simplified Debts' }} />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#6C63FF" />
        </View>
      ) : (
        <FlatList
          data={suggestions ?? []}
          keyExtractor={(item) => `${item.from_member_id}-${item.to_member_id}`}
          renderItem={renderSuggestion}
          contentContainerClassName="px-4 pt-4 pb-8"
          ListHeaderComponent={
            <Text className="text-white/50 text-sm mb-4">
              Minimum payments to clear all debts in this group
            </Text>
          }
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-white text-2xl mb-2">✓</Text>
              <Text className="text-white/50 text-base">All debts are settled!</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

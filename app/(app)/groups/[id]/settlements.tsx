import React from 'react'
import { View, Text, FlatList, ActivityIndicator } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useSettlementHistory } from '@/features/settlements/hooks'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function GroupSettlementsScreen() {
  const { id: groupId } = useLocalSearchParams<{ id: string }>()
  const { data: settlements, isLoading } = useSettlementHistory(groupId)

  return (
    <View className="flex-1 bg-dark-bg">
      <Stack.Screen options={{ title: 'Settlement History' }} />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#6C63FF" />
        </View>
      ) : !settlements || settlements.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-white/50">No settlements yet</Text>
        </View>
      ) : (
        <FlatList
          data={settlements}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View className="bg-dark-surface border border-dark-border rounded-xl px-4 py-3 mb-2">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-white font-semibold text-base" numberOfLines={1}>
                    {item.payer_display_name}{' '}
                    <Text className="text-white/50 font-normal">paid</Text>{' '}
                    {item.payee_display_name}
                  </Text>
                  {item.note ? (
                    <Text className="text-white/50 text-sm mt-0.5" numberOfLines={2}>
                      {item.note}
                    </Text>
                  ) : null}
                  <Text className="text-white/30 text-xs mt-1">
                    {formatDate(item.settled_at)}
                  </Text>
                </View>
                <Text className="text-green-400 font-bold text-base">
                  ${(item.amount_cents / 100).toFixed(2)}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  )
}

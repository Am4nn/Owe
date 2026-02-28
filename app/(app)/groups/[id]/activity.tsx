import React from 'react'
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { useActivityFeed } from '@/features/activity/hooks'
import type { ActivityItem } from '@/features/activity/types'

const ACTION_LABELS: Record<ActivityItem['action_type'], string> = {
  expense_added: 'added an expense',
  expense_edited: 'edited an expense',
  expense_deleted: 'deleted an expense',
  settlement_recorded: 'recorded a settlement',
  comment_added: 'commented',
  reaction_added: 'reacted',
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const diffMs = now - new Date(dateStr).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)

  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHours < 24) return `${diffHours}h ago`

  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const label = ACTION_LABELS[item.action_type] ?? item.action_type
  const description = item.metadata?.description as string | undefined

  function handlePress() {
    if (item.expense_id) {
      router.push(`/(app)/expenses/${item.expense_id}` as Parameters<typeof router.push>[0])
    }
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!item.expense_id}
      className="bg-dark-surface rounded-xl px-4 py-3 mb-2"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-white font-semibold text-sm" numberOfLines={1}>
            {item.actor_display_name ?? 'Someone'}{' '}
            <Text className="text-white/60 font-normal">{label}</Text>
          </Text>
          {description ? (
            <Text className="text-white/50 text-xs mt-0.5" numberOfLines={1}>
              {description}
            </Text>
          ) : null}
        </View>
        <Text className="text-white/30 text-xs">{formatRelativeTime(item.created_at)}</Text>
      </View>
    </TouchableOpacity>
  )
}

export default function GroupActivityScreen() {
  const { id: groupId } = useLocalSearchParams<{ id: string }>()
  const { data: items, isLoading } = useActivityFeed(groupId)

  return (
    <View className="flex-1 bg-dark-bg">
      <Stack.Screen options={{ title: 'Activity' }} />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#6C63FF" />
        </View>
      ) : !items || items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-white/50">No activity yet</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ActivityRow item={item} />}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  )
}

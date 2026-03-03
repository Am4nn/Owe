import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Stack, router } from 'expo-router'
import { useGroups, usePendingInvites } from '@/features/groups/hooks'
import { useBalanceSummary } from '@/features/balances/hooks'
import type { Group } from '@/features/groups/types'
import { ExpandableFAB } from '@/components/ui/ExpandableFAB'
import { memo } from 'react'

const GroupCard = memo(function GroupCard({ group }: { group: Group }) {
  return (
    <TouchableOpacity
      onPress={() => router.push(`/(app)/groups/${group.id}`)}
      className="bg-dark-surface border border-dark-border rounded-2xl px-4 py-4 mb-3"
    >
      <Text className="text-white font-semibold text-base">{group.name}</Text>
      <Text className="text-white/40 text-sm mt-1">{group.base_currency}</Text>
    </TouchableOpacity>
  )
})

const BalanceSummaryBar = memo(function BalanceSummaryBar() {
  const { data, isLoading } = useBalanceSummary()

  if (isLoading) {
    return (
      <View className="bg-dark-surface border border-dark-border rounded-2xl px-4 py-3 mx-4 mb-4 items-center">
        <ActivityIndicator color="#6C63FF" />
      </View>
    )
  }

  const owedAmount = ((data?.total_owed_cents ?? 0) / 100).toFixed(2)
  const owingAmount = ((data?.total_owing_cents ?? 0) / 100).toFixed(2)

  return (
    <View className="bg-dark-surface border border-dark-border rounded-2xl px-4 py-3 mx-4 mb-4 flex-row justify-between">
      <View className="items-start">
        <Text className="text-white/50 text-xs uppercase tracking-wide mb-1">You are owed</Text>
        <Text className="text-green-400 text-xl font-bold">${owedAmount}</Text>
      </View>
      <View className="items-end">
        <Text className="text-white/50 text-xs uppercase tracking-wide mb-1">You owe</Text>
        <Text className="text-red-400 text-xl font-bold">${owingAmount}</Text>
      </View>
    </View>
  )
})

export default function DashboardScreen() {
  const { data: allGroups, isLoading } = useGroups()
  const { data: pendingInvites } = usePendingInvites()
  const inviteCount = pendingInvites?.length ?? 0

  // Filter out virtual 1-on-1 (is_direct) groups from the main list (EXPN-09)
  const groups = allGroups?.filter(g => !g.is_direct) ?? []

  return (
    <View className="flex-1 bg-dark-bg">
      <Stack.Screen
        options={{
          title: 'Owe',
          headerRight: () => (
            <View className="flex-row items-center gap-3 mr-2">
              {/* INVT-E2E-03: Pending invites badge */}
              {inviteCount > 0 && (
                <TouchableOpacity onPress={() => router.push('/(app)/invites')}>
                  <View className="flex-row items-center bg-purple-600/20 rounded-full px-3 py-1">
                    <Text className="text-purple-400 font-semibold text-sm">
                      📩 {inviteCount}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => router.push('/(app)/profile')}>
                <Text className="text-brand-primary font-semibold">Profile</Text>
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <GroupCard group={item} />}
        contentContainerClassName="px-4 pt-4 pb-8"
        ListHeaderComponent={
          <View className="mb-4">
            {/* BALS-01: Balance summary bar showing total owed and owing across all groups */}
            <BalanceSummaryBar />
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

      {/* Expandable FAB: Manual Entry | Add Transfer | Scan Receipt */}
      <ExpandableFAB />
    </View>
  )
}

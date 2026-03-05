import { View, Text, FlatList, TouchableOpacity, ScrollView, RefreshControl } from 'react-native'
import { Stack, router } from 'expo-router'
import { useState } from 'react'
import { useGroups } from '@/features/groups/hooks'
import { usePendingInvites } from '@/features/invites/hooks'
import { useBalanceSummary } from '@/features/balances/hooks'
import { useRecentActivity } from '@/features/activity/hooks'
import { BalanceCard } from '@/components/dashboard/BalanceCard'
import { GroupCardHorizontal } from '@/components/dashboard/GroupCardHorizontal'
import { ActivityItem } from '@/components/dashboard/ActivityItem'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { EmptyState } from '@/components/ui/EmptyState'
import { Avatar } from '@/components/ui/Avatar'
import { useSession } from '@/features/auth/hooks'
import { Search, Wallet } from 'lucide-react-native'
import { ScreenContainer } from '@/components/ui/ScreenContainer'

export default function DashboardScreen() {
  const { session } = useSession()
  const [refreshing, setRefreshing] = useState(false)
  const { data: allGroups, isLoading: isLoadingGroups, refetch: refetchGroups } = useGroups()
  const { data: balances, isLoading: isLoadingBalances, refetch: refetchBalances } = useBalanceSummary()
  const { data: activities, isLoading: isLoadingActivity, refetch: refetchActivity } = useRecentActivity()

  const { data: pendingInvites } = usePendingInvites()
  const inviteCount = pendingInvites?.length ?? 0

  const groups = allGroups?.filter(g => !g.is_direct) ?? []
  const isLoading = isLoadingGroups || isLoadingBalances || isLoadingActivity
  const isEmpty = groups.length === 0 && !isLoading

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refetchGroups(), refetchBalances(), refetchActivity()])
    setRefreshing(false)
  }

  const owedAmount = balances?.total_owed_cents ?? 0
  const owingAmount = balances?.total_owing_cents ?? 0

  // Count owed/owing people (mocked logic based on non-zero amounts for now)
  const owedCount = owedAmount > 0 ? 1 : 0
  const owingCount = owingAmount > 0 ? 1 : 0

  return (
    <ScreenContainer scrollable={false} edges={['top']}>
      {/* Header */}
      <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.push('/(app)/profile')}>
            <Avatar size="sm" fallback={session?.user?.email?.[0]?.toUpperCase() || 'U'} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold tracking-tight">Owe</Text>
        </View>

        <View className="flex-row items-center gap-4">
          {inviteCount > 0 && (
            <TouchableOpacity onPress={() => router.push('/(app)/invites')}>
              <View className="bg-brand-primary/20 px-2 py-1 rounded-full border border-brand-primary/30">
                <Text className="text-brand-primary text-xs font-semibold">
                  {inviteCount} Invites
                </Text>
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity className="active:opacity-70 p-1">
            <Search size={24} color="#F8FAFC" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerClassName="pb-32 px-2"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7B5CF6" />
        }
      >
        {/* Balance Cards Row */}
        <View className="flex-row gap-4 px-4 mt-6 mb-8">
          <BalanceCard type="owed" amountCents={owedAmount} personCount={owedCount} />
          <BalanceCard type="owe" amountCents={owingAmount} personCount={owingCount} />
        </View>

        {isEmpty ? (
          <View className="px-4 mt-4">
            <EmptyState
              icon={Wallet}
              title="Your wallet is quiet"
              description="You don't have any groups or expenses yet. Start tracking your shared bills."
              primaryAction={{
                label: 'Create Your First Group',
                onPress: () => router.push('/(app)/groups/new')
              }}
              secondaryAction={{
                label: 'Add a Friend',
                onPress: () => router.push('/(app)/friends/index' as any)
              }}
            />
          </View>
        ) : (
          <>
            {/* Groups Section */}
            <View className="mb-2">
              <View className="px-4">
                <SectionLabel
                  label="YOUR GROUPS"
                  action={{ label: "See All", onPress: () => router.push('/(app)/groups/index' as any) }}
                />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4 pb-4">
                {groups.map(group => (
                  <GroupCardHorizontal
                    key={group.id}
                    name={group.name}
                    memberCount={3} // Mock
                    balanceCents={Math.floor(Math.random() * 10000) - 5000} // Mock balance
                    onPress={() => router.push(`/(app)/groups/${group.id}`)}
                  />
                ))}
                <View className="w-4" />{/* Right padding */}
              </ScrollView>
            </View>

            {/* Activity Section */}
            <View className="mt-4 mb-6">
              <View className="px-4">
                <SectionLabel
                  label="RECENT ACTIVITY"
                  action={{ label: "See All", onPress: () => router.push('/(app)/activity' as any) }}
                />
              </View>
              <View className="bg-dark-elevated rounded-3xl overflow-hidden py-2 mx-4 border border-[rgba(255,255,255,0.05)] shadow-card">
                {activities?.map((activity, index) => {
                  const actionText = {
                    expense_added: 'added an expense',
                    expense_edited: 'edited an expense',
                    expense_deleted: 'deleted an expense',
                    settlement_recorded: 'recorded a settlement',
                    comment_added: 'commented',
                    reaction_added: 'reacted',
                  }[activity.action_type] ?? 'did something'

                  const relativeTime = (() => {
                    const diff = Date.now() - new Date(activity.created_at).getTime()
                    const mins = Math.floor(diff / 60000)
                    if (mins < 60) return `${mins}m ago`
                    const hrs = Math.floor(mins / 60)
                    if (hrs < 24) return `${hrs}h ago`
                    return `${Math.floor(hrs / 24)}d ago`
                  })()

                  return (
                    <View key={activity.id}>
                      <ActivityItem
                        id={activity.id}
                        actorName={activity.actor_display_name ?? 'Someone'}
                        actionText={actionText}
                        targetName={''}
                        timestamp={relativeTime}
                        onPress={() => { }}
                      />
                      {index < activities.length - 1 && (
                        <View className="h-px bg-dark-divider ml-[68px] my-1" />
                      )}
                    </View>
                  )
                })}
              </View>

            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  )
}

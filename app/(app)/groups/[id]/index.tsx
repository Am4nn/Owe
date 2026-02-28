import { View, Text, FlatList, Alert, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Stack, useLocalSearchParams, router } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { useGroup, useLeaveGroup, useInviteMember } from '@/features/groups/hooks'
import { useExpenses } from '@/features/expenses/hooks'
import { useGroupBalances, useRealtimeExpenseSync } from '@/features/balances/hooks'
import { BalanceCard } from '@/components/balances/BalanceCard'
import { ExpenseCard } from '@/components/expenses/ExpenseCard'
import type { GroupMember } from '@/features/groups/types'
import type { Expense } from '@/features/expenses/types'

function MemberRow({ member }: { member: GroupMember }) {
  const isNamedOnly = member.user_id === null
  return (
    <View className="flex-row items-center py-3 border-b border-dark-border">
      <View className="w-10 h-10 rounded-full bg-dark-surface border border-dark-border items-center justify-center mr-3">
        <Text className="text-white font-semibold">
          {member.display_name[0]?.toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-white font-medium">{member.display_name}</Text>
        {isNamedOnly && (
          <Text className="text-white/40 text-xs">Not on Owe</Text>
        )}
      </View>
      {member.role === 'admin' && (
        <Text className="text-brand-accent text-xs font-medium">admin</Text>
      )}
    </View>
  )
}

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data, isLoading } = useGroup(id)
  const { mutate: leaveGroup, isPending: isLeaving } = useLeaveGroup()
  const { mutate: inviteMember } = useInviteMember()
  const { data: balances } = useGroupBalances(id)
  const { data: expenses } = useExpenses(id)

  // BALS-01 Realtime: subscribe to expense changes and invalidate balance/expense queries
  useRealtimeExpenseSync(id)

  const handleLeave = () => {
    // GRUP-05: Allow leaving even with outstanding balances (user decides)
    Alert.alert(
      'Leave group?',
      'You can rejoin if invited again. Outstanding balances will remain visible to other members.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            leaveGroup(id, {
              onSuccess: () => router.back(),
              onError: (e) => Alert.alert('Error', e.message),
            })
          },
        },
      ]
    )
  }

  const handleInvite = () => {
    Alert.prompt(
      'Invite by email',
      'Enter the email address to send an invite',
      (email) => {
        if (!email) return
        inviteMember(
          { group_id: id, email },
          {
            onSuccess: () => Alert.alert('Invite sent', `Invite sent to ${email}`),
            onError: (e) => Alert.alert('Error', e.message),
          }
        )
      },
      'plain-text',
      '',
      'email-address'
    )
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-dark-bg items-center justify-center">
        <ActivityIndicator color="#6C63FF" />
      </View>
    )
  }

  const members = data?.members ?? []

  return (
    <View className="flex-1 bg-dark-bg">
      <Stack.Screen options={{ title: data?.group.name ?? 'Group' }} />

      <FlatList
        data={expenses ?? []}
        keyExtractor={(item: Expense) => item.id}
        renderItem={({ item }: { item: Expense }) => (
          <ExpenseCard expense={item} members={members} />
        )}
        contentContainerClassName="px-4"
        ListHeaderComponent={
          <View className="pt-4">
            {/* Members section */}
            <Text className="text-white/50 text-sm uppercase tracking-wide mb-1">Members</Text>
            {members.map((member) => (
              <MemberRow key={member.id} member={member} />
            ))}

            {/* BALS-02: Per-member net balances */}
            {balances && balances.length > 0 && (
              <View className="mt-6 mb-2">
                <Text className="text-white/50 text-sm uppercase tracking-wide mb-2">Balances</Text>
                {balances.map((balance) => (
                  <BalanceCard key={balance.member_id} balance={balance} />
                ))}
              </View>
            )}

            {/* Navigation buttons: Simplified Debts, Activity, Settlement History */}
            <View className="mt-4 gap-2">
              <TouchableOpacity
                onPress={() => router.push(`/(app)/groups/${id}/balances` as Parameters<typeof router.push>[0])}
                className="border border-brand-primary rounded-2xl px-4 py-3 items-center"
              >
                <Text className="text-brand-primary font-semibold">Simplified Debts</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push(`/(app)/groups/${id}/activity` as Parameters<typeof router.push>[0])}
                className="border border-brand-primary rounded-2xl px-4 py-3 items-center"
              >
                <Text className="text-brand-primary font-semibold">Activity</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push(`/(app)/groups/${id}/settlements` as Parameters<typeof router.push>[0])}
                className="border border-brand-primary rounded-2xl px-4 py-3 items-center"
              >
                <Text className="text-brand-primary font-semibold">Settlement History</Text>
              </TouchableOpacity>
            </View>

            {/* Expenses section header */}
            <Text className="text-white/50 text-sm uppercase tracking-wide mt-6 mb-2">Expenses</Text>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-8">
            <Text className="text-white/50 text-base">No expenses yet</Text>
          </View>
        }
        ListFooterComponent={
          <View className="mt-8 gap-3">
            {/* GRUP-02: Invite by email */}
            <Button title="Invite by email" variant="secondary" onPress={handleInvite} />
            {/* GRUP-05: Leave group */}
            <Button
              title={isLeaving ? 'Leaving...' : 'Leave group'}
              variant="danger"
              onPress={handleLeave}
              disabled={isLeaving}
            />
          </View>
        }
      />
    </View>
  )
}

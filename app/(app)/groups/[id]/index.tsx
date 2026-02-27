import { View, Text, FlatList, Alert, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Stack, useLocalSearchParams, router } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { useGroup, useLeaveGroup, useInviteMember } from '@/features/groups/hooks'
import type { GroupMember } from '@/features/groups/types'

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

  return (
    <View className="flex-1 bg-dark-bg">
      <Stack.Screen options={{ title: data?.group.name ?? 'Group' }} />

      <FlatList
        data={data?.members ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MemberRow member={item} />}
        contentContainerClassName="px-4"
        ListHeaderComponent={
          <View className="mb-4 pt-4">
            <Text className="text-white/50 text-sm uppercase tracking-wide mb-1">Members</Text>
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

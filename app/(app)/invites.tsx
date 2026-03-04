import React from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { usePendingInvites, useAcceptInvite, useDeclineInvite } from '@/features/invites/hooks'

export default function InvitesScreen() {
  const router = useRouter()
  const { data: invites, isLoading, error } = usePendingInvites()
  const { mutate: acceptInvite, isPending: isAccepting } = useAcceptInvite()
  const { mutate: declineInvite } = useDeclineInvite()

  const handleAccept = (inviteId: string, groupId: string) => {
    acceptInvite(inviteId, {
      onSuccess: () => {
        router.push(`/groups/${groupId}`)
      },
      onError: (e) => {
        Alert.alert('Error', e instanceof Error ? e.message : 'Failed to accept invite')
      },
    })
  }

  const handleDecline = (inviteId: string, groupName: string) => {
    Alert.alert(
      'Decline Invite',
      `Are you sure you want to decline the invite to "${groupName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => declineInvite(inviteId),
        },
      ]
    )
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-dark-bg items-center justify-center">
        <ActivityIndicator color="#7B5CF6" />
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 bg-dark-bg items-center justify-center px-6">
        <Text className="text-red-400 text-center">Failed to load invites</Text>
      </View>
    )
  }

  if (!invites || invites.length === 0) {
    return (
      <View className="flex-1 bg-dark-bg items-center justify-center px-6">
        <Text className="text-white/30 text-5xl mb-4">📬</Text>
        <Text className="text-white/60 text-lg font-semibold mb-1">No pending invites</Text>
        <Text className="text-white/40 text-sm text-center">
          When someone invites you to a group, it will show up here.
        </Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-dark-bg">
      <FlatList
        data={invites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => {
          const groupName = (item.groups as any)?.name ?? 'Unknown Group'
          const inviterName = (item.inviter as any)?.display_name ?? 'Someone'
          const expiresDate = new Date(item.expires_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })

          return (
            <View className="bg-dark-card rounded-2xl p-4 border border-white/5">
              {/* Group name */}
              <Text className="text-white text-lg font-bold mb-1">{groupName}</Text>

              {/* Inviter */}
              <Text className="text-white/50 text-sm mb-1">
                Invited by <Text className="text-white/70 font-medium">{inviterName}</Text>
              </Text>

              {/* Expires */}
              <Text className="text-white/30 text-xs mb-4">
                Expires {expiresDate}
              </Text>

              {/* Actions */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => handleAccept(item.id, item.group_id)}
                  disabled={isAccepting}
                  className="flex-1 bg-purple-600 rounded-xl py-3 items-center"
                  activeOpacity={0.7}
                >
                  <Text className="text-white font-semibold">
                    {isAccepting ? 'Accepting...' : 'Accept'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDecline(item.id, groupName)}
                  className="flex-1 bg-white/5 rounded-xl py-3 items-center border border-white/10"
                  activeOpacity={0.7}
                >
                  <Text className="text-white/60 font-semibold">Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        }}
      />
    </View>
  )
}

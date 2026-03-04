import React from 'react'
import { View, Text } from 'react-native'
import type { GroupMember } from '@/features/groups/types'

interface MemberRowProps {
  member: GroupMember
}

export function MemberRow({ member }: MemberRowProps) {
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

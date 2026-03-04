import React from 'react'
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native'
import type { GroupMember } from '@/features/groups/types'

interface MemberPickerModalProps {
  visible: boolean
  members: GroupMember[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onSelect: (memberId: string) => void
  onClose: () => void
  selectedIds?: string[]
}

export function MemberPickerModal({
  visible,
  members,
  searchQuery,
  onSearchChange,
  onSelect,
  onClose,
  selectedIds = [],
}: MemberPickerModalProps) {
  const filteredMembers = searchQuery.trim()
    ? members.filter((m) =>
      m.display_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : members

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-dark-bg">
        <View className="px-4 pt-6 pb-3">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white font-bold text-xl">Select Member</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-brand-primary font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search members..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            className="bg-dark-surface rounded-xl px-4 py-3 text-white border border-dark-border"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <ScrollView>
          {filteredMembers.map((member) => {
            const isSelected = selectedIds.includes(member.id)
            return (
              <TouchableOpacity
                key={member.id}
                onPress={() => onSelect(member.id)}
                className={`flex-row items-center px-4 py-4 border-b border-dark-border ${isSelected ? 'bg-brand-primary/10' : ''
                  }`}
              >
                <View className="w-10 h-10 rounded-full bg-dark-surface border border-dark-border items-center justify-center mr-3">
                  <Text className="text-white font-semibold">
                    {member.display_name[0]?.toUpperCase()}
                  </Text>
                </View>
                <Text className="text-white font-medium flex-1 text-base">
                  {member.display_name}
                </Text>
                {isSelected && (
                  <Text className="text-brand-primary text-sm font-medium">Selected</Text>
                )}
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>
    </Modal>
  )
}

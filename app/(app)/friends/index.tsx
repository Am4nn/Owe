import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { X, Search } from 'lucide-react-native'
import { ScreenContainer } from '@/components/ui/ScreenContainer'
import { Input } from '@/components/ui/Input'
import { ContactItem } from '@/components/friends/ContactItem'

// Mock Data
const CONTACTS = [
  { id: '1', name: 'Alice Smith', phoneOrEmail: 'alice@example.com', isAdded: true },
  { id: '2', name: 'Bob Jones', phoneOrEmail: '+1 555-0198', isAdded: false },
  { id: '3', name: 'Carol White', phoneOrEmail: 'carol@example.com', isAdded: false },
  { id: '4', name: 'David Brown', phoneOrEmail: '+1 555-0234', isAdded: false },
]

export default function AddFriendsScreen() {
  const [search, setSearch] = useState('')

  const filtered = CONTACTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phoneOrEmail.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <ScreenContainer scrollable={false} edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-dark-border">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <X size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold">Add Friends</Text>
        <View className="w-10" /> {/* Spacer */}
      </View>

      <View className="px-4 py-4">
        <Input
          icon={Search}
          placeholder="Search name, email, or phone"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ContactItem
            {...item}
            onAdd={() => router.push(`/(app)/friends/${item.id}` as any)}
          />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-10 mt-10">
            <Search size={48} color="#334155" />
            <Text className="text-text-secondary text-base font-medium mt-4">No contacts found</Text>
            <Text className="text-text-tertiary text-sm mt-1 text-center px-8">
              Try searching by complete email address or phone number.
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  )
}

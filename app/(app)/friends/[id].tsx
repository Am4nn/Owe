import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { ArrowLeft, MoreHorizontal } from 'lucide-react-native'
import { ScreenContainer } from '@/components/ui/ScreenContainer'
import { GlassCard } from '@/components/ui/GlassCard'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { ActivityItem } from '@/components/dashboard/ActivityItem'
import { formatMoney } from '@/lib/format'

// Mock Data
const MOCK_FRIEND = {
  id: '1',
  name: 'Alice Smith',
  email: 'alice@example.com',
  balanceCents: 2500, // They owe you
  joined: 'Member since Jan 2024'
}

const MOCK_EXPENSES = [
  { id: '1', actorName: 'Alice Smith', actionText: 'added', targetName: 'Dinner at Nando\'s', amountCents: 4500, timestamp: '2 hours ago' },
  { id: '2', actorName: 'You', actionText: 'settled up with', targetName: 'Alice Smith', amountCents: 1250, timestamp: 'Yesterday' },
]

export default function FriendBalanceScreen() {
  const { id } = useLocalSearchParams()
  const friend = MOCK_FRIEND // In real app, fetch based on `id`

  const isOwed = friend.balanceCents > 0
  const isOwing = friend.balanceCents < 0

  let balanceDisplay = <Text className="text-text-tertiary text-sm mt-1">Settled up</Text>
  if (isOwed) {
    balanceDisplay = <Text className="text-status-success text-base font-bold mt-1">owes you {formatMoney(friend.balanceCents)}</Text>
  } else if (isOwing) {
    balanceDisplay = <Text className="text-status-error text-base font-bold mt-1">you owe {formatMoney(Math.abs(friend.balanceCents))}</Text>
  }

  return (
    <ScreenContainer scrollable={false} edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold">{friend.name}</Text>
        <TouchableOpacity className="p-2 -mr-2">
          <MoreHorizontal size={24} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerClassName="pb-32" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="px-4 mt-4 mb-6">
          <GlassCard padding={24} variant="elevated" className="items-center">
            <Avatar size="lg" fallback={friend.name} />
            <Text className="text-white text-xl font-bold mt-4">{friend.name}</Text>
            {balanceDisplay}
            <Text className="text-text-tertiary text-xs mt-2">{friend.joined}</Text>
          </GlassCard>
        </View>

        {/* Actions Row */}
        <View className="px-4 flex-row gap-3 mb-8">
          <Button
            title="Settle Up"
            onPress={() => { }}
            className="flex-1"
          />
          <Button
            title="Remind"
            variant="secondary"
            onPress={() => { }}
            className="flex-1"
          />
        </View>

        {/* Past Expenses */}
        <View className="mb-4">
          <View className="px-4">
            <SectionLabel label="SHARED EXPENSES" />
          </View>
          <View className="bg-dark-elevated rounded-3xl overflow-hidden py-2 mx-4 border border-[rgba(255,255,255,0.05)] shadow-card">
            {MOCK_EXPENSES.map((expense, index) => (
              <View key={expense.id}>
                <ActivityItem {...expense} onPress={() => { }} />
                {index < MOCK_EXPENSES.length - 1 && (
                  <View className="h-px bg-dark-divider ml-[68px] my-1" />
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}

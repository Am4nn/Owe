import React, { useRef } from 'react'
import { View, Text, TouchableOpacity, Alert } from 'react-native'
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable'
import { router } from 'expo-router'
import type { Expense } from '@/features/expenses/types'
import type { GroupMember } from '@/features/groups/types'
import { CATEGORIES } from '@/features/expenses/categories'

interface ExpenseCardProps {
  expense: Expense
  members: GroupMember[]
  onSettle?: (expense: Expense) => void
  onRemind?: (expense: Expense) => void
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ExpenseCard({ expense, members, onSettle, onRemind }: ExpenseCardProps) {
  const swipeRef = useRef<SwipeableMethods>(null)

  const payer = members.find(m => m.id === expense.payer_id)
  const category = expense.category ? CATEGORIES.find(c => c.id === expense.category) : null

  function handleSettle() {
    swipeRef.current?.close()
    if (onSettle) onSettle(expense)
  }

  function handleRemind() {
    swipeRef.current?.close()
    if (onRemind) onRemind(expense)
    Alert.alert('Reminder sent', `Reminder sent for "${expense.description}"`)
  }

  function renderRightAction() {
    return (
      <TouchableOpacity
        onPress={handleSettle}
        className="bg-green-500 justify-center items-center w-20 rounded-r-2xl"
      >
        <Text className="text-white font-semibold text-sm">Settle</Text>
      </TouchableOpacity>
    )
  }

  function renderLeftAction() {
    return (
      <TouchableOpacity
        onPress={handleRemind}
        className="bg-brand-primary justify-center items-center w-20 rounded-l-2xl"
      >
        <Text className="text-white font-semibold text-sm">Remind</Text>
      </TouchableOpacity>
    )
  }

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightAction}
      renderLeftActions={renderLeftAction}
      overshootFriction={8}
    >
      <TouchableOpacity
        onPress={() => router.push(`/(app)/expenses/${expense.id}` as Parameters<typeof router.push>[0])}
        className="bg-dark-surface border border-dark-border rounded-2xl px-4 py-4 mb-3"
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-4">
            <Text className="text-white font-semibold text-base" numberOfLines={1}>
              {expense.description}
            </Text>
            <Text className="text-white/50 text-sm mt-0.5">
              paid by {payer?.display_name ?? 'Unknown'}
            </Text>
            <View className="flex-row items-center gap-2 mt-1.5">
              <Text className="text-white/40 text-xs">{formatDate(expense.expense_date)}</Text>
              {category && (
                <Text className="text-white/40 text-xs">
                  {category.icon} {category.label}
                </Text>
              )}
            </View>
          </View>
          <Text className="text-white font-bold text-base">
            {formatCents(expense.amount_cents)}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  )
}

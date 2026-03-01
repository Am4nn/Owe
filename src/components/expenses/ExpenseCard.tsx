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

function formatAmount(cents: number, currencyCode: string): string {
  // Simple formatting: use currency code prefix for non-USD, $ for USD
  // For a production app we'd use Intl.NumberFormat — for MVP, code prefix is clear enough
  const amount = (cents / 100).toFixed(2)
  return currencyCode === 'USD' ? `$${amount}` : `${currencyCode} ${amount}`
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
    if (onSettle) {
      onSettle(expense)
    } else {
      // Default: navigate to settlement form with group_id pre-filled (SETL-01)
      router.push({
        pathname: '/(app)/settlement/new' as Parameters<typeof router.push>[0] extends { pathname: infer P } ? P : never,
        params: {
          group_id: expense.group_id,
          payer_member_id: '',
          payee_member_id: '',
        },
      } as unknown as Parameters<typeof router.push>[0])
    }
  }

  function handleRemind() {
    swipeRef.current?.close()
    if (onRemind) {
      onRemind(expense)
    } else {
      // Placeholder: push reminders are a Phase 3 feature
      Alert.alert('Remind', 'Push reminders will be available in the next update.')
    }
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
          <View className="items-end">
            <Text className="text-white font-bold text-base">
              {formatAmount(expense.amount_cents, expense.currency)}
            </Text>
            {expense.currency !== expense.base_currency && (
              <Text className="text-white/40 text-xs mt-0.5">
                {'≈'} {formatAmount(expense.amount_base_cents, expense.base_currency)}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  )
}

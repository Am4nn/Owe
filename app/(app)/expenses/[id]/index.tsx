import React from 'react'
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { useExpense, useDeleteExpense } from '@/features/expenses/hooks'
import { CATEGORIES } from '@/features/expenses/categories'

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: expense, isLoading } = useExpense(id)
  const deleteExpense = useDeleteExpense()

  const category = expense?.category ? CATEGORIES.find(c => c.id === expense.category) : null

  function handleDelete() {
    Alert.alert(
      'Delete expense?',
      'This will permanently remove the expense from the group.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!expense) return
            try {
              await deleteExpense.mutateAsync({ id: expense.id, group_id: expense.group_id })
              router.back()
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete expense')
            }
          },
        },
      ]
    )
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-dark-bg items-center justify-center">
        <ActivityIndicator color="#6C63FF" />
      </View>
    )
  }

  if (!expense) {
    return (
      <View className="flex-1 bg-dark-bg items-center justify-center">
        <Text className="text-white/50">Expense not found</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-dark-bg">
      <Stack.Screen
        options={{
          title: 'Expense detail',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push(`/(app)/expenses/${id}/edit` as Parameters<typeof router.push>[0])}
              className="mr-2"
            >
              <Text className="text-brand-primary font-semibold">Edit</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View className="px-4 pt-4 pb-8">
        {/* Expense header */}
        <View className="bg-dark-surface border border-dark-border rounded-2xl px-4 py-5 mb-4">
          <Text className="text-white font-bold text-xl">{expense.description}</Text>
          <Text className="text-brand-primary font-bold text-2xl mt-1">
            {formatCents(expense.amount_cents)}
          </Text>

          <View className="mt-3 gap-1">
            <View className="flex-row">
              <Text className="text-white/40 text-sm w-24">Date</Text>
              <Text className="text-white/80 text-sm">{formatDate(expense.expense_date)}</Text>
            </View>
            <View className="flex-row">
              <Text className="text-white/40 text-sm w-24">Split type</Text>
              <Text className="text-white/80 text-sm capitalize">{expense.split_type}</Text>
            </View>
            {category && (
              <View className="flex-row">
                <Text className="text-white/40 text-sm w-24">Category</Text>
                <Text className="text-white/80 text-sm">
                  {category.icon} {category.label}
                </Text>
              </View>
            )}
            <View className="flex-row">
              <Text className="text-white/40 text-sm w-24">Currency</Text>
              <Text className="text-white/80 text-sm">{expense.currency}</Text>
            </View>
          </View>
        </View>

        {/* Splits */}
        {expense.expense_splits && expense.expense_splits.length > 0 && (
          <View className="bg-dark-surface border border-dark-border rounded-2xl px-4 py-4 mb-4">
            <Text className="text-white/50 text-xs uppercase tracking-wide mb-3">Splits</Text>
            {expense.expense_splits.map(split => (
              <View
                key={split.id}
                className="flex-row justify-between py-2 border-b border-dark-border last:border-0"
              >
                <Text className="text-white/70 text-sm">{split.member_id}</Text>
                <Text className="text-white font-medium text-sm">
                  {formatCents(split.amount_cents)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Delete button */}
        <TouchableOpacity
          onPress={handleDelete}
          disabled={deleteExpense.isPending}
          className="bg-red-500/10 border border-red-500/30 rounded-2xl py-4 items-center mt-2"
        >
          {deleteExpense.isPending ? (
            <ActivityIndicator color="#ef4444" />
          ) : (
            <Text className="text-red-400 font-semibold text-base">Delete expense</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

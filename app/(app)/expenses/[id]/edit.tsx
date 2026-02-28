import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useGroup } from '@/features/groups/hooks'
import { useExpense, useUpdateExpense } from '@/features/expenses/hooks'
import { SplitEditor } from '@/components/expenses/SplitEditor'
import { CATEGORIES } from '@/features/expenses/categories'
import type { SplitType, SplitInput } from '@/features/expenses/types'

const schema = z.object({
  description: z.string().min(1, 'Description required').max(200),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount'),
  payer_member_id: z.string().uuid('Select a payer'),
  expense_date: z.string(),
  category: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function EditExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: expense, isLoading: expenseLoading } = useExpense(id)
  const { data: groupData, isLoading: groupLoading } = useGroup(expense?.group_id ?? '')
  const updateExpense = useUpdateExpense()

  const [splitType, setSplitType] = useState<SplitType>('equal')
  const [splits, setSplits] = useState<SplitInput[]>([])

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: '',
      amount: '',
      payer_member_id: '',
      expense_date: new Date().toISOString().split('T')[0],
      category: undefined,
    },
  })

  // Pre-populate form when expense loads
  useEffect(() => {
    if (expense) {
      setSplitType(expense.split_type)
      reset({
        description: expense.description,
        amount: (expense.amount_cents / 100).toFixed(2),
        payer_member_id: expense.payer_id ?? '',
        expense_date: expense.expense_date,
        category: expense.category ?? undefined,
      })
    }
  }, [expense, reset])

  const amountStr = watch('amount')
  const amountCents = amountStr ? Math.round(parseFloat(amountStr) * 100) : 0

  const members = groupData?.members ?? []

  async function onSubmit(values: FormValues) {
    if (!expense) return

    try {
      const finalSplits = splits.filter(s => s.amount_cents !== undefined) as Array<{
        member_id: string
        amount_cents: number
      }>

      await updateExpense.mutateAsync({
        id: expense.id,
        group_id: expense.group_id,
        description: values.description,
        amount_cents: amountCents,
        split_type: splitType,
        payer_member_id: values.payer_member_id,
        expense_date: values.expense_date,
        category: values.category,
        splits: finalSplits.length > 0 ? finalSplits : undefined,
      })

      router.back()
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update expense')
    }
  }

  if (expenseLoading || groupLoading) {
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
      <Stack.Screen options={{ title: 'Edit expense', headerBackTitle: 'Back' }} />

      <View className="px-4 pt-4 pb-8">
        <Text className="text-white/50 text-sm uppercase tracking-wide mb-4">Edit expense</Text>

        {/* Description */}
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <View className="mb-4">
              <Text className="text-white/70 text-sm mb-2">Description</Text>
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="What was this expense for?"
                placeholderTextColor="rgba(255,255,255,0.3)"
                className="bg-dark-surface rounded-xl px-4 py-3 text-white border border-dark-border"
              />
              {errors.description && (
                <Text className="text-red-400 text-xs mt-1">{errors.description.message}</Text>
              )}
            </View>
          )}
        />

        {/* Amount */}
        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, value } }) => (
            <View className="mb-4">
              <Text className="text-white/70 text-sm mb-2">Amount</Text>
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="0.00"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="decimal-pad"
                className="bg-dark-surface rounded-xl px-4 py-3 text-white border border-dark-border text-xl font-semibold"
              />
              {errors.amount && (
                <Text className="text-red-400 text-xs mt-1">{errors.amount.message}</Text>
              )}
            </View>
          )}
        />

        {/* Payer picker */}
        {members.length > 0 && (
          <Controller
            control={control}
            name="payer_member_id"
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <Text className="text-white/70 text-sm mb-2">Paid by</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {members.map(member => (
                      <TouchableOpacity
                        key={member.id}
                        onPress={() => onChange(member.id)}
                        className={`px-4 py-2 rounded-full border ${
                          value === member.id
                            ? 'bg-brand-primary border-brand-primary'
                            : 'bg-dark-surface border-dark-border'
                        }`}
                      >
                        <Text
                          className={`text-sm ${value === member.id ? 'text-white font-medium' : 'text-white/60'}`}
                        >
                          {member.display_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                {errors.payer_member_id && (
                  <Text className="text-red-400 text-xs mt-1">{errors.payer_member_id.message}</Text>
                )}
              </View>
            )}
          />
        )}

        {/* Date */}
        <Controller
          control={control}
          name="expense_date"
          render={({ field: { onChange, value } }) => (
            <View className="mb-4">
              <Text className="text-white/70 text-sm mb-2">Date</Text>
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="rgba(255,255,255,0.3)"
                className="bg-dark-surface rounded-xl px-4 py-3 text-white border border-dark-border"
              />
            </View>
          )}
        />

        {/* Category */}
        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value } }) => (
            <View className="mb-4">
              <Text className="text-white/70 text-sm mb-2">Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => onChange(value === cat.id ? undefined : cat.id)}
                      className={`px-3 py-2 rounded-full border ${
                        value === cat.id
                          ? 'bg-brand-primary border-brand-primary'
                          : 'bg-dark-surface border-dark-border'
                      }`}
                    >
                      <Text className="text-sm">
                        {cat.icon} {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        />

        {/* Split editor */}
        {members.length > 0 && (
          <SplitEditor
            members={members}
            totalCents={amountCents}
            splitType={splitType}
            onSplitTypeChange={setSplitType}
            onSplitsChange={newSplits => setSplits(newSplits)}
          />
        )}

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting || updateExpense.isPending}
          className="bg-brand-primary rounded-2xl py-4 items-center mt-6"
        >
          {(isSubmitting || updateExpense.isPending) ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Save changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

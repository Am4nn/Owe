import React, { useState } from 'react'
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
import { supabase } from '@/lib/supabase'
import { useGroup } from '@/features/groups/hooks'
import { useCreateExpense } from '@/features/expenses/hooks'
import { SplitEditor } from '@/components/expenses/SplitEditor'
import { CATEGORIES } from '@/features/expenses/categories'
import type { SplitType, SplitInput } from '@/features/expenses/types'

const schema = z.object({
  description: z.string().min(1, 'Description required').max(200),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount'),
  payer_member_id: z.string().uuid('Select a payer'),
  expense_date: z.string(),
  category: z.string().optional(),
  group_id: z.string().uuid().optional(),
  friendName: z.string().min(1, 'Friend name required').optional(),
})

type FormValues = z.infer<typeof schema>

async function createDirectExpenseGroup(currentUserId: string, friendName: string) {
  // Step 1: Create the virtual group
  const { data: group, error: groupErr } = await supabase
    .from('groups')
    .insert({ name: `${friendName} & me`, is_direct: true, base_currency: 'USD', created_by: currentUserId })
    .select('id')
    .single()
  if (groupErr) throw groupErr

  // Step 2: Insert current user as group member (role: admin)
  const { data: myProfile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', currentUserId)
    .single()
  const { data: myMember, error: myErr } = await supabase
    .from('group_members')
    .insert({ group_id: group.id, user_id: currentUserId, display_name: myProfile?.display_name ?? 'Me', role: 'admin' })
    .select('id')
    .single()
  if (myErr) throw myErr

  // Step 3: Insert friend as named-only member (user_id: null)
  const { data: friendMember, error: friendErr } = await supabase
    .from('group_members')
    .insert({ group_id: group.id, user_id: null, display_name: friendName, role: 'member' })
    .select('id')
    .single()
  if (friendErr) throw friendErr

  return { group_id: group.id, myMemberId: myMember.id, friendMemberId: friendMember.id }
}

export default function NewExpenseScreen() {
  const params = useLocalSearchParams<{ group_id?: string }>()
  const groupId = params.group_id
  const isDirectMode = !groupId

  const { data: groupData, isLoading: groupLoading } = useGroup(groupId ?? '')
  const createExpense = useCreateExpense()

  const [splitType, setSplitType] = useState<SplitType>('equal')
  const [splits, setSplits] = useState<SplitInput[]>([])

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: '',
      amount: '',
      payer_member_id: '',
      expense_date: new Date().toISOString().split('T')[0],
      category: undefined,
      group_id: groupId,
      friendName: '',
    },
  })

  const amountStr = watch('amount')
  const amountCents = amountStr
    ? Math.round(parseFloat(amountStr) * 100)
    : 0

  const members = groupData?.members ?? []

  async function onSubmit(values: FormValues) {
    try {
      let finalGroupId = groupId ?? ''
      let finalPayerId = values.payer_member_id
      let finalSplits = splits.filter(s => s.amount_cents !== undefined) as Array<{ member_id: string; amount_cents: number }>

      if (isDirectMode && values.friendName) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const directGroup = await createDirectExpenseGroup(user.id, values.friendName)
        finalGroupId = directGroup.group_id
        finalPayerId = directGroup.myMemberId
        finalSplits = [
          { member_id: directGroup.myMemberId, amount_cents: Math.floor(amountCents / 2) },
          { member_id: directGroup.friendMemberId, amount_cents: amountCents - Math.floor(amountCents / 2) },
        ]
      }

      if (finalSplits.length === 0 && members.length > 0) {
        // Fallback to equal split if no splits computed yet
        const { computeEqualSplits } = await import('@/features/expenses/splits')
        const equalSplits = computeEqualSplits(amountCents, members.map(m => m.id))
        finalSplits = equalSplits
      }

      await createExpense.mutateAsync({
        group_id: finalGroupId,
        description: values.description,
        amount_cents: amountCents,
        split_type: splitType,
        payer_member_id: finalPayerId,
        expense_date: values.expense_date,
        category: values.category,
        splits: finalSplits,
        idempotency_key: crypto.randomUUID(),
      })

      router.back()
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create expense')
    }
  }

  if (!isDirectMode && groupLoading) {
    return (
      <View className="flex-1 bg-dark-bg items-center justify-center">
        <ActivityIndicator color="#6C63FF" />
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-dark-bg">
      <Stack.Screen options={{ title: 'New expense', headerBackTitle: 'Back' }} />

      <View className="px-4 pt-4 pb-8">
        {/* Header */}
        {isDirectMode ? (
          <Text className="text-white/50 text-sm uppercase tracking-wide mb-4">Direct expense</Text>
        ) : (
          <Text className="text-white/50 text-sm uppercase tracking-wide mb-4">
            {groupData?.group.name}
          </Text>
        )}

        {/* Friend name (direct mode only) */}
        {isDirectMode && (
          <Controller
            control={control}
            name="friendName"
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <Text className="text-white/70 text-sm mb-2">Friend</Text>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Friend's name or @username"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  className="bg-dark-surface rounded-xl px-4 py-3 text-white border border-dark-border"
                />
                {errors.friendName && (
                  <Text className="text-red-400 text-xs mt-1">{errors.friendName.message}</Text>
                )}
              </View>
            )}
          />
        )}

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

        {/* Payer picker (group mode only) */}
        {!isDirectMode && members.length > 0 && (
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

        {/* Split editor (group mode only) */}
        {!isDirectMode && members.length > 0 && (
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
          disabled={isSubmitting || createExpense.isPending}
          className="bg-brand-primary rounded-2xl py-4 items-center mt-6"
        >
          {(isSubmitting || createExpense.isPending) ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Add expense</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

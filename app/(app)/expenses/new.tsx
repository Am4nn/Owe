import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
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
import { useFxRates, COMMON_CURRENCIES, computeBaseCents } from '@/features/currency/hooks'
import type { SplitType, SplitInput } from '@/features/expenses/types'

const schema = z.object({
  description: z.string().min(1, 'Description required').max(200),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount'),
  payer_member_id: z.string().optional(),
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

  // CURR-02: Currency picker state
  const [expenseCurrency, setExpenseCurrency] = useState<string>(
    groupData?.group?.base_currency ?? 'USD'
  )
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)
  const [currencySearch, setCurrencySearch] = useState('')

  // CURR-03: Fetch FX rates from fx_rates table (stale 30 min)
  const { data: fxRates } = useFxRates()

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

  const filteredCurrencies = currencySearch.trim()
    ? COMMON_CURRENCIES.filter(
        (c) =>
          c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
          c.name.toLowerCase().includes(currencySearch.toLowerCase())
      )
    : COMMON_CURRENCIES

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

      // CURR-03: Compute FX values at submission time (snapshot at INSERT)
      // In direct mode or when groupData is undefined, use expenseCurrency as both currencies (fxRate = 1.0)
      const baseCurrency = isDirectMode
        ? expenseCurrency
        : (groupData?.group?.base_currency ?? expenseCurrency)

      const rates = fxRates ?? {}
      const { amountBaseCents, fxRate } = computeBaseCents(
        amountCents,
        expenseCurrency,
        baseCurrency,
        rates
      )

      await createExpense.mutateAsync({
        group_id: finalGroupId,
        description: values.description,
        amount_cents: amountCents,
        currency: expenseCurrency,
        base_currency: baseCurrency,
        fx_rate_at_creation: fxRate,
        amount_base_cents: amountBaseCents,
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

        {/* CURR-02: Currency picker */}
        <View className="mb-4">
          <Text className="text-white/70 text-sm mb-2">Currency</Text>
          <TouchableOpacity
            onPress={() => setShowCurrencyPicker(true)}
            className="bg-dark-surface rounded-xl px-4 py-3 border border-dark-border flex-row items-center justify-between"
          >
            <Text className="text-white font-medium">
              {COMMON_CURRENCIES.find((c) => c.code === expenseCurrency)?.symbol ?? ''}{' '}
              {expenseCurrency}
            </Text>
            <Text className="text-white/40 text-sm">Change</Text>
          </TouchableOpacity>
          {/* Show converted amount preview when currencies differ */}
          {!isDirectMode &&
            groupData?.group?.base_currency &&
            expenseCurrency !== groupData.group.base_currency &&
            amountCents > 0 &&
            fxRates && (
              <Text className="text-white/40 text-xs mt-1">
                {'≈'}{' '}
                {(() => {
                  const { amountBaseCents } = computeBaseCents(
                    amountCents,
                    expenseCurrency,
                    groupData.group.base_currency,
                    fxRates
                  )
                  const baseCurr = groupData.group.base_currency
                  const baseAmt = (amountBaseCents / 100).toFixed(2)
                  return baseCurr === 'USD' ? `$${baseAmt}` : `${baseCurr} ${baseAmt}`
                })()}{' '}
                {groupData.group.base_currency}
              </Text>
            )}
        </View>

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

      {/* CURR-02: Currency picker modal */}
      <Modal
        visible={showCurrencyPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowCurrencyPicker(false)
          setCurrencySearch('')
        }}
      >
        <View className="flex-1 bg-dark-bg">
          <View className="px-4 pt-6 pb-3">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white font-bold text-xl">Select Currency</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCurrencyPicker(false)
                  setCurrencySearch('')
                }}
              >
                <Text className="text-brand-primary font-medium">Cancel</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={currencySearch}
              onChangeText={setCurrencySearch}
              placeholder="Search currencies..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              className="bg-dark-surface rounded-xl px-4 py-3 text-white border border-dark-border"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <ScrollView>
            {filteredCurrencies.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                onPress={() => {
                  setExpenseCurrency(currency.code)
                  setShowCurrencyPicker(false)
                  setCurrencySearch('')
                }}
                className={`flex-row items-center px-4 py-4 border-b border-dark-border ${
                  currency.code === expenseCurrency ? 'bg-brand-primary/10' : ''
                }`}
              >
                <Text className="text-white font-medium w-10 text-base">{currency.symbol}</Text>
                <Text className="text-white font-semibold text-base mr-2">{currency.code}</Text>
                <Text className="text-white/60 text-sm flex-1">{currency.name}</Text>
                {currency.code === expenseCurrency && (
                  <Text className="text-brand-primary text-sm font-medium">Selected</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  )
}

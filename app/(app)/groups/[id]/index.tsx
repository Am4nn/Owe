import React, { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native'
import { Stack, useLocalSearchParams, router } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { useGroup, useLeaveGroup, useInviteMember, useUpdateGroupCurrency } from '@/features/groups/hooks'
import { useExpenses } from '@/features/expenses/hooks'
import { useGroupBalances, useRealtimeExpenseSync } from '@/features/balances/hooks'
import { BalanceCard } from '@/components/balances/BalanceCard'
import { ExpenseCard } from '@/components/expenses/ExpenseCard'
import { useFxRates, COMMON_CURRENCIES } from '@/features/currency/hooks'
import { exportGroupCsv } from '@/features/export/hooks'
import type { GroupMember } from '@/features/groups/types'
import type { Expense } from '@/features/expenses/types'

function MemberRow({ member }: { member: GroupMember }) {
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

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data, isLoading } = useGroup(id)
  const { mutate: leaveGroup, isPending: isLeaving } = useLeaveGroup()
  const { mutate: inviteMember } = useInviteMember()
  const { mutate: updateGroupCurrency } = useUpdateGroupCurrency()
  const { data: balances } = useGroupBalances(id)
  const { data: expenses } = useExpenses(id)
  // Pre-fetch FX rates so they are ready when currency picker opens
  useFxRates()

  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)
  const [currencySearch, setCurrencySearch] = useState('')

  // BALS-01 Realtime: subscribe to expense changes and invalidate balance/expense queries
  useRealtimeExpenseSync(id)

  const handleLeave = () => {
    // GRUP-05: Allow leaving even with outstanding balances (user decides)
    Alert.alert(
      'Leave group?',
      'You can rejoin if invited again. Outstanding balances will remain visible to other members.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            leaveGroup(id, {
              onSuccess: () => router.back(),
              onError: (e) => Alert.alert('Error', e.message),
            })
          },
        },
      ]
    )
  }

  const handleInvite = () => {
    Alert.prompt(
      'Invite by email',
      'Enter the email address to send an invite',
      (email) => {
        if (!email) return
        inviteMember(
          { group_id: id, email },
          {
            onSuccess: () => Alert.alert('Invite sent', `Invite sent to ${email}`),
            onError: (e) => Alert.alert('Error', e.message),
          }
        )
      },
      'plain-text',
      '',
      'email-address'
    )
  }

  const handleSelectCurrency = (code: string) => {
    updateGroupCurrency(
      { groupId: id, currency: code },
      {
        onError: (e) => Alert.alert('Error', e.message),
      }
    )
    setShowCurrencyPicker(false)
    setCurrencySearch('')
  }

  const handleExport = async () => {
    try {
      await exportGroupCsv(id, expenses ?? [])
    } catch (e) {
      Alert.alert('Export failed', e instanceof Error ? e.message : 'Could not export expenses')
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-dark-bg items-center justify-center">
        <ActivityIndicator color="#6C63FF" />
      </View>
    )
  }

  const members = data?.members ?? []
  const baseCurrency = data?.group.base_currency ?? 'USD'

  const filteredCurrencies = currencySearch.trim()
    ? COMMON_CURRENCIES.filter(
        (c) =>
          c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
          c.name.toLowerCase().includes(currencySearch.toLowerCase())
      )
    : COMMON_CURRENCIES

  return (
    <View className="flex-1 bg-dark-bg">
      <Stack.Screen options={{ title: data?.group.name ?? 'Group' }} />

      <FlatList
        data={expenses ?? []}
        keyExtractor={(item: Expense) => item.id}
        renderItem={({ item }: { item: Expense }) => (
          <ExpenseCard expense={item} members={members} />
        )}
        contentContainerClassName="px-4"
        ListHeaderComponent={
          <View className="pt-4">
            {/* Members section */}
            <Text className="text-white/50 text-sm uppercase tracking-wide mb-1">Members</Text>
            {members.map((member) => (
              <MemberRow key={member.id} member={member} />
            ))}

            {/* BALS-02: Per-member net balances */}
            {balances && balances.length > 0 && (
              <View className="mt-6 mb-2">
                <Text className="text-white/50 text-sm uppercase tracking-wide mb-2">Balances</Text>
                {balances.map((balance) => (
                  <BalanceCard key={balance.member_id} balance={balance} />
                ))}
              </View>
            )}

            {/* CURR-01: Base currency picker */}
            <View className="mt-4 mb-2">
              <Text className="text-white/50 text-sm uppercase tracking-wide mb-2">Base Currency</Text>
              <TouchableOpacity
                onPress={() => setShowCurrencyPicker(true)}
                className="bg-dark-surface border border-dark-border rounded-2xl px-4 py-3 flex-row items-center justify-between"
              >
                <Text className="text-white font-medium">
                  {COMMON_CURRENCIES.find((c) => c.code === baseCurrency)?.symbol ?? ''}{' '}
                  {baseCurrency}
                </Text>
                <Text className="text-white/40 text-sm">Change</Text>
              </TouchableOpacity>
            </View>

            {/* Navigation buttons: Simplified Debts, Activity, Settlement History */}
            <View className="mt-4 gap-2">
              <TouchableOpacity
                onPress={() => router.push(`/(app)/groups/${id}/balances` as Parameters<typeof router.push>[0])}
                className="border border-brand-primary rounded-2xl px-4 py-3 items-center"
              >
                <Text className="text-brand-primary font-semibold">Simplified Debts</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push(`/(app)/groups/${id}/activity` as Parameters<typeof router.push>[0])}
                className="border border-brand-primary rounded-2xl px-4 py-3 items-center"
              >
                <Text className="text-brand-primary font-semibold">Activity</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push(`/(app)/groups/${id}/settlements` as Parameters<typeof router.push>[0])}
                className="border border-brand-primary rounded-2xl px-4 py-3 items-center"
              >
                <Text className="text-brand-primary font-semibold">Settlement History</Text>
              </TouchableOpacity>
            </View>

            {/* Expenses section header */}
            <Text className="text-white/50 text-sm uppercase tracking-wide mt-6 mb-2">Expenses</Text>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-8">
            <Text className="text-white/50 text-base">No expenses yet</Text>
          </View>
        }
        ListFooterComponent={
          <View className="mt-8 gap-3">
            {/* EXPT-01: Export CSV */}
            <TouchableOpacity
              onPress={handleExport}
              className="border border-dark-border rounded-2xl px-4 py-3 items-center"
            >
              <Text className="text-white/70 font-semibold">Export CSV</Text>
            </TouchableOpacity>

            {/* GRUP-02: Invite by email */}
            <Button title="Invite by email" variant="secondary" onPress={handleInvite} />
            {/* GRUP-05: Leave group */}
            <Button
              title={isLeaving ? 'Leaving...' : 'Leave group'}
              variant="danger"
              onPress={handleLeave}
              disabled={isLeaving}
            />
          </View>
        }
      />

      {/* CURR-01: Currency picker modal */}
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
                onPress={() => handleSelectCurrency(currency.code)}
                className={`flex-row items-center px-4 py-4 border-b border-dark-border ${
                  currency.code === baseCurrency ? 'bg-brand-primary/10' : ''
                }`}
              >
                <Text className="text-white font-medium w-10 text-base">{currency.symbol}</Text>
                <Text className="text-white font-semibold text-base mr-2">{currency.code}</Text>
                <Text className="text-white/60 text-sm flex-1">{currency.name}</Text>
                {currency.code === baseCurrency && (
                  <Text className="text-brand-primary text-sm font-medium">Selected</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}

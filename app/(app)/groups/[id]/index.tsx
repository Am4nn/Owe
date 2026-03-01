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
  Switch,
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
import { useReminderConfig } from '@/features/notifications/hooks'
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
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteSent, setInviteSent] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)

  // NOTF-03: Smart reminder configuration per group
  const { reminderConfig, upsertReminderConfig } = useReminderConfig(id)
  const [showDelayPicker, setShowDelayPicker] = useState(false)
  const reminderEnabled = reminderConfig?.enabled ?? true
  const reminderDelay = reminderConfig?.delay_days ?? 3

  // BALS-01 Realtime: subscribe to expense changes and invalidate balance/expense queries
  useRealtimeExpenseSync(id)

  // GRUP-05: Alert.alert multi-button is unreliable on web (window.confirm is blocked)
  // Use a cross-platform confirmation modal instead
  const handleLeave = () => setShowLeaveModal(true)

  const handleConfirmLeave = () => {
    setShowLeaveModal(false)
    leaveGroup(id, {
      // router.back() throws "GO_BACK not handled" on web when there is no history stack.
      // Fallback to replacing with the app root so the group detail is removed from history.
      onSuccess: () => router.canGoBack() ? router.back() : router.replace('/(app)'),
      onError: (e) => Alert.alert('Error', e.message),
    })
  }

  const handleInvite = () => {
    setInviteEmail('')
    setInviteSent(false)
    setShowInviteModal(true)
  }

  const handleSendInvite = () => {
    const email = inviteEmail.trim()
    if (!email) return
    inviteMember(
      { group_id: id, email },
      {
        onSuccess: () => {
          // Show inline success — Alert.alert is unreliable on web
          // Note: no email is sent yet (no Edge Function) — invite is saved to DB only
          setInviteSent(true)
          setTimeout(() => {
            setShowInviteModal(false)
            setInviteSent(false)
          }, 2500)
        },
        onError: (e) => Alert.alert('Error', e.message),
      }
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

            {/* NOTF-03: Smart Reminders Config */}
            <View className="mt-4 mb-2">
              <Text className="text-white/50 text-sm uppercase tracking-wide mb-2">Smart Reminders</Text>
              <View className="bg-dark-surface border border-dark-border rounded-2xl px-4 py-3">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-white font-medium text-base">Automatic Nudges</Text>
                    <Text className="text-white/40 text-xs mt-1">Remind members of unpaid debts</Text>
                  </View>
                  <Switch
                    value={reminderEnabled}
                    onValueChange={(val) => upsertReminderConfig({ group_id: id, enabled: val, delay_days: reminderDelay })}
                    trackColor={{ false: '#333', true: '#6C63FF' }}
                  />
                </View>
                {reminderEnabled && (
                  <View className="mt-4 pt-4 border-t border-dark-border flex-row items-center justify-between">
                    <Text className="text-white font-medium">Delay</Text>
                    <TouchableOpacity onPress={() => setShowDelayPicker(true)} className="bg-dark-bg px-3 py-1.5 rounded-lg border border-dark-border">
                      <Text className="text-brand-primary">{reminderDelay} days</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
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

      {/* NOTF-03: Reminder Delay picker modal */}
      <Modal
        visible={showDelayPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDelayPicker(false)}
      >
        <View className="flex-1 bg-dark-bg">
          <View className="px-4 pt-6 pb-3">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white font-bold text-xl">Reminder Delay</Text>
              <TouchableOpacity onPress={() => setShowDelayPicker(false)}>
                <Text className="text-brand-primary font-medium">Done</Text>
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView>
            {[1, 2, 3, 5, 7, 14, 30].map(days => (
              <TouchableOpacity
                key={days}
                onPress={() => {
                  upsertReminderConfig({ group_id: id, enabled: reminderEnabled, delay_days: days })
                  setShowDelayPicker(false)
                }}
                className={`flex-row items-center px-4 py-4 border-b border-dark-border ${reminderDelay === days ? 'bg-brand-primary/10' : ''}`}
              >
                <Text className="text-white font-medium text-base flex-1">{days} {days === 1 ? 'day' : 'days'}</Text>
                {reminderDelay === days && <Text className="text-brand-primary text-sm font-medium">Selected</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* GRUP-05: Leave group confirmation modal — Alert.alert multi-button unreliable on web */}
      <Modal
        visible={showLeaveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLeaveModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <View className="bg-dark-surface rounded-2xl px-6 py-6 w-full">
            <Text className="text-white font-bold text-lg mb-2">Leave group?</Text>
            <Text className="text-white/60 text-sm mb-6">
              You can rejoin if invited again. Outstanding balances will remain visible to other members.
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowLeaveModal(false)}
                className="flex-1 border border-dark-border rounded-2xl py-3 items-center"
              >
                <Text className="text-white/70 font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmLeave}
                disabled={isLeaving}
                className="flex-1 bg-brand-danger rounded-2xl py-3 items-center"
              >
                {isLeaving
                  ? <ActivityIndicator color="#fff" />
                  : <Text className="text-white font-semibold">Leave</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* GRUP-02: Invite by email modal — Alert.prompt is iOS-only; Alert.alert unreliable on web */}
      <Modal
        visible={showInviteModal}
        transparent
        animationType="slide"
        onRequestClose={() => { setShowInviteModal(false); setInviteSent(false) }}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-dark-surface rounded-t-3xl px-4 pt-4 pb-10">
            {inviteSent ? (
              <View className="items-center py-4">
                <Text className="text-brand-success text-4xl mb-3">✓</Text>
                <Text className="text-white font-bold text-lg mb-1">Invite saved!</Text>
                <Text className="text-white/50 text-sm text-center">
                  {inviteEmail} will be added to the group when they sign up with this email.
                  {'\n'}(Email delivery coming soon)
                </Text>
              </View>
            ) : (
              <>
                <Text className="text-white font-bold text-lg mb-1">Invite by email</Text>
                <Text className="text-white/50 text-sm mb-4">Enter the email address to send an invite</Text>
                <TextInput
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  placeholder="friend@example.com"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                  onSubmitEditing={handleSendInvite}
                  className="bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white mb-4"
                />
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => setShowInviteModal(false)}
                    className="flex-1 border border-dark-border rounded-2xl py-3 items-center"
                  >
                    <Text className="text-white/70 font-medium">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSendInvite}
                    className="flex-1 bg-brand-primary rounded-2xl py-3 items-center"
                  >
                    <Text className="text-white font-semibold">Send Invite</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

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

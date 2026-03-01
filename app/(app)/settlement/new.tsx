import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import * as ExpoCrypto from 'expo-crypto'
import { useGroup } from '@/features/groups/hooks'
import { useCreateSettlement } from '@/features/settlements/hooks'
import type { GroupMember } from '@/features/groups/types'

export default function NewSettlementScreen() {
  const { group_id, payer_member_id: initialPayer, payee_member_id: initialPayee, amount_cents: initialAmount } =
    useLocalSearchParams<{
      group_id: string
      payer_member_id?: string
      payee_member_id?: string
      amount_cents?: string
    }>()

  const { data: groupData } = useGroup(group_id)
  const createSettlement = useCreateSettlement()

  const [amount, setAmount] = useState<string>(
    initialAmount ? (parseInt(initialAmount, 10) / 100).toFixed(2) : ''
  )
  const [note, setNote] = useState('')
  const [selectedPayer, setSelectedPayer] = useState<GroupMember | null>(
    groupData?.members.find(m => m.id === initialPayer) ?? null
  )
  const [selectedPayee, setSelectedPayee] = useState<GroupMember | null>(
    groupData?.members.find(m => m.id === initialPayee) ?? null
  )
  const [showPayerPicker, setShowPayerPicker] = useState(false)
  const [showPayeePicker, setShowPayeePicker] = useState(false)

  const members = groupData?.members ?? []

  function handleSubmit() {
    const amountNum = parseFloat(amount)
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount greater than 0.')
      return
    }
    if (!selectedPayer) {
      Alert.alert('Missing payer', 'Please select who is paying.')
      return
    }
    if (!selectedPayee) {
      Alert.alert('Missing payee', 'Please select who is receiving payment.')
      return
    }
    if (selectedPayer.id === selectedPayee.id) {
      Alert.alert('Invalid selection', 'Payer and payee must be different people.')
      return
    }

    const amount_cents = Math.round(amountNum * 100)

    createSettlement.mutate(
      {
        group_id,
        payer_member_id: selectedPayer.id,
        payee_member_id: selectedPayee.id,
        amount_cents,
        note: note.trim() || undefined,
        idempotency_key: ExpoCrypto.randomUUID(),
      },
      {
        onSuccess: () => {
          router.replace('/(app)/settlement/success' as Parameters<typeof router.replace>[0])
        },
        onError: (err) => {
          Alert.alert('Error', err instanceof Error ? err.message : 'Failed to record settlement')
        },
      }
    )
  }

  function MemberPickerModal({
    visible,
    onClose,
    onSelect,
    title,
  }: {
    visible: boolean
    onClose: () => void
    onSelect: (member: GroupMember) => void
    title: string
  }) {
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-dark-surface rounded-t-3xl px-4 pt-4 pb-8">
            <Text className="text-white font-bold text-lg mb-4">{title}</Text>
            <FlatList
              data={members}
              keyExtractor={m => m.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onSelect(item)
                    onClose()
                  }}
                  className="py-3 border-b border-dark-border"
                >
                  <Text className="text-white text-base">{item.display_name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={onClose}
              className="mt-4 py-3 items-center"
            >
              <Text className="text-white/50">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <ScrollView className="flex-1 bg-dark-bg">
      <Stack.Screen options={{ title: 'Record Settlement' }} />

      <View className="px-4 pt-6 pb-8 gap-4">
        {/* Amount */}
        <View className="bg-dark-surface border border-dark-border rounded-2xl px-4 py-4">
          <Text className="text-white/50 text-xs uppercase tracking-wide mb-2">Amount</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="$0.00"
            placeholderTextColor="rgba(255,255,255,0.3)"
            keyboardType="decimal-pad"
            className="text-white text-2xl font-bold"
          />
        </View>

        {/* Payer */}
        <View className="bg-dark-surface border border-dark-border rounded-2xl px-4 py-4">
          <Text className="text-white/50 text-xs uppercase tracking-wide mb-2">Who paid</Text>
          <TouchableOpacity onPress={() => setShowPayerPicker(true)}>
            <Text className={selectedPayer ? 'text-white text-base' : 'text-white/30 text-base'}>
              {selectedPayer?.display_name ?? 'Select member...'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Payee */}
        <View className="bg-dark-surface border border-dark-border rounded-2xl px-4 py-4">
          <Text className="text-white/50 text-xs uppercase tracking-wide mb-2">Who received</Text>
          <TouchableOpacity onPress={() => setShowPayeePicker(true)}>
            <Text className={selectedPayee ? 'text-white text-base' : 'text-white/30 text-base'}>
              {selectedPayee?.display_name ?? 'Select member...'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Note */}
        <View className="bg-dark-surface border border-dark-border rounded-2xl px-4 py-4">
          <Text className="text-white/50 text-xs uppercase tracking-wide mb-2">Note (optional)</Text>
          <TextInput
            value={note}
            onChangeText={text => setNote(text.slice(0, 200))}
            placeholder="Add a note..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            className="text-white text-base"
            multiline
            maxLength={200}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={createSettlement.isPending}
          className="bg-brand-primary rounded-2xl py-4 items-center mt-2"
        >
          {createSettlement.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">Record Settlement</Text>
          )}
        </TouchableOpacity>
      </View>

      <MemberPickerModal
        visible={showPayerPicker}
        onClose={() => setShowPayerPicker(false)}
        onSelect={setSelectedPayer}
        title="Who paid?"
      />
      <MemberPickerModal
        visible={showPayeePicker}
        onClose={() => setShowPayeePicker(false)}
        onSelect={setSelectedPayee}
        title="Who received payment?"
      />
    </ScrollView>
  )
}

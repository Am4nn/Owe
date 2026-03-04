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
import { QueryGuard } from '@/components/ui/QueryGuard'
import type { GroupMember } from '@/features/groups/types'

export default function NewSettlementScreen() {
  const { group_id, payer_member_id: initialPayer, payee_member_id: initialPayee, amount_cents: initialAmount } =
    useLocalSearchParams<{
      group_id: string
      payer_member_id?: string
      payee_member_id?: string
      amount_cents?: string
    }>()

  return (
    <QueryGuard query={groupQuery}>
      {(groupData) => {
        const members = groupData?.members ?? []
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
              members={members}
              searchQuery={payerSearch}
              onSearchChange={setPayerSearch}
              onSelect={(id) => {
                const m = members.find(x => x.id === id)
                if (m) setSelectedPayer(m)
                setShowPayerPicker(false)
                setPayerSearch('')
              }}
              onClose={() => {
                setShowPayerPicker(false)
                setPayerSearch('')
              }}
              selectedIds={selectedPayer ? [selectedPayer.id] : []}
            />
            <MemberPickerModal
              visible={showPayeePicker}
              members={members}
              searchQuery={payeeSearch}
              onSearchChange={setPayeeSearch}
              onSelect={(id) => {
                const m = members.find(x => x.id === id)
                if (m) setSelectedPayee(m)
                setShowPayeePicker(false)
                setPayeeSearch('')
              }}
              onClose={() => {
                setShowPayeePicker(false)
                setPayeeSearch('')
              }}
              selectedIds={selectedPayee ? [selectedPayee.id] : []}
            />
          </ScrollView>
        )
      }}
    </QueryGuard>
  )
  )
}

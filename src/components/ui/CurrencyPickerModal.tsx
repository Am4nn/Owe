import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native'
import { COMMON_CURRENCIES } from '@/features/currency/hooks'

interface CurrencyPickerModalProps {
  visible: boolean
  baseCurrency: string
  onSelect: (currencyCode: string) => void
  onClose: () => void
}

export function CurrencyPickerModal({
  visible,
  baseCurrency,
  onSelect,
  onClose,
}: CurrencyPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCurrencies = searchQuery.trim()
    ? COMMON_CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : COMMON_CURRENCIES

  const handleClose = () => {
    setSearchQuery('')
    onClose()
  }

  const handleSelect = (code: string) => {
    setSearchQuery('')
    onSelect(code)
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-dark-bg">
        <View className="px-4 pt-6 pb-3">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white font-bold text-xl">Select Currency</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text className="text-brand-primary font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
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
              onPress={() => handleSelect(currency.code)}
              className={`flex-row items-center px-4 py-4 border-b border-dark-border ${currency.code === baseCurrency ? 'bg-brand-primary/10' : ''
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
  )
}

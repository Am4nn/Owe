import React from 'react'
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native'

interface ConfirmModalProps {
  visible: boolean
  title: string
  message: string
  confirmText: string
  cancelText?: string
  isDanger?: boolean
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  isDanger = true,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/60 px-6">
        <View className="bg-dark-surface rounded-2xl px-6 py-6 w-full">
          <Text className="text-white font-bold text-lg mb-2">{title}</Text>
          <Text className="text-white/60 text-sm mb-6">{message}</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onCancel}
              disabled={isLoading}
              className="flex-1 border border-dark-border rounded-2xl py-3 items-center"
            >
              <Text className="text-white/70 font-medium">{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              disabled={isLoading}
              className={`flex-1 rounded-2xl py-3 items-center ${isDanger ? 'bg-brand-danger' : 'bg-brand-primary'
                }`}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold">{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

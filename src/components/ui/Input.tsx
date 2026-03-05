import { TextInput, TextInputProps, View, Text, Platform, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { LucideIcon, Eye, EyeOff } from 'lucide-react-native'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  icon?: LucideIcon
}

// Inline styles for glass input (CSS classes like glass-input don't work on native)
const glassInputBase = {
  backgroundColor: 'rgba(14, 17, 23, 0.6)',
  borderWidth: 1,
  borderRadius: 14,
}

const glassInputDefault = {
  ...glassInputBase,
  borderColor: 'rgba(255, 255, 255, 0.12)',
}

const glassInputFocus = {
  ...glassInputBase,
  borderColor: 'rgba(123, 92, 246, 0.5)',
}

const glassInputError = {
  ...glassInputBase,
  borderColor: '#FF4D6D',
}

export function Input({ label, error, icon: Icon, className, secureTextEntry, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Fix for React Native Web controlled TextInput duplication (WEB-02)
  const webProps = Platform.OS === 'web' && props.value !== undefined ? {
    defaultValue: props.value as string,
    value: undefined // Make uncontrolled to prevent cursor jump/duplication
  } : {}

  // When secureTextEntry is passed, manage visibility toggle internally
  const isSecure = secureTextEntry && !showPassword

  // Determine container style based on state
  const containerStyle = error ? glassInputError : isFocused ? glassInputFocus : glassInputDefault

  return (
    <View className="gap-1.5 w-full">
      {label && (
        <Text className="text-text-secondary text-sm font-medium">{label}</Text>
      )}
      <View
        className="flex-row items-center h-[54px]"
        style={containerStyle}
      >
        {Icon && (
          <View className="pl-3 pr-2">
            <Icon size={24} color="#64748B" />
          </View>
        )}
        <TextInput
          className={`flex-1 text-text-primary text-base ${Icon ? 'pl-0' : 'pl-4'} ${secureTextEntry ? 'pr-1' : 'pr-4'} py-3.5`}
          placeholderTextColor="#64748B"
          secureTextEntry={isSecure}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
          {...webProps}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="pr-3 pl-1 py-2"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {showPassword ? (
              <EyeOff size={20} color="#64748B" />
            ) : (
              <Eye size={20} color="#64748B" />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-brand-danger text-xs px-1">{error}</Text>
      )}
    </View>
  )
}


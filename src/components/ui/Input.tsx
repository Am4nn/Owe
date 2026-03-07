import { TextInput, TextInputProps, View, Text, Platform, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { LucideIcon, Eye, EyeOff } from 'lucide-react-native'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  icon?: LucideIcon
  variant?: 'default' | 'secondary'
  borderRadius?: number
  iconGap?: number
}

const inputBaseStyle = {
  borderWidth: 1,
  borderRadius: 14,
}

const variants = {
  default: {
    backgroundColor: 'rgba(14, 17, 23, 0.6)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  secondary: {
    backgroundColor: '#1c2334',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  }
}

export function Input({ label, error, icon: Icon, className, secureTextEntry, variant = 'default', borderRadius, iconGap = 2, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)



  // When secureTextEntry is passed, manage visibility toggle internally
  const isSecure = secureTextEntry && !showPassword

  const baseVariantStyle = variants[variant] || variants.default

  // Determine container border color based on state
  const currentBorderColor = error
    ? '#FF4D6D'
    : isFocused
      ? 'rgba(123, 92, 246, 0.5)'
      : baseVariantStyle.borderColor

  const containerStyle = {
    ...inputBaseStyle,
    backgroundColor: baseVariantStyle.backgroundColor,
    borderColor: currentBorderColor,
    ...(borderRadius !== undefined ? { borderRadius } : {})
  }

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
          <View className="pl-3" style={{ paddingRight: iconGap * 4 }}>
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


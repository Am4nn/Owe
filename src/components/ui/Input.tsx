import { TextInput, TextInputProps, View, Text, Platform } from 'react-native'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  // Fix for React Native Web controlled TextInput duplication (WEB-02)
  const webProps = Platform.OS === 'web' && props.value !== undefined ? {
    defaultValue: props.value as string,
    value: undefined // Make uncontrolled to prevent cursor jump/duplication
  } : {}

  return (
    <View className="gap-1.5">
      {label && (
        <Text className="text-white/70 text-sm font-medium">{label}</Text>
      )}
      <TextInput
        className={`bg-dark-surface border border-dark-border rounded-xl px-4 py-3.5 text-white text-base ${error ? 'border-brand-danger' : ''} ${className ?? ''}`}
        placeholderTextColor="#ffffff40"
        {...props}
        {...webProps}
      />
      {error && (
        <Text className="text-brand-danger text-xs">{error}</Text>
      )}
    </View>
  )
}

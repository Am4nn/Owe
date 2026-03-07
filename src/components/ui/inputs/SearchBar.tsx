import { View, TextInput, TouchableOpacity } from 'react-native'
import { Search, X } from 'lucide-react-native'
import { useState } from 'react'
import { theme } from '@/lib/theme'

/**
 * SearchBar
 *
 * Glass-styled search input used across the app to filter lists.
 * Seen in: Activity Feed, Transaction History, Add Friends, Help & Support.
 *
 * Usage:
 *   <SearchBar value={query} onChange={setQuery} placeholder="Search..." />
 */
export type SearchBarProps = {
  value: string
  onChange: (text: string) => void
  placeholder?: string
  autoFocus?: boolean
}

export function SearchBar({ value, onChange, placeholder = 'Search...', autoFocus = false }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 46,
        borderRadius: theme.radii.pill,
        borderWidth: 1,
        backgroundColor: theme.colors.glass.bgInput,
        borderColor: isFocused
          ? theme.colors.glass.borderFocus
          : 'rgba(123, 92, 246, 0.3)',
        paddingHorizontal: theme.spacing.md,
        gap: theme.spacing.sm,
      }}
    >
      <Search size={18} color={theme.colors.text.tertiary} />

      <TextInput
        style={{
          flex: 1,
          color: theme.colors.text.primary,
          fontSize: theme.typography.bodySm,
        }}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.tertiary}
        value={value}
        onChangeText={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChange('')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <X size={16} color={theme.colors.text.tertiary} />
        </TouchableOpacity>
      )}
    </View>
  )
}

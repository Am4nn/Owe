import { View, Text, TextInput } from 'react-native'
import { useState } from 'react'
import { theme } from '@/lib/theme'

/**
 * AmountInput
 *
 * Large currency input used on the Add Expense and Settlement screens.
 * Renders a huge dollar amount in the centre of the screen with a
 * currency symbol prefix, matching the Stitch add-expense design.
 *
 * Value is stored and emitted in INTEGER CENTS (e.g. 1050 = $10.50).
 *
 * Usage:
 *   <AmountInput value={amountCents} onChange={setAmountCents} />
 */
export type AmountInputProps = {
  /** Current value in integer cents */
  value: number
  onChange: (cents: number) => void
  currency?: string
  placeholder?: string
}

export function AmountInput({
  value,
  onChange,
  currency = '$',
  placeholder = '0.00',
}: AmountInputProps) {
  // Display value: show empty string when 0 so placeholder shows
  const displayValue = value > 0 ? (value / 100).toFixed(2) : ''

  const handleChange = (text: string) => {
    // Strip anything that isn't a digit or a single decimal point
    const cleaned = text.replace(/[^0-9.]/g, '')
    const parts = cleaned.split('.')
    // Max 2 decimal places
    const normalised =
      parts.length > 1
        ? `${parts[0]}.${parts[1].slice(0, 2)}`
        : cleaned

    const parsed = parseFloat(normalised)
    onChange(isNaN(parsed) ? 0 : Math.round(parsed * 100))
  }

  const [isFocused, setIsFocused] = useState(false)

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        paddingVertical: theme.spacing.xl,
        gap: 4,
      }}
    >
      {/* Currency symbol */}
      <Text
        style={{
          fontSize: 36,
          fontWeight: '700',
          color: theme.colors.brand.primary,
          lineHeight: 44,
          alignSelf: 'flex-start',
          marginTop: 8,
        }}
      >
        {currency}
      </Text>

      {/* Amount */}
      <TextInput
        style={{
          fontSize: 56,
          fontWeight: '700',
          color: isFocused || value > 0
            ? theme.colors.text.primary
            : theme.colors.text.tertiary,
          minWidth: 80,
          textAlign: 'center',
        }}
        value={displayValue}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.tertiary}
        keyboardType="decimal-pad"
        returnKeyType="done"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        selectTextOnFocus
      />
    </View>
  )
}

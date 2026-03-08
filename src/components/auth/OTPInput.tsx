import { View, TextInput, Keyboard } from 'react-native'
import { useState, useRef } from 'react'

interface OTPInputProps {
  length?: number
  value: string
  onChangeText: (value: string) => void
}

export function OTPInput({ length = 6, value, onChangeText }: OTPInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0)
  const inputRefs = useRef<Array<TextInput | null>>([])

  const handleTextChange = (text: string, index: number) => {
    // Prevent typing more than one char per input directly
    const char = text.slice(-1)
    const newValue = value.split('')
    newValue[index] = char
    const newString = newValue.join('').substring(0, length)
    onChangeText(newString)

    // Auto-advance
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      const newValue = value.split('')
      if (newValue[index]) {
        // Clear current
        newValue[index] = ''
        onChangeText(newValue.join(''))
      } else if (index > 0) {
        // Move back and clear previous
        newValue[index - 1] = ''
        onChangeText(newValue.join(''))
        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  return (
    <View className="flex-row justify-center gap-3 w-full my-6">
      {Array(length).fill(0).map((_, index) => {
        const isFocused = focusedIndex === index
        const char = value[index] || ''
        const borderClass = isFocused ? 'border-brand-primary shadow-glow-sm' : 'border-[rgba(255,255,255,0.08)]'

        return (
          <View
            key={index}
            className={`w-[46px] h-[52px] rounded-xl glass-input justify-center items-center border ${borderClass} bg-dark-input`}
          >
            <TextInput
              ref={(ref) => { inputRefs.current[index] = ref }}
              value={char}
              onChangeText={(text) => handleTextChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              keyboardType="number-pad"
              maxLength={1}
              className="text-white text-xl font-semibold absolute w-full h-full text-center"
              selectionColor="#7B5CF6"
            />
          </View>
        )
      })}
    </View>
  )
}

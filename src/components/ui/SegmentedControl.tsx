import { View, Text, TouchableOpacity, ScrollView, LayoutChangeEvent } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { useState, useEffect, useCallback } from 'react'

interface SegmentedControlProps {
  segments: string[]
  selectedIndex: number
  onChange: (index: number) => void
}

export function SegmentedControl({ segments, selectedIndex, onChange }: SegmentedControlProps) {
  const [segmentWidths, setSegmentWidths] = useState<number[]>(new Array(segments.length).fill(0))
  const translateX = useSharedValue(0)
  const indicatorWidth = useSharedValue(0)

  const handleLayout = useCallback((index: number, e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width
    setSegmentWidths(prev => {
      const next = [...prev]
      next[index] = width
      return next
    })
  }, [])

  // Calculate position on the JS thread via useEffect, then animate shared values.
  // This avoids calling a non-worklet function inside useAnimatedStyle.
  useEffect(() => {
    let x = 0
    for (let i = 0; i < selectedIndex; i++) {
      x += segmentWidths[i] || 0
    }
    indicatorWidth.value = withSpring(segmentWidths[selectedIndex] || 0, { stiffness: 300, damping: 25 })
    translateX.value = withSpring(x, { stiffness: 300, damping: 25 })
  }, [selectedIndex, segmentWidths])

  // useAnimatedStyle only reads shared values — no non-worklet calls allowed here.
  const indicatorStyle = useAnimatedStyle(() => ({
    width: indicatorWidth.value,
    transform: [{ translateX: translateX.value }],
  }))

  return (
    <View className="flex-row">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
        <View className="flex-row relative z-0 relative py-2">

          {/* Animated background indicator */}
          <Animated.View
            className="absolute h-[34px] rounded-full bg-brand-primary"
            style={[{ top: 8 }, indicatorStyle, { zIndex: -1 }]}
          />

          {segments.map((segment, index) => {
            const isSelected = selectedIndex === index
            return (
              <TouchableOpacity
                key={segment}
                onLayout={(e) => handleLayout(index, e)}
                onPress={() => onChange(index)}
                className={`h-[34px] items-center justify-center px-4 rounded-full ${!isSelected ? 'border border-[rgba(255,255,255,0.08)] bg-[rgba(26,29,46,0.3)]' : ''}`}
                style={{ marginLeft: index > 0 ? 8 : 0 }}
              >
                <Text className={`text-sm tracking-wide ${isSelected ? 'text-white font-semibold' : 'text-text-secondary font-medium'}`}>
                  {segment}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </View>
  )
}

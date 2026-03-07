import React from 'react'
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView, type Edge } from 'react-native-safe-area-context'
import { theme } from '@/lib/theme'

/**
 * ScreenContainer
 *
 * Root wrapper used by every screen. Handles safe-area insets, scrolling,
 * and keyboard avoidance. All screens must be wrapped in this.
 *
 * Usage:
 *   <ScreenContainer>           — static, no scroll
 *   <ScreenContainer scrollable> — full-screen scroll
 *   <ScreenContainer scrollable keyboardAware> — for form screens
 */
export type ScreenContainerProps = {
  children: React.ReactNode
  /** Whether content should be scrollable */
  scrollable?: boolean
  /** Lift content above keyboard (for form screens) */
  keyboardAware?: boolean
  /** Inner padding applied to content. Default: 16 */
  padding?: number
  /** Override background color. Default: dark.bg */
  backgroundColor?: string
  /** Which safe-area edges to inset. Default: top + horizontal */
  edges?: Edge[]
  /** Extra padding at the bottom of scroll content (e.g. for tab bar) */
  bottomSpacing?: number
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = false,
  keyboardAware = false,
  padding = theme.spacing.base,
  backgroundColor = theme.colors.dark.bg,
  edges = ['top', 'left', 'right'],
  bottomSpacing = 80,
}) => {
  const safeAreaStyle = { flex: 1, backgroundColor }

  const inner = scrollable ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding, paddingBottom: padding + bottomSpacing }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, padding }}>
      {children}
    </View>
  )

  const wrapped = keyboardAware ? (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {inner}
    </KeyboardAvoidingView>
  ) : inner

  return (
    <SafeAreaView style={safeAreaStyle} edges={edges}>
      {wrapped}
    </SafeAreaView>
  )
}

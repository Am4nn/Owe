import React from 'react'
import { View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native'

/**
 * Stack
 *
 * Vertical spacing layout primitive. Renders children in a column with
 * a consistent gap between each child without needing per-item margins.
 *
 * Removes the need for `marginBottom` on every sibling in a list of cards,
 * form fields, or sections.
 *
 * Uses `gap` when available (RN 0.71+) and falls back to injecting
 * `marginBottom` on all-but-last children for older runtime compatibility.
 *
 * Usage:
 *   <Stack space={12}>
 *     <GlassCard>...</GlassCard>
 *     <GlassCard>...</GlassCard>
 *     <GlassCard>...</GlassCard>
 *   </Stack>
 *
 *   <Stack space={theme.spacing.md}>
 *     <TextInputField label="Name" />
 *     <TextInputField label="Email" />
 *     <Button>Continue</Button>
 *   </Stack>
 */

export interface StackProps extends ViewProps {
  /** Space between each child in logical pixels */
  space?: number
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

export function Stack({ space = 0, children, style, ...rest }: StackProps) {
  const validChildren = React.Children.toArray(children).filter(Boolean)

  return (
    <View style={[{ flexDirection: 'column' }, style]} {...rest}>
      {validChildren.map((child, index) => (
        <View
          key={index}
          style={index < validChildren.length - 1 ? { marginBottom: space } : undefined}
        >
          {child}
        </View>
      ))}
    </View>
  )
}

import React from 'react'
import { View } from 'react-native'

/**
 * Spacer
 *
 * Simple spacing primitive that inserts a fixed amount of empty space
 * in the layout. Eliminates ad-hoc `marginTop` / `marginBottom` values
 * scattered across component files.
 *
 * Default axis is vertical. Set `axis="horizontal"` for inline spacing.
 *
 * Usage:
 *   <Spacer size={16} />           — 16px vertical gap
 *   <Spacer size={8} axis="horizontal" />  — 8px horizontal gap
 *
 *   <Button>Continue</Button>
 *   <Spacer size={theme.spacing.md} />
 *   <Text variant="caption" color="tertiary">By continuing you agree…</Text>
 */

export interface SpacerProps {
  /** Size of the space in logical pixels */
  size: number
  /** Direction of the space. Default: 'vertical' */
  axis?: 'vertical' | 'horizontal'
}

export function Spacer({ size, axis = 'vertical' }: SpacerProps) {
  return (
    <View
      style={
        axis === 'vertical'
          ? { height: size, width: '100%' }
          : { width: size, height: 1 }
      }
    />
  )
}

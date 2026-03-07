import React from 'react'
import { type StyleProp, type ViewStyle, type FlexAlignType } from 'react-native'
import { Box, type BoxProps } from './Box'

/**
 * Row
 *
 * Horizontal layout primitive. Forces `flexDirection: "row"` and exposes
 * the same shorthand layout props as `Box`.
 *
 * Ideal for avatar + label + badge layouts, icon + text pairs, and any
 * side-by-side content.
 *
 * Usage:
 *   <Row gap={12} align="center">
 *     <Avatar size="sm" />
 *     <Text variant="bodySm">John paid</Text>
 *     <AmountBadge amount={42.50} />
 *   </Row>
 *
 *   <Row justify="space-between" align="center">
 *     <Text variant="h4">Balance</Text>
 *     <AmountText value={-2500} />
 *   </Row>
 */

export interface RowProps extends Omit<BoxProps, 'style'> {
  style?: StyleProp<ViewStyle>
}

export function Row({ style, ...props }: RowProps) {
  return (
    <Box
      style={[{ flexDirection: 'row' }, style]}
      {...props}
    />
  )
}

import React from 'react'
import { type StyleProp, type ViewStyle } from 'react-native'
import { Box, type BoxProps } from './Box'

/**
 * Column
 *
 * Vertical layout primitive. Explicitly enforces `flexDirection: "column"`
 * (the React Native default) and exposes the same shorthand props as `Box`.
 *
 * Makes vertical stacking intent explicit at the call site, and pairs with
 * `Row` to describe layout hierarchy clearly.
 *
 * Usage:
 *   <Column gap={8}>
 *     <Text variant="title">Dinner at Sky Lounge</Text>
 *     <Text variant="caption" color="tertiary">Yesterday</Text>
 *   </Column>
 *
 *   <Column flex={1} justify="center" align="center">
 *     <EmptyState icon={Receipt} title="No expenses yet" />
 *   </Column>
 */

export interface ColumnProps extends Omit<BoxProps, 'style'> {
  style?: StyleProp<ViewStyle>
}

export function Column({ style, ...props }: ColumnProps) {
  return (
    <Box
      style={[{ flexDirection: 'column' }, style]}
      {...props}
    />
  )
}

/**
 * UI Primitive Layer
 *
 * Thin wrappers around React Native core primitives with theme-token
 * shorthand props. These are the foundation that all other UI components
 * should compose rather than using View / Text / Pressable directly.
 *
 * Import from this barrel:
 *   import { Box, Row, Column, Stack, Text, Spacer, PressableBox } from '@/components/ui/primitives'
 *
 * Or from the top-level ui barrel (preferred for screen code):
 *   import { Box, Row, Text } from '@/components/ui'
 *
 *  LAYOUT
 *    Box           — universal View wrapper with layout shorthand props
 *    Row           — horizontal flex container (flexDirection: "row")
 *    Column        — explicit vertical flex container
 *    Stack         — vertical children with consistent spacing between them
 *    Spacer        — fixed vertical or horizontal whitespace block
 *
 *  TEXT
 *    Text          — theme-aware Text with variant + color + weight props
 *
 *  INTERACTIVE
 *    PressableBox  — Pressable with the same layout shorthand as Box
 */

export { Box }           from './Box'
export type { BoxProps } from './Box'

export { Row }           from './Row'
export type { RowProps } from './Row'

export { Column }           from './Column'
export type { ColumnProps } from './Column'

export { Stack }           from './Stack'
export type { StackProps } from './Stack'

export { Text }           from './Text'
export type { TextProps, TextVariant, TextWeight, TextColorShorthand } from './Text'

export { Spacer }           from './Spacer'
export type { SpacerProps } from './Spacer'

export { PressableBox }           from './PressableBox'
export type { PressableBoxProps } from './PressableBox'

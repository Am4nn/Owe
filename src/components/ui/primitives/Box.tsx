import React from 'react'
import { View, type ViewProps, type StyleProp, type ViewStyle, type FlexAlignType } from 'react-native'

/**
 * Box
 *
 * Universal container primitive. A thin wrapper around React Native `View`
 * with named layout shorthand props so layout intent is explicit at the
 * call site without repeating `style={{ ... }}` boilerplate.
 *
 * All React Native `ViewProps` are forwarded, and a `style` prop can always
 * be added for anything not covered by the shorthand props.
 *
 * Usage:
 *   <Box flex={1} justify="center" align="center">
 *     <EmptyState />
 *   </Box>
 *
 *   <Box padding={16} backgroundColor={theme.colors.dark.surface} borderRadius={16}>
 *     <Text>Content</Text>
 *   </Box>
 */

export interface BoxProps extends ViewProps {
  // ── Flex layout ──────────────────────────────────────────────────────────
  flex?: number
  flexShrink?: number
  flexGrow?: number
  /** Maps to `justifyContent` */
  justify?: ViewStyle['justifyContent']
  /** Maps to `alignItems` */
  align?: FlexAlignType
  /** Maps to `alignSelf` */
  self?: ViewStyle['alignSelf']
  /** Maps to `flexWrap` */
  wrap?: ViewStyle['flexWrap']

  // ── Spacing ───────────────────────────────────────────────────────────────
  padding?: number
  paddingHorizontal?: number
  paddingVertical?: number
  paddingTop?: number
  paddingBottom?: number
  paddingLeft?: number
  paddingRight?: number
  margin?: number
  marginHorizontal?: number
  marginVertical?: number
  marginTop?: number
  marginBottom?: number
  marginLeft?: number
  marginRight?: number

  // ── Gap (RN 0.71+) ───────────────────────────────────────────────────────
  gap?: number
  rowGap?: number
  columnGap?: number

  // ── Sizing ────────────────────────────────────────────────────────────────
  width?: number | string
  height?: number | string
  minWidth?: number | string
  minHeight?: number | string
  maxWidth?: number | string
  maxHeight?: number | string

  // ── Appearance ────────────────────────────────────────────────────────────
  backgroundColor?: string
  borderRadius?: number
  borderWidth?: number
  borderColor?: string
  opacity?: number
  overflow?: ViewStyle['overflow']

  // ── Style override ────────────────────────────────────────────────────────
  style?: StyleProp<ViewStyle>

  children?: React.ReactNode
}

export function Box({
  // flex
  flex,
  flexShrink,
  flexGrow,
  justify,
  align,
  self,
  wrap,
  // spacing
  padding,
  paddingHorizontal,
  paddingVertical,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  margin,
  marginHorizontal,
  marginVertical,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  // gap
  gap,
  rowGap,
  columnGap,
  // sizing
  width,
  height,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  // appearance
  backgroundColor,
  borderRadius,
  borderWidth,
  borderColor,
  opacity,
  overflow,
  // passthrough
  style,
  children,
  ...rest
}: BoxProps) {
  const composedStyle: ViewStyle = {
    // flex
    ...(flex !== undefined && { flex }),
    ...(flexShrink !== undefined && { flexShrink }),
    ...(flexGrow !== undefined && { flexGrow }),
    ...(justify !== undefined && { justifyContent: justify }),
    ...(align !== undefined && { alignItems: align }),
    ...(self !== undefined && { alignSelf: self }),
    ...(wrap !== undefined && { flexWrap: wrap }),
    // spacing
    ...(padding !== undefined && { padding }),
    ...(paddingHorizontal !== undefined && { paddingHorizontal }),
    ...(paddingVertical !== undefined && { paddingVertical }),
    ...(paddingTop !== undefined && { paddingTop }),
    ...(paddingBottom !== undefined && { paddingBottom }),
    ...(paddingLeft !== undefined && { paddingLeft }),
    ...(paddingRight !== undefined && { paddingRight }),
    ...(margin !== undefined && { margin }),
    ...(marginHorizontal !== undefined && { marginHorizontal }),
    ...(marginVertical !== undefined && { marginVertical }),
    ...(marginTop !== undefined && { marginTop }),
    ...(marginBottom !== undefined && { marginBottom }),
    ...(marginLeft !== undefined && { marginLeft }),
    ...(marginRight !== undefined && { marginRight }),
    // gap
    ...(gap !== undefined && { gap }),
    ...(rowGap !== undefined && { rowGap }),
    ...(columnGap !== undefined && { columnGap }),
    // sizing
    ...(width !== undefined && { width: width as number }),
    ...(height !== undefined && { height: height as number }),
    ...(minWidth !== undefined && { minWidth: minWidth as number }),
    ...(minHeight !== undefined && { minHeight: minHeight as number }),
    ...(maxWidth !== undefined && { maxWidth: maxWidth as number }),
    ...(maxHeight !== undefined && { maxHeight: maxHeight as number }),
    // appearance
    ...(backgroundColor !== undefined && { backgroundColor }),
    ...(borderRadius !== undefined && { borderRadius }),
    ...(borderWidth !== undefined && { borderWidth }),
    ...(borderColor !== undefined && { borderColor }),
    ...(opacity !== undefined && { opacity }),
    ...(overflow !== undefined && { overflow }),
  }

  return (
    <View style={[composedStyle, style]} {...rest}>
      {children}
    </View>
  )
}

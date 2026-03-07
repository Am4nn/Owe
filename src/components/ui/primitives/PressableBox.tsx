import React from 'react'
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type FlexAlignType,
} from 'react-native'

/**
 * PressableBox
 *
 * Pressable container primitive. Combines the layout shorthand props of
 * `Box` with React Native `Pressable` semantics.
 *
 * Use this as the interactive wrapper for tappable cards, list rows,
 * and action items instead of nesting `TouchableOpacity` inside `View`.
 *
 * The `activeOpacity` prop (default 0.75) drives the pressed-state opacity
 * via a Pressable `style` callback, matching the `TouchableOpacity` feel
 * used consistently throughout the project.
 *
 * Usage:
 *   <PressableBox onPress={openGroup} padding={16} borderRadius={16}>
 *     <GroupCard />
 *   </PressableBox>
 *
 *   <PressableBox
 *     onPress={handleSettle}
 *     flex={1}
 *     align="center"
 *     justify="center"
 *     backgroundColor={theme.colors.brand.primary}
 *     borderRadius={theme.radii.btn}
 *   >
 *     <Text variant="bodySm" weight="bold" color="inverse">Settle Up</Text>
 *   </PressableBox>
 */

export interface PressableBoxProps extends Omit<PressableProps, 'style'> {
  // ── Flex layout ──────────────────────────────────────────────────────────
  flex?: number
  flexShrink?: number
  flexGrow?: number
  justify?: ViewStyle['justifyContent']
  align?: FlexAlignType
  self?: ViewStyle['alignSelf']
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

  // ── Gap ───────────────────────────────────────────────────────────────────
  gap?: number

  // ── Sizing ────────────────────────────────────────────────────────────────
  width?: number | string
  height?: number | string
  minWidth?: number | string
  minHeight?: number | string

  // ── Appearance ────────────────────────────────────────────────────────────
  backgroundColor?: string
  borderRadius?: number
  borderWidth?: number
  borderColor?: string
  opacity?: number
  overflow?: ViewStyle['overflow']

  /**
   * Opacity applied while the element is pressed.
   * Mirrors `TouchableOpacity`'s `activeOpacity` behaviour.
   * Default: 0.75
   */
  activeOpacity?: number

  /** Style override applied to the outer Pressable */
  style?: StyleProp<ViewStyle>

  children?: React.ReactNode
}

export function PressableBox({
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
  // sizing
  width,
  height,
  minWidth,
  minHeight,
  // appearance
  backgroundColor,
  borderRadius,
  borderWidth,
  borderColor,
  opacity,
  overflow,
  // pressable
  activeOpacity = 0.75,
  style,
  children,
  ...rest
}: PressableBoxProps) {
  const baseStyle: ViewStyle = {
    ...(flex !== undefined && { flex }),
    ...(flexShrink !== undefined && { flexShrink }),
    ...(flexGrow !== undefined && { flexGrow }),
    ...(justify !== undefined && { justifyContent: justify }),
    ...(align !== undefined && { alignItems: align }),
    ...(self !== undefined && { alignSelf: self }),
    ...(wrap !== undefined && { flexWrap: wrap }),
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
    ...(gap !== undefined && { gap }),
    ...(width !== undefined && { width: width as number }),
    ...(height !== undefined && { height: height as number }),
    ...(minWidth !== undefined && { minWidth: minWidth as number }),
    ...(minHeight !== undefined && { minHeight: minHeight as number }),
    ...(backgroundColor !== undefined && { backgroundColor }),
    ...(borderRadius !== undefined && { borderRadius }),
    ...(borderWidth !== undefined && { borderWidth }),
    ...(borderColor !== undefined && { borderColor }),
    ...(opacity !== undefined && { opacity }),
    ...(overflow !== undefined && { overflow }),
  }

  return (
    <Pressable
      style={({ pressed }) => [
        baseStyle,
        { opacity: pressed ? activeOpacity : 1 },
        style,
      ]}
      {...rest}
    >
      {children}
    </Pressable>
  )
}

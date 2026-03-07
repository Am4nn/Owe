import React from 'react'
import {
  Text as RNText,
  type TextProps as RNTextProps,
  type StyleProp,
  type TextStyle,
} from 'react-native'
import { theme } from '@/lib/theme'

/**
 * Text
 *
 * Theme-aware text primitive. Wraps React Native `Text` with direct
 * access to the project's typography scale and colour tokens via props,
 * so text styles remain consistent without repeating inline style objects.
 *
 * All standard React Native `TextProps` are forwarded unchanged.
 *
 * Variant → font size mapping:
 *   display  → 32   h1  → 28   h2  → 24   h3  → 20
 *   h4       → 18   body → 16   bodySm → 14
 *   caption  → 12   tiny → 10
 *
 * Color shorthand maps to `theme.colors.text.*`:
 *   primary | secondary | tertiary | muted | inverse
 *   Or pass any raw hex / rgba string.
 *
 * Usage:
 *   <Text variant="h3" weight="bold">Group Balance</Text>
 *   <Text variant="caption" color="tertiary">2 hours ago</Text>
 *   <Text variant="body" color={theme.colors.amount.positive}>+$42.50</Text>
 */

export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'bodySm'
  | 'caption'
  | 'tiny'

export type TextWeight =
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'

export type TextColorShorthand =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'muted'
  | 'inverse'

export interface TextProps extends RNTextProps {
  /** Typography scale variant. Controls font size. Default: 'body' */
  variant?: TextVariant
  /**
   * Text colour. Accepts a shorthand key from `theme.colors.text`
   * or any raw colour string (hex, rgba, etc.).
   * Default: 'primary'
   */
  color?: TextColorShorthand | (string & {})
  /** Font weight shorthand. Default: 'normal' */
  weight?: TextWeight
  /** Align: left | center | right */
  align?: TextStyle['textAlign']
  /** Letter spacing */
  tracking?: number
  /** Line height */
  leading?: number
  /** Text transform */
  transform?: TextStyle['textTransform']
  /** Extra style override */
  style?: StyleProp<TextStyle>
  children?: React.ReactNode
}

const FONT_SIZES: Record<TextVariant, number> = {
  display: theme.typography.display,
  h1:      theme.typography.h1,
  h2:      theme.typography.h2,
  h3:      theme.typography.h3,
  h4:      theme.typography.h4,
  body:    theme.typography.body,
  bodySm:  theme.typography.bodySm,
  caption: theme.typography.caption,
  tiny:    theme.typography.tiny,
}

const FONT_WEIGHTS: Record<TextWeight, TextStyle['fontWeight']> = {
  normal:    '400',
  medium:    '500',
  semibold:  '600',
  bold:      '700',
  extrabold: '800',
}

const TEXT_COLORS: Record<TextColorShorthand, string> = {
  primary:   theme.colors.text.primary,
  secondary: theme.colors.text.secondary,
  tertiary:  theme.colors.text.tertiary,
  muted:     theme.colors.text.muted,
  inverse:   theme.colors.text.inverse,
}

function resolveColor(color: TextProps['color']): string {
  if (!color) return theme.colors.text.primary
  return (color in TEXT_COLORS)
    ? TEXT_COLORS[color as TextColorShorthand]
    : color
}

export function Text({
  variant = 'body',
  color = 'primary',
  weight = 'normal',
  align,
  tracking,
  leading,
  transform,
  style,
  children,
  ...rest
}: TextProps) {
  const composedStyle: TextStyle = {
    fontSize: FONT_SIZES[variant],
    fontWeight: FONT_WEIGHTS[weight],
    color: resolveColor(color),
    ...(align !== undefined && { textAlign: align }),
    ...(tracking !== undefined && { letterSpacing: tracking }),
    ...(leading !== undefined && { lineHeight: leading }),
    ...(transform !== undefined && { textTransform: transform }),
  }

  return (
    <RNText style={[composedStyle, style]} {...rest}>
      {children}
    </RNText>
  )
}

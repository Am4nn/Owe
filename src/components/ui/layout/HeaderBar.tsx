import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { ChevronLeft } from 'lucide-react-native'
import { theme } from '@/lib/theme'

/**
 * HeaderBar
 *
 * Top navigation bar used on almost every screen. Supports:
 * - Back button (auto-rendered when showBack=true or onLeftPress provided)
 * - Centred title
 * - Optional left/right custom icon nodes
 * - Transparent or solid background
 *
 * Usage:
 *   <HeaderBar title="Profile" showBack onLeftPress={router.back} />
 *   <HeaderBar title="Groups" rightIcon={<Bell />} onRightPress={...} />
 */
export type HeaderBarProps = {
  title?: string
  /** Custom node rendered in the left slot */
  leftIcon?: React.ReactNode
  /** Custom node rendered in the right slot */
  rightIcon?: React.ReactNode
  onLeftPress?: () => void
  onRightPress?: () => void
  /** When true (and no leftIcon provided) renders a ChevronLeft back arrow */
  showBack?: boolean
  /** When true removes the border and uses a transparent background */
  transparent?: boolean
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  showBack = false,
  transparent = false,
}) => {
  const hasLeft = showBack || !!leftIcon || !!onLeftPress
  const hasRight = !!rightIcon || !!onRightPress

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        paddingHorizontal: theme.spacing.base,
        backgroundColor: transparent ? 'transparent' : theme.colors.dark.bg,
        borderBottomWidth: transparent ? 0 : 1,
        borderBottomColor: theme.colors.glass.divider,
      }}
    >
      {/* Left slot — fixed 40px to keep title centred */}
      <View style={{ width: 40 }}>
        {hasLeft && (
          <TouchableOpacity
            onPress={onLeftPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
          >
            {leftIcon ?? (
              <ChevronLeft size={24} color={theme.colors.text.primary} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Title */}
      <View style={{ flex: 1, alignItems: 'center' }}>
        {title ? (
          <Text
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.h4,
              fontWeight: '700',
              letterSpacing: -0.3,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
        ) : null}
      </View>

      {/* Right slot — fixed 40px to keep title centred */}
      <View style={{ width: 40, alignItems: 'flex-end' }}>
        {hasRight && (
          <TouchableOpacity
            onPress={onRightPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

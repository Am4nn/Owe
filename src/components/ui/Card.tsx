import { View, ViewProps } from 'react-native'
import { theme } from '@/lib/theme'

/**
 * Card
 *
 * Generic elevated dark surface container. Simpler than GlassCard —
 * no glass/blur effect, just a solid dark surface with a subtle border.
 * Used as a general-purpose content block across dashboard, admin, and insights.
 *
 * Usage:
 *   <Card padding={16}>
 *     <Text>Content</Text>
 *   </Card>
 *
 *   <Card variant="elevated" padding={20}>
 *     <Text>Elevated content</Text>
 *   </Card>
 */

interface CardProps extends ViewProps {
  /** Inner padding on all sides */
  padding?: number
  /** Visual elevation level */
  variant?: 'default' | 'elevated' | 'flat'
  children: React.ReactNode
}

const VARIANT_STYLES = {
  default: {
    backgroundColor: theme.colors.dark.surface,
    borderColor: theme.colors.glass.border,
    borderWidth: 1,
  },
  elevated: {
    backgroundColor: theme.colors.dark.elevated,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
  },
  flat: {
    backgroundColor: 'rgba(26, 29, 46, 0.4)',
    borderColor: theme.colors.glass.divider,
    borderWidth: 1,
  },
}

export function Card({
  padding = theme.spacing.base,
  variant = 'default',
  children,
  style,
  ...props
}: CardProps) {
  const variantStyle = VARIANT_STYLES[variant]

  return (
    <View
      style={[
        {
          borderRadius: theme.radii.card,
          padding,
          ...variantStyle,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
}

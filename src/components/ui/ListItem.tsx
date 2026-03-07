import { View, Text, TouchableOpacity, Switch } from 'react-native'
import { ChevronRight, type LucideIcon } from 'lucide-react-native'
import { theme } from '@/lib/theme'

/**
 * ListItem
 *
 * Generic settings / list row. Used in:
 * - Settings & Profile screen (notifications, privacy, payment methods…)
 * - Create Group settings rows (currency, privacy toggle)
 * - Payment Methods list
 * - Help & Support categories
 *
 * Supports a Lucide icon on the left, title + optional subtitle in the
 * middle, and any node on the right (chevron, switch, badge, etc.).
 *
 * Usage:
 *   // Navigation row
 *   <ListItem
 *     icon={Bell}
 *     iconColor="#7B5CF6"
 *     title="Notifications"
 *     subtitle="Manage push alerts"
 *     onPress={...}
 *   />
 *
 *   // Toggle row
 *   <ListItem
 *     icon={Lock}
 *     title="Private Group"
 *     right={<Switch value={priv} onValueChange={setPriv} />}
 *   />
 *
 *   // Destructive action
 *   <ListItem title="Delete Account" destructive onPress={...} />
 */
interface ListItemProps {
  title: string
  subtitle?: string
  /** Lucide icon shown in the left slot */
  icon?: LucideIcon
  /** Accent colour for icon container tint */
  iconColor?: string
  /** Fully custom left node (overrides icon) */
  left?: React.ReactNode
  /** Fully custom right node (overrides default chevron) */
  right?: React.ReactNode
  /** When true shows a ChevronRight in the right slot (default: true when onPress provided) */
  showChevron?: boolean
  onPress?: () => void
  /** Red tint for destructive actions */
  destructive?: boolean
  /** Draw a bottom border/divider (default: true) */
  showDivider?: boolean
}

export function ListItem({
  title,
  subtitle,
  icon: Icon,
  iconColor = theme.colors.brand.primary,
  left,
  right,
  showChevron,
  onPress,
  destructive = false,
  showDivider = true,
}: ListItemProps) {
  const titleColor = destructive ? theme.colors.brand.danger : theme.colors.text.primary
  const autoChevron = showChevron ?? !!onPress

  const leftContent = left ?? (Icon ? (
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: theme.radii.icon,
        backgroundColor: destructive
          ? 'rgba(255, 77, 109, 0.12)'
          : `${iconColor}1E`,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon
        size={18}
        color={destructive ? theme.colors.brand.danger : iconColor}
      />
    </View>
  ) : null)

  const rightContent = right ?? (autoChevron ? (
    <ChevronRight size={18} color={theme.colors.text.tertiary} />
  ) : null)

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.6 : 1}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13,
        paddingHorizontal: theme.spacing.base,
        gap: theme.spacing.md,
        borderBottomWidth: showDivider ? 1 : 0,
        borderBottomColor: 'rgba(124, 58, 237, 0.10)',
      }}
    >
      {leftContent}

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: titleColor,
            fontSize: theme.typography.body,
            fontWeight: '500',
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={{
              color: theme.colors.text.tertiary,
              fontSize: theme.typography.caption,
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightContent}
    </TouchableOpacity>
  )
}

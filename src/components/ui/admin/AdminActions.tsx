import { View, Text, TouchableOpacity } from 'react-native'
import { type LucideIcon, ChevronRight } from 'lucide-react-native'
import { theme } from '@/lib/theme'

/**
 * AdminActions
 *
 * Vertical list of admin control actions. Each action has an icon, label,
 * optional description, and a severity level (default / warning / danger).
 *
 * Used in:
 * - admin_dashboard
 *
 * Usage:
 *   <AdminActions
 *     actions={[
 *       {
 *         id: 'broadcast',
 *         icon: Bell,
 *         label: 'Send Broadcast',
 *         description: 'Push notification to all users',
 *         onPress: () => handleBroadcast(),
 *       },
 *       {
 *         id: 'export',
 *         icon: Download,
 *         label: 'Export Data',
 *         severity: 'warning',
 *         onPress: () => handleExport(),
 *       },
 *     ]}
 *   />
 */

export type AdminActionSeverity = 'default' | 'warning' | 'danger'

export interface AdminActionItem {
  id: string
  icon: LucideIcon
  label: string
  description?: string
  severity?: AdminActionSeverity
  disabled?: boolean
  onPress?: () => void
}

export interface AdminActionsProps {
  actions: AdminActionItem[]
  title?: string
}

const SEVERITY_COLORS: Record<AdminActionSeverity, { icon: string; label: string; bg: string; border: string }> = {
  default: {
    icon: theme.colors.brand.primary,
    label: theme.colors.text.primary,
    bg: 'rgba(123, 92, 246, 0.10)',
    border: 'rgba(123, 92, 246, 0.18)',
  },
  warning: {
    icon: theme.colors.brand.warning,
    label: theme.colors.brand.warning,
    bg: 'rgba(245, 158, 11, 0.10)',
    border: 'rgba(245, 158, 11, 0.18)',
  },
  danger: {
    icon: theme.colors.brand.danger,
    label: theme.colors.brand.danger,
    bg: 'rgba(255, 77, 109, 0.10)',
    border: 'rgba(255, 77, 109, 0.18)',
  },
}

function ActionRow({ action, isLast }: { action: AdminActionItem; isLast: boolean }) {
  const severity = action.severity ?? 'default'
  const colors = SEVERITY_COLORS[severity]
  const Icon = action.icon

  const row = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.base,
        paddingHorizontal: theme.spacing.base,
        opacity: action.disabled ? 0.45 : 1,
      }}
    >
      {/* Icon container */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: theme.radii.icon,
          backgroundColor: colors.bg,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} color={colors.icon} />
      </View>

      {/* Label + description */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontSize: theme.typography.bodySm,
            fontWeight: '600',
            color: colors.label,
          }}
          numberOfLines={1}
        >
          {action.label}
        </Text>
        {action.description ? (
          <Text
            style={{
              fontSize: theme.typography.caption,
              color: theme.colors.text.tertiary,
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {action.description}
          </Text>
        ) : null}
      </View>

      <ChevronRight size={16} color={theme.colors.text.tertiary} />
    </View>
  )

  return (
    <View>
      {action.onPress && !action.disabled ? (
        <TouchableOpacity onPress={action.onPress} activeOpacity={0.75}>
          {row}
        </TouchableOpacity>
      ) : row}
      {!isLast && (
        <View
          style={{
            height: 1,
            backgroundColor: theme.colors.glass.divider,
            marginLeft: theme.spacing.base + 44 + theme.spacing.md,
          }}
        />
      )}
    </View>
  )
}

export function AdminActions({ actions, title = 'Admin Controls' }: AdminActionsProps) {
  return (
    <View
      style={{
        backgroundColor: theme.colors.dark.surface,
        borderRadius: theme.radii.card,
        borderWidth: 1,
        borderColor: theme.colors.glass.border,
        overflow: 'hidden',
      }}
    >
      {/* Section header */}
      <View
        style={{
          paddingHorizontal: theme.spacing.base,
          paddingVertical: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.glass.divider,
        }}
      >
        <Text
          style={{
            fontSize: theme.typography.caption,
            fontWeight: '700',
            color: theme.colors.text.tertiary,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
          }}
        >
          {title}
        </Text>
      </View>

      {actions.map((action, i) => (
        <ActionRow key={action.id} action={action} isLast={i === actions.length - 1} />
      ))}
    </View>
  )
}

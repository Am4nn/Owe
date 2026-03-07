import { View, Text, TouchableOpacity } from 'react-native'
import { Avatar } from '../Avatar'
import { theme } from '@/lib/theme'

/**
 * NotificationItem
 *
 * A single row in the Notifications Center. Shows an avatar on the left,
 * rich text content in the middle, and a timestamp at the bottom right.
 * Unread notifications get a subtle purple tint and a dot indicator.
 *
 * Usage:
 *   <NotificationItem
 *     avatarFallback="Sarah"
 *     text={<Text>Sarah added <Text style={{fontWeight:'700'}}>Sushi Night</Text></Text>}
 *     timestamp="2 hours ago"
 *     read={false}
 *   />
 */
export interface NotificationItemProps {
  /** Avatar image URI */
  avatar?: string | null
  /** Fallback initials for avatar */
  avatarFallback?: string
  /** Notification body — string or rich JSX */
  text: string | React.ReactNode
  timestamp: string
  /** Whether the notification has been read. Unread items get purple tint. */
  read?: boolean
  onPress?: () => void
}

export function NotificationItem({
  avatar,
  avatarFallback,
  text,
  timestamp,
  read = true,
  onPress,
}: NotificationItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.spacing.md,
        padding: theme.spacing.base,
        borderRadius: theme.radii.card,
        backgroundColor: read
          ? 'rgba(20, 20, 32, 0.5)'
          : 'rgba(123, 92, 246, 0.06)',
        borderWidth: 1,
        borderColor: read
          ? theme.colors.glass.border
          : 'rgba(123, 92, 246, 0.18)',
      }}
    >
      {/* Avatar with unread dot */}
      <View style={{ position: 'relative' }}>
        <Avatar size="md" uri={avatar} fallback={avatarFallback} />
        {!read && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 9,
              height: 9,
              borderRadius: 5,
              backgroundColor: theme.colors.brand.primary,
              borderWidth: 1.5,
              borderColor: theme.colors.dark.bg,
            }}
          />
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {typeof text === 'string' ? (
          <Text
            style={{
              color: theme.colors.text.primary,
              fontSize: theme.typography.bodySm,
              lineHeight: 20,
            }}
          >
            {text}
          </Text>
        ) : (
          text
        )}

        <Text
          style={{
            color: theme.colors.text.tertiary,
            fontSize: theme.typography.caption,
            marginTop: 4,
          }}
        >
          {timestamp}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

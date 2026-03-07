import { View, Text, TouchableOpacity } from 'react-native'
import { Avatar } from '@/components/ui/Avatar'
import { theme } from '@/lib/theme'

/**
 * ProfileHeader
 *
 * Top section of the Profile / Settings screen.
 * Shows a large editable avatar, display name, email, and an optional
 * status badge (e.g. "Pro", "Verified").
 *
 * Used in:
 * - settings_profile_no_scrollbars
 *
 * Design:
 * - Centred layout
 * - Avatar xl with camera edit overlay
 * - Display name — text-2xl font-bold white
 * - Email — text-secondary below name
 * - Optional status badge pill (brand-primary)
 *
 * Usage:
 *   <ProfileHeader
 *     name="Aman Bamzii"
 *     email="aman@example.com"
 *     avatarUri={user.avatar_url}
 *     onEditAvatar={() => openImagePicker()}
 *   />
 */

export interface ProfileHeaderProps {
  name: string
  email?: string
  avatarUri?: string | null
  statusLabel?: string
  onEditAvatar?: () => void
  onEditProfile?: () => void
}

export function ProfileHeader({
  name,
  email,
  avatarUri,
  statusLabel,
  onEditAvatar,
  onEditProfile,
}: ProfileHeaderProps) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: theme.spacing['2xl'] }}>
      {/* Avatar with edit overlay */}
      <Avatar
        size="xl"
        uri={avatarUri}
        fallback={name}
        showEdit={onEditAvatar ? 'camera' : undefined}
      />

      {/* Name */}
      <View style={{ marginTop: theme.spacing.base, alignItems: 'center', gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <Text
            style={{
              fontSize: theme.typography.h2,
              fontWeight: '700',
              color: theme.colors.text.primary,
              letterSpacing: -0.3,
            }}
          >
            {name}
          </Text>
          {onEditProfile && (
            <TouchableOpacity onPress={onEditProfile} activeOpacity={0.7} hitSlop={8}>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: theme.radii.pill,
                  backgroundColor: 'rgba(123, 92, 246, 0.12)',
                  borderWidth: 1,
                  borderColor: 'rgba(123, 92, 246, 0.22)',
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '600',
                    color: theme.colors.brand.primary,
                  }}
                >
                  Edit
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Email */}
        {email && (
          <Text
            style={{
              fontSize: theme.typography.bodySm,
              color: theme.colors.text.secondary,
            }}
          >
            {email}
          </Text>
        )}

        {/* Status badge */}
        {statusLabel && (
          <View
            style={{
              marginTop: 4,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: theme.radii.pill,
              backgroundColor: 'rgba(123, 92, 246, 0.15)',
              borderWidth: 1,
              borderColor: 'rgba(123, 92, 246, 0.25)',
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.caption,
                fontWeight: '700',
                color: theme.colors.brand.primary,
                letterSpacing: 0.5,
              }}
            >
              {statusLabel}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

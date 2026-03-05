import { View, Text } from 'react-native'
import { Avatar } from './Avatar'

interface AvatarStackProps {
  members: Array<{ uri?: string | null; name?: string }>
  maxDisplay?: number
  size?: 'sm' | 'md'
}

export function AvatarStack({ members, maxDisplay = 3, size = 'md' }: AvatarStackProps) {
  const dimensions = size === 'sm' ? 24 : 32
  const offset = dimensions * 0.6 // overlap amount

  const displayMembers = members.slice(0, maxDisplay)
  const remainder = members.length - maxDisplay

  return (
    <View className="flex-row items-center">
      {displayMembers.map((member, index) => (
        <View
          key={index}
          style={{
            marginLeft: index > 0 ? -offset : 0,
            zIndex: displayMembers.length - index
          }}
          className="rounded-full border-2 border-dark-bg"
        >
          {/* We create a custom sized Avatar wrapping instead of hacking the base Avatar component sizes */}
          <View
            style={{ width: dimensions, height: dimensions, borderRadius: dimensions / 2 }}
            className="overflow-hidden bg-dark-elevated items-center justify-center"
          >
            {member.uri ? (
              <Avatar size="sm" uri={member.uri} /> // sm is close enough inside the crop
            ) : (
              <Text className="text-[10px] font-medium text-text-primary">
                {member.name ? member.name.charAt(0).toUpperCase() : '?'}
              </Text>
            )}
          </View>
        </View>
      ))}

      {remainder > 0 && (
        <View
          style={{
            marginLeft: -offset,
            width: dimensions,
            height: dimensions,
            borderRadius: dimensions / 2,
            zIndex: 0
          }}
          className="bg-brand-primary items-center justify-center border-2 border-dark-bg"
        >
          <Text className="text-[10px] font-bold text-white">+{remainder}</Text>
        </View>
      )}
    </View>
  )
}

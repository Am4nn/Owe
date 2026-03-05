import { View, Text, Image } from 'react-native'
import { Edit2, Camera } from 'lucide-react-native'

interface AvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  uri?: string | null
  fallback?: string
  bordered?: boolean
  showOnline?: boolean
  showEdit?: 'pencil' | 'camera'
}

export function Avatar({
  size = 'md',
  uri,
  fallback,
  bordered = false,
  showOnline = false,
  showEdit,
}: AvatarProps) {
  const dimensions = {
    sm: 32,
    md: 40,
    lg: 80,
    xl: 120,
  }[size]

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-2xl',
    xl: 'text-4xl',
  }[size]

  const editIconSize = {
    sm: 12, md: 12, lg: 20, xl: 24
  }[size]

  const containerStyle = {
    width: dimensions,
    height: dimensions,
    borderRadius: dimensions / 2,
  }

  const borderClass = bordered ? "border-2 border-brand-primary" : ""

  const getInitials = (name?: string) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <View style={containerStyle} className="relative">
      <View
        style={containerStyle}
        className={`overflow-hidden bg-dark-elevated items-center justify-center ${borderClass}`}
      >
        {uri ? (
          <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <Text className={`font-semibold text-text-primary ${textSize}`}>
            {getInitials(fallback)}
          </Text>
        )}
      </View>

      {showOnline && (
        <View
          className="absolute bottom-0 right-0 rounded-full bg-status-online border-2 border-dark-bg"
          style={{
            width: Math.max(10, dimensions * 0.25),
            height: Math.max(10, dimensions * 0.25),
          }}
        />
      )}

      {showEdit && (
        <View
          className="absolute bottom-0 right-0 bg-brand-primary rounded-full items-center justify-center border-2 border-dark-bg"
          style={{
            width: Math.max(16, dimensions * 0.3),
            height: Math.max(16, dimensions * 0.3),
          }}
        >
          {showEdit === 'pencil' ? (
            <Edit2 size={editIconSize} color="white" />
          ) : (
            <Camera size={editIconSize} color="white" />
          )}
        </View>
      )}
    </View>
  )
}

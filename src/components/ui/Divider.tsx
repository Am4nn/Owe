import { View } from 'react-native'
import { theme } from '@/lib/theme'

/**
 * Divider
 *
 * Thin horizontal rule used between sections and list items.
 *
 * Usage:
 *   <Divider />
 *   <Divider marginHorizontal={16} color="rgba(124,58,237,0.15)" />
 */
interface DividerProps {
  color?: string
  marginVertical?: number
  marginHorizontal?: number
  thickness?: number
}

export function Divider({
  color = theme.colors.glass.divider,
  marginVertical = 0,
  marginHorizontal = 0,
  thickness = 1,
}: DividerProps) {
  return (
    <View
      style={{
        height: thickness,
        backgroundColor: color,
        marginVertical,
        marginHorizontal,
      }}
    />
  )
}

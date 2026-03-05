import { View } from 'react-native'
import { LucideIcon } from 'lucide-react-native'

type IconVariant = 'positive' | 'negative' | 'neutral' | 'info'

interface IconContainerProps {
  icon: LucideIcon
  variant?: IconVariant
  size?: number
  className?: string
}

export function IconContainer({ icon: Icon, variant = 'info', size = 40, className }: IconContainerProps) {
  const colors: Record<IconVariant, { bg: string, icon: string }> = {
    positive: { bg: 'bg-[#064E3B]', icon: '#06D6A0' }, // Tailwind bg-icon-surface-green not easily parseable dynamically, so hardcoding from theme here
    negative: { bg: 'bg-[#7F1D1D]', icon: '#FF4D6D' },
    neutral: { bg: 'bg-[#4C1D95]', icon: '#9B7BFF' },
    info: { bg: 'bg-dark-elevated', icon: '#F8FAFC' },
  }

  const activeColor = colors[variant]
  const iconSize = size * 0.5 // Icon is roughly half the container size

  return (
    <View
      className={`rounded-xl items-center justify-center ${activeColor.bg} ${className ?? ''}`}
      style={{ width: size, height: size }}
    >
      <Icon size={iconSize} color={activeColor.icon} />
    </View>
  )
}

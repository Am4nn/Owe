import { View, Text } from 'react-native'
import { GlassCard } from '@/components/ui/GlassCard'

interface StatCardProps {
  label: string
  value: string
  valueColor?: string // e.g., 'text-status-success', 'text-status-error', 'text-white'
}

export function StatCard({ label, value, valueColor = 'text-white' }: StatCardProps) {
  return (
    <GlassCard padding={12} className="w-[120px] h-[80px] mr-3 justify-between">
      <Text className="text-[10px] text-text-tertiary font-bold tracking-wider">{label}</Text>
      <Text className={`text-lg font-bold tracking-tight ${valueColor}`}>{value}</Text>
    </GlassCard>
  )
}

import { View, Text } from 'react-native'

type StatusVariant = 'settled' | 'unpaid' | 'active' | 'suspended' | 'completed' | 'category' | 'split'

interface StatusBadgeProps {
  label: string
  variant: StatusVariant
  className?: string
}

export function StatusBadge({ label, variant, className }: StatusBadgeProps) {
  const styles: Record<StatusVariant, { bg: string, text: string, border: string }> = {
    settled: { bg: 'bg-transparent', text: 'text-brand-success', border: 'border-brand-success' },
    unpaid: { bg: 'bg-transparent', text: 'text-brand-danger', border: 'border-brand-danger' },
    active: { bg: 'bg-[rgba(6,214,160,0.15)]', text: 'text-brand-success', border: 'border-transparent' },
    suspended: { bg: 'bg-[rgba(148,163,184,0.15)]', text: 'text-text-secondary', border: 'border-transparent' },
    completed: { bg: 'bg-[rgba(148,163,184,0.15)]', text: 'text-text-secondary', border: 'border-transparent' },
    category: { bg: 'bg-[rgba(123,92,246,0.15)]', text: 'text-brand-primary', border: 'border-transparent' },
    split: { bg: 'bg-[rgba(123,92,246,0.15)]', text: 'text-brand-primary', border: 'border-transparent' },
  }

  const activeStyle = styles[variant]

  return (
    <View
      className={`h-[22px] px-2 rounded-full justify-center items-center flex-row border ${activeStyle.bg} ${activeStyle.border} ${className ?? ''}`}
      style={{ alignSelf: 'flex-start' }}
    >
      <Text className={`text-[10px] uppercase font-bold tracking-wider ${activeStyle.text}`}>
        {label}
      </Text>
    </View>
  )
}

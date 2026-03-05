import { View, Text } from 'react-native'
import { GlassCard } from '@/components/ui/GlassCard'
import { IconContainer } from '@/components/ui/IconContainer'
import { TrendingUp, TrendingDown } from 'lucide-react-native'
import { formatMoney } from '@/lib/format'

interface BalanceCardProps {
  type: 'owed' | 'owe'
  amountCents: number
  personCount: number
}

export function BalanceCard({ type, amountCents, personCount }: BalanceCardProps) {
  const isOwed = type === 'owed'
  const title = isOwed ? 'YOU ARE OWED' : 'YOU OWE'
  const amountColor = isOwed ? 'text-status-success' : 'text-status-error'
  const iconVariant = isOwed ? 'positive' : 'negative'
  const Icon = isOwed ? TrendingDown : TrendingUp // Trending down into your wallet = owed it? Stitch uses specific arrows.

  return (
    <View className="flex-1">
      <GlassCard padding={16} className="h-[120px] justify-between">
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-text-tertiary text-[10px] font-bold tracking-wider mb-1">{title}</Text>
            <Text className="text-text-secondary text-xs">{personCount} {personCount === 1 ? 'person' : 'people'}</Text>
          </View>
          <IconContainer icon={Icon} variant={iconVariant} size={32} />
        </View>
        <Text className={`${amountColor} text-2xl font-bold tracking-tight`}>
          {formatMoney(amountCents)}
        </Text>
      </GlassCard>
    </View>
  )
}

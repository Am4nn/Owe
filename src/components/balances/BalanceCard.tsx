import { View, Text } from 'react-native'
import type { MemberBalance } from '@/features/balances/types'

interface BalanceCardProps {
  balance: MemberBalance
}

export function BalanceCard({ balance }: BalanceCardProps) {
  const { display_name, net_cents } = balance
  const amount = (Math.abs(net_cents) / 100).toFixed(2)

  let amountText: string
  let amountColor: string

  if (net_cents > 0) {
    amountText = `owes you $${amount}`
    amountColor = 'text-green-400'
  } else if (net_cents < 0) {
    amountText = `you owe $${amount}`
    amountColor = 'text-red-400'
  } else {
    amountText = 'settled'
    amountColor = 'text-white/50'
  }

  return (
    <View className="bg-dark-surface border border-dark-border rounded-xl px-4 py-3 mb-2 flex-row items-center justify-between">
      <Text className="text-white font-medium flex-1">{display_name}</Text>
      <Text className={`font-semibold text-sm ${amountColor}`}>{amountText}</Text>
    </View>
  )
}

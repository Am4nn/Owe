import { View } from 'react-native'
import { MetricCard, MetricCardProps } from './MetricCard'
import { theme } from '@/lib/theme'

/**
 * MetricsGrid
 *
 * Responsive 2-column grid of MetricCard items for the admin dashboard.
 *
 * Used in:
 * - admin_dashboard
 *
 * Usage:
 *   <MetricsGrid
 *     metrics={[
 *       { icon: Users, value: '1,284', label: 'Total Users', trend: 8.2 },
 *       { icon: DollarSign, value: '$42.8k', label: 'Total Settled', trend: 15.3 },
 *       { icon: Activity, value: '328', label: 'Active Groups', trend: -2.1 },
 *       { icon: Receipt, value: '4,201', label: 'Expenses', trend: 22.4 },
 *     ]}
 *   />
 */

export interface MetricsGridItem extends MetricCardProps {
  id: string
}

export interface MetricsGridProps {
  metrics: MetricsGridItem[]
  /** Column gap */
  gap?: number
}

export function MetricsGrid({ metrics, gap = theme.spacing.md }: MetricsGridProps) {
  // Pair items into rows of 2
  const rows: MetricsGridItem[][] = []
  for (let i = 0; i < metrics.length; i += 2) {
    rows.push(metrics.slice(i, i + 2))
  }

  return (
    <View style={{ gap }}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: 'row', gap }}>
          {row.map((metric) => (
            <View key={metric.id} style={{ flex: 1 }}>
              <MetricCard {...metric} />
            </View>
          ))}
          {/* Fill empty cell if odd number of metrics */}
          {row.length === 1 && <View style={{ flex: 1 }} />}
        </View>
      ))}
    </View>
  )
}

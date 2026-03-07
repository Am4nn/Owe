import { View, Text, FlatList, RefreshControl, SectionList } from 'react-native'
import { TransactionRow, TransactionRowProps } from './TransactionRow'
import { theme } from '@/lib/theme'
import { Receipt } from 'lucide-react-native'

/**
 * TransactionList
 *
 * Date-grouped list of TransactionRow items. Automatically buckets items
 * into sections by their `date` field. Includes an empty state and loading
 * skeleton.
 *
 * Used in:
 * - transaction_history
 * - friend_balance_sarah_miller
 *
 * Usage:
 *   <TransactionList
 *     items={transactions}
 *     loading={isLoading}
 *     onRefresh={handleRefresh}
 *   />
 */

export interface TransactionListItem extends Omit<TransactionRowProps, never> {
  id: string
  /** Section label (e.g. "Today", "Yesterday", "March 2026") */
  section?: string
}

export interface TransactionListProps {
  items: TransactionListItem[]
  loading?: boolean
  refreshing?: boolean
  onRefresh?: () => void
  emptyTitle?: string
  emptyDescription?: string
  /** When true, renders as a flat list without section headers */
  flat?: boolean
  /** Render at top of list (e.g. SearchBar / FilterChips) */
  ListHeaderComponent?: React.ReactElement
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.base,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.base,
        marginBottom: theme.spacing.sm,
        borderRadius: theme.radii.card,
        backgroundColor: 'rgba(20, 20, 32, 0.8)',
        borderWidth: 1,
        borderColor: theme.colors.glass.border,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: theme.radii.icon,
          backgroundColor: 'rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}
      />
      <View style={{ flex: 1, gap: 6 }}>
        <View style={{ width: '60%', height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.07)' }} />
        <View style={{ width: '35%', height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.04)' }} />
      </View>
      <View style={{ width: 56, height: 14, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.07)' }} />
    </View>
  )
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <View
      style={{
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: 2,
        marginBottom: 4,
        marginTop: theme.spacing.md,
      }}
    >
      <Text
        style={{
          fontSize: theme.typography.caption,
          fontWeight: '700',
          color: theme.colors.text.tertiary,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
        }}
      >
        {title}
      </Text>
    </View>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyTransactions({ title, description }: { title: string; description: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 64, paddingHorizontal: 24 }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: 'rgba(123, 92, 246, 0.12)',
          borderWidth: 1,
          borderColor: 'rgba(123, 92, 246, 0.2)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Receipt size={28} color={theme.colors.brand.primary} />
      </View>
      <Text
        style={{
          fontSize: theme.typography.h4,
          fontWeight: '600',
          color: theme.colors.text.primary,
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: theme.typography.bodySm,
          color: theme.colors.text.secondary,
          textAlign: 'center',
          lineHeight: 20,
        }}
      >
        {description}
      </Text>
    </View>
  )
}

// ── Group items by section ────────────────────────────────────────────────────

function groupBySections(items: TransactionListItem[]): { title: string; data: TransactionListItem[] }[] {
  const sectionMap = new Map<string, TransactionListItem[]>()
  for (const item of items) {
    const key = item.section ?? 'Transactions'
    if (!sectionMap.has(key)) sectionMap.set(key, [])
    sectionMap.get(key)!.push(item)
  }
  return Array.from(sectionMap.entries()).map(([title, data]) => ({ title, data }))
}

// ── Main component ────────────────────────────────────────────────────────────

export function TransactionList({
  items,
  loading = false,
  refreshing = false,
  onRefresh,
  emptyTitle = 'No transactions yet',
  emptyDescription = 'Your payment and settlement history will appear here.',
  flat = false,
  ListHeaderComponent,
}: TransactionListProps) {
  const refreshControl = onRefresh ? (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.brand.primary} />
  ) : undefined

  if (loading) {
    return (
      <View style={{ gap: 0 }}>
        {ListHeaderComponent}
        {[0, 1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
      </View>
    )
  }

  if (flat) {
    return (
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionRow {...item} />}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={<EmptyTransactions title={emptyTitle} description={emptyDescription} />}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    )
  }

  // Grouped by section
  const sections = groupBySections(items)

  if (sections.length === 0) {
    return (
      <View>
        {ListHeaderComponent}
        <EmptyTransactions title={emptyTitle} description={emptyDescription} />
      </View>
    )
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <TransactionRow {...item} />}
      renderSectionHeader={({ section }) => <SectionHeader title={section.title} />}
      ListHeaderComponent={ListHeaderComponent}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={{ paddingBottom: 16 }}
    />
  )
}

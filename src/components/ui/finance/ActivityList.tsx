import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native'
import { Avatar } from '../Avatar'
import { theme } from '@/lib/theme'
import { Activity } from 'lucide-react-native'

/**
 * ActivityList
 *
 * Vertically scrollable feed of activity events.
 * Handles: loading skeleton, empty state, pull-to-refresh, and dividers.
 *
 * Used in:
 * - activity_feed_updated_navigation
 * - activity_feed_with_search_filter
 *
 * Usage:
 *   <ActivityList
 *     items={activities}
 *     loading={isLoading}
 *     refreshing={refreshing}
 *     onRefresh={handleRefresh}
 *   />
 */

export interface ActivityListItem {
  id: string
  actorName: string
  actorAvatar?: string | null
  actionText: string
  targetName: string
  amountCents?: number
  timestamp: string
  onPress?: () => void
}

export interface ActivityListProps {
  items: ActivityListItem[]
  loading?: boolean
  refreshing?: boolean
  onRefresh?: () => void
  emptyTitle?: string
  emptyDescription?: string
  /** Render above the list items (e.g. FilterChipGroup) */
  ListHeaderComponent?: React.ReactElement
}

// ── Skeleton row ──────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.base,
      }}
    >
      {/* Avatar skeleton */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}
      />
      <View style={{ flex: 1, gap: 6 }}>
        <View style={{ width: '70%', height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.07)' }} />
        <View style={{ width: '40%', height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.04)' }} />
      </View>
      <View style={{ width: 48, height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.07)' }} />
    </View>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyActivity({ title, description }: { title: string; description: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 64, paddingHorizontal: 24 }}>
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
        <Activity size={28} color={theme.colors.brand.primary} />
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

// ── List item row ─────────────────────────────────────────────────────────────

function ActivityRow({ item }: { item: ActivityListItem }) {
  const row = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.base,
      }}
    >
      <Avatar fallback={item.actorName} uri={item.actorAvatar} size="md" />

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontSize: theme.typography.bodySm,
            color: theme.colors.text.secondary,
            lineHeight: 20,
          }}
        >
          <Text style={{ color: theme.colors.text.primary, fontWeight: '600' }}>{item.actorName}</Text>
          {' '}{item.actionText}{' '}
          {item.targetName ? (
            <Text style={{ color: theme.colors.text.primary, fontWeight: '500' }}>{item.targetName}</Text>
          ) : null}
        </Text>
        <Text
          style={{
            fontSize: theme.typography.caption,
            color: theme.colors.text.tertiary,
            marginTop: 2,
          }}
        >
          {item.timestamp}
        </Text>
      </View>

      {item.amountCents !== undefined && item.amountCents > 0 && (
        <Text
          style={{
            fontSize: theme.typography.bodySm,
            fontWeight: '600',
            color: theme.colors.text.primary,
            paddingTop: 2,
          }}
        >
          ${(item.amountCents / 100).toFixed(2)}
        </Text>
      )}
    </View>
  )

  if (item.onPress) {
    return (
      <TouchableOpacity onPress={item.onPress} activeOpacity={0.7}>
        {row}
      </TouchableOpacity>
    )
  }
  return row
}

// ── Main component ────────────────────────────────────────────────────────────

export function ActivityList({
  items,
  loading = false,
  refreshing = false,
  onRefresh,
  emptyTitle = 'No activity yet',
  emptyDescription = 'Expenses, settlements and group changes will appear here.',
  ListHeaderComponent,
}: ActivityListProps) {
  if (loading) {
    return (
      <View
        style={{
          backgroundColor: theme.colors.dark.surface,
          borderRadius: theme.radii.card,
          borderWidth: 1,
          borderColor: theme.colors.glass.border,
          overflow: 'hidden',
        }}
      >
        {ListHeaderComponent}
        {[0, 1, 2, 3].map((i) => (
          <View key={i}>
            <SkeletonRow />
            {i < 3 && (
              <View
                style={{
                  height: 1,
                  backgroundColor: theme.colors.glass.divider,
                  marginLeft: theme.spacing.base + 40 + theme.spacing.md,
                }}
              />
            )}
          </View>
        ))}
      </View>
    )
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ActivityRow item={item} />}
      ItemSeparatorComponent={() => (
        <View
          style={{
            height: 1,
            backgroundColor: theme.colors.glass.divider,
            marginLeft: theme.spacing.base + 40 + theme.spacing.md,
          }}
        />
      )}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        <EmptyActivity title={emptyTitle} description={emptyDescription} />
      }
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.brand.primary}
          />
        ) : undefined
      }
      style={{
        backgroundColor: theme.colors.dark.surface,
        borderRadius: theme.radii.card,
        borderWidth: 1,
        borderColor: theme.colors.glass.border,
        overflow: 'hidden',
      }}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
    />
  )
}

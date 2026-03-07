import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { NotificationItem, NotificationItemProps } from './NotificationItem'
import { theme } from '@/lib/theme'
import { Bell } from 'lucide-react-native'

/**
 * NotificationList
 *
 * Grouped notification feed with unread/read sections, a "Mark all read"
 * action, and a pull-to-refresh. Shows loading skeleton and empty state.
 *
 * Used in:
 * - notifications_center_updated_navigation
 *
 * Usage:
 *   <NotificationList
 *     items={notifications}
 *     loading={isLoading}
 *     onMarkAllRead={handleMarkAll}
 *   />
 */

export interface NotificationListItem extends NotificationItemProps {
  id: string
}

export interface NotificationListProps {
  items: NotificationListItem[]
  loading?: boolean
  refreshing?: boolean
  onRefresh?: () => void
  /** Callback for "Mark all as read" button. Hidden when undefined. */
  onMarkAllRead?: () => void
  emptyTitle?: string
  emptyDescription?: string
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.spacing.md,
        padding: theme.spacing.base,
        borderRadius: theme.radii.card,
        backgroundColor: 'rgba(20, 20, 32, 0.5)',
        borderWidth: 1,
        borderColor: theme.colors.glass.border,
        marginBottom: theme.spacing.sm,
      }}
    >
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
        <View style={{ width: '85%', height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.07)' }} />
        <View style={{ width: '65%', height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <View style={{ width: '30%', height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.04)', marginTop: 2 }} />
      </View>
    </View>
  )
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: 2,
        marginBottom: 4,
        marginTop: theme.spacing.base,
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
      {count !== undefined && count > 0 && (
        <View
          style={{
            paddingHorizontal: 7,
            paddingVertical: 2,
            borderRadius: theme.radii.pill,
            backgroundColor: theme.colors.brand.primary,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>{count}</Text>
        </View>
      )}
    </View>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyNotifications({ title, description }: { title: string; description: string }) {
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
        <Bell size={28} color={theme.colors.brand.primary} />
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

// ── Main component ────────────────────────────────────────────────────────────

export function NotificationList({
  items,
  loading = false,
  refreshing = false,
  onRefresh,
  onMarkAllRead,
  emptyTitle = 'All caught up',
  emptyDescription = "You don't have any notifications right now. We'll let you know when something happens.",
}: NotificationListProps) {
  const unread = items.filter((n) => !n.read)
  const read = items.filter((n) => n.read)
  const hasUnread = unread.length > 0

  // Flatten items into a single array with section markers
  type FlatItem =
    | { _type: 'section-unread' }
    | { _type: 'section-read' }
    | ({ _type: 'item' } & NotificationListItem)

  const flatData: FlatItem[] = []
  if (hasUnread) {
    flatData.push({ _type: 'section-unread' })
    for (const n of unread) flatData.push({ _type: 'item', ...n })
  }
  if (read.length > 0) {
    flatData.push({ _type: 'section-read' })
    for (const n of read) flatData.push({ _type: 'item', ...n })
  }

  const ListHeader = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 2,
        marginBottom: hasUnread ? 0 : theme.spacing.sm,
      }}
    >
      {onMarkAllRead && hasUnread && (
        <TouchableOpacity onPress={onMarkAllRead} activeOpacity={0.7}>
          <Text
            style={{
              fontSize: theme.typography.bodySm,
              fontWeight: '600',
              color: theme.colors.brand.primary,
            }}
          >
            Mark all as read
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )

  if (loading) {
    return (
      <View>
        {[0, 1, 2, 3].map((i) => <SkeletonRow key={i} />)}
      </View>
    )
  }

  if (items.length === 0) {
    return <EmptyNotifications title={emptyTitle} description={emptyDescription} />
  }

  return (
    <FlatList
      data={flatData}
      keyExtractor={(item, index) =>
        item._type === 'item' ? item.id : `${item._type}-${index}`
      }
      renderItem={({ item }) => {
        if (item._type === 'section-unread') {
          return <SectionHeader title="New" count={unread.length} />
        }
        if (item._type === 'section-read') {
          return <SectionHeader title="Earlier" />
        }
        const { _type, id, ...notifProps } = item
        return (
          <View style={{ marginBottom: theme.spacing.sm }}>
            <NotificationItem {...notifProps} />
          </View>
        )
      }}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={<EmptyNotifications title={emptyTitle} description={emptyDescription} />}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.brand.primary} />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 16 }}
    />
  )
}

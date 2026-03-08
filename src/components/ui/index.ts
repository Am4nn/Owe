/**
 * Owe UI Component Library — barrel index.
 *
 * Import all design-system components from this single file:
 *   import { Button, GlassCard, ExpenseItem } from '@/components/ui'
 *
 *  LAYOUT
 *    ScreenContainer   — SafeArea + scroll wrapper (every screen)
 *    HeaderBar         — Top nav bar with back/title/action slots
 *    BottomNavigation  — Presentational tab bar
 *
 *  PRIMITIVES
 *    Card              — Generic elevated dark surface container
 *    GlassCard         — Frosted-glass card container (default/elevated/dashed)
 *    Button            — Primary gradient / secondary / ghost / danger
 *    Avatar            — User photo with fallback initials, online dot, edit overlay
 *    AvatarStack       — Overlapping avatar row (groups, expense participants)
 *    EmptyState        — Centred icon + title + CTA for empty lists/errors
 *    Divider           — Thin horizontal rule
 *
 *  INPUTS
 *    TextInputField    — Labelled text input with icon, error, password toggle
 *    SearchBar         — Glass pill search input with clear button
 *    AmountInput       — Large currency input (Add Expense / Settlement)
 *    SegmentedControl  — Animated segmented tab switcher
 *    CategoryPill      — Icon + label category selector pill
 *    FilterChip        — Text-only filter pill
 *    FilterChipGroup   — Horizontally scrollable row of FilterChips
 *
 *  DISPLAY
 *    AmountText        — Colour-coded currency text (auto positive/negative)
 *    AmountBadge       — Compact amount as plain text or pill badge
 *    StatusBadge       — Small status label (settled/unpaid/active…)
 *    SectionLabel      — Section header + optional "See all" action
 *    IconContainer     — Square rounded icon container with tinted bg
 *
 *  LISTS
 *    ListItem          — Settings/list row with icon, title, subtitle, right slot
 *
 *  FINANCE
 *    BalanceIndicator     — Summary balance card with coloured left-border accent
 *    BalanceSummaryCard   — Full dashboard balance overview card
 *    ExpenseItem          — Expense list row (icon/avatar + title + amount)
 *    TransactionRow       — Simpler transaction history row
 *    TransactionList      — Date-grouped FlatList of TransactionRow
 *    ActivityList         — Feed FlatList of activity events
 *    NotificationItem     — Notification row with avatar + text + timestamp
 *    NotificationList     — Grouped notification feed (unread/read)
 *    InsightsCard         — Analytics stat card (icon + value + trend)
 *    SpendingChart        — SVG line/area chart for spending over time
 *    SpendingDonutChart   — SVG donut/ring chart for spending by category
 *    PaymentMethodRow     — Stored payment method row (card/bank/wallet)
 *    PaymentMethodList    — List of payment methods + add button
 *
 *  OVERLAYS & INTERACTIVE
 *    ExpandableFAB     — Radial floating-action-button menu
 *    ConfirmModal      — Generic confirmation bottom sheet
 *    GlowWrapper       — Purple glow decoration wrapper
 *    QRScannerView     — QR code scanner UI shell
 *
 *  ADMIN
 *    MetricCard        — Admin KPI card (icon + value + trend)
 *    MetricsGrid       — 2-column grid of MetricCard items
 *    AdminActions      — Vertical admin control list with severity levels
 *
 *  ILLUSTRATIONS
 *    SuccessIllustration    — Animated success checkmark circle
 *    ErrorIllustration      — Broken link / 404 motif
 *    MaintenanceIllustration — Wrench / gear maintenance motif
 *    OfflineIllustration    — Wifi-off / disconnected cloud
 *
 *  PRIMITIVES (foundation layer — compose into all other UI components)
 *    Box           — universal View wrapper with layout shorthand props
 *    Row           — horizontal flex container
 *    Column        — explicit vertical flex container
 *    Stack         — vertical children with consistent gap
 *    Text          — theme-aware Text with variant / color / weight props
 *    Spacer        — fixed vertical or horizontal whitespace
 *    PressableBox  — Pressable with the same layout shorthand as Box
 */

// ── Primitive layer ──────────────────────────────────────────────────────────
export { Box }           from './primitives/Box'
export type { BoxProps } from './primitives/Box'

export { Row }           from './primitives/Row'
export type { RowProps } from './primitives/Row'

export { Column }           from './primitives/Column'
export type { ColumnProps } from './primitives/Column'

export { Stack }           from './primitives/Stack'
export type { StackProps } from './primitives/Stack'

export { Text as UIText }           from './primitives/Text'
export type { TextProps as UITextProps, TextVariant, TextWeight, TextColorShorthand } from './primitives/Text'

export { Spacer }           from './primitives/Spacer'
export type { SpacerProps } from './primitives/Spacer'

export { PressableBox }           from './primitives/PressableBox'
export type { PressableBoxProps } from './primitives/PressableBox'

// ── Layout ──────────────────────────────────────────────────────────────────
export { ScreenContainer }  from './layout/ScreenContainer'
export type { ScreenContainerProps } from './layout/ScreenContainer'

export { HeaderBar }        from './layout/HeaderBar'
export type { HeaderBarProps } from './layout/HeaderBar'

export { BottomNavigation } from './layout/BottomNavigation'
export type { BottomNavigationProps, TabName } from './layout/BottomNavigation'

// ── Primitives ──────────────────────────────────────────────────────────────
export { Card }             from './Card'
export { GlassCard, variantStyles as glassCardVariants } from './GlassCard'
// Design tokens — re-exported for convenience; canonical source is src/lib/theme.ts
export { theme as designTheme, rnGlow } from '@/lib/theme'
export type { Theme } from '@/lib/theme'
export { Button }           from './Button'
export { Avatar }           from './Avatar'
export { AvatarStack }      from './AvatarStack'
export { EmptyState }       from './EmptyState'
export { Divider }          from './Divider'

// ── Inputs ──────────────────────────────────────────────────────────────────
export { TextInputField }   from './inputs/TextInputField'
export { SearchBar }        from './inputs/SearchBar'
export type { SearchBarProps } from './inputs/SearchBar'
export { AmountInput }      from './inputs/AmountInput'
export type { AmountInputProps } from './inputs/AmountInput'
export { SegmentedControl } from './SegmentedControl'
export { CategoryPill }     from './CategoryPill'
export { FilterChip, FilterChipGroup } from './FilterChip'

// ── Display ─────────────────────────────────────────────────────────────────
export { AmountText }       from './AmountText'
export { AmountBadge }      from './AmountBadge'
export { StatusBadge }      from './StatusBadge'
export { SectionLabel }     from './SectionLabel'
export { IconContainer }    from './IconContainer'

// ── Lists ───────────────────────────────────────────────────────────────────
export { ListItem }         from './ListItem'

// ── Finance ─────────────────────────────────────────────────────────────────
export { BalanceIndicator } from './finance/BalanceIndicator'
export type { BalanceIndicatorProps } from './finance/BalanceIndicator'

export { BalanceSummaryCard } from './finance/BalanceSummaryCard'
export type { BalanceSummaryCardProps } from './finance/BalanceSummaryCard'

export { ExpenseItem }      from './finance/ExpenseItem'
export type { ExpenseItemProps } from './finance/ExpenseItem'

export { TransactionRow }   from './finance/TransactionRow'
export type { TransactionRowProps } from './finance/TransactionRow'

export { TransactionList }  from './finance/TransactionList'
export type { TransactionListProps, TransactionListItem } from './finance/TransactionList'

export { ActivityList }     from './finance/ActivityList'
export type { ActivityListProps, ActivityListItem } from './finance/ActivityList'

export { NotificationItem } from './finance/NotificationItem'
export type { NotificationItemProps } from './finance/NotificationItem'

export { NotificationList } from './finance/NotificationList'
export type { NotificationListProps, NotificationListItem } from './finance/NotificationList'

export { InsightsCard }     from './finance/InsightsCard'
export type { InsightsCardProps } from './finance/InsightsCard'

export { SpendingChart }    from './finance/SpendingChart'
export type { SpendingChartProps, SpendingDataPoint } from './finance/SpendingChart'

export { SpendingDonutChart } from './finance/SpendingDonutChart'
export type { SpendingDonutChartProps, DonutSegment } from './finance/SpendingDonutChart'

export { PaymentMethodRow } from './finance/PaymentMethodRow'
export type { PaymentMethodRowProps, PaymentMethodType } from './finance/PaymentMethodRow'

export { PaymentMethodList } from './finance/PaymentMethodList'
export type { PaymentMethodListProps, PaymentMethodListItem } from './finance/PaymentMethodList'

// ── Overlays & Interactive ──────────────────────────────────────────────────
export { ExpandableFAB }    from './ExpandableFAB'
export { ConfirmModal }     from './ConfirmModal'
export { GlowWrapper }      from './GlowWrapper'
export { ErrorBoundary }    from './ErrorBoundary'
export { QRScannerView }    from './QRScannerView'
export type { QRScannerViewProps } from './QRScannerView'

// ── Admin ───────────────────────────────────────────────────────────────────
export { MetricCard }       from './admin/MetricCard'
export type { MetricCardProps } from './admin/MetricCard'

export { MetricsGrid }      from './admin/MetricsGrid'
export type { MetricsGridProps, MetricsGridItem } from './admin/MetricsGrid'

export { AdminActions }     from './admin/AdminActions'
export type { AdminActionsProps, AdminActionItem, AdminActionSeverity } from './admin/AdminActions'

// ── Illustrations ────────────────────────────────────────────────────────────
export { SuccessIllustration }      from './illustrations/SuccessIllustration'
export type { SuccessIllustrationProps } from './illustrations/SuccessIllustration'

export { ErrorIllustration }        from './illustrations/ErrorIllustration'
export type { ErrorIllustrationProps } from './illustrations/ErrorIllustration'

export { MaintenanceIllustration }  from './illustrations/MaintenanceIllustration'
export type { MaintenanceIllustrationProps } from './illustrations/MaintenanceIllustration'

export { OfflineIllustration }      from './illustrations/OfflineIllustration'
export type { OfflineIllustrationProps } from './illustrations/OfflineIllustration'

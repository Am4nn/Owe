/**
 * Owe UI Component Library — barrel index.
 *
 * Import all design-system components from this single file:
 *   import { Button, GlassCard, ExpenseItem } from '@/components/ui'
 *
 * Component map (by Stitch CONTEXT.stitch.md categories):
 *
 *  LAYOUT
 *    ScreenContainer   — SafeArea + scroll wrapper (every screen)
 *    HeaderBar         — Top nav bar with back/title/action slots
 *    BottomNavigation  — Presentational tab bar
 *
 *  PRIMITIVES
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
 *    BalanceIndicator  — Summary balance card with coloured left-border accent
 *    ExpenseItem       — Expense list row (icon/avatar + title + amount)
 *    TransactionRow    — Simpler transaction history row
 *    NotificationItem  — Notification row with avatar + text + timestamp
 *
 *  OVERLAYS & INTERACTIVE
 *    ExpandableFAB     — Radial floating-action-button menu
 *    ConfirmModal      — Generic confirmation bottom sheet
 *    GlowWrapper       — Purple glow decoration wrapper
 */

// ── Layout ──────────────────────────────────────────────────────────────────
export { ScreenContainer }  from './layout/ScreenContainer'
export type { ScreenContainerProps } from './layout/ScreenContainer'

export { HeaderBar }        from './layout/HeaderBar'
export type { HeaderBarProps } from './layout/HeaderBar'

export { BottomNavigation } from './layout/BottomNavigation'
export type { BottomNavigationProps, TabName } from './layout/BottomNavigation'

// ── Primitives ──────────────────────────────────────────────────────────────
export { GlassCard, variantStyles as glassCardVariants, shadows } from './GlassCard'
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
export { ExpenseItem }      from './finance/ExpenseItem'
export type { ExpenseItemProps } from './finance/ExpenseItem'
export { TransactionRow }   from './finance/TransactionRow'
export type { TransactionRowProps } from './finance/TransactionRow'
export { NotificationItem } from './finance/NotificationItem'
export type { NotificationItemProps } from './finance/NotificationItem'

// ── Overlays & Interactive ──────────────────────────────────────────────────
export { ExpandableFAB }    from './ExpandableFAB'
export { ConfirmModal }     from './ConfirmModal'
export { GlowWrapper }      from './GlowWrapper'
export { ErrorBoundary }    from './ErrorBoundary'

 Component Build Plan — Owe Design System

Reference: UI_COMPONENT_INVENTORY.md + SCREEN_COMPONENT_MAP.md
Goal: Pixel-perfect implementation of all 80+ components mapped to Stitch screens.

---

## Audit: Existing vs Missing

### Already Implemented (51 components)
Layout: ScreenContainer, HeaderBar, BottomNavigation
Primitives: Button, GlassCard, Avatar, AvatarStack, EmptyState, Divider, GlowWrapper, IconContainer
Inputs: TextInputField, SearchBar, AmountInput, SegmentedControl, CategoryPill, FilterChip/FilterChipGroup
Display: AmountText, AmountBadge, StatusBadge, SectionLabel
Lists: ListItem
Finance: BalanceIndicator, ExpenseItem, TransactionRow, NotificationItem
Overlays: ExpandableFAB (covers FAB/FABMenu/FABItem/FABOverlay/FABBackdrop), ConfirmModal, CurrencyPickerModal, MemberPickerModal
Guards: QueryGuard, ErrorBoundary
Auth: GoogleButton, OTPInput, SocialDivider
Dashboard: ActivityItem, GroupCardHorizontal, BalanceCard
Expenses: ExpenseCard, SplitEditor
Friends: ContactItem
Groups: MemberRow
Profile: SettingsMenu, StatCard
Settlement: ConfettiScreen
Status: StatusBadge, StatusScreen
Paging: PagerView, PagerView.web

### Missing — 30 components to build

---

## Phase 1 — List Containers (3 components)
Simple FlatList wrappers providing consistent empty states, loading states, and list chrome.
These unlock full screen implementations for activity, transactions, and notifications.

Components:
- ActivityList — FlatList of ActivityItem with empty state + loading skeleton
- TransactionList — FlatList of TransactionRow with date-grouped sections + empty state
- NotificationList — FlatList of NotificationItem with read/unread grouping + empty state

Location: src/components/ui/finance/

---

## Phase 2 — Dashboard & Generic Surfaces (2 components)
Unlocks the full dashboard_strict_dark_refinement screen.

Components:
- Card — Generic elevated dark surface (simpler than GlassCard, no glass effect, used as a plain container in dashboard/admin/insights). Located at src/components/ui/Card.tsx
- BalanceSummaryCard — Large card on dashboard showing net balance (You owe / You are owed) with total, gradient accent, and trend indicator. Located at src/components/ui/finance/BalanceSummaryCard.tsx

Design notes (dashboard_strict_dark_refinement):
- BalanceSummaryCard: full-width, gradient top border or left accent, large amount text, 2-col sub-row showing owed vs owing
- Card: bg-dark-surface, rounded-2xl, border border-dark-border, standard padding

---

## Phase 3 — Group Detail Components (2 components)
Unlocks group_detail_dark_theme_refined screen redesign.

Components:
- GroupHeader — Top header section of group detail: gradient cover, group name, member avatar stack, total balance chip. Located at src/components/groups/GroupHeader.tsx
- GroupBalanceSummary — Scrollable horizontal list of per-member balance chips inside a card. Located at src/components/groups/GroupBalanceSummary.tsx

Design notes (group_detail_dark_theme_refined):
- GroupHeader: full-bleed gradient (purple→deep purple), group emoji/icon, name in bold white, AvatarStack overlay, total owed pill badge
- GroupBalanceSummary: dark glass card, section title "BALANCES", horizontal scroll of member+amount chips

---

## Phase 4 — Expense Flow Components (6 components)
Unlocks split_confirmation and expense_detail_dark_theme screens.

Components:
- ExpenseSummaryCard — Prominent card showing expense title, category pill, total amount, payer, date. Located at src/components/expenses/ExpenseSummaryCard.tsx
- SplitSummary — Summary row showing split method label + per-person preview amounts. Located at src/components/expenses/SplitSummary.tsx
- SplitBreakdownList — Vertical list container for SplitMemberRow items. Located at src/components/expenses/SplitBreakdownList.tsx
- SplitMemberRow — One member's portion: Avatar + name + amount owed + optional edit. Located at src/components/expenses/SplitMemberRow.tsx
- PaidBySelector — Horizontally scrollable row of member avatars; tapped member gets purple ring highlight. Located at src/components/expenses/PaidBySelector.tsx
- SplitMethodSelector — Row of 3 pill chips: Equal / Exact / Percentage. Located at src/components/expenses/SplitMethodSelector.tsx

Design notes (add_expense_strict_dark_theme, split_confirmation):
- PaidBySelector: label "Paid by", horizontal Avatar chips with name below, selected = purple ring
- SplitMethodSelector: 3 FilterChip-style pills (Equal/Exact/Percentage), selected = brand-primary fill
- SplitMemberRow: Avatar + name (left), amount text (right), optional % / exact input inline
- ExpenseSummaryCard: GlassCard, category pill top-left, large amount center, payer + date row

---

## Phase 5 — Friends & Profile (2 components)
Unlocks friend_balance_sarah_miller and settings_profile_no_scrollbars screens.

Components:
- FriendRow — Friend list row: Avatar + name + relationship label (left), balance amount badge (right), entire row tappable. Located at src/components/friends/FriendRow.tsx
- ProfileHeader — Top section of profile screen: large Avatar (editable), display name, email, optional status badge. Located at src/components/profile/ProfileHeader.tsx

Design notes (friend_balance_sarah_miller, settings_profile_no_scrollbars):
- FriendRow: glass card row, Avatar size md, friend name bold, "Friend" label below, AmountBadge right
- ProfileHeader: centered layout, Avatar xl with camera edit overlay, name text-2xl font-bold, email text-secondary

---

## Phase 6 — Payment Methods (2 components)
Unlocks payment_methods screen.

Components:
- PaymentMethodRow — Row: icon (card/bank/wallet) + card type + masked number (left), default badge + options button (right). Located at src/components/ui/finance/PaymentMethodRow.tsx
- PaymentMethodList — Vertical list of PaymentMethodRow with "Add Payment Method" button at bottom. Located at src/components/ui/finance/PaymentMethodList.tsx

Design notes (payment_methods):
- PaymentMethodRow: GlassCard row, 40x28 icon container left, name + masked digits, "Default" green badge, chevron right
- PaymentMethodList: section header, flat list of rows, footer Add button (secondary variant)

---

## Phase 7 — Insights & Analytics (2 components)
Unlocks insights_updated_navigation screen.

Components:
- InsightsCard — Stat card with icon, label, large value, and trend indicator (up/down arrow + %). Located at src/components/ui/finance/InsightsCard.tsx
- SpendingChart — SVG line/bar chart showing monthly spending. Built with react-native-svg (already installed). Located at src/components/ui/finance/SpendingChart.tsx

Design notes (insights_updated_navigation):
- InsightsCard: GlassCard, IconContainer top-left, value text-3xl font-bold, trend row below
- SpendingChart: line chart with gradient fill, x-axis month labels, purple stroke (#7B5CF6), gradient area fill from purple→transparent, y-axis amount labels

---

## Phase 8 — Onboarding Components (3 components)
Unlocks splash_onboarding_owe_new_logo screen.

Components:
- OnboardingSlide — Single slide: full-screen illustration area (top 60%), title, subtitle (bottom 40%). Located at src/components/onboarding/OnboardingSlide.tsx
- PaginationDots — Row of dot indicators; active dot is wider pill (24px), inactive are small circles (8px). Located at src/components/onboarding/PaginationDots.tsx
- OnboardingCarousel — PagerView wrapper that composes OnboardingSlide array + PaginationDots + nav buttons. Located at src/components/onboarding/OnboardingCarousel.tsx

Design notes (splash_onboarding_owe_new_logo):
- Dots: animated width transition (active=24px pill, inactive=8px circle), brand-primary color active
- Slide: gradient background, illustration placeholder or SVG, bold title, secondary subtitle
- Carousel: handles swipe + dot sync + previous/next/skip/get started CTAs

---

## Phase 9 — Illustrations (4 components)
Unlocks success/error/maintenance/offline status screens.

Components:
- SuccessIllustration — Animated SVG: green circle with checkmark, radiating rings. Located at src/components/ui/illustrations/SuccessIllustration.tsx
- ErrorIllustration — SVG: broken link or 404 graphic in purple/red tones. Located at src/components/ui/illustrations/ErrorIllustration.tsx
- MaintenanceIllustration — SVG: wrench/gear graphic in purple tones. Located at src/components/ui/illustrations/MaintenanceIllustration.tsx
- OfflineIllustration — SVG: wifi-off or cloud disconnected graphic. Located at src/components/ui/illustrations/OfflineIllustration.tsx

Design notes:
- All use react-native-svg (already installed)
- Color palette matches dark theme: purple accent, white/muted strokes
- SuccessIllustration has Reanimated pulse ring animation

---

## Phase 10 — Admin & Advanced (4 components + 1 placeholder)
Unlocks admin_dashboard and qr_code_payment_navigation_fixed screens.

Components:
- MetricCard — Compact card: icon (top), large metric value, label below, trend chip. Located at src/components/ui/admin/MetricCard.tsx
- MetricsGrid — 2-column grid of MetricCard items. Located at src/components/ui/admin/MetricsGrid.tsx
- AdminActions — Vertical list of action buttons with destructive/warning styling. Located at src/components/ui/admin/AdminActions.tsx
- QRScannerView — Placeholder UI (expo-camera not installed): shows camera frame outline, scan line animation, instructions text, and "Enable Camera" button. Located at src/components/ui/QRScannerView.tsx

Note: QRScannerView requires `expo-camera` installation. Current version is a UI shell that can be wired up once the dependency is added.

---

## Showcase Integration
After each phase, the components will be:
1. Added to src/components/ui/index.ts barrel export
2. Demonstrated in app/(dev)/index.tsx component showcase

---

## Implementation Order Summary

| Phase | Components | Count | Complexity |
|-------|-----------|-------|------------|
| 1 | ActivityList, TransactionList, NotificationList | 3 | Low |
| 2 | Card, BalanceSummaryCard | 2 | Low |
| 3 | GroupHeader, GroupBalanceSummary | 2 | Medium |
| 4 | ExpenseSummaryCard, SplitSummary, SplitBreakdownList, SplitMemberRow, PaidBySelector, SplitMethodSelector | 6 | Medium-High |
| 5 | FriendRow, ProfileHeader | 2 | Low |
| 6 | PaymentMethodRow, PaymentMethodList | 2 | Low |
| 7 | InsightsCard, SpendingChart | 2 | High (SVG chart) |
| 8 | OnboardingSlide, PaginationDots, OnboardingCarousel | 3 | Medium |
| 9 | SuccessIllustration, ErrorIllustration, MaintenanceIllustration, OfflineIllustration | 4 | Medium (SVG) |
| 10 | MetricCard, MetricsGrid, AdminActions, QRScannerView | 4 | Medium |
| **TOTAL** | | **30** | |

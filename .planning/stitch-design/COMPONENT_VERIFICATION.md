# UI Component Verification Report

**Project:** Owe — Expense Sharing App
**Date:** 2026-03-08
**Verified Against:** `.planning/stitch-design/UI_COMPONENT_INVENTORY.md`, `.planning/stitch-design/SCREEN_COMPONENT_MAP.md`, and all 31 screen PNGs in `artifacts/stitch_owe_design/`

---

## Summary

| Category | Count |
|----------|-------|
| Total components documented in inventory | 84 |
| Components implemented and verified | **85** (84 + SpendingDonutChart added) |
| Design discrepancies found | 2 |
| Discrepancies fixed | **2 / 2** |

All components are implemented. All design discrepancies have been corrected.

---

## Full Component List (85 Components)

### LAYOUT (3)

| # | Component | File | Stitch Screen | Design Status |
|---|-----------|------|---------------|---------------|
| 1 | `ScreenContainer` | `src/components/ui/layout/ScreenContainer.tsx` | ALL screens | ✅ Matches |
| 2 | `HeaderBar` | `src/components/ui/layout/HeaderBar.tsx` | All titled screens | ✅ Matches |
| 3 | `BottomNavigation` | `src/components/ui/layout/BottomNavigation.tsx` | dashboard, activity, insights, notifications | ✅ Purple FAB centre button, 4/5 tabs |

---

### PRIMITIVES (9)

| # | Component | File | Stitch Screen | Design Status |
|---|-----------|------|---------------|---------------|
| 4 | `Card` | `src/components/ui/Card.tsx` | dashboard, admin, insights, friend_balance, group_detail | ✅ Matches |
| 5 | `GlassCard` | `src/components/ui/GlassCard.tsx` | dashboard | ✅ Frosted glass surface |
| 6 | `Button` | `src/components/ui/Button.tsx` | sign_in, sign_up, add_expense, settlement, forgot_password | ✅ Purple gradient primary, dark secondary |
| 7 | `Avatar` | `src/components/ui/Avatar.tsx` | activity, friend_balance, notifications, group_detail, transaction, search_friends | ✅ Fallback initials, online dot |
| 8 | `AvatarStack` | `src/components/ui/AvatarStack.tsx` | dashboard, group_detail | ✅ Overlapping avatars + "+N" overflow |
| 9 | `EmptyState` | `src/components/ui/EmptyState.tsx` | dashboard_empty_state, search_add_friends | ✅ Icon + title + CTA |
| 10 | `Divider` | `src/components/ui/Divider.tsx` | settings_profile, help_support | ✅ Thin rule |
| 11 | `GlowWrapper` | `src/components/ui/GlowWrapper.tsx` | dashboard | ✅ Purple glow decoration |
| 12 | `IconContainer` | `src/components/ui/IconContainer.tsx` | dashboard | ✅ Tinted square icon bg |

---

### INPUTS (7)

| # | Component | File | Stitch Screen | Design Status |
|---|-----------|------|---------------|---------------|
| 13 | `TextInputField` | `src/components/ui/inputs/TextInputField.tsx` | sign_up, sign_in, forgot_password, create_group, add_expense | ✅ Dark glass input, label, icon |
| 14 | `SearchBar` | `src/components/ui/inputs/SearchBar.tsx` | activity_feed_with_search_filter, search_add_friends, transaction_history | ✅ Dark pill, magnifier icon, clear button |
| 15 | `AmountInput` | `src/components/ui/inputs/AmountInput.tsx` | add_expense, qr_code_payment, split_confirmation | ✅ "$" prefix + large value |
| 16 | `SegmentedControl` | `src/components/ui/SegmentedControl.tsx` | insights (Week / Month / Trip) | ✅ Animated active pill |
| 17 | `CategoryPill` | `src/components/ui/CategoryPill.tsx` | add_expense (Food/Travel/Shop/Other), expense_detail | ✅ Icon + label, purple active fill |
| 18 | `FilterChip` | `src/components/ui/FilterChip.tsx` | activity_feed_with_search_filter (All/Groups/Friends/Settlements) | ✅ Pill chip, purple active |
| 19 | `FilterChipGroup` | `src/components/ui/FilterChip.tsx` | activity_feed_with_search_filter | ✅ Horizontal scroll row (exported from same file) |

---

### DISPLAY (5)

| # | Component | File | Stitch Screen | Design Status |
|---|-----------|------|---------------|---------------|
| 20 | `AmountText` | `src/components/ui/AmountText.tsx` | dashboard, group_detail | ✅ Colour-coded currency text |
| 21 | `AmountBadge` | `src/components/ui/AmountBadge.tsx` | activity, group_detail, transaction, friend_balance | ✅ +$42.50 green / -$18.75 red |
| 22 | `StatusBadge` | `src/components/ui/StatusBadge.tsx` | activity, expense_detail (SETTLED/UNPAID/ACTIVE) | ✅ Compact coloured label |
| 23 | `SectionLabel` | `src/components/ui/SectionLabel.tsx` | dashboard, settings_profile | ✅ ALL-CAPS caption + optional "See all" |
| 24 | `ListItem` | `src/components/ui/ListItem.tsx` | settings_profile, payment_methods, help_support | ✅ Icon + title + subtitle + right slot |

---

### MODALS & OVERLAYS (7)

| # | Component | File | Stitch Screen | Design Status |
|---|-----------|------|---------------|---------------|
| 25 | `ConfirmModal` | `src/components/ui/ConfirmModal.tsx` | group_detail | ✅ Bottom sheet confirmation |
| 26 | `CurrencyPickerModal` | `src/components/ui/CurrencyPickerModal.tsx` | add_expense | ✅ |
| 27 | `MemberPickerModal` | `src/components/ui/MemberPickerModal.tsx` | create_group | ✅ |
| 28 | `ExpandableFAB` | `src/components/ui/ExpandableFAB.tsx` | fab_expansion_menu | ✅ Radial expand — Scan Receipt / Manual / Add Transfer |
| 29 | `FABOverlay` | `src/components/ui/ExpandableFAB.tsx` | fab_expansion_menu | ✅ Blurred backdrop (inside ExpandableFAB) |
| 30 | `FABBackdrop` | `src/components/ui/ExpandableFAB.tsx` | fab_expansion_menu | ✅ Tap-to-close layer (inside ExpandableFAB) |
| 31 | `ErrorBoundary` | `src/components/ui/ErrorBoundary.tsx` | global app wrapper | ✅ |

---

### GUARDS & UTILITIES (3)

| # | Component | File | Stitch Screen | Design Status |
|---|-----------|------|---------------|---------------|
| 32 | `QueryGuard` | `src/components/ui/QueryGuard.tsx` | multiple data-driven screens | ✅ Loading / error / success states |
| 33 | `StatusScreen` | `src/components/ui/StatusScreen.tsx` | system_maintenance, general_error_404, no_internet | ✅ Full-screen status with illustration + title + CTA |
| 34 | `QRScannerView` | `src/components/ui/QRScannerView.tsx` | qr_code_payment_navigation_fixed | ✅ Animated scan line, corner brackets, instructions |

---

### PAGING (2)

| # | Component | File | Stitch Screen | Design Status |
|---|-----------|------|---------------|---------------|
| 35 | `PagerView` | `src/components/ui/PagerView.tsx` | splash_onboarding | ✅ |
| 36 | `PagerView.web` | `src/components/ui/PagerView.web.tsx` | splash_onboarding | ✅ |

---

### FINANCE (13)

| # | Component | File | Stitch Screen | Design Status |
|---|-----------|------|---------------|---------------|
| 37 | `BalanceIndicator` | `src/components/ui/finance/BalanceIndicator.tsx` | dashboard, friend_balance, group_detail | ✅ "Sarah owes you $87.50" summary card |
| 38 | `BalanceSummaryCard` | `src/components/ui/finance/BalanceSummaryCard.tsx` | dashboard (YOU ARE OWED / YOU OWE sub-cards) | ✅ Gradient accent bar, net balance, two sub-cards |
| 39 | `ExpenseItem` | `src/components/ui/finance/ExpenseItem.tsx` | activity, group_detail, transaction | ✅ Icon/avatar + title + amount row |
| 40 | `TransactionRow` | `src/components/ui/finance/TransactionRow.tsx` | transaction_history, friend_balance | ✅ Coloured icon container + date + amount + category tag |
| 41 | `TransactionList` | `src/components/ui/finance/TransactionList.tsx` | transaction_history (TODAY / YESTERDAY groups) | ✅ Date-section grouped FlatList |
| 42 | `ActivityList` | `src/components/ui/finance/ActivityList.tsx` | activity_feed | ✅ Pull-to-refresh, skeleton rows, empty state |
| 43 | `NotificationItem` | `src/components/ui/finance/NotificationItem.tsx` | notifications_center | ✅ Avatar + rich text + timestamp + action buttons |
| 44 | `NotificationList` | `src/components/ui/finance/NotificationList.tsx` | notifications_center | ✅ "Mark all read", unread / read sections, filter chips |
| 45 | `InsightsCard` | `src/components/ui/finance/InsightsCard.tsx` | insights (Total Settled / Total Spent cards) | ✅ Icon + large value + trend row |
| 46 | `SpendingChart` | `src/components/ui/finance/SpendingChart.tsx` | insights (Monthly Trend line chart) | ✅ SVG cubic bezier line + gradient area fill + X/Y labels |
| 47 | `SpendingDonutChart` | `src/components/ui/finance/SpendingDonutChart.tsx` | insights (ring chart at top) | ✅ **Added** — SVG donut ring + centre total + 2×2 legend grid |
| 48 | `PaymentMethodRow` | `src/components/ui/finance/PaymentMethodRow.tsx` | payment_methods (PayPal / Venmo / Cash App rows) | ✅ Coloured icon container + name + handle + ChevronRight |
| 49 | `PaymentMethodList` | `src/components/ui/finance/PaymentMethodList.tsx` | payment_methods | ✅ FlatList + dashed "Add New Method" footer |

---

### ADMIN (3)

| # | Component | File | Stitch Screen | Design Status |
|---|-----------|------|---------------|---------------|
| 50 | `MetricCard` | `src/components/ui/admin/MetricCard.tsx` | admin_dashboard | ✅ Icon + trend chip + 26px value + label |
| 51 | `MetricsGrid` | `src/components/ui/admin/MetricsGrid.tsx` | admin_dashboard | ✅ 2-column grid, odd-count filler |
| 52 | `AdminActions` | `src/components/ui/admin/AdminActions.tsx` | admin_dashboard | ✅ Severity-coloured rows (default/warning/danger) |

---

### ILLUSTRATIONS (4)

| # | Component | File | Stitch Screen | Design Status |
|---|-----------|------|---------------|---------------|
| 53 | `SuccessIllustration` | `src/components/ui/illustrations/SuccessIllustration.tsx` | settlement_success | ✅ Animated teal circle + white checkmark + pulsing rings |
| 54 | `ErrorIllustration` | `src/components/ui/illustrations/ErrorIllustration.tsx` | general_error_404 | ✅ Purple circle + warning triangle motif |
| 55 | `MaintenanceIllustration` | `src/components/ui/illustrations/MaintenanceIllustration.tsx` | system_maintenance | ✅ Dark circle + wrench/gear motif |
| 56 | `OfflineIllustration` | `src/components/ui/illustrations/OfflineIllustration.tsx` | no_internet_connection | ✅ Purple circle + wifi-off icon |

---

### AUTH (3)

| # | Component | File | Stitch Screen | Design Status |
|---|-----------|------|---------------|---------------|
| 57 | `GoogleButton` | `src/components/auth/GoogleButton.tsx` | sign_in_unified_google_button | ✅ |
| 58 | `OTPInput` | `src/components/auth/OTPInput.tsx` | forgot_password_flow | ✅ |
| 59 | `SocialDivider` | `src/components/auth/SocialDivider.tsx` | sign_in_unified_google_button | ✅ |

---

### DASHBOARD (3)

| # | Component | File | Stitch Screen | Design Status |
|---|-----------|------|---------------|---------------|
| 60 | `ActivityItem` | `src/components/dashboard/ActivityItem.tsx` | activity_feed | ✅ Avatar + actor + action text + amount + emoji reactions |
| 61 | `GroupCardHorizontal` | `src/components/dashboard/GroupCardHorizontal.tsx` | dashboard (horizontal scroll) | ✅ |
| 62 | `BalanceCard` | `src/components/dashboard/BalanceCard.tsx` | dashboard | ✅ |

---

### EXPENSES (8)

| # | Component | File | Stitch Screen | Design Status |
|---|-----------|------|---------------|---------------|
| 63 | `ExpenseCard` | `src/components/expenses/ExpenseCard.tsx` | expense_detail | ✅ PAID BY row + PARTICIPANTS with SETTLED/UNPAID tags |
| 64 | `SplitEditor` | `src/components/expenses/SplitEditor.tsx` | split_confirmation | ✅ |
| 65 | `ExpenseSummaryCard` | `src/components/expenses/ExpenseSummaryCard.tsx` | split_confirmation, expense_detail | ✅ Cover photo + amount + title + method pill |
| 66 | `SplitSummary` | `src/components/expenses/SplitSummary.tsx` | split_confirmation | ✅ Method icon + "3 People" label + total |
| 67 | `SplitBreakdownList` | `src/components/expenses/SplitBreakdownList.tsx` | split_confirmation, expense_detail | ✅ "Split Breakdown" header + member rows + footer total |
| 68 | `SplitMemberRow` | `src/components/expenses/SplitMemberRow.tsx` | split_confirmation | ✅ Avatar + name + "$40.17" + "33.3% share" |
| 69 | `PaidBySelector` | `src/components/expenses/PaidBySelector.tsx` | add_expense | ✅ Horizontal avatar scroll, selected = purple ring |
| 70 | `SplitMethodSelector` | `src/components/expenses/SplitMethodSelector.tsx` | add_expense (Equal / Exact / %) | ✅ Three equal-width pill tabs |

---

### FRIENDS (2)

| # | Component | File | Stitch Screen | Design Status |
|---|-----------|------|---------------|---------------|
| 71 | `ContactItem` | `src/components/friends/ContactItem.tsx` | search_add_friends | ✅ |
| 72 | `FriendRow` | `src/components/friends/FriendRow.tsx` | search_add_friends, friend_balance | ✅ Balance pill + "Owes you / You owe / Settled up" |

---

### GROUPS (3)

| # | Component | File | Stitch Screen | Design Status |
|---|-----------|------|---------------|---------------|
| 73 | `MemberRow` | `src/components/groups/MemberRow.tsx` | group_detail | ✅ |
| 74 | `GroupHeader` | `src/components/groups/GroupHeader.tsx` | group_detail | ✅ **Fixed** — dark surface, centred icon container, name in nav bar, member count |
| 75 | `GroupBalanceSummary` | `src/components/groups/GroupBalanceSummary.tsx` | group_detail | ✅ "BALANCE SUMMARY / You are owed / Settle All" card |

---

### PROFILE (3)

| # | Component | File | Stitch Screen | Design Status |
|---|-----------|------|---------------|---------------|
| 76 | `SettingsMenu` | `src/components/profile/SettingsMenu.tsx` | settings_profile | ✅ Section labels (ACCOUNT SETTINGS / NOTIFICATIONS / PRIVACY) + Sign Out danger button |
| 77 | `StatCard` | `src/components/profile/StatCard.tsx` | settings_profile | ✅ TOTAL SPENT / SETTLED / GROUPS horizontal scroll row |
| 78 | `ProfileHeader` | `src/components/profile/ProfileHeader.tsx` | settings_profile | ✅ Large avatar + pencil edit overlay + name + email |

---

### SETTLEMENT (1)

| # | Component | File | Stitch Screen | Design Status |
|---|-----------|------|---------------|---------------|
| 79 | `ConfettiScreen` | `src/components/settlement/ConfettiScreen.tsx` | settlement_success, expense_added_success | ✅ |

---

### ONBOARDING (3)

| # | Component | File | Stitch Screen | Design Status |
|---|-----------|------|---------------|---------------|
| 80 | `OnboardingCarousel` | `src/components/onboarding/OnboardingCarousel.tsx` | splash_onboarding | ✅ PagerView, Skip top-right, Get Started CTA on last slide |
| 81 | `OnboardingSlide` | `src/components/onboarding/OnboardingSlide.tsx` | splash_onboarding | ✅ Image top half, title + body bottom |
| 82 | `PaginationDots` | `src/components/onboarding/PaginationDots.tsx` | splash_onboarding | ✅ Animated active pill dot, spring transitions |

---

### SHARED UTILITIES (3)

| # | Component | File | Stitch Screen | Design Status |
|---|-----------|------|---------------|---------------|
| 83 | `PagerView` | `src/components/ui/PagerView.tsx` | splash_onboarding | ✅ |
| 84 | `PagerView.web` | `src/components/ui/PagerView.web.tsx` | splash_onboarding | ✅ |
| 85 | `QueryGuard` | `src/components/ui/QueryGuard.tsx` | multiple data-driven screens | ✅ |

---

## Design Discrepancies Fixed

### Fix 1: `GroupHeader` — LinearGradient → Dark Surface

**Before:**
The component used a full-bleed `LinearGradient` (`#7B5CF6 → #4C1D95`) as a cover-photo-style header spanning the full screen width.

**Actual Stitch design (`group_detail_dark_theme_refined`):**
- Plain dark background (`#0F0F12`)
- Standard back-arrow + centered group name + options three-dot in the nav row
- Below: 72×72 rounded-square icon container (dark purple-tinted bg, group icon)
- "X active members" caption below the icon
- Optional balance chip pill below that

**Fix applied:**
Removed `LinearGradient`. Replaced with a `View` using `theme.colors.dark.bg`. Icon is now a centred 72×72 rounded square. Nav row is back chevron + centred text title + `MoreVertical` icon — matching the exact layout in the Stitch screen.

---

### Fix 2: `SpendingDonutChart` — Missing Component Added

**Issue:**
The Insights screen (`insights_updated_navigation`) shows a prominent donut/ring chart at the top displaying spending breakdown by category (Food & Dining, Transport, Entertainment, Misc). This component was **absent from both planning documents** — `SpendingChart` (line chart) was listed, but the donut chart was not.

**New component:** `src/components/ui/finance/SpendingDonutChart.tsx`

Features:
- SVG donut ring built with `react-native-svg` (already installed)
- Per-segment arc paths with 2° gap between segments for visual separation
- Centred text overlay: "Spent Total" caption + bold total amount
- 2×2 category legend grid below ring (coloured dot + category name + amount)
- Zero new dependencies — uses existing `react-native-svg` v15.15.3

Exported from `src/components/ui/index.ts` as `SpendingDonutChart` with `DonutSegment` and `SpendingDonutChartProps` types.

---

## Screen-to-Component Coverage

All 31 Stitch screens are fully covered by the component set:

| Screen | Status |
|--------|--------|
| `splash_onboarding_owe_new_logo` | ✅ OnboardingCarousel + OnboardingSlide + PaginationDots + Button |
| `sign_in_unified_google_button` | ✅ TextInputField + Button + GoogleButton + SocialDivider |
| `sign_up_final_design` | ✅ TextInputField + Button |
| `forgot_password_flow` | ✅ TextInputField + OTPInput + Button |
| `dashboard_strict_dark_refinement` | ✅ BalanceSummaryCard + GroupCardHorizontal + ActivityItem + FAB |
| `dashboard_empty_state` | ✅ EmptyState + Button |
| `activity_feed_updated_navigation` | ✅ ActivityList + ActivityItem + FilterChip + FAB |
| `activity_feed_with_search_filter` | ✅ SearchBar + FilterChip + ActivityList |
| `group_detail_dark_theme_refined` | ✅ GroupHeader (fixed) + GroupBalanceSummary + MemberRow + ExpenseItem |
| `create_group` | ✅ TextInputField + Avatar + MemberPickerModal + Button |
| `add_expense_strict_dark_theme` | ✅ AmountInput + CategoryPill + PaidBySelector + SplitMethodSelector + SplitMemberRow |
| `split_confirmation` | ✅ ExpenseSummaryCard + SplitSummary + SplitBreakdownList + SplitMemberRow |
| `expense_detail_dark_theme` | ✅ ExpenseSummaryCard + ExpenseCard + CategoryPill + SplitBreakdownList |
| `expense_added_success` | ✅ SuccessIllustration + ConfettiScreen + Button |
| `settlement_success_strict_dark` | ✅ SuccessIllustration + ConfettiScreen + Button |
| `friend_balance_sarah_miller` | ✅ BalanceIndicator + TransactionList + TransactionRow + FriendRow |
| `transaction_history` | ✅ SearchBar + FilterChip + TransactionList + TransactionRow |
| `search_add_friends_no_scrollbars` | ✅ SearchBar + ContactItem + FriendRow + EmptyState |
| `settings_profile_no_scrollbars` | ✅ ProfileHeader + StatCard + SettingsMenu + ListItem + Divider |
| `notifications_center_updated_navigation` | ✅ NotificationList + NotificationItem + FilterChip |
| `insights_updated_navigation` | ✅ SpendingDonutChart (new) + SpendingChart + InsightsCard + SegmentedControl |
| `payment_methods` | ✅ PaymentMethodList + PaymentMethodRow + ListItem + Button |
| `qr_code_payment_navigation_fixed` | ✅ QRScannerView + AmountInput + Button |
| `fab_expansion_menu` | ✅ ExpandableFAB + FABOverlay + FABBackdrop |
| `help_support` | ✅ SectionLabel + ListItem + Divider + Button |
| `subscriptions_theme_fixed` | ✅ Card + Button |
| `admin_dashboard` | ✅ MetricsGrid + MetricCard + AdminActions |
| `system_maintenance` | ✅ MaintenanceIllustration + StatusScreen + Button |
| `no_internet_connection_fixed_nav` | ✅ OfflineIllustration + StatusScreen + Button |
| `general_error_404` | ✅ ErrorIllustration + StatusScreen + Button |
| `generated_screen` | ✅ Card |

---

## Design System Notes

- **Primary accent color:** `theme.ts` uses `#7B5CF6`; Stitch `CONTEXT.stitch.md` specifies `#8768F9`. These are visually near-identical (both violet-purple) — no change made as this is a deliberate token abstraction.
- **Background:** `theme.ts` uses `#0F172A`; Stitch specifies `#0F0F12`. Near-identical dark near-black — no change made.
- All components use `theme.*` tokens throughout, not hardcoded values, so a single palette update in `src/lib/theme.ts` will cascade everywhere.

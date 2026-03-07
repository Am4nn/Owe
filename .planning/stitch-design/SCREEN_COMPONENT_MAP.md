# SCREEN_COMPONENT_MAP.md

Project: **Owe — Expense Sharing App**

This document maps **each Stitch screen to the UI components required to render it**.

Screen names match the **exact folder names in the Stitch export**.

Structure:

```
screen_name
 ├ component
 ├ component
 └ component
```

Components come from:

* **Common UI primitives**
* **Existing repo components**
* **Derived screen components**

---

# splash_onboarding_owe_new_logo

```
ScreenContainer
OnboardingCarousel
OnboardingSlide
PaginationDots
Button
PagerView
```

---

# sign_in_unified_google_button

```
ScreenContainer
HeaderBar
TextInputField
Button
GoogleButton
SocialDivider
```

---

# sign_up_final_design

```
ScreenContainer
HeaderBar
TextInputField
Button
```

---

# forgot_password_flow

```
ScreenContainer
HeaderBar
TextInputField
Button
OTPInput
```

---

# dashboard_strict_dark_refinement

```
ScreenContainer
HeaderBar
BottomNavigation
BalanceSummaryCard
BalanceCard
Card
AmountText
AvatarStack
GroupCardHorizontal
FAB
FABMenu
SectionLabel
```

---

# dashboard_empty_state

```
ScreenContainer
HeaderBar
BottomNavigation
EmptyState
Button
```

---

# activity_feed_updated_navigation

```
ScreenContainer
HeaderBar
BottomNavigation
ActivityList
ActivityItem
Avatar
AmountBadge
StatusBadge
FAB
FABMenu
```

---

# activity_feed_with_search_filter

```
ScreenContainer
HeaderBar
SearchBar
FilterChip
ActivityList
ActivityItem
Avatar
AmountBadge
```

---

# group_detail_dark_theme_refined

```
ScreenContainer
HeaderBar
GroupHeader
GroupBalanceSummary
AvatarStack
ExpenseItem
MemberRow
AmountBadge
BalanceIndicator
FAB
FABMenu
ConfirmModal
```

---

# create_group

```
ScreenContainer
HeaderBar
TextInputField
Avatar
MemberPickerModal
Button
```

---

# add_expense_strict_dark_theme

```
ScreenContainer
HeaderBar
TextInputField
AmountInput
PaidBySelector
SplitMethodSelector
SplitMemberRow
CurrencyPickerModal
Button
```

---

# split_confirmation

```
ScreenContainer
HeaderBar
ExpenseSummaryCard
SplitSummary
SplitBreakdownList
SplitMemberRow
Avatar
AmountBadge
Button
```

---

# expense_detail_dark_theme

```
ScreenContainer
HeaderBar
ExpenseSummaryCard
ExpenseCard
CategoryPill
AmountText
AvatarStack
SplitBreakdownList
Button
```

---

# expense_added_success

```
ScreenContainer
SuccessIllustration
ConfettiScreen
Button
```

---

# settlement_success_strict_dark

```
ScreenContainer
SuccessIllustration
ConfettiScreen
Button
```

---

# friend_balance_sarah_miller

```
ScreenContainer
HeaderBar
Avatar
BalanceIndicator
TransactionList
TransactionRow
AmountBadge
Button
```

---

# transaction_history

```
ScreenContainer
HeaderBar
SearchBar
TransactionList
TransactionRow
Avatar
AmountBadge
BottomNavigation
```

---

# search_add_friends_no_scrollbars

```
ScreenContainer
HeaderBar
SearchBar
ContactItem
FriendRow
Avatar
Button
EmptyState
```

---

# settings_profile_no_scrollbars

```
ScreenContainer
HeaderBar
ProfileHeader
Avatar
StatCard
SettingsMenu
ListItem
Divider
```

---

# notifications_center_updated_navigation

```
ScreenContainer
HeaderBar
BottomNavigation
NotificationList
NotificationItem
Avatar
```

---

# insights_updated_navigation

```
ScreenContainer
HeaderBar
BottomNavigation
InsightsCard
SpendingChart
SegmentedControl
Card
```

---

# payment_methods

```
ScreenContainer
HeaderBar
PaymentMethodList
PaymentMethodRow
ListItem
Button
```

---

# qr_code_payment_navigation_fixed

```
ScreenContainer
HeaderBar
QRScannerView
AmountInput
Button
```

---

# fab_expansion_menu

```
ScreenContainer
FAB
FABMenu
FABItem
FABOverlay
FABBackdrop
ExpandableFAB
```

---

# help_support

```
ScreenContainer
HeaderBar
SectionLabel
ListItem
Divider
Button
```

---

# subscriptions_theme_fixed

```
ScreenContainer
HeaderBar
Card
Button
```

---

# admin_dashboard

```
ScreenContainer
HeaderBar
MetricsGrid
MetricCard
Card
AdminActions
```

---

# system_maintenance

```
ScreenContainer
MaintenanceIllustration
StatusScreen
Button
```

---

# no_internet_connection_fixed_nav

```
ScreenContainer
OfflineIllustration
StatusScreen
Button
```

---

# general_error_404

```
ScreenContainer
ErrorIllustration
StatusScreen
Button
```

---

# generated_screen

```
ScreenContainer
Card
```

---

# Summary

Total Screens:

```
31
```

Core Design System Components:

```
19
```

Total Components Used Across Screens:

```
~80+
```

Screen implementation should always prioritize **design system primitives first**, then **feature components**, and finally **screen-specific components when necessary**.

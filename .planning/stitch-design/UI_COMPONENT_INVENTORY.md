# UI Component Inventory

Project: **Owe — Expense Sharing App**
Source: **Stitch Design Analysis + Current Codebase**

This file lists **all UI components used or expected in the project**, grouped into three categories:

1. Common Components (Design System Primitives)
2. Already Existing Components (Current Repo)
3. Remaining Components (Derived From Stitch Screens)

Each component is documented as:

```
ComponentName — short description
Used in Screens: <stitch screen names>
```

---

# 1. Common Components (Design System Primitives)

### Layout

ScreenContainer — Root wrapper that provides consistent screen padding, background, and scroll handling.
Used in Screens: ALL screens

HeaderBar — Top navigation header displaying screen title and optional action icons.
Used in Screens: activity_feed_updated_navigation, activity_feed_with_search_filter, add_expense_strict_dark_theme, admin_dashboard, create_group, dashboard_empty_state, dashboard_strict_dark_refinement, expense_detail_dark_theme, friend_balance_sarah_miller, group_detail_dark_theme_refined, help_support, insights_updated_navigation, notifications_center_updated_navigation, payment_methods, qr_code_payment_navigation_fixed, search_add_friends_no_scrollbars, settings_profile_no_scrollbars, transaction_history

BottomNavigation — Persistent tab navigation used to switch between main app sections.
Used in Screens: dashboard_strict_dark_refinement, activity_feed_updated_navigation, insights_updated_navigation, notifications_center_updated_navigation

---

### Surfaces

Card — Generic elevated container used to group related content into visual sections.
Used in Screens: dashboard_strict_dark_refinement, admin_dashboard, insights_updated_navigation, friend_balance_sarah_miller, group_detail_dark_theme_refined

---

### Actions

Button — Primary interactive button used for form submission and major user actions.
Used in Screens: sign_in_unified_google_button, sign_up_final_design, create_group, add_expense_strict_dark_theme, split_confirmation, settlement_success_strict_dark, forgot_password_flow

FAB — Floating Action Button used for quick primary actions such as adding an expense.
Used in Screens: dashboard_strict_dark_refinement, activity_feed_updated_navigation, group_detail_dark_theme_refined

FABMenu — Expandable floating action menu revealing multiple quick actions.
Used in Screens: fab_expansion_menu, dashboard_strict_dark_refinement, activity_feed_updated_navigation

FABItem — Individual action displayed inside an expanded FAB menu.
Used in Screens: fab_expansion_menu

---

### Inputs

TextInputField — Standard labeled input field used for entering text in forms.
Used in Screens: sign_up_final_design, sign_in_unified_google_button, forgot_password_flow, create_group, add_expense_strict_dark_theme

AmountInput — Specialized input component for entering monetary values.
Used in Screens: add_expense_strict_dark_theme, qr_code_payment_navigation_fixed, split_confirmation

SearchBar — Input component used to filter lists and search within screens.
Used in Screens: activity_feed_with_search_filter, search_add_friends_no_scrollbars, transaction_history

---

### Social

Avatar — Displays a user's profile image or fallback initials when no image is available.
Used in Screens: activity_feed_updated_navigation, friend_balance_sarah_miller, notifications_center_updated_navigation, group_detail_dark_theme_refined, transaction_history, search_add_friends_no_scrollbars

AvatarStack — Displays multiple avatars overlapping to represent group members.
Used in Screens: dashboard_strict_dark_refinement, group_detail_dark_theme_refined

---

### Lists

ListItem — Generic row component with left icon/avatar, title, subtitle, and optional right content.
Used in Screens: settings_profile_no_scrollbars, payment_methods, help_support

NotificationItem — Row component displaying a single notification entry.
Used in Screens: notifications_center_updated_navigation

---

### Finance

AmountBadge — Displays a monetary value with color styling indicating positive or negative amounts.
Used in Screens: activity_feed_updated_navigation, group_detail_dark_theme_refined, transaction_history, friend_balance_sarah_miller

BalanceIndicator — Displays balance summaries such as “You owe” or “You are owed”.
Used in Screens: dashboard_strict_dark_refinement, friend_balance_sarah_miller, group_detail_dark_theme_refined

ExpenseItem — Row representing a single expense entry with title, participants, and amount.
Used in Screens: activity_feed_updated_navigation, group_detail_dark_theme_refined, transaction_history

TransactionRow — Row displaying a transaction with title, date, and amount.
Used in Screens: transaction_history, friend_balance_sarah_miller

---

### States

EmptyState — Placeholder UI displayed when a screen has no content available.
Used in Screens: dashboard_empty_state, search_add_friends_no_scrollbars

---

# 2. Already Existing Components (Current Repository)

### Authentication

GoogleButton — Button used to initiate Google OAuth authentication.
Used in Screens: sign_in_unified_google_button

OTPInput — Input component for entering multi-digit one-time passwords.
Used in Screens: forgot_password_flow

SocialDivider — Divider separating social login buttons from form-based authentication.
Used in Screens: sign_in_unified_google_button

---

### Dashboard / Activity

ActivityItem — UI row representing an activity feed event.
Used in Screens: activity_feed_updated_navigation

GroupCardHorizontal — Card displaying a preview of a group with summary balance.
Used in Screens: dashboard_strict_dark_refinement

BalanceCard — Card showing the user's balance summary.
Used in Screens: dashboard_strict_dark_refinement

---

### Expenses

ExpenseCard — Card displaying expense information with participants and total amount.
Used in Screens: expense_detail_dark_theme

SplitEditor — Editor interface used to modify how an expense is split between participants.
Used in Screens: split_confirmation

---

### Friends

ContactItem — Row displaying a contact or friend that can be invited to a group.
Used in Screens: search_add_friends_no_scrollbars

---

### Groups

MemberRow — Row representing a group member with role or balance information.
Used in Screens: group_detail_dark_theme_refined

---

### Profile

SettingsMenu — Menu displaying navigation options within the user profile.
Used in Screens: settings_profile_no_scrollbars

StatCard — Card displaying a user statistic such as groups joined or total expenses.
Used in Screens: settings_profile_no_scrollbars

---

### Settlement

ConfettiScreen — Celebration screen displayed when a settlement is completed successfully.
Used in Screens: settlement_success_strict_dark

---

### UI Utilities

AmountText — Text component specifically formatted to display currency values.
Used in Screens: dashboard_strict_dark_refinement, group_detail_dark_theme_refined

Divider — Horizontal divider separating UI sections.
Used in Screens: settings_profile_no_scrollbars, help_support

CategoryPill — Rounded pill component used to display an expense category.
Used in Screens: expense_detail_dark_theme

FilterChip — Interactive chip used for filtering lists or content.
Used in Screens: activity_feed_with_search_filter

---

### Modals

ConfirmModal — Modal asking users to confirm destructive or important actions.
Used in Screens: group_detail_dark_theme_refined

CurrencyPickerModal — Modal allowing users to select a currency.
Used in Screens: add_expense_strict_dark_theme

MemberPickerModal — Modal allowing the selection of group members.
Used in Screens: create_group

---

### Floating UI

ExpandableFAB — Floating button expanding into multiple quick actions.
Used in Screens: fab_expansion_menu

---

### Surfaces / Effects

GlassCard — Card with glassmorphism styling.
Used in Screens: dashboard_strict_dark_refinement

GlowWrapper — Wrapper adding glow or highlight visual effects.
Used in Screens: dashboard_strict_dark_refinement

IconContainer — Container used to standardize icon alignment and spacing.
Used in Screens: dashboard_strict_dark_refinement

---

### UI Structure

SectionLabel — Label used to separate sections within a screen.
Used in Screens: dashboard_strict_dark_refinement, settings_profile_no_scrollbars

SegmentedControl — Toggle control used to switch between multiple views.
Used in Screens: insights_updated_navigation

---

### Paging

PagerView — Swipeable container used for horizontal pagination.
Used in Screens: splash_onboarding_owe_new_logo

PagerView.web — Web-compatible implementation of PagerView.
Used in Screens: splash_onboarding_owe_new_logo

---

### Guards / Boundaries

QueryGuard — Wrapper handling loading, success, and error states for data queries.
Used in Screens: multiple data-driven screens

ErrorBoundary — Error handling wrapper preventing the entire app from crashing.
Used in Screens: global app wrapper

---

### Status UI

StatusBadge — Small badge indicating status such as active, pending, or completed.
Used in Screens: activity_feed_updated_navigation

StatusScreen — Full screen used to display success, error, or informational states.
Used in Screens: system_maintenance, general_error_404, no_internet_connection_fixed_nav

---

# 3. Remaining Components (Derived From Stitch Screens)

GroupHeader — Header displaying group name and summary information.
Used in Screens: group_detail_dark_theme_refined

GroupBalanceSummary — Section summarizing balances between group members.
Used in Screens: group_detail_dark_theme_refined

BalanceSummaryCard — Card summarizing the user's overall balance.
Used in Screens: dashboard_strict_dark_refinement

ExpenseSummaryCard — Card summarizing details of a specific expense.
Used in Screens: expense_detail_dark_theme

SplitSummary — Component summarizing how an expense is divided.
Used in Screens: split_confirmation

SplitBreakdownList — List showing how each member contributed to a split.
Used in Screens: split_confirmation

SplitMemberRow — Row representing one member's share of an expense.
Used in Screens: split_confirmation

TransactionList — Container rendering a list of transaction rows.
Used in Screens: transaction_history

ActivityList — Container rendering a list of activity feed entries.
Used in Screens: activity_feed_updated_navigation

NotificationList — Container rendering multiple notifications.
Used in Screens: notifications_center_updated_navigation

FriendRow — Row displaying a friend and balance relationship.
Used in Screens: friend_balance_sarah_miller

PaymentMethodRow — Row displaying a stored payment method.
Used in Screens: payment_methods

PaymentMethodList — Container listing all available payment methods.
Used in Screens: payment_methods

ProfileHeader — Header displaying user avatar and profile information.
Used in Screens: settings_profile_no_scrollbars

InsightsCard — Card displaying analytics data about spending.
Used in Screens: insights_updated_navigation

SpendingChart — Chart visualizing spending trends over time.
Used in Screens: insights_updated_navigation

FABOverlay — Background overlay appearing when the FAB menu expands.
Used in Screens: fab_expansion_menu

FABBackdrop — Interaction layer preventing background clicks while FAB menu is open.
Used in Screens: fab_expansion_menu

OnboardingCarousel — Swipeable container displaying onboarding slides.
Used in Screens: splash_onboarding_owe_new_logo

OnboardingSlide — Individual slide in the onboarding carousel.
Used in Screens: splash_onboarding_owe_new_logo

PaginationDots — Indicator showing the active onboarding slide.
Used in Screens: splash_onboarding_owe_new_logo

SuccessIllustration — Illustration used in success confirmation screens.
Used in Screens: settlement_success_strict_dark

ErrorIllustration — Illustration used in error states.
Used in Screens: general_error_404

MaintenanceIllustration — Illustration displayed during system maintenance.
Used in Screens: system_maintenance

OfflineIllustration — Illustration displayed when internet connectivity is lost.
Used in Screens: no_internet_connection_fixed_nav

QRScannerView — Camera interface used to scan QR codes for payments.
Used in Screens: qr_code_payment_navigation_fixed

PaidBySelector — Selector allowing the user to choose who paid for an expense.
Used in Screens: add_expense_strict_dark_theme

SplitMethodSelector — Selector allowing the user to choose how to split an expense.
Used in Screens: add_expense_strict_dark_theme

MetricsGrid — Grid layout displaying administrative metrics.
Used in Screens: admin_dashboard

MetricCard — Individual card showing a metric value and label.
Used in Screens: admin_dashboard

AdminActions — Panel containing administrative controls.
Used in Screens: admin_dashboard

---

# Summary

Common Components (Design System): ~19
Existing Components (Current Repo): ~30
Remaining Components (From Stitch): ~30

Total Estimated Components:

```
~80+ UI components
```

These components together form the **complete UI architecture needed to build all Stitch screens**.

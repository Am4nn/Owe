# Owe Test Specifications (E2E & Human Verification)

This document contains structured test cases covering every feature in the Owe application. These test cases are designed to be explicitly verifiable and serve as the foundation for future Playwright automation or systematic human testing.

Each test is mapped directly to the `REQUIREMENTS.md` traceability IDs.

---

## 1. Authentication (AUTH)

### TEST-AUTH-01: Email / Password Signup
**Requirement:** `AUTH-01`, `AUTH-05`
**Pre-conditions:** App is open, user is logged out.
**Steps:**
1. Navigate to the Sign Up screen.
2. Enter a valid email address, a password, and a display name.
3. Tap "Sign Up".
**Expected Result:**
- User is successfully registered and authenticated.
- User is navigated to the Dashboard.
- The display name provided is saved to the user's profile.

### TEST-AUTH-02: Email / Password Sign In
**Requirement:** `AUTH-02`
**Pre-conditions:** User account exists, user is logged out.
**Steps:**
1. Navigate to the Sign In screen.
2. Enter existing email and password.
3. Tap "Sign In".
**Expected Result:**
- User is successfully authenticated.
- User is safely navigated to the Dashboard.

### TEST-AUTH-03: Session Persistence
**Requirement:** `AUTH-03`
**Pre-conditions:** User is logged in to the app.
**Steps:**
1. Force-kill the application from the OS app switcher.
2. Re-open the application.
**Expected Result:**
- The app launches directly into the Dashboard without requesting credentials.

### TEST-AUTH-04: Sign Out
**Requirement:** `AUTH-04`
**Pre-conditions:** User is logged in.
**Steps:**
1. From the Dashboard, tap the profile avatar top-right to open settings.
2. Tap "Sign Out".
**Expected Result:**
- The session is cleared (and globalQueryClient cache cleared).
- User is redirected to the Sign In screen.

### TEST-AUTH-05: Profile & Avatar Update
**Requirement:** `AUTH-05`
**Pre-conditions:** User is logged in.
**Steps:**
1. Open the Profile screen.
2. Change the display name and tap to select a new avatar image from the device library.
3. Tap "Save".
**Expected Result:**
- The updated display name and avatar reflect immediately on the profile screen and dashboard header.

### TEST-AUTH-06: Google OAuth Sign In / Sign Up
**Requirement:** `AUTH-06`
**Pre-conditions:** User is logged out.
**Steps:**
1. Tap "Continue with Google" on the Sign In screen.
2. Complete the OAuth flow in the opened browser window.
**Expected Result:**
- Browser dismisses automatically upon success.
- User is navigated to the Dashboard.
- Profile `display_name` and `avatar_url` are automatically populated from Google metadata (if new user).

### TEST-AUTH-07: Google OAuth Account Linking
**Requirement:** `AUTH-07`
**Pre-conditions:** An email/password account exists (e.g., test@example.com).
**Steps:**
1. Sign out.
2. Tap "Continue with Google" and authenticate using the same Google account (test@example.com).
**Expected Result:**
- The OAuth login succeeds.
- The Google identity is cleanly linked to the existing user record without creating a duplicate account or failing.

---

## 2. Groups (GRUP)

### TEST-GRUP-01: Create a Group
**Requirement:** `GRUP-01`, `CURR-01`
**Pre-conditions:** User is logged in.
**Steps:**
1. Tap the FAB and select "New Group" (or use header button).
2. Enter a group name (e.g., "Miami Trip") and select a base currency.
3. Tap "Create".
**Expected Result:**
- Group is created perfectly.
- User is redirected to the group's detail screen.
- User is automatically added as a member with `admin` role.

### TEST-GRUP-02: Invite Member by Email
**Requirement:** `GRUP-02`
**Pre-conditions:** User is an admin of a group.
**Steps:**
1. Open the Group Detail screen.
2. Tap "Invite by Email".
3. Enter a valid email address and submit.
**Expected Result:**
- An invitation is created in `group_invites`.
- When the invited user logs in, they see the group (or invitation) and can join it.

### TEST-GRUP-03: Add Named-only (Non-App) Member
**Requirement:** `GRUP-03`
**Pre-conditions:** User is on the Group creation screen or Group Detail screen.
**Steps:**
1. Tap "Add member manually" (or similar UI).
2. Enter a name (e.g., "Grandpa") and confirm.
**Expected Result:**
- Grandpa appears in the member list with a "Not on Owe" badge.
- Grandpa can be fully assigned to expenses in split calculations.

### TEST-GRUP-04: View Groups List
**Requirement:** `GRUP-04`
**Pre-conditions:** User belongs to at least one group.
**Steps:**
1. Open the Dashboard.
**Expected Result:**
- Group cards are rendered showing the group name, member avatars, and outstanding balance summary.
- Virtual 1-on-1 direct groups (`is_direct: true`) do NOT appear in this list.

### TEST-GRUP-05: Leave Group
**Requirement:** `GRUP-05`
**Pre-conditions:** User is a member of a group (outstanding balances may or may not be present).
**Steps:**
1. Open the Group Detail screen.
2. Tap "Leave group".
3. Confirm the alert dialog.
**Expected Result:**
- User's `group_members` record is removed.
- User is safely redirected to the Dashboard.
- The group is removed from the user's Dashboard list.
- Outstanding balances, if any, remain visible to other group members.

---

## 3. Expenses (EXPN)

### TEST-EXPN-01: Add Expense (Basic / Equal Split)
**Requirement:** `EXPN-01`, `EXPN-02`
**Pre-conditions:** User is inside a group with 3 total members.
**Steps:**
1. Tap FAB -> "Manual Entry" (or "Add Expense").
2. Enter Amount (e.g., \$30), Description ("Lunch"), Date, and Category ("Food").
3. Ensure "Equal" tab is active in the Split Editor.
4. Tap "Save".
**Expected Result:**
- Expense is created.
- Debt is distributed equally: \$10 per person. (Any 1-cent remainders are correctly distributed).

### TEST-EXPN-02: Exact Amount Split
**Requirement:** `EXPN-03`
**Pre-conditions:** Adding an expense for \$50.
**Steps:**
1. In the Expense form, select the "Exact" tab.
2. Enter precise amounts for each member (e.g., M1: \$20, M2: \$30).
3. Ensure the sum matches \$50.
4. Tap "Save".
**Expected Result:**
- Validation forces the sum to match the exact total or throws an error.
- Expense is created and exact debts are distributed respectively.

### TEST-EXPN-03: Percentage Split
**Requirement:** `EXPN-04`
**Pre-conditions:** Adding an expense.
**Steps:**
1. Select "Percentage" tab.
2. Assign 60% to Member A, 40% to Member B.
3. Tap "Save".
**Expected Result:**
- Debt is computed proportionally avoiding float-math rounding errors.

### TEST-EXPN-04: Shares Split
**Requirement:** `EXPN-05`
**Pre-conditions:** Adding an expense.
**Steps:**
1. Select "Shares" tab.
2. Assign 2 shares to Member A, 1 share to Member B.
3. Tap "Save".
**Expected Result:**
- Debt is distributed dynamically (A gets 2/3 of the cost, B gets 1/3).

### TEST-EXPN-05: Edit / Delete Expense
**Requirement:** `EXPN-07`, `EXPN-08`
**Pre-conditions:** User created an expense.
**Steps:**
1. Tap the expense to open the detail screen.
2. Tap "Edit", alter the amount, and tap "Save". 
3. Verify the updated amount.
4. Tap "Delete", and confirm the dialog.
**Expected Result:**
- The edited amount is reflected in the group balances.
- Deletion removes the expense entirely, reverting affected balances.

### TEST-EXPN-06: 1-on-1 Direct Expense
**Requirement:** `EXPN-09`
**Pre-conditions:** User is on the Dashboard.
**Steps:**
1. Tap FAB -> "Manual Entry".
2. Because no group is active, it falls back to a direct expense. Select a specific friend.
3. Add expense and save.
**Expected Result:**
- A virtual group (`is_direct: true`) is created implicitly.
- The debt affects total dashboard balances but does not create a visible group card.

---

## 4. Balances (BALS)

### TEST-BALS-01: Dashboard Balance Overview
**Requirement:** `BALS-01`
**Pre-conditions:** User has multiple expenses across multiple groups.
**Steps:**
1. Open the Dashboard.
**Expected Result:**
- The top header clearly shows "You owe: $X" and "You are owed: $Y" aggregated across all non-settled group expenses.

### TEST-BALS-02: Group Balance Breakdown
**Requirement:** `BALS-02`
**Pre-conditions:** User is in a group with mixed debts.
**Steps:**
1. Open the Group Detail screen.
**Expected Result:**
- The list of members shows precisely who owes whom in total (e.g., "Owes you $5.00" or "You owe $10.00").

### TEST-BALS-03: Simplified Debts (Edge Function greedy algorithm)
**Requirement:** `BALS-03`
**Pre-conditions:** A complex debt cycle exists: A owes B $10, B owes C $10, C owes A $5.
**Steps:**
1. Open the Group Detail screen.
2. Tap "Simplified Debts".
**Expected Result:**
- The complex multi-directional debts are reduced to the smallest number of distinct payments (e.g., A pays C $5, A pays B $0, etc.).

---

## 5. Settlement (SETL)

### TEST-SETL-01: Record Settlement & Confetti Trigger
**Requirement:** `SETL-01`, `SETL-02`
**Pre-conditions:** User owes a member \$20.
**Steps:**
1. From the Simplified Debts screen tap "Settle", or right-swipe an Expense card to reveal the green "Settle" action and tap it.
2. Confirm the \$20 payment from User to the member.
3. Tap "Record Settlement".
**Expected Result:**
- The debt zeroes out in the group balances.
- The full-screen Confirmation/Confetti screen fires with device haptic feedback playing on mount.

### TEST-SETL-02: View Settlement History
**Requirement:** `SETL-03`
**Pre-conditions:** A settlement has been recorded.
**Steps:**
1. Navigate to Group Detail -> "Settlement History".
**Expected Result:**
- A chronological list of previous settlement payments is visible showing who paid whom and the date.

---

## 6. Activity Feed (ACTY)

### TEST-ACTY-01: Chronological Feed Generation
**Requirement:** `ACTY-01`, `ACTY-02`
**Pre-conditions:** Add an expense, record a settlement.
**Steps:**
1. From Group Detail, tap "Activity Feed".
**Expected Result:**
- System-generated feed items display in chronological order: e.g., "Alice added Lunch", "Bob recorded a settlement."

### TEST-ACTY-02: Comments & Reactions
**Requirement:** `ACTY-03`, `ACTY-04`
**Pre-conditions:** An expense exists.
**Steps:**
1. Tap an expense to open the detail view.
2. Type a comment and submit.
3. Tap an emoji reaction chip.
**Expected Result:**
- The comment is immediately attached to the expense thread.
- The reaction chip updates to reflect the user's chosen emoji. Each user holds at most one reaction per expense — tapping a different emoji replaces the previous one (UPSERT on `expense_id + user_id`).

---

## 7. Notifications (NOTF)

### TEST-NOTF-01: Real-time Push Delivery
**Requirement:** `NOTF-01`, `NOTF-02`
**Pre-conditions:** 2 physical devices, both logged in.
**Steps:**
1. Device A: Creates an expense.
**Expected Result:**
- Device B: Receives an OS-level push notification ("New expense added").
- Tapping the notification deep-links the user directly to the Expense details or Settlement details view.

### TEST-NOTF-02: Smart Reminders Config
**Requirement:** `NOTF-03`
**Pre-conditions:** User is a member of a group (any member can configure reminders — no admin restriction).
**Steps:**
1. Navigate to the Group Detail screen.
2. Scroll to the "Smart Reminders" section.
3. Toggle "Automatic Nudges" ON and select a delay of "7 days" from the picker.
**Expected Result:**
- Config persists to the `reminder_config` table immediately.
- The daily `pg_cron` job will accurately filter and notify only on debts older than 7 days.

---

## 8. Multi-Currency (CURR)

### TEST-CURR-01: Add Foreign Currency Expense
**Requirement:** `CURR-01`, `CURR-02`, `CURR-03`, `CURR-04`
**Pre-conditions:** Group base currency is set to `USD`.
**Steps:**
1. Open the "New Expense" form.
2. Tap the currency picker and switch it to `GBP`.
3. Enter amount "50", then submit.
4. View the expense in the feed.
**Expected Result:**
- The backend uses the live `fx_rates` table to lock the exchange rate at creation (`fx_rate_at_creation` snapshotted on INSERT — never recalculated).
- The Expense Card visually displays "GBP 50.00" as the primary amount, and the equivalent converted base amount (e.g., "≈ USD 63.00") directly beneath it in a secondary label.

---

## 9. Offline Reliability (OFFL)

### TEST-OFFL-01: View Offline Data
**Requirement:** `OFFL-01`
**Pre-conditions:** User has populated data on the device.
**Steps:**
1. Turn on Airplane / Offline mode.
2. Force kill the app and relaunch.
**Expected Result:**
- The mmkv cache successfully restores all group cards and balance data on the dashboard seamlessly.

### TEST-OFFL-02: Offline Queue & Sync
**Requirement:** `OFFL-02`
**Pre-conditions:** Device is Offline.
**Steps:**
1. Add a new manual expense and hit "Save".
2. Turn off Airplane mode (Reconnect to Network).
**Expected Result:**
- While offline, the app caches the mutation.
- When `NetInfo` detects connectivity, `resumePausedMutations` automatically executes the queued network request, and real-time UI updates to reflect the new state.

---

## 10. Export (EXPT)

### TEST-EXPT-01: CSV Export Generation
**Requirement:** `EXPT-01`
**Pre-conditions:** Group contains at least one completed expense and one settlement.
**Steps:**
1. On the Group Detail screen, tap "Export CSV".
**Expected Result:**
- A native OS share sheet pops up containing a `.csv` file attachment.
- Upon opening, the CSV has a UTF-8 BOM for Excel/Numbers compatibility and the following columns in order: `Date`, `Description`, `Amount`, `Currency`, `Base Amount`, `Base Currency`, `Split Type`, `Category`. Fields containing commas or quotes are correctly RFC 4180 escaped.

---

## 11. UI / UX Design System

### TEST-UIUX-01: Aesthetics & Layout
**Requirement:** `UIUX-01`
**Pre-conditions:** Fresh launch.
**Steps:**
1. Observe the interface theme layout.
**Expected Result:**
- The application perfectly respects the Dark Mode First design specification (`#0A0A0F`, `#6C63FF` accents). There are no default stark white iOS/Android components breaching the design standard.

### TEST-UIUX-02: Gestures
**Requirement:** `UIUX-02`
**Pre-conditions:** Expenses exist.
**Steps:**
1. Right-swipe slowly on an expense card.
2. Left-swipe slowly on an expense card.
**Expected Result:**
- Right swipe reveals a green "Settle" button that navigates to the settlement form (pre-filled with the group).
- Left swipe reveals a purple "Remind" button that shows an informational alert ("Push reminders will be available in the next update."). Note: the per-group Smart Reminders schedule is a separate configuration in Group Detail (NOTF-03).

### TEST-UIUX-03: Interactions
**Requirement:** `UIUX-03`
**Pre-conditions:** User is on the dashboard.
**Steps:**
1. Tap the Floating Action Button (FAB).
**Expected Result:**
- Utilizing `react-native-reanimated`, the FAB smoothly expands with a spring animation, revealing three child buttons:
  - **"Manual Entry"** — navigates to the Add Expense form (fully functional).
  - **"Add Transfer"** — shows a "Coming soon" placeholder alert (v2 feature).
  - **"Scan Receipt"** — shows a "Coming in v2" placeholder alert (v2 feature).

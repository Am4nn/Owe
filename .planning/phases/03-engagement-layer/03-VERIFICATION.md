---
phase: 03-engagement-layer
verified: 2026-03-01T01:00:00Z
status: human_needed
score: 10/10 must-haves verified
re_verification:
  previous_status: gaps_found
  previous_score: 9/10
  gaps_closed:
    - "User can enable/disable smart reminders and set delay_days per group"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Verify push notifications fire on expense INSERT"
    expected: "Create an expense in a group with another member who has a push token registered — that member should receive a push notification within seconds"
    why_human: "Requires a running Supabase project with DB webhooks configured, two authenticated users, and physical devices with valid push tokens"
  - test: "Verify notification tap deep-links correctly"
    expected: "Tapping a 'New expense added' notification opens the specific expense detail screen; tapping 'Settlement recorded' opens the group settlements screen"
    why_human: "Requires physical device with Expo Go or standalone build; cold-start and foreground tap cases both need testing"
  - test: "Verify fx-rates-cache Edge Function populates table"
    expected: "After deploying and running the Edge Function, the fx_rates table should contain 150+ currency rows with valid rate_to_usd values"
    why_human: "Requires a deployed Supabase project with the Edge Function running; table contents cannot be verified from code alone"
  - test: "Verify Smart Reminders toggle and delay picker work end-to-end"
    expected: "On the group detail screen, toggling Automatic Nudges persists the enabled state; tapping the delay button opens the picker and selecting a value persists delay_days to reminder_config via upsertReminderConfig"
    why_human: "Requires a running app instance with an authenticated user; React Query mutation success must be observed in the Supabase dashboard or network inspector"
  - test: "Verify CSV export opens native share sheet with correct file"
    expected: "Tapping 'Export CSV' on the group screen opens the OS share sheet with a .csv file; opening the file in Numbers/Excel shows correctly formatted rows with BOM, headers, and all expense data"
    why_human: "expo-sharing.shareAsync() and expo-file-system v2 File API behavior requires a physical device or simulator run"
---

# Phase 3: Engagement Layer Verification Report

**Phase Goal:** A retained user base — push notifications make the app active rather than passive, multi-currency covers the traveler use case, smart reminders close the debt loop, and CSV export builds power-user trust
**Verified:** 2026-03-01T01:00:00Z
**Status:** human_needed
**Re-verification:** Yes — after gap closure plan 03-03 (NOTF-03 UI)

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User receives a push notification when a group member adds an expense to a shared group | VERIFIED | `push-notify/index.ts` handles `table === 'expenses'` branch: queries group_members excluding creator, fetches push tokens, POSTs to Expo Push API with deep-link URL |
| 2 | User receives a push notification when a group member records a settlement with them | VERIFIED | `push-notify/index.ts` handles `table === 'settlements'` branch: queries payee group_member, fetches token, sends notification |
| 3 | Notification tap navigates the user to the relevant expense or settlement screen | VERIFIED | `useNotificationDeepLink` in `hooks.ts` handles both cold-start (`getLastNotificationResponseAsync`) and foreground taps (`addNotificationResponseReceivedListener`), calling `router.push(url)` with the deep-link URL from notification data |
| 4 | User can enable/disable smart reminders and set delay_days per group | VERIFIED | `useReminderConfig(id)` imported at line 23 and destructured at line 64 of `app/(app)/groups/[id]/index.tsx`. Switch at line 204 calls `upsertReminderConfig` on toggle. Delay picker modal at line 278 calls `upsertReminderConfig` for each of [1,2,3,5,7,14,30] day options. Hook is fully wired — no longer orphaned. |
| 5 | Smart reminders are dispatched daily by a pg_cron job for unpaid debts older than delay_days | VERIFIED | Migration schedules `process-reminders-daily` at `0 8 * * *`; `process-reminders/index.ts` queries `reminder_config` with `enabled = true`, resolves `group_members.id`, queries `expense_splits` older than cutoff, filters to splits where member is not the payer, sends push via Expo API |
| 6 | User can set a base currency for a group from a currency picker | VERIFIED | `useUpdateGroupCurrency` in `groups/hooks.ts` updates `groups.base_currency`; `groups/[id]/index.tsx` renders a `TouchableOpacity` that opens a searchable `Modal` with `COMMON_CURRENCIES` FlatList |
| 7 | User can add an expense in a different currency from the group base currency and FX rate is stored at INSERT | VERIFIED | `expenses/new.tsx` has currency picker state (`expenseCurrency`), calls `useFxRates()`, computes `computeBaseCents` at `onSubmit` time, passes `currency`, `base_currency`, `fx_rate_at_creation`, `amount_base_cents` to `createExpense.mutateAsync`. `createExpenseMutationFn` stores all four FX fields. |
| 8 | Both original amount + currency and base amount + base currency are shown on every expense card | VERIFIED | `ExpenseCard.tsx` renders primary `Text` with `formatAmount(expense.amount_cents, expense.currency)` and a conditional secondary `Text` with `formatAmount(expense.amount_base_cents, expense.base_currency)` when `expense.currency !== expense.base_currency` |
| 9 | FX rates are cached server-side by an hourly pg_cron Edge Function — rates never drift after creation | VERIFIED | `fx-rates-cache/index.ts` fetches fawazahmed0 CDN, converts to `rate_to_usd`, upserts all rows to `fx_rates` table. Migration schedules `fx-rates-hourly` at `0 * * * *`. FX rate snapshotted at INSERT via `fx_rate_at_creation` field — never recalculated. |
| 10 | User can export a group's expense history as a CSV file opened by the native share sheet | VERIFIED | `exportGroupCsv` in `export/hooks.ts` builds RFC 4180 CSV with UTF-8 BOM using expo-file-system, calls `Sharing.shareAsync(fileUri)`. Group detail screen has "Export CSV" button that calls `handleExport` which calls `exportGroupCsv`. |

**Score:** 10/10 truths verified

---

## Re-Verification: Gap Closure Confirmation

### NOTF-03 Gap — Previously FAILED, Now VERIFIED

**What was missing:** `useReminderConfig` was fully implemented in `src/features/notifications/hooks.ts` but had zero consumers anywhere in the app. No UI surface exposed the enabled toggle or delay_days picker to users.

**What plan 03-03 delivered (commit `1206bb1`):**

| Check | Result | Evidence |
|-------|--------|----------|
| Import present | PASS | Line 23: `import { useReminderConfig } from '@/features/notifications/hooks'` |
| Hook called | PASS | Line 64: `const { reminderConfig, upsertReminderConfig } = useReminderConfig(id)` |
| Toggle wired | PASS | Line 206: `onValueChange={(val) => upsertReminderConfig({ group_id: id, enabled: val, delay_days: reminderDelay })` |
| Delay picker wired | PASS | Line 298: `upsertReminderConfig({ group_id: id, enabled: reminderEnabled, delay_days: days })` |
| Delay modal renders | PASS | Lines 278-309: `Modal` with `[1, 2, 3, 5, 7, 14, 30]` day options, `Selected` indicator, Done dismiss button |
| Smart Reminders section | PASS | Lines 195-219: `ListHeaderComponent` includes "Smart Reminders" section below "Base Currency" |

**Regression check on previously-passing items:** All confirmed intact after 03-03 merge.

| Item | Regression Check | Result |
|------|-----------------|--------|
| `registerPushToken` in `_layout.tsx` | `grep "registerPushToken" app/_layout.tsx` | PASS — line 11 import, line 40 call |
| `useNotificationDeepLink` in `_layout.tsx` | `grep "useNotificationDeepLink" app/_layout.tsx` | PASS — line 45 call |
| `exportGroupCsv` wired to group screen | `grep "exportGroupCsv" app/(app)/groups/[id]/index.tsx` | PASS — line 22 import, line 126 call, line 261 button |
| `ExpenseCard` dual-amount display | `grep "amount_base_cents" src/components/expenses/ExpenseCard.tsx` | PASS — line 116-119 conditional render |
| `useUpdateGroupCurrency` in group screen | `grep "useUpdateGroupCurrency" app/(app)/groups/[id]/index.tsx` | PASS — line 16 import, line 54 destructure |
| `useFxRates`/`computeBaseCents` in expense form | `grep "computeBaseCents" app/(app)/expenses/new.tsx` | PASS — lines 21, 156, 295 |

---

## Required Artifacts

### Plan 03-01 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/20260301000005_engagement_layer.sql` | fx_rates table, reminder_config table, pg_cron jobs | VERIFIED | 2 CREATE TABLE statements confirmed; both tables have RLS enabled; pg_cron block guarded by extension check; scheduled `fx-rates-hourly` and `process-reminders-daily` |
| `src/features/notifications/types.ts` | ReminderConfig, PushPayload type definitions | VERIFIED | `ReminderConfig` interface (7 fields) + `UpsertReminderConfigInput` interface present and complete |
| `src/features/notifications/hooks.ts` | `registerPushToken`, `useNotificationDeepLink`, `useReminderConfig` hooks | VERIFIED | All three functions exist and are substantive. `useReminderConfig` is now WIRED — imported and called in `app/(app)/groups/[id]/index.tsx`. |
| `app/_layout.tsx` | push token registration and deep-link handler wired at app launch | VERIFIED | Imports `registerPushToken` and `useNotificationDeepLink`; `useEffect` on `session` calls `registerPushToken()`; `useNotificationDeepLink()` called unconditionally in `RootNavigator` |
| `supabase/functions/push-notify/index.ts` | DB webhook handler — expenses/settlements INSERT → Expo Push API | VERIFIED | Handles `expenses` and `settlements` table branches; fetches push tokens from profiles; batches 100 messages; handles `DeviceNotRegistered` stale token cleanup |
| `supabase/functions/process-reminders/index.ts` | daily pg_cron Edge Function for debt reminders | VERIFIED | Queries `reminder_config` with `enabled = true`; resolves `group_members.id` per config; queries `expense_splits` with cutoff filter; filters non-payer splits; sends batched pushes with debt amount and deep-link |

### Plan 03-02 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/functions/fx-rates-cache/index.ts` | Hourly Edge Function fetching fawazahmed0, upserting fx_rates | VERIFIED | Fetches fawazahmed0 CDN (`/v1/currencies/usd.json`), converts `usdRates[currency]` to `rate_to_usd = 1/usdPerUnit`, upserts with `onConflict: 'currency'` |
| `src/features/currency/types.ts` | FxRate, CurrencyOption type definitions | VERIFIED | Both interfaces present with correct fields |
| `src/features/currency/hooks.ts` | `useFxRates` hook, `COMMON_CURRENCIES` list, `computeBaseCents` | VERIFIED | `COMMON_CURRENCIES` has 49 entries; `useFxRates` queries `fx_rates` table with 30-min staleTime; `computeBaseCents` uses `Math.round` for integer cents |
| `src/features/export/hooks.ts` | `exportGroupCsv` with RFC 4180 CSV + expo-sharing | VERIFIED | UTF-8 BOM present (`\uFEFF`); RFC 4180 quoting via `replace(/"/g, '""')`; expo-file-system API; `Sharing.shareAsync(fileUri)` with MIME type |
| `src/features/expenses/hooks.ts` | `createExpenseMutationFn` updated to store FX snapshot at INSERT | VERIFIED | Destructures `base_currency`, `fx_rate_at_creation`, `amount_base_cents` with safe defaults; all three stored in expenses INSERT |
| `src/features/groups/hooks.ts` | `useUpdateGroupCurrency` mutation | VERIFIED | Mutation updates `groups.base_currency`, invalidates `['groups', groupId]` and `['groups']` query keys |
| `src/components/expenses/ExpenseCard.tsx` | Dual-currency amount display for CURR-04 | VERIFIED | `formatAmount(cents, currencyCode)` currency-aware; conditional `Text` renders `amount_base_cents` in `base_currency` when `expense.currency !== expense.base_currency` |
| `app/(app)/groups/[id]/index.tsx` | Base currency picker + Smart Reminders section + Export button | VERIFIED | Imports `useUpdateGroupCurrency`, `useFxRates`, `COMMON_CURRENCIES`, `exportGroupCsv`, `useReminderConfig`; renders "Base Currency" section, "Smart Reminders" section with Switch + delay picker modal, and "Export CSV" button |
| `app/(app)/expenses/new.tsx` | Currency picker with FX rate lookup on expense form | VERIFIED | `expenseCurrency` state; `useFxRates()` called; currency picker Modal with `COMMON_CURRENCIES`; FX preview label when currencies differ; `computeBaseCents` called at `onSubmit`; graceful fallback when `fxRates` is undefined |

### Plan 03-03 Artifacts (Gap Closure)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/(app)/groups/[id]/index.tsx` | Smart Reminders UI section importing and using `useReminderConfig` | VERIFIED | Import at line 23, hook call at line 64, Switch toggle at line 204, delay picker modal at lines 278-309. Commit `1206bb1` added 68 lines net. |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `app/_layout.tsx` | `profiles.push_token` | `registerPushToken` upserts token on launch | VERIFIED | Line 11 import; line 40 `useEffect` on `session` calls `registerPushToken()`; `hooks.ts:65-68` upserts token to `profiles` table |
| `supabase/functions/push-notify/index.ts` | `https://exp.host/--/api/v2/push/send` | `fetch` with `EXPO_ACCESS_TOKEN` header | VERIFIED | `EXPO_PUSH_URL` const; `fetch(EXPO_PUSH_URL, { headers: { Authorization: Bearer ${EXPO_ACCESS_TOKEN} } })` |
| `supabase/functions/process-reminders/index.ts` | `reminder_config` | query `enabled=true` configs, compute balance age, emit push | VERIFIED | `.from('reminder_config').select('user_id, group_id, delay_days').eq('enabled', true)` |
| `app/(app)/groups/[id]/index.tsx` | `useReminderConfig` | Switch and delay picker both call `upsertReminderConfig` | VERIFIED | Line 206: Switch `onValueChange` calls `upsertReminderConfig`; line 298: delay picker `onPress` calls `upsertReminderConfig` |
| `app/(app)/expenses/new.tsx` | `fx_rates table` | `useFxRates` hook fetches rate at form open; `createExpenseMutationFn` stores `amount_base_cents` | VERIFIED | Line 88: `const { data: fxRates } = useFxRates()`; lines 156-160: `computeBaseCents` called at submit; FX fields passed to `createExpense.mutateAsync` |
| `src/features/expenses/hooks.ts createExpenseMutationFn` | `expenses.amount_base_cents` | `Math.round(amount_cents * fxRate)` | VERIFIED | `computeBaseCents` in `currency/hooks.ts` uses `Math.round(amountCents * fxRate)`; result stored in expenses INSERT |
| `src/components/expenses/ExpenseCard.tsx` | `expense.amount_base_cents + expense.base_currency` | conditional render when `expense.currency !== expense.base_currency` | VERIFIED | Lines 116-119: conditional `Text` with `formatAmount(expense.amount_base_cents, expense.base_currency)` |
| `app/(app)/groups/[id]/index.tsx` | `exportGroupCsv` | Export button calls `exportGroupCsv(groupId, expenses)` | VERIFIED | Line 22 import; line 126 `handleExport` calls `await exportGroupCsv(id, expenses ?? [])`; line 257 Export CSV TouchableOpacity with `onPress={handleExport}` |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| NOTF-01 | 03-01 | User receives a push notification when someone adds an expense to a shared group | SATISFIED | `push-notify/index.ts` expenses branch implemented; DB webhook setup documented |
| NOTF-02 | 03-01 | User receives a push notification when a group member records a settlement with them | SATISFIED | `push-notify/index.ts` settlements branch implemented; payee lookup via `group_members` |
| NOTF-03 | 03-01, 03-03 | User can configure smart reminders — a nudge sent after a configurable delay if a debt is unpaid | SATISFIED | Backend fully wired (`reminder_config` table, `process-reminders` Edge Function, `useReminderConfig` hook); UI now fully wired (Switch toggle + delay picker modal in group detail screen, commit `1206bb1`) |
| CURR-01 | 03-02 | User can set a base currency for a group | SATISFIED | `useUpdateGroupCurrency` wired; group detail screen has searchable currency picker modal |
| CURR-02 | 03-02 | User can add an expense in a different currency from the group base currency | SATISFIED | Expense form has currency picker state; `expenseCurrency` can differ from `group.base_currency` |
| CURR-03 | 03-02 | Expense amounts are converted to group base currency using real-time FX rates at expense creation | SATISFIED | `useFxRates` fetches from `fx_rates` table; `computeBaseCents` called at form submit; `fx_rate_at_creation` + `amount_base_cents` stored at INSERT |
| CURR-04 | 03-02 | Both original currency amount and converted base currency amount are displayed on expense cards | SATISFIED | `ExpenseCard.tsx` conditional dual-amount render verified |
| EXPT-01 | 03-02 | User can export a group's expense history as a CSV file | SATISFIED | `exportGroupCsv` with RFC 4180, BOM, expo-file-system, expo-sharing wired to group screen Export CSV button |

All 8 phase requirements satisfied. No orphaned requirements found.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/components/expenses/ExpenseCard.tsx` | 57-58 | `// Placeholder: push reminders are a Phase 3 feature` + `Alert.alert('Remind', ...)` | Info | Pre-existing stub from Phase 2 UIUX-02 gesture navigation feature — out of scope for Phase 3 verification. The Phase 3 reminder config (NOTF-03) is a separate per-group setting in the group screen. |

No anti-patterns introduced by the 03-03 gap closure commit. The `placeholder` text found in `app/(app)/groups/[id]/index.tsx` is the `TextInput` placeholder prop for the currency search field — standard React Native API usage, not a code stub.

---

## Human Verification Required

### 1. Push Notification Delivery (NOTF-01, NOTF-02)

**Test:** With two user accounts on physical devices (both with Expo push tokens registered), have User A add an expense in a shared group. Check User B's device for a push notification within 30 seconds.
**Expected:** User B receives a notification with title "New expense added" and the expense description as body. Tapping it navigates to the expense detail screen.
**Why human:** Requires deployed Supabase project, configured DB webhooks, physical devices, and valid EAS project ID push tokens.

### 2. Notification Deep-Link Cold-Start (NOTF-01/02)

**Test:** Force-close the app on a physical device. Receive a push notification. Tap it from the OS notification center.
**Expected:** App launches and navigates directly to the relevant expense or settlement screen (not the home screen).
**Why human:** Cold-start behavior requires a physical device with the app fully closed; cannot be simulated by code inspection.

### 3. Smart Reminders Toggle and Delay Picker (NOTF-03)

**Test:** Open the group detail screen on a running app. Toggle "Automatic Nudges" off, then back on. Tap the delay button and select "7 days". Query the `reminder_config` table in Supabase Dashboard.
**Expected:** A row exists for the authenticated user and group with `enabled = true` and `delay_days = 7`. Toggling off sets `enabled = false`. The selected delay option shows the "Selected" indicator.
**Why human:** React Query mutation success and Supabase persistence must be observed at runtime; cannot be verified from code alone.

### 4. FX Rate Table Population (CURR-03)

**Test:** Deploy `fx-rates-cache` Edge Function and invoke it manually (via Supabase Dashboard or curl). Query the `fx_rates` table.
**Expected:** Table contains 150+ rows with valid `rate_to_usd` values and a recent `fetched_at` timestamp. `USD` should have `rate_to_usd = 1.0`.
**Why human:** Requires deployed Edge Function and live DB connection.

### 5. Multi-Currency Expense Creation End-to-End (CURR-02, CURR-03, CURR-04)

**Test:** In a group with base currency USD, add an expense in GBP (e.g., GBP 50.00). View the expense in the expense list.
**Expected:** ExpenseCard shows "GBP 50.00" as primary amount and approximately "USD 63.XX" as secondary (converted) amount. The conversion should reflect the actual GBP/USD rate from the fx_rates table at creation time.
**Why human:** Requires live fx_rates table with populated rates and a running app instance.

### 6. CSV Export File Quality (EXPT-01)

**Test:** In a group with 5+ expenses (including some with non-USD currencies), tap "Export CSV". Open the exported file in Excel or Numbers.
**Expected:** File opens correctly with UTF-8 characters (no garbled text), columns are Date/Description/Amount/Currency/Base Amount/Base Currency/Split Type/Category, all expenses are present, quoted fields with commas or double-quotes are escaped correctly.
**Why human:** expo-file-system and expo-sharing behavior requires device runtime; spreadsheet rendering requires opening the file in an application.

---

## Gaps Summary

No gaps remaining. All 10 observable truths are verified. All 8 phase requirements are satisfied.

The single gap from the initial verification (NOTF-03 — no UI for smart reminder configuration) was closed by plan 03-03. Commit `1206bb1` added 68 lines to `app/(app)/groups/[id]/index.tsx`: import of `useReminderConfig`, hook call with `id` parameter, a "Smart Reminders" section with a labeled `Switch` toggle, a conditional "Delay" row, and a `pageSheet` Modal with 7 delay-day options. The hook `upsertReminderConfig` is called in both mutation paths (toggle and delay selection), completing the write path to the `reminder_config` Supabase table.

Six items require human/device verification before the phase can be considered fully production-validated. These are all runtime/infrastructure concerns (push delivery, deep-link cold-start, FX table population, end-to-end multi-currency, CSV export), not code gaps.

---

_Verified: 2026-03-01T01:00:00Z_
_Verifier: Claude (gsd-verifier)_
_Re-verification after: 03-03 gap closure (NOTF-03)_

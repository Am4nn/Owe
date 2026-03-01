---
phase: 02-core-expense-loop
verified: 2026-03-01T00:00:00Z
status: human_needed
score: 19/19 must-haves verified
re_verification:
  previous_status: gaps_fixed
  previous_score: 19/19
  gaps_closed:
    - "Activity rows can be inserted without a foreign key violation — migration 20260301000004_fix_activities_actor_fk.sql confirmed present with correct DROP CONSTRAINT IF EXISTS + ADD CONSTRAINT referencing group_members(id)"
    - "useAddComment actor_id inserts group_members.id (line 104 of activity/hooks.ts) — matches corrected FK"
    - "useCreateSettlement activity row inserts actorMember.id (line 59 of settlements/hooks.ts) — matches corrected FK"
    - "useActivityFeed joins via actor:group_members!actor_id(display_name) — semantically correct for new FK"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Verify activity feed populates correctly after adding an expense"
    expected: "Group Activity screen shows an '[your display name] added an expense' row after expense creation"
    why_human: "Cannot confirm FK constraint runtime behaviour without a live Supabase instance; migration must be applied via supabase db push before the fix takes effect"
  - test: "Verify settlement confetti fires correctly on device or simulator"
    expected: "After recording a settlement, the full-screen confetti animation plays and haptic notification fires on mount; Done button returns to dashboard"
    why_human: "expo-haptics and react-native-confetti-cannon require a real device or simulator with audio/vibration enabled"
  - test: "Verify offline expense queuing and automatic sync"
    expected: "Add expense with airplane mode on; re-enable network; expense appears in group list within seconds"
    why_human: "NetInfo + resumePausedMutations flow requires real network toggling and persisted mutation state"
  - test: "Verify Realtime balance update across two simulators"
    expected: "Adding expense in simulator A updates balance summary in simulator B within approximately 2 seconds without manual refresh"
    why_human: "Requires two running simulator instances and a live Supabase Realtime subscription"
---

# Phase 02: Core Expense Loop Verification Report

**Phase Goal:** A fully functional group expense tracker — users can add expenses with any split type, see who owes what in real-time, simplify debts, and settle up with confetti
**Verified:** 2026-03-01
**Status:** human_needed (all automated checks pass; 4 runtime items need human confirmation)
**Re-verification:** Yes — after gap closure (plan 02-04, commit 0370ada)

---

## Re-verification Summary

This is the second verification pass. The first pass (2026-02-28) found one blocker gap: `activities.actor_id` had a FK pointing to `profiles(id)` while all code paths inserted `group_members.id`, causing FK violations on every INSERT into the activities table.

**Gap closure verified:**

- Migration `supabase/migrations/20260301000004_fix_activities_actor_fk.sql` EXISTS (committed as `0370ada`)
- Contains `DROP CONSTRAINT IF EXISTS activities_actor_id_fkey` (line 15)
- Contains `ADD CONSTRAINT activities_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.group_members(id) ON DELETE SET NULL` (lines 18-21)
- `src/features/activity/hooks.ts` inserts `actor_id: actorMember.id` at line 104 (group_members.id — now valid)
- `src/features/activity/hooks.ts` joins via `actor:group_members!actor_id(display_name)` at lines 25 and 50 (semantically correct for new FK)
- `src/features/settlements/hooks.ts` inserts `actor_id: actorMember.id` at line 59 (group_members.id — now valid)
- No regressions found in any previously-verified artifact

**No gaps remain. Status: human_needed (runtime confirmation required).**

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can open a new expense form from FAB and submit with amount, description, payer, date, category | VERIFIED | `app/(app)/expenses/new.tsx` — full react-hook-form + zod schema; calls `useCreateExpense().mutateAsync`; `ExpandableFAB.tsx` "Manual Entry" navigates to this screen |
| 2 | User can select equal, exact, percentage, or shares split mode with correct distribution | VERIFIED | `SplitEditor.tsx` renders four tabs; each mode calls the appropriate `compute*` function (all four imported at lines 6-9, all four called reactively) |
| 3 | Sum of all split amounts always equals the total expense amount (no penny drift) | VERIFIED | `splits.ts` — every `compute*` function asserts `sum === totalCents` and throws on mismatch; 8 Jest tests all pass |
| 4 | User can edit or delete an expense they created from the expense detail screen | VERIFIED | `app/(app)/expenses/[id]/index.tsx` — Edit button navigates to edit screen; Delete calls `useDeleteExpense` with Alert confirm; `edit.tsx` pre-populates from `useExpense` and calls `useUpdateExpense` |
| 5 | User can create a 1-on-1 expense outside a group (is_direct virtual group); hidden from main groups list | VERIFIED | `new.tsx` `createDirectExpenseGroup()` sets `is_direct: true`; `index.tsx` filters `groups.filter(g => !g.is_direct)` |
| 6 | FAB on dashboard expands to Manual Entry, Add Transfer, Scan Receipt child buttons | VERIFIED | `ExpandableFAB.tsx` — three `ChildFABButton` entries with `withSpring` animation; Manual Entry navigates to `/(app)/expenses/new` |
| 7 | User sees "You owe" and "You are owed" summary on dashboard after expenses exist | VERIFIED | `app/(app)/index.tsx` — `BalanceSummaryBar` calls `useBalanceSummary()` (line 21); rendered at line 75 in `ListHeaderComponent` |
| 8 | User can open a group and see each member's net balance (positive = owed, negative = owes) | VERIFIED | `app/(app)/groups/[id]/index.tsx` — calls `useGroupBalances(id)` (line 39) and renders `<BalanceCard />` per member (line 120) |
| 9 | User can tap "Simplified Debts" in a group to see minimum set of payments | VERIFIED | Group detail has "Simplified Debts" button navigating to `/(app)/groups/${id}/balances`; `balances.tsx` calls `useSimplifiedDebts(groupId)` which invokes Edge Function |
| 10 | Balance totals update in real time via Supabase Realtime | VERIFIED | `useRealtimeExpenseSync` subscribes to `postgres_changes` on `expenses` with cleanup `supabase.removeChannel(channel)` (line 234 of balances/hooks.ts) |
| 11 | Simplified debts computed server-side by Edge Function using anon key + user JWT (not service_role) | VERIFIED | `supabase/functions/simplify-debts/index.ts` — uses `SUPABASE_ANON_KEY` (line 38); no service_role reference in file |
| 12 | User can record a settlement payment and see confetti + haptic success screen | VERIFIED | `settlement/new.tsx` calls `useCreateSettlement`; on success `router.replace('/(app)/settlement/success')` (line 77); `success.tsx` renders `ConfettiScreen`; `ConfettiScreen.tsx` fires `Haptics.notificationAsync` + `confettiRef.current?.start()` on mount (lines 14-15) |
| 13 | User can view a list of past settlements for a group | VERIFIED | `app/(app)/groups/[id]/settlements.tsx` calls `useSettlementHistory(groupId)` (line 16); FlatList renders payer/payee display names |
| 14 | User can view a chronological activity feed of all expense and settlement actions in a group | VERIFIED (pending runtime) | `activity.tsx` calls `useActivityFeed(groupId)` (line 68); FlatList renders items. FK gap is fixed by migration 20260301000004 — runtime confirmation needed after `supabase db push` |
| 15 | User can filter the activity feed to a specific group | VERIFIED | `useActivityFeed(groupId)` applies `.eq('group_id', groupId)` filter; all-groups view uses two-step membership query |
| 16 | User can add a text comment on an expense detail screen | VERIFIED (pending runtime) | `useAddComment` inserts comment row then resolves `actorMember.id` from `group_members` and inserts activity row with that FK — now valid after migration |
| 17 | User can add or remove an emoji reaction on an expense in the activity feed | VERIFIED | `useAddReaction` upserts to `expense_reactions` with `user_id` (profiles.id); `useRemoveReaction` deletes by `user_id` — reactions table uses profiles FK (correct, unchanged) |
| 18 | User can add an expense while offline; it queues and syncs automatically when connectivity returns | VERIFIED (pending runtime) | `app/_layout.tsx` — `onlineManager.setEventListener(NetInfo...)` (line 15); `queryClient.setMutationDefaults(['expenses','create'], { mutationFn: createExpenseMutationFn })` (line 27-29); `resumePausedMutations()` in `PersistQueryClientProvider.onSuccess` (line 67) |
| 19 | Expense cards support left-swipe (Remind) and right-swipe (Settle) gestures | VERIFIED | `ExpenseCard.tsx` — wraps in `ReanimatedSwipeable` with `renderRightActions` (Settle, line 84) and `renderLeftActions` (Remind, line 85); `handleSettle` navigates to `settlement/new`; `handleRemind` shows Alert |

**Score: 19/19 truths verified**

---

## Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `supabase/migrations/20260228000003_expense_loop.sql` | VERIFIED | Expense loop schema with activities, expense_comments, expense_reactions tables |
| `supabase/migrations/20260301000004_fix_activities_actor_fk.sql` | VERIFIED | Drops `activities_actor_id_fkey` (profiles FK) and adds correct FK to `group_members(id) ON DELETE SET NULL` |
| `src/features/expenses/types.ts` | VERIFIED | Exports `Expense`, `ExpenseSplit`, `CreateExpenseInput`, `SplitType`, `UpdateExpenseInput` |
| `src/features/expenses/splits.ts` | VERIFIED | Exports all four `compute*` functions; sum invariant asserted in all four with throw on mismatch |
| `src/features/expenses/splits.test.ts` | VERIFIED | Present; 8 tests confirmed passing in initial verification |
| `src/features/expenses/categories.ts` | VERIFIED | Present; CATEGORIES constant with 9 entries |
| `src/features/expenses/hooks.ts` | VERIFIED | Exports `useExpenses`, `useExpense`, `createExpenseMutationFn` (standalone), `useCreateExpense`, `useUpdateExpense`, `useDeleteExpense` |
| `src/components/expenses/SplitEditor.tsx` | VERIFIED | Imports and calls all four `compute*` functions; four-mode tab UI |
| `src/components/expenses/ExpenseCard.tsx` | VERIFIED | `ReanimatedSwipeable` with `renderRightActions` and `renderLeftActions` |
| `src/components/ui/ExpandableFAB.tsx` | VERIFIED | Three child buttons; `withSpring` animation; Manual Entry navigates to expense new |
| `app/(app)/expenses/new.tsx` | VERIFIED | react-hook-form + zod; SplitEditor mounted; direct-expense mode; calls `useCreateExpense` |
| `app/(app)/expenses/[id]/index.tsx` | VERIFIED | Edit button; delete with Alert confirm; reactions and comment thread |
| `app/(app)/expenses/[id]/edit.tsx` | VERIFIED | Pre-populates from `useExpense`; calls `useUpdateExpense`; title "Edit expense" |
| `src/features/balances/types.ts` | VERIFIED | Present |
| `src/features/balances/hooks.ts` | VERIFIED | Exports `useGroupBalances`, `useBalanceSummary`, `useSimplifiedDebts`, `useRealtimeExpenseSync` with cleanup |
| `supabase/functions/simplify-debts/index.ts` | VERIFIED | Uses `SUPABASE_ANON_KEY`; no service_role; greedy algorithm |
| `src/components/balances/BalanceCard.tsx` | VERIFIED | Present |
| `app/(app)/groups/[id]/balances.tsx` | VERIFIED | Calls `useSimplifiedDebts`; FlatList with Settle buttons; empty state "All debts are settled!" |
| `app/(app)/index.tsx` | VERIFIED | `BalanceSummaryBar` using `useBalanceSummary`; `ExpandableFAB`; `is_direct` filter |
| `app/(app)/groups/[id]/index.tsx` | VERIFIED | `useGroupBalances`, `useRealtimeExpenseSync`, `BalanceCard` list, nav buttons for Simplified Debts/Activity/Settlement History |
| `src/features/settlements/types.ts` | VERIFIED | Present |
| `src/features/settlements/hooks.ts` | VERIFIED | `useCreateSettlement` inserts activity row with `actor_id: actorMember.id` (now valid); `useSettlementHistory` with display name enrichment |
| `src/features/activity/types.ts` | VERIFIED | Present |
| `src/features/activity/hooks.ts` | VERIFIED | All six functions exported; `actor_id: actorMember.id` insert at line 104; join via `actor:group_members!actor_id` at lines 25 and 50 |
| `src/components/settlement/ConfettiScreen.tsx` | VERIFIED | Haptics + confetti on mount; "Done" button calls `onDismiss` |
| `app/(app)/settlement/new.tsx` | VERIFIED | Member pickers; calls `useCreateSettlement`; `router.replace` on success |
| `app/(app)/settlement/success.tsx` | VERIFIED | Renders `<ConfettiScreen onDismiss={() => router.replace('/(app)')} />` with `headerShown: false` |
| `app/(app)/groups/[id]/activity.tsx` | VERIFIED | Calls `useActivityFeed(groupId)`; FlatList with timestamps; tap navigates to expense detail |
| `app/(app)/groups/[id]/settlements.tsx` | VERIFIED | Calls `useSettlementHistory(groupId)`; renders payer/payee names, amount, date |
| `app/_layout.tsx` | VERIFIED | `onlineManager.setEventListener(NetInfo...)` at module scope; `setMutationDefaults` for expenses/create; `resumePausedMutations()` in `onSuccess` |

---

## Key Link Verification

| From | To | Via | Status |
|------|----|-----|--------|
| `supabase/migrations/20260301000004_fix_activities_actor_fk.sql` | `public.activities.actor_id` | `DROP CONSTRAINT IF EXISTS activities_actor_id_fkey` + `ADD CONSTRAINT ... REFERENCES public.group_members(id)` | WIRED |
| `src/features/activity/hooks.ts` | `activities table` | `actor_id: actorMember.id` (line 104) — inserts group_members.id, now valid after migration | WIRED |
| `src/features/activity/hooks.ts` | `group_members table` | `.select('*, actor:group_members!actor_id(display_name)')` (lines 25, 50) | WIRED |
| `src/features/settlements/hooks.ts` | `activities table` | `actor_id: actorMember.id` (line 59) — inserts group_members.id, now valid | WIRED |
| `app/(app)/expenses/new.tsx` | `src/features/expenses/hooks.ts useCreateExpense` | `useCreateExpense().mutateAsync` call on form submit | WIRED |
| `src/components/expenses/SplitEditor.tsx` | `src/features/expenses/splits.ts` | All four `compute*` functions imported and called reactively | WIRED |
| `app/(app)/index.tsx` | `src/components/ui/ExpandableFAB.tsx` | `<ExpandableFAB />` rendered at line 92 | WIRED |
| `src/features/balances/hooks.ts useSimplifiedDebts` | `supabase/functions/simplify-debts/index.ts` | `supabase.functions.invoke('simplify-debts', { body: { group_id: groupId } })` | WIRED |
| `src/features/balances/hooks.ts useRealtimeExpenseSync` | `React Query invalidateQueries` | `postgres_changes` subscription with `supabase.removeChannel` cleanup (line 234) | WIRED |
| `app/(app)/index.tsx` | `src/features/balances/hooks.ts useBalanceSummary` | `BalanceSummaryBar` calls `useBalanceSummary()` (line 21) | WIRED |
| `app/(app)/settlement/new.tsx` | `src/features/settlements/hooks.ts useCreateSettlement` | `useCreateSettlement()` called; `.mutate()` on submit (line 28, 77) | WIRED |
| `app/(app)/settlement/new.tsx` | `app/(app)/settlement/success.tsx` | `router.replace('/(app)/settlement/success')` on success (line 77) | WIRED |
| `app/_layout.tsx` | `src/features/expenses/hooks.ts createExpenseMutationFn` | `queryClient.setMutationDefaults(['expenses','create'], { mutationFn: createExpenseMutationFn })` (line 27-29) | WIRED |
| `app/_layout.tsx` | `PersistQueryClientProvider onSuccess` | `queryClient.resumePausedMutations().then(() => queryClient.invalidateQueries())` (line 67) | WIRED |
| `src/components/expenses/ExpenseCard.tsx` | `app/(app)/settlement/new.tsx` | `router.push` with `pathname: '/(app)/settlement/new'` in `handleSettle` | WIRED |
| `app/(app)/groups/[id]/settlements.tsx` | `src/features/settlements/hooks.ts useSettlementHistory` | `useSettlementHistory(groupId)` called at line 16 | WIRED |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| EXPN-01 | 02-01 | Add expense with amount, description, payer, date | SATISFIED | `new.tsx` form with all fields + zod validation |
| EXPN-02 | 02-01 | Split equally among selected members | SATISFIED | `computeEqualSplits` with remainder distribution; SplitEditor "Equal" tab |
| EXPN-03 | 02-01 | Split by exact amounts per member | SATISFIED | `computeExactSplits` validates sum; SplitEditor "Exact" tab |
| EXPN-04 | 02-01 | Split by percentage per member | SATISFIED | `computePercentageSplits` delegates to shares; SplitEditor "Percentage" tab |
| EXPN-05 | 02-01 | Split by shares | SATISFIED | `computeSharesSplits` with last-member remainder; SplitEditor "Shares" tab |
| EXPN-06 | 02-01 | Assign expense categories | SATISFIED | `CATEGORIES` constant (9 entries); chip picker in `new.tsx` and `edit.tsx` |
| EXPN-07 | 02-01 | Edit expense | SATISFIED | `edit.tsx` pre-populates from `useExpense`; calls `useUpdateExpense` |
| EXPN-08 | 02-01 | Delete expense | SATISFIED | `useDeleteExpense` soft-delete; Alert confirm in detail screen |
| EXPN-09 | 02-01 | 1-on-1 expense outside group | SATISFIED | `createDirectExpenseGroup` creates `is_direct: true` group; dashboard filters it out |
| BALS-01 | 02-02 | Dashboard total "you owe / you are owed" | SATISFIED | `useBalanceSummary` + `BalanceSummaryBar` in `index.tsx` |
| BALS-02 | 02-02 | Per-group member balance breakdown | SATISFIED | `useGroupBalances` + `BalanceCard` list in group detail screen |
| BALS-03 | 02-02 | Simplified debt suggestions | SATISFIED | Edge Function with greedy algorithm; `useSimplifiedDebts` + `balances.tsx` |
| SETL-01 | 02-03 | Record settlement payment | SATISFIED | `settlement/new.tsx` with member pickers + `useCreateSettlement` |
| SETL-02 | 02-03 | Confetti + haptic on debt cleared | SATISFIED | `ConfettiScreen.tsx` fires `Haptics.notificationAsync` + `confettiRef.current?.start()` on mount |
| SETL-03 | 02-03 | View settlement history for group | SATISFIED | `settlements.tsx` calls `useSettlementHistory`; FlatList with payer/payee names |
| ACTY-01 | 02-03, 02-04 | Chronological activity feed | SATISFIED (pending runtime) | `activity.tsx` + `useActivityFeed`; FK schema gap fixed by migration 20260301000004 |
| ACTY-02 | 02-03, 02-04 | Filter activity feed by group | SATISFIED (pending runtime) | `useActivityFeed(groupId)` applies `.eq('group_id', groupId)` filter |
| ACTY-03 | 02-03, 02-04 | Add comment on expense | SATISFIED (pending runtime) | `useAddComment` inserts comment + activity with `actorMember.id` (now valid FK) |
| ACTY-04 | 02-03 | Add emoji reaction to expense | SATISFIED | `expense_reactions` uses `user_id` FK to profiles (unchanged, correct); `useAddReaction` UPSERT; reaction chips in expense detail |
| OFFL-02 | 02-03 | Offline expense queue | SATISFIED (pending runtime) | NetInfo + `setMutationDefaults` + `resumePausedMutations` fully wired in `_layout.tsx` |
| UIUX-02 | 02-03 | Swipe expense card for quick-settle/remind | SATISFIED | `ExpenseCard.tsx` — right swipe "Settle" navigates to settlement form; left swipe "Remind" shows alert |
| UIUX-03 | 02-01 | FAB expands to Scan Receipt / Manual Entry / Add Transfer | SATISFIED | `ExpandableFAB.tsx` — all three child buttons with spring animation |

**Note:** REQUIREMENTS.md still shows SETL-01, SETL-02, SETL-03, ACTY-04, OFFL-02, and UIUX-02 as `[ ]` (unchecked). The implementations exist and are verified in the codebase. The checkbox status in REQUIREMENTS.md is a documentation inconsistency, not a code gap — the traceability table at the bottom of REQUIREMENTS.md correctly maps all 22 Phase 2 requirements. No action is required before proceeding to Phase 3, but REQUIREMENTS.md should be updated to reflect actual completion status.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/components/ui/ExpandableFAB.tsx` | ~38 | `Alert.alert('Coming soon', ...)` for "Add Transfer" button | INFO | Intentional placeholder for Phase 3 receipt/transfer feature — matches plan spec; does not affect any Phase 2 requirement |
| `app/(app)/groups/[id]/balances.tsx` | 28 | Comment "Settlement flow built in Plan 02-03 — route placeholder for now" | INFO | The Settle button in simplified debts screen navigates to settlement/new correctly (line 35 confirms push); comment is stale but harmless |

No blockers or warnings found in the gap-closure artifacts. All previously-identified blockers (activities FK mismatch) are resolved.

---

## Human Verification Required

### 1. Activity Feed Runtime Behaviour (ACTY-01, ACTY-02, ACTY-03)

**Test:** Apply migration via `supabase db push` (or Supabase Dashboard SQL editor). Then add a new expense to a group. Navigate to Groups > [Group] > Activity.
**Expected:** At least one row appears showing "[your display name] added an expense" with a relative timestamp (e.g., "just now").
**Why human:** The migration must be applied to the hosted Supabase project before the FK fix takes effect. Static verification confirms the migration file is correct and the hooks insert the right FK value, but runtime confirmation against the live database is needed.

### 2. Confetti and Haptic Success Screen (SETL-02)

**Test:** Record a settlement payment via the settlement form. Tap "Record Settlement".
**Expected:** Full-screen confetti fires from the top of the screen; haptic notification pulse fires simultaneously on mount. "Done" button returns to the dashboard.
**Why human:** `expo-haptics` and `react-native-confetti-cannon` require a real device or simulator with audio/vibration enabled; cannot verify programmatically.

### 3. Offline Expense Queuing and Sync (OFFL-02)

**Test:** Enable airplane mode. Add a new expense via FAB > Manual Entry. Disable airplane mode.
**Expected:** Expense syncs to Supabase and appears in the group expense list within a few seconds after reconnection.
**Why human:** NetInfo toggling requires real device network state changes; `resumePausedMutations` behaviour requires actual persisted mutation state from `expo-sqlite` persister.

### 4. Supabase Realtime Balance Update (BALS-01 / BALS-02)

**Test:** Open the app in two simulators connected to the same Supabase project. In simulator A, add an expense. In simulator B, observe the dashboard balance bar.
**Expected:** Simulator B's "You are owed" / "You owe" totals update within approximately 2 seconds without a manual refresh.
**Why human:** Requires two running simulator instances and a live Supabase Realtime connection; cannot verify statically.

---

## Gaps Summary

No gaps remain. All 19 observable truths are verified. The single blocker from the initial verification (activities.actor_id FK mismatch) was resolved by migration `20260301000004_fix_activities_actor_fk.sql` (committed as `0370ada`).

Four items require human runtime verification before the phase can be considered fully production-confirmed:
- ACTY-01/02/03 — activity feed (requires `supabase db push` to apply the FK fix to hosted DB)
- SETL-02 — confetti/haptic (requires device/simulator)
- OFFL-02 — offline queue (requires real network toggling)
- Realtime — two-simulator Supabase Realtime test

These are environmental verification items, not code gaps. Phase 3 can proceed in parallel.

---

_Verified: 2026-03-01_
_Verifier: Claude (gsd-verifier)_
_Re-verification after gap closure: plan 02-04, commit 0370ada_

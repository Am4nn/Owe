---
phase: 02-core-expense-loop
plan: 01
subsystem: expenses
tags: [react-native, supabase, react-query, zod, react-hook-form, nativewind, reanimated, gesture-handler, jest]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: supabase client, groups/group_members tables, React Query provider, NativeWind styling, expo-router navigation
  - phase: 01-foundation
    provides: expenses + expense_splits tables from foundation migration

provides:
  - DB migration 20260228000003: activities, expense_comments, expense_reactions tables with RLS; is_direct column on groups
  - Expense types: Expense, ExpenseSplit, CreateExpenseInput, UpdateExpenseInput, SplitType
  - Pure split calculation functions: computeEqualSplits, computeExactSplits, computePercentageSplits, computeSharesSplits
  - React Query hooks: useExpenses, useExpense, useCreateExpense (with mutationKey), useUpdateExpense, useDeleteExpense
  - SplitEditor component with four-mode UI (equal/exact/percentage/shares) with live preview
  - ExpenseCard component with ReanimatedSwipeable (Settle/Remind actions)
  - ExpandableFAB with animated child buttons (Manual Entry / Add Transfer / Scan Receipt)
  - app/(app)/expenses/new.tsx: expense entry form with 1-on-1 direct mode
  - app/(app)/expenses/[id]/index.tsx: expense detail with edit/delete
  - app/(app)/expenses/[id]/edit.tsx: expense edit form
  - Dashboard updated: ExpandableFAB + is_direct group filter

affects:
  - 02-02-settlements (uses expense hooks and group hooks)
  - 02-03-offline (wires useCreateExpense mutationKey for offline queue)
  - 02-02-activity-feed (uses activities table from migration)

# Tech tracking
tech-stack:
  added:
    - "@types/jest (devDependency) — adds jest globals to TypeScript without breaking tsc"
  patterns:
    - "Two-step expense insert with rollback: INSERT expense then INSERT splits; on splits failure DELETE orphaned expense"
    - "mutationKey on all expense mutations: required for OFFL-02 offline queue wiring in Plan 02-03"
    - "Pure split functions with sum invariant: every compute* function asserts sum === totalCents before returning"
    - "is_direct virtual group pattern: groups table is_direct=true for 1-on-1 expenses, filtered from main group list"

key-files:
  created:
    - supabase/migrations/20260228000003_expense_loop.sql
    - src/features/expenses/types.ts
    - src/features/expenses/splits.ts
    - src/features/expenses/splits.test.ts
    - src/features/expenses/categories.ts
    - src/features/expenses/hooks.ts
    - src/components/expenses/SplitEditor.tsx
    - src/components/expenses/ExpenseCard.tsx
    - src/components/ui/ExpandableFAB.tsx
    - app/(app)/expenses/new.tsx
    - app/(app)/expenses/[id]/index.tsx
    - app/(app)/expenses/[id]/edit.tsx
  modified:
    - app/(app)/index.tsx
    - src/features/groups/types.ts
    - src/features/groups/hooks.ts
    - tsconfig.json

key-decisions:
  - "useCreateExpense gets mutationKey: ['expenses','create'] — required for Plan 02-03 offline queue; omitting the key prevents Tanstack Query from matching paused mutations on resume"
  - "Two-step insert with rollback: INSERT expense first (gets ID), then INSERT splits referencing that ID. On split failure, DELETE the orphaned expense row before throwing — prevents ghost expenses with no splits"
  - "is_direct virtual group: created inline during direct expense submission, not pre-created; filtered from dashboard via groups.filter(g => !g.is_direct)"
  - "Pure split functions assert sum === totalCents invariant — catch any rounding bugs at compute time rather than at persistence time"
  - "computeSharesSplits last-member remainder: all but last member get Math.floor, last member absorbs remainder — guarantees invariant without relying on rounding corrections"
  - "@types/jest added to tsconfig types array — fixes describe/it/expect TS2582 errors in test files without breaking expo-router typed routes"

patterns-established:
  - "SplitEditor calls compute* functions live on every input change and surfaces validation errors inline"
  - "Soft-delete pattern: expenses are never hard-deleted; deleted_at timestamp set; useExpenses filters IS NULL"

requirements-completed: [EXPN-01, EXPN-02, EXPN-03, EXPN-04, EXPN-05, EXPN-06, EXPN-07, EXPN-08, EXPN-09, UIUX-03]

# Metrics
duration: 9min
completed: 2026-02-28
---

# Phase 02 Plan 01: Expense Entry Flow Summary

**Complete expense creation loop with four split modes (equal/exact/percentage/shares), TDD-verified penny-remainder handling, animated ExpandableFAB, and 1-on-1 direct expense support via is_direct virtual groups**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-28T18:53:18Z
- **Completed:** 2026-02-28T19:02:00Z
- **Tasks:** 2 (Task 1: TDD = 3 commits; Task 2: 1 commit)
- **Files modified:** 16

## Accomplishments

- Supabase migration 20260228000003 with activities, expense_comments, expense_reactions tables (each with RLS) and is_direct column on groups
- Pure split calculation functions with TDD (8 tests passing; sum invariant asserted in every function)
- Full React Query expense CRUD hooks with two-step insert/rollback pattern and offline-ready mutationKeys
- SplitEditor component supporting four split modes with live amount preview and validation feedback
- ExpandableFAB replacing static FAB on dashboard with animated child buttons (spring animation via Reanimated 4)
- Expense entry, detail, and edit screens with react-hook-form + zod validation

## Task Commits

1. **Task 1 (TDD RED): DB migration + test file** - `8d03215` (test)
2. **Task 1 (TDD GREEN): splits.ts + types.ts + categories.ts + migration** - `622e57b` (feat)
3. **Task 2: hooks + components + screens** - `431553c` (feat)

## Files Created/Modified

- `supabase/migrations/20260228000003_expense_loop.sql` — activities, expense_comments, expense_reactions + is_direct column
- `src/features/expenses/types.ts` — Expense, ExpenseSplit, CreateExpenseInput, UpdateExpenseInput, SplitType
- `src/features/expenses/splits.ts` — Four pure split functions with sum invariant assertions
- `src/features/expenses/splits.test.ts` — 8 Jest tests covering all split modes and edge cases
- `src/features/expenses/categories.ts` — 9 CATEGORIES entries as const
- `src/features/expenses/hooks.ts` — useExpenses, useExpense, useCreateExpense, useUpdateExpense, useDeleteExpense
- `src/components/expenses/SplitEditor.tsx` — Four-mode split editor with live preview
- `src/components/expenses/ExpenseCard.tsx` — Swipeable card with ReanimatedSwipeable
- `src/components/ui/ExpandableFAB.tsx` — Animated expandable FAB (Reanimated 4 + SharedValue<number>)
- `app/(app)/expenses/new.tsx` — New expense screen with direct-expense support
- `app/(app)/expenses/[id]/index.tsx` — Expense detail screen with soft-delete
- `app/(app)/expenses/[id]/edit.tsx` — Pre-populated expense edit screen
- `app/(app)/index.tsx` — Dashboard updated: ExpandableFAB + is_direct filter
- `src/features/groups/types.ts` — Added is_direct field to Group interface
- `src/features/groups/hooks.ts` — Fixed Group cast after is_direct field addition

## Decisions Made

- **useCreateExpense mutationKey** — `['expenses', 'create']` required for Plan 02-03 offline queue via `resumePausedMutations`; omitting it prevents Tanstack Query from matching paused mutations on session resume.
- **Two-step insert with rollback** — INSERT expense to get ID, then INSERT splits; on split failure DELETE orphaned expense row to prevent ghost expenses.
- **Last-member remainder in computeSharesSplits** — Every member except last gets `Math.floor`, last absorbs remainder. Guarantees sum invariant without second-pass correction loop.
- **@types/jest in tsconfig types** — Necessary to fix TS2582 errors in test files (describe/it/expect). Does not conflict with expo-router typed routes.
- **ExpandableFAB uses `SharedValue<number>` explicit type** — Reanimated 4 with react-native-worklets requires explicit generic on `useSharedValue` to avoid `SharedValue<unknown>` inference errors.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed `SharedValue<unknown>` type inference in ExpandableFAB**
- **Found during:** Task 2 (ExpandableFAB)
- **Issue:** `useSharedValue(0)` inferred as `SharedValue<unknown>` in Reanimated 4 with worklets, causing useAnimatedStyle errors
- **Fix:** Added explicit generic: `useSharedValue<number>(0)` and typed ChildFABButtonProps with `SharedValue<number>`
- **Files modified:** `src/components/ui/ExpandableFAB.tsx`
- **Verification:** TypeScript compiles with no errors in new files
- **Committed in:** 431553c (Task 2 commit)

**2. [Rule 1 - Bug] Fixed Group type cast after adding is_direct field**
- **Found during:** Task 2 (updating groups/types.ts)
- **Issue:** After adding `is_direct: boolean` to Group interface, `row.groups as Group` in hooks.ts reported type mismatch
- **Fix:** Changed to `row.groups as unknown as Group` (standard widening cast for Supabase inferred types)
- **Files modified:** `src/features/groups/hooks.ts`
- **Verification:** TypeScript compiles with no errors
- **Committed in:** 431553c (Task 2 commit)

**3. [Rule 2 - Missing Critical] Added @types/jest for TypeScript test support**
- **Found during:** Task 2 (tsc --noEmit verification)
- **Issue:** splits.test.ts reported TS2582 errors for `describe`/`it`/`expect` — @types/jest not installed, tsconfig not configured
- **Fix:** `npm install --save-dev @types/jest`, added `"types": ["jest"]` to tsconfig.json
- **Files modified:** `package.json`, `tsconfig.json`
- **Verification:** tsc --noEmit no longer reports test-file errors
- **Committed in:** 431553c (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (2 Rule 1 bugs, 1 Rule 2 missing critical)
**Impact on plan:** All auto-fixes necessary for TypeScript correctness. No scope creep.

### Deferred Items (Pre-existing, out-of-scope)

Two pre-existing TypeScript errors from Phase 1 were logged to `deferred-items.md` but NOT fixed:
- `app/(app)/groups/new.tsx` lines 22, 119 — zodResolver type mismatch (from Phase 1 Plan 03)
- `src/lib/persister.ts` line 35 — MMKV `delete` vs `remove` API mismatch (from Phase 1 Plan 04)

## Issues Encountered

- Expo-router typed routes do not include dynamic expense paths (`/(app)/expenses/${id}`) — used `as Parameters<typeof router.push>[0]` type assertion as standard pattern for dynamic paths in this codebase.

## User Setup Required

None — no external service configuration required beyond the existing Supabase setup. The new migration (`20260228000003_expense_loop.sql`) needs to be applied via `supabase db push` as noted in the existing blocker in STATE.md.

## Next Phase Readiness

- Plan 02-02 (Settlements + Balance Calculation) can use `useExpenses` hook and activities table from this migration
- Plan 02-03 (Offline Expense Entry) can wire `resumePausedMutations` to `useCreateExpense` via its `mutationKey: ['expenses', 'create']`
- All split modes tested and verified — balance calculation in 02-02 can trust splits sum exactly to expense total

---
*Phase: 02-core-expense-loop*
*Completed: 2026-02-28*

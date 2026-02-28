---
phase: 02-core-expense-loop
plan: 02
subsystem: ui
tags: [react-native, supabase, realtime, react-query, deno, edge-functions, balance-computation]

# Dependency graph
requires:
  - phase: 02-01
    provides: useExpenses, ExpenseCard, expense_splits and settlements tables, Supabase client setup

provides:
  - MemberBalance, BalanceSummary, DebtSuggestion types (src/features/balances/types.ts)
  - useGroupBalances hook — per-group net balance computation from expense_splits and settlements
  - useBalanceSummary hook — cross-group total owed/owing for current user
  - useSimplifiedDebts hook — calls simplify-debts Edge Function for greedy minimum-payment suggestions
  - useRealtimeExpenseSync hook — Supabase Realtime postgres_changes subscription with cleanup
  - BalanceCard component — green/red/settled net balance row
  - Dashboard balance summary bar (BALS-01): "You are owed" / "You owe" totals
  - Group detail screen extensions: per-member balances, Simplified Debts/Activity/Settlement History nav buttons, expenses list, Realtime sync
  - Simplified debts screen (BALS-03): server-computed minimum payment suggestions
  - simplify-debts Deno Edge Function: greedy debt simplification using anon key + forwarded JWT

affects: [02-03-settlements-activity, 02-04-offline]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Supabase Realtime postgres_changes subscription with mandatory cleanup (supabase.removeChannel) to prevent channel accumulation
    - Two-query client-side net balance reduction: expense_splits (inner join expenses) + settlements
    - Greedy debt simplification: separate creditors/debtors, sort descending, emit min(creditor, debtor) payments
    - Edge Function pattern: anon key + forwarded Authorization header (no service_role) so RLS applies server-side
    - as unknown as T double cast for Supabase nested join return types in strict TypeScript

key-files:
  created:
    - src/features/balances/types.ts
    - src/features/balances/hooks.ts
    - supabase/functions/simplify-debts/index.ts
    - src/components/balances/BalanceCard.tsx
    - app/(app)/groups/[id]/balances.tsx
  modified:
    - app/(app)/index.tsx
    - app/(app)/groups/[id]/index.tsx
    - tsconfig.json

key-decisions:
  - "Exclude supabase/functions from tsconfig — Deno types (Deno.serve, esm.sh imports) are incompatible with the Expo/React Native TS config; Edge Functions have their own runtime"
  - "service_role key comment in Edge Function is safe — comment only explains why we are NOT using it; actual code uses SUPABASE_ANON_KEY + forwarded JWT"
  - "Settlement Settle button in balances.tsx uses query-param URL form for route placeholder — settlement route not yet registered so object-form router.push causes TS error"
  - "useRealtimeExpenseSync is a void hook (no return value) — implements useEffect internally with cleanup function for channel removal"

patterns-established:
  - "Realtime pattern: useEffect subscribes to postgres_changes, returns () => supabase.removeChannel(channel) — prevents channel accumulation on unmount"
  - "Balance sign convention: payer +amount_cents (they fronted money), split member -amount_cents (they owe) — consistent between client hooks and server Edge Function"
  - "Edge Function auth: createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } }) — user JWT forwarded, RLS applies"

requirements-completed: [BALS-01, BALS-02, BALS-03]

# Metrics
duration: 4min
completed: 2026-02-28
---

# Phase 2 Plan 02: Balance Layer Summary

**Supabase Realtime balance layer with greedy debt simplification Edge Function, per-group member balances, and dashboard totals using anon key + JWT forwarding (no service_role)**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-28T19:06:58Z
- **Completed:** 2026-02-28T19:10:40Z
- **Tasks:** 2
- **Files modified:** 8 (5 created, 3 modified)

## Accomplishments
- Built complete balance read-side: BALS-01 dashboard totals, BALS-02 per-group member breakdowns, BALS-03 simplified debt suggestions
- Implemented Deno Edge Function for server-side greedy debt simplification using anon key + forwarded JWT so RLS applies
- Wired Supabase Realtime to invalidate expense and balance queries on changes — real-time balance updates without polling
- Added navigation buttons from group detail to Simplified Debts, Activity, and Settlement History screens (built in 02-03)

## Task Commits

Each task was committed atomically:

1. **Task 1: Balance types, hooks, Realtime, Edge Function** - `6443e96` (feat)
2. **Task 2: Balance UI — dashboard, group detail, simplified debts screen** - `aa2b26e` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/features/balances/types.ts` - MemberBalance, BalanceSummary, DebtSuggestion interfaces
- `src/features/balances/hooks.ts` - useGroupBalances, useBalanceSummary, useSimplifiedDebts, useRealtimeExpenseSync
- `supabase/functions/simplify-debts/index.ts` - Deno Edge Function with greedy algorithm, anon key + forwarded JWT
- `src/components/balances/BalanceCard.tsx` - Member balance row with green/red/settled display
- `app/(app)/groups/[id]/balances.tsx` - Simplified debts screen with Edge Function integration
- `app/(app)/index.tsx` - Added BalanceSummaryBar with "You are owed" / "You owe" totals above groups list
- `app/(app)/groups/[id]/index.tsx` - Added BalanceCard list, Realtime sync, nav buttons, expenses FlatList
- `tsconfig.json` - Excluded supabase/functions from compilation (Deno runtime incompatibility)

## Decisions Made
- Excluded `supabase/functions` from tsconfig — Deno.serve and esm.sh imports are incompatible with the mobile TS config; Edge Functions run in their own Deno runtime
- Used `as unknown as T` double-cast for Supabase nested join return types — strict TypeScript rejects single cast from `{ payer_id: any }[]` to `{ payer_id: string }`
- Settlement "Settle" button uses query-param URL string form instead of object pathname — settlement route not yet registered with expo-router typed routes (built in 02-03)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript type assertion for nested Supabase join result**
- **Found during:** Task 1 (balance hooks)
- **Issue:** Supabase returns `expense: { payer_id: any }[]` from inner join; direct cast `as { payer_id: string }` fails strict TS
- **Fix:** Changed to double cast `(split.expense as unknown) as { payer_id: string; ... }` in both query loops
- **Files modified:** src/features/balances/hooks.ts
- **Verification:** npx tsc --noEmit shows zero errors for balances feature files
- **Committed in:** 6443e96 (Task 1 commit)

**2. [Rule 3 - Blocking] Excluded supabase/functions from tsconfig**
- **Found during:** Task 1 (verification step)
- **Issue:** Deno Edge Function uses `Deno.serve` and `https://esm.sh/` imports — these cause TS2304/TS2307 errors in the React Native compiler config
- **Fix:** Added `"exclude": ["supabase/functions"]` to tsconfig.json
- **Files modified:** tsconfig.json
- **Verification:** npx tsc --noEmit shows zero Deno-related errors
- **Committed in:** 6443e96 (Task 1 commit)

**3. [Rule 1 - Bug] Used query-param form for unregistered settlement route**
- **Found during:** Task 2 (TypeScript check)
- **Issue:** `router.push({ pathname: '/(app)/settlement/new', params: ... })` causes TS2322 because the route isn't yet registered with expo-router typed routes
- **Fix:** Changed to URL string form with query params and `as Parameters<typeof router.push>[0]` cast
- **Files modified:** app/(app)/groups/[id]/balances.tsx
- **Verification:** npx tsc --noEmit shows zero errors for balances.tsx
- **Committed in:** aa2b26e (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (1 type bug, 1 blocking config, 1 route type bug)
**Impact on plan:** All auto-fixes necessary for TypeScript compilation. No scope creep. Route placeholder will be replaced when settlement screen is built in 02-03.

## Issues Encountered
- Pre-existing TypeScript errors in `app/(app)/groups/new.tsx` and `src/lib/persister.ts` were present before this plan and are not related to our changes — deferred per scope boundary rule

## User Setup Required
None - no external service configuration required. Edge Function deployment to Supabase will be needed before BALS-03 works in production (deploy with `supabase functions deploy simplify-debts`).

## Next Phase Readiness
- Balance layer complete — BALS-01, BALS-02, BALS-03 all implemented
- Group detail screen has navigation buttons to Activity and Settlement History screens — ready for Plan 02-03
- Realtime subscription active — balance totals update in real-time when expenses change
- simplify-debts Edge Function needs deployment to hosted Supabase project before production use

---
*Phase: 02-core-expense-loop*
*Completed: 2026-02-28*

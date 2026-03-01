---
phase: 04-expense-activity-events
plan: 01
subsystem: api
tags: [supabase, react-query, activities, expenses, tanstack-query]

# Dependency graph
requires:
  - phase: 02-core-expense-loop
    provides: createExpenseMutationFn, useUpdateExpense, useDeleteExpense, activities table schema
  - phase: 02-core-expense-loop
    provides: activities table with actor_id FK referencing group_members(id) via migration 20260301000004
provides:
  - expense_added activity rows written on every createExpenseMutationFn call
  - expense_edited activity rows written on every useUpdateExpense mutation
  - expense_deleted activity rows written on every useDeleteExpense mutation
  - group-scoped activity feed filtering for all three expense event types (ACTY-02)
affects: [activity-feed, group-detail-screen, useActivityFeed]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Actor resolution pattern: resolve group_members.id via supabase.auth.getUser() + group_members SELECT before every activities INSERT
    - Inline activity INSERT inside mutationFn (not onSuccess) — ensures offline-resumed mutations (OFFL-02) also write activity rows
    - Consolidated getUser() call in createExpenseMutationFn — single call reused for both created_by and actor resolution

key-files:
  created: []
  modified:
    - src/features/expenses/hooks.ts

key-decisions:
  - "Activity INSERT must be inside mutationFn body (not onSuccess) — offline mutation queue re-runs mutationFn on reconnect but does not fire onSuccess"
  - "actor_id must be group_members.id (actorMember.id), NOT the auth user UUID — FK references group_members(id) per migration 20260301000004"
  - "createExpenseMutationFn: consolidate supabase.auth.getUser() to single call at top, reuse user.id for both created_by field and group_members lookup"

patterns-established:
  - "Actor resolution: always resolve group_members.id via .eq('group_id', ...).eq('user_id', user.id).single() before activities INSERT"
  - "Cache invalidation: always invalidate both ['activity', group_id] and ['activity', 'all'] in onSuccess after any CUD mutation that creates activity rows"

requirements-completed: [ACTY-01, ACTY-02]

# Metrics
duration: 2min
completed: 2026-03-01
---

# Phase 4 Plan 01: Expense Activity Events Summary

**Expense CUD mutations (create/edit/delete) now write activity rows so the activity feed shows expense events without manual reload**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-01T14:01:03Z
- **Completed:** 2026-03-01T14:02:51Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- `createExpenseMutationFn` now inserts an `expense_added` activity row after splits succeed, with actor_id from group_members (not auth UUID), satisfying ACTY-01
- `useUpdateExpense.mutationFn` now inserts an `expense_edited` activity row before returning, closing the edit gap in the activity feed
- `useDeleteExpense.mutationFn` now inserts an `expense_deleted` activity row before returning, reusing the existing `userId` to resolve actor_id
- All three `onSuccess` handlers invalidate `['activity', group_id]` and `['activity', 'all']` so the feed refreshes automatically (ACTY-02 group-scoped filter automatically satisfied because every row carries group_id)
- `createExpenseMutationFn` consolidated from two `getUser()` round-trips to one — user object reused for `created_by: user.id` and actor resolution

## Task Commits

Each task was committed atomically:

1. **Task 1: Add activity INSERT to createExpenseMutationFn** - `e10e835` (feat)
2. **Task 2: Add activity INSERT to useUpdateExpense and useDeleteExpense** - `c1bb023` (feat)

**Plan metadata:** _(final docs commit — see below)_

## Files Created/Modified
- `src/features/expenses/hooks.ts` - Added Steps 3+4 (actor resolution + activities INSERT) to all three expense CUD mutation functions; updated all three onSuccess handlers with activity cache invalidation

## Decisions Made
- Activity INSERT placed inside `mutationFn` body, not `onSuccess` — offline mutation queue (OFFL-02) re-runs `mutationFn` on reconnect but does not fire `onSuccess`, so any INSERT in `onSuccess` would be silently skipped after an offline-resumed mutation
- `actor_id` resolves to `group_members.id` (not `auth.users.id`) because the `activities` table FK references `group_members(id)` per migration 20260301000004
- Consolidated `getUser()` in `createExpenseMutationFn` to a single call at the top — eliminates an extra network round-trip while making `user` available for both `created_by` and actor lookup

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- ACTY-01 and ACTY-02 requirements are now fully satisfied — expense create/edit/delete all produce activity rows visible in the activity feed
- Activity feed screen (useActivityFeed) will automatically display expense events without any UI changes
- The actor_id pattern is now consistent across settlements (useCreateSettlement) and all expense mutations

---
*Phase: 04-expense-activity-events*
*Completed: 2026-03-01*

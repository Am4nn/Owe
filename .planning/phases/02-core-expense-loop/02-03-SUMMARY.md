---
phase: 02-core-expense-loop
plan: 03
subsystem: ui
tags: [react-native, expo, tanstack-query, supabase, offline-first, settlements, activity-feed, confetti, haptics, netinfo]

# Dependency graph
requires:
  - phase: 02-core-expense-loop/02-01
    provides: expense hooks (useCreateExpense), mutationKey ['expenses','create'], ExpenseCard swipeable component
  - phase: 02-core-expense-loop/02-02
    provides: balance UI, group member context
provides:
  - Settlement recording flow (form + confetti success screen) via useCreateSettlement
  - Settlement history screen per group via useSettlementHistory
  - Activity feed screen (group-filtered and all-groups) via useActivityFeed
  - Emoji reactions (add/remove) on expense detail via useAddReaction/useRemoveReaction
  - Comment thread on expense detail via useAddComment/useComments
  - Offline expense mutation queue via OFFL-02 (NetInfo + setMutationDefaults + resumePausedMutations)
  - ExpenseCard right-swipe to settle, left-swipe reminder placeholder
affects: [03-push-notifications, future-activity-features]

# Tech tracking
tech-stack:
  added:
    - react-native-confetti-cannon@1.5.2
    - "@react-native-community/netinfo@11.5.2"
    - expo-haptics@55.0.8
  patterns:
    - OFFL-02: NetInfo onlineManager.setEventListener at module scope + setMutationDefaults with named export function + resumePausedMutations in PersistQueryClientProvider onSuccess
    - Two-step activity query pattern for all-groups feed (membership fetch then in() filter — PostgREST cannot express WHERE IN subquery)
    - Standalone mutationFn export pattern for offline-resumable mutations (function reference must survive serialization)

key-files:
  created:
    - src/features/settlements/types.ts
    - src/features/settlements/hooks.ts
    - src/features/activity/types.ts
    - src/features/activity/hooks.ts
    - src/components/settlement/ConfettiScreen.tsx
    - app/(app)/settlement/new.tsx
    - app/(app)/settlement/success.tsx
    - app/(app)/groups/[id]/activity.tsx
    - app/(app)/groups/[id]/settlements.tsx
  modified:
    - src/features/expenses/hooks.ts
    - app/_layout.tsx
    - app/(app)/expenses/[id]/index.tsx
    - src/components/expenses/ExpenseCard.tsx
    - package.json
    - pnpm-lock.yaml

key-decisions:
  - "createExpenseMutationFn extracted as named export from expenses/hooks.ts — inline closures cannot be passed to setMutationDefaults (function reference must survive app restart serialization)"
  - "NetInfo onlineManager wired at module scope in _layout.tsx (not inside a component) — must run before any React component mounts to capture network state from launch"
  - "Two-step activity query for all-groups view — PostgREST JS client cannot express WHERE group_id IN (SELECT ...) natively; fetch memberships first then use .in()"
  - "expense_reactions upsert on conflict (expense_id, user_id) — one reaction per user per expense, updating emoji on re-react rather than inserting duplicate"

patterns-established:
  - "OFFL-02 offline mutation queue: setMutationDefaults at module load + resumePausedMutations in PersistQueryClientProvider onSuccess + NetInfo onlineManager at module scope"
  - "Settlement creation inserts settlement row then activity row in the same mutationFn — no separate activity hook needed for settlement events"
  - "Actor resolution pattern: when inserting activity rows, resolve group_members.id from auth.uid() + group_id because activities.actor_id references member_id not user_id"

requirements-completed: [SETL-01, SETL-02, SETL-03, ACTY-01, ACTY-02, ACTY-03, ACTY-04, OFFL-02, UIUX-02]

# Metrics
duration: 6min
completed: 2026-02-28
---

# Phase 2 Plan 03: Settlements, Activity Feed, Reactions, Comments, and Offline Queue Summary

**Settlement recording with confetti + haptics, per-group settlement history and activity feed, emoji reactions and comment threads on expense detail, and OFFL-02 offline mutation queue via NetInfo onlineManager + resumePausedMutations**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-02-28T19:06:55Z
- **Completed:** 2026-02-28T19:12:58Z
- **Tasks:** 2
- **Files modified:** 14 (6 created, 8 modified/created in features + screens)

## Accomplishments
- Settlement form with payer/payee member pickers, amount input, and optional note — navigates to confetti success screen on submit (SETL-01, SETL-02)
- Settlement history screen listing past settlements with display names, amounts, and dates per group (SETL-03)
- Activity feed screen showing chronological actions filterable by group — two-step query handles all-groups view (ACTY-01, ACTY-02)
- Emoji reaction chips (add/remove) and comment thread with "Send" button on expense detail screen (ACTY-03, ACTY-04)
- OFFL-02 fully wired: NetInfo onlineManager pauses/resumes React Query network mode; createExpenseMutationFn extracted and registered in setMutationDefaults; resumePausedMutations fires in PersistQueryClientProvider onSuccess
- ExpenseCard right swipe navigates to settlement/new with group_id param; left swipe shows reminder placeholder (UIUX-02)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install packages + wire OFFL-02 + settlement types/hooks + activity types/hooks** - `e9b0a61` (feat)
2. **Task 2: Settlement screens + confetti + settlement history + activity feed + comments + reactions + swipe** - `54bdb05` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `src/features/settlements/types.ts` - Settlement and CreateSettlementInput interfaces
- `src/features/settlements/hooks.ts` - useCreateSettlement (with activity row), useSettlementHistory (with display names)
- `src/features/activity/types.ts` - ActivityItem, Comment, Reaction interfaces
- `src/features/activity/hooks.ts` - useActivityFeed, useAddComment, useComments, useAddReaction, useRemoveReaction, useReactions
- `src/components/settlement/ConfettiScreen.tsx` - Full-screen confetti + haptic component
- `app/(app)/settlement/new.tsx` - Settlement recording form with member pickers
- `app/(app)/settlement/success.tsx` - Success screen rendering ConfettiScreen
- `app/(app)/groups/[id]/activity.tsx` - Group activity feed screen
- `app/(app)/groups/[id]/settlements.tsx` - Group settlement history screen
- `app/(app)/expenses/[id]/index.tsx` - Extended with reactions and comment thread
- `src/components/expenses/ExpenseCard.tsx` - Right/left swipe handlers wired to navigation
- `src/features/expenses/hooks.ts` - Extracted createExpenseMutationFn as named export
- `app/_layout.tsx` - Added NetInfo onlineManager, setMutationDefaults, resumePausedMutations
- `package.json` + `pnpm-lock.yaml` - Added netinfo, haptics, confetti packages

## Decisions Made
- `createExpenseMutationFn` extracted as standalone named export — inline closures lose their function identity after app restart serialization, making setMutationDefaults non-functional for paused mutation resume
- NetInfo `onlineManager.setEventListener` called at module scope in `_layout.tsx` (not inside a component) — must run before React tree renders to capture initial network state correctly
- Two-step query for all-groups activity view — PostgREST JS client has no native IN-subquery support; fetch group memberships then pass resulting IDs to `.in()` filter
- UPSERT for reactions with `onConflict: 'expense_id,user_id'` — enforces one reaction per user per expense at the database level, updating emoji instead of duplicating

## Deviations from Plan

None - plan executed exactly as written. All TypeScript errors encountered were pre-existing in `app/(app)/groups/new.tsx` and `src/lib/persister.ts` (out of scope, logged to deferred items).

## Issues Encountered
- `expo install @react-native-community/netinfo expo-haptics` used npm rather than pnpm — ran `pnpm install` afterward to sync pnpm-lock.yaml. No functional impact.
- Expo Router typed routes did not yet include the new settlement routes at compile time — used `as Parameters<typeof router.replace>[0]` type cast, which is the established pattern in this codebase for dynamic route strings.

## User Setup Required
None - no external service configuration required. Supabase tables (settlements, activities, expense_comments, expense_reactions) were created in migration 20260228000003 during Plan 02-01.

## Next Phase Readiness
- Phase 2 is complete: expense entry, balance tracking, settlement flow, activity feed, offline queue all shipped
- Phase 3 (Push Notifications) can now build on top of the activity model; the `activities` table is populated and the reminder placeholder in ExpenseCard left-swipe awaits Phase 3 implementation
- Concern (from STATE.md): EAS Push + OneSignal token lifecycle has integration gotchas — dedicated research pass recommended before Phase 3

---
*Phase: 02-core-expense-loop*
*Completed: 2026-02-28*

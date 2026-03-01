---
phase: 05-schema-notification-fixes
plan: 01
subsystem: database
tags: [supabase, migrations, postgres, edge-functions, push-notifications, expo-router]

# Dependency graph
requires:
  - phase: 03-engagement-layer
    provides: push-notify Edge Function and push notification infrastructure
  - phase: 02-core-expense-loop
    provides: settlements table schema and useCreateSettlement hook
provides:
  - settlements.note TEXT column — note field from settlement form is now persisted to DB
  - Fixed expense push notification deep-link — tapping notification opens /expenses/[id]
affects: [settlements history screen, push notification flows, SETL-01, SETL-03, NOTF-01]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Expo Router route groups: (group-name) is organizational — parenthesised segments do NOT appear in navigable URLs"
    - "Nullable column migration: ADD COLUMN without NOT NULL or DEFAULT — existing rows get NULL implicitly, matching TS type string | null"

key-files:
  created:
    - supabase/migrations/20260301000006_add_settlement_note.sql
  modified:
    - supabase/functions/push-notify/index.ts

key-decisions:
  - "settlements.note column is nullable TEXT with no DEFAULT — matches TS type note: string | null; NULL correctly represents no-note-provided"
  - "Expo Router (app) group prefix must not appear in push notification dataUrl — useNotificationDeepLink uses router.push(url) verbatim with no transformation"

patterns-established:
  - "Always verify Expo Router file path vs navigable URL: (group) directories are invisible in URLs"
  - "PostgREST silently drops unknown columns on INSERT — missing DB column = data loss even when app code is correct"

requirements-completed: [SETL-01, SETL-03, NOTF-01]

# Metrics
duration: 5min
completed: 2026-03-01
---

# Phase 5 Plan 01: Schema & Notification Fixes Summary

**Surgical two-fix audit gap closure: settlements.note TEXT column persists form notes to DB, and expense push notification deep-link corrected from 404-inducing /groups/:groupId/expenses/:id to valid Expo Router route /expenses/:id**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-01T14:10:04Z
- **Completed:** 2026-03-01T14:15:00Z
- **Tasks:** 2 auto tasks + 1 checkpoint (auto-approved)
- **Files modified:** 2

## Accomplishments
- Added `note TEXT` column to `settlements` table via migration — the note field sent by `useCreateSettlement` was previously silently dropped by PostgREST on every INSERT; now persisted and visible in settlement history (SETL-01, SETL-03)
- Fixed expense push notification deep-link in `push-notify/index.ts` from `/groups/${record.group_id}/expenses/${record.id}` (404) to `/expenses/${record.id}` (valid Expo Router route) — expense notification taps now correctly navigate to expense detail screen (NOTF-01)
- No TypeScript source files modified — all four application layers (type, hook, form, history screen) already handled `note` correctly; the only gap was the missing DB column
- Settlement deep-link `/groups/${record.group_id}/settlements` left unchanged — already correct

## Task Commits

Each task was committed atomically:

1. **Task 1: Add migration to persist settlement note field** - `5916e2f` (feat)
2. **Task 2: Fix expense push notification deep-link URL** - `7759a35` (fix)

**Plan metadata:** (final docs commit — see below)

## Files Created/Modified
- `supabase/migrations/20260301000006_add_settlement_note.sql` - Adds nullable TEXT column to settlements table; no NOT NULL, no DEFAULT, matches TS type note: string | null
- `supabase/functions/push-notify/index.ts` - One-line fix: dataUrl for expense notifications changed from /groups/:groupId/expenses/:id to /expenses/:id

## Decisions Made
- `settlements.note` is nullable TEXT with no DEFAULT: NULL correctly represents "no note provided", consistent with the hook sending `note: note ?? null`
- Expo Router `(app)` route group prefix must NOT appear in deep-link URLs: the navigable path for `app/(app)/expenses/[id]/index.tsx` is `/expenses/:id` — `useNotificationDeepLink` calls `router.push(url)` verbatim with no transformation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Static check 3 ("migration does NOT contain NOT NULL") initially appeared to flag a hit — on inspection, "NOT NULL" appears only in a comment line explaining why the constraint was intentionally omitted, not in the actual SQL statement. The ALTER TABLE line correctly has no NOT NULL constraint.

## User Setup Required
Apply migration and redeploy Edge Function when ready to activate fixes:

```bash
supabase db push
supabase functions deploy push-notify
```

Then verify:
1. Settlement with a note: note text is visible in Settlement History tab
2. Expense push notification tap: navigates to expense detail screen (not 404)

## Next Phase Readiness
- SETL-01, SETL-03, NOTF-01 change from PARTIAL to SATISFIED once migration is applied and Edge Function redeployed
- Remaining v1.0 gaps: human/device verification still required for push notifications (NOTF-01/02), confetti (ENGG-02), offline sync (OFFL-01/02), FX rates (CURR-01/02), CSV export (EXPR-01)

---
## Self-Check: PASSED

- FOUND: supabase/migrations/20260301000006_add_settlement_note.sql
- FOUND: supabase/functions/push-notify/index.ts
- FOUND: .planning/phases/05-schema-notification-fixes/05-01-SUMMARY.md
- FOUND: commit 5916e2f (feat: add settlements.note migration)
- FOUND: commit 7759a35 (fix: correct expense push notification deep-link)

*Phase: 05-schema-notification-fixes*
*Completed: 2026-03-01*

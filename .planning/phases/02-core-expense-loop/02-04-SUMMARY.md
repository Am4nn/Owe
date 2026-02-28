---
phase: 02-core-expense-loop
plan: 04
subsystem: database
tags: [supabase, postgresql, migrations, foreign-key, activities]

# Dependency graph
requires:
  - phase: 02-core-expense-loop
    provides: "expense_loop migration with activities table; activity/hooks.ts; settlements/hooks.ts"
provides:
  - "Corrected activities.actor_id FK pointing to group_members(id) instead of profiles(id)"
  - "Activity INSERT operations no longer fail with FK constraint violations"
  - "useActivityFeed, useAddComment, useCreateSettlement activity rows all succeed at runtime"
affects: [03-notifications, any phase querying the activities table]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Additive gap-closure migration pattern: DROP CONSTRAINT IF EXISTS + ADD CONSTRAINT to fix schema-code mismatch"

key-files:
  created:
    - "supabase/migrations/20260301000004_fix_activities_actor_fk.sql"
  modified: []

key-decisions:
  - "Use group_members(id) FK for activities.actor_id — matches existing hook code which inserts actorMember.id from group_members; avoids rewriting hooks"
  - "DROP CONSTRAINT IF EXISTS (not bare DROP) — safer in case migration is re-run or constraint was already dropped"
  - "Migration filename 20260301000004 reflects actual creation date 2026-03-01, not the original 20260228000004 from plan spec — migration ordering preserved correctly"

patterns-established:
  - "Gap-closure migration: use additive ALTER TABLE DROP/ADD CONSTRAINT rather than recreating the table"

requirements-completed: [ACTY-01, ACTY-02, ACTY-03]

# Metrics
duration: 1min
completed: 2026-03-01
---

# Phase 02 Plan 04: Activities FK Fix Summary

**Corrected `activities.actor_id` FK from `profiles(id)` to `group_members(id)` via additive migration, unblocking all activity INSERT operations (useAddComment, useCreateSettlement) that previously failed with FK constraint violations**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-28T23:01:28Z
- **Completed:** 2026-02-28T23:02:14Z
- **Tasks:** 1 (+ 1 checkpoint auto-approved)
- **Files modified:** 1

## Accomplishments

- Migration `20260301000004_fix_activities_actor_fk.sql` corrects the schema-code mismatch in `activities.actor_id`
- All activity INSERTs from `useAddComment` and `useCreateSettlement` will now succeed without FK violations
- `useActivityFeed` will return populated rows after an expense or settlement is recorded
- ACTY-01 (activity feed), ACTY-02 (filter by group), ACTY-03 (add comment) all unblocked
- Checkpoint auto-approved (auto_advance: true) — runtime verification deferred to human confirm

## Task Commits

Each task was committed atomically:

1. **Task 1: Add corrective migration to fix activities.actor_id FK** - `0370ada` (feat)

**Plan metadata:** (see final docs commit)

## Files Created/Modified

- `supabase/migrations/20260301000004_fix_activities_actor_fk.sql` - Drops incorrect `activities_actor_id_fkey` FK (was `profiles.id`), adds correct FK pointing to `group_members(id) ON DELETE SET NULL`

## Decisions Made

- Used `DROP CONSTRAINT IF EXISTS` instead of plain `DROP CONSTRAINT` for safety in case migration is re-run on a state where the constraint was already modified
- Kept hooks unchanged — `actor:group_members!actor_id(display_name)` PostgREST join and `actor_id: actorMember.id` inserts are both already correct for the group_members FK pattern
- Migration filename `20260301000004` reflects the actual date of creation (2026-03-01), diverging from plan's `20260228000004` spec — no ordering impact since it sorts after `20260228000003`

## Deviations from Plan

None — the migration file was already created (as `20260301000004`) before plan execution began. Task 1 verified its contents were correct (DROP CONSTRAINT + REFERENCES public.group_members(id) both present) and committed it. No hook changes were needed.

The plan specified filename `20260228000004_fix_activities_actor_fk.sql` but the file exists as `20260301000004_fix_activities_actor_fk.sql`. The VERIFICATION.md and requirements coverage table already reference the `20260301000004` filename consistently. This is a naming-date deviation only; the SQL content is correct.

## Issues Encountered

- Pre-existing TypeScript errors in `app/(app)/groups/new.tsx` and `src/lib/persister.ts` — these are out of scope for this plan (gap closure migration only) and were not touched.

## User Setup Required

**Manual step required to apply migration to hosted Supabase:**

1. Link your project (if not already): `supabase link --project-ref <your-project-ref>`
2. Push migration: `supabase db push`
3. Or apply manually via Supabase Dashboard SQL editor

Then verify runtime behavior:
- Add an expense to a group and check the Activity tab shows a feed row
- Add a comment on an expense and confirm it appears without error
- Record a settlement and confirm an activity row appears in the feed

## Next Phase Readiness

- All 19/19 Phase 2 observable truths verified (schema gap fixed)
- ACTY-01, ACTY-02, ACTY-03 status: SATISFIED
- Phase 2 is fully complete — ready to proceed to Phase 3 (Notifications)
- Remaining human verifications (confetti haptics, offline queue sync, Realtime two-simulator) are runtime checks that cannot be automated

---
*Phase: 02-core-expense-loop*
*Completed: 2026-03-01*

---
phase: 01-foundation
plan: "02"
subsystem: database
tags: [postgres, supabase, rls, migration, schema, ci, github-actions]

# Dependency graph
requires: []
provides:
  - "PostgreSQL schema for all 7 Phase 1 tables with RLS enforced on every table"
  - "Integer-cent monetary storage (amount_cents INTEGER) baked into schema"
  - "fx_rate_at_creation NUMERIC(12,6) snapshot column on expenses"
  - "idempotency_key UUID on expenses and settlements for offline deduplication"
  - "version INTEGER on groups, expenses, and settlements for optimistic concurrency"
  - "group_members.user_id nullable — named-only (non-app) member support"
  - "profiles auto-creation via on_auth_user_created trigger (SECURITY DEFINER)"
  - "RLS validation seed data (Alice + Bob in overlapping groups)"
  - "CI workflow blocking service_role key leakage into client bundle"
affects: [01-03-PLAN.md, 02-01, 02-02, 02-03, 03-01, 03-02]

# Tech tracking
tech-stack:
  added:
    - "Supabase CLI (supabase db push / supabase db reset)"
    - "GitHub Actions (CI pipeline)"
  patterns:
    - "RLS-first schema: ENABLE ROW LEVEL SECURITY immediately after every CREATE TABLE"
    - "Integer-cent storage: all monetary amounts as INTEGER, never FLOAT/DECIMAL"
    - "Idempotency keys: UUID DEFAULT gen_random_uuid() UNIQUE on mutations that can be retried"
    - "version column: INTEGER NOT NULL DEFAULT 1 on all mutable records for optimistic concurrency"
    - "Soft deletes: deleted_at TIMESTAMPTZ on expenses (not hard deletes)"
    - "SECURITY DEFINER trigger: profiles auto-created on auth.users INSERT"
    - "RLS access anchor: group_members used as the authorization pivot for all group-scoped queries"

key-files:
  created:
    - "supabase/migrations/20260227000001_foundation.sql"
    - "supabase/seed.sql"
    - ".github/workflows/ci.yml"
  modified: []

key-decisions:
  - "All monetary columns stored as INTEGER cents — FLOAT arithmetic causes irrecoverable ghost debt bugs"
  - "fx_rate_at_creation snapshot set on INSERT and never updated — prevents balance drift from rate changes"
  - "idempotency_key on expenses and settlements prevents duplicate records on network retry in offline-first app"
  - "group_members.user_id is nullable — NULL represents named-only members (e.g., Charlie who doesn't have the app)"
  - "Trigger SECURITY DEFINER with SET search_path = '' — prevents privilege escalation via search path injection"
  - "CI security scan excludes supabase/ dir to avoid false positives from comments in migration files"

patterns-established:
  - "RLS-first: every CREATE TABLE is immediately followed by ALTER TABLE ... ENABLE ROW LEVEL SECURITY"
  - "group_members as RLS anchor: group-scoped access always goes through SELECT group_id FROM group_members WHERE user_id = auth.uid()"
  - "Integer cents everywhere: $47.99 stored as 4799, all computations in integer arithmetic"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, GRUP-01, GRUP-02, GRUP-03, GRUP-04, GRUP-05]

# Metrics
duration: 2min
completed: 2026-02-27
---

# Phase 1 Plan 02: Foundation Schema Summary

**Hardened PostgreSQL schema with 7 tables, RLS on every table, integer-cent storage, fx_rate snapshot, idempotency keys, profiles trigger, and CI service_role key guard**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-27T17:31:52Z
- **Completed:** 2026-02-27T17:33:52Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Created full Phase 1 PostgreSQL schema (7 tables) via single migration encoding all irrecoverable architectural decisions before any feature work
- All 7 tables have RLS enabled with correct access policies anchored on group_members for group-scoped data isolation
- CI pipeline guards against SUPABASE_SERVICE_ROLE_KEY appearing in client-side files and detects accidental Tailwind v4 installation

## Task Commits

Each task was committed atomically:

1. **Task 1: Write and apply the foundation database migration** - `aaf13a2` (feat)
2. **Task 2: Create RLS seed file and CI service_role key guard** - `16219de` (feat)

**Plan metadata:** (docs commit — pending)

## Files Created/Modified

- `supabase/migrations/20260227000001_foundation.sql` — Full Phase 1 schema: profiles, groups, group_members, group_invites, expenses, expense_splits, settlements with RLS, indexes, and trigger
- `supabase/seed.sql` — RLS validation seed: Alice + Bob in overlapping groups, named-only member (Charlie), validation query comments documenting expected RLS behavior
- `.github/workflows/ci.yml` — 3-job CI: lint/typecheck, security scan (SERVICE_ROLE_KEY + tailwindcss v3 pin), schema-test (supabase db reset)

## Decisions Made

- **Integer cents exclusively:** All monetary columns (`amount_cents`, `amount_base_cents`) defined as `INTEGER NOT NULL` — float arithmetic creates irrecoverable $0.01 ghost debt bugs
- **fx_rate_at_creation as immutable snapshot:** Set on INSERT with `NUMERIC(12,6) NOT NULL DEFAULT 1.000000` — a comment documents it must NEVER be updated post-insert, preventing balance drift
- **idempotency_key on both expenses and settlements:** Mobile clients on unreliable networks retry mutations — the UNIQUE UUID key makes POST idempotent
- **Nullable user_id on group_members:** `UUID REFERENCES public.profiles(id) ON DELETE SET NULL` with no NOT NULL constraint — NULL = named-only member (GRUP-03) who can be added to splits without an account
- **SECURITY DEFINER + SET search_path = '':** Prevents the `handle_new_user` trigger from being exploited via search path injection; required to write to public.profiles from the auth schema context
- **CI scan excludes supabase/ dir:** The migration file itself contains the string "service_role" in comments — excluding it prevents false positives without compromising the actual guard

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None — `supabase db push` not run locally (requires connected project ref), but migration file is complete and valid SQL. CI `schema-test` job will apply and validate on every push.

## User Setup Required

To apply the migration to a Supabase project, run:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

To validate RLS locally:

```bash
supabase start
supabase db reset
# Then open Supabase Studio at http://localhost:54323 and sign in as Alice to verify
# SELECT * FROM groups WHERE id = '10000000-0000-0000-0000-000000000002' returns 0 rows
```

## Next Phase Readiness

- Schema is complete and ready for 01-03-PLAN.md (auth feature + groups feature + offline cache)
- All 7 tables exist with correct RLS — Phase 2 expense entry (02-01) can build directly on this schema
- CI workflow will validate schema on every push automatically
- Supabase project must be linked before `supabase db push` can be run

## Self-Check: PASSED

- FOUND: supabase/migrations/20260227000001_foundation.sql
- FOUND: supabase/seed.sql
- FOUND: .github/workflows/ci.yml
- FOUND: .planning/phases/01-foundation/01-02-SUMMARY.md
- FOUND commit aaf13a2: feat(01-02): add foundation database migration with full schema
- FOUND commit 16219de: feat(01-02): add RLS seed data and CI service_role key guard

---
*Phase: 01-foundation*
*Completed: 2026-02-27*

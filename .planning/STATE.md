---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
last_updated: "2026-03-01T14:07:47.065Z"
progress:
  total_phases: 7
  completed_phases: 5
  total_plans: 15
  completed_plans: 13
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
last_updated: "2026-03-01T14:03:50.750Z"
progress:
  total_phases: 7
  completed_phases: 5
  total_plans: 15
  completed_plans: 13
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
last_updated: "2026-03-01T01:03:24.483Z"
progress:
  total_phases: 5
  completed_phases: 3
  total_plans: 12
  completed_plans: 12
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
last_updated: "2026-03-01T00:59:05.582Z"
progress:
  total_phases: 5
  completed_phases: 3
  total_plans: 12
  completed_plans: 12
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
last_updated: "2026-03-01T00:40:39.974Z"
progress:
  total_phases: 5
  completed_phases: 3
  total_plans: 11
  completed_plans: 11
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
last_updated: "2026-03-01T00:31:42.406Z"
progress:
  total_phases: 5
  completed_phases: 2
  total_plans: 11
  completed_plans: 10
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: phase_complete
last_updated: "2026-03-01T00:00:00.000Z"
progress:
  total_phases: 4
  completed_phases: 2
  total_plans: 12
  completed_plans: 10
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-27)

**Core value:** Users can split expenses, track shared debts, and settle up with friends without limits, ads, or paywalls — in a UI that feels like a modern bank app, not a spreadsheet.
**Current focus:** Phase 4 complete — expense activity events wired (ACTY-01, ACTY-02)

## Current Position

Phase: 4 of 4 — COMPLETE
Plan: 1 of 1 in phase 4 complete (04-01 Expense Activity Events — ACTY-01, ACTY-02 satisfied)
Status: Phase 4 COMPLETE — expense CUD mutations (create/edit/delete) now write activity rows; activity feed shows expense events automatically.
Last activity: 2026-03-01 — Completed Phase 4 Plan 01: Expense Activity Events

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 3
- Average duration: 3 min
- Total execution time: 0.2 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 4/4 | ~75 min | ~19 min |

**Recent Trend:**
- Last 5 plans: 01-01, 01-02, 01-03, 01-04
- Trend: Phase 1 complete — 4/4 plans done, verification 16/16

*Updated after each plan completion*
| Phase 01-foundation P01 | 4 | 2 tasks | 22 files |
| Phase 01-foundation P03 | 7 | 2 tasks | 13 files |
| Phase 01-foundation P04 | 1 | 2 tasks | 5 files |
| Phase 1.5-google-oauth-inserted P01 | 12 | 2 tasks | 6 files |
| Phase 02-core-expense-loop P01 | 9 | 2 tasks | 16 files |
| Phase 02-core-expense-loop P02 | 4 | 2 tasks | 8 files |
| Phase 02-core-expense-loop P03 | 7 | 2 tasks | 13 files |
| Phase 02-core-expense-loop P04 | 1 | 1 task | 1 file |
| Phase 03-engagement-layer P01 | 4 | 3 tasks | 8 files |
| Phase 03-engagement-layer P02 | 6 | 2 tasks | 10 files |
| Phase 03-engagement-layer P03 | 2 | 1 tasks | 1 files |
| Phase 04-expense-activity-events P01 | 2 | 2 tasks | 1 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Foundation]: Store all monetary amounts as INTEGER cents; use dinero.js v2 for all client arithmetic — float arithmetic causes irrecoverable $0.01 ghost debts
- [Foundation]: RLS must be enabled on every table in migration 001 — missing RLS on expense_splits or settlements leaks financial data across groups
- [Foundation]: EAS custom dev client required from day one — MMKV v4, expo-notifications, and bottom-sheet all require custom native builds unavailable in Expo Go
- [Foundation]: Pin tailwindcss@^3.4.17 — installing Tailwind v4 silently breaks NativeWind 4.x
- [Foundation]: service_role key must never appear in the mobile bundle — CI check required to scan built JS bundle
- [01-02]: fx_rate_at_creation set on INSERT and never updated — prevents balance drift from FX rate changes post-creation
- [01-02]: idempotency_key UUID UNIQUE on expenses and settlements — makes mobile POST retries safe (offline-first requirement)
- [01-02]: group_members.user_id nullable — NULL represents named-only (non-app) member per GRUP-03
- [01-02]: SECURITY DEFINER + SET search_path = '' on profiles trigger — prevents privilege escalation via search path injection
- [Phase 01-foundation]: Pin tailwindcss@^3.4.19 (3.x, not 4.x) — NativeWind 4.x uses Tailwind v3 API; v4 silently breaks className handling
- [Phase 01-foundation]: expo-sqlite localStorage polyfill for Supabase auth storage — avoids SecureStore 2048-byte limit on JWT tokens with claims
- [Phase 01-foundation]: gcTime 24h aligned with persister maxAge 24h — misalignment silently defeats OFFL-01 offline cache persistence
- [01-03]: useSignOut calls globalQueryClient.clear() on success — prevents stale user data from leaking into next user session on shared devices
- [01-03]: Supabase Storage bucket 'avatars' must be created manually in dashboard — avatar upload will fail without it (no IaC for Storage buckets in migration)
- [01-03]: Avatar upload accesses supabase directly in profile.tsx (not via hook) — one-off blob upload flow not suitable for a reusable mutation hook
- [01-04]: Security comments must not contain exact CI grep pattern strings — use natural language equivalents to avoid false-positives without modifying the scan
- [01-04]: react-native-reanimated 4.x requires react-native-worklets as explicit peer dependency — must be added together when upgrading from 3.x
- [01-04]: EAS Android dev client build with withoutCredentials:true confirms native module linking without requiring signing credentials
- [Phase 1.5-google-oauth-inserted]: makeRedirectUri() reads nexus scheme from app.json automatically — register nexus://** in Supabase Auth URL Configuration allowlist
- [Phase 1.5-google-oauth-inserted]: skipBrowserRedirect:true required in signInWithOAuth when using WebBrowser.openAuthSessionAsync — omitting causes Supabase to auto-open browser bypassing Expo flow
- [Phase 1.5-google-oauth-inserted]: CREATE OR REPLACE FUNCTION preserves on_auth_user_created trigger binding — no DROP/RECREATE needed for handle_new_user migration patch
- [02-01]: useCreateExpense mutationKey ['expenses','create'] required for Plan 02-03 offline queue — omitting key prevents Tanstack Query from matching paused mutations on resume
- [02-01]: Two-step expense insert with rollback — INSERT expense then splits; on splits failure DELETE orphaned expense to prevent ghost records
- [02-01]: computeSharesSplits last-member remainder pattern — asserts sum === totalCents invariant; prevents penny-drift in balance calculations
- [02-01]: is_direct virtual group pattern — created inline on first direct expense, filtered from dashboard via groups.filter(g => !g.is_direct)
- [02-01]: @types/jest added to tsconfig types array — fixes TS2582 in test files without affecting expo-router typed routes
- [02-02]: Exclude supabase/functions from tsconfig — Deno runtime types (Deno.serve, esm.sh) are incompatible with Expo/RN TS config
- [02-02]: useRealtimeExpenseSync returns cleanup via useEffect — supabase.removeChannel prevents channel accumulation on screen unmount
- [02-02]: Edge Function uses SUPABASE_ANON_KEY + forwarded Authorization header — RLS applies server-side, no service_role in function
- [02-03]: createExpenseMutationFn extracted as named export — required for setMutationDefaults to serialize/deserialize paused mutations across app restarts
- [02-03]: onlineManager.setEventListener with NetInfo at module scope — must be outside React component to fire before any query executes
- [02-03]: useActivityFeed two-step approach for all-groups feed — PostgREST cannot express GROUP IN (subquery) natively; fetch group_ids first, then use .in() filter
- [02-03]: expense_reactions UPSERT on conflict (expense_id, user_id) — allows emoji change without delete+insert race condition
- [02-04]: Use group_members(id) FK for activities.actor_id — matches existing hook code which inserts actorMember.id from group_members; avoids rewriting hooks
- [02-04]: DROP CONSTRAINT IF EXISTS (not bare DROP) — safer in case migration is re-run or constraint was already dropped
- [Phase 03-01]: expo-notifications plugin added to app.json plugins — required for EAS native build push notification support
- [Phase 03-01]: push-notify Edge Function uses service_role key — webhook context is server-only; anon key + RLS blocks cross-user profile reads for push dispatch
- [Phase 03-01]: pg_cron scheduling in migration wrapped in extension check DO block — avoids migration failure on environments without pg_cron enabled
- [Phase 03-02]: expo-file-system v2 uses File + Paths.cache class API — legacy writeAsStringAsync and cacheDirectory removed at runtime; use new File(Paths.cache, filename).write(content) and file.uri for sharing
- [Phase 03-02]: computeBaseCents exported as pure function (not hook) — can be called inside onSubmit event handlers without violating React rules; fxRate=1.0 identity when currencies match or rates table is empty
- [Phase 03-engagement-layer]: Defaults for missing reminderConfig: enabled=true, delay_days=3 — consistent with backend defaults
- [Phase 04-expense-activity-events]: Activity INSERT inside mutationFn body (not onSuccess) ensures offline-resumed mutations also write activity rows
- [Phase 04-expense-activity-events]: actor_id resolves to group_members.id (not auth UUID) — FK references group_members(id) per migration 20260301000004
- [Phase 04-expense-activity-events]: createExpenseMutationFn: single getUser() call at top, user.id reused for both created_by and actor lookup

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 2]: Schulman's debt simplification algorithm — RESOLVED in 02-02 via greedy algorithm (separate creditors/debtors, sort descending, emit min-payment)
- [Phase 3]: EAS Push + OneSignal token lifecycle has integration gotchas around token expiry and reinstall — dedicated research pass recommended before building push-notify chain
- [Phase 3]: Supabase Edge Function cron scheduling maturity for recurring expenses should be verified at Phase 3 planning time (v2 requirement, but affects fx-rates-cache design)
- [Supabase Link]: supabase link --project-ref <ref> and supabase db push must be run manually to apply migration to hosted project

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | Fix all 3 known bugs: commit RLS recursion migration, fix persister.ts MMKV delete to remove, fix groups/new.tsx zodResolver type mismatch | 2026-03-01 | 68c7fbd | [1-fix-all-3-known-bugs-commit-rls-recursio](.planning/quick/1-fix-all-3-known-bugs-commit-rls-recursio/) |

## Session Continuity

Last session: 2026-03-01
Stopped at: Completed Phase 3 Plan 03 — Smart Reminders UI (NOTF-03). Phase 3 engagement layer fully complete (3/3 plans). Next: Phase 4 (Polish).
Resume file: None

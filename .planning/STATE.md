---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: phase_complete
last_updated: "2026-02-28T20:30:00.000Z"
progress:
  total_phases: 4
  completed_phases: 2
  total_plans: 11
  completed_plans: 9
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-27)

**Core value:** Users can split expenses, track shared debts, and settle up with friends without limits, ads, or paywalls — in a UI that feels like a modern bank app, not a spreadsheet.
**Current focus:** Phase 2 — Core Expense Loop

## Current Position

Phase: 2 of 3 — Complete
Plan: 3 of 3 in phase 2 complete
Status: Phase 2 ALL PLANS COMPLETE — expense entry flow, balance layer, settlements, activity feed, offline queue all done.
Last activity: 2026-02-28 — Phase 2 Plan 03 executed

Progress: [█████████░] 90%

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

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 2]: Schulman's debt simplification algorithm — RESOLVED in 02-02 via greedy algorithm (separate creditors/debtors, sort descending, emit min-payment)
- [Phase 3]: EAS Push + OneSignal token lifecycle has integration gotchas around token expiry and reinstall — dedicated research pass recommended before building push-notify chain
- [Phase 3]: Supabase Edge Function cron scheduling maturity for recurring expenses should be verified at Phase 3 planning time (v2 requirement, but affects fx-rates-cache design)
- [Supabase Link]: supabase link --project-ref <ref> and supabase db push must be run manually to apply migration to hosted project

## Session Continuity

Last session: 2026-02-28
Stopped at: Completed all 3 plans in Phase 2 — full core expense loop built. Awaiting verification before Phase 3.
Resume file: None

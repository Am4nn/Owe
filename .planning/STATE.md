---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
last_updated: "2026-02-28T12:10:26.000Z"
progress:
  total_phases: 4
  completed_phases: 2
  total_plans: 11
  completed_plans: 6
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-27)

**Core value:** Users can split expenses, track shared debts, and settle up with friends without limits, ads, or paywalls — in a UI that feels like a modern bank app, not a spreadsheet.
**Current focus:** Phase 2 — Core Expense Loop

## Current Position

Phase: 2 of 3 — Not started
Plan: 0 of 3 in phase 2
Status: Phase 1.5 Google OAuth COMPLETE (user-verified working). Ready to begin Phase 2: Core Expense Loop.
Last activity: 2026-02-28 — Phase 1.5 verified complete by user

Progress: [█████░░░░░] 55%

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

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 2]: Schulman's debt simplification algorithm in Deno Edge Function has implementation nuances — consider a brief research check before building the debt-simplify Edge Function
- [Phase 3]: EAS Push + OneSignal token lifecycle has integration gotchas around token expiry and reinstall — dedicated research pass recommended before building push-notify chain
- [Phase 3]: Supabase Edge Function cron scheduling maturity for recurring expenses should be verified at Phase 3 planning time (v2 requirement, but affects fx-rates-cache design)
- [Supabase Link]: supabase link --project-ref <ref> and supabase db push must be run manually to apply migration to hosted project

## Session Continuity

Last session: 2026-02-28
Stopped at: Phase 1.5 Google OAuth verified complete. Phase 2 (Core Expense Loop) is next — needs `/plan 2` or `/execute 2`.
Resume file: None

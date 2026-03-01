# Phase 01: Foundation — Plan Index

**Phase goal:** A deployed, authenticated app shell with a hardened database schema and offline-first architecture — every critical pitfall from research is addressed before any feature work begins

**Requirements covered:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, GRUP-01, GRUP-02, GRUP-03, GRUP-04, GRUP-05, OFFL-01, UIUX-01

---

## Wave Structure

```
Wave 1 (parallel):
  01-01  Project scaffold
  01-02  Database schema

Wave 2 (depends on Wave 1):
  01-03  Auth and groups
```

Plans 01-01 and 01-02 have no file overlap and can execute in parallel. Plan 01-03 requires the scaffold (01-01) for the project structure and lib files, and requires the schema (01-02) for the database tables to exist.

---

## Plans

### 01-01: Project Scaffold
**File:** `01-01-PLAN.md`
**Wave:** 1
**Autonomous:** yes
**Requirements:** UIUX-01, OFFL-01 (persister wiring)

Bootstraps Expo SDK 55 with all Phase 1 dependencies. Creates EAS dev client build profile, configures NativeWind v4 with Tailwind v3 (pinned to `^3.4.17`), wires MMKV-backed React Query persister to `PersistQueryClientProvider`, sets up Expo Router route groups `(auth)` and `(app)`, establishes project file structure (`src/lib/`, `src/features/`, `src/components/`), and forces dark mode via `colorScheme.set('dark')` in the Zustand UI store.

Critical pitfalls addressed: Tailwind v4 breakage (pin), MMKV-in-Expo-Go failure (EAS dev client first), gcTime cache eviction (set to 24h).

**Key files:**
- `tailwind.config.js` — nativewind/preset + neon color palette
- `src/lib/supabase.ts` — expo-sqlite/localStorage auth adapter
- `src/lib/persister.ts` — MMKV async persister
- `src/lib/queryClient.ts` — QueryClient with gcTime: 24h
- `app/_layout.tsx` — PersistQueryClientProvider root

---

### 01-02: Database Schema
**File:** `01-02-PLAN.md`
**Wave:** 1
**Autonomous:** yes
**Requirements:** AUTH-01 through AUTH-05, GRUP-01 through GRUP-05 (structural foundation for all)

Creates `supabase/migrations/20260227000001_foundation.sql` with all 7 tables (profiles, groups, group_members, group_invites, expenses, expense_splits, settlements). Every table has `ENABLE ROW LEVEL SECURITY` immediately after `CREATE TABLE`. All monetary amounts are `INTEGER` cents. Expenses include `fx_rate_at_creation NUMERIC(12,6)`, `idempotency_key UUID UNIQUE`, and `version INTEGER`. `group_members.user_id` is nullable (named-only members). `profiles` auto-creates via PostgreSQL trigger. Creates `supabase/seed.sql` for RLS testing and a CI workflow that fails the build if `SERVICE_ROLE_KEY` appears in any client file.

Critical pitfalls addressed: float currency, RLS omission, FX rate drift, idempotency, service_role key exposure.

**Key files:**
- `supabase/migrations/20260227000001_foundation.sql` — full schema + RLS
- `supabase/seed.sql` — RLS test data
- `.github/workflows/ci.yml` — service_role key guard + Tailwind v3 check

---

### 01-03: Auth and Groups
**File:** `01-03-PLAN.md`
**Wave:** 2
**Depends on:** 01-01, 01-02
**Autonomous:** yes
**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, GRUP-01, GRUP-02, GRUP-03, GRUP-04, GRUP-05, OFFL-01

Implements the full auth feature slice (`useSession`, `useSignIn`, `useSignUp`, `useSignOut`, `useProfile`, `useUpdateProfile`) and the groups feature slice (`useGroups`, `useCreateGroup`, `useGroup`, `useLeaveGroup`, `useInviteMember`, `useAddNamedMember`). Wires session-based routing via `Stack.Protected`. Creates all screens: sign-in, sign-up, profile (with avatar upload), groups list, create group (including named-only members), group detail (with invite + leave). OFFL-01 offline cache is automatic via `useGroups` query living in the MMKV-persisted React Query cache.

**Key files:**
- `src/features/auth/hooks.ts` — all auth hooks
- `src/features/groups/hooks.ts` — all group hooks
- `app/_layout.tsx` — updated with Stack.Protected session guard
- `app/(app)/groups/[id]/index.tsx` — group detail with leave action

---

## Execution Order

```
Step 1: Run 01-01 and 01-02 in parallel
Step 2: After both complete, run 01-03
```

To execute: `/gsd:execute-phase 01-foundation`

After execution, Phase 1 success criteria are met when:
1. User can create an account, sign in, and remain signed in across app restarts
2. User can sign out from any screen and is redirected to sign-in
3. User can create a profile with display name and avatar photo
4. User can create a group, invite members by email, add named-only members, view all groups, and leave a group
5. App launches in dark mode with neon accent colors; cached group data is visible with no connectivity; EAS dev client runs MMKV without errors

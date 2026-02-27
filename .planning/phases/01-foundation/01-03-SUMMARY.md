---
phase: 01-foundation
plan: "03"
subsystem: auth
tags: [supabase, react-query, expo-router, react-hook-form, zod, mmkv, expo-image-picker]

# Dependency graph
requires:
  - phase: 01-01
    provides: PersistQueryClientProvider with MMKV persister, supabase.ts with expo-sqlite localStorage, queryClient with 24h gcTime, Button/Input UI components, ui store
  - phase: 01-02
    provides: profiles table, groups table, group_members table (nullable user_id), group_invites table, handle_new_user trigger, RLS policies

provides:
  - useSession hook — reads persisted session from expo-sqlite localStorage, subscribes to onAuthStateChange
  - useSignIn / useSignUp / useSignOut hooks — all Supabase auth mutations
  - useProfile / useUpdateProfile hooks — profiles CRUD
  - useGroups hook — group list query with staleTime 30s; cached to MMKV (OFFL-01)
  - useGroup / useCreateGroup / useAddNamedMember / useInviteMember / useLeaveGroup hooks
  - Stack.Protected session-based routing in app/_layout.tsx
  - Sign-in and sign-up screens with react-hook-form + zod validation
  - Profile screen with expo-image-picker avatar upload to Supabase Storage
  - Dashboard screen with groups list FlatList and FAB
  - Group creation screen with named-only member support
  - Group detail screen with member list, invite by email, leave group

affects: [02-expenses, 02-settlements, 03-polish]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Feature slice: hooks + types collocated in src/features/{feature}/ — screens never import supabase directly (except profile avatar upload which is intentional per plan)"
    - "Stack.Protected guard={!!session} / guard={!session} for auth-gated routing"
    - "useSignOut calls globalQueryClient.clear() — prevents stale data leakage between user sessions"
    - "useGroups staleTime: 30s, gcTime: 24h (inherited) — MMKV persister serves groups offline with no code changes"
    - "Named-only (non-app) members: user_id = null in group_members — zero-friction expense tracking for non-users"

key-files:
  created:
    - src/features/auth/types.ts
    - src/features/auth/hooks.ts
    - src/features/groups/types.ts
    - src/features/groups/hooks.ts
    - app/(app)/profile.tsx
    - app/(app)/groups/index.tsx
    - app/(app)/groups/new.tsx
    - app/(app)/groups/[id]/index.tsx
  modified:
    - app/_layout.tsx
    - app/(auth)/sign-in.tsx
    - app/(auth)/sign-up.tsx
    - app/(app)/_layout.tsx
    - app/(app)/index.tsx

key-decisions:
  - "Avatar upload calls supabase directly in profile.tsx (not via hook) — image picker + Storage upload is a one-off operation not suitable for a reusable mutation hook at this stage"
  - "useSignOut clears globalQueryClient cache — prevents user A data from leaking into user B session on shared devices"
  - "OFFL-01 satisfied by gcTime/staleTime alignment with persister maxAge — no offline-specific code needed in useGroups"

patterns-established:
  - "Feature slice: src/features/{feature}/hooks.ts + types.ts — screens only import from hooks"
  - "Auth routing: Stack.Protected in root layout driven by useSession (single source of truth)"
  - "Named-only members: user_id nullable in group_members, displayed with 'Not on Owe' label"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, GRUP-01, GRUP-02, GRUP-03, GRUP-04, GRUP-05, OFFL-01]

# Metrics
duration: 7min
completed: 2026-02-27
---

# Phase 1 Plan 03: Auth and Groups Summary

**Supabase auth flows (sign up/in/out + session persistence), profile management with avatar upload, and group CRUD with named-only member support — all wired to MMKV offline cache via React Query**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-27T17:48:14Z
- **Completed:** 2026-02-27T17:55:17Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments

- Full auth feature slice: 6 hooks (useSession, useSignIn, useSignUp, useSignOut, useProfile, useUpdateProfile) covering AUTH-01 through AUTH-05
- Session-based routing via Stack.Protected in app/_layout.tsx — no auth logic in screens
- Full groups feature slice: 6 hooks (useGroups, useGroup, useCreateGroup, useAddNamedMember, useInviteMember, useLeaveGroup) covering GRUP-01 through GRUP-05
- Named-only (non-app) members via user_id = null (GRUP-03) — users can track debts with friends who don't have the app
- OFFL-01 satisfied automatically: useGroups ['groups'] query is persisted to MMKV by PersistQueryClientProvider with gcTime 24h alignment — groups list visible offline with zero offline-specific code

## Task Commits

Each task was committed atomically:

1. **Task 1: Auth feature hooks, types, and app/_layout.tsx auth routing** - `b3d1fae` (feat)
2. **Task 2: Groups feature hooks, types, and all group screens** - `940c486` (feat)

## Files Created/Modified

- `src/features/auth/types.ts` - Profile, SignInInput, SignUpInput, UpdateProfileInput TypeScript interfaces
- `src/features/auth/hooks.ts` - useSession, useSignIn, useSignUp, useSignOut, useProfile, useUpdateProfile hooks
- `src/features/groups/types.ts` - Group, GroupMember, CreateGroupInput, AddNamedMemberInput, InviteMemberInput TypeScript interfaces
- `src/features/groups/hooks.ts` - useGroups, useGroup, useCreateGroup, useAddNamedMember, useInviteMember, useLeaveGroup hooks
- `app/_layout.tsx` - Updated with RootNavigator using Stack.Protected session-based routing
- `app/(auth)/sign-in.tsx` - Full sign-in screen with react-hook-form + zod (replaces placeholder)
- `app/(auth)/sign-up.tsx` - Full sign-up screen with react-hook-form + zod (replaces placeholder)
- `app/(app)/_layout.tsx` - Updated with dark header styling
- `app/(app)/index.tsx` - Dashboard with groups FlatList, Profile header button, and FAB to create group
- `app/(app)/profile.tsx` - Profile screen with avatar picker (expo-image-picker), display name form, sign-out button
- `app/(app)/groups/index.tsx` - Alternate groups list screen
- `app/(app)/groups/new.tsx` - Group creation form with named-member addition UI
- `app/(app)/groups/[id]/index.tsx` - Group detail with member list, invite by email, leave group

## Decisions Made

- Avatar upload in profile.tsx accesses supabase directly (not via hook). This is an intentional exception to the "screens import hooks only" pattern — the image picker flow requires coordination between expo-image-picker, native fetch for blob, and Storage upload that is purpose-built and not reused anywhere.
- useSignOut calls `globalQueryClient.clear()` on success. This is a security pattern: stale user data must not persist after sign-out, especially on shared/family devices.
- OFFL-01 required no offline-specific code. The React Query `gcTime: 24h` (set in Plan 01-01 queryClient.ts) aligned with the MMKV persister `maxAge: 24h` in the root layout is sufficient. The `['groups']` query key is automatically persisted and served from MMKV when offline.
- Auth storage adapter is expo-sqlite localStorage polyfill (set in Plan 01-01 supabase.ts) — bypasses the 2048-byte SecureStore limit that would truncate JWTs with claims.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

Avatar uploads require a Supabase Storage bucket named `avatars`. This bucket must be created manually in the Supabase dashboard:
1. Go to Storage in the Supabase dashboard
2. Create a new bucket named `avatars`
3. Set it to public (for public URL access via `getPublicUrl`)
4. The bucket does not need RLS since access is controlled by the upload path (`{user_id}/avatar.{ext}`)

No other external configuration is required for auth and groups — Supabase anon key and URL are already in `.env` from Plan 01-01.

## Next Phase Readiness

- Auth and group foundation is complete. Phase 2 (Expenses) can build directly on the auth hooks (useSession for user context) and group hooks (useGroup for member data in expense splits).
- The `['groups']` and `['groups', groupId]` React Query keys established here will be invalidated by Phase 2 expense mutations as needed.
- Named-only member support (GRUP-03) is in place — Phase 2 expense splits can reference GroupMember.user_id === null for non-app participants.

---
*Phase: 01-foundation*
*Completed: 2026-02-27*

## Self-Check: PASSED

All 13 files verified present. Both task commits (b3d1fae, 940c486) verified in git history.

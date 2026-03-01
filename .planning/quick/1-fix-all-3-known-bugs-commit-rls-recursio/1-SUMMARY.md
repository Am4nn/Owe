---
phase: quick-1
plan: "01"
subsystem: infrastructure
tags: [bugfix, rls, mmkv, react-hook-form, supabase]
key-files:
  modified:
    - src/lib/persister.ts
    - app/(app)/groups/new.tsx
  created:
    - supabase/migrations/20260301020556_fix_rls_recursion.sql
decisions:
  - "SECURITY DEFINER helper functions get_auth_user_groups / get_auth_user_admin_groups break RLS recursion without changing policy semantics"
  - "storage.remove(key) is the correct MMKV v4 API — storage.delete was removed in v4"
  - "zodResolver type inference requires defaultValues on useForm, not .default() on the zod schema"
metrics:
  duration: "< 5 min"
  completed: "2026-03-01"
  tasks: 2
  files: 3
---

# Quick Task 1: Fix All 3 Known Bugs + Commit RLS Migration Summary

**One-liner:** Three targeted fixes committed — SECURITY DEFINER RLS helpers eliminate infinite recursion, MMKV v4 remove() API corrects cache eviction crash, and zodResolver defaultValues pattern resolves form type mismatch.

## Tasks Completed

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Fix MMKV persister.ts — storage.delete to storage.remove | 68c7fbd | src/lib/persister.ts |
| 2 | Commit all three fixes in a single commit | 68c7fbd | supabase/migrations/20260301020556_fix_rls_recursion.sql, src/lib/persister.ts, app/(app)/groups/new.tsx |

## Changes Made

### 1. RLS Recursion Fix (`supabase/migrations/20260301020556_fix_rls_recursion.sql`)

The migration introduces two `SECURITY DEFINER` helper functions:
- `public.get_auth_user_groups()` — returns group_ids for the authenticated user
- `public.get_auth_user_admin_groups()` — returns group_ids where the user is an admin

These functions bypass RLS when querying `group_members`, breaking the infinite recursion that occurred when RLS policies on `group_members`, `groups`, and `profiles` referenced each other cyclically. Updated policies on all three tables to use the helper functions instead of direct subqueries.

### 2. MMKV v4 API Fix (`src/lib/persister.ts`)

Changed `storage.delete(key)` to `storage.remove(key)` on line 35. The `delete` method was removed in MMKV v4; the correct method is `remove`. This prevented runtime crashes on cache eviction in native builds.

### 3. zodResolver Type Mismatch Fix (`app/(app)/groups/new.tsx`)

The file already had the correct fix applied in the working tree:
- Schema: `z.string().length(3, 'Use a 3-letter currency code')` — no `.default('USD')`
- `useForm` defaultValues: `{ name: '', base_currency: 'USD' }`

This pattern is correct — zodResolver infers TypeScript types from the schema, and `.default()` changes the inferred type to `string | undefined`, causing a type mismatch. Setting defaults on `useForm` instead keeps the schema types clean.

## Verification

- `grep "storage.remove" src/lib/persister.ts` matches line 35
- `grep "storage.delete" src/lib/persister.ts` returns no output
- `git show --stat HEAD` includes all three files
- `git status` shows no untracked migration file

## Deviations from Plan

None — plan executed exactly as written. The groups/new.tsx fix was already applied in the working tree; no edit was needed, only staging for commit.

## Self-Check: PASSED

- `src/lib/persister.ts` — modified, committed in 68c7fbd
- `app/(app)/groups/new.tsx` — modified, committed in 68c7fbd
- `supabase/migrations/20260301020556_fix_rls_recursion.sql` — created, committed in 68c7fbd
- Commit 68c7fbd confirmed in git log

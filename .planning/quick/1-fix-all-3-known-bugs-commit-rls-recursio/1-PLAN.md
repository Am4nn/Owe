---
phase: quick-1
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/persister.ts
  - app/(app)/groups/new.tsx
  - supabase/migrations/20260301020556_fix_rls_recursion.sql
autonomous: true
requirements: []

must_haves:
  truths:
    - "RLS recursion migration is committed and tracked in git"
    - "MMKV removeItem calls storage.remove(key), not storage.delete(key)"
    - "groups/new.tsx zodResolver type mismatch fix is committed"
  artifacts:
    - path: "supabase/migrations/20260301020556_fix_rls_recursion.sql"
      provides: "RLS recursion fix via SECURITY DEFINER helper functions"
    - path: "src/lib/persister.ts"
      provides: "Correct MMKV v4 removeItem using storage.remove()"
    - path: "app/(app)/groups/new.tsx"
      provides: "Group creation form with correct zodResolver defaultValues"
  key_links:
    - from: "src/lib/persister.ts"
      to: "MMKV v4 API"
      via: "storage.remove(key) in removeItem"
      pattern: "storage\\.remove"
---

<objective>
Fix three known bugs that are either untracked or uncommitted in the working tree, and commit them cleanly.

Purpose: All three bugs are regressions or known deferred items. The RLS recursion causes infinite policy loops when loading groups. The MMKV `delete` vs `remove` mismatch causes a runtime crash on cache eviction. The zodResolver type mismatch in groups/new.tsx causes form submission failures when base_currency has no zod default.

Output: All three fixes committed to git in a single focused commit.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix MMKV persister.ts — storage.delete to storage.remove</name>
  <files>src/lib/persister.ts</files>
  <action>
    On line 35 of src/lib/persister.ts, change:
      storage.delete(key)
    to:
      storage.remove(key)

    This is the MMKV v4 API change. The `delete` method was removed in v4; the correct method is `remove`. No other changes to this file.
  </action>
  <verify>
    <automated>grep -n "storage\.remove(key)" "src/lib/persister.ts" && echo "PASS: correct method used" || echo "FAIL: method not updated"</automated>
  </verify>
  <done>Line 35 reads `storage.remove(key)` — no reference to `storage.delete` remains in the native MMKV branch.</done>
</task>

<task type="auto">
  <name>Task 2: Commit all three fixes in a single commit</name>
  <files>
    supabase/migrations/20260301020556_fix_rls_recursion.sql,
    src/lib/persister.ts,
    app/(app)/groups/new.tsx
  </files>
  <action>
    Stage and commit all three fixed files:

    1. Stage the RLS migration (untracked):
       git add supabase/migrations/20260301020556_fix_rls_recursion.sql

    2. Stage the persister fix (just edited):
       git add src/lib/persister.ts

    3. Stage the groups/new.tsx fix (already modified in working tree):
       git add "app/(app)/groups/new.tsx"

    4. Commit with message:
       fix: resolve RLS recursion, MMKV v4 remove API, and zodResolver type mismatch

       - Add migration 20260301020556: replace recursive RLS policies on
         group_members, groups, and profiles with SECURITY DEFINER helper
         functions (get_auth_user_groups, get_auth_user_admin_groups) to
         prevent infinite recursion
       - persister.ts: change storage.delete(key) to storage.remove(key)
         for MMKV v4 API compatibility (delete was removed in v4)
       - groups/new.tsx: remove .default('USD') from zod schema (caused
         zodResolver type mismatch); add name: '' and base_currency: 'USD'
         to useForm defaultValues instead

    Do NOT use --no-verify. Run git status after to confirm clean tree.
  </action>
  <verify>
    <automated>git log --oneline -1 && git status --short</automated>
  </verify>
  <done>
    `git log --oneline -1` shows the fix commit.
    `git status --short` shows no modified or untracked files for the three paths above.
  </done>
</task>

</tasks>

<verification>
After both tasks:
- `grep "storage\.remove" src/lib/persister.ts` returns a match
- `grep "storage\.delete" src/lib/persister.ts` returns no match
- `git show --stat HEAD` includes all three files
- `git status` shows clean working tree (no untracked migration file)
</verification>

<success_criteria>
- RLS recursion migration committed and tracked in git history
- MMKV persister uses storage.remove(key) — no storage.delete reference remains
- groups/new.tsx zodResolver fix committed (no .default('USD') in schema, defaultValues has both name and base_currency)
- Single clean commit containing all three fixes
</success_criteria>

<output>
No SUMMARY.md needed for quick fixes. Verify with `git log --oneline -3` after completion.
</output>

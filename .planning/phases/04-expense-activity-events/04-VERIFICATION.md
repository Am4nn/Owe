---
phase: 04-expense-activity-events
verified: 2026-03-01T14:45:00Z
status: passed
score: 5/5 must-haves verified
re_verification: false
human_verification:
  - test: "Add an expense in a live group and observe the activity feed"
    expected: "An 'expense_added' event row appears in the activity feed, showing the actor's name and the action"
    why_human: "Requires a live Supabase instance with real group membership to verify the activity row is written and displayed"
  - test: "Edit an existing expense and observe the activity feed"
    expected: "An 'expense_edited' event row appears in the activity feed immediately after the edit completes"
    why_human: "Requires live Supabase; cannot verify DB write and feed refresh without running the app"
  - test: "Delete an expense and observe the activity feed"
    expected: "An 'expense_deleted' event row appears in the activity feed; the deleted expense is removed from the expense list"
    why_human: "Requires live Supabase and a device/simulator to confirm both soft-delete and activity write succeed together"
  - test: "Add an expense while offline; restore connectivity and check the activity feed"
    expected: "After reconnecting, the expense syncs AND an 'expense_added' activity row appears (not just the expense)"
    why_human: "OFFL-02 offline queue re-runs mutationFn on reconnect — this test verifies the activity INSERT is inside mutationFn (not onSuccess). Cannot simulate offline queue replay in automated tests without a Supabase mock."
---

# Phase 4: Expense Activity Events Verification Report

**Phase Goal:** Wire all expense CUD mutations to write rows into the activities table so the activity feed shows expense_added, expense_edited, and expense_deleted events — closing the ACTY-01 FAIL gate from the v1.0 audit
**Verified:** 2026-03-01T14:45:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #   | Truth | Status | Evidence |
| --- | ----- | ------ | -------- |
| 1   | Adding an expense in a group produces an activity row with action_type 'expense_added' that appears in the activity feed | VERIFIED | `createExpenseMutationFn` lines 117-136: actor resolution via `group_members` + `activities` INSERT with `action_type: 'expense_added'` and `expense_id: expense.id` before `return expense`. |
| 2   | Editing an expense produces an activity row with action_type 'expense_edited' that appears in the activity feed | VERIFIED | `useUpdateExpense.mutationFn` lines 209-230: actor resolution via `group_members` + `activities` INSERT with `action_type: 'expense_edited'` and `expense_id: input.id` before `return updatedExpense`. |
| 3   | Deleting an expense produces an activity row with action_type 'expense_deleted' that appears in the activity feed | VERIFIED | `useDeleteExpense.mutationFn` lines 261-279: reuses existing `userId` from `getCurrentUserId()`, resolves `actorMember.id` via `group_members`, inserts `action_type: 'expense_deleted'` and `expense_id: id` before `return { id, group_id }`. |
| 4   | All activity rows have actor_id referencing group_members(id) — not profiles(id) — with a valid group_id, so group-scoped feed filtering returns them | VERIFIED | All three mutations: `actor_id: actorMember.id` where `actorMember` is the result of `.from('group_members').select('id').eq('group_id', ...).eq('user_id', ...).single()`. Correct FK target per migration 20260301000004. `group_id` passed in every INSERT. |
| 5   | The activity feed invalidates automatically after create/edit/delete so the feed screen refreshes without a manual reload | VERIFIED | All three `onSuccess` handlers (lines 152-157, 234-239, 283-288) call `qc.invalidateQueries({ queryKey: ['activity', input.group_id] })` and `qc.invalidateQueries({ queryKey: ['activity', 'all'] })`. Matches the `useActivityFeed` query key pattern `['activity', groupId ?? 'all']` (activity/hooks.ts line 19). |

**Score:** 5/5 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `src/features/expenses/hooks.ts` | Modified — createExpenseMutationFn, useUpdateExpense, useDeleteExpense each insert into activities | VERIFIED | File exists, 292 lines. Three `activities` INSERT blocks at lines 128, 222, 271. Substantive implementation, not a stub. Committed via e10e835 and c1bb023. |

---

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| `createExpenseMutationFn` | `activities` INSERT | Inside function body (not onSuccess) — required for OFFL-02 offline queue | WIRED | INSERT at lines 127-136, inside the standalone function body before `return expense as Expense` (line 138). `onSuccess` in `useCreateExpense` only handles cache invalidation. |
| `actor_id` field | `group_members(id)` — NOT auth user UUID | `.from('group_members').select('id').eq('group_id', ...).eq('user_id', ...).single()` | WIRED | All three mutations use `actorMember.id` as `actor_id`. Lines 132, 226, 275. Correct per migration 20260301000004 FK: `REFERENCES public.group_members(id)`. |
| `useCreateExpense.onSuccess` | `['activity', group_id]` and `['activity', 'all']` invalidation | `qc.invalidateQueries` | WIRED | Lines 155-156: both keys invalidated. |
| `useUpdateExpense.onSuccess` | `['activity', group_id]` and `['activity', 'all']` invalidation | `qc.invalidateQueries` | WIRED | Lines 238-239: both keys invalidated. |
| `useDeleteExpense.onSuccess` | `['activity', group_id]` and `['activity', 'all']` invalidation | `qc.invalidateQueries` | WIRED | Lines 287-288: both keys invalidated. |
| `createExpenseMutationFn` | Single `supabase.auth.getUser()` call | Reused for both `created_by: user.id` and actor resolution | WIRED | Line 75: single `getUser()` at top of function. `user.id` reused at line 94 (`created_by`) and line 122 (`.eq('user_id', user.id)`). `getCurrentUserId()` helper is NOT called within this function. |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ----------- | ----------- | ------ | -------- |
| ACTY-01 | 04-01-PLAN.md | User can view a chronological activity feed of all expense actions in their groups | SATISFIED | `createExpenseMutationFn`, `useUpdateExpense`, `useDeleteExpense` all write activity rows. `useActivityFeed` already queries the `activities` table. The feed will now return expense events where it previously returned none. |
| ACTY-02 | 04-01-PLAN.md | User can filter the activity feed by group | SATISFIED | Every activity INSERT passes `group_id` as a field. `useActivityFeed` with `groupId` argument filters via `.eq('group_id', groupId)`. Group-scoped filtering now works for expense events because every row carries a valid `group_id`. |

**Orphaned requirements check:** REQUIREMENTS.md traceability table assigns ACTY-01 and ACTY-02 to Phase 4 (lines 172-173). Both are declared in the PLAN frontmatter `requirements` field. No orphaned requirements.

**Requirements marked [x] in REQUIREMENTS.md:** Both ACTY-01 and ACTY-02 show `[x]` (lines 56-57), consistent with Phase 4 completion.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| None | — | — | — | No TODOs, FIXMEs, placeholder returns, or swallowed errors found in `src/features/expenses/hooks.ts`. All three `activityError` values are thrown on failure (lines 136, 230, 279). |

---

### Structural Verification Notes

**TypeScript compilation:** `npx tsc --noEmit` exited with no output and no errors — zero TypeScript errors across the codebase.

**createExpenseMutationFn consolidation verified:**
- `getCurrentUserId()` helper is NOT called inside `createExpenseMutationFn` (line 253 is inside `useDeleteExpense.mutationFn`)
- `supabase.auth.getUser()` is called once at line 75 inside `createExpenseMutationFn`
- `user.id` is reused for `created_by: user.id` (line 94) and `.eq('user_id', user.id)` (line 122)

**Activity INSERT placement (OFFL-02 compliance):**
- `createExpenseMutationFn`: INSERT at lines 127-136, before `return expense as Expense` at line 138. Correct — inside the standalone exported function body. The offline queue re-runs this function on reconnect.
- `useUpdateExpense` and `useDeleteExpense`: INSERTs inside their inline `mutationFn` closures before their respective returns. Correct — these do not participate in the offline queue.

**All three action_type values confirmed:**
- `'expense_added'` — line 130
- `'expense_edited'` — line 224
- `'expense_deleted'` — line 273

All three match the CHECK constraint from migration 20260228000003: `action_type IN ('expense_added', 'expense_edited', 'expense_deleted', 'settlement_recorded', 'comment_added', 'reaction_added')`.

**Commits verified:** Both documented commits exist in git history:
- `e10e835` — feat(04-01): add expense_added activity INSERT to createExpenseMutationFn (+28 lines, 1 deletion)
- `c1bb023` — feat(04-01): add expense_edited and expense_deleted activity INSERTs (+48 lines)

---

### Human Verification Required

The following items cannot be verified programmatically — they require a running app with a live Supabase instance:

#### 1. expense_added activity row visible in feed

**Test:** Sign in, open a group, add a new expense, then navigate to the Activity tab.
**Expected:** The activity feed shows a new "expense_added" event attributed to the current user, without requiring a manual refresh or navigation away.
**Why human:** Requires live Supabase, real group membership rows, and a device/simulator to observe the feed update.

#### 2. expense_edited activity row visible in feed

**Test:** Open an existing expense, edit the amount or description, save. Navigate to the Activity tab.
**Expected:** A new "expense_edited" event appears in the feed immediately after saving.
**Why human:** Same as above — requires live DB and UI interaction.

#### 3. expense_deleted activity row visible in feed

**Test:** Swipe-to-delete an expense or use the delete action. Navigate to the Activity tab.
**Expected:** A new "expense_deleted" event appears. The expense is gone from the expense list (soft-deleted).
**Why human:** Requires live DB; confirms both the soft-delete and activity INSERT succeed atomically in sequence.

#### 4. Offline expense sync produces activity row (OFFL-02 contract)

**Test:** Enable airplane mode, add an expense, re-enable connectivity. Check the activity feed.
**Expected:** The expense syncs AND an "expense_added" activity row appears. If only the expense appears without the activity row, the INSERT was incorrectly placed in `onSuccess`.
**Why human:** Requires device with real offline simulation. The offline queue replay behavior (`resumePausedMutations`) cannot be meaningfully unit-tested without a Supabase mock client (not established in this project).

---

### Gaps Summary

No gaps. All five observable truths are verified against the actual code. All artifacts exist, are substantive (not stubs), and are correctly wired. All key links are confirmed. Both requirement IDs (ACTY-01, ACTY-02) are fully satisfied. TypeScript compiles cleanly. Four items are flagged for human verification as they require a live app with real Supabase — this is consistent with how all hook behavior has been validated throughout Phases 1-3 per the project's validation architecture.

---

_Verified: 2026-03-01T14:45:00Z_
_Verifier: Claude (gsd-verifier)_

# Phase 4: Expense Activity Events - Research

**Researched:** 2026-03-01
**Domain:** Supabase mutation side-effects / TanStack Query mutation hooks / React Native
**Confidence:** HIGH

---

## Summary

Phase 4 is a targeted code-only change: wire three existing expense mutation functions in `src/features/expenses/hooks.ts` to also INSERT into the `activities` table after each successful database operation. No new libraries, no new schema migrations, no new screens. The pattern is already established in `src/features/settlements/hooks.ts` (lines 41-63) and `src/features/activity/hooks.ts` (useAddComment, lines 91-106) — copy it verbatim.

The `activities` table already has `CHECK (action_type IN ('expense_added', 'expense_edited', 'expense_deleted', ...))`, so the three action_type strings are pre-authorized. The FK on `actor_id` was corrected in migration `20260301000004_fix_activities_actor_fk.sql` to reference `group_members(id)`, so inserting `actorMember.id` (a `group_members.id`) is the correct value. All three mutations have access to `group_id` and `expense.id` at the time of INSERT — no input shape changes required.

The only nuance is `createExpenseMutationFn`: it is a standalone exported function (required for OFFL-02 offline queue serialization). The activity INSERT must happen inside this standalone function after the splits insert succeeds, not in the `onSuccess` callback, because `onSuccess` does not run for paused/offline mutations that are resumed later via `resumePausedMutations`. For `useUpdateExpense` and `useDeleteExpense` there is no offline queue concern; they use inline `mutationFn` closures and the activity INSERT can go at the end of the closure body before the return.

**Primary recommendation:** Copy the actor-id resolution + activity INSERT block verbatim from `settlements/hooks.ts` lines 41-63. Insert it after the main DB operation succeeds in each of the three mutation functions. No new dependencies, no schema changes, no new files.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ACTY-01 | User can view a chronological activity feed of all expense actions in their groups | Closing the gap: `useActivityFeed` already queries the `activities` table; the feed is empty for expense events because `createExpenseMutationFn`, `useUpdateExpense`, and `useDeleteExpense` never insert into it. Adding the INSERT unblocks ACTY-01. |
| ACTY-02 | User can filter the activity feed by group | Group-scoped filtering already works in `useActivityFeed` via `.eq('group_id', groupId)`. It returns empty for expense events for the same reason. Fix ACTY-01 and ACTY-02 is automatically satisfied — every activity row carries `group_id`. |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | Already installed | Supabase client for DB inserts | Used by every existing hook |
| @tanstack/react-query | Already installed | Mutation hooks and cache invalidation | Used by every existing hook |

### Supporting

No additional libraries required. This phase introduces no new dependencies.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inserting activity row inside mutationFn | Inserting in onSuccess callback | onSuccess does not fire for offline-resumed mutations (paused mutations resume via resumePausedMutations, which re-runs mutationFn only). For `createExpenseMutationFn`, activity INSERT MUST be inside the function body, not onSuccess. For update/delete (no offline queue), either location works — inside mutationFn is cleaner and consistent. |
| Three separate Supabase round-trips (expense + activity) | Postgres transaction via RPC | A DB function wrapping both INSERTs would be atomic. For this scope (gap closure), the sequential approach already used by settlements/hooks.ts is acceptable; RPC would require a new migration and is overkill. |

**Installation:** None required.

---

## Architecture Patterns

### Recommended Project Structure

No structural changes. All edits are in one file:

```
src/
└── features/
    └── expenses/
        └── hooks.ts    ← sole file to edit
```

### Pattern 1: Actor ID Resolution + Activity INSERT (Settlement Reference Pattern)

**What:** Before inserting the activity row, resolve the current user's `group_members.id` for the relevant group. This is the correct FK value for `activities.actor_id` (which references `group_members(id)` after migration 20260301000004).

**When to use:** Every time an activity row needs to be inserted by the currently authenticated user.

**Source:** `src/features/settlements/hooks.ts` lines 41-63 (verified from codebase).

```typescript
// Source: src/features/settlements/hooks.ts lines 41-63
// Step N: Resolve actor_id (current user's member_id in this group)
const { data: { user } } = await supabase.auth.getUser()
if (!user) throw new Error('Not authenticated')

const { data: actorMember, error: actorError } = await supabase
  .from('group_members')
  .select('id')
  .eq('group_id', group_id)
  .eq('user_id', user.id)
  .single()
if (actorError) throw actorError

// Step N+1: Insert activity row
const { error: activityError } = await supabase
  .from('activities')
  .insert({
    action_type: 'settlement_recorded', // ← swap for expense_added / expense_edited / expense_deleted
    group_id,
    actor_id: actorMember.id,
    expense_id: null,                   // ← use expense.id for expense events
    metadata: { amount_cents },         // ← use { description } or null per event
  })
if (activityError) throw activityError
```

### Pattern 2: createExpenseMutationFn — activity INSERT goes INSIDE the standalone function

**What:** `createExpenseMutationFn` is a named export used by `setMutationDefaults` for OFFL-02. The offline queue serializes the function reference and re-invokes `mutationFn` when connectivity returns. `onSuccess` is a React Query lifecycle hook — it does NOT re-fire when a paused mutation is resumed. Therefore the activity INSERT must live inside the function body.

**Where to insert:** After Step 2 (splits INSERT succeeds, before `return expense`).

```typescript
// Inside createExpenseMutationFn, after splits INSERT succeeds:

// Step 3: Resolve actor_id
const { data: { user } } = await supabase.auth.getUser()
if (!user) throw new Error('Not authenticated')

const { data: actorMember, error: actorError } = await supabase
  .from('group_members')
  .select('id')
  .eq('group_id', group_id)
  .eq('user_id', user.id)
  .single()
if (actorError) throw actorError

// Step 4: Insert activity row
const { error: activityError } = await supabase
  .from('activities')
  .insert({
    action_type: 'expense_added',
    group_id,
    actor_id: actorMember.id,
    expense_id: expense.id,
    metadata: { description },
  })
if (activityError) throw activityError

return expense as Expense
```

### Pattern 3: useUpdateExpense — activity INSERT inside inline mutationFn closure

**What:** `useUpdateExpense` has an inline `mutationFn` closure with full access to `input.group_id` and `updatedExpense.id`. Actor resolution is identical. No offline queue concern for update.

**Where to insert:** After splits replacement succeeds, before `return updatedExpense`.

```typescript
// Inside useUpdateExpense mutationFn, after splits insert (or after expense update if no splits):

const { data: { user } } = await supabase.auth.getUser()
if (!user) throw new Error('Not authenticated')

const { data: actorMember, error: actorError } = await supabase
  .from('group_members')
  .select('id')
  .eq('group_id', id_from_input)   // input.id is expense id; group_id is input.group_id
  .eq('user_id', user.id)
  .single()
if (actorError) throw actorError

const { error: activityError } = await supabase
  .from('activities')
  .insert({
    action_type: 'expense_edited',
    group_id: input.group_id,
    actor_id: actorMember.id,
    expense_id: input.id,
    metadata: null,
  })
if (activityError) throw activityError
```

### Pattern 4: useDeleteExpense — activity INSERT inside inline mutationFn closure

**What:** `useDeleteExpense` already calls `getCurrentUserId()` to enforce ownership on the soft-delete. The `user.id` from `supabase.auth.getUser()` is available; re-use the same call to resolve the `group_members` row. The function receives `{ id, group_id }` as input.

```typescript
// Inside useDeleteExpense mutationFn, after soft-delete succeeds:
// Note: userId is already fetched earlier — integrate into a single getUser() call

const { data: actorMember, error: actorError } = await supabase
  .from('group_members')
  .select('id')
  .eq('group_id', group_id)
  .eq('user_id', userId)  // userId already resolved above
  .single()
if (actorError) throw actorError

const { error: activityError } = await supabase
  .from('activities')
  .insert({
    action_type: 'expense_deleted',
    group_id,
    actor_id: actorMember.id,
    expense_id: id,
    metadata: null,
  })
if (activityError) throw activityError
```

### Pattern 5: Cache Invalidation

After each mutation, the existing `onSuccess` already invalidates `['expenses', group_id]` and `['balances']`. Add `['activity', group_id]` and `['activity', 'all']` to keep the feed current. The settlement hook invalidates `['activity', input.group_id]` — follow that pattern.

```typescript
onSuccess: (_data, input) => {
  qc.invalidateQueries({ queryKey: ['expenses', input.group_id] })
  qc.invalidateQueries({ queryKey: ['balances'] })
  qc.invalidateQueries({ queryKey: ['activity', input.group_id] })  // add this
  qc.invalidateQueries({ queryKey: ['activity', 'all'] })            // add this
}
```

### Anti-Patterns to Avoid

- **Do not insert activity row in onSuccess for createExpenseMutationFn:** `onSuccess` is not re-fired when a paused offline mutation is resumed. The activity INSERT would be silently skipped for expenses added while offline.
- **Do not use `auth.uid()` directly in the Supabase INSERT payload:** The RLS policy enforces `actor_id` must belong to a member of the group; using `group_members.id` (not `auth.uid()`) is what the schema and FK expect.
- **Do not add a new migration:** The `activities` table schema already supports all three action types in its CHECK constraint. No schema changes needed.
- **Do not swallow `activityError`:** The settlements/hooks.ts pattern throws on `activityError`. Be consistent — if the activity INSERT fails, throw. This is a diagnostic aid; a failed activity write does not corrupt financial data but should surface as an error rather than silently disappearing.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Actor ID lookup | Custom user-to-member resolver utility | Inline `supabase.from('group_members').select('id').eq('group_id', ...).eq('user_id', ...).single()` | Already the established pattern; no shared utility exists or is needed for three call sites |
| Activity INSERT abstraction | Shared `insertActivity(...)` helper function | Inline INSERT in each mutation | Three call sites with slightly different payloads; the overhead of abstraction exceeds its value at this scale |

**Key insight:** The right abstraction here is copy-paste fidelity with the reference pattern, not new utility functions. Consistency across `settlements/hooks.ts` and `activity/hooks.ts` is more valuable than DRY in this case.

---

## Common Pitfalls

### Pitfall 1: Activity INSERT in onSuccess Instead of mutationFn for createExpenseMutationFn

**What goes wrong:** Activity rows are skipped for offline-created expenses. The expense is synced on reconnect but no `expense_added` activity appears in the feed.

**Why it happens:** `resumePausedMutations()` re-executes the stored `mutationFn` but does not fire `onSuccess` hooks. Only the function body itself runs on resume.

**How to avoid:** Place the activity INSERT inside `createExpenseMutationFn` function body, after the splits INSERT succeeds.

**Warning signs:** Activity feed shows `settlement_recorded` entries but never `expense_added` after offline-then-online scenario.

### Pitfall 2: Forgetting to Update `onSuccess` Cache Invalidation

**What goes wrong:** After an expense is added/edited/deleted, the activity feed screen shows stale data until the user navigates away and back.

**Why it happens:** The existing `onSuccess` handlers do not invalidate `['activity', ...]` query keys.

**How to avoid:** Add `qc.invalidateQueries({ queryKey: ['activity', input.group_id] })` to all three `onSuccess` handlers. The `useActivityFeed` hook uses `['activity', groupId ?? 'all']` as its query key.

**Warning signs:** Expense added, but activity feed does not update.

### Pitfall 3: group_id Not Available in useDeleteExpense for Actor Resolution

**What goes wrong:** Developer tries to use `getCurrentUserId()` helper but then needs `group_id` for the `group_members` lookup; `useDeleteExpense.mutationFn` already receives `{ id, group_id }` as input — `group_id` is available.

**Why it happens:** The existing code only uses `userId` for the soft-delete ownership check and does not inspect `group_id`. Easy to overlook.

**How to avoid:** Confirm `group_id` is in the destructured input. It is: `async ({ id, group_id }: { id: string; group_id: string })`.

### Pitfall 4: Double getUser() Call in createExpenseMutationFn

**What goes wrong:** `createExpenseMutationFn` already calls `getCurrentUserId()` inside the `created_by` assignment (line 91 of hooks.ts). Adding another `supabase.auth.getUser()` for actor resolution means two auth round-trips.

**Why it happens:** `getCurrentUserId()` only returns the `user.id` string, not the full `user` object. The actor resolution needs `user.id` to query `group_members`.

**How to avoid:** Replace the `getCurrentUserId()` helper call for `created_by` with a `supabase.auth.getUser()` call that captures the full user object, then reuse `user.id` for both `created_by` and the actor resolution query. One round-trip, not two.

---

## Code Examples

### Full Actor Resolution + Activity INSERT (settlement reference, verified from codebase)

```typescript
// Source: src/features/settlements/hooks.ts lines 41-63
// Step 2: Resolve actor_id (current user's member_id in this group)
const { data: { user } } = await supabase.auth.getUser()
if (!user) throw new Error('Not authenticated')

const { data: actorMember, error: actorError } = await supabase
  .from('group_members')
  .select('id')
  .eq('group_id', group_id)
  .eq('user_id', user.id)
  .single()
if (actorError) throw actorError

// Step 3: Insert activity row
const { error: activityError } = await supabase
  .from('activities')
  .insert({
    action_type: 'settlement_recorded',
    group_id,
    actor_id: actorMember.id,
    expense_id: null,
    metadata: { amount_cents },
  })
if (activityError) throw activityError
```

### Activities Table CHECK Constraint (verified from migration)

```sql
-- Source: supabase/migrations/20260228000003_expense_loop.sql lines 13-19
action_type TEXT NOT NULL CHECK (action_type IN (
  'expense_added',
  'expense_edited',
  'expense_deleted',
  'settlement_recorded',
  'comment_added',
  'reaction_added'
))
```

### Activities actor_id FK (verified from migration 04)

```sql
-- Source: supabase/migrations/20260301000004_fix_activities_actor_fk.sql
ALTER TABLE public.activities
  ADD CONSTRAINT activities_actor_id_fkey
    FOREIGN KEY (actor_id)
    REFERENCES public.group_members(id)
    ON DELETE SET NULL;
```

### useActivityFeed Query Key Pattern (verified from codebase)

```typescript
// Source: src/features/activity/hooks.ts line 19
queryKey: ['activity', groupId ?? 'all'],
```

Both `['activity', group_id]` and `['activity', 'all']` must be invalidated in onSuccess handlers.

---

## Key Questions Answered

### Q1: What is the exact actor ID resolution pattern in settlements/hooks.ts?

```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) throw new Error('Not authenticated')
const { data: actorMember, error: actorError } = await supabase
  .from('group_members')
  .select('id')
  .eq('group_id', group_id)
  .eq('user_id', user.id)
  .single()
if (actorError) throw actorError
// Then: actor_id: actorMember.id
```

Confidence: HIGH — directly read from source file.

### Q2: What data does each activity INSERT need?

| Field | expense_added | expense_edited | expense_deleted |
|-------|--------------|----------------|-----------------|
| action_type | 'expense_added' | 'expense_edited' | 'expense_deleted' |
| group_id | input.group_id | input.group_id | input.group_id (from mutationFn arg) |
| actor_id | actorMember.id | actorMember.id | actorMember.id |
| expense_id | expense.id (from INSERT result) | input.id | input.id |
| metadata | `{ description }` or null | null | null |

Confidence: HIGH — schema verified from migration, pattern verified from settlements/hooks.ts and useAddComment.

### Q3: Does createExpenseMutationFn have access to current user's ID and group_id?

Yes to both. `group_id` comes from `input.group_id` (destructured at top of function). User ID is available by calling `supabase.auth.getUser()` — the function already does this inline for `created_by` assignment (via `getCurrentUserId()`). Consolidate into one `getUser()` call at the top of the function.

Confidence: HIGH — directly verified from src/features/expenses/hooks.ts lines 57-114.

### Q4: How does useUpdateExpense/useDeleteExpense get the current user's group_member ID?

`useUpdateExpense` receives `UpdateExpenseInput` which includes `group_id` (verified from `src/features/expenses/types.ts` line 56). `useDeleteExpense` receives `{ id: string; group_id: string }` (verified from hooks.ts line 200). Both have `group_id` in the mutation input. The actor lookup is `group_members.select('id').eq('group_id', ...).eq('user_id', user.id).single()`.

Confidence: HIGH — verified from source.

### Q5: Are there any edge cases (direct expenses where is_direct=true)?

Direct expenses (EXPN-09) still belong to a `group_id` — the "direct" group is a virtual group created inline on first direct expense (`is_direct` flag set to true on the group, filtered from dashboard via `!g.is_direct`). The `group_id` is always valid. The actor is still a member of that virtual group. The activity INSERT pattern is identical. No special case required.

Confidence: HIGH — `is_direct` pattern documented in STATE.md decisions (02-01): "is_direct virtual group pattern — created inline on first direct expense". The expense hooks already handle both paths uniformly via `group_id`.

### Q6: Should the activity INSERT be inside the same mutation transaction or separate?

No Postgres-level transaction is available from the JS client without using an RPC/stored procedure. The existing pattern (settlements, comments) uses sequential INSERTs with error propagation — if the activity INSERT fails, throw the error. This is consistent with the codebase. The financial data (expense row + splits) is written first; if the activity INSERT fails, the expense is still committed but the feed event is lost. This is the same tradeoff accepted for settlement events. No change in approach needed.

Confidence: HIGH — verified from settlements/hooks.ts pattern and the absence of any RPC usage in the codebase.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| activities.actor_id FK → profiles(id) | activities.actor_id FK → group_members(id) | Migration 20260301000004 | Actor resolution must use group_members.id, NOT user UUID |
| createExpenseMutationFn (no activity) | createExpenseMutationFn (+ activity INSERT) | Phase 4 (this phase) | ACTY-01 closes |

**Key historical context:**

- Migration `20260228000003_expense_loop.sql` originally declared `actor_id UUID REFERENCES public.profiles(id)` — this was wrong from day one.
- Migration `20260301000004_fix_activities_actor_fk.sql` corrected the FK to `group_members(id)`.
- The hooks in `settlements/hooks.ts` and `activity/hooks.ts` (useAddComment) already correctly insert `actorMember.id` (a `group_members.id`).
- The expense hooks were never updated to insert activity rows at all — that is the gap this phase closes.

---

## Open Questions

1. **Should activity insertion failure be treated as fatal or non-fatal?**
   - What we know: settlements/hooks.ts throws on `activityError`. useAddComment does NOT check the return value of the activity insert (line 101-107 in activity/hooks.ts — `await` without capturing error).
   - What's unclear: Is inconsistency intentional? The comment case may have been omitted by accident.
   - Recommendation: Follow the settlements/hooks.ts pattern and throw on `activityError` for consistency. This is the safer choice for diagnosability.

2. **Should metadata carry the expense description for expense_added events?**
   - What we know: `metadata: { amount_cents }` is used for settlement_recorded. `metadata: null` is used for comment_added.
   - What's unclear: The activity feed UI does not currently render metadata content (it shows action_type + actor display_name). Including `description` in metadata is useful for future feed formatting but has no visible effect today.
   - Recommendation: Include `{ description }` in metadata for `expense_added`, `null` for `expense_edited` and `expense_deleted`. Low-stakes decision; can be changed later without a migration.

---

## Validation Architecture

> nyquist_validation is not set in .planning/config.json — this section is included for completeness but validation is optional per project config.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | jest-expo (jest + @testing-library/react-native) |
| Config file | None at root (jest key is null in package.json — jest-expo provides default config) |
| Quick run command | `npx jest src/features/expenses/splits.test.ts` |
| Full suite command | `npx jest` |

### Existing Test Infrastructure

One test file exists: `src/features/expenses/splits.test.ts` — covers pure split math functions. No hook tests exist.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Notes |
|--------|----------|-----------|-------|
| ACTY-01 | expense_added/edited/deleted rows appear in activities table | Integration (requires live Supabase) | No automated unit test feasible without mocking supabase client; manual verification via activity feed screen |
| ACTY-02 | Activity feed group filter returns only expense events for that group | Integration | Same as above |

### Wave 0 Gaps

No new test files needed for this phase. The mutations are Supabase integration code; unit-testing them requires a Supabase mock client (not established in this project). Manual verification (run app, add/edit/delete expense, confirm activity feed) is the validation path. This is consistent with how all other hook behavior has been verified throughout Phases 1-3.

---

## Sources

### Primary (HIGH confidence)

- `src/features/settlements/hooks.ts` — exact actor resolution + activity INSERT pattern (lines 41-63)
- `src/features/activity/hooks.ts` — useAddComment pattern (lines 91-106), useActivityFeed query key pattern (line 19)
- `src/features/expenses/hooks.ts` — all three mutation functions analyzed in full
- `src/features/expenses/types.ts` — CreateExpenseInput, UpdateExpenseInput interfaces verified
- `supabase/migrations/20260228000003_expense_loop.sql` — activities table CHECK constraint, confirmed valid action_types
- `supabase/migrations/20260301000004_fix_activities_actor_fk.sql` — actor_id FK target confirmed as group_members(id)
- `src/features/activity/types.ts` — ActivityItem.action_type union verified

### Secondary (MEDIUM confidence)

- `.planning/phases/02-core-expense-loop/02-03-SUMMARY.md` — patterns-established section confirms actor resolution pattern and settlement activity INSERT pattern
- `.planning/STATE.md` decisions — is_direct virtual group pattern, offline mutation queue design, actor_id FK decision

### Tertiary (LOW confidence)

None.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries; all existing infrastructure verified from source
- Architecture: HIGH — pattern copied directly from reference implementation in same codebase
- Pitfalls: HIGH — identified from code analysis of existing functions and the offline mutation queue design documented in STATE.md

**Research date:** 2026-03-01
**Valid until:** Stable — no external dependencies; only internal code patterns

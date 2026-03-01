# Phase 5: Schema & Notification Fixes - Research

**Researched:** 2026-03-01
**Domain:** PostgreSQL DDL migrations (ALTER TABLE ADD COLUMN), Supabase Edge Function deep-link URL routing, Expo Router navigation
**Confidence:** HIGH

## Summary

Phase 5 closes two independent integration gaps discovered during the v1.0 audit. Gap 1 is a silent data-loss bug: the `settlements` table DDL (migration `20260227000001_foundation.sql`) has no `note` column, so PostgREST silently ignores the `note` field on INSERT even though `useCreateSettlement` sends it and the `Settlement` TypeScript type declares it. Gap 2 is a broken deep-link: `push-notify/index.ts` line 50 sets `dataUrl = /groups/${record.group_id}/expenses/${record.id}`, but the Expo Router expense screen lives at `app/(app)/expenses/[id]/index.tsx` — route `/expenses/[id]` — making every expense push notification tap navigate to a 404.

Both fixes are surgical with zero risk of breaking existing functionality. Fix 1 is a single `ALTER TABLE public.settlements ADD COLUMN note TEXT;` migration — nullable by default in PostgreSQL (no DEFAULT needed), backwards-compatible with all existing rows. Fix 2 is a one-line string change in an Edge Function. No client-side code changes are needed for either fix because the Settlement type, the hook insert, the form UI, and the settlement history rendering already handle the `note` field correctly end-to-end — they were just blocked by the missing column.

**Primary recommendation:** Write one migration file for the column addition and one Edge Function patch. No new dependencies, no new components, no schema redesign required.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SETL-01 | User can record a settlement payment between two members (cash or external) | Settlement form, hook, and type already implement `note` — gap is only the missing DB column. Adding the column makes the existing insert succeed. |
| SETL-03 | User can view settlement history for a group | `settlements.tsx` already renders `item.note` (lines 44-48) conditionally. Once the column exists and data is persisted, history display works with zero code changes. |
| NOTF-01 | User receives a push notification when someone adds an expense to a shared group | Push notification fires correctly (Phase 3). The only failure is the deep-link URL — tapping the notification navigates to a 404. Fixing the URL to `/expenses/${record.id}` closes this requirement. |
</phase_requirements>

---

## Finding 1: settlements.note — Full Gap Analysis

### What the DDL contains (VERIFIED — foundation migration read directly)

`supabase/migrations/20260227000001_foundation.sql` lines 306-335:

```sql
CREATE TABLE public.settlements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id        UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  payer_id        UUID NOT NULL REFERENCES public.group_members(id),
  payee_id        UUID NOT NULL REFERENCES public.group_members(id),
  amount_cents    INTEGER NOT NULL CHECK (amount_cents > 0),
  currency        TEXT NOT NULL,
  idempotency_key UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  version         INTEGER NOT NULL DEFAULT 1,
  settled_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT different_payer_payee CHECK (payer_id <> payee_id)
);
```

**Confirmed: no `note` column.**

### What the application layer expects (VERIFIED — all source files read)

**TypeScript type** (`src/features/settlements/types.ts` line 8):
```typescript
note: string | null
```

**Hook insert** (`src/features/settlements/hooks.ts` lines 27-36):
```typescript
.insert({
  group_id,
  payer_id: payer_member_id,
  payee_id: payee_member_id,
  amount_cents,
  currency,
  note: note ?? null,        // <-- PostgREST silently ignores this field
  idempotency_key,
  settled_at: new Date().toISOString(),
})
```

**Form** (`app/(app)/settlement/new.tsx` lines 33, 172-179):
- `const [note, setNote] = useState('')` — state managed
- TextInput with 200-char limit, multiline — fully implemented, no changes needed

**Settlement history screen** (`app/(app)/groups/[id]/settlements.tsx` lines 44-48):
```tsx
{item.note ? (
  <Text className="text-white/50 text-sm mt-0.5" numberOfLines={2}>
    {item.note}
  </Text>
) : null}
```
**Confirmed: note is already conditionally rendered.** No changes needed to the history screen.

### Fix required

One new migration file:
```sql
ALTER TABLE public.settlements ADD COLUMN note TEXT;
```

**Should this be NULL or NOT NULL?**
- PostgreSQL `TEXT` without a constraint is nullable by default. No `DEFAULT` needed.
- Existing rows will have `NULL` — correct, they have no note.
- The TypeScript type `note: string | null` matches exactly.
- The hook sends `note: note ?? null` which sends `null` when not provided — correct.
- Pattern consistent with existing nullable TEXT columns in the schema: `profiles.avatar_url TEXT`, `expenses.category TEXT`, `expenses.deleted_at TIMESTAMPTZ` — all nullable with no DEFAULT.

**Verdict: `ADD COLUMN note TEXT` with no DEFAULT, no NOT NULL constraint.**

---

## Finding 2: push-notify deep-link URL — Full Gap Analysis

### What the Edge Function sends (VERIFIED — full file read)

`supabase/functions/push-notify/index.ts` line 50:
```typescript
dataUrl = `/groups/${record.group_id}/expenses/${record.id}`
```

This is sent as `data: { url: dataUrl }` in the Expo push message (line 98).

### What the deep-link handler does with it (VERIFIED — hooks.ts read)

`src/features/notifications/hooks.ts` — `useNotificationDeepLink` (lines 85-107):
```typescript
const url = response?.notification?.request?.content?.data?.url
if (url && typeof url === 'string') {
  router.push(url as never)
}
```

The handler uses `router.push(url)` **directly** — no prefix is added, no path transformation occurs. The URL from the push payload is used verbatim.

### What the actual Expo Router route is (VERIFIED — glob of app directory)

File: `app/(app)/expenses/[id]/index.tsx`

In Expo Router, the `(app)` segment is a route group (parentheses indicate a group, not a path segment). The navigable URL is `/expenses/[id]` — not `/groups/:groupId/expenses/:id`.

**The correct `dataUrl` for the expense screen is:** `/expenses/${record.id}`

### What the settlement notification sends (already correct)

Line 62: `dataUrl = /groups/${record.group_id}/settlements`

The settlements screen is at `app/(app)/groups/[id]/settlements.tsx` → route `/groups/[id]/settlements`. This is already correct. No change needed for settlement notifications.

### Fix required

Change line 50 in `supabase/functions/push-notify/index.ts`:
```typescript
// Before (broken)
dataUrl = `/groups/${record.group_id}/expenses/${record.id}`

// After (correct)
dataUrl = `/expenses/${record.id}`
```

---

## Finding 3: Migration Naming Convention (VERIFIED — all migration files listed)

Existing migration filenames:
```
20260227000001_foundation.sql
20260228000002_google_oauth.sql
20260228000003_expense_loop.sql
20260301000004_fix_activities_actor_fk.sql
20260301000005_engagement_layer.sql
20260301020556_fix_rls_recursion.sql
```

**Pattern:** `YYYYMMDDHHMMSS_snake_case_description.sql`

Most migrations use `YYYYMMDD000000_name.sql` (zero time component). The exception is `20260301020556_fix_rls_recursion.sql` which used the actual timestamp from `supabase migration new`. Both formats are valid for Supabase — timestamps just need to be monotonically increasing.

**For Phase 5:** Use date `20260301` (today) with a sequence number that comes after `000005`. Options:
- `20260301000006_add_settlement_note.sql` — keeps zero-time pattern, safe sequence
- Or use actual `supabase migration new add_settlement_note` which generates real timestamp

The zero-time pattern (`000006`) is used by 5 of 6 existing migrations — follow that convention.

---

## Finding 4: Is the settlements table already deployed? (VERIFIED — migration ordering confirmed)

Migration `20260227000001_foundation.sql` was the first migration (Phase 1). It creates the `settlements` table. All subsequent migrations reference tables defined in it. The settlements table is definitely deployed to the hosted Supabase project.

The `note` column fix must be applied via a **new migration file** (`ALTER TABLE`) — the foundation migration must not be modified. Modifying an already-applied migration would cause `supabase db push` to fail or produce inconsistent state.

---

## Architecture Patterns

### Standard Stack (no new dependencies)

| Component | Version | Purpose |
|-----------|---------|---------|
| Supabase CLI | existing | `supabase migration new` + `supabase db push` |
| PostgreSQL (Supabase) | 15 | `ALTER TABLE ADD COLUMN` DDL |
| Expo Router | existing | `/expenses/[id]` route |
| Deno Edge Functions | existing | push-notify/index.ts edit |

No new npm packages, no new Expo modules, no schema redesign.

### Pattern: ALTER TABLE ADD COLUMN (nullable)

```sql
-- Migration: 20260301000006_add_settlement_note.sql
-- Phase 5: Add note column to settlements (was silently dropped — no column existed)

ALTER TABLE public.settlements ADD COLUMN note TEXT;
```

- No `DEFAULT` — PostgreSQL fills existing rows with `NULL` implicitly
- No `NOT NULL` — matches TypeScript type `note: string | null`
- No index needed — note is display-only, never filtered
- No RLS change — existing `members_can_read_settlements` and `members_can_insert_settlements` policies cover the new column automatically

### Pattern: Edge Function string patch

The push-notify Edge Function change is a one-line string replacement. No Deno imports change, no environment variables change, no logic change. The fix is:

```typescript
// Line 50 — change FROM:
dataUrl = `/groups/${record.group_id}/expenses/${record.id}`
// TO:
dataUrl = `/expenses/${record.id}`
```

Deploy with: `supabase functions deploy push-notify`

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Backfilling note for old rows | Custom script | Leave as NULL | No old rows have notes — they were silently dropped. NULL is correct. |
| URL transformation in client | Client URL rewrite middleware | Fix the source (Edge Function) | Deep-link URL is authoritative at the source. Transforming on receipt would be fragile. |
| Versioned migration with rollback | Manual rollback logic | `ALTER TABLE ... DROP COLUMN` only if needed | Supabase migrations are run-once forward. Rollback is manual anyway. |

---

## Common Pitfalls

### Pitfall 1: Editing an already-applied migration
**What goes wrong:** Developer modifies `20260227000001_foundation.sql` to add the note column. `supabase db push` detects the migration was already applied and skips it. The column is never added.
**Why it happens:** Supabase tracks applied migrations by filename hash in `supabase_migrations.schema_migrations`.
**How to avoid:** Always create a new migration file for schema changes to a deployed database.
**Warning signs:** `supabase db push` says "No new migrations to apply" but the column still doesn't exist.

### Pitfall 2: Adding NOT NULL without a DEFAULT
**What goes wrong:** `ALTER TABLE public.settlements ADD COLUMN note TEXT NOT NULL;` fails immediately on a table with existing rows because NULL is not allowed.
**Why it happens:** PostgreSQL validates NOT NULL constraints against all existing rows on ALTER.
**How to avoid:** Use nullable TEXT (no constraint). The application already handles nulls correctly.

### Pitfall 3: Forgetting to redeploy the Edge Function
**What goes wrong:** Developer edits `push-notify/index.ts` locally but doesn't run `supabase functions deploy push-notify`. The live function continues sending the broken URL.
**Why it happens:** Supabase Edge Functions are deployed separately from migrations.
**How to avoid:** The plan task for the function fix must include the deploy command.

### Pitfall 4: Confusing route group `(app)` with a URL path segment
**What goes wrong:** Developer tries to navigate to `/(app)/expenses/[id]` and gets a 404.
**Why it happens:** Expo Router route groups (parenthesised) are organizational — they don't appear in the URL.
**How to avoid:** The correct URL is `/expenses/[id]`. Verified by the existing file structure.

### Pitfall 5: Breaking settlement notification deep-link (already correct)
**What goes wrong:** Developer also changes line 62 (`/groups/${record.group_id}/settlements`) thinking it needs the same fix.
**Why it happens:** The pattern looks similar but the settlements screen IS at `app/(app)/groups/[id]/settlements.tsx` → `/groups/[id]/settlements`.
**How to avoid:** Only change line 50 (expenses). Leave line 62 (settlements) unchanged.

---

## Code Examples

### Migration file (complete, ready to use)

```sql
-- Migration: 20260301000006_add_settlement_note.sql
-- Phase 5: Schema & Notification Fixes
-- Gap: settlements table had no note column — note field was silently dropped by PostgREST.
-- Fix: Add nullable TEXT column. Existing rows get NULL. No application code changes needed.

ALTER TABLE public.settlements ADD COLUMN note TEXT;
```

### Edge Function fix (line 50 only)

```typescript
// push-notify/index.ts — change line 50
// BEFORE (broken — navigates to 404, route doesn't exist):
dataUrl = `/groups/${record.group_id}/expenses/${record.id}`

// AFTER (correct — Expo Router route is /expenses/[id]):
dataUrl = `/expenses/${record.id}`
```

### Verify the expense route (reference)

```
app/(app)/expenses/[id]/index.tsx
                ^^^^^
                This is a route group — (app) does NOT appear in the URL.
                Navigable URL: /expenses/[id]
```

### Deploy commands

```bash
# Apply migration to hosted Supabase project
supabase db push

# Redeploy the Edge Function
supabase functions deploy push-notify
```

---

## Open Questions

1. **Is there a CONTEXT.md constraining this phase?**
   - What we know: No CONTEXT.md exists in `.planning/phases/05-schema-notification-fixes/` (confirmed by GSD init output).
   - What's unclear: Nothing — no prior discussion phase means no locked decisions to honor.
   - Recommendation: Proceed with the fixes as described. Both are unambiguous.

2. **Should `note` have a length constraint (e.g., CHECK (char_length(note) <= 200))?**
   - What we know: The form enforces `maxLength={200}` client-side (new.tsx line 174). The TypeScript type has no constraint.
   - What's unclear: Whether a DB-level CHECK is warranted for defense-in-depth.
   - Recommendation: Keep consistent with `expenses.category TEXT` (no length constraint at DB level). Client validation is sufficient. Keeping the migration minimal reduces risk.

3. **Do any other screens need to be updated to surface `note`?**
   - What we know: `settlements.tsx` already renders `item.note` (confirmed). `new.tsx` form already collects it. `hooks.ts` already inserts it.
   - What's unclear: Nothing — the gap is purely the missing DB column. Once the column exists, the full note round-trip works.
   - Recommendation: No additional screen changes required for Phase 5.

---

## Validation Architecture

> `workflow.nyquist_validation` is not present in `.planning/config.json` — skipping this section.

---

## Sources

### Primary (HIGH confidence)

- **Direct file read** — `supabase/migrations/20260227000001_foundation.sql` — confirmed no `note` column in settlements DDL (lines 306-335)
- **Direct file read** — `src/features/settlements/hooks.ts` — confirmed `note: note ?? null` in insert (line 33)
- **Direct file read** — `src/features/settlements/types.ts` — confirmed `note: string | null` in Settlement interface (line 8)
- **Direct file read** — `app/(app)/settlement/new.tsx` — confirmed note TextInput and state (lines 33, 168-179)
- **Direct file read** — `app/(app)/groups/[id]/settlements.tsx` — confirmed `item.note` conditional render (lines 44-48)
- **Direct file read** — `supabase/functions/push-notify/index.ts` — confirmed broken URL line 50 (`/groups/${record.group_id}/expenses/${record.id}`) and correct settlement URL line 62
- **Direct file read** — `src/features/notifications/hooks.ts` — confirmed `router.push(url)` used verbatim, no URL prefix added
- **Glob of app/(app)/expenses/** — confirmed `app/(app)/expenses/[id]/index.tsx` exists → route `/expenses/[id]`
- **Glob of supabase/migrations/** — confirmed all 6 migration filenames, naming convention `YYYYMMDD000000_name.sql`

### Secondary (MEDIUM confidence)

- PostgreSQL documentation (training data) — `ALTER TABLE ADD COLUMN note TEXT` without NOT NULL makes column nullable, existing rows get NULL implicitly. Standard DDL behavior, HIGH confidence.
- Expo Router documentation (training data) — Route groups `(app)` in parentheses are organizational and do not appear in navigable URLs. Confirmed by actual file structure.

---

## Metadata

**Confidence breakdown:**
- Schema gap (missing note column): HIGH — directly confirmed by reading foundation migration DDL
- Application layer readiness (no code changes needed): HIGH — all four layers (type, hook, form, history screen) already handle note correctly
- Deep-link URL bug: HIGH — directly confirmed by reading push-notify source and Expo Router file structure
- Migration naming convention: HIGH — all 6 existing migrations examined
- Settlement deep-link (already correct, leave unchanged): HIGH — route path confirmed by file structure

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (stable — no third-party API dependencies, pure internal code fix)

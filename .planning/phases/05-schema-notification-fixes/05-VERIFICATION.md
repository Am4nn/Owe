---
phase: 05-schema-notification-fixes
verified: 2026-03-01T00:00:00Z
status: human_needed
score: 4/4 automated must-haves verified
human_verification:
  - test: "Settlement note round-trip — form to history screen"
    expected: "After entering a note on the settlement form and submitting, the note text appears below the payment line in Settlement History for that group"
    why_human: "Requires migration to be applied (supabase db push) and a real INSERT to flow through PostgREST to confirm the column is present and the select('*') round-trips the note back to the UI"
  - test: "Expense push notification deep-link navigation"
    expected: "Tapping an expense push notification on a real device opens the expense detail screen (/expenses/[id]) — not a 404 or blank screen"
    why_human: "Push notifications require physical devices or a simulator with push entitlements plus a redeployed Edge Function (supabase functions deploy push-notify); cannot verify via static analysis"
---

# Phase 5: Schema & Notification Fixes Verification Report

**Phase Goal:** Persist the settlement note field (currently silently dropped) and fix the push notification deep-link URL so tapping an expense notification opens the correct screen
**Verified:** 2026-03-01
**Status:** human_needed (all automated checks pass; 2 runtime flows need device verification)
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A note entered on the settlement form is saved to the settlements table (not silently dropped) | VERIFIED (automated) | Migration `20260301000006_add_settlement_note.sql` line 12: `ALTER TABLE public.settlements ADD COLUMN note TEXT;` — nullable TEXT, no NOT NULL, no DEFAULT. Hook `useCreateSettlement` already sends `note: note ?? null` in the INSERT. Column existence is the only gap that was missing. |
| 2 | Settlement history displays the saved note when one was provided | VERIFIED (automated) | `app/(app)/groups/[id]/settlements.tsx` lines 44-48 conditionally renders `{item.note}`. `useSettlementHistory` uses `select('*')` which will include the note column once the migration is applied. No code changes were needed. |
| 3 | Tapping an expense push notification opens /expenses/[id] — not a 404 | VERIFIED (automated) | `supabase/functions/push-notify/index.ts` line 50: `dataUrl = \`/expenses/${record.id}\`` — the broken `/groups/${record.group_id}/expenses/${record.id}` pattern is completely absent from the file. `useNotificationDeepLink` in `src/features/notifications/hooks.ts` calls `router.push(url)` verbatim, so the corrected URL will navigate correctly. |
| 4 | Settlement push notifications continue to deep-link correctly (unchanged) | VERIFIED (automated) | `supabase/functions/push-notify/index.ts` line 62: `dataUrl = \`/groups/${record.group_id}/settlements\`` — settlement deep-link is present and unmodified. Expense screen route group `(app)` confirmed absent from this URL, matching `app/(app)/groups/[id]/settlements.tsx` → `/groups/[id]/settlements`. |

**Score:** 4/4 truths verified (automated)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/20260301000006_add_settlement_note.sql` | ADD COLUMN note TEXT to settlements table — nullable, no DEFAULT | VERIFIED | File exists, 13 lines, contains `ALTER TABLE public.settlements ADD COLUMN note TEXT;` at line 12. No NOT NULL on the SQL statement (mention of "No NOT NULL" is in a comment only). No DEFAULT clause. Committed at `5916e2f`. |
| `supabase/functions/push-notify/index.ts` | Fixed expense deep-link URL — /expenses/${record.id} | VERIFIED | File exists, 134 lines. Line 50: `dataUrl = \`/expenses/${record.id}\``. Broken form `/groups/${record.group_id}/expenses/${record.id}` does not appear anywhere in the file. Committed at `7759a35`. |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `supabase/migrations/20260301000006_add_settlement_note.sql` | `public.settlements.note` | `ALTER TABLE ADD COLUMN` | WIRED | SQL statement `ALTER TABLE public.settlements ADD COLUMN note TEXT` confirmed present at line 12 of the migration file. No NOT NULL or DEFAULT attached to the column definition. |
| `supabase/functions/push-notify/index.ts` | `app/(app)/expenses/[id]/index.tsx` | `router.push(url)` in `useNotificationDeepLink` — url verbatim from push payload | WIRED | File `app/(app)/expenses/[id]/index.tsx` confirmed to exist. `push-notify` line 50 sends `/expenses/${record.id}`. `useNotificationDeepLink` in `src/features/notifications/hooks.ts` lines 91-94 and 99-102 calls `router.push(url as never)` with the raw URL from the notification payload — no prefix or transformation applied. Route group `(app)` correctly absent from the URL. |
| `app/(app)/settlement/new.tsx` | `useCreateSettlement` note field | `note: note.trim() \|\| undefined` passed to `mutate()` | WIRED | `new.tsx` line 33: `const [note, setNote] = useState('')`. Lines 168-179: TextInput bound to note state with `maxLength={200}`. Line 72: `note: note.trim() \|\| undefined` passed into `createSettlement.mutate(...)`. Hook receives it as `CreateSettlementInput.note?: string` and sends `note: note ?? null` in the INSERT. |
| `useSettlementHistory` | `item.note` render in `settlements.tsx` | `select('*')` returns note column; conditionally rendered | WIRED | `hooks.ts` line 90: `.select('*')` — wildcard will include `note` once column exists. `settlements.tsx` lines 44-48: `{item.note ? <Text ...>{item.note}</Text> : null}` — note is conditionally rendered. |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| SETL-01 | 05-01-PLAN.md | User can record a settlement payment between two members (cash or external) | SATISFIED | Settlement form collects amount, payer, payee, and note. `useCreateSettlement` inserts all fields. Migration adds the previously missing `note` column. The INSERT that was silently dropping `note` will now persist it. REQUIREMENTS.md traceability updated to Phase 5. |
| SETL-03 | 05-01-PLAN.md | User can view settlement history for a group | SATISFIED | `useSettlementHistory` fetches settlements with `select('*')`. Settlement history screen (`settlements.tsx`) renders all settlement fields including the conditionally shown note. Route `/groups/[id]/settlements` confirmed by file structure. REQUIREMENTS.md traceability updated to Phase 5. |
| NOTF-01 | 05-01-PLAN.md | User receives a push notification when someone adds an expense to a shared group | SATISFIED (code complete; runtime needs device verification) | Push notification fires on expense INSERT via webhook (Phase 3, unchanged). Deep-link URL corrected from broken `/groups/:groupId/expenses/:id` to valid `/expenses/${record.id}`. `useNotificationDeepLink` verified to use URL verbatim. REQUIREMENTS.md traceability updated to Phase 5. |

**REQUIREMENTS.md traceability cross-reference:** SETL-01, SETL-03, and NOTF-01 all correctly map to Phase 5 in the traceability table (lines 169, 171, 176). No orphaned requirements detected for this phase.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None detected | — | — | — | — |

Scanned: `supabase/migrations/20260301000006_add_settlement_note.sql`, `supabase/functions/push-notify/index.ts`

- No TODO/FIXME/HACK/PLACEHOLDER comments in modified files
- No empty implementations (return null / return {})
- No stub handlers
- Migration SQL statement is substantive and correct
- Edge Function change is a real one-line fix, not a placeholder

---

### Human Verification Required

#### 1. Settlement Note Round-Trip (SETL-01, SETL-03)

**Test:** Apply the migration (`supabase db push`), open the app in a group, navigate to settlement flow, enter an amount AND a note (e.g., "Venmo reimbursement"), submit. Then open the Settlement History tab for that group.
**Expected:** The settlement row appears and the note "Venmo reimbursement" is visible below the payer/payee line in the card.
**Why human:** The migration must be applied to the hosted Supabase project for PostgREST to recognize the column. Static analysis confirms all four application layers (type, hook, form, history screen) are already correct — the only remaining uncertainty is that the column is live in the database when a real INSERT is performed.

#### 2. Expense Push Notification Deep-Link (NOTF-01)

**Test:** Apply the fix (`supabase functions deploy push-notify`), have two accounts in the same group on real devices (or a device + simulator with push entitlements). On Device A, add a new expense. Wait for the push notification on Device B. Tap the notification.
**Expected:** The app on Device B opens directly to the expense detail screen for the new expense — not a 404, not a blank screen, not an error.
**Why human:** Push notification delivery and deep-link navigation to a real screen require physical hardware or a push-enabled simulator, a deployed Edge Function, and a Supabase database webhook configured. These cannot be verified by static analysis. If a push environment is unavailable, check Supabase Edge Function logs to confirm the `dataUrl` in outgoing payloads reads `/expenses/[uuid]` rather than `/groups/[uuid]/expenses/[uuid]`.

---

### Gaps Summary

No gaps. All four automated must-haves are verified at all three levels (exists, substantive, wired). Both artifacts are present, contain correct implementations, and are wired to the application layer end-to-end.

The two human verification items are runtime checks that depend on:
1. Database migration being applied (`supabase db push`)
2. Edge Function being redeployed (`supabase functions deploy push-notify`)

These are deployment steps, not code gaps. The code shipped in this phase is complete and correct.

---

### Commit Trail

| Commit | Message | Files |
|--------|---------|-------|
| `5916e2f` | feat(05-01): add note column to settlements table | `supabase/migrations/20260301000006_add_settlement_note.sql` |
| `7759a35` | fix(05-01): correct expense push notification deep-link URL | `supabase/functions/push-notify/index.ts` |

Both commits verified to exist in git history. Each commit touches exactly the files declared in the PLAN `files_modified` frontmatter — no unexpected file changes.

---

_Verified: 2026-03-01_
_Verifier: Claude (gsd-verifier)_

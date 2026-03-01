# Retrospective: Owe

Living retrospective — updated after each milestone.

---

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-01
**Phases:** 7 | **Plans:** 15 | **Timeline:** 3 days (2026-02-27 → 2026-03-01)
**Scale:** ~5,800 LOC TypeScript/TSX, 154 files, 110 commits

### What Was Built

1. **Expo SDK 55 scaffold** — EAS dev client, NativeWind dark mode, MMKV-backed React Query offline persister, Supabase client with expo-sqlite polyfill, Expo Router auth/app route groups
2. **Supabase schema** — 8 tables (users, groups, group_members, expenses, expense_splits, settlements, activities, comments/reactions), full RLS, integer cents, idempotency keys, FX columns
3. **Auth + Groups** — email/password sign up/in/out/session, profile with avatar upload, group CRUD, invite by email, named-only members, leave group
4. **Google OAuth** — expo-auth-session + expo-web-browser, cold-start Linking handler, handle_new_user DB trigger for Google metadata, automatic account linking
5. **Core expense loop** — 4 split modes (equal/exact/percentage/shares), expense CRUD with two-step insert + rollback, real-time balances, greedy debt simplification (Edge Function), settlement with confetti + haptics, activity feed, comments, reactions, FAB with gestures, swipe-to-settle
6. **Offline sync** — onlineManager → NetInfo, resumePausedMutations, setMutationDefaults with standalone named mutationFns for create/update/delete
7. **Engagement layer** — push notifications (NOTF-01/02), smart reminders via pg_cron (NOTF-03), multi-currency FX with snapshotted rates (CURR-01–04), CSV export (EXPT-01)
8. **Post-audit gap closure** — wired all 3 expense CUD mutations to write activity rows, added settlements.note column, fixed push-notify deep-link URL, completed VERIFICATION.md audit trail

### What Worked

- **GSD workflow** kept the build on rails — plan → execute → verify → audit → gap closure cycle prevented technical debt from accumulating silently
- **yolo mode** with research + plan_check + verifier agents fired significant quality gates without blocking the user
- **actor_id resolution pattern** (lookup group_members.id from user.id + group_id) became the single consistent pattern used by all 6 activity-writing mutations — no divergence
- **Named mutationFn exports** pattern for offline queue replay was established early (02-03) and reused for update/delete gap closure — pattern is clean and reusable
- **Integer cents + dinero.js** decision made upfront prevented any floating-point drift issues during the entire build — zero monetary arithmetic bugs

### What Was Inefficient

- **ACTY-01 gap** — expense CUD mutations were not wired to activity rows during Phase 2; discovered only in the v1.0 audit. The gap could have been caught earlier if VERIFICATION.md criteria were written before Phase 2 execution (not after)
- **nested dollar-quote SQL bug** in engagement_layer.sql migration — pg_cron's `$cron$...$cron$` delimiter pattern vs outer `DO $$...$$` wasn't caught during plan review. A SQL linting step or test migration run would have caught this pre-commit
- **STATE.md accumulated stale entries** — multiple YAML frontmatter blocks accumulated across the session. The CLI appended rather than replaced, leading to a multi-block STATE.md that required manual reading
- **settlements.note gap** — the settlement form accepted a note field from day 1, but the DB column was missing. A schema ↔ UI cross-check during Phase 2 verification would have caught this

### Patterns Established

- **Standalone mutationFn exports**: For any mutation that must survive app restart (offline queue), extract `mutationFn` as a named module-level export and register via `setMutationDefaults` in `_layout.tsx`
- **Activity INSERT inside mutationFn body** (not `onSuccess`): Ensures offline-resumed mutations also write activity rows — `onSuccess` only fires when online
- **actor_id resolution pattern**: All activity-writing mutations use `getUser() → group_members lookup → actorMember.id` — never `user.id` directly
- **two-step expense insert with rollback**: INSERT expense → INSERT splits → on splits failure DELETE orphaned expense
- **computeSharesSplits last-member remainder**: Assigns rounding remainder to last member — asserts `sum === totalCents`, prevents penny drift
- **pg_cron migrations**: Wrap in `DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN ... END IF; END $$;` — avoids migration failure on environments without pg_cron

### Key Lessons

1. **Write VERIFICATION.md criteria before execution**, not after — criteria written upfront force you to think about observability gaps (e.g., "what proves activity rows were written?") before they become post-audit fixes
2. **Test migrations locally with `supabase db push`** before merging — the nested dollar-quote bug would have been caught in 30 seconds
3. **Schema and UI must be reviewed together** — the settlements.note gap existed because the DB column was never added when the UI field was written. A "DB column checklist" during every form implementation would prevent this class of gap
4. **Research agents should check pg_cron dollar-quote nesting** — any SQL with `DO $$` blocks that calls functions with their own dollar-quoted string arguments should use distinct delimiter tags

### Cost Observations

- Model mix: Sonnet 4.6 (primary executor + verifier), occasional Haiku for fast file reads
- Sessions: ~5 sessions over 3 days
- Notable: The GSD audit + gap closure cycle (phases 4–6) added ~1 session of work but eliminated 3 code gaps that would have been found as bugs post-ship

---

## Cross-Milestone Trends

| Milestone | Phases | Plans | LOC | Timeline | Gaps Found in Audit |
|-----------|--------|-------|-----|----------|---------------------|
| v1.0 MVP | 7 | 15 | ~5,800 | 3 days | 3 code gaps (closed before archive) |

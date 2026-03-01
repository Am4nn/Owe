# Roadmap: Owe

## Overview

Owe ships in three phases that follow the hard dependency chain from the research: secure foundation first (schema decisions that cannot be changed later), then the complete expense tracking loop that makes the app worth using, then engagement features that drive retention. Phase 1 installs the architectural guardrails — integer cents, RLS, offline persister, EAS dev client — before any user-facing work begins. Phase 2 delivers the full core product: groups, all four split types, real-time balances, debt simplification, and confetti settlement. Phase 3 adds the layer that turns a useful tool into a habit: push notifications, multi-currency, smart reminders, and export.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Secure schema, infrastructure, auth, and offline architecture
- [x] **Phase 1.5: Google OAuth** [INSERTED] - Additive social login alongside existing email/password flow
- [x] **Phase 2: Core Expense Loop** - Groups, expense entry, balances, debt simplification, settlement, activity feed
- [x] **Phase 3: Engagement Layer** - Push notifications, multi-currency, smart reminders, and export (completed 2026-03-01)
- [x] **Phase 4: Expense Activity Events** - Wire expense CUD mutations to write activity rows; closes ACTY-01 FAIL gate (completed 2026-03-01)
- [ ] **Phase 5: Schema & Notification Fixes** - Add settlements.note migration + fix push-notify deep-link URL; closes SETL-01, SETL-03, NOTF-01
- [ ] **Phase 6: Google OAuth Verification** - Write Phase 1.5 VERIFICATION.md to complete audit trail; closes AUTH-06, AUTH-07 documentation gap

## Phase Details

### Phase 1: Foundation
**Goal**: A deployed, authenticated app shell with a hardened database schema and offline-first architecture — every critical pitfall from research is addressed before any feature work begins
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, GRUP-01, GRUP-02, GRUP-03, GRUP-04, GRUP-05, OFFL-01, UIUX-01
**Success Criteria** (what must be TRUE):
  1. User can create an account with email and password, sign in, and remain signed in across app restarts without re-authenticating
  2. User can sign out from any screen and is redirected to the sign-in screen
  3. User can create a profile with display name and avatar photo
  4. User can create a group, invite members by email, add named-only (non-app) members, view all their groups from the dashboard, and leave a group
  5. App launches in dark mode with neon accent colors, cached group data is visible with no connectivity, and the EAS dev client runs MMKV + native notification modules
**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md — Expo SDK 55 scaffold, EAS dev client, NativeWind dark mode, MMKV persister wired to React Query
- [x] 01-02-PLAN.md — Supabase migration with integer cent columns, RLS on all 7 tables, version/fx_rate/idempotency columns, CI service_role key guard
- [x] 01-03-PLAN.md — Auth feature (sign up/in/out/session/profile), groups feature (CRUD + named-only members + invite + leave), offline read cache
- [x] 01-04-PLAN.md — Gap closure: CI false-positive fix (supabase.ts comment) + EAS dev client build trigger

### Phase 1.5: Google OAuth [INSERTED]
**Goal**: Add Google OAuth as a sign-in option alongside the existing email/password flow — zero breaking changes, provider-agnostic architecture preserved
**Depends on**: Phase 1
**Requirements**: AUTH-06, AUTH-07
**Success Criteria** (what must be TRUE):
  1. User can tap "Continue with Google" on the sign-in or sign-up screen, complete the OAuth flow in a browser, and land back in the app fully authenticated
  2. A Google sign-in using an email that already has an email/password account links to the existing account — no duplicate user, no data loss
  3. All existing email/password flows (sign up, sign in, sign out, session persistence) continue to work exactly as before
  4. `handle_new_user` DB trigger correctly populates `display_name` and `avatar_url` from Google metadata for new OAuth users
**Plans**: 1 plan

Plans:
- [x] 1.5-01-PLAN.md — Google OAuth: expo-auth-session + expo-web-browser install, useSignInWithGoogle hook, cold-start Linking handler, DB trigger migration for Google metadata, "Continue with Google" button on both auth screens

### Phase 2: Core Expense Loop
**Goal**: A fully functional group expense tracker — users can add expenses with any split type, see who owes what in real-time, simplify debts, and settle up with confetti
**Depends on**: Phase 1
**Requirements**: EXPN-01, EXPN-02, EXPN-03, EXPN-04, EXPN-05, EXPN-06, EXPN-07, EXPN-08, EXPN-09, BALS-01, BALS-02, BALS-03, SETL-01, SETL-02, SETL-03, ACTY-01, ACTY-02, ACTY-03, ACTY-04, OFFL-02, UIUX-02, UIUX-03
**Success Criteria** (what must be TRUE):
  1. User can add an expense (with amount, description, payer, date, category) using any of the four split modes — equal, exact amounts, percentage, or shares — including 1-on-1 splits outside a group
  2. User can edit or delete an expense they created; edits made while offline queue locally and sync automatically when connectivity returns
  3. User can see a dashboard summary of total owed and owed-to-them, a per-group balance breakdown by member, and simplified debt settlement suggestions produced by the server-side debt graph algorithm
  4. User can record a settlement payment, view settlement history for a group, and see a confetti animation with haptic feedback when a debt is fully cleared
  5. User can view a chronological activity feed filterable by group, leave a comment on an expense, and add an emoji reaction; a FAB expands to Scan Receipt / Manual Entry / Add Transfer and expense cards support swipe-to-settle and swipe-to-remind gestures
**Plans**: 4 plans

Plans:
- [x] 02-01-PLAN.md — Expense entry: DB migration (activities/comments/reactions tables), pure split functions (all 4 modes), expense CRUD hooks, SplitEditor component, expense form/edit/detail screens, ExpandableFAB
- [x] 02-02-PLAN.md — Balances and debt simplification: balance types and hooks, simplify-debts Edge Function (greedy algorithm), dashboard summary, group balances screen, simplified debts screen, Supabase Realtime invalidation
- [x] 02-03-PLAN.md — Settlement, activity feed, and offline sync: settlement form + confetti screen, activity feed with comments and reactions, OFFL-02 offline mutation queue (NetInfo + resumePausedMutations), swipe-to-settle wire-up
- [x] 02-04-PLAN.md — Gap closure: fix activities.actor_id FK (profiles -> group_members) to unblock ACTY-01, ACTY-02, ACTY-03

### Phase 3: Engagement Layer
**Goal**: A retained user base — push notifications make the app active rather than passive, multi-currency covers the traveler use case, smart reminders close the debt loop, and CSV export builds power-user trust
**Depends on**: Phase 2
**Requirements**: NOTF-01, NOTF-02, NOTF-03, CURR-01, CURR-02, CURR-03, CURR-04, EXPT-01
**Success Criteria** (what must be TRUE):
  1. User receives a push notification when a group member adds an expense and when a settlement is recorded with them; notification taps deep-link to the relevant expense or settlement screen
  2. User can configure smart reminders — a nudge dispatched after a configurable delay when a debt remains unpaid — and can disable or adjust the reminder schedule at any time
  3. User can set a base currency for a group, add an expense in a different currency, see the FX-converted amount alongside the original on every expense card, with rates snapshotted at creation time so balances never drift
  4. User can export a group's full expense history as a CSV file that opens correctly in a spreadsheet application
**Plans**: 3 plans

Plans:
- [x] 03-01-PLAN.md — Push notifications and smart reminders: DB migration (fx_rates + reminder_config tables + pg_cron jobs), expo-notifications token lifecycle, push-notify Edge Function (expenses/settlements webhooks → Expo Push API), process-reminders Edge Function (daily cron), deep-link navigation, NOTF-01/NOTF-02/NOTF-03
- [x] 03-02-PLAN.md — Multi-currency and export: fx-rates-cache Edge Function (hourly cron), currency types/hooks (useFxRates, computeBaseCents, COMMON_CURRENCIES), FX-aware expense creation, ExpenseCard dual-amount display, group base currency picker, CSV export via expo-sharing, CURR-01/CURR-02/CURR-03/CURR-04/EXPT-01
- [x] 03-03-PLAN.md — Gap closure: Smart Reminders UI — enable/disable per-group reminders and delay_days config in group detail screen, NOTF-03

### Phase 4: Expense Activity Events
**Goal**: Wire all expense CUD mutations to write rows into the activities table so the activity feed shows expense_added, expense_edited, and expense_deleted events — closing the ACTY-01 FAIL gate from the v1.0 audit
**Depends on**: Phase 2 (expenses/hooks.ts, activities table schema, group_members actor-id resolution pattern)
**Requirements**: ACTY-01, ACTY-02
**Gap Closure**: Closes ACTY-01 (unsatisfied), ACTY-02 (partial), integration gap MISSING-01
**Success Criteria** (what must be TRUE):
  1. Adding an expense in a group produces an activity row with action_type expense_added visible in the activity feed
  2. Editing an expense produces an activity row with action_type expense_edited
  3. Deleting an expense produces an activity row with action_type expense_deleted
  4. All activity rows have a valid actor_id (group_members.id) and group_id so group-scoped filtering works correctly
**Plans**: 1 plan

Plans:
- [ ] 04-01-PLAN.md — Activity write in createExpenseMutationFn (expense_added), useUpdateExpense (expense_edited), useDeleteExpense (expense_deleted); actor ID resolution via group_members lookup in each mutation

### Phase 5: Schema & Notification Fixes
**Goal**: Persist the settlement note field (currently silently dropped) and fix the push notification deep-link URL so tapping an expense notification opens the correct screen
**Depends on**: Phase 2 (settlements schema), Phase 3 (push-notify Edge Function)
**Requirements**: SETL-01, SETL-03, NOTF-01
**Gap Closure**: Closes SETL-01 (partial), SETL-03 (partial), NOTF-01 (partial), integration gaps MISSING-02 and PARTIAL-01
**Success Criteria** (what must be TRUE):
  1. A note entered on the settlement form is saved to the database and displayed in settlement history
  2. Tapping an expense push notification opens the expense detail screen (not a 404)
**Plans**: 1 plan

Plans:
- [ ] 05-01-PLAN.md — DB migration ADD COLUMN note TEXT to settlements table; fix push-notify/index.ts line 50 deep-link URL from /groups//expenses/ to /expenses/

### Phase 6: Google OAuth Verification
**Goal**: Write the missing VERIFICATION.md for Phase 1.5 to complete the audit trail — documentation gap only, all code is confirmed correct by the integration checker
**Depends on**: Phase 1.5 (Google OAuth code)
**Requirements**: AUTH-06, AUTH-07
**Gap Closure**: Closes AUTH-06 (partial — missing VERIFICATION.md), AUTH-07 (partial — missing VERIFICATION.md)
**Success Criteria** (what must be TRUE):
  1. 1.5-VERIFICATION.md exists with status: passed, covering AUTH-06 and AUTH-07 with code evidence from src/features/auth/hooks.ts and the two auth screens
  2. All 4 phases now have a VERIFICATION.md — audit trail complete
**Plans**: 1 plan

Plans:
- [ ] 06-01-PLAN.md — Write 1.5-VERIFICATION.md verifying useSignInWithGoogle, createSessionFromUrl, migration 20260228000002_google_oauth.sql, and both auth screen integrations

## Progress


**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 4/4 | Complete | 2026-02-28 |
| 1.5. Google OAuth | 1/1 | Complete | 2026-02-28 |
| 2. Core Expense Loop | 4/4 | Complete | 2026-02-28 |
| 3. Engagement Layer | 3/3 | Complete | 2026-03-01 |
| 4. Expense Activity Events | 1/1 | Complete    | 2026-03-01 |
| 5. Schema & Notification Fixes | 0/1 | Pending | — |
| 6. Google OAuth Verification | 0/1 | Pending | — |

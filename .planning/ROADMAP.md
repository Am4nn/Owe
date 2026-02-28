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
- [ ] **Phase 2: Core Expense Loop** - Groups, expense entry, balances, debt simplification, settlement, activity feed
- [ ] **Phase 3: Engagement Layer** - Push notifications, multi-currency, smart reminders, and export

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
**Plans**: TBD

Plans:
- [ ] 02-01: Expense entry — all four split types, category tagging, 1-on-1 splits, edit/delete flows, FAB with quick-add actions
- [ ] 02-02: Balances and debt simplification — dashboard totals, per-group breakdown, debt-simplify Edge Function (Schulman's algorithm), Supabase Realtime invalidation
- [ ] 02-03: Settlement, activity feed, and offline sync — settlement recording + confetti screen, activity feed with comments and reactions, OFFL-02 offline mutation queue, swipe gestures

### Phase 3: Engagement Layer
**Goal**: A retained user base — push notifications make the app active rather than passive, multi-currency covers the traveler use case, smart reminders close the debt loop, and CSV export builds power-user trust
**Depends on**: Phase 2
**Requirements**: NOTF-01, NOTF-02, NOTF-03, CURR-01, CURR-02, CURR-03, CURR-04, EXPT-01
**Success Criteria** (what must be TRUE):
  1. User receives a push notification when a group member adds an expense and when a settlement is recorded with them; notification taps deep-link to the relevant expense or settlement screen
  2. User can configure smart reminders — a nudge dispatched after a configurable delay when a debt remains unpaid — and can disable or adjust the reminder schedule at any time
  3. User can set a base currency for a group, add an expense in a different currency, see the FX-converted amount alongside the original on every expense card, with rates snapshotted at creation time so balances never drift
  4. User can export a group's full expense history as a CSV file that opens correctly in a spreadsheet application
**Plans**: TBD

Plans:
- [ ] 03-01: Push notifications and smart reminders — EAS Push + push-notify Edge Function, DB webhook trigger chain, token lifecycle, NOTF-01 / NOTF-02 / NOTF-03
- [ ] 03-02: Multi-currency and export — fx-rates-cache Edge Function (hourly cron), CURR-01 through CURR-04, EXPT-01 CSV generation

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 4/4 | Complete | 2026-02-28 |
| 1.5. Google OAuth | 2/2 | Complete | 2026-02-28 |
| 2. Core Expense Loop | 0/3 | Not started | - |
| 3. Engagement Layer | 0/2 | Not started | - |

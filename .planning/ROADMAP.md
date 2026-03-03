# Roadmap: Owe

## Milestones

- ✅ **v1.0 MVP** — Phases 1–6 (shipped 2026-03-01) — [archive](milestones/v1.0-ROADMAP.md)
- 🚧 **v1.1 Polish** — Phases 7–9 (in progress — Phase 7 complete)
- 📋 **v2.0 Engagement & Insights** — Phases 10+ (planned)

## Phases

<details>
<summary>✅ v1.0 MVP — SHIPPED 2026-03-01</summary>

- [x] Phase 1: Foundation (4/4 plans) — completed 2026-02-28
- [x] Phase 1.5: Google OAuth [INSERTED] (1/1 plan) — completed 2026-02-28
- [x] Phase 2: Core Expense Loop (4/4 plans) — completed 2026-02-28
- [x] Phase 3: Engagement Layer (3/3 plans) — completed 2026-03-01
- [x] Phase 4: Expense Activity Events (1/1 plan) — completed 2026-03-01
- [x] Phase 5: Schema & Notification Fixes (1/1 plan) — completed 2026-03-01
- [x] Phase 6: Google OAuth Verification (1/1 plan) — completed 2026-03-01

**42/42 v1 requirements satisfied. Full archive: `.planning/milestones/v1.0-ROADMAP.md`**

</details>

### 🚧 v1.1 Polish (In Progress)

- [x] **Phase 7: Bug Fixes** — completed 2026-03-03
- [ ] **Phase 8: Code Review, Refactor & Best Practices**
- [ ] **Phase 9: UI/UX Upgrade**

### 📋 v2.0 Engagement & Insights (Planned)

- [ ] Phase 10: Receipt Scanning (AI itemization + multi-payer) — RCPT-01–05
- [ ] Phase 11: Recurring Expenses (subscriptions tab) — RECR-01–03
- [ ] Phase 12: Spending Insights & Charts (fairness score) — INSI-01–02
- [ ] Phase 13: PDF Export + Apple Sign-In — EXPE-01
- [x] Phase 14: Email Invite Delivery (Supabase Edge Function) — send actual invite emails when a user is added to `group_invites`; notify existing members of new expenses
- [ ] Phase 15: Email Invite E2E Completion — deep link from email into app, invite claim/accept logic on sign-up & login, pending invites UI, web landing page for non-app users

## Phase Details

### Phase 7: Bug Fixes
**Goal**: Fix all known bugs accumulated since v1.0 launch — functional correctness before UI polish begins
**Depends on**: Phase 6
**Requirements**: TBD (bugs to be listed during planning discussion)
**Success Criteria** (what must be TRUE):
  1. All bugs identified in planning discussion are fixed and verified
  2. No regressions in previously working flows (auth, expense CRUD, balances, settlements)
**Plans**: TBD

Plans:
- [ ] 07-01-PLAN.md — Bug fixes batch 1 (scope TBD during planning)

---

### Phase 8: Code Review, Refactor & Best Practices
**Goal**: Systematically review and refactor the entire codebase for correctness, maintainability, and scalability — covering architecture, DRY principle, cross-platform abstraction strategy, and general code quality — before the major UI/UX overhaul begins
**Depends on**: Phase 7
**Requirements**: Internal quality (no user-facing requirement IDs — this phase improves developer experience and long-term maintainability)
**Success Criteria** (what must be TRUE):
  1. Architecture is correctly layered: `features/` owns domain logic, `components/` is purely presentational, `lib/` holds infra utilities — no cross-layer leakage
  2. DRY audit complete: all duplicated modal patterns, error handlers, and platform guards consolidated into shared hooks or utilities
  3. Cross-platform strategy implemented: `Platform.OS` if-else removed from call-sites; replaced with a structured adapter pattern (platform-specific file extensions `.web.ts` / `.native.ts`, a `usePlatformAlert` hook, etc.) — approach determined during research
  4. Dead code removed, naming conventions consistent across features, all React Query hooks have explicit loading and error states
  5. No regressions: all Phase 7 success criteria still pass after refactor
**Plans**: TBD (split per focus area during planning)

Plans:
- [ ] 08-01-PLAN.md — Architecture audit + cross-platform strategy research & implementation
- [ ] 08-02-PLAN.md — DRY refactor: modals, error handlers, shared hooks
- [ ] 08-03-PLAN.md — Code quality pass: dead code, naming, React Query, loading/error states

---

### Phase 9: UI/UX Upgrade
**Goal**: Align every screen with the Stitch design reference — cohesive dark fintech aesthetic, glassmorphism cards, redesigned group cards, Stitch-accurate navigation, and polished micro-interactions across the full app
**Depends on**: Phase 8
**Design Reference**: `artifacts/stitch_owe_design/` (27 screens with screen.png + code.html per screen)
**Requirements**: UIUX-01 (enhanced), visual parity with Stitch design board
**Success Criteria** (what must be TRUE):
  1. Dashboard shows side-by-side balance summary cards (green "You are owed" / red "You owe"), group cards with background images + overlay, and activity feed rows with category icon + color-coded amounts matching Stitch `dashboard_strict_dark_refinement`
  2. Group detail screen matches `group_detail_dark_theme_refined`: group avatar/icon at top, balance summary bar + "Settle All" CTA, member avatar stack with +N overflow and Invite action, simplified debts cards with inline REMIND chip, chat-bubble–style expense history
  3. Add expense screen matches `add_expense_strict_dark_theme`: large `$0.00` amount header, description input, category pill row (Food/Travel/Shop/Other + custom), "Paid By" avatar stack, segmented split-type control (Equal/Exact/%), member amount rows, purple "Save Expense" CTA
  4. Activity feed matches `activity_feed_updated_navigation`: tab bar (All / Groups / Friends / Settlements), avatar + action description + relative timestamp + color-coded amount per row, emoji reaction pill counts below each row
  5. Settlement success screen matches `settlement_success_strict_dark`: dark teal radial gradient background, glowing teal ring + checkmark animation, "All Clear!" heading, payer + payee + amount, transaction ID chip, "Back to Group" + "View Receipt" actions
  6. Sign-in and sign-up screens match `sign_in_unified_google_button` / `sign_up_final_design`: infinity logo at top, glassmorphism card with email + password fields, purple "Sign In/Up" CTA, "OR CONTINUE WITH" divider, unified "Continue with Google" button below
  7. Bottom navigation matches all Stitch screens: 4 tabs (Home / Activity / Groups / Profile) with centered floating purple FAB — no labels hidden, correct active-state purple underline/icon tint
  8. All text, spacing, border-radius, shadow, and color tokens are consistent with the Stitch palette: background `#0e1117`, card `#1a1d2e`, purple accent `#7B5CF6`, green `#22c55e`, red `#ef4444`
**Plans**: TBD (will be split per screen group during planning)

Plans:
- [ ] 09-01-PLAN.md — Design tokens + navigation shell (colors, typography, bottom tabs, FAB)
- [ ] 09-02-PLAN.md — Auth screens (sign-in, sign-up, splash/onboarding)
- [ ] 09-03-PLAN.md — Dashboard + group cards
- [ ] 09-04-PLAN.md — Group detail + add expense screen
- [ ] 09-05-PLAN.md — Activity feed + settlement success screen

---

### Phase 15: Email Invite E2E Completion
**Goal**: Complete the email invite flow end-to-end — from the moment a user clicks the CTA in the invite email to being a fully joined group member in the Owe app
**Depends on**: Phase 14
**Requirements**: INVT-E2E-01 (deep link handling), INVT-E2E-02 (invite claim on auth), INVT-E2E-03 (pending invites UI), INVT-E2E-04 (web landing/download page)
**Success Criteria** (what must be TRUE):
  1. Email CTA deep-links into the app (Android) or opens a web landing page with "Download App" / "Open in Browser" options
  2. When a new user signs up with an invited email, all pending invites for that email are auto-claimed — user is added to groups and `accepted_at` is stamped
  3. When an existing user logs in, any unclaimed pending invites for their email are surfaced and can be accepted/declined
  4. Pending invites screen shows all outstanding invites with group name, inviter name, and expiry — accept adds user to group, decline deletes the invite
  5. Expired invites are never shown and cannot be accepted
  6. Web landing page at `you.owe.amanarya.com` shows branded download/open page with app store links and a "Continue in Browser" option for the web build
**Plans**: TBD (split during planning)

Plans:
- [ ] 15-01-PLAN.md — Invite claim logic (DB function + auth trigger + RLS policies)
- [ ] 15-02-PLAN.md — Pending invites UI + accept/decline flow
- [ ] 15-03-PLAN.md — Deep linking from email + web landing page

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 4/4 | Complete | 2026-02-28 |
| 1.5. Google OAuth | v1.0 | 1/1 | Complete | 2026-02-28 |
| 2. Core Expense Loop | v1.0 | 4/4 | Complete | 2026-02-28 |
| 3. Engagement Layer | v1.0 | 3/3 | Complete | 2026-03-01 |
| 4. Expense Activity Events | v1.0 | 1/1 | Complete | 2026-03-01 |
| 5. Schema & Notification Fixes | v1.0 | 1/1 | Complete | 2026-03-01 |
| 6. Google OAuth Verification | v1.0 | 1/1 | Complete | 2026-03-01 |
| 7. Bug Fixes | v1.1 | 1/1 | Complete | 2026-03-03 |
| 8. Code Review, Refactor & Best Practices | v1.1 | 0/3 | Not started | — |
| 9. UI/UX Upgrade | v1.1 | 0/5 | Not started | — |
| 10. Receipt Scanning | v2.0 | 0/? | Not started | — |
| 11. Recurring Expenses | v2.0 | 0/? | Not started | — |
| 12. Spending Insights | v2.0 | 0/? | Not started | — |
| 13. PDF Export + Apple Sign-In | v2.0 | 0/? | Not started | — |
| 14. Email Invite Delivery | v2.0 | 1/1 | Complete | 2026-03-03 |
| 15. Email Invite E2E Completion | v2.0 | 0/3 | Not started | — |

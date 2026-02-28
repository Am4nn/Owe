# Requirements: Owe

**Defined:** 2026-02-27
**Core Value:** Users can split expenses, track shared debts, and settle up with friends without limits, ads, or paywalls — in a UI that feels like a modern bank app, not a spreadsheet.

---

## v1 Requirements

Requirements for initial release. Covers all table stakes (P1) features and core product plan Phase 1 + Phase 2 features.

### Authentication

- [x] **AUTH-01**: User can create an account with email and password
- [x] **AUTH-02**: User can sign in with email and password
- [x] **AUTH-03**: User session persists across app restarts without re-logging in
- [x] **AUTH-04**: User can sign out from any screen
- [x] **AUTH-05**: User can create a profile with a display name and avatar photo
- [x] **AUTH-06**: User can sign in (or create an account) with Google OAuth — one tap, no password required
- [x] **AUTH-07**: A Google sign-in using an email that already exists as an email/password account is automatically linked to that account (no duplicate user created)

### Groups

- [x] **GRUP-01**: User can create a named group
- [x] **GRUP-02**: User can invite members to a group by email
- [x] **GRUP-03**: User can add named-only (non-app) members to represent friends who haven't installed the app
- [x] **GRUP-04**: User can view a list of all their groups from the dashboard
- [x] **GRUP-05**: User can leave a group (with balances resolved or outstanding)

### Expenses

- [x] **EXPN-01**: User can add an expense with amount, description, payer, and date
- [x] **EXPN-02**: User can split an expense equally among all selected members (default)
- [x] **EXPN-03**: User can split an expense by exact amounts per member
- [x] **EXPN-04**: User can split an expense by percentage per member
- [x] **EXPN-05**: User can split an expense by shares (e.g., 1 share vs 2 shares)
- [x] **EXPN-06**: User can assign expense categories using built-in icons or tags
- [x] **EXPN-07**: User can edit an expense they created
- [x] **EXPN-08**: User can delete an expense they created
- [x] **EXPN-09**: User can add a 1-on-1 expense outside of a group (direct friend split)

### Balances

- [ ] **BALS-01**: User can see total "you owe" and "you are owed" summary on the dashboard
- [ ] **BALS-02**: User can see per-group balance breakdown showing each member's net position
- [ ] **BALS-03**: User can see simplified debt suggestions (debt graph algorithm reduces N bilateral debts to the minimum settlement path)

### Settlement

- [ ] **SETL-01**: User can record a settlement payment between two members (cash or external)
- [ ] **SETL-02**: User sees a confetti animation with haptic feedback when a debt is fully cleared
- [ ] **SETL-03**: User can view settlement history for a group

### Activity

- [ ] **ACTY-01**: User can view a chronological activity feed of all expense actions in their groups
- [ ] **ACTY-02**: User can filter the activity feed by group
- [ ] **ACTY-03**: User can add a comment on an expense for clarification or dispute
- [ ] **ACTY-04**: User can add an emoji reaction to an expense in the activity feed

### Notifications

- [ ] **NOTF-01**: User receives a push notification when someone adds an expense to a shared group
- [ ] **NOTF-02**: User receives a push notification when a group member records a settlement with them
- [ ] **NOTF-03**: User can configure smart reminders — a nudge sent after a configurable delay if a debt is unpaid

### Multi-Currency

- [ ] **CURR-01**: User can set a base currency for a group
- [ ] **CURR-02**: User can add an expense in a different currency from the group base currency
- [ ] **CURR-03**: Expense amounts are converted to the group base currency using real-time FX rates at the time of expense creation
- [ ] **CURR-04**: Both the original currency amount and the converted base currency amount are displayed on expense cards

### Offline

- [x] **OFFL-01**: User can view cached group data and balances when offline with no connectivity
- [ ] **OFFL-02**: User can add an expense while offline; it queues locally and syncs automatically when connectivity returns

### Export

- [ ] **EXPT-01**: User can export a group's expense history as a CSV file

### UI / UX

- [x] **UIUX-01**: App launches in dark mode by default with vibrant neon accent colors on deep dark backgrounds
- [ ] **UIUX-02**: User can swipe an expense card to trigger quick-settle or quick-remind actions (gesture navigation)
- [x] **UIUX-03**: A floating action button (FAB) expands into: Scan Receipt, Manual Entry, Add Transfer

---

## v2 Requirements

Deferred to Phase 3 (post-MVP validation). Add when core split-tracking is stable.

### Receipt Scanning

- **RCPT-01**: User can scan a receipt with the device camera; AI extracts line items and prices
- **RCPT-02**: User can assign extracted receipt items to individual group members via tap
- **RCPT-03**: User can handle multi-payer receipts where multiple people paid different portions of the same bill
- **RCPT-04**: User must explicitly confirm the AI-extracted data before the expense is committed (never auto-commit)
- **RCPT-05**: Original receipt image is shown alongside each extracted item for user verification

### Recurring Expenses

- **RECR-01**: User can mark an expense as recurring on a defined schedule (weekly, monthly, custom)
- **RECR-02**: User can view all recurring expenses across all groups in a dedicated Subscriptions tab
- **RECR-03**: A member can opt out of a recurring expense effective the next cycle, with amounts automatically adjusted for remaining members

### Insights

- **INSI-01**: User can view spending breakdown charts by category for a group or time period
- **INSI-02**: User can see their settlement fairness score within a group — a gamified private metric rewarding timely payment

### Extended Export

- **EXPE-01**: User can export a group's expense history as a PDF with formatted layout

---

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| In-app payment rails (Plaid/Stripe) | Regulatory complexity (money transmission), app store payment rules, compliance cost. Phase 4+ if ever. |
| WhatsApp / Telegram bot integration | External API dependency, approval processes, brittle integration. Phase 4+. |
| Web dashboard | Mobile-first product. Add when user base shows desktop demand. Phase 4+. |
| B2B team plans | Monetization milestone requiring separate pricing model. Phase 4+. |
| Apple Sign-In | Requires Apple Developer account enrollment and entitlements. Revisit post-Google launch. |
| Real-time group chat | High infrastructure cost, duplicates WhatsApp/iMessage. Comments on expenses cover dispute resolution. |
| Ads or freemium feature gating | Against core philosophy. Any paywall or ad = trust destroyed. Tip jar only. |
| Public social feed | Privacy risk — expense data is sensitive. All data stays private to group members. |
| Crypto settlement | Regulatory gray area, negligible user segment, wallet complexity. Not in scope. |
| Public debt leaderboards | Social shaming dynamic. Fairness score stays private-to-group only. |
| AI spending advice / budgeting coach | Out of scope for split-tracking. Creates liability. Charts are descriptive, not prescriptive. |
| Group savings Pot (v1) | Requires legal/compliance review (must not appear to hold user funds). Trust must be established first. v2+. |

---

## Traceability

Which phases cover which requirements. Confirmed during roadmap creation 2026-02-27.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| AUTH-05 | Phase 1 | Complete |
| GRUP-01 | Phase 1 | Complete |
| GRUP-02 | Phase 1 | Complete |
| GRUP-03 | Phase 1 | Complete |
| GRUP-04 | Phase 1 | Complete |
| GRUP-05 | Phase 1 | Complete |
| EXPN-01 | Phase 2 | Complete |
| EXPN-02 | Phase 2 | Complete |
| EXPN-03 | Phase 2 | Complete |
| EXPN-04 | Phase 2 | Complete |
| EXPN-05 | Phase 2 | Complete |
| EXPN-06 | Phase 2 | Complete |
| EXPN-07 | Phase 2 | Complete |
| EXPN-08 | Phase 2 | Complete |
| EXPN-09 | Phase 2 | Complete |
| BALS-01 | Phase 2 | Pending |
| BALS-02 | Phase 2 | Pending |
| BALS-03 | Phase 2 | Pending |
| SETL-01 | Phase 2 | Pending |
| SETL-02 | Phase 2 | Pending |
| SETL-03 | Phase 2 | Pending |
| ACTY-01 | Phase 2 | Pending |
| ACTY-02 | Phase 2 | Pending |
| ACTY-03 | Phase 2 | Pending |
| ACTY-04 | Phase 2 | Pending |
| NOTF-01 | Phase 3 | Pending |
| NOTF-02 | Phase 3 | Pending |
| NOTF-03 | Phase 3 | Pending |
| CURR-01 | Phase 3 | Pending |
| CURR-02 | Phase 3 | Pending |
| CURR-03 | Phase 3 | Pending |
| CURR-04 | Phase 3 | Pending |
| AUTH-06 | Phase 1.5 | Complete |
| AUTH-07 | Phase 1.5 | Complete |
| OFFL-01 | Phase 1 | Complete |
| OFFL-02 | Phase 2 | Pending |
| EXPT-01 | Phase 3 | Pending |
| UIUX-01 | Phase 1 | Complete |
| UIUX-02 | Phase 2 | Pending |
| UIUX-03 | Phase 2 | Complete |

**Coverage:**
- v1 requirements: 42 total
- Mapped to phases: 42
- Unmapped: 0

Phase 1 (Foundation): 12 requirements — AUTH-01 through AUTH-05, GRUP-01 through GRUP-05, OFFL-01, UIUX-01
Phase 1.5 (Google OAuth): 2 requirements — AUTH-06, AUTH-07
Phase 2 (Core Expense Loop): 22 requirements — EXPN-01 through EXPN-09, BALS-01 through BALS-03, SETL-01 through SETL-03, ACTY-01 through ACTY-04, OFFL-02, UIUX-02, UIUX-03
Phase 3 (Engagement Layer): 8 requirements — NOTF-01 through NOTF-03, CURR-01 through CURR-04, EXPT-01

---
*Requirements defined: 2026-02-27*
*Last updated: 2026-02-27 — traceability confirmed during roadmap creation*

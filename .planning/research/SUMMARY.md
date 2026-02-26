# Project Research Summary

**Project:** Nexus — Expense Splitting Mobile App
**Domain:** Cross-platform fintech mobile app (expense splitting / personal finance)
**Researched:** 2026-02-27
**Confidence:** HIGH (stack verified against live npm registry; architecture patterns from official docs; feature research MEDIUM due to no live web fetch)

## Executive Summary

Nexus is a free, unlimited expense-splitting mobile app built to capture users fleeing Splitwise's 2023-2025 monetization changes. The product occupies a clearly defined gap: every competitor either caps features behind a paywall (Splitwise), lacks persistence (Tricount), or has a dated UX. The recommended approach is React Native via Expo SDK 55 with Supabase as the BaaS layer — this combination delivers cross-platform iOS/Android parity, a relational database required for debt-graph math, RLS-enforced security, Realtime sync, and Edge Functions for server-side computation, all within a managed platform that eliminates ops overhead for an early-stage product.

The core architecture is a feature-hook pattern where screens never touch the database directly: all server state flows through TanStack Query (with MMKV-persisted cache for offline-first) and all heavy computation (debt simplification, OCR, FX caching, push notifications) runs in Supabase Edge Functions rather than on the client device. This separation keeps the client performant and testable, and allows the debt-graph algorithm to produce a single authoritative result rather than inconsistent per-client computations. The offline-first requirement is non-negotiable as a differentiator and must be baked into the architecture from day one — it cannot be retrofitted.

The principal risks are financial data integrity issues (float arithmetic, FX rate drift, offline conflict resolution) and security misconfiguration (RLS not enabled on new tables, service_role key exposed to the client). Both categories must be addressed in Phase 1 schema design and project scaffolding before any feature work begins. The OCR and debt-simplification features carry execution risk but are well-scoped with clear avoidance strategies documented in research.

---

## Key Findings

### Recommended Stack

The stack is built on Expo SDK 55 (React Native 0.84, React 19) with file-based routing via expo-router. This managed workflow eliminates bare React Native maintenance and provides OTA updates via EAS — critical for rapid iteration on a free app without App Store review cycles. Supabase is the only viable backend choice for this domain: the debt-simplification graph requires complex relational joins that are impossible in a NoSQL document store like Firestore.

Client-side state is split cleanly between TanStack Query v5 (all server state, cache, optimistic updates, offline queue) and Zustand v5 (UI-only state: theme, bottom sheet state, active group). MMKV v4 (C++ JSI, 30-50x faster than AsyncStorage) persists the React Query cache to disk for offline reads. NativeWind 4 (Tailwind v3 — NOT v4) provides the design token system. There is one critical version trap: pinning `tailwindcss@^3.4.17` is mandatory; installing Tailwind v4 silently breaks NativeWind 4.x.

**Core technologies:**
- Expo SDK 55 / React Native 0.84: Cross-platform runtime — managed workflow with EAS build pipeline and OTA updates
- Supabase JS 2.x: BaaS providing PostgreSQL, Auth, Realtime, Storage, and Edge Functions (Deno) in one integrated platform
- TanStack Query v5 + MMKV persister: Server state cache with disk persistence — enables offline-first without a full offline database
- Zustand v5: Lightweight UI state store — owns theme, active screens, bottom sheet; never server data
- NativeWind 4 + Tailwind 3: Compile-time Tailwind tokens in React Native — enforces design system consistency across all screens
- React Query persist-client + react-native-mmkv: Offline-first cache persistence — 30-50x faster than AsyncStorage on app boot
- victory-native 41 + @shopify/react-native-skia 2: GPU-accelerated Skia charts for spending insights
- dinero.js v2: Integer-based currency arithmetic — mandatory for avoiding IEEE 754 penny drift across split calculations
- expo-notifications + EAS Push: Push notifications without the 20 MB Firebase SDK overhead

### Expected Features

The competitive opportunity is clear: Splitwise's core free tier was deliberately degraded (expense caps, paywalled OCR, interstitial ads) between 2023-2025, creating a large pool of motivated migrants. The winning product matches the full Splitwise feature set with no paywalls, no ads, no caps — and adds offline-first and AI receipt scanning as technical differentiators.

**Must have at launch (table stakes — P1):**
- Auth (email/password) — prerequisite for everything
- Groups with named-only members — required for trip groups where not everyone installs the app
- Expense entry with all four split modes (equal, exact, percentage, shares) — equal must be the default; this is the core action
- Balance view (per-group and total) — must be real-time and clear
- Debt simplification with transparent "suggested settlement" UI — a differentiator but also expected by power users
- Settlement flow with confetti — emotional punctuation; closes the debt loop with delight
- Activity feed with edit/delete — trust and error correction
- Push notifications on new expense — without this the app is passive
- Multi-currency with real-time FX rates — travelers are the primary use case; locking this to Pro is Splitwise's top complaint
- Dark mode / fintech aesthetic (glassmorphism, gradient cards) — first impression is retention
- Offline-first read + optimistic add — core technical differentiator; cannot be retrofitted post-launch
- CSV export — power user trust signal, travel reimbursement use case

**Should have after validation (P2 — add when core is stable):**
- Receipt scanning with AI itemization (GPT-4o Vision) — high complexity; validate manual entry UX first
- Recurring expenses + subscriptions manager tab — ship together; validate that retention patterns show repeated monthly use
- Spending insights / charts — requires category tagging to be meaningful; add when data volume justifies it
- Smart reminders — add when settlement rate data shows users forget to pay back
- Comments and emoji reactions on expenses — low effort, add when activity feed has traction

**Defer to v2+:**
- Group savings Pot — unique feature but high complexity; requires compliance review (must not appear to hold user funds)
- Fairness Score / gamification — requires 30+ days of settlement history to show meaningful data; empty-state gamification causes churn
- In-app payment deep-links (Venmo/PayPal) — partnership and compliance overhead; deep-link workaround is sufficient for MVP
- Web dashboard — mobile-first; defer until retention shows power users wanting desktop access
- OAuth (Google/Apple login) — email/password sufficient for MVP; reduces friction but adds SDK complexity

**Anti-features to avoid permanently:**
- Ads — THE reason users fled Splitwise; one interstitial destroys trust irreversibly
- Freemium feature gating — undermines the core "everything free" positioning
- Real-time group chat — duplicates WhatsApp; adds infrastructure and moderation overhead
- In-app crypto settlement — regulatory gray area, negligible user segment

### Architecture Approach

The architecture follows a strict layered pattern: Expo Router screens render UI only, feature hooks (co-located in `src/features/*/hooks.ts`) compose TanStack Query and Zustand, the Supabase singleton client is imported only in `src/lib/`, and all privileged or computationally heavy operations (debt simplification, OCR, FX rate caching, push dispatch, PDF export, recurring expense processing) run in Supabase Edge Functions (Deno runtime). PostgreSQL RLS enforces authorization at the database layer using `group_members` as the access anchor — a user cannot read any expense, settlement, or balance unless their `user_id` appears in `group_members` for that group. Supabase Realtime (one WebSocket channel per active group screen, unsubscribed on blur) drives live balance updates when group members add expenses concurrently.

**Major components:**
1. Expo Router screens (`app/`) — UI rendering only; no Supabase imports; consume feature hooks
2. Feature hooks (`src/features/*/hooks.ts`) — TanStack Query queries/mutations + Zustand selectors; the only place server data is fetched
3. Supabase JS singleton (`src/lib/supabase.ts`) — auth session auto-refresh; imported only from hooks and lib
4. MMKV persister (`src/lib/persister.ts`) — React Query cache written to disk; enables instant cold-start display and offline reads
5. Edge Function: `debt-simplify` — Schulman's graph algorithm server-side; outputs to `simplified_balances` table (never mutates expense records)
6. Edge Function: `receipt-ocr` — calls OpenAI Vision; returns draft JSON; API key never touches the client
7. Edge Function: `fx-rates-cache` — hourly cron fetches Open Exchange Rates; caches in Postgres `fx_rates` table
8. Edge Function: `push-notify` — triggered by DB webhook; dispatches via OneSignal/FCM/APNs
9. PostgreSQL + RLS (`supabase/migrations/`) — authoritative ledger; append-only expense records; RLS on every table from migration 001

### Critical Pitfalls

The most dangerous pitfalls all have the same root cause: decisions made in Phase 1 that cannot be fixed later without a full data migration or a security incident.

1. **Float currency arithmetic** — Store all monetary amounts as `INTEGER` cents in Postgres and use `dinero.js` v2 for all client arithmetic. Never use `parseFloat()` on financial data. A group of 6 splitting $47.99 with IEEE 754 floats produces a ghost $0.01 debt that cannot be resolved. This is a Phase 1 schema decision.

2. **RLS disabled by default on new Supabase tables** — Every `CREATE TABLE` migration must immediately follow with `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and an explicit SELECT policy. Test by authenticating as User B and querying User A's group data — must return 0 rows. Missing RLS on `expense_splits` or `settlements` leaks financial data across groups.

3. **FX rate not snapshotted at expense creation time** — The `expenses` table must include `fx_rate_at_creation NUMERIC(12,6)` and `base_currency TEXT` columns set at insert and never updated. Using a live rate in balance queries causes group members to see different totals from the same expense as the market moves. Phase 1 schema decision.

4. **Last-write-wins offline sync data corruption** — Two users editing the same expense while one is offline results in silent overwrite on reconnect. Add a `version INTEGER NOT NULL DEFAULT 1` column to all mutable records and use optimistic concurrency (`WHERE version = $known_version`) to detect conflicts and surface a resolution dialog. Phase 1 schema + Phase 2 offline sync.

5. **`service_role` key in the mobile app bundle** — The service key bypasses all RLS and can be extracted from the compiled binary. The mobile app must use only the `anon` key + user JWT. The service key lives exclusively in Edge Function environment variables (Supabase Vault) and CI secrets. Add a CI check that scans the built JS bundle and fails if the service key string is present.

6. **Expo Go used beyond day one** — MMKV v4, expo-notifications, and @gorhom/bottom-sheet all require a custom native build unavailable in Expo Go. Set up an EAS custom dev client in Phase 1 before any native module is added.

7. **Debt graph computed on the client** — For groups with 20+ members and 500+ expenses, the simplification algorithm blocks the JS thread for 2-5 seconds. More critically, running on individual clients produces inconsistent results across devices. All debt simplification runs exclusively in the `debt-simplify` Edge Function; clients read the pre-computed `simplified_balances` table.

---

## Implications for Roadmap

Feature dependencies and pitfall timing requirements strongly dictate phase structure. The research is clear: every security and data integrity decision must be made in Phase 1 before a single user-facing feature is built. Offline-first is a cross-cutting architectural concern, not a feature — it must be embedded from the start. The dependency graph flows linearly through Auth → Groups → Expense Entry → Balances → Debt Simplification → Settlement, with OCR and analytics as independent enhancements layered on top.

### Phase 1: Foundation — Secure Schema, Infrastructure, and Auth

**Rationale:** All critical pitfalls are Phase 1 decisions (float storage, RLS, FX rate column, version column, offline persister, EAS dev client, security model). Building any feature on a schema that uses floats or lacks RLS creates irrecoverable technical debt. Auth is also the prerequisite for everything else in the dependency graph.

**Delivers:** Working authenticated app shell, secure database schema, EAS custom dev client, offline cache layer operational

**Features addressed:**
- Auth (email/password) with secure JWT storage (expo-secure-store, not AsyncStorage)
- EAS custom dev client setup (eliminates Expo Go as a dev environment)
- PostgreSQL schema: all tables with integer cent amounts, RLS enabled, version columns, fx_rate_at_creation column, idempotency_key on expenses
- MMKV persister wired to React Query client (offline-first foundation)
- NativeWind design token configuration, dark mode baseline

**Pitfalls avoided:** Float arithmetic (#1), RLS off by default (#2), FX rate drift (#3), offline conflict corruption (#4), service_role key exposure (#5), Expo Go dependency (#6)

**Research flag:** Standard patterns — this is well-documented Supabase + Expo setup. No additional research phase needed.

---

### Phase 2: Core Expense Loop — Groups, Expenses, Balances, and Settlement

**Rationale:** This is the minimum viable product loop. Every feature in the dependency chain (Groups → Expense Entry → Balances → Debt Simplification → Settlement) must be complete before any other feature adds value. Without the ability to add an expense, see who owes what, and mark it settled, the app has no reason to exist. This phase delivers the Tricount-killer: unlimited, free, with debt simplification.

**Delivers:** Fully functional group expense tracker — users can create groups, add expenses with all split types, see real-time balances, settle debts with confetti

**Features addressed (P1):**
- Groups with named-only (non-app) members
- Expense entry: equal (default), exact, percentage, shares splits
- Multi-currency display with FX rates (live for new expenses, historical snapshot for balances)
- Balance view per-group and total (real-time via Supabase Realtime)
- Debt simplification via `debt-simplify` Edge Function (server-side only)
- Settlement flow with confetti + haptic feedback
- Activity feed with expense history, edit/delete
- Offline-first: optimistic expense add, mutation queue on reconnect
- CSV export

**Pitfalls avoided:** Client-side debt graph (#7), debt simplification mutating expense records (Pitfall #3 from PITFALLS.md — keep ledger append-only), last-write-wins offline sync (#4 with version concurrency)

**Research flag:** Debt simplification graph algorithm (Schulman's algorithm server-side in Deno) warrants a brief research-phase review — the algorithm itself is standard but the Deno/Edge Function implementation has nuances. All other patterns (React Query mutations, Supabase Realtime, RLS) are well-documented.

---

### Phase 3: Engagement Layer — Notifications, Polish, and Power Features

**Rationale:** Once the core loop is validated, engagement features drive retention. Push notifications convert the app from passive to active. Recurring expenses address the housemate use case (monthly rent, utilities, streaming splits). The subscriptions manager tab bundles with recurring expenses — they must ship together or the tab is empty.

**Delivers:** Retained, engaged user base with notification-driven re-engagement and recurring expense automation

**Features addressed (P2):**
- Push notifications (new expense added, settlement requests) via EAS Push + `push-notify` Edge Function
- Recurring expenses (cron-based Edge Function: `recurring-processor`)
- Subscriptions manager tab (view layer over recurring expense data — ship with recurring)
- Comments and emoji reactions on expenses
- Smart reminders (opt-in, non-aggressive — add when settlement rate data justifies it)
- Spending insights / charts (victory-native + Skia — requires category tagging on expenses to be meaningful)
- Swipe-to-settle gestures (react-native-gesture-handler)

**Research flag:** Push notification architecture (EAS Push + OneSignal + DB webhook trigger chain) has integration gotchas around token expiry and reinstall scenarios. A focused research-phase is recommended before building. Recurring expense cron handling (Supabase scheduled functions or client-triggered) should be validated against current Supabase Edge Function scheduling capabilities.

---

### Phase 4: AI Receipt Scanning

**Rationale:** Receipt scanning is isolated from the core loop (it produces a draft that feeds into expense entry, which already works). It is deliberately deferred to validate that manual entry UX is solid before introducing a complex AI-assisted flow. This also allows the team to establish API cost baselines before adding per-scan OpenAI Vision costs.

**Delivers:** One-tap receipt capture → AI itemization → per-person item assignment → expense creation; eliminates manual entry for dining out

**Features addressed:**
- Receipt scanning via expo-camera + expo-image-picker
- Image upload to Supabase Storage (private bucket, signed URLs)
- `receipt-ocr` Edge Function (OpenAI GPT-4o Vision — API key server-side only)
- On-device image compression before upload (keeps OCR cost under $0.003/image)
- Draft confirmation screen (never auto-commit OCR output — Pitfall #5)
- Multi-payer receipt support (three people paid at checkout)
- Rate limiting on OCR endpoint (prevents cost attack)

**Pitfalls avoided:** OCR auto-commit without user confirmation (critical — display confidence scores, highlight low-confidence items, require explicit "Confirm & Save" tap)

**Research flag:** OpenAI Vision API prompt engineering for restaurant receipts (handling crumpled receipts, dark-lit photos, multi-column formats, multiple currencies on one receipt) needs dedicated research-phase work. Rate limiting implementation in Supabase Edge Functions is also worth verifying against current platform capabilities.

---

### Phase 5: Differentiators — Fairness Score, Group Pot, Web Dashboard

**Rationale:** These features require data history (Fairness Score needs 30+ days of settlement data to show meaningful numbers), compliance review (Group Pot must not appear to hold actual user funds), or a substantial audience (web dashboard). Building them early produces empty, confusing screens that cause churn rather than retention.

**Delivers:** Advanced engagement and social features for power users with sufficient history

**Features addressed (P3/future):**
- Fairness Score (show only after 10+ settlements; gate behind feature flag)
- Group savings Pot (requires compliance/legal review; clearly labeled as tracker, not banking)
- In-app payment deep-links to Venmo/CashApp/PayPal with pre-filled amounts
- OAuth (Google/Apple sign-in) to reduce onboarding friction for new users
- Web dashboard (Supabase's API works identically from React web; routing via expo-router web target)

**Research flag:** Group Pot requires legal research on virtual account/savings tracker liability in target markets before any implementation. This is a non-technical research dependency. OAuth integration (Google/Apple) is well-documented but has App Store review implications worth verifying.

---

### Phase Ordering Rationale

The ordering follows two hard constraints from the research:

1. **Feature dependency chain:** Auth → Groups → Expenses → Balances → Debt Simplification → Settlement is a strict dependency sequence. No phase can skip ahead.

2. **Pitfall timing:** Six of the ten critical pitfalls must be addressed in Phase 1 schema design. Any phase that adds features before the schema is correct creates a migration crisis. This is why Phase 1 contains only infrastructure work — zero user-facing features.

The architecture research confirms a third constraint: offline-first is not a feature that can be added in Phase 3. The MMKV persister, React Query offline mutation queue, and version columns for conflict resolution must all be in place before any expense data is written.

Receipt scanning is Phase 4 rather than Phase 2 because: (a) it depends on working expense entry that users have already validated; (b) it introduces external API cost that is easier to manage once usage patterns are known; and (c) the OCR confirmation UX requires careful design that is harder to get right without user feedback on manual entry flow first.

### Research Flags

**Needs dedicated research-phase during planning:**
- Phase 2 (debt-simplify): Schulman's algorithm implementation in Deno Edge Function — verify the server-side trigger chain and stored result table design
- Phase 3 (push notifications): EAS Push + OneSignal token lifecycle, DB webhook trigger → Edge Function → FCM/APNs chain, token refresh on reinstall
- Phase 3 (recurring expenses): Supabase Edge Function scheduling — verify current cron scheduling capabilities and limitations
- Phase 4 (OCR): OpenAI Vision prompt engineering for diverse receipt formats; rate limiting in Edge Functions; image compression pipeline

**Standard patterns (skip research-phase):**
- Phase 1 (foundation): Expo + Supabase setup is thoroughly documented; EAS dev client creation is a standard workflow
- Phase 2 (core loop): React Query optimistic updates, Supabase Realtime invalidation, RLS policies, and settlement math are well-covered in official docs
- Phase 5 (differentiators): Defer research until Phase 4 is complete; domain-specific compliance research for Group Pot is the main unknown

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against live npm registry (2026-02-27). Peer dependency compatibility matrix fully mapped. One critical trap documented: pin tailwindcss@^3.4.17. |
| Features | MEDIUM | Competitor feature analysis and user frustration patterns are well-documented from training data through Aug 2025. Live web fetch was not available; competitive feature tables should be verified against current app store listings before shipping. Core feature prioritization is HIGH confidence — the dependency graph and MVP definition are derived from the project requirements, not web scraping. |
| Architecture | HIGH | Patterns sourced from official Supabase, TanStack Query v5, and Expo Router documentation. The feature-hook → React Query → Supabase layering is a proven pattern for this exact stack. RLS and Edge Function patterns are authoritative. |
| Pitfalls | MEDIUM | Deep domain expertise. Float arithmetic and RLS pitfalls are universal Supabase patterns. Offline conflict resolution and OCR confirmation pitfalls are well-documented in the field. Version-specific details (MMKV v4 Nitro Modules, reanimated v4 worklets peer) flagged for re-validation during Phase 1 scaffolding. |

**Overall confidence:** HIGH for technical decisions; MEDIUM for competitive positioning (verify competitor features at ship time)

### Gaps to Address

- **Reanimated v3 vs v4 compatibility:** victory-native and @shopify/react-native-skia have complex peer dependency relationships with react-native-reanimated. The stack recommends v4 but documents the v3 fallback. This must be resolved during Phase 1 scaffolding by running a dependency resolution check (`pnpm install` with all chart and animation deps) before committing to either version.

- **Supabase Edge Function scheduling:** The recurring expense processor (`recurring-processor`) requires cron scheduling. Supabase added native cron scheduling to Edge Functions but the maturity and limitations of this feature should be verified at Phase 3 planning time.

- **OpenAI Vision cost at scale:** The research uses the free/low-tier OpenAI Vision estimate (~$0.003/image at 512px). This must be validated against actual API pricing and the expected receipt image sizes in production before Phase 4 begins.

- **NativeWind v5 timeline:** NativeWind v5 (with Tailwind CSS v4 support) is in active development as of Feb 2026. The project pins Tailwind v3. Monitor the NativeWind GitHub for v5 milestones — a major version upgrade mid-project would require a styling layer migration. Check again at Phase 3.

- **Competitor feature verification:** FEATURES.md explicitly notes that the competitor feature table was based on training data through Aug 2025. Before shipping, cross-check that Splitwise has not changed its free tier terms and that no new competitor has launched with an equivalent offering.

---

## Sources

### Primary (HIGH confidence)
- npm registry live query (2026-02-27) — all version numbers and peer dependency compatibility in STACK.md
- Supabase official docs — Auth, Realtime, Edge Functions, RLS patterns in ARCHITECTURE.md
- TanStack Query v5 official docs — offline persistence, optimistic updates, persist-client in ARCHITECTURE.md
- Expo Router v3 official docs — file-based routing, route groups, layout patterns in ARCHITECTURE.md
- react-native-mmkv official docs — MMKV vs AsyncStorage performance benchmarks

### Secondary (MEDIUM confidence)
- Training data through August 2025 — Splitwise, Tricount, Settle Up, Splittr feature sets
- Reddit community patterns (r/Splitwise, r/personalfinance, r/androidapps) — Splitwise 2023-2025 monetization frustration analysis
- App Store review patterns for Splitwise iOS/Android (2023-2025 timeline) — user pain point severity ranking
- Schulman's debt simplification algorithm (graph theory) — debt graph approach in ARCHITECTURE.md

### Tertiary (LOW confidence, verify at implementation)
- OpenAI Vision API cost estimates — verify current tier 1 pricing before Phase 4
- Supabase Edge Function cron scheduling maturity — verify capabilities before Phase 3 recurring expense implementation
- NativeWind v5 (Tailwind v4 support) timeline — monitor GitHub; not yet released as of Feb 2026

---
*Research completed: 2026-02-27*
*Ready for roadmap: yes*

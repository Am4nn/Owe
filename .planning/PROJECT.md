# Owe — Next-Gen Expense Splitting App

## What This Is

Owe is a free, cross-platform (iOS + Android) expense splitting app for travelers, housemates, couples, and friend groups. It replaces Splitwise by offering all premium features for free — all split modes, push notifications, multi-currency FX support, CSV export, and a modern fintech UI with dark mode and micro-animations. The v1.0 MVP shipped with 42 requirements fully satisfied; the core split-tracking loop, offline-first sync, Google OAuth, and engagement layer are all live.

## Core Value

Users can split expenses, track shared debts, and settle up with friends without limits, ads, or paywalls — in a UI that feels like a modern bank app, not a spreadsheet.

## Requirements

### Validated

- ✓ Auth: Sign up, sign in, session persistence, profile creation — v1.0
- ✓ Google OAuth sign-in with automatic account linking — v1.0
- ✓ Groups: Create, invite by email, named-only members, view all, leave — v1.0
- ✓ Manual expense entry with equal, exact, percentage, and shares split types — v1.0
- ✓ Balance calculation and debt simplification (greedy graph algorithm, Edge Function) — v1.0
- ✓ Offline-first with sync on reconnect (React Query persistence + MMKV + resumePausedMutations) — v1.0
- ✓ Activity feed with expense events (added/edited/deleted), comments, and reactions — v1.0
- ✓ Smart reminders for unpaid debts (configurable delay, pg_cron) — v1.0
- ✓ Multi-currency with real-time FX rates (snapshotted at creation) — v1.0
- ✓ CSV export via expo-sharing — v1.0
- ✓ Push notifications for new expenses and settlements (deep-link to expense detail) — v1.0
- ✓ Settlement flow with confetti animation + haptic feedback — v1.0

### Active

- [ ] Receipt scanning with AI (OpenAI Vision) — itemization + multi-payer support (RCPT-01–05)
- [ ] Recurring expenses and subscriptions manager tab (RECR-01–03)
- [ ] Charts & spending insights by category, fairness score (INSI-01–02)
- [ ] PDF export (EXPE-01)
- [ ] Apple Sign-In (deferred from v1.0 — needs Apple Developer entitlements)

### Out of Scope

- In-app payment rails (Plaid/Stripe) — regulatory complexity, Phase 4+
- WhatsApp / Telegram bot integration — external API dependency, Phase 4+
- Web dashboard — mobile-first product, Phase 4+
- B2B team plans — monetization milestone, Phase 4+
- Real-time group chat — high infrastructure cost, comments on expenses cover dispute resolution
- Ads or freemium feature gating — against core philosophy, tip jar only
- Public social feed — privacy risk, all data stays private to group members
- Crypto settlement — regulatory gray area, negligible user segment
- AI spending advice / budgeting coach — out of scope, liability risk

## Context

- **Shipped v1.0:** 2026-03-01 — 42/42 requirements, 7 phases, 15 plans, ~5,800 LOC TypeScript/TSX
- **Competitor:** Splitwise — users frustrated by 3-4 expense/day cap, mandatory ads, paywalled receipt scanning ($5/month)
- **Brand:** Modern fintech (Monzo/Revolut/Cash App meets social). Dark mode native, neon accents (electric blue / energetic purple), micro-animations, haptic feedback
- **Design Reference:** Living Stitch design board — check before building UI for aesthetics alignment (glassmorphism, dark mode)
- **Design System Tooling:** `ui-ux-pro-max` AI skill for consistent design tokens
- **Monetization:** Voluntary "tip jar" only — core philosophy is 100% free
- **Target segments:** Travelers/backpackers, housemates/roomies, couples, friend groups
- **Known device verification pending:** Google OAuth cold-start (Android), Realtime balance (2 simulators), confetti/haptics, offline queue replay, FX live rates, CSV export on device

## Constraints

- **Tech Stack**: React Native + Expo (iOS/Android), Supabase (PostgreSQL + Auth + Realtime + Edge Functions), Zustand + React Query (state), NativeWind/Tailwind (UI), OpenAI Vision API (OCR for v2), Open Exchange Rates (FX)
- **Package Manager**: pnpm — enforced across the project
- **Database**: PostgreSQL via Supabase — relational model required for settlement graph queries
- **Security**: Row Level Security (RLS) on all tables, JWT auth, PII encrypted at rest
- **Offline**: Must work offline-first — React Query optimistic updates + persistence layer
- **Monetary precision**: All amounts stored as INTEGER cents; dinero.js v2 for all client arithmetic — no floats

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React Native + Expo over Flutter | Richer fintech ecosystem, OTA updates, single codebase | ✓ Good — EAS dev client worked well; NativeWind dark mode delivered |
| Supabase over Firebase | PostgreSQL required for debt graph queries; NoSQL becomes nightmare for settlement math | ✓ Good — RLS + Edge Functions + Realtime all leveraged |
| OpenAI Vision for OCR | GPT-4o Vision outperforms AWS Textract for messy receipts at lower initial cost | — Pending (v2 feature) |
| Debt simplification in Edge Functions | Graph computation is heavy — runs async server-side, not on device | ✓ Good — greedy algorithm shipped in simplify-debts Edge Function |
| 100% free model | Core differentiator against Splitwise — trust & growth via word of mouth | — Pending validation |
| Integer cents + dinero.js | Float arithmetic causes irrecoverable $0.01 ghost debts | ✓ Good — computeSharesSplits last-member remainder pattern prevents drift |
| EAS custom dev client from day 1 | MMKV v4, expo-notifications, bottom-sheet require custom native builds | ✓ Good — unblocked all native modules from plan 01-01 |
| activities.actor_id FK → group_members | All mutation hooks resolve actorMember.id from group_members | ✓ Good — consistent pattern across all 6 activity-writing mutations |
| mutationFn extracted as named export | Required for setMutationDefaults to serialize/deserialize paused mutations across restarts | ✓ Good — OFFL-02 offline replay enabled for create/update/delete |
| expo-sqlite localStorage polyfill | Avoids SecureStore 2048-byte limit on JWT tokens with claims | ✓ Good — auth sessions persist correctly |
| Pin tailwindcss@^3.4.x (not v4) | NativeWind 4.x uses Tailwind v3 API; v4 silently breaks className handling | ✓ Good — prevents silent styling breakage |

---
*Last updated: 2026-03-01 after v1.0 milestone — 42/42 requirements shipped*

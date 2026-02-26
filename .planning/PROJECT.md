# Nexus — Next-Gen Expense Splitting App

## What This Is

Nexus is a free, cross-platform (iOS + Android) expense splitting app that targets travelers, housemates, couples, and friend groups. It aims to replace Splitwise by offering all the premium features for free — receipt scanning, unlimited expenses, multi-currency support, and charts — wrapped in a modern fintech UI with AI-powered intelligence. The core differentiator is making shared finances feel invisible, fair, and frictionless.

## Core Value

Users can split expenses, track shared debts, and settle up with friends without limits, ads, or paywalls — all in a UI that feels like a modern bank app, not a spreadsheet.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Auth: Sign up, sign in, session persistence, profile creation
- [ ] Groups & friends: Create groups, invite via email, 1-on-1 splits
- [ ] Manual expense entry with equal, exact, percentage, and shares split types
- [ ] Balance calculation and debt simplification (graph algorithm)
- [ ] Receipt scanning with AI (OpenAI Vision) — itemization + multi-payer support
- [ ] Multi-currency with real-time FX rates
- [ ] Offline-first with sync on reconnect (React Query persistence)
- [ ] Recurring expenses and subscriptions manager tab
- [ ] Activity feed with comments and reactions
- [ ] Smart reminders for unpaid debts
- [ ] Charts & spending insights
- [ ] CSV/PDF export
- [ ] Push notifications for new expenses and settlement requests
- [ ] Gamified fairness/settlement score (badges, profile flares)
- [ ] Group savings "Pot" goals
- [ ] Settlement flow (confetti screen when debt cleared)

### Out of Scope

- In-app payment rails (Plaid/Stripe) — Phase 4+, regulatory complexity
- WhatsApp bot integration — Phase 4+, external dependency
- Web dashboard — Phase 4+, mobile-first priority
- B2B team plans — Phase 4+, monetization milestone
- OAuth (Google/Apple) login — Nice to have, email/password sufficient for MVP
- Real-time chat — High complexity, not core value

## Context

- **Competitor:** Splitwise — users are frustrated by 3-4 expense/day cap, mandatory ads, paywalled receipt scanning ($5/month)
- **Brand:** Modern fintech (Monzo/Revolut/Cash App meets social). Dark mode native, neon accents (electric blue / energetic purple), micro-animations, haptic feedback
- **Monetization:** Voluntary "tip jar" only — core philosophy is 100% free. No ads, no paywalls
- **Target segments:** Travelers/backpackers, housemates/roomies, couples, friend groups
- **UX direction:** Gestures over buttons (swipe to settle), glassmorphism & gradients, chat-like group view, FAB for quick add

## Constraints

- **Tech Stack**: React Native + Expo (iOS/Android), Supabase (PostgreSQL + Auth + Realtime + Edge Functions), Zustand + React Query (state), NativeWind/Tailwind (UI), OpenAI Vision API (OCR), Open Exchange Rates (FX)
- **Package Manager**: pnpm — enforced across the project
- **Database**: PostgreSQL via Supabase — relational model required for settlement graph queries
- **Security**: Row Level Security (RLS) on all tables, JWT auth, PII encrypted at rest
- **Offline**: Must work offline-first — React Query optimistic updates + persistence layer

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React Native + Expo over Flutter | Richer fintech ecosystem (Plaid/Stripe SDKs), OTA updates, single codebase | — Pending |
| Supabase over Firebase | PostgreSQL required for debt graph queries; NoSQL becomes nightmare for settlement math | — Pending |
| OpenAI Vision for OCR | GPT-4o Vision outperforms custom AWS Textract for messy receipts at lower initial cost | — Pending |
| Debt simplification in Edge Functions | Graph computation is heavy — runs async server-side, not on device | — Pending |
| 100% free model | Core differentiator against Splitwise — trust & growth via word of mouth | — Pending |

---
*Last updated: 2026-02-27 after initialization*

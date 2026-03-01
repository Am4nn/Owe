# Milestones

## v1.0 MVP (Shipped: 2026-03-01)

**Phases completed:** 7 phases, 15 plans
**Timeline:** 2026-02-27 → 2026-03-01 (3 days)
**Scale:** ~5,800 LOC TypeScript/TSX, 154 files, 110 commits

**Key accomplishments:**
1. Shipped full-stack expense splitting app (Expo SDK 55 + Supabase) from zero with EAS dev client, NativeWind dark mode, and offline-first React Query architecture
2. Implemented all 4 split modes (equal/exact/percentage/shares), expense CRUD with idempotency, and server-side debt simplification via greedy graph algorithm Edge Function
3. Delivered Google OAuth sign-in with automatic account linking alongside email/password — provider-agnostic architecture, zero breaking changes
4. Built engagement layer: push notifications (expenses + settlements), multi-currency with real-time FX snapshots, smart reminder scheduling (pg_cron), and CSV export
5. Wired all expense CUD mutations to write activity rows — full activity feed coverage (expense_added, expense_edited, expense_deleted, comment_added, reaction_added)
6. Closed all audit gaps post-milestone: settlements.note column, push notification deep-link fix, and complete VERIFICATION.md audit trail across all 7 phases

**Requirements:** 42/42 v1 requirements satisfied
**Archive:** `.planning/milestones/v1.0-ROADMAP.md` · `.planning/milestones/v1.0-REQUIREMENTS.md`

---


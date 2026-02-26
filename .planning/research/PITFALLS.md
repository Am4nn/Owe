# Pitfalls Research

**Domain:** React Native + Expo + Supabase expense splitting fintech app
**Researched:** 2026-02-27
**Confidence:** MEDIUM (deep domain expertise; flag version-specific details for re-validation)

## Critical Pitfalls

### Pitfall 1: Float Currency Arithmetic

**What goes wrong:** Using JavaScript `number` or Postgres `FLOAT`/`DECIMAL` for money amounts. Penny drift accumulates across hundreds of expenses. A group of 6 splitting $47.99 repeatedly ends up with a $0.01 ghost debt that can never be resolved cleanly.

**Why it happens:** IEEE 754 floating point cannot represent many decimal fractions exactly. `47.99 / 6` in JavaScript returns `7.998333...`, not `7.9983`.

**How to avoid:**
- Store all amounts as `INTEGER` (cents) in Postgres: `$47.99` → `4799`
- Use `dinero.js` (v2) for all client-side arithmetic — it operates on integers internally
- Display amounts by dividing by 100 only at render time, never in storage or calculation

**Warning signs:** Any division operation on a money amount in client code. `parseFloat()` anywhere near financial data.

**Phase to address:** Phase 1 (schema design) — cannot be fixed retroactively without full data migration.

---

### Pitfall 2: RLS Disabled by Default on New Tables

**What goes wrong:** Supabase enables RLS as opt-in, not opt-out. Every new table created via migration has RLS disabled by default. Missing RLS on `expense_splits`, `group_members`, or `settlements` means any authenticated user can query other groups' financial data via PostgREST.

**Why it happens:** Developers test with `service_role` key (which bypasses all RLS) and never catch the gap.

**How to avoid:**
- Add `ALTER TABLE [table] ENABLE ROW LEVEL SECURITY;` to every migration immediately after `CREATE TABLE`
- Write a migration test that authenticates as User B and attempts to read User A's group data — must return 0 rows
- Never include `service_role` key in mobile app bundle or client environment variables
- Add `REVOKE ALL ON [table] FROM anon, authenticated;` then grant back only what's needed

**Warning signs:** `service_role` key appearing in `.env.local` for the Expo app. Any table without an explicit RLS policy.

**Phase to address:** Phase 1 — schema migration. Enforce in code review checklist.

---

### Pitfall 3: Debt Simplification Mutates Expense Records

**What goes wrong:** The graph simplification algorithm rewrites who owes whom by modifying or replacing expense records. User A paid User B, User B paid User C → system tells User A to pay User C directly. Users see a debt to someone they've never split with and lose trust in the app.

**Why it happens:** Developers conflate "simplified settlement path" with "correct ledger state."

**How to avoid:**
- Keep all original expense records immutable (append-only ledger)
- Debt simplification output goes into a separate `simplified_balances` table — it is a read-only view, never a mutation
- UI presents simplified settlement as "Suggested settlement" — users can see the underlying transactions
- Run simplification asynchronously in Edge Function after any expense/settlement event; never block the UI on it

**Warning signs:** Any `UPDATE` or `DELETE` on the `expenses` or `expense_splits` tables from the debt algorithm.

**Phase to address:** Phase 2 (debt simplification feature).

---

### Pitfall 4: Last-Write-Wins Offline Sync Corrupts Data

**What goes wrong:** Two users edit the same expense while one is offline. When the offline user reconnects, their version silently overwrites the online user's changes. Financial records diverge without anyone noticing.

**Why it happens:** React Query's offline mutation queue replays mutations in order but has no conflict resolution built in.

**How to avoid:**
- Add `version INTEGER NOT NULL DEFAULT 1` column to all mutable records (`expenses`, `settlements`)
- Use optimistic concurrency: mutation includes `WHERE version = $known_version`, fails if changed
- On conflict, surface a "This expense was modified — review changes" dialog instead of silent overwrite
- For offline-first simplicity in v1: treat most expense edits as append operations (soft edits create a new revision)

**Warning signs:** No `version` or `updated_at` column on mutable tables. Offline mutations that include `UPDATE ... SET` without a version check.

**Phase to address:** Phase 1 (schema) + Phase 2 (offline sync).

---

### Pitfall 5: OCR Auto-Commits Without User Confirmation

**What goes wrong:** GPT-4o Vision returns a confidently wrong itemization for crumpled, dark-lit, or multi-column receipts. The app commits the expense automatically. Users dispute the amounts and blame the app, not the receipt.

**Why it happens:** Auto-commit feels like a better UX. It isn't — financial data requires explicit confirmation.

**How to avoid:**
- OCR result is always a draft — never auto-committed
- Show the cropped receipt image alongside each extracted line item so users can verify
- Flag low-confidence items (mark in red or with ⚠) when OpenAI Vision's response includes uncertainty
- Require explicit "Confirm & Save" tap before creating any expense from OCR output
- Always show the original receipt image in the expense detail view post-commit

**Warning signs:** Any code path that creates an `expenses` record directly from OCR output without a user-confirmation screen.

**Phase to address:** Phase 3 (receipt scanning).

---

### Pitfall 6: FX Rate Stored at Query Time Instead of Expense Creation Time

**What goes wrong:** A USD/EUR expense is created today at rate 0.92. Tomorrow the rate is 0.89. The balance view recalculates using tomorrow's rate. User A sees they owe €46, User B sees they're owed €43.50 — from the same expense. Group members see different totals.

**Why it happens:** Using a live FX rate lookup in the balance query instead of storing the historical rate.

**How to avoid:**
- `expenses` table includes `fx_rate_at_creation NUMERIC(12,6)` and `base_currency TEXT` columns — set at insert time, never updated
- All balance calculations use `amount_original * fx_rate_at_creation` — the historical snapshot
- Current FX rates are only used for new expense creation display (conversion preview)
- FX rate cache in `fx_rates` table is for display and new expense entry only

**Warning signs:** Balance query that JOINs to a live FX rates table or calls an API.

**Phase to address:** Phase 1 (schema) + Phase 2 (multi-currency).

---

### Pitfall 7: Expo Go Used Beyond Day One

**What goes wrong:** The team prototypes using Expo Go for weeks. When they add MMKV, expo-notifications, or @gorhom/bottom-sheet, builds break because these require native modules unavailable in Expo Go's pre-built binary.

**Why it happens:** Expo Go is convenient and fast to start with. Teams defer the custom dev client setup.

**How to avoid:**
- Create an EAS custom dev client build in Phase 1 before any native module is added
- Use Expo Go only for the first day of "does the project open?" validation
- Document in the README: "This project requires a dev client build — see setup guide"

**Warning signs:** Team members unable to test a feature because "it breaks in Expo Go."

**Phase to address:** Phase 1 (project scaffolding).

---

### Pitfall 8: `service_role` Key in the Mobile App

**What goes wrong:** A developer hardcodes the Supabase `service_role` key in the app's environment file. The key is bundled into the app binary. It can be extracted with standard reverse engineering tools. The key bypasses all RLS — attacker can read every user's financial data.

**Why it happens:** The `service_role` key is needed for Edge Functions and admin operations; developers confuse it with the `anon` key.

**How to avoid:**
- Mobile app uses only the `anon` key + user JWT (from Supabase Auth)
- `service_role` key lives only in Edge Function environment variables (Supabase Vault) and CI/CD secrets
- Add a CI check: scan the built `.js` bundle for the `service_role` key string — fail if found

**Warning signs:** `SUPABASE_SERVICE_KEY` in `app.config.js` or `.env` that is used by the Expo app.

**Phase to address:** Phase 1. Also enforce in security review before any public release.

---

### Pitfall 9: Debt Graph Run on the Client Device

**What goes wrong:** The NP-hard debt simplification algorithm runs in JavaScript on the user's phone. For groups with 20+ members and 500+ expenses, it blocks the JS thread for 2-5 seconds, freezing the UI. Results are inconsistent if two clients run slightly different algorithm versions.

**Why it happens:** "Just compute it locally" seems simpler than setting up an Edge Function.

**How to avoid:**
- Debt simplification runs exclusively in the `debt-simplify` Supabase Edge Function (Deno, server-side)
- Triggered by a Postgres DB trigger after any INSERT/UPDATE on `expenses` or `settlements`
- Result stored in `simplified_balances` table — clients just read a pre-computed result
- A client-side version may exist for instant UI preview only (not authoritative)

**Warning signs:** `for` loops over all group expenses in a React component or hook.

**Phase to address:** Phase 2 (debt simplification).

---

### Pitfall 10: Fairness Score / Group Pot as Day-One Features

**What goes wrong:** Fairness Score with 2 expenses shows "100%" for everyone — meaningless. Group Pot with zero contributions looks like a broken feature. Users churn thinking the app doesn't work.

**Why it happens:** Shipping differentiators early to impress users. But these features require data history to be meaningful.

**How to avoid:**
- Fairness Score: defer to v2. Requires 30+ days of settlement history to be meaningful. Show placeholder "Score unlocks after 10 settlements."
- Group Pot: defer to v2. Requires legal/compliance review (must not appear to hold user funds).
- Both features should be hidden behind a feature flag until data thresholds are met.

**Warning signs:** Fairness Score or Group Pot appearing in Phase 1 or Phase 2 scope.

**Phase to address:** Phase 4+ (differentiators milestone).

---

## Technical Debt Patterns

| Pattern | Risk | Prevention |
|---------|------|------------|
| `parseFloat()` on monetary values | Data corruption | Use `dinero.js` + integer storage everywhere |
| Hardcoded group IDs in queries | Security bypass | All queries parameterized; RLS as backstop |
| Edge Function timeouts not handled | Silent data loss | Always use `try/catch` + dead letter queue for Edge Fn failures |
| Missing `created_at`/`updated_at` on tables | Impossible debugging | Add to every table via Supabase default `now()` |
| React Query `staleTime: 0` everywhere | Excessive API calls on mobile | Set appropriate stale times per query type |
| No idempotency on expense creation | Duplicate expenses on retry | Add `idempotency_key` UUID to expenses table |
| Inline SQL in Edge Functions | Migration drift | All schema changes via `supabase/migrations/` only |
| Push token stored only client-side | Notifications break on reinstall | Store `push_token` in `users` table, refresh on each app launch |
| No pagination on expense lists | App freezes on old groups | All list queries use cursor-based pagination from Phase 1 |
| Settlement without balance validation | Negative balances | Validate `amount <= outstanding_balance` before settlement insert |

---

## Integration Gotchas

| Integration | Gotcha | Mitigation |
|-------------|--------|------------|
| OpenAI Vision API | Rate limits: 500 RPM on tier 1 | Queue requests; show loading state; graceful error "Try again" |
| OpenAI Vision API | Cost: ~$0.003/image at 512px | Compress receipt images to <1MB before upload |
| Open Exchange Rates | Free tier: 1,000 req/month | Cache aggressively in `fx_rates` table; single hourly cron fetch |
| Supabase Realtime | 200 concurrent connections on free tier | Unsubscribe when screen blurs; one channel per active group |
| Supabase Storage | No built-in image compression | Compress on-device before upload (expo-image-manipulator) |
| OneSignal | Push tokens expire; users reinstall | Re-register token on every app foreground; upsert in DB |
| Expo EAS Build | Build times 10-20 min on free tier | Cache native dependencies; only rebuild when native deps change |
| Supabase Edge Functions | Cold start ~300-500ms | Not suitable for latency-sensitive operations; pre-warm if needed |
| react-native-mmkv v4 | Requires Nitro Modules / custom dev client | Cannot use with Expo Go; set up dev client in Phase 1 |
| NativeWind 4.x | Incompatible with Tailwind v4 | Pin `tailwindcss@^3.4.17` in package.json |

---

## Security Mistakes

| Mistake | Impact | Prevention |
|---------|--------|------------|
| `service_role` key in mobile app | Full DB access for attacker | Only in Edge Function env vars + CI secrets |
| RLS not enabled on new tables | Data leakage across groups | Enable RLS + write policy in same migration |
| Receipt images in public bucket | Receipts viewable without auth | Use signed URLs (1hr expiry); private bucket only |
| JWT not validated in Edge Functions | Unauthenticated access to heavy operations | Always validate `Authorization: Bearer` header in Edge Fn |
| PII in console logs | Data in crash reports / logs | Strip PII before logging; use masked format |
| No rate limiting on OCR endpoint | Cost attack ($$$) | Add Supabase Edge Function rate limiting by user ID |
| Shared test accounts in CI | Real data in automated tests | Use dedicated test Supabase project with seeded data only |
| Deep link without validation | Malicious links trigger settlement | Validate all deep link params server-side before acting |

---

## Pitfall-to-Phase Mapping

| Pitfall | Must Address In |
|---------|----------------|
| Float currency (use integer cents) | Phase 1 — schema |
| RLS on all tables | Phase 1 — schema |
| FX rate at creation column | Phase 1 — schema |
| Idempotency key on expenses | Phase 1 — schema |
| Custom dev client (no Expo Go) | Phase 1 — scaffolding |
| service_role key security | Phase 1 — env setup |
| Offline sync version column | Phase 1 — schema |
| Debt graph runs server-side only | Phase 2 — debt simplification |
| Last-write-wins conflict resolution | Phase 2 — offline sync |
| OCR always requires user confirmation | Phase 3 — receipt scanning |
| Fairness Score deferred | Phase 4+ |
| Group Pot legal review | Phase 4+ |

---
*Pitfalls research for: React Native + Expo + Supabase expense splitting fintech app*
*Researched: 2026-02-27*

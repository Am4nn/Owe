---
phase: 03-engagement-layer
plan: 02
subsystem: currency, export, ui
tags: [multi-currency, fx-rates, supabase-edge-function, expo-file-system, expo-sharing, react-native-modal, csv-export]

# Dependency graph
requires:
  - phase: 03-01
    provides: fx_rates table migration created in 03-01 DB schema; push notification chain that validates Edge Function deploy pattern
  - phase: 02-01
    provides: createExpenseMutationFn extracted as named export, Expense and CreateExpenseInput types

provides:
  - Hourly fx-rates-cache Edge Function fetching fawazahmed0 CDN and upserting fx_rates table
  - FxRate + CurrencyOption type definitions in src/features/currency/types.ts
  - COMMON_CURRENCIES list (49 currencies), useFxRates hook (30-min staleTime), computeBaseCents helper
  - exportGroupCsv function with UTF-8 BOM and RFC 4180 quoting via expo-file-system v2 + expo-sharing
  - useUpdateGroupCurrency mutation for CURR-01 group base currency management
  - ExpenseCard dual-amount display when expense.currency !== expense.base_currency
  - Group detail screen with searchable base currency picker modal and Export CSV button
  - Expense form currency picker with live FX preview and graceful fallback when fx_rates table is empty
affects:
  - 04-polish (any UI refinement will touch ExpenseCard and expense form)
  - future settlement flows (if multi-currency settlements added, computeBaseCents is the single source of truth)

# Tech tracking
tech-stack:
  added:
    - expo-file-system ~55.0.10 (v2 API — File + Paths.cache classes, NOT legacy writeAsStringAsync)
  patterns:
    - FX snapshot pattern: rate stored at INSERT time via computeBaseCents, never recalculated on read
    - Currency-aware formatting: formatAmount(cents, currencyCode) — USD gets $ prefix, others get code prefix
    - Graceful FX fallback: when fx_rates table empty (first run before cron), fxRate=1.0, amountBaseCents=amountCents, base_currency=expenseCurrency
    - Modal currency picker: searchable FlatList of COMMON_CURRENCIES with highlight for current selection

key-files:
  created:
    - supabase/functions/fx-rates-cache/index.ts
    - src/features/currency/types.ts
    - src/features/currency/hooks.ts
    - src/features/export/hooks.ts
  modified:
    - src/features/expenses/types.ts
    - src/features/expenses/hooks.ts
    - src/features/groups/hooks.ts
    - src/components/expenses/ExpenseCard.tsx
    - app/(app)/groups/[id]/index.tsx
    - app/(app)/expenses/new.tsx
    - package.json

key-decisions:
  - "expo-file-system v2 uses File + Paths.cache class API — legacy writeAsStringAsync/cacheDirectory removed at runtime (will throw); must use new File(Paths.cache, filename).write(content)"
  - "CZK appeared twice in COMMON_CURRENCIES list in plan — deduplicated to 49 unique entries"
  - "Currency picker search filters on both code and name to support EUR and Euro searches"
  - "computeBaseCents exported as pure function (not hook) — can be called inside event handlers and onSubmit without React rules"

patterns-established:
  - "FX snapshot at INSERT: computeBaseCents called at submit time; result stored as amount_base_cents + fx_rate_at_creation + base_currency — never recalculated"
  - "Graceful empty fx_rates fallback: rates={} causes expenseRate=1, baseRate=1, fxRate=1.0 (identity conversion) — form never blocked"
  - "expo-file-system v2 pattern: new File(Paths.cache, filename).write(string) then file.uri passed to Sharing.shareAsync"

requirements-completed: [CURR-01, CURR-02, CURR-03, CURR-04, EXPT-01]

# Metrics
duration: 6min
completed: 2026-03-01
---

# Phase 3 Plan 02: Multi-Currency FX Support + CSV Export Summary

**Hourly fawazahmed0 Edge Function keeps fx_rates fresh; expense form snapshots rate at creation; ExpenseCard shows dual amounts; group screen gains base currency picker and CSV export via native share sheet**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-03-01T00:33:36Z
- **Completed:** 2026-03-01T00:39:05Z
- **Tasks:** 2
- **Files modified:** 10 (4 created, 6 modified, package.json updated)

## Accomplishments

- FX rates fetched hourly from fawazahmed0 CDN and stored in fx_rates table via Supabase Edge Function scheduled by pg_cron (depends on 03-01 migration)
- Multi-currency expense creation: form shows currency picker + live conversion preview; FX rate snapshotted at INSERT time via computeBaseCents; graceful fallback when fx_rates table is empty
- ExpenseCard shows original amount (expense.currency) + secondary converted amount (expense.base_currency) whenever currencies differ
- Group detail screen: searchable base currency picker modal (49 currencies) + Export CSV button generating RFC 4180 CSV with UTF-8 BOM via native share sheet

## Task Commits

Each task was committed atomically:

1. **Task 1: fx-rates-cache Edge Function + currency hooks + FX-aware expense creation** - `09dbe4f` (feat)
2. **Task 2: Currency picker UI + ExpenseCard dual amounts + CSV export** - `a891570` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified

- `supabase/functions/fx-rates-cache/index.ts` - Hourly Deno Edge Function: fetches fawazahmed0 CDN, upserts all currency rows into fx_rates table (CURR-03)
- `src/features/currency/types.ts` - FxRate and CurrencyOption interface definitions
- `src/features/currency/hooks.ts` - COMMON_CURRENCIES list (49 currencies), useFxRates hook with 30-min staleTime, computeBaseCents pure function
- `src/features/export/hooks.ts` - exportGroupCsv: builds RFC 4180 CSV with UTF-8 BOM using expo-file-system v2 File API + expo-sharing (EXPT-01)
- `src/features/expenses/types.ts` - CreateExpenseInput extended with optional base_currency, fx_rate_at_creation, amount_base_cents fields
- `src/features/expenses/hooks.ts` - createExpenseMutationFn destructures and stores FX snapshot fields at INSERT; additive change preserves existing callers
- `src/features/groups/hooks.ts` - useUpdateGroupCurrency mutation: updates groups.base_currency, invalidates group queries (CURR-01)
- `src/components/expenses/ExpenseCard.tsx` - formatCents replaced with currency-aware formatAmount; dual-amount View with secondary text when currencies differ (CURR-04)
- `app/(app)/groups/[id]/index.tsx` - Added base currency picker modal (searchable FlatList) and Export CSV button; imports useFxRates, COMMON_CURRENCIES, exportGroupCsv, useUpdateGroupCurrency (CURR-01, EXPT-01)
- `app/(app)/expenses/new.tsx` - Added currency picker modal, useFxRates hook call, computeBaseCents at submit time with FX preview label; graceful fallback for empty rates table (CURR-02, CURR-03)
- `package.json` - Added expo-file-system ~55.0.10

## Decisions Made

- **expo-file-system v2 API:** v55 uses `File` + `Paths.cache` class API — the `cacheDirectory` property and `writeAsStringAsync` from v1 legacy are deprecated and throw at runtime. Used `new File(Paths.cache, filename).write(content)` with `file.uri` for sharing.
- **CZK duplicate removed:** COMMON_CURRENCIES in the plan had CZK listed twice; deduplicated to 49 unique entries.
- **computeBaseCents as pure function:** Exported as a standalone function (not a hook) so it can be called inside `onSubmit` event handlers without violating React rules.
- **Graceful empty-table fallback:** When `fxRates` is undefined or empty, `rates={}` causes `expenseRate=1, baseRate=1, fxRate=1.0` — identity conversion, form never blocked, amount_base_cents equals amount_cents.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] expo-file-system missing from package.json**
- **Found during:** Task 2 (export/hooks.ts implementation)
- **Issue:** `expo-file-system` was not in package.json; import would fail at build time
- **Fix:** Ran `npx expo install expo-file-system` — installed version ~55.0.10 (SDK-55-compatible)
- **Files modified:** package.json, package-lock.json
- **Verification:** TypeScript compiles without errors; FileSystem module resolves
- **Committed in:** a891570 (Task 2 commit)

**2. [Rule 1 - Bug] expo-file-system v2 API change: writeAsStringAsync/cacheDirectory removed**
- **Found during:** Task 2 — TypeScript check revealed `cacheDirectory` and `EncodingType` do not exist on v2 module
- **Issue:** Plan specified v1 legacy API (`FileSystem.cacheDirectory`, `FileSystem.EncodingType.UTF8`, `writeAsStringAsync`) which no longer exist in expo-file-system v2; would throw at runtime
- **Fix:** Rewrote export hook using v2 class-based API: `new File(Paths.cache, filename).write(content)` and `file.uri` for sharing
- **Files modified:** src/features/export/hooks.ts
- **Verification:** TypeScript compiles; no v1 API usage remains
- **Committed in:** a891570 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking missing dependency, 1 breaking API bug)
**Impact on plan:** Both fixes were necessary for the code to compile and run. The v2 API rewrite preserves the exact same behavior (write CSV to cache, share via native sheet). No scope creep.

## Issues Encountered

- Pre-existing TypeScript errors in `app/(app)/groups/new.tsx` (zodResolver type mismatch) and `src/lib/persister.ts` (MMKV `.delete` property) — these are unrelated to this plan and were not introduced by these changes. Logged to deferred-items context but not fixed (out-of-scope pre-existing errors).

## User Setup Required

None — the fx-rates-cache Edge Function deploys alongside the other Edge Functions. The pg_cron schedule was already configured in the 03-01 migration. No additional dashboard configuration required.

## Next Phase Readiness

- CURR-01 through CURR-04 and EXPT-01 all complete — Phase 3 is fully delivered
- fx-rates-cache Edge Function ready to deploy with `supabase functions deploy fx-rates-cache`
- All multi-currency infrastructure in place for Phase 4 (polish) — ExpenseCard, expense form, and group screen all multi-currency aware

---
*Phase: 03-engagement-layer*
*Completed: 2026-03-01*

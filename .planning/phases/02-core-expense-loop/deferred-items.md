# Deferred Items — Phase 02 Core Expense Loop

## Pre-existing TypeScript Errors (out of scope for 02-01)

These errors existed before Plan 02-01 execution and are not caused by changes in this plan.

### 1. app/(app)/groups/new.tsx — zodResolver type mismatch

**File:** `app/(app)/groups/new.tsx` lines 22, 119
**Error:** `Resolver<{base_currency?: string|undefined}>` vs `Resolver<{base_currency: string}>` mismatch; `SubmitHandler<TFieldValues>` incompatibility
**Origin:** Phase 1 Plan 03 — `feat(01-03)` commit
**Fix:** Use `z.string().default('USD')` instead of `.default()` on zod schema, and add explicit generic to `useForm<CreateGroupForm>()`

### 2. src/lib/persister.ts — MMKV `delete` method

**File:** `src/lib/persister.ts` line 35
**Error:** `Property 'delete' does not exist on type 'MMKV'` — MMKV v4 uses `remove()` not `delete()`
**Origin:** Phase 1 Plan 04
**Fix:** Change `storage.delete(key)` to `storage.remove(key)`

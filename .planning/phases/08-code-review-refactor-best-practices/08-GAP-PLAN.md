---
phase: 8
plan: 4
wave: 1
gap_closure: true
---

# Plan 8.4: Gap Closure — Architecture & Consistency

## Objective
Address architectural violations (leaky state), inconsistent UX (missing QueryGuards), and brittle type-casting identified in the 08-AUDIT.

## Context
Load these files for context:
- .gsd/ROADMAP.md
- .gsd/STATE.md
- .planning/phases/08-code-review-refactor-best-practices/08-AUDIT.md
- src/components/ui/CurrencyPickerModal.tsx
- src/features/balances/hooks.ts
- app/(app)/expenses/new.tsx

## Tasks

<task type="auto">
  <name>Encapsulate CurrencyPickerModal State</name>
  <files>
    src/components/ui/CurrencyPickerModal.tsx
    app/(app)/expenses/new.tsx
  </files>
  <action>
    1. Move `searchQuery` and filtering logic from `expenses/new.tsx` into `CurrencyPickerModal.tsx`.
    2. Remove search props from the component interface.
    3. Update all callers to the simplified interface.
  </action>
  <verify>Check that `expenses/new.tsx` no longer manages search state for currency.</verify>
  <done>Currency search works entirely within the modal without parent intervention.</done>
</task>

<task type="auto">
  <name>Expand QueryGuard Coverage</name>
  <files>
    app/(app)/settlement/new.tsx
    app/(app)/expenses/[id]/edit.tsx
  </files>
  <action>
    1. Wrap screen contents in `<QueryGuard query={...}>`.
    2. Remove manual ActivityIndicators and null checks for main queries.
  </action>
  <verify>Grep for `QueryGuard` in these files.</verify>
  <done>Both screens consistently use QueryGuard for primary data fetching.</done>
</task>

<task type="auto">
  <name>Harden Feature Hook Types</name>
  <files>
    src/features/groups/hooks.ts
    src/features/balances/hooks.ts
  </files>
  <action>
    1. Define interfaces for joined Supabase responses.
    2. Replace `as unknown` casts with proper generic usage or mapping functions.
    3. Optimize `useBalanceSummary` by hoisting `requireUserId`.
  </action>
  <verify>Run `pnpm tsc --noEmit`</verify>
  <done>Zero `as unknown` cheats in these hooks; full type safety preserved.</done>
</task>

## Must-Haves
- [x] Modal encapsulation (DRY compliance)
- [x] Universal QueryGuard on primary screens
- [x] Type-safety without "cheating"

## Success Criteria
- [x] All tasks verified passing
- [x] `tsc` passes without errors
- [x] UX consistency for loading/error states

---
phase: 8
plan: fix-oauth-warmup
wave: 1
gap_closure: true
---

# Fix Plan: OAuth Warmup Extraction

## Problem
The `useOAuthWarmUp` hook was never extracted during Phase 08-02, leaving duplicated `WebBrowser` and `Platform` warm-up code in `sign-in.tsx` and `sign-up.tsx`. This violates the must-haves for isolating platform-specific logic and DRY principles.

## Tasks

<task type="auto">
  <name>Extract useOAuthWarmUp</name>
  <files>
    - src/hooks/useOAuthWarmUp.ts
    - app/(auth)/sign-in.tsx
    - app/(auth)/sign-up.tsx
  </files>
  <action>
    1. Create `src/hooks/useOAuthWarmUp.ts` that uses `warmUpBrowser` and `coolDownBrowser` from `src/lib/platform`.
    2. Replace the duplicated `WebBrowser.warmUpAsync` and `Platform.OS === 'web'` checks in the auth screens with `useOAuthWarmUp()`.
    3. Remove `Platform`, `WebBrowser`, and `Linking` imports from the auth screens.
  </action>
  <verify>Run `pnpm tsc --noEmit` to ensure types pass. Check auth screens no longer import `Platform`.</verify>
  <done>Code matches the 08-02-PLAN specification.</done>
</task>

---
phase: 8
plan: fix-oauth-warmup
wave: 1
gap_closure: true
---

# Summary: OAuth Warmup Extraction

## What Was Done
1. Created `src/hooks/useOAuthWarmUp.ts` using the platform-independent `warmUpBrowser` and `coolDownBrowser` functions from `src/lib/platform`.
2. Extracted the duplicated `WebBrowser.warmUpAsync` and `Platform.OS === 'web'` boilerplate blocks from `app/(auth)/sign-in.tsx` and `app/(auth)/sign-up.tsx`.
3. Used the new `useOAuthWarmUp()` hook inside both auth screens.
4. Removed unnecessary imports (`Platform`, `WebBrowser`, `Linking`, `createSessionFromUrl`) from auth screens.

## Why This Was Done
This fixes the unresolved "Must-Haves" from Phase 08-02 regarding DRY principles and strictly isolating cross-platform branching logic underneath the library wrappers.

## Verification
- `pnpm tsc --noEmit` completed without errors.
- `Platform`, `Linking` and `WebBrowser` no longer exist in `app/(auth)/sign-in.tsx` and `app/(auth)/sign-up.tsx`.

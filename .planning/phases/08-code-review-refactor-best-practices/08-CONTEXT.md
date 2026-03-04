# Phase 8: Code Review, Refactor & Best Practices - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Systematically review and refactor the entire codebase for correctness, maintainability, and scalability — covering architecture, DRY principle, cross-platform abstraction strategy, and general code quality — before the major UI/UX overhaul begins in Phase 9. No new user-facing features. No visual redesigns.

</domain>

<decisions>
## Implementation Decisions

### Refactor Depth & Risk Tolerance
- **Full restructure** — fix all 11 identified issues AND do broader cleanup (rename inconsistencies, normalize imports, reorganize files/folders where needed). Maximum long-term benefit.
- **N+1 query fix: client-side batch** — reduce `useBalanceSummary` from 2N+1 → 3 queries using batch fetches + JS computation. No DB migrations. (RPC approach documented for future scaling.)
- **Test new pure utilities only** — add ~10-15 unit tests for `formatMoney()`, `formatDate()`. Don't mock Supabase for infrastructure wrappers. Existing 15 `splits.test.ts` cases must stay green.
- **Plan-by-plan verification** — complete Plan 08-01 → verify (`tsc --noEmit` + `pnpm test` + smoke test) → commit. Then 08-02 → verify → commit. Then 08-03 → verify → commit. No big-bang.

### Cross-Platform Strategy
- **Hybrid approach** (industry standard) — use `.native.ts`/`.web.ts` file extensions for multi-line platform-specific blocks (persister, browser warm-up). Keep `Platform.OS` inline for 1-liner guards (notification checks, `skipBrowserRedirect`). Confirmed via React Native docs, Expo docs, and community consensus.
- **Split `persister.ts` now** — create `persister.native.ts` (MMKV) and `persister.web.ts` (localStorage) to set the pattern and enable tree-shaking.
- **Add `Platform.OS` guard to `ConfettiScreen` haptics** — inline 1-liner to prevent `Haptics.notificationAsync()` firing on web.
- **Platform files live next to originals** — `src/lib/persister.native.ts` alongside `src/lib/persister.ts` (barrel). Not centralized in a `platform/` folder. Matches Expo convention and keeps imports unchanged.

### Naming & Domain Boundaries
- **Extract invites to `features/invites/`** — move 4 invite hooks (`useClaimInvites`, `usePendingInvites`, `useAcceptInvite`, `useDeclineInvite`) out of `groups/hooks.ts` into their own domain.
- **Rename `getCurrentUserId` → `requireUserId`** — clearer contract (signals it throws if unauthenticated). Since all 4 files are being touched for extraction anyway, rename is free.
- **Rename `export/hooks.ts` → `export/utils.ts`** — the file contains a plain async function, not React hooks. Accurate naming.
- **Strict layering enforcement** — components import only types/constants from features, never hooks. Extract all inline presentational code (e.g., `MemberRow`) from route screens into `components/`. Every violation fixed.

### Error Handling & User Feedback
- **`showAlert`/`showError` wrapper with `window.alert` for now** — create `src/lib/alert.ts`, wire all 8 screens through it. Architecture is correct (single call site to swap). Phase 9 replaces the implementation with a toast component — one-file change.
- **Full-screen ErrorBoundary** — industry standard (React unmounts broken tree, so banners over broken state are impossible). Simple "Something went wrong" + "Try Again" button.
- **Root + per-route error boundaries** — root boundary in `_layout.tsx` as last resort, plus boundaries around each route group (`(app)`, `(auth)`). One broken screen doesn't nuke the whole app.
- **QueryGuard mandatory for primary queries** — every screen with a main `useQuery` MUST use `QueryGuard` for consistent loading/error/retry. Secondary/optional queries (e.g., invite badge count) can stay inline.

### Claude's Discretion
- Exact import ordering convention
- Whether to add `// eslint-disable` comments or fix lint warnings found during refactor
- Exact error messages in `ErrorBoundary` and `QueryGuard` copy

</decisions>

<specifics>
## Specific Ideas

- **"Architecture first, visuals later"** — Phase 8 corrects the pipes, Phase 9 paints the walls. Every architectural abstraction should be in place even if the visual implementation is minimal (e.g., `showAlert` uses `window.alert` on web but the abstraction is correct for Phase 9 to swap in a toast).
- Document RPC approach for `useBalanceSummary` as a future scaling recommendation so it's ready when the app grows.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Button`, `Input`, `ExpandableFAB` in `src/components/ui/` — already well-structured
- `SplitEditor` in `src/components/expenses/` — good component pattern to follow
- `splits.ts` pure functions with 15 test cases — model for new utilities
- `queryClient.ts` and `persister.ts` — clean lib infrastructure
- `useUIStore` (Zustand) — lightweight state management pattern

### Established Patterns
- Feature hooks pattern: `src/features/{domain}/hooks.ts` — all data fetching through custom hooks
- Mutation defaults: `queryClient.setMutationDefaults` in root `_layout.tsx` for offline replay
- React Query: `staleTime: 30s`, `gcTime: 24h`, `retry: 2` — conservative caching strategy
- NativeWind: all styling via `className` props — `bg-dark-bg`, `bg-dark-surface`, `text-brand-primary` etc.

### Integration Points
- `app/_layout.tsx` — root provider tree (PersistQueryClient, GestureHandler, ErrorBoundary goes here)
- `app/(app)/_layout.tsx` — authenticated route group (per-route ErrorBoundary goes here)
- `app/(auth)/_layout.tsx` — would need to exist for per-route boundary on auth screens

</code_context>

<deferred>
## Deferred Ideas

- **Toast/snackbar component** — deferred to Phase 9 (UI/UX Upgrade). Architecture prepared in Phase 8 via `showAlert` wrapper.
- **Comprehensive test suite** — testing Supabase-dependent hooks with mocks is a separate initiative beyond Phase 8 scope.
- **RPC-based `useBalanceSummary`** — documented in future scaling doc, not needed at current scale.

</deferred>

---

*Phase: 08-code-review-refactor-best-practices*
*Context gathered: 2026-03-04*

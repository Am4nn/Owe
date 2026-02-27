---
phase: 01-foundation
plan: "01"
subsystem: infra
tags: [expo, nativewind, tailwindcss, react-query, mmkv, supabase, expo-router, zustand, eas]

# Dependency graph
requires: []
provides:
  - "Expo SDK 55 project scaffold with EAS dev client configuration"
  - "NativeWind v4 + Tailwind v3 dark mode with neon fintech color palette"
  - "MMKV-backed React Query offline persister (24h gcTime)"
  - "Supabase singleton client with expo-sqlite localStorage polyfill"
  - "Expo Router route groups (auth) and (app) with placeholder screens"
  - "Zustand UI store forcing dark mode on launch"
  - "Reusable Button and Input components with NativeWind styling"
  - "TypeScript path alias @/* -> src/*"
affects: [01-02, 01-03, all-future-plans]

# Tech tracking
tech-stack:
  added:
    - "expo SDK 55 + expo-router + expo-dev-client"
    - "nativewind ^4.2.2 + tailwindcss ^3.4.19"
    - "@tanstack/react-query + @tanstack/react-query-persist-client"
    - "@tanstack/query-async-storage-persister"
    - "react-native-mmkv ^4.1.2 + react-native-nitro-modules"
    - "@supabase/supabase-js + expo-sqlite (localStorage polyfill)"
    - "zustand ^5.0.11"
    - "react-native-reanimated 3.19.5 (pinned)"
    - "react-hook-form + @hookform/resolvers + zod"
    - "lucide-react-native + react-native-svg"
  patterns:
    - "PersistQueryClientProvider at root — every screen has offline-first data"
    - "colorScheme.set('dark') at store import time — guaranteed before first render"
    - "expo-sqlite localStorage polyfill as Supabase auth storage — no 2048-byte limit"
    - "MMKV sync ops wrapped in Promise — bridges native sync API to async persister interface"

key-files:
  created:
    - "app/_layout.tsx"
    - "app/(auth)/_layout.tsx"
    - "app/(auth)/sign-in.tsx"
    - "app/(auth)/sign-up.tsx"
    - "app/(app)/_layout.tsx"
    - "app/(app)/index.tsx"
    - "src/lib/supabase.ts"
    - "src/lib/queryClient.ts"
    - "src/lib/persister.ts"
    - "src/stores/ui.ts"
    - "src/components/ui/Button.tsx"
    - "src/components/ui/Input.tsx"
    - "eas.json"
    - "babel.config.js"
    - "metro.config.js"
    - "tailwind.config.js"
    - "global.css"
    - "nativewind-env.d.ts"
    - "tsconfig.json"
    - ".env.example"
  modified:
    - "app.json — added scheme, newArchEnabled, experiments.typedRoutes"
    - ".gitignore — added .env, .env.local, .env*.local"

key-decisions:
  - "Pin tailwindcss@^3.4.19 (3.x, NOT 4.x) — NativeWind 4.x incompatible with Tailwind v4"
  - "Pin react-native-reanimated@3.19.5 — defer v4/worklets decision to Phase 2 (victory-native compat TBD)"
  - "expo-sqlite localStorage polyfill for Supabase auth storage — avoids SecureStore 2048-byte limit"
  - "gcTime: 24h on QueryClient + maxAge: 24h on persister — must match or OFFL-01 breaks silently"
  - "MMKV sync API wrapped in Promise resolves — bridges sync/async boundary for persister interface"
  - "EAS dev client required from day one — MMKV v4 requires custom native build, unavailable in Expo Go"

patterns-established:
  - "Path alias @/* maps to src/* — all internal imports use @/ prefix"
  - "NativeWind dark mode enforced at store import time, not component tree"
  - "PersistQueryClientProvider must wrap entire Stack, not individual screens"

requirements-completed: [UIUX-01, OFFL-01]

# Metrics
duration: 4min
completed: 2026-02-27
---

# Phase 1 Plan 01: Project Scaffold Summary

**Expo SDK 55 shell with NativeWind v4 dark mode, MMKV-backed React Query offline persister, Supabase localStorage polyfill, and EAS dev client build profiles — the structural foundation every future plan builds on**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-27T17:39:07Z
- **Completed:** 2026-02-27T17:42:39Z
- **Tasks:** 2
- **Files modified:** 22

## Accomplishments
- Created all project config files (eas.json, babel.config.js, metro.config.js, tailwind.config.js, global.css, tsconfig.json, nativewind-env.d.ts, .env.example)
- Updated app.json with scheme "nexus", newArchEnabled, typedRoutes experiment, and splash background color
- Wired Expo Router route groups (auth) and (app) with PersistQueryClientProvider at root
- Implemented MMKV-backed async persister with gcTime/maxAge alignment for offline-first cache persistence (OFFL-01)
- Established neon fintech color palette in Tailwind: brand.primary #6C63FF, brand.accent #00F5D4, brand.danger #FF4D6D, brand.success #06D6A0, dark.bg #0A0A0F (UIUX-01)
- Supabase client uses expo-sqlite localStorage polyfill — eliminates SecureStore 2048-byte auth token limit

## Task Commits

Each task was committed atomically:

1. **Task 1: Bootstrap Expo SDK 55 project config files** - `4cdf7ed` (chore)
2. **Task 2: Wire app structure — Expo Router, Supabase, QueryClient, MMKV persister, dark mode** - `eac2612` (feat)

**Plan metadata:** (final docs commit — see below)

## Files Created/Modified

### Config Files
- `eas.json` — EAS build profiles: development (devClient), preview, production
- `babel.config.js` — NativeWind babel preset with jsxImportSource nativewind
- `metro.config.js` — withNativeWind wrapper pointing to global.css
- `tailwind.config.js` — nativewind/preset + full neon fintech color palette
- `global.css` — Tailwind base/components/utilities directives
- `nativewind-env.d.ts` — TypeScript reference for NativeWind types
- `tsconfig.json` — strict mode, @/* path alias -> src/*
- `.env.example` — documents EXPO_PUBLIC_SUPABASE_URL/ANON_KEY; explicitly forbids service_role key

### App Modified
- `app.json` — added scheme "nexus", newArchEnabled: true, experiments.typedRoutes, splash/icon config

### App Source (Expo Router)
- `app/_layout.tsx` — Root layout with PersistQueryClientProvider (24h maxAge)
- `app/(auth)/_layout.tsx` — Auth route group with dark background
- `app/(auth)/sign-in.tsx` — Placeholder sign-in screen
- `app/(auth)/sign-up.tsx` — Placeholder sign-up screen
- `app/(app)/_layout.tsx` — Protected route group with dark background
- `app/(app)/index.tsx` — Dashboard placeholder showing brand-primary "Owe" + brand-accent subtitle

### Src Libraries
- `src/lib/supabase.ts` — Supabase singleton with expo-sqlite/localStorage/install polyfill
- `src/lib/queryClient.ts` — QueryClient: gcTime 24h, staleTime 30s, retry 2
- `src/lib/persister.ts` — MMKV storage wrapped in Promise for async persister interface
- `src/stores/ui.ts` — Zustand store; calls colorScheme.set('dark') at import time

### UI Components
- `src/components/ui/Button.tsx` — TouchableOpacity with primary/secondary/danger variants
- `src/components/ui/Input.tsx` — TextInput with label, error state, brand danger border

## Decisions Made
- **tailwindcss pinned to ^3.4.19 (3.x)**: NativeWind 4.x uses Tailwind v3 API; v4 would silently break className handling
- **react-native-reanimated pinned to 3.19.5**: v4 introduces worklets breaking change; deferred to Phase 2 after victory-native compatibility is evaluated
- **expo-sqlite localStorage polyfill as Supabase auth storage**: Replaces SecureStore which has a 2048-byte limit smaller than JWT tokens with claims
- **gcTime 24h aligned with persister maxAge 24h**: Misalignment would cause React Query to garbage-collect cache before persister hydrates it, defeating OFFL-01
- **EAS dev client from day one**: MMKV v4 requires a custom native build; Expo Go cannot be used for this project

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added full Expo app config to app.json**
- **Found during:** Task 1 (app.json update)
- **Issue:** Original app.json had only plugins array — missing name, slug, version, icon, splash, ios/android bundleIdentifier which are required for EAS build
- **Fix:** Added all required Expo config fields (name, slug, version, orientation, icon, splash with dark background, ios/android config, web bundler)
- **Files modified:** app.json
- **Verification:** app.json is valid JSON with all required EAS build fields
- **Committed in:** 4cdf7ed (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** app.json config fields are required for EAS build to work. No scope creep.

## Issues Encountered

- **EAS build not triggered**: The plan specifies running `eas login` + `eas build` but this requires EAS authentication (auth gate). The build profiles are configured in eas.json and ready to use. Run `eas login` then `eas build --platform android --profile development` (or `--platform ios --profile development`) when credentials are available.

## User Setup Required

To complete the EAS dev client build:
1. Run `eas login` (requires Expo account)
2. Run `eas build --platform android --profile development` for Android
3. Or `eas build --platform ios --profile development` for iOS simulator
4. Copy `.env.example` to `.env` and fill in Supabase URL and anon key

## Next Phase Readiness

- All structural scaffold is in place — every future plan has access to `@/lib/supabase`, `@/lib/queryClient`, `@/lib/persister`
- NativeWind color tokens available across all screens via tailwind.config.js
- Auth screens are placeholders — Plan 01-03 implements sign-in/sign-up logic
- EAS build profiles configured — pending manual `eas login` authentication gate
- No blockers for Plan 01-02 (schema) or Plan 01-03 (auth) — both can proceed with this scaffold

## Self-Check: PASSED

All created files verified to exist on disk:
- app/_layout.tsx, app/(auth)/_layout.tsx, app/(auth)/sign-in.tsx, app/(auth)/sign-up.tsx
- app/(app)/_layout.tsx, app/(app)/index.tsx
- src/lib/supabase.ts, src/lib/queryClient.ts, src/lib/persister.ts, src/stores/ui.ts
- src/components/ui/Button.tsx, src/components/ui/Input.tsx
- eas.json, babel.config.js, metro.config.js, tailwind.config.js, global.css
- nativewind-env.d.ts, tsconfig.json, .env.example

Both task commits verified in git log:
- 4cdf7ed: chore(01-01): scaffold Expo SDK 55 project config files
- eac2612: feat(01-01): wire app structure — Expo Router, Supabase, QueryClient, MMKV persister

---
*Phase: 01-foundation*
*Completed: 2026-02-27*

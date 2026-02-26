# Stack Research

**Domain:** Cross-platform fintech mobile app (expense splitting) — React Native + Expo + Supabase
**Researched:** 2026-02-27
**Confidence:** HIGH (all versions verified via npm registry live query)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Expo SDK | 55.0.2 | Cross-platform RN framework + dev tooling | File-based routing via expo-router, OTA updates via EAS, managed build pipeline. SDK 55 is the current stable release as of Feb 2026 and ships React Native 0.84. Eliminates bare RN maintenance overhead. |
| React Native | 0.84.0 | Native runtime for iOS + Android | Shipped with Expo SDK 55. React 19 compatible. New Architecture (Fabric + TurboModules) is on by default in RN 0.76+, giving better performance for gesture-heavy fintech UIs. |
| React | 19.2.4 | UI rendering | React 19 is the current stable. Concurrent features (transitions, Suspense) improve perceived responsiveness for async expense loading. |
| expo-router | 55.0.2 | File-based navigation | Expo's official routing layer built on React Navigation v7. Supports typed routes, deep links, and shared element transitions. Eliminates manual navigator boilerplate. React Navigation v7 is the underlying engine. |
| Supabase JS | 2.98.0 | BaaS: PostgreSQL + Auth + Realtime + Storage + Edge Functions | PostgreSQL is mandatory for the debt-simplification graph (complex joins impossible in NoSQL). Supabase ships all required primitives: RLS for per-user data security, Realtime for live balance updates, Storage for receipt images, Edge Functions (Deno) for server-side graph computation. |
| Zustand | 5.0.11 | Client-side global state | Lightweight (1 KB), no boilerplate, works perfectly with React Query's server cache boundary. Owns UI state (active group, sheet open/closed, optimistic local counters). Zustand v5 ships with React 19 compatibility. |
| TanStack Query (React Query) | 5.90.21 | Server-state caching + offline persistence | v5 is stable and widely adopted. Handles Supabase fetch caching, optimistic updates for instant UI feedback on expense creation, and background sync on reconnect. Essential for the offline-first requirement. |
| NativeWind | 4.2.2 | Tailwind CSS in React Native | v4 is the current stable. Uses a CSS-interop approach (not the old JSS transform) making it compatible with Expo SDK 55. Requires tailwindcss >3.3.0. Enables the design system token approach (brand colors, spacing) from a single `tailwind.config.js`. |
| TypeScript | 5.9.3 | Static typing | Current stable. Expo projects default to TypeScript. Critical for a fintech app where currency arithmetic bugs are expensive. |

### State & Data Layer

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-query-persist-client | 5.90.23 | Persist query cache to disk | Always — required for offline-first. Pair with MMKV persister. |
| react-native-mmkv | 4.1.2 | Ultra-fast key-value store (C++ JSI) | Use as the persistence backend for React Query cache. 30-50x faster than AsyncStorage for cache read/write on app boot. Also stores auth tokens. |
| @react-native-async-storage/async-storage | 3.0.1 | Fallback key-value storage | Use only where MMKV is unavailable (e.g., Expo Go dev client without custom native build). For production, prefer MMKV. |
| zod | 4.3.6 | Schema validation | Validate all Supabase response shapes, form inputs, and API payloads. Works with react-hook-form via `@hookform/resolvers`. |
| react-hook-form | 7.71.2 | Form state management | Expense entry forms, group creation, profile setup. Uncontrolled inputs = better performance on mobile than controlled state. |

### UI & Animation

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native-reanimated | 4.2.2 | High-performance animations | NOTE: v4 requires `react-native-worklets` >=0.7.0 as a peer (new architecture). Use for gesture-driven animations (swipe to settle), micro-animations, shared element transitions. v3 (3.19.5) is the safer choice if any dependency chain still requires v3. See compatibility note below. |
| react-native-worklets | 0.7.4 | Worklet runtime for reanimated v4 | Required if using reanimated v4. Runs animation code on UI thread in a separate worklet context. |
| react-native-gesture-handler | 2.30.0 | Native gesture recognition | Required by expo-router and reanimated. Swipe gestures for settle/dismiss actions in the expense feed. |
| react-native-screens | 4.24.0 | Native screen containers | Required by expo-router. Reduces memory for deep navigation stacks. |
| react-native-safe-area-context | 5.7.0 | Safe area insets | Required by expo-router. Notch / home indicator handling. |
| expo-blur | 55.0.8 | Blur views | Glassmorphism card effects in the fintech UI. |
| expo-linear-gradient | 55.0.8 | Linear gradients | Gradient backgrounds on balance cards, settlement confetti screen. |
| expo-haptics | 55.0.8 | Haptic feedback | Tactile feedback on FAB press, swipe-to-settle, settlement confetti. Core to the modern fintech feel. |
| @gorhom/bottom-sheet | 5.2.8 | Bottom sheet component | Expense detail sheet, quick-add sheet, currency picker. Built on reanimated + gesture handler. |
| lottie-react-native | 7.3.6 | Lottie animations | Confetti / celebration on debt settlement. Backed by Airbnb's Lottie runtime. |
| lucide-react-native | 0.575.0 | Icon set | Consistent icon library with tree-shaking. Preferred over @expo/vector-icons (legacy). |
| react-native-svg | 15.15.3 | SVG rendering | Required by charting libraries and custom vector icons. |

### Charts & Data Visualization

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| victory-native | 41.20.2 | Spending charts | Use for bar charts (monthly spend), line charts (balance over time), pie charts (category breakdown). Built on @shopify/react-native-skia for GPU-accelerated rendering. Requires skia + reanimated + gesture-handler. |
| @shopify/react-native-skia | 2.4.21 | Skia canvas renderer | Required peer for victory-native >=40. GPU-accelerated 2D graphics. Also useful for custom glassmorphism card rendering. NOTE: v2.x requires react-native >=0.78 and reanimated >=3.19.1 — verify RN 0.84 compatibility (HIGH confidence this works). |

### Camera & File

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-camera | 55.0.9 | Camera access for receipt scanning | The primary camera interface. Use for the "scan receipt" flow — capture image → send to OpenAI Vision. |
| expo-image-picker | 55.0.9 | Photo library picker | Let users pick existing receipt photos from their camera roll. Always offer alongside expo-camera. |
| expo-file-system | 55.0.9 | File read/write | Temporary storage of receipt images before upload to Supabase Storage. Also used for CSV export to the device. |

### Notifications & Background

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-notifications | 55.0.10 | Push notification scheduling and receiving | Debt reminders, new expense alerts, settlement requests. Requires EAS Push (Expo's FCM/APNs relay). |

### Infrastructure & Security

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-secure-store | 55.0.8 | iOS Keychain / Android Keystore storage | Store Supabase JWT refresh tokens securely. Never use AsyncStorage for auth tokens. |
| expo-constants | 55.0.7 | App config access at runtime | Access EAS environment variables, app version, release channel in code. |
| expo-updates | 55.0.11 | OTA update client | Enables EAS Update — ship JS bundle changes without App Store review. Essential for rapid iteration on a free app. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| EAS CLI | 18.0.5 | Expo Application Services — cloud builds, OTA updates, submissions | `eas build` replaces local Xcode/Android Studio builds. Required for expo-updates. Use `eas.json` to configure dev/preview/production profiles. |
| jest-expo | 55.0.9 | Jest preset for Expo | The official Jest preset. Handles module transforms for Expo packages. |
| @testing-library/react-native | 13.3.3 | Component testing | Current standard for RN component tests. Works with jest-expo. |
| eslint-config-expo | 55.0.0 | ESLint ruleset | Expo's opinionated ESLint config, includes React Native specific rules. |
| @typescript-eslint/eslint-plugin | 8.56.1 | TypeScript linting rules | Enforce type safety in ESLint. |
| prettier | 3.8.1 | Code formatting | Pin prettier and use `.prettierrc` to enforce consistent formatting across the team. |

---

## Installation

```bash
# Bootstrap Expo project (if not already created)
pnpm dlx create-expo-app@latest nexus --template blank-typescript

# Core runtime deps (all managed by Expo SDK 55 — use expo install for version pinning)
pnpm expo install expo-router react-native-screens react-native-safe-area-context
pnpm expo install react-native-gesture-handler react-native-reanimated react-native-worklets

# State & data
pnpm add zustand @tanstack/react-query @tanstack/react-query-persist-client
pnpm add react-native-mmkv
pnpm add zod react-hook-form @hookform/resolvers

# Supabase
pnpm add @supabase/supabase-js

# UI & styling
pnpm add nativewind tailwindcss
pnpm add @gorhom/bottom-sheet lottie-react-native lucide-react-native react-native-svg

# Expo UI packages (use expo install to get SDK-pinned versions)
pnpm expo install expo-blur expo-linear-gradient expo-haptics

# Charts (GPU-accelerated via Skia)
pnpm add victory-native @shopify/react-native-skia

# Camera & files
pnpm expo install expo-camera expo-image-picker expo-file-system

# Security & notifications
pnpm expo install expo-secure-store expo-notifications expo-constants expo-updates

# OpenAI client
pnpm add openai

# Dev dependencies
pnpm add -D jest-expo @testing-library/react-native
pnpm add -D eslint eslint-config-expo @typescript-eslint/eslint-plugin prettier
pnpm add -D @types/react @types/react-native

# EAS CLI (global)
pnpm add -g eas-cli
```

---

## Alternatives Considered

| Category | Recommended | Alternative | When to Use Alternative |
|----------|-------------|-------------|-------------------------|
| Navigation | expo-router | @react-navigation/native (bare) | Only if you need a non-file-based routing model or are building outside the Expo managed workflow. expo-router is built on React Navigation v7 so switching costs are low. |
| State management | Zustand | Redux Toolkit | Redux Toolkit is heavier but better for very large teams with strict flux discipline. For a startup-pace project, Zustand's simplicity wins. |
| State management | Zustand | Jotai | Jotai is atom-based vs Zustand's store-based. Both are fine; Zustand has larger mindshare in RN fintech apps. |
| Backend | Supabase | Firebase (Firestore) | Firebase is valid for document-centric data. This project's debt graph requires relational joins — NoSQL makes settlement math exponentially harder. |
| Backend | Supabase | PlanetScale / Neon + separate auth | More control over DB, but loses Supabase's integrated Auth + Realtime + Storage + Edge Functions. The integrated platform reduces scope significantly for an MVP. |
| Styling | NativeWind | StyleSheet API | Pure StyleSheet is faster to prototype a single screen but doesn't scale to a design system. NativeWind's Tailwind tokens enforce consistency across 20+ screens. |
| Styling | NativeWind | Tamagui | Tamagui is powerful (universal components, typed tokens) but adds compile-step complexity. NativeWind is simpler to onboard and aligns with web developer intuition. |
| Animations | react-native-reanimated v4 | react-native-reanimated v3 (3.19.5) | Use v3 if victory-native or other charting dependencies require reanimated >=3.0.0 but fail on v4. v3 remains on `reanimated-3` dist-tag and is fully supported. |
| Charts | victory-native | react-native-gifted-charts | gifted-charts has a simpler API but uses SVG only (not Skia GPU). For a fintech app with animated charts, Skia-backed victory-native is visually superior. |
| Charts | victory-native | react-native-chart-kit | chart-kit is unmaintained since 2022. Do not use. |
| OCR | OpenAI Vision (gpt-4o) | AWS Textract | Textract has better table extraction for structured receipts but requires AWS account setup, IAM configuration, and is more expensive for low volume. GPT-4o Vision handles messy/handwritten receipts better at the volumes expected for MVP. |
| FX Rates | Open Exchange Rates | exchangeratesapi.io / Fixer.io | All are similar services. Open Exchange Rates has a free tier (1,000 req/month) which is sufficient for MVP. Upgrade to paid tier once traffic grows. |
| Storage (K/V cache) | react-native-mmkv | @react-native-async-storage/async-storage | AsyncStorage works in Expo Go without a custom dev client. MMKV requires a custom dev client (`eas build --profile development`). Use AsyncStorage only in Expo Go during very early dev, then switch to MMKV before first beta. |
| Icon library | lucide-react-native | @expo/vector-icons | @expo/vector-icons wraps Ionicons/FontAwesome which are older icon sets with inconsistent visual weight. lucide is modern, consistent, and tree-shakeable. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| react-native-chart-kit | Unmaintained since 2022. No RN 0.7x/0.8x compatibility. Issues with TypeScript types. | victory-native with @shopify/react-native-skia |
| styled-components / emotion (RN) | Runtime CSS-in-JS has poor performance on mobile (style recalculation on render). Known issues with Reanimated animated styles. | NativeWind (compile-time Tailwind extraction) |
| MobX | Significant learning curve, complex observable tracking, overkill for the store surface area of this app. | Zustand |
| React Native Paper | Material Design 3 components that clash with the custom fintech aesthetic (glassmorphism, neon accents). Adds bundle weight for components you'll override anyway. | Custom components via NativeWind + @gorhom/bottom-sheet |
| Realm / WatermelonDB | Full offline-first database solutions. Heavy (>3 MB). Overkill when React Query cache persistence via MMKV meets the offline requirements. | React Query persist-client + MMKV |
| expo-av (for animations) | Use Lottie for animation assets, not expo-av. expo-av is for audio/video playback. | lottie-react-native |
| axios | In a React Query + Supabase app, axios adds unnecessary complexity. Supabase client handles its own HTTP layer; React Query's `queryFn` can use native `fetch` for any non-Supabase calls. | Supabase JS client + native `fetch` |
| react-native-firebase | Adds full Firebase SDK (~20 MB native). If only push notifications are needed, use Expo Push Notifications via expo-notifications (backed by FCM/APNs without the Firebase SDK overhead). | expo-notifications + EAS Push |
| @react-navigation/native (direct) | Don't use React Navigation directly alongside expo-router. expo-router owns the navigator tree; bypassing it causes navigation state conflicts. | expo-router exclusively |

---

## Stack Patterns by Variant

**If the user is on Expo Go (no custom dev client):**
- Use AsyncStorage instead of MMKV for React Query persistence
- Skip expo-notifications (requires custom native build for FCM/APNs)
- Avoid @gorhom/bottom-sheet v5 (may need custom dev client for some native features)
- This is only valid for early local development; switch to `eas build --profile development` before any beta testing

**If Reanimated v4 causes compatibility issues with victory-native:**
- Pin react-native-reanimated to 3.19.5 (the `reanimated-3` dist-tag latest)
- victory-native requires `react-native-reanimated >=3.0.0` — v3 satisfies this
- v3 does NOT require react-native-worklets, simplifying the native module count
- This is a real risk: @shopify/react-native-skia v2.x requires reanimated >=3.19.1, which is satisfied by either v3 or v4

**If deploying Edge Functions (debt simplification):**
- Use Deno (Supabase Edge Functions runtime) — TypeScript-first, no `node_modules`
- Import Supabase server-side client via `@supabase/supabase-js` (same package, different instantiation)
- Use `SERVICE_ROLE_KEY` in Edge Functions (not anon key) for bypassing RLS in trusted server context

**If adding payment rails in Phase 4+:**
- Stripe React Native SDK: `@stripe/stripe-react-native` (NOT the web Stripe.js)
- Plaid: `react-native-plaid-link-sdk`
- Both require custom dev client (EAS build)

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| expo@55 | react-native@0.84 | Expo SDK 55 ships with RN 0.84 — always use `expo install` not `pnpm add` for Expo packages to get the pinned compatible version |
| nativewind@4 | tailwindcss@>3.3.0, currently 4.2.1 | NativeWind 4 supports Tailwind v3 only (not v4). Tailwind CSS v4 is released but NativeWind 4.x does NOT support it yet. Pin tailwindcss to `^3.4.0`, not v4. |
| react-native-reanimated@4 | react-native-worklets@>=0.7.0 | v4 introduces the new worklets package as a peer dependency — this is a breaking change from v3. If any library in your dep tree requires reanimated@3.x, you may need to stay on 3.19.5. |
| @shopify/react-native-skia@2 | react-native@>=0.78, react-native-reanimated@>=3.19.1 | Skia v2 requires RN 0.78+ (satisfied by RN 0.84) and reanimated >=3.19.1 (satisfied by both 3.19.5 and 4.x) |
| victory-native@41 | @shopify/react-native-skia@>=1.2.3, react-native-reanimated@>=3, react-native-gesture-handler@>=2 | All satisfied by the stack above |
| @gorhom/bottom-sheet@5 | react-native-reanimated@>=3 OR v4, react-native-gesture-handler@>=2 | Compatible with both reanimated v3 and v4 |
| react-native-mmkv@4 | react-native-nitro-modules@* | MMKV v4 uses Nitro Modules (JSI framework by Margelo). This is a new native module approach. Requires custom dev client (not Expo Go). |
| @supabase/supabase-js@2 | All above | Stable v2 API. Supabase is not shipping v3 yet. No breaking changes expected in current roadmap. |
| openai@6 | Node.js >=18 (Edge Functions), React Native | Use in Supabase Edge Functions for server-side Vision API calls. Do NOT call OpenAI directly from the React Native client (API key exposure). |

---

## Critical Gap: Tailwind v4 vs NativeWind

**NativeWind 4 does NOT support Tailwind CSS v4.** Tailwind CSS 4.x was released in 2025 with a new Oxide engine and different configuration format. NativeWind 4.x is built on Tailwind v3 internals. If you `pnpm add tailwindcss` without pinning, you will get v4 which will silently break NativeWind.

**Fix:** Pin tailwindcss to `^3.4.17` in package.json.

```json
{
  "dependencies": {
    "tailwindcss": "^3.4.17",
    "nativewind": "^4.2.2"
  }
}
```

NativeWind v5 (with Tailwind v4 support) is in active development but has no stable release as of Feb 2026. Watch the [NativeWind GitHub](https://github.com/marklawlor/nativewind) for v5 milestones before upgrading.

---

## Sources

- npm registry live query (2026-02-27) — all version numbers verified
- expo@55 peer dependencies via `npm view` — `react-native@0.84` confirmed
- nativewind@4 peer dependencies — `tailwindcss >3.3.0` (NOT v4 compatible)
- react-native-reanimated dist-tags — v4 is `latest`, v3 on `reanimated-3` tag
- react-native-reanimated@4 peer dependencies — new `react-native-worklets` peer confirmed
- @shopify/react-native-skia@2 peer dependencies — `react-native>=0.78`, `react-native-reanimated>=3.19.1`
- victory-native@41 peer dependencies — skia + reanimated + gesture-handler requirements confirmed
- react-native-mmkv@4 peer dependencies — `react-native-nitro-modules` peer (new JSI approach)
- @tanstack/react-query-persist-client peer — `@tanstack/react-query@^5.90.21` required

---

*Stack research for: Nexus — Cross-platform expense splitting fintech app (React Native + Expo + Supabase)*
*Researched: 2026-02-27*

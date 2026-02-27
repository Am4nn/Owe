# Phase 1: Foundation - Research

**Researched:** 2026-02-27
**Domain:** Expo SDK 55 scaffold, Supabase PostgreSQL schema, Supabase Auth + Groups, NativeWind dark mode, MMKV offline persistence
**Confidence:** HIGH (official docs verified; version-specific MMKV/reanimated compatibility flagged where uncertain)

---

## Summary

Phase 1 is a pure infrastructure phase. Its purpose is to prevent six categories of irrecoverable mistakes — float currency arithmetic, RLS omission, FX rate drift, offline conflict corruption, service_role key exposure, and Expo Go dependency — before any user-facing feature is built. Every critical pitfall identified in the project's research traces back to a decision made (or skipped) in the database schema and project scaffolding. Fixing these retroactively requires a full data migration and potentially a security incident disclosure.

The three plans in this phase address discrete concerns: (1) the Expo project scaffold and dev toolchain, (2) the Supabase PostgreSQL schema with all hardening applied, and (3) the auth/groups feature with offline cache wired up. All twelve requirements assigned to Phase 1 can be traced to one of these three plans. None of the plans require research into alternatives — the stack is locked and well-documented.

The most important insight from research is that the official Supabase + Expo auth pattern has changed in 2025-2026: the recommended storage adapter is now `expo-sqlite/localStorage` (via the `expo-sqlite` package's polyfill import), not the older AsyncStorage or the AES-encrypted SecureStore approach. The `expo-secure-store` approach still works but requires a chunked/encrypted wrapper for sessions exceeding 2048 bytes. This decision affects Plan 01-03 and must be consciously chosen.

**Primary recommendation:** Use `expo-sqlite/localStorage` as the Supabase auth storage adapter (current official pattern), build the EAS dev client on day one before any other library is installed, and put all seven Phase 1 database hardening concerns into a single migration 001 so they cannot be skipped.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can create an account with email and password | Supabase GoTrue email/password signup + `profiles` trigger auto-creates profile on `auth.users` INSERT |
| AUTH-02 | User can sign in with email and password | Supabase `supabase.auth.signInWithPassword()` — standard pattern, fully documented |
| AUTH-03 | User session persists across app restarts without re-logging in | `persistSession: true` + `autoRefreshToken: true` on Supabase client init; storage via `expo-sqlite/localStorage` or SecureStore adapter |
| AUTH-04 | User can sign out from any screen | `supabase.auth.signOut()` + Zustand session state clear + React Query cache clear on sign-out |
| AUTH-05 | User can create a profile with a display name and avatar photo | `profiles` table with `display_name TEXT`, `avatar_url TEXT`; avatar upload to Supabase Storage private bucket |
| GRUP-01 | User can create a named group | `groups` table INSERT with RLS; creator auto-added to `group_members` in same transaction |
| GRUP-02 | User can invite members to a group by email | `group_invites` table or invite-by-email flow; invited user accepted on sign-up or sign-in |
| GRUP-03 | User can add named-only (non-app) members | `group_members` with `user_id NULL` and `display_name TEXT NOT NULL` for non-app members |
| GRUP-04 | User can view a list of all their groups from the dashboard | `useGroups` hook queries `group_members` JOIN `groups` WHERE `user_id = auth.uid()`; RLS enforces this at DB level |
| GRUP-05 | User can leave a group | `group_members` DELETE with balance-check gate; RLS policy restricts to own membership rows |
| OFFL-01 | User can view cached group data and balances when offline | MMKV persister wired to `PersistQueryClientProvider`; `gcTime` on QueryClient set to 24h+ |
| UIUX-01 | App launches in dark mode by default with vibrant neon accent colors on deep dark backgrounds | NativeWind dark mode with `colorScheme` auto-detect; Tailwind config with custom neon token palette |
</phase_requirements>

---

## Standard Stack

### Core (Phase 1 specific)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo | 55.0.2 | Cross-platform runtime | Current stable; ships RN 0.84; New Architecture on by default |
| expo-dev-client | 55.x | Custom dev client binary | Required from day one — MMKV v4, bottom-sheet, notifications all require native build |
| expo-router | 55.0.2 | File-based routing + auth groups | Official Expo routing layer; `Stack.Protected` for auth gates |
| @supabase/supabase-js | 2.98.0 | BaaS client | Auth, PostgREST, Realtime, Storage in one package |
| react-native-mmkv | 4.1.2 | C++ JSI key-value store | Nitro Modules; 30-50x faster than AsyncStorage; requires custom dev client |
| react-native-nitro-modules | * | MMKV v4 peer dep | New JSI framework by Margelo; must be installed alongside MMKV v4 |
| @tanstack/react-query | 5.90.21 | Server state cache | v5 stable; offline mutation queue; `PersistQueryClientProvider` for MMKV-backed persistence |
| @tanstack/react-query-persist-client | 5.90.23 | Persist RQ cache to disk | Bridges React Query to MMKV storage adapter |
| @tanstack/query-async-storage-persister | 5.x | Async persister factory | Creates persister from MMKV wrapper; used by `PersistQueryClientProvider` |
| zustand | 5.0.11 | UI state (NOT server state) | Owns theme, bottom sheet state, active group — nothing from Supabase |
| nativewind | 4.2.2 | Tailwind in React Native | Compile-time CSS extraction; dark mode via `useColorScheme` |
| tailwindcss | ^3.4.17 | Tailwind v3 (MUST pin v3) | NativeWind 4.x does NOT support Tailwind v4; pinning is mandatory |
| expo-sqlite | 55.x | localStorage polyfill install | Required for current official Supabase auth storage adapter pattern |
| expo-secure-store | 55.0.8 | iOS Keychain / Android Keystore | Alternative auth storage (requires AES chunking for sessions > 2048 bytes) |
| zod | 4.3.6 | Schema validation | Validate Supabase response shapes, form inputs |
| react-hook-form | 7.71.2 | Form state | Sign up, sign in, profile edit, group creation forms |
| @hookform/resolvers | * | zod + RHF bridge | Connects zod schema to react-hook-form validate |
| typescript | 5.9.3 | Static typing | Enforced in Expo projects; mandatory for financial data safety |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-image-picker | 55.0.9 | Avatar photo selection | AUTH-05: pick avatar from device library |
| expo-constants | 55.0.7 | Runtime app config access | EAS env vars, app version, build metadata |
| expo-updates | 55.0.11 | OTA update client | EAS Update — ship JS changes without store review |
| react-native-safe-area-context | 5.7.0 | Notch/home indicator | Required by expo-router; peer dep |
| react-native-screens | 4.24.0 | Native screen containers | Required by expo-router; reduces memory for deep stacks |
| react-native-gesture-handler | 2.30.0 | Native gestures | Required by expo-router; Phase 2 will use for swipe gestures |
| react-native-reanimated | 3.19.5 | High-perf animations | Pin to v3 in Phase 1 to avoid v4 worklets compatibility risk with chart deps in Phase 2 |
| lucide-react-native | 0.575.0 | Icon set | Modern, tree-shakeable; replaces @expo/vector-icons |
| react-native-svg | 15.15.3 | SVG support | Peer dep for lucide-react-native |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `expo-sqlite/localStorage` adapter | AES-encrypted SecureStore + AsyncStorage | SecureStore approach is more secure but requires `aes-js` and `react-native-get-random-values` dependencies; localStorage approach is the current official recommendation and simpler |
| `createAsyncStoragePersister` (MMKV) | `createSyncStoragePersister` (MMKV) | MMKV is synchronous natively; the async wrapper is fine and what the official docs show; sync persister may work but async is the documented pattern |
| react-native-reanimated v3.19.5 | reanimated v4 | v4 requires `react-native-worklets` peer; risk of compatibility issues with victory-native/skia in Phase 2; v3 satisfies all Phase 1 needs; upgrade decision deferred to Phase 2 |
| NativeWind dark mode via CSS variables | `dark:` prefix classes only | CSS variables approach provides consistent token-based theming; `dark:` prefix works but is less maintainable at scale |

**Installation:**

```bash
# Phase 1 installation sequence (pnpm enforced)

# 1. Scaffold (if not already created)
pnpm dlx create-expo-app@latest nexus --template blank-typescript

# 2. EAS dev client (install first, before any other native module)
pnpm expo install expo-dev-client

# 3. Routing + navigation stack
pnpm expo install expo-router react-native-screens react-native-safe-area-context
pnpm expo install react-native-gesture-handler react-native-reanimated

# 4. State + data layer
pnpm add zustand @tanstack/react-query @tanstack/react-query-persist-client
pnpm add @tanstack/query-async-storage-persister
pnpm add react-native-mmkv react-native-nitro-modules
pnpm add zod react-hook-form @hookform/resolvers

# 5. Supabase
pnpm add @supabase/supabase-js
pnpm expo install expo-sqlite

# 6. NativeWind + Tailwind (MUST pin Tailwind v3)
pnpm add nativewind
pnpm add -D "tailwindcss@^3.4.17"

# 7. UI basics (Phase 1 scope)
pnpm add lucide-react-native react-native-svg
pnpm expo install expo-image-picker expo-constants expo-updates
pnpm expo install expo-secure-store

# 8. Dev tools
pnpm add -D jest-expo @testing-library/react-native
pnpm add -D eslint eslint-config-expo prettier
pnpm add -D @types/react @types/react-native

# 9. EAS CLI (global)
pnpm add -g eas-cli
```

---

## Architecture Patterns

### Recommended Project Structure (Phase 1 scope)

```
nexus/
├── app/
│   ├── (auth)/               # Auth route group — sign-in, sign-up screens
│   │   ├── _layout.tsx       # Auth stack layout; redirects to (app) if session exists
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (app)/                # Protected route group — requires session
│   │   ├── _layout.tsx       # Uses Stack.Protected guard={!!session}
│   │   ├── index.tsx         # Dashboard placeholder (Phase 1: empty shell)
│   │   ├── groups/
│   │   │   ├── index.tsx     # Groups list (GRUP-04)
│   │   │   └── new.tsx       # Create group (GRUP-01, GRUP-03)
│   │   └── profile.tsx       # Profile creation/edit (AUTH-05)
│   └── _layout.tsx           # Root layout: SessionProvider + QueryClientProvider
│
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── hooks.ts      # useSession, useSignIn, useSignUp, useSignOut
│   │   │   └── types.ts
│   │   └── groups/
│   │       ├── hooks.ts      # useGroups, useCreateGroup, useLeaveGroup
│   │       └── types.ts
│   │
│   ├── components/
│   │   └── ui/               # Button, Input, Avatar, Card — NativeWind-styled
│   │
│   ├── lib/
│   │   ├── supabase.ts       # Singleton Supabase client with auth storage
│   │   ├── queryClient.ts    # QueryClient with gcTime: 1000 * 60 * 60 * 24
│   │   └── persister.ts      # MMKV-backed async persister
│   │
│   └── stores/
│       └── ui.ts             # Zustand: theme, bottom sheet state
│
├── supabase/
│   ├── migrations/
│   │   └── 20260227000001_foundation.sql  # All Phase 1 schema + RLS + triggers
│   └── seed.sql              # Test users in overlapping groups for RLS testing
│
├── assets/                   # Fonts, splash, icons
├── global.css                # @tailwind base/components/utilities
├── tailwind.config.js        # nativewind/preset, custom neon color palette
├── babel.config.js           # babel-preset-expo with jsxImportSource: "nativewind"
├── metro.config.js           # withNativeWind wrapper
├── eas.json                  # dev / preview / production build profiles
├── app.json                  # Expo config
└── package.json              # pnpm; tailwindcss pinned to ^3.4.17
```

### Pattern 1: EAS Dev Client Bootstrap

**What:** Create the custom dev client BEFORE installing any native module that requires it.
**When to use:** Day one — before MMKV, before bottom-sheet, before notifications.

```bash
# eas.json (minimal Phase 1 config)
# Source: https://docs.expo.dev/eas/json/
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": { "withoutCredentials": true },
      "ios": { "simulator": true }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "distribution": "store"
    }
  }
}

# Build command (run after installing expo-dev-client)
eas build --platform android --profile development
# or for iOS simulator:
eas build --platform ios --profile development
```

### Pattern 2: NativeWind v4 Dark Mode Setup

**What:** Configure NativeWind with Tailwind v3 preset, custom neon color tokens, and dark mode via system preference.
**When to use:** Phase 1 scaffold — configure once, use everywhere.

```javascript
// tailwind.config.js
// Source: https://www.nativewind.dev/docs/getting-started/installation
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Neon fintech palette (UIUX-01)
        brand: {
          primary: "#6C63FF",    // Electric purple
          accent:  "#00F5D4",    // Neon teal
          danger:  "#FF4D6D",    // Debt red
          success: "#06D6A0",    // Settled green
        },
        dark: {
          bg:      "#0A0A0F",    // Deep background
          surface: "#131318",    // Card surface
          border:  "#1E1E2E",    // Subtle border
        },
      },
    },
  },
  plugins: [],
}
```

```javascript
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

```javascript
// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: './global.css' });
```

```css
/* global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```typescript
// nativewind-env.d.ts
/// <reference types="nativewind/types" />
```

Dark mode implementation (system-default dark, user can toggle):

```typescript
// src/stores/ui.ts
import { colorScheme } from "nativewind";
// On app launch, default to dark (UIUX-01)
colorScheme.set("dark");

// Usage in any component:
// className="bg-dark-bg dark:bg-dark-bg text-white"
```

### Pattern 3: Supabase Client with Auth Session Persistence

**What:** Initialize the Supabase singleton with the current official auth storage adapter.
**When to use:** `src/lib/supabase.ts` — imported only from hooks and lib, never from screens.

**Current official pattern** (Expo docs 2026 — uses `expo-sqlite/localStorage`):

```typescript
// src/lib/supabase.ts
// Source: https://docs.expo.dev/guides/using-supabase/
import 'expo-sqlite/localStorage/install'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

// NEVER use SUPABASE_SERVICE_ROLE_KEY here — anon key + user JWT only
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,    // expo-sqlite localStorage polyfill
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
```

**Alternative: AES-encrypted SecureStore** (more secure for sensitive auth tokens, but requires additional deps):
- Requires: `aes-js`, `react-native-get-random-values`
- AES-256 key stored in SecureStore; session encrypted and stored in AsyncStorage
- Use this pattern if session security is a higher concern than setup simplicity

### Pattern 4: MMKV-Backed React Query Persister

**What:** Wire MMKV as the storage backend for React Query's offline cache persistence.
**When to use:** `src/lib/persister.ts` — imported into the root `QueryClientProvider`.

```typescript
// src/lib/persister.ts
// Source: https://github.com/mrousavy/react-native-mmkv/blob/main/docs/WRAPPER_REACT_QUERY.md
import { MMKV } from 'react-native-mmkv'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'

const storage = new MMKV()

const mmkvStorage = {
  setItem: (key: string, value: string) => {
    storage.set(key, value)
    return Promise.resolve()
  },
  getItem: (key: string) => {
    const value = storage.getString(key)
    return Promise.resolve(value === undefined ? null : value)
  },
  removeItem: (key: string) => {
    storage.delete(key)
    return Promise.resolve()
  },
}

export const persister = createAsyncStoragePersister({ storage: mmkvStorage })
```

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,  // 24 hours — required for persist to work across sessions
      staleTime: 1000 * 30,          // 30 seconds — show stale data, then refetch
      retry: 2,
    },
  },
})
```

```tsx
// app/_layout.tsx (root layout)
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient } from '@/lib/queryClient'
import { persister } from '@/lib/persister'

export default function RootLayout() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <SessionProvider>
        <Stack />
      </SessionProvider>
    </PersistQueryClientProvider>
  )
}
```

### Pattern 5: Expo Router Auth Protection via Stack.Protected

**What:** Declarative route protection using `Stack.Protected` with a session guard.
**When to use:** `app/(app)/_layout.tsx` — wrap all authenticated screens.

```tsx
// app/_layout.tsx (root layout with auth routing)
// Source: https://docs.expo.dev/router/advanced/protected/
import { Stack } from 'expo-router'
import { useSession } from '@/features/auth/hooks'

export default function RootLayout() {
  const { session, isLoading } = useSession()

  if (isLoading) return <SplashScreen />

  return (
    <Stack>
      {/* Only accessible when NOT signed in */}
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      {/* Only accessible when signed in */}
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  )
}
```

### Pattern 6: Database Migration 001 (Foundation Schema)

**What:** Single migration file covering all Phase 1 schema concerns — every hardening decision in one place.
**When to use:** `supabase/migrations/20260227000001_foundation.sql`

Key schema principles:
- All monetary amounts as `INTEGER` (cents) — no `FLOAT`, no `DECIMAL`, no `NUMERIC` for money
- `ENABLE ROW LEVEL SECURITY` immediately after every `CREATE TABLE`
- `version INTEGER NOT NULL DEFAULT 1` on all mutable records
- `fx_rate_at_creation NUMERIC(12,6)` on expenses (Phase 1 schema, used in Phase 2)
- `idempotency_key UUID UNIQUE` on expenses (Phase 1 schema, used in Phase 2)
- `created_at TIMESTAMPTZ DEFAULT now()` and `updated_at TIMESTAMPTZ DEFAULT now()` on every table
- `profiles` table with auto-creation trigger on `auth.users`
- Named-only members: `user_id` is nullable on `group_members`

```sql
-- supabase/migrations/20260227000001_foundation.sql
-- Phase 1: Foundation schema — all hardening in one migration

-- ─────────────────────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Users can only read/update their own profile
CREATE POLICY "users_can_read_own_profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());
CREATE POLICY "users_can_update_own_profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- Auto-create profile on signup
-- Source: https://supabase.com/docs/guides/auth/managing-user-data
CREATE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- GROUPS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.groups (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  base_currency TEXT NOT NULL DEFAULT 'USD',
  created_by    UUID REFERENCES public.profiles(id),
  version       INTEGER NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members_can_read_groups"
  ON public.groups FOR SELECT
  USING (
    id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );
CREATE POLICY "members_can_update_groups"
  ON public.groups FOR UPDATE
  USING (
    id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );

-- ─────────────────────────────────────────────────────────────
-- GROUP MEMBERS (nullable user_id = named-only member)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.group_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,  -- NULL = named-only
  display_name  TEXT NOT NULL,    -- Shown for named-only; mirrors profile.display_name for real users
  role          TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at     TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
-- Users can see group_members rows only for groups they're members of
CREATE POLICY "members_can_read_group_members"
  ON public.group_members FOR SELECT
  USING (
    group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );
-- Only group admins can insert/delete members (or the joining user themselves)
CREATE POLICY "members_can_insert_members"
  ON public.group_members FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT group_id FROM public.group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    OR user_id = auth.uid()
  );
CREATE POLICY "members_can_delete_own_membership"
  ON public.group_members FOR DELETE
  USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- GROUP INVITES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.group_invites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_by    UUID NOT NULL REFERENCES public.profiles(id),
  accepted_at   TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days') NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.group_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inviters_can_read_invites"
  ON public.group_invites FOR SELECT
  USING (
    group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
    OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
CREATE POLICY "members_can_create_invites"
  ON public.group_invites FOR INSERT
  WITH CHECK (
    group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );

-- ─────────────────────────────────────────────────────────────
-- EXPENSES (schema-only in Phase 1 — no feature work yet)
-- Columns needed NOW to avoid migration later:
--   amount_cents, fx_rate_at_creation, idempotency_key, version
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.expenses (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id              UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  created_by            UUID NOT NULL REFERENCES public.profiles(id),
  description           TEXT NOT NULL,
  amount_cents          INTEGER NOT NULL CHECK (amount_cents > 0),  -- Stored as integer cents (NEVER float)
  currency              TEXT NOT NULL DEFAULT 'USD',
  base_currency         TEXT NOT NULL,                              -- Group's base currency at time of creation
  fx_rate_at_creation   NUMERIC(12,6) NOT NULL DEFAULT 1.0,        -- Historical rate snapshot — never updated
  amount_base_cents     INTEGER NOT NULL,                           -- amount_cents * fx_rate_at_creation, stored at create
  split_type            TEXT NOT NULL DEFAULT 'equal' CHECK (split_type IN ('equal', 'exact', 'percentage', 'shares')),
  payer_id              UUID REFERENCES public.group_members(id),
  expense_date          DATE NOT NULL DEFAULT CURRENT_DATE,
  idempotency_key       UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,  -- Prevents duplicate on retry
  version               INTEGER NOT NULL DEFAULT 1,
  deleted_at            TIMESTAMPTZ,                                -- Soft delete
  created_at            TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at            TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members_can_read_expenses"
  ON public.expenses FOR SELECT
  USING (
    group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );
CREATE POLICY "members_can_insert_expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (
    group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );
CREATE POLICY "creators_can_update_expenses"
  ON public.expenses FOR UPDATE
  USING (created_by = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- EXPENSE SPLITS (schema-only in Phase 1)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.expense_splits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id      UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  member_id       UUID NOT NULL REFERENCES public.group_members(id),
  amount_cents    INTEGER NOT NULL CHECK (amount_cents >= 0),
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members_can_read_splits"
  ON public.expense_splits FOR SELECT
  USING (
    expense_id IN (
      SELECT id FROM public.expenses
      WHERE group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
    )
  );

-- ─────────────────────────────────────────────────────────────
-- SETTLEMENTS (schema-only in Phase 1)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.settlements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id        UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  payer_id        UUID NOT NULL REFERENCES public.group_members(id),
  payee_id        UUID NOT NULL REFERENCES public.group_members(id),
  amount_cents    INTEGER NOT NULL CHECK (amount_cents > 0),
  currency        TEXT NOT NULL,
  idempotency_key UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  version         INTEGER NOT NULL DEFAULT 1,
  settled_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members_can_read_settlements"
  ON public.settlements FOR SELECT
  USING (
    group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );
CREATE POLICY "members_can_insert_settlements"
  ON public.settlements FOR INSERT
  WITH CHECK (
    group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  );
```

### Pattern 7: Auth Feature Hook

**What:** Session state management using Supabase auth events + Zustand + React Query cache invalidation on sign-out.
**When to use:** `src/features/auth/hooks.ts` — consumed by root layout and sign-in/out screens.

```typescript
// src/features/auth/hooks.ts
import { useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { queryClient } from '@/lib/queryClient'

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load persisted session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsLoading(false)
    })

    // Listen for auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setIsLoading(false)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  return { session, isLoading }
}

export function useSignOut() {
  return async () => {
    await supabase.auth.signOut()
    queryClient.clear()  // Clear all cached server state on sign out
  }
}
```

### Pattern 8: Groups Feature Hooks

**What:** Groups CRUD with RLS enforced at database level; offline read cache via React Query + MMKV persister.
**When to use:** `src/features/groups/hooks.ts`

```typescript
// src/features/groups/hooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// GRUP-04: list all groups for the current user
export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select('group_id, groups(*)')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      if (error) throw error
      return data?.map(row => row.groups) ?? []
    },
    staleTime: 30_000,
  })
}

// GRUP-01: create a group (with creator auto-added as admin)
export function useCreateGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, baseCurrency }: { name: string; baseCurrency: string }) => {
      const userId = (await supabase.auth.getUser()).data.user?.id!
      // Create group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({ name, base_currency: baseCurrency, created_by: userId })
        .select()
        .single()
      if (groupError) throw groupError
      // Auto-add creator as admin (GRUP-01 requirement)
      const profile = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', userId)
        .single()
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: userId,
          display_name: profile.data?.display_name ?? 'You',
          role: 'admin',
        })
      if (memberError) throw memberError
      return group
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}
```

### Anti-Patterns to Avoid

- **Calling Supabase directly from screens:** Import Supabase only from `src/lib/supabase.ts`; consume it only in `src/features/*/hooks.ts`. Screens call hooks, never Supabase.
- **Storing server state in Zustand:** Zustand is for UI state only (theme, sheet state, active group). React Query owns all data from the server.
- **Using Expo Go for development:** After Phase 1 Plan 01-01, all development must use the EAS dev client build.
- **Skipping `ENABLE ROW LEVEL SECURITY`:** Every `CREATE TABLE` in migrations must be immediately followed by `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.
- **Using `FLOAT` or `NUMERIC` for money amounts:** The `expenses` and `settlements` tables use `amount_cents INTEGER` exclusively.
- **Putting `SUPABASE_SERVICE_ROLE_KEY` in app config:** The mobile app uses only `EXPO_PUBLIC_SUPABASE_ANON_KEY`. The service role key lives in Supabase Vault and CI secrets only.
- **Updating `fx_rate_at_creation` after insert:** This column is set once at expense creation and never touched again. Balance queries use this historical snapshot.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auth session persistence across restarts | Custom token storage in AsyncStorage | `expo-sqlite/localStorage` polyfill + `persistSession: true` | Official Supabase + Expo pattern; handles token refresh lifecycle |
| Key-value offline cache | Custom SQLite schema for React Query cache | `react-native-mmkv` + `@tanstack/query-async-storage-persister` | MMKV is 30-50x faster; TanStack provides the persister bridge |
| Route protection / auth guards | Manual `useEffect` redirects in every screen | `Stack.Protected guard={!!session}` in Expo Router | Declarative, handles deep link redirects automatically |
| Profile auto-creation | API endpoint called after sign-up | PostgreSQL trigger `on_auth_user_created` | Atomic with the auth transaction; cannot be skipped on race condition |
| Form validation | Manual `if` checks in submit handlers | `react-hook-form` + `zod` via `@hookform/resolvers` | Handles async validation, field-level errors, controlled vs uncontrolled |
| Currency arithmetic | `parseFloat()` + JS division | `INTEGER` cents in DB; `dinero.js` v2 on client | IEEE 754 cannot represent most decimal fractions; penny drift is irrecoverable |
| Database migrations | Manual SQL in Supabase Studio | `supabase migration new` CLI + `supabase db push` | Version-controlled; reproducible across dev, preview, prod |

**Key insight:** The six critical Phase 1 pitfalls each have a well-established solution in the ecosystem. None of them require custom code — they require choosing the right library/pattern and configuring it correctly in migration 001 and the project scaffold.

---

## Common Pitfalls

### Pitfall 1: Tailwind v4 Silently Breaks NativeWind

**What goes wrong:** `pnpm add nativewind tailwindcss` without a version pin installs Tailwind CSS v4 (the current `latest`). NativeWind 4.x is built on Tailwind v3 internals. v4 has a completely different configuration format and engine. No error is thrown — styles just silently stop applying.

**Why it happens:** Tailwind v4 was released in 2025. `npm install tailwindcss` resolves to v4 unless pinned.

**How to avoid:** Pin in `package.json`: `"tailwindcss": "^3.4.17"`. Use `pnpm add -D "tailwindcss@^3.4.17"` (quotes required in some shells).

**Warning signs:** Dark mode classes not applying; `className` prop appearing to do nothing; console shows no style errors.

**Confidence:** HIGH — verified against NativeWind official docs and STACK.md research.

---

### Pitfall 2: MMKV v4 Fails in Expo Go

**What goes wrong:** `react-native-mmkv` v4 uses Nitro Modules (a new JSI framework). Expo Go is a pre-built binary without Nitro Modules support. The error is: `Failed to get NitroModules: The native "NitroModules" Turbo/Native-Module could not be found.`

**Why it happens:** MMKV v4 upgraded from the old JSI approach to Nitro Modules between v3 and v4. Expo Go cannot load arbitrary native modules.

**How to avoid:** Install `expo-dev-client` as the very first dependency, build the dev client with `eas build --profile development`, and never use Expo Go again. The EAS build must include both `react-native-mmkv` and `react-native-nitro-modules`.

**Warning signs:** Any developer testing with the Expo Go app (QR code scan to expo.dev/client).

**Confidence:** HIGH — confirmed in react-native-mmkv GitHub issues #931, #985.

---

### Pitfall 3: RLS Not Enabled on New Tables

**What goes wrong:** `CREATE TABLE` in a SQL migration or Supabase Studio SQL editor does NOT enable RLS by default. Any authenticated user can call the PostgREST API and read any row from an unprotected table. Financial data (expense splits, settlements, balances) leaks across group boundaries.

**Why it happens:** RLS is disabled by default when tables are created outside the Supabase Dashboard UI. Dashboard-created tables have RLS enabled, but migration-created tables do not.

**How to avoid:** Every `CREATE TABLE` in migrations must be immediately followed by `ALTER TABLE [name] ENABLE ROW LEVEL SECURITY;` and at least one SELECT policy. The `supabase/migrations/20260227000001_foundation.sql` pattern above includes this for every table. Write a migration test: sign in as User B, attempt to read User A's group data, assert 0 rows returned.

**Warning signs:** Any table in `supabase/migrations/` without a corresponding `ENABLE ROW LEVEL SECURITY` line.

**Confidence:** HIGH — confirmed in Supabase official docs and search results.

---

### Pitfall 4: service_role Key in the Mobile Bundle

**What goes wrong:** A developer puts `SUPABASE_SERVICE_ROLE_KEY` in `app.config.js` or `.env.local` for the Expo app. The key is compiled into the JS bundle. It can be extracted from the APK/IPA binary with basic tools. The service role key bypasses ALL RLS policies — attacker can read every user's financial data in the entire database.

**Why it happens:** The service role key is needed for Edge Functions and admin operations; developers confuse it with the `anon` key.

**How to avoid:**
1. Mobile app uses only `EXPO_PUBLIC_SUPABASE_ANON_KEY` (the `EXPO_PUBLIC_` prefix is intentional — it means "safe to expose to clients")
2. Service role key lives in Supabase Vault + CI/CD secrets only
3. Add CI check: scan the built `.js` bundle for the service key string; fail the build if found

**Warning signs:** Any environment variable named `SERVICE_ROLE` or `SERVICE_KEY` in `app.config.js`, `.env`, or `eas.json`.

**Confidence:** HIGH — documented in PITFALLS.md and confirmed via research.

---

### Pitfall 5: Float Currency Storage

**What goes wrong:** Storing `47.99` as a `FLOAT` or `NUMERIC` in Postgres, or doing `expense.amount / 6` in JavaScript. IEEE 754 floating point cannot represent most decimal fractions exactly. A group of 6 splitting $47.99 produces a $0.01 ghost debt that can never be resolved. The app shows perpetual non-zero balances that infuriate users.

**Why it happens:** Money amounts look like numbers; developers reach for `number` types.

**How to avoid:**
- Postgres: `amount_cents INTEGER NOT NULL` (store 4799, not 47.99)
- JavaScript: Use `dinero.js` v2 for all arithmetic (operates on integers internally)
- Display: Divide by 100 only at render time, never in storage or calculation
- Never use `parseFloat()` anywhere near financial data

**Warning signs:** Any `FLOAT`, `DOUBLE PRECISION`, or `DECIMAL` column for money amounts. Any `parseFloat()` on a monetary value.

**Confidence:** HIGH — fundamental IEEE 754 behavior; documented in PITFALLS.md.

---

### Pitfall 6: expo-sqlite localStorage vs SecureStore Decision

**What goes wrong:** The Expo + Supabase auth storage adapter choice has changed in 2025-2026. The older pattern using `expo-secure-store` directly fails for sessions larger than 2048 bytes (which Supabase sessions already exceed by default). The AES-encrypted workaround requires additional dependencies. The new official pattern uses `expo-sqlite/localStorage` which has no size limit but stores data less securely than Keychain/Keystore.

**Why it happens:** The official docs changed; older tutorials still show the SecureStore pattern.

**How to avoid:** Consciously choose one pattern:
- `expo-sqlite/localStorage` — simpler, official current pattern, no size limit, but session data is in SQLite (not encrypted Keychain)
- AES + SecureStore + AsyncStorage — more secure (key in Keychain, data encrypted), more complex, requires `aes-js` + `react-native-get-random-values`
- For MVP (Phase 1), `expo-sqlite/localStorage` is the pragmatic choice; upgrade to SecureStore pattern in a security hardening pass if needed

**Confidence:** MEDIUM — official docs confirmed, but security implications of localStorage vs SecureStore for JWT tokens require team judgment.

---

### Pitfall 7: `gcTime` Not Set for React Query Persistence

**What goes wrong:** The `PersistQueryClientProvider` writes the React Query cache to MMKV, but if `gcTime` (formerly `cacheTime`) is not set on the QueryClient, it defaults to 5 minutes (300,000 ms). When the app is relaunched after 5+ minutes, the cache is considered garbage and discarded. The offline read cache (OFFL-01) appears to work in testing but fails for real users who don't open the app constantly.

**Why it happens:** `gcTime` is a React Query default that wasn't designed with persistence in mind.

**How to avoid:** Set `gcTime: 1000 * 60 * 60 * 24` (24 hours) on the `QueryClient`. Also set `maxAge` on the persister if you want a different eviction policy.

**Warning signs:** Cache appears to load on fast relaunches but empty on next-day relaunches.

**Confidence:** HIGH — TanStack Query persist documentation explicitly documents this requirement.

---

## Code Examples

Verified patterns from official sources:

### Supabase Client Initialization (current official pattern)
```typescript
// Source: https://docs.expo.dev/guides/using-supabase/
import 'expo-sqlite/localStorage/install'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,  // NEVER service_role key
  {
    auth: {
      storage: localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
```

### Profile Auto-Creation Trigger
```sql
-- Source: https://supabase.com/docs/guides/auth/managing-user-data
CREATE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### MMKV Persister (async adapter)
```typescript
// Source: https://github.com/mrousavy/react-native-mmkv/blob/main/docs/WRAPPER_REACT_QUERY.md
import { MMKV } from 'react-native-mmkv'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'

const storage = new MMKV()
export const persister = createAsyncStoragePersister({
  storage: {
    setItem: (key, value) => { storage.set(key, value); return Promise.resolve() },
    getItem: (key) => Promise.resolve(storage.getString(key) ?? null),
    removeItem: (key) => { storage.delete(key); return Promise.resolve() },
  },
})
```

### NativeWind Dark Mode Toggle
```typescript
// Source: https://www.nativewind.dev/docs/core-concepts/dark-mode
import { colorScheme } from 'nativewind'

// Set default dark on app launch (UIUX-01)
colorScheme.set('dark')

// User toggle
const toggleTheme = () => {
  colorScheme.set(colorScheme === 'dark' ? 'light' : 'dark')
}
```

### EAS Dev Client Build
```bash
# Source: https://docs.expo.dev/develop/development-builds/create-a-build/
npx expo install expo-dev-client
eas build --platform android --profile development
# or
eas build --platform ios --profile development  # adds simulator:true in eas.json first
```

### Supabase Migration CLI Workflow
```bash
# Source: https://supabase.com/docs/guides/deployment/database-migrations
supabase migration new foundation_schema
# Edit the generated file in supabase/migrations/
supabase migration up          # Apply locally
supabase db reset              # Reset and reseed (runs seed.sql)
supabase db push               # Deploy to production Supabase project
```

### RLS Enable Pattern (mandatory for every table)
```sql
-- Source: https://supabase.com/docs/guides/database/postgres/row-level-security
-- WARNING: Tables created via SQL editor / migrations do NOT have RLS enabled by default
-- Dashboard-created tables DO have it enabled — migrations DO NOT

ALTER TABLE public.your_table ENABLE ROW LEVEL SECURITY;

-- RLS with no policies = deny all (good default; add explicit policies for access)
CREATE POLICY "policy_name"
  ON public.your_table FOR SELECT
  USING (/* condition referencing auth.uid() */);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| AsyncStorage for Supabase auth session | `expo-sqlite/localStorage` polyfill | 2025 (Supabase + Expo docs update) | Simpler setup; no 2048 byte size limit; less secure than Keychain |
| `react-native-mmkv` config plugin (v1-v3) | Nitro Modules (v4, no config plugin needed) | MMKV v4 release 2024-2025 | Requires custom dev client; faster, cleaner architecture |
| `Stack.Screen` with `useRouter().replace` redirect | `Stack.Protected guard={bool}` | Expo Router (SDK 52+) | Declarative auth protection; handles deep links automatically |
| `tailwindcss@latest` (now v4) | `tailwindcss@^3.4.17` (pin v3) | Tailwind v4 release early 2025 | Breaking change for NativeWind 4.x; must pin until NativeWind v5 ships |
| `cacheTime` (React Query v4) | `gcTime` (React Query v5) | TanStack Query v5 | Renamed; same behavior; affects persistence config |
| `createSyncStoragePersister` | `createAsyncStoragePersister` with MMKV | TanStack Query v5 | Async version works with MMKV's synchronous API via Promise wrapping |

**Deprecated/outdated:**
- `react-native-mmkv` config plugin Expo Gist: deprecated; v4 uses Nitro Modules directly, no config plugin
- `@react-native-async-storage/async-storage` for auth: use `expo-sqlite/localStorage` or encrypted SecureStore adapter
- Expo Go as development environment: use `expo-dev-client` (EAS development build) from day one
- NativeWind v2 docs (v2.nativewind.dev): use current docs at nativewind.dev/docs

---

## Open Questions

1. **expo-sqlite/localStorage vs AES-SecureStore for Supabase session**
   - What we know: Official Expo + Supabase docs now show `expo-sqlite/localStorage`; SecureStore has 2048 byte limit requiring workaround; localStorage stores in SQLite (not encrypted Keychain)
   - What's unclear: Whether the SQLite-backed localStorage is acceptable from a security standpoint for a fintech app with JWT tokens
   - Recommendation: Proceed with `expo-sqlite/localStorage` in Phase 1 (pragmatic, official); add to security review checklist before production release; upgrade to AES+SecureStore pattern in a security hardening pass if needed

2. **react-native-reanimated v3 vs v4 in Phase 1**
   - What we know: v4 requires `react-native-worklets` peer; v3 (3.19.5) is stable; Phase 1 doesn't use animations directly; Phase 2 will add victory-native which needs reanimated >=3.0.0
   - What's unclear: Whether victory-native + @shopify/react-native-skia will work with reanimated v4 or require v3
   - Recommendation: Pin to reanimated v3 (3.19.5) in Phase 1; resolve v3 vs v4 decision at start of Phase 2 by running `pnpm install` with all chart deps and checking for peer conflicts

3. **Group invite flow — email invite vs invite link**
   - What we know: GRUP-02 requires "invite by email"; a `group_invites` table is schema-ready in Phase 1; actual email delivery requires either Supabase Auth invite or Edge Function + email provider
   - What's unclear: Whether `supabase.auth.admin.inviteUserByEmail()` (service role, Edge Function) or a custom invite link is better for MVP
   - Recommendation: Plan 01-03 should create the `group_invites` table schema; the email delivery mechanism is deferred to Phase 2 (groups are in Phase 1 but the invite delivery can be Phase 2 since groups still function without it for named-only members)

---

## Sources

### Primary (HIGH confidence)
- [Expo Using Supabase Guide](https://docs.expo.dev/guides/using-supabase/) — auth storage adapter pattern (localStorage via expo-sqlite), confirmed current
- [NativeWind Installation Docs](https://www.nativewind.dev/docs/getting-started/installation) — babel.config.js, metro.config.js, tailwind.config.js patterns verified
- [NativeWind Dark Mode Docs](https://www.nativewind.dev/docs/core-concepts/dark-mode) — `colorScheme.set()` and `useColorScheme` API confirmed
- [Supabase Managing User Data](https://supabase.com/docs/guides/auth/managing-user-data) — `handle_new_user()` trigger pattern verified
- [Supabase RLS Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) — RLS disabled by default on SQL-created tables confirmed
- [Supabase Hardening Data API](https://supabase.com/docs/guides/database/hardening-data-api) — REVOKE + RLS layered security pattern
- [EAS JSON Configuration](https://docs.expo.dev/eas/json/) — `developmentClient: true` eas.json pattern verified
- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/create-a-build/) — `eas build --profile development` commands verified
- [react-native-mmkv WRAPPER_REACT_QUERY.md](https://github.com/mrousavy/react-native-mmkv/blob/main/docs/WRAPPER_REACT_QUERY.md) — MMKV async storage wrapper for TanStack Query
- [TanStack Query persistQueryClient](https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient) — `PersistQueryClientProvider` + gcTime requirement
- [Supabase Database Migrations](https://supabase.com/docs/guides/deployment/database-migrations) — `supabase migration new`, `supabase db push` CLI workflow
- [Expo Router Protected Routes](https://docs.expo.dev/router/advanced/protected/) — `Stack.Protected guard={bool}` pattern verified

### Secondary (MEDIUM confidence)
- [react-native-mmkv GitHub issues #931, #985](https://github.com/mrousavy/react-native-mmkv/issues/931) — NitroModules error in Expo Go confirmed via community reports
- [Supabase auth SecureStore 2048 limit discussion](https://github.com/orgs/supabase/discussions/14306) — size limit confirmed in community discussion
- Project STACK.md (2026-02-27) — npm registry version verification; tailwindcss pin rationale
- Project ARCHITECTURE.md (2026-02-27) — layered architecture patterns, RLS anchor design
- Project PITFALLS.md (2026-02-27) — float currency, RLS off by default, service_role, offline version column pitfalls

### Tertiary (LOW confidence, verify at implementation)
- NativeWind v5 (Tailwind v4 support) — in development as of Feb 2026; no stable release; monitor GitHub before upgrading
- `expo-secure-store` AES-encrypted session adapter — pattern exists in community; official docs moved away from it; verify if security hardening is prioritized

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified against npm registry and official docs; installation commands confirmed
- Architecture patterns: HIGH — official Expo Router, NativeWind, Supabase, TanStack Query docs verified; patterns are current as of Feb 2026
- Pitfalls: HIGH — RLS, Tailwind v4 trap, MMKV/Expo Go incompatibility, gcTime persistence bug all verified with official sources; float currency is fundamental IEEE 754 behavior
- Schema design: HIGH — standard PostgreSQL patterns; RLS, trigger, integer cents well-documented; one open question on invite delivery mechanism

**Research date:** 2026-02-27
**Valid until:** 2026-03-29 (30 days — stable stack, unlikely to change rapidly)
**Re-validate before Phase 2:** reanimated v3 vs v4 decision; NativeWind v5 status

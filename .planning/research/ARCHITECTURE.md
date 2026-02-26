# Architecture Research

**Domain:** Cross-platform fintech mobile app — expense splitting (React Native + Expo + Supabase)
**Researched:** 2026-02-27
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     EXPO CLIENT (RN)                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│  │  Screens   │  │  Feature   │  │  Design    │              │
│  │ (Expo      │  │  Hooks     │  │  System    │              │
│  │  Router)   │  │ (RQ + Zus) │  │ (NativeWnd)│              │
│  └─────┬──────┘  └─────┬──────┘  └────────────┘              │
│        │               │                                      │
│  ┌─────▼───────────────▼──────────────────────┐               │
│  │           Service Layer                      │               │
│  │  (Supabase JS client / REST / Realtime WS)  │               │
│  └─────────────────────┬────────────────────────┘              │
│                        │  (offline queue: MMKV)                │
└────────────────────────┼──────────────────────────────────────┘
                         │ HTTPS / WebSocket
┌────────────────────────▼──────────────────────────────────────┐
│                   SUPABASE (BaaS)                              │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌────────────┐  │
│  │  GoTrue  │  │ Realtime │  │  PostgREST │  │  Storage   │  │
│  │  (Auth)  │  │ (WS hub) │  │ (REST API) │  │ (receipts) │  │
│  └──────────┘  └──────────┘  └────────────┘  └────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              PostgreSQL (RLS enforced)                   │  │
│  │  users · groups · group_members · expenses               │  │
│  │  expense_payers · expense_splits · settlements           │  │
│  │  recurring_rules · activity_log                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Edge Functions (Deno)                       │  │
│  │  debt-simplify · receipt-ocr · fx-rates-cache           │  │
│  │  push-notify · export-pdf · recurring-processor          │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼──────────────────────────────────────┐
│                 EXTERNAL SERVICES                              │
│  OpenAI Vision API  ·  Open Exchange Rates  ·  OneSignal/FCM  │
└───────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| Expo Router screens | UI rendering only — call hooks, never Supabase directly | File-system routes in `app/` |
| Feature hooks | Compose React Query queries/mutations + Zustand selectors | `src/features/*/hooks.ts` |
| Zustand stores | UI-only state: theme, current user, bottom sheet state | `src/stores/` |
| React Query | All server state: cache, background refresh, optimistic updates, offline queue | `src/lib/queryClient.ts` |
| Supabase client | Singleton with auth session auto-refresh | `src/lib/supabase.ts` |
| MMKV persister | Persist React Query cache to disk for offline-first | `src/lib/persister.ts` |
| Edge Function: debt-simplify | Runs graph algorithm (Schulman/Greedy) asynchronously on settlement events | `supabase/functions/debt-simplify/` |
| Edge Function: receipt-ocr | Calls OpenAI Vision, returns structured JSON, never raw on client | `supabase/functions/receipt-ocr/` |
| Edge Function: fx-rates-cache | Fetches Open Exchange Rates hourly, caches in Postgres | `supabase/functions/fx-rates-cache/` |
| Edge Function: push-notify | Triggered by DB webhook on new expenses/settlements | `supabase/functions/push-notify/` |
| PostgreSQL RLS | Authorization — users can only see data for groups they're members of | `supabase/migrations/` |

## Recommended Project Structure

```
nexus/
├── app/                          # Expo Router file-system routes
│   ├── (auth)/                   # Auth group: login, signup, verify-email
│   ├── (app)/                    # Protected group (after login)
│   │   ├── index.tsx             # Dashboard (you owe / owed)
│   │   ├── groups/
│   │   │   ├── [id]/
│   │   │   │   ├── index.tsx     # Group chat-style view
│   │   │   │   ├── add-expense.tsx
│   │   │   │   └── settle.tsx
│   │   │   └── new.tsx
│   │   ├── activity.tsx          # Global activity feed
│   │   ├── profile.tsx
│   │   └── settings.tsx
│   └── _layout.tsx
│
├── src/
│   ├── features/                 # Feature slices (co-located logic)
│   │   ├── auth/
│   │   │   ├── hooks.ts          # useSignIn, useSignUp, useSession
│   │   │   └── types.ts
│   │   ├── groups/
│   │   │   ├── hooks.ts          # useGroups, useGroup, useCreateGroup
│   │   │   └── types.ts
│   │   ├── expenses/
│   │   │   ├── hooks.ts          # useExpenses, useAddExpense, useSplitTypes
│   │   │   ├── split-engine.ts   # Client-side split math (equal/exact/pct/shares)
│   │   │   └── types.ts
│   │   ├── balances/
│   │   │   ├── hooks.ts          # useGroupBalances, useNetBalance
│   │   │   └── types.ts
│   │   ├── settlements/
│   │   │   ├── hooks.ts          # useSettle, useSettlements
│   │   │   └── types.ts
│   │   ├── receipts/
│   │   │   ├── hooks.ts          # useScanReceipt, useReceiptItems
│   │   │   └── types.ts
│   │   └── activity/
│   │       ├── hooks.ts
│   │       └── types.ts
│   │
│   ├── components/               # Design system primitives
│   │   ├── ui/                   # Button, Card, Sheet, Badge, Avatar
│   │   ├── expense/              # ExpenseBubble, SplitRow, PayerRow
│   │   └── layout/               # SafeArea, Header, FAB
│   │
│   ├── lib/
│   │   ├── supabase.ts           # Singleton client, auth session
│   │   ├── queryClient.ts        # React Query setup + retry config
│   │   ├── persister.ts          # MMKV async persister for offline
│   │   └── notifications.ts      # OneSignal init + token registration
│   │
│   ├── stores/                   # Zustand (UI state only)
│   │   ├── theme.ts
│   │   └── ui.ts                 # Bottom sheet state, active group, etc.
│   │
│   └── utils/
│       ├── currency.ts           # Format + convert amounts
│       ├── dates.ts
│       └── debt-graph.ts         # Client-side preview (Edge Fn does final)
│
├── supabase/
│   ├── migrations/               # All DDL + RLS policies
│   └── functions/
│       ├── debt-simplify/
│       ├── receipt-ocr/
│       ├── fx-rates-cache/
│       ├── push-notify/
│       ├── export-pdf/
│       └── recurring-processor/
│
├── assets/                       # Fonts, images, splash
├── app.json                      # Expo config
└── package.json                  # pnpm workspaces
```

### Structure Rationale

- **`app/` (Expo Router):** File-system routing means no manual navigation config. Route groups `(auth)` and `(app)` handle layout separation cleanly.
- **`src/features/`:** Co-locate hooks, types, and logic by feature. Screens import from features; features import from lib. No circular deps.
- **`src/lib/`:** Singleton clients and infrastructure. Only place Supabase is imported directly.
- **`supabase/functions/`:** All heavy/privileged computation lives here, not on the client.

## Architectural Patterns

### Pattern 1: Feature Hook → React Query → Supabase

**What:** All server data access flows through React Query hooks in feature slices. Screens never call Supabase directly.
**When to use:** Always — this is the base pattern.
**Trade-offs:** More boilerplate per feature, but enables caching, offline, and optimistic updates for free.

**Example:**
```typescript
// src/features/expenses/hooks.ts
export function useGroupExpenses(groupId: string) {
  const supabase = useSupabaseClient()
  return useQuery({
    queryKey: ['expenses', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*, expense_payers(*), expense_splits(*)')
        .eq('group_id', groupId)
        .order('date', { ascending: false })
      if (error) throw error
      return data
    },
    staleTime: 30_000,
  })
}
```

### Pattern 2: Optimistic Updates with Rollback

**What:** Mutate the React Query cache immediately on user action; rollback if Supabase returns an error.
**When to use:** Any write that should feel instant (add expense, settle debt, add reaction).
**Trade-offs:** Slightly more code per mutation; eliminates all perceived latency.

**Example:**
```typescript
export function useAddExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (expense: NewExpense) => {
      const { data, error } = await supabase.from('expenses').insert(expense).select().single()
      if (error) throw error
      return data
    },
    onMutate: async (newExpense) => {
      await queryClient.cancelQueries({ queryKey: ['expenses', newExpense.group_id] })
      const previous = queryClient.getQueryData(['expenses', newExpense.group_id])
      queryClient.setQueryData(['expenses', newExpense.group_id], (old: any[]) => [
        { ...newExpense, id: 'temp-' + Date.now() },
        ...(old ?? []),
      ])
      return { previous }
    },
    onError: (_err, newExpense, context) => {
      queryClient.setQueryData(['expenses', newExpense.group_id], context?.previous)
    },
    onSettled: (_data, _err, newExpense) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', newExpense.group_id] })
      queryClient.invalidateQueries({ queryKey: ['balances', newExpense.group_id] })
    },
  })
}
```

### Pattern 3: Supabase Realtime → React Query Cache Invalidation

**What:** Subscribe to Postgres CDC changes; invalidate the relevant React Query cache keys on receipt.
**When to use:** Group expense views — other users adding expenses should appear live.
**Trade-offs:** Doubles network connections; budget one WS per active group screen.

**Example:**
```typescript
useEffect(() => {
  const channel = supabase
    .channel(`group-${groupId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `group_id=eq.${groupId}` },
      () => queryClient.invalidateQueries({ queryKey: ['expenses', groupId] })
    )
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [groupId])
```

### Pattern 4: RLS as Authorization Layer

**What:** Every table has Row Level Security policies. The anchor is `group_members` — if a user's `user_id` is not in `group_members` for a group, they cannot read any expense/settlement/balance for that group.
**When to use:** Always — never skip RLS for convenience.

**Example:**
```sql
-- Users can only SELECT expenses for groups they're members of
CREATE POLICY "members_can_read_expenses" ON expenses
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );
```

### Pattern 5: Offline-First with MMKV Persister

**What:** React Query cache is persisted to MMKV (fastest RN key-value store). On launch, stale data is shown immediately while fresh data loads. Mutations queue when offline and replay on reconnect.
**When to use:** Always — this is a core product promise.

**Example:**
```typescript
// src/lib/persister.ts
import { MMKV } from 'react-native-mmkv'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const storage = new MMKV()
export const persister = createSyncStoragePersister({
  storage: {
    getItem: (key) => storage.getString(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  },
})
```

## Data Flow

### Online Expense Add

```
User taps "Add Expense"
    ↓
AddExpense screen → useAddExpense() mutation
    ↓ optimistic update (cache patched immediately)
Supabase REST → PostgreSQL (RLS check: user in group?)
    ↓ success
DB trigger → debt-simplify Edge Function (async)
    ↓
Realtime broadcast → all group members' clients
    ↓
React Query cache invalidated → UI refreshed
    ↓
push-notify Edge Function → OneSignal → FCM/APNs
```

### Offline Expense Add

```
User taps "Add Expense" (offline)
    ↓
Mutation queued in React Query offline queue (MMKV)
    ↓ optimistic update visible immediately in UI
Network restored
    ↓
Queued mutations replayed in order
    ↓
Server confirms → cache invalidated → balances recalculated
```

### Receipt Scanning

```
User opens camera → captures receipt
    ↓
Image uploaded to Supabase Storage (receipt_url)
    ↓
receipt-ocr Edge Function called with receipt_url
    ↓
OpenAI Vision API → structured JSON (items + prices)
    ↓
Returns to client → user assigns items to payers
    ↓
User confirms → expense created with multi-payer data
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-10k users | Supabase free/pro tier handles this. Single region. Edge Functions cold starts acceptable. |
| 10k-100k users | Move to Supabase Team. Add read replicas. Cache FX rates more aggressively. Batch push notifications. |
| 100k+ users | Consider offloading debt-simplify to dedicated async worker. Add CDN for receipt images. Evaluate dedicated push provider. |

### Scaling Priorities

1. **First bottleneck:** Debt simplification Edge Function — runs on every settlement event. Mitigate by debouncing per group (max once per 30s) and using efficient Schulman's algorithm.
2. **Second bottleneck:** Realtime connections — one WS per active group view. Mitigate by only subscribing when screen is focused; unsubscribe on blur.

## Anti-Patterns

### Anti-Pattern 1: Calling Supabase Directly from Screens

**What people do:** `import { supabase } from '../lib/supabase'` in screen components.
**Why it's wrong:** Bypasses caching, no offline support, no optimistic updates, untestable.
**Do this instead:** Always go through feature hooks + React Query.

### Anti-Pattern 2: Skipping RLS (Client-Side Filtering Only)

**What people do:** `setEnabled: false` on RLS policies and filtering in JS: `expenses.filter(e => e.group_id === groupId)`.
**Why it's wrong:** Fetches all data; leaks other users' financial data if filter has a bug.
**Do this instead:** Every table gets RLS from migration 001. Never disable.

### Anti-Pattern 3: Running Debt Graph on Client

**What people do:** Implement the debt simplification algorithm in TypeScript and call it on every balance render.
**Why it's wrong:** O(n²) complexity, blocks UI thread on large groups, produces inconsistent results across clients.
**Do this instead:** Run in `debt-simplify` Edge Function, store simplified balances in `simplified_balances` table, clients just read it.

### Anti-Pattern 4: Storing Server State in Zustand

**What people do:** `useGroupStore.setState({ expenses: data })` after a Supabase fetch.
**Why it's wrong:** Duplicates React Query's cache; no cache invalidation; stale data bugs.
**Do this instead:** Zustand is for UI state only (theme, sheet open, active tab). React Query owns all data from the server.

### Anti-Pattern 5: Not Seeding RLS Test Data

**What people do:** Test RLS policies manually in Supabase Studio.
**Why it's wrong:** Manual testing misses edge cases (user leaving group, shared expenses).
**Do this instead:** Write `supabase/seed.sql` with multiple test users in overlapping groups; run `supabase db reset` in CI.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| OpenAI Vision API | Called only from `receipt-ocr` Edge Function — API key never on client | Use `gpt-4o` model; always return raw image snippet for user verification |
| Open Exchange Rates | Called from `fx-rates-cache` Edge Function on hourly cron; rates stored in `fx_rates` table | Free tier: 1000 calls/month; cache aggressively |
| OneSignal / FCM | Called from `push-notify` Edge Function triggered by DB webhook on new expense/settlement | Expo Push Token registered on app launch |
| Supabase Auth | Native Expo integration via `@supabase/supabase-js`; auto session refresh via `AsyncStorage` | Use `sessionStorage: AsyncStorage` adapter |
| Supabase Realtime | Subscribe per group screen; unsubscribe on blur/unmount | Budget: 200 concurrent WS connections on free tier |
| Supabase Storage | Receipt images; use signed URLs (1hr expiry) for display | Never expose direct bucket URL |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Screen ↔ Feature Hook | React hook call (same thread) | Screens import from `src/features/*/hooks.ts` only |
| Feature Hook ↔ Supabase | Via `src/lib/supabase.ts` singleton | Import supabase client only in hooks/lib, never screens |
| Edge Function ↔ DB | Internal Supabase service role key (bypasses RLS deliberately for admin operations) | Never expose service key to client |
| Edge Function ↔ External API | Server-to-server HTTPS; secrets in Supabase Vault | OpenAI key, OER key stored as Edge Function env vars |
| Client ↔ Edge Function | Supabase `functions.invoke()` with user JWT | User JWT passed automatically; RLS still applies for DB queries within function |

## Sources

- Supabase official docs: Auth, Realtime, Edge Functions, RLS
- TanStack Query v5 offline documentation
- Expo Router v3 documentation
- react-native-mmkv official docs (MMKV vs AsyncStorage benchmark)
- Schulman's debt simplification algorithm (graph theory)

---
*Architecture research for: React Native + Expo + Supabase expense splitting fintech app*
*Researched: 2026-02-27*

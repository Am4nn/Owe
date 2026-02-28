# Phase 2: Core Expense Loop - Research

**Researched:** 2026-02-28
**Domain:** React Native expense entry, split calculation, balance aggregation, debt simplification, offline mutation queue, swipe gestures, confetti animations
**Confidence:** HIGH (core stack), MEDIUM (debt algorithm nuances, confetti library choice)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| EXPN-01 | User can add an expense with amount, description, payer, and date | React Hook Form + Zod; Supabase insert to `expenses` + `expense_splits` in single operation |
| EXPN-02 | User can split an expense equally among all selected members | dinero.js v2 `allocate` with equal ratios `[1,1,1,...]` handles penny remainder distribution |
| EXPN-03 | User can split by exact amounts per member | Direct `amount_cents` per member; validate sum equals total |
| EXPN-04 | User can split by percentage per member | dinero.js v2 `allocate` with percentage ratios; validate sum = 100 |
| EXPN-05 | User can split by shares (1 share vs 2 shares) | dinero.js v2 `allocate` with integer share counts as ratios |
| EXPN-06 | User can assign expense categories using built-in icons or tags | String category column already in `expenses` schema; static category list in client |
| EXPN-07 | User can edit an expense they created | `UPDATE expenses SET ... WHERE id = $1 AND created_by = auth.uid()` + RLS policy already in place; recalculate splits |
| EXPN-08 | User can delete an expense they created | Soft-delete via `deleted_at = now()` on `expenses`; RLS update policy covers creator |
| EXPN-09 | User can add a 1-on-1 expense outside a group (direct friend split) | Personal group concept: create a virtual group with two members, or use a direct expense model — need schema decision (see Open Questions) |
| BALS-01 | Dashboard shows total "you owe" and "you are owed" | SQL aggregation over `expense_splits` minus `settlements`; React Query cached |
| BALS-02 | Per-group balance breakdown by member net position | GROUP BY member_id query on expenses + settlements per group |
| BALS-03 | Simplified debt suggestions via debt graph algorithm | Supabase Edge Function (Deno TypeScript) implementing greedy min-transactions algorithm |
| SETL-01 | User can record a settlement payment | INSERT to `settlements` table (already in schema); idempotency_key prevents double-record |
| SETL-02 | Confetti animation + haptic feedback when debt fully cleared | `react-native-confetti-cannon` + `expo-haptics`; no new native modules needed |
| SETL-03 | User can view settlement history for a group | Query `settlements` WHERE `group_id = $1` ordered by `settled_at DESC` |
| ACTY-01 | Chronological activity feed of all expense actions | New `activity_feed` view or denormalized `activities` table needed (see Architecture) |
| ACTY-02 | Filter activity feed by group | WHERE `group_id = $1` on activity query |
| ACTY-03 | User can add a comment on an expense | New `expense_comments` table; text + user_id + expense_id |
| ACTY-04 | User can add an emoji reaction to an expense | New `expense_reactions` table; emoji string + user_id + expense_id; UNIQUE constraint |
| OFFL-02 | Add expense while offline; queues locally and syncs on reconnect | `queryClient.setMutationDefaults` + `resumePausedMutations` in `PersistQueryClientProvider.onSuccess`; NetInfo onlineManager |
| UIUX-02 | Swipe expense card for quick-settle or quick-remind | `ReanimatedSwipeable` from `react-native-gesture-handler` (already installed) |
| UIUX-03 | FAB expands to: Scan Receipt / Manual Entry / Add Transfer | Animated FAB with child actions using `react-native-reanimated` (already installed) |
</phase_requirements>

---

## Summary

Phase 2 builds on an already solid Phase 1 foundation. The database schema for `expenses`, `expense_splits`, and `settlements` is already in place with all required columns (integer cents, idempotency_key, split_type, soft-delete via `deleted_at`). The React Query + MMKV persistence layer is already wired in `_layout.tsx`. The main work is UI flows, calculation logic, three new tables (activities/comments/reactions), a Supabase Edge Function for debt simplification, and plumbing the offline mutation queue for OFFL-02.

The biggest technical decision is whether 1-on-1 expenses (EXPN-09) use a "virtual group" model (simpler, reuses all existing group infrastructure) or a parallel direct-expense model (more complex, requires schema changes). The research recommendation is the virtual group model: create a hidden group with exactly two members and route all existing group code through it.

The debt simplification algorithm (BALS-03) is well-understood: compute net balances per member, then greedily match the largest creditor with the largest debtor and emit a payment, repeat until all balances are zero. This runs in O(N log N) in Deno and returns a list of suggested transactions. It does NOT need to be a live query — it is invoked on demand when the user opens the balances screen and the result is cached in React Query.

**Primary recommendation:** Build the expense entry form first (EXPN-01 through EXPN-06 as a single wave), then balances + debt simplification (BALS-01 through BALS-03), then settlement + activity + offline (SETL, ACTY, OFFL-02) in the final wave.

---

## Standard Stack

### Core (already installed — no new installs needed for most features)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | ^7.71.2 | Expense entry form state | Already in package.json; Controller pattern for React Native |
| zod | ^4.3.6 | Schema validation for all form inputs | Already in package.json; integrates with @hookform/resolvers |
| @tanstack/react-query | ^5.90.21 | Data fetching, caching, offline mutation queue | Already configured with MMKV persister |
| react-native-gesture-handler | ~2.30.0 | ReanimatedSwipeable for swipe-to-settle | Already installed |
| react-native-reanimated | 4.2.1 | FAB expand animation, swipe action reveal | Already installed |
| expo-haptics | ~55.0.x | Haptic feedback on settlement confetti | Part of Expo SDK 55; install with `npx expo install expo-haptics` |
| @supabase/supabase-js | ^2.98.0 | DB reads, Edge Function invocation | Already installed |

### New Dependencies Needed

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-confetti-cannon | ^1.5.2 | Confetti animation on debt cleared | Pure JS, no native modules; works in EAS dev client; simpler than Skia-based alternatives |
| @react-native-community/netinfo | latest | Network state for onlineManager | Required for OFFL-02 React Query offline queue; `npx expo install @react-native-community/netinfo` |

Note: `dinero.js` is NOT needed as a library — use integer arithmetic directly. The project has already committed to "store all monetary amounts as INTEGER cents". The split calculations can be done with pure integer math using the same greedy remainder-distribution logic that dinero.js `allocate` uses internally. This avoids adding a dependency and keeps the code straightforward.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-native-confetti-cannon | react-native-fast-confetti | fast-confetti requires @shopify/react-native-skia (large native module, adds ~20MB); cannon is pure JS and sufficient for a celebration moment |
| react-native-confetti-cannon | lottie-react-native | Lottie is heavier, requires lottie-react-native native module; cannon is simpler |
| @react-native-community/netinfo | expo-network | expo-network has a simpler API but less granular connectivity detection; netinfo is the TanStack Query official recommendation |
| Supabase Edge Function for debt simplification | Client-side computation | Graph computation is correct on client for small groups but STATE.md already identified this should be server-side; Edge Function is the decided approach |

**Installation (new packages only):**
```bash
pnpm add react-native-confetti-cannon
npx expo install @react-native-community/netinfo
```

---

## Architecture Patterns

### Recommended Project Structure for Phase 2

```
src/
├── features/
│   ├── expenses/
│   │   ├── hooks.ts           # useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense
│   │   ├── types.ts           # Expense, ExpenseSplit, CreateExpenseInput
│   │   ├── splits.ts          # Pure functions: computeEqualSplits, computeExactSplits, computePercentageSplits, computeSharesSplits
│   │   └── categories.ts      # CATEGORY_LIST constant (icon + label pairs)
│   ├── balances/
│   │   ├── hooks.ts           # useBalanceSummary, useGroupBalances, useSimplifiedDebts
│   │   └── types.ts           # BalanceSummary, GroupBalance, DebtSuggestion
│   ├── settlements/
│   │   ├── hooks.ts           # useCreateSettlement, useSettlementHistory
│   │   └── types.ts           # Settlement, CreateSettlementInput
│   └── activity/
│       ├── hooks.ts           # useActivityFeed, useAddComment, useAddReaction
│       └── types.ts           # ActivityItem, Comment, Reaction
├── components/
│   ├── ui/                    # Existing Button, Input
│   ├── expenses/
│   │   ├── ExpenseCard.tsx    # With swipe-to-settle (ReanimatedSwipeable)
│   │   └── SplitEditor.tsx    # Split mode selector + per-member amount inputs
│   ├── balances/
│   │   └── BalanceCard.tsx    # Per-member balance row
│   └── settlement/
│       └── ConfettiScreen.tsx # Full-screen settlement success + confetti
└── stores/
    └── ui.ts                  # Existing Zustand store

app/(app)/
├── index.tsx                  # Dashboard — add BALS-01 summary here
├── expenses/
│   ├── new.tsx                # EXPN-01 to EXPN-06 — expense entry form
│   └── [id]/
│       ├── index.tsx          # Expense detail + ACTY-03, ACTY-04
│       └── edit.tsx           # EXPN-07 — edit flow
├── groups/
│   └── [id]/
│       ├── index.tsx          # Existing member list — extend with expense list + BALS-02
│       ├── balances.tsx       # BALS-03 simplified debts
│       └── activity.tsx       # ACTY-01, ACTY-02
└── settlement/
    └── success.tsx            # SETL-02 confetti screen

supabase/
├── migrations/
│   └── 20260228000003_expense_loop.sql   # activities, comments, reactions tables + new indexes
└── functions/
    └── simplify-debts/
        └── index.ts           # BALS-03 Deno Edge Function
```

### Pattern 1: Split Calculation as Pure Functions

**What:** All four split modes (equal, exact, percentage, shares) are pure TypeScript functions that take total cents + member list and return `{ member_id, amount_cents }[]`. Remainder pennies are distributed greedily (first N members each get +1 cent until remainder is absorbed).

**When to use:** Called in the expense form before submission, also used in edit to pre-populate split amounts.

**Example:**
```typescript
// Source: dinero.js allocate algorithm adapted to integer math (terbium.io/2020/09/debt-simplification)
// Pure function — no library dependency needed

/** Distribute `totalCents` equally among `memberIds`. Remainder cents go to first N members. */
export function computeEqualSplits(
  totalCents: number,
  memberIds: string[]
): Array<{ member_id: string; amount_cents: number }> {
  const n = memberIds.length
  const base = Math.floor(totalCents / n)
  const remainder = totalCents - base * n

  return memberIds.map((member_id, i) => ({
    member_id,
    amount_cents: base + (i < remainder ? 1 : 0),
  }))
}

/** Split by shares (e.g., member A has 1 share, member B has 2 shares). */
export function computeSharesSplits(
  totalCents: number,
  memberShares: Array<{ member_id: string; shares: number }>
): Array<{ member_id: string; amount_cents: number }> {
  const totalShares = memberShares.reduce((sum, m) => sum + m.shares, 0)
  let assigned = 0

  return memberShares.map(({ member_id, shares }, i) => {
    // Last member gets the remainder to avoid rounding drift
    if (i === memberShares.length - 1) {
      return { member_id, amount_cents: totalCents - assigned }
    }
    const amount = Math.floor((shares / totalShares) * totalCents)
    assigned += amount
    return { member_id, amount_cents: amount }
  })
}

/** Split by percentage. percentages must sum to 100. */
export function computePercentageSplits(
  totalCents: number,
  memberPercentages: Array<{ member_id: string; percentage: number }>
): Array<{ member_id: string; amount_cents: number }> {
  // Same as shares — percentages are just shares that sum to 100
  return computeSharesSplits(
    totalCents,
    memberPercentages.map(m => ({ member_id: m.member_id, shares: m.percentage }))
  )
}
```

### Pattern 2: Expense Insert — Atomic Expense + Splits

**What:** Insert `expenses` and all `expense_splits` rows in a single async operation. Use `idempotency_key` from the form (generated client-side) so retries are safe.

**When to use:** Always — never insert expense without splits in the same mutation.

**Example:**
```typescript
// Source: Supabase JS client pattern, idempotency_key in schema (migration 20260227000001)
export function useCreateExpense() {
  const qc = useQueryClient()

  return useMutation({
    mutationKey: ['expenses', 'create'],  // Required for offline queue resume
    mutationFn: async (input: CreateExpenseInput) => {
      const userId = await getCurrentUserId()

      // 1. Insert expense row
      const { data: expense, error: expError } = await supabase
        .from('expenses')
        .insert({
          group_id: input.group_id,
          created_by: userId,
          description: input.description,
          amount_cents: input.amount_cents,
          currency: input.currency,
          base_currency: input.base_currency,
          fx_rate_at_creation: 1.0,          // Phase 2: single-currency only; Phase 3 adds FX
          amount_base_cents: input.amount_cents,
          split_type: input.split_type,
          payer_id: input.payer_member_id,
          expense_date: input.expense_date,
          category: input.category ?? null,
          idempotency_key: input.idempotency_key,  // UUID generated client-side
        })
        .select()
        .single()
      if (expError) throw expError

      // 2. Insert all splits in one batch insert
      const { error: splitsError } = await supabase
        .from('expense_splits')
        .insert(
          input.splits.map(s => ({
            expense_id: expense.id,
            member_id: s.member_id,
            amount_cents: s.amount_cents,
          }))
        )
      if (splitsError) throw splitsError

      return expense
    },
    onSuccess: (_data, input) => {
      qc.invalidateQueries({ queryKey: ['expenses', input.group_id] })
      qc.invalidateQueries({ queryKey: ['balances'] })
    },
  })
}
```

### Pattern 3: Offline Mutation Queue (OFFL-02)

**What:** Mutations created while offline are paused by React Query (network mode: 'online' is the default). On reconnect, `resumePausedMutations()` replays them. Requires `mutationKey` on the mutation AND `setMutationDefaults` so functions survive serialization across restarts.

**When to use:** For the `useCreateExpense` mutation (OFFL-02). The mutation key `['expenses', 'create']` must match between `setMutationDefaults` and `useMutation`.

**Example:**
```typescript
// Source: TanStack Query React Native docs + dev.to/fedorish offline-first pattern

// In app/_layout.tsx or a dedicated setup file:
queryClient.setMutationDefaults(['expenses', 'create'], {
  mutationFn: createExpenseMutationFn,  // Same fn as in useCreateExpense
})

// In PersistQueryClientProvider:
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 }}
  onSuccess={() => {
    // Replay any mutations that were queued while offline
    queryClient.resumePausedMutations().then(() => {
      queryClient.invalidateQueries()
    })
  }}
>
```

```typescript
// NetInfo onlineManager setup — call this once at app startup
import NetInfo from '@react-native-community/netinfo'
import { onlineManager } from '@tanstack/react-query'

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(
      state.isConnected != null &&
      state.isConnected &&
      Boolean(state.isInternetReachable)
    )
  })
})
```

### Pattern 4: Debt Simplification — Edge Function (BALS-03)

**What:** Greedy algorithm that computes net balances per member then iteratively matches largest creditor with largest debtor. Runs in Deno, invoked via `supabase.functions.invoke('simplify-debts', { body: { group_id } })`. The result is a list of suggested payments, not actual transactions.

**When to use:** On-demand when user opens the simplified debts screen; cached in React Query with a 60-second staleTime (balance changes are triggered by expense mutations that invalidate this query).

**Example (Edge Function):**
```typescript
// Source: terbium.io/2020/09/debt-simplification algorithm adapted to Deno
// supabase/functions/simplify-debts/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  const { group_id } = await req.json()
  const authHeader = req.headers.get('Authorization')!

  // Use anon key + user JWT to respect RLS — the function returns only data the user can see
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  // Fetch all expenses + splits for group
  const { data: splits } = await supabase
    .from('expense_splits')
    .select('member_id, amount_cents, expense:expenses!inner(payer_id, group_id, deleted_at)')
    .eq('expense.group_id', group_id)
    .is('expense.deleted_at', null)

  const { data: settlements } = await supabase
    .from('settlements')
    .select('payer_id, payee_id, amount_cents')
    .eq('group_id', group_id)

  // Compute net balance per member_id
  const balances = new Map<string, number>()

  for (const split of splits ?? []) {
    const payerId = split.expense.payer_id
    const memberId = split.member_id
    // Payer "lent" amount_cents; split member "owes" amount_cents
    balances.set(payerId, (balances.get(payerId) ?? 0) + split.amount_cents)
    balances.set(memberId, (balances.get(memberId) ?? 0) - split.amount_cents)
  }

  for (const s of settlements ?? []) {
    // Payer paid, reducing what they owe; payee received, reducing what they're owed
    balances.set(s.payer_id, (balances.get(s.payer_id) ?? 0) + s.amount_cents)
    balances.set(s.payee_id, (balances.get(s.payee_id) ?? 0) - s.amount_cents)
  }

  // Greedy simplification — O(N log N)
  const creditors: Array<{ id: string; amount: number }> = []
  const debtors: Array<{ id: string; amount: number }> = []

  for (const [id, net] of balances) {
    if (net > 0) creditors.push({ id, amount: net })
    else if (net < 0) debtors.push({ id, amount: -net })
  }

  const suggestions: Array<{ from: string; to: string; amount_cents: number }> = []

  while (creditors.length > 0 && debtors.length > 0) {
    creditors.sort((a, b) => b.amount - a.amount)
    debtors.sort((a, b) => b.amount - a.amount)

    const creditor = creditors[0]
    const debtor = debtors[0]
    const payment = Math.min(creditor.amount, debtor.amount)

    suggestions.push({ from: debtor.id, to: creditor.id, amount_cents: payment })

    creditor.amount -= payment
    debtor.amount -= payment

    if (creditor.amount === 0) creditors.shift()
    if (debtor.amount === 0) debtors.shift()
  }

  return new Response(JSON.stringify({ suggestions }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### Pattern 5: Confetti + Haptic on Settlement (SETL-02)

**What:** Navigate to a dedicated `settlement/success.tsx` screen that shows confetti and triggers haptic feedback. ConfettiCannon fires once on mount.

**Example:**
```typescript
// Source: react-native-confetti-cannon README + expo-haptics docs
import ConfettiCannon from 'react-native-confetti-cannon'
import * as Haptics from 'expo-haptics'
import { useEffect, useRef } from 'react'

export default function SettlementSuccessScreen() {
  const confettiRef = useRef<ConfettiCannon>(null)

  useEffect(() => {
    // Trigger haptic first (immediate), then confetti
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    confettiRef.current?.start()
  }, [])

  return (
    <View className="flex-1 bg-dark-bg items-center justify-center">
      <ConfettiCannon
        ref={confettiRef}
        count={200}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        colors={['#6C63FF', '#00F5D4', '#06D6A0', '#FF4D6D']}
        fallSpeed={3000}
      />
      <Text className="text-white text-2xl font-bold">All settled!</Text>
    </View>
  )
}
```

### Pattern 6: ReanimatedSwipeable for Expense Cards (UIUX-02)

**What:** Wrap each expense card in `ReanimatedSwipeable` from `react-native-gesture-handler`. Right swipe reveals "Settle" action; left swipe reveals "Remind" action.

**Example:**
```typescript
// Source: docs.swmansion.com/react-native-gesture-handler/docs/components/reanimated_swipeable
import { ReanimatedSwipeable } from 'react-native-gesture-handler/ReanimatedSwipeable'

function ExpenseCard({ expense }: { expense: Expense }) {
  const swipeRef = useRef<SwipeableMethods>(null)

  const renderRightActions = () => (
    <TouchableOpacity
      className="bg-brand-success w-20 items-center justify-center rounded-r-2xl"
      onPress={() => {
        swipeRef.current?.close()
        // navigate to settle flow
      }}
    >
      <Text className="text-white font-semibold text-xs">Settle</Text>
    </TouchableOpacity>
  )

  const renderLeftActions = () => (
    <TouchableOpacity
      className="bg-brand-accent w-20 items-center justify-center rounded-l-2xl"
      onPress={() => {
        swipeRef.current?.close()
        // trigger remind notification
      }}
    >
      <Text className="text-dark-bg font-semibold text-xs">Remind</Text>
    </TouchableOpacity>
  )

  return (
    <ReanimatedSwipeable
      ref={swipeRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootFriction={8}
    >
      {/* expense card content */}
    </ReanimatedSwipeable>
  )
}
```

### Pattern 7: Expandable FAB (UIUX-03)

**What:** A floating action button that expands to show three child actions (Scan Receipt, Manual Entry, Add Transfer) using Reanimated interpolation. Child buttons fade in and slide up.

**Example:**
```typescript
// Source: react-native-reanimated docs — interpolate + withSpring
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated'

export function ExpandableFAB() {
  const isOpen = useSharedValue(0)

  const toggle = () => {
    isOpen.value = withSpring(isOpen.value === 0 ? 1 : 0)
  }

  const child1Style = useAnimatedStyle(() => ({
    opacity: isOpen.value,
    transform: [{ translateY: interpolate(isOpen.value, [0, 1], [0, -70]) }],
  }))

  // ... repeat for child2 (-140) and child3 (-210)

  return (
    <View className="absolute bottom-8 right-6">
      {/* Child actions (render behind FAB) */}
      <Animated.View style={child1Style}>
        <FABChild label="Manual Entry" icon="pencil" onPress={...} />
      </Animated.View>
      {/* Main FAB */}
      <TouchableOpacity
        onPress={toggle}
        className="bg-brand-primary w-14 h-14 rounded-full items-center justify-center"
      >
        <Text className="text-white text-2xl">+</Text>
      </TouchableOpacity>
    </View>
  )
}
```

### Anti-Patterns to Avoid

- **Float arithmetic for money:** Never use `amount / memberCount` as a float. Always use integer math with explicit remainder distribution (see Pattern 1).
- **Multiple expense inserts without splits:** Never `INSERT expenses` without immediately `INSERT expense_splits`. Orphaned expense rows produce incorrect balances.
- **Client-side debt simplification as live query:** Do not compute this in a React Query `queryFn` that runs every render or on every balance change. Call the Edge Function on demand and cache the result.
- **Missing `mutationKey` on offline mutations:** Without `mutationKey: ['expenses', 'create']` the mutation cannot be resumed after app restart. The function reference is lost; the key is what allows `setMutationDefaults` to re-attach it.
- **Skipping `supabase.removeChannel(channel)` cleanup:** Supabase Realtime subscriptions must be unsubscribed in the React `useEffect` cleanup or they accumulate across navigations and cause memory leaks.
- **Calling `router.back()` after offline mutation:** The mutation is paused (not completed) while offline. Do not navigate away expecting success — use `onMutate` optimistic update + `onError` rollback pattern.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Penny remainder in splits | Custom rounding logic | Integer math with greedy +1 distribution (Pattern 1 above) | Float rounding is non-deterministic; greedy integer distribution is mathematically correct and deterministic |
| Debt graph simplification | Ad-hoc pairwise netting | Greedy creditor/debtor matching algorithm (Pattern 4 above) | Naive pairwise approach misses multi-hop cancellations; greedy is O(N log N) and near-optimal |
| Offline mutation queue | Custom AsyncStorage queue | TanStack Query `networkMode: 'online'` + `resumePausedMutations` | React Query already pauses mutations when offline; custom queues re-implement this and miss edge cases (failures, retries, deduplication) |
| Network connectivity | `useState` + polling | `@react-native-community/netinfo` + `onlineManager.setEventListener` | NetInfo uses native OS connectivity APIs; polling misses brief offline windows |
| Swipe-to-action | PanResponder manual tracking | `ReanimatedSwipeable` from gesture-handler | PanResponder does not respect gesture responder priority chain; causes gesture conflicts in FlatList |
| Confetti animation | Custom particle system with Animated API | `react-native-confetti-cannon` | Particle systems require frame-by-frame computation; cannon uses JS Animated which runs on the JS thread but is sufficient for a one-shot celebration moment |

**Key insight:** The database schema (expenses, splits, settlements) was already designed for Phase 2 in Phase 1. The primary work is building the UI layer on top of an already-correct data model.

---

## Common Pitfalls

### Pitfall 1: Penny Drift in Multi-Member Equal Splits

**What goes wrong:** `Math.floor(1000 / 3)` = 333 for each member, total is 999 not 1000. Balance calculations become permanently off by 1 cent per expense.
**Why it happens:** Integer division loses the remainder.
**How to avoid:** Use the greedy +1 remainder pattern (Pattern 1). Always assert `splits.reduce((s, m) => s + m.amount_cents, 0) === totalCents` before inserting.
**Warning signs:** Balance totals that are off by small amounts (1-3 cents) for groups with 3+ members.

### Pitfall 2: Orphaned Expense on Split Insert Failure

**What goes wrong:** The `expenses` row is created successfully but the `expense_splits` INSERT fails (e.g., RLS violation, constraint error). The expense exists with no splits — balance queries produce garbage.
**Why it happens:** Two separate INSERT calls are not wrapped in a transaction.
**How to avoid:** Use a Supabase RPC (PostgreSQL function) or insert expenses + splits in sequence with rollback on split failure: `if (splitsError) { await supabase.from('expenses').delete().eq('id', expense.id); throw splitsError }`. Alternatively, use a single Supabase Edge Function that wraps both inserts in a DB transaction.
**Warning signs:** Expenses appearing in the list with $0 balance attribution to any member.

### Pitfall 3: Offline Mutation Not Resuming After Restart

**What goes wrong:** User adds expense offline, closes the app, reopens when online — expense is never synced.
**Why it happens:** `mutationFn` is a function reference that cannot be serialized. On app restart, the persisted mutation state has no function to call.
**How to avoid:** Call `queryClient.setMutationDefaults(['expenses', 'create'], { mutationFn: ... })` at app startup before `PersistQueryClientProvider` renders. The `mutationKey` must exactly match the key used in `useMutation`.
**Warning signs:** Offline expenses silently disappear after app restart; no error shown.

### Pitfall 4: Supabase Realtime Channel Memory Leak

**What goes wrong:** Every time the group detail screen mounts, a new channel subscription is created. Navigating away and back accumulates subscriptions. Supabase eventually closes the oldest ones, causing missed updates.
**Why it happens:** `supabase.channel().subscribe()` without cleanup in `useEffect` return.
**How to avoid:** Always `return () => supabase.removeChannel(channel)` in the useEffect cleanup.
**Warning signs:** After navigating group screens multiple times, Supabase logs show "Realtime channel limit exceeded" or balance updates stop appearing in real time.

### Pitfall 5: RLS Policy Missing for New Tables

**What goes wrong:** `activities`, `expense_comments`, and `expense_reactions` tables are created without RLS. Group members can read data from other groups they don't belong to.
**Why it happens:** New tables default to `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` being the implicit state if not explicitly enabled.
**How to avoid:** Follow the foundation migration pattern — immediately after `CREATE TABLE`, add `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and policies. Every new table in the migration must have RLS on before the migration is committed.
**Warning signs:** Users see activity from groups they left or were never in.

### Pitfall 6: 1-on-1 Expense Group Leaking into Groups List

**What goes wrong:** If EXPN-09 is implemented using a virtual group, the "virtual" group appears in the user's group list on the dashboard.
**Why it happens:** `useGroups()` queries all groups the user belongs to with no filtering.
**How to avoid:** Add a `is_direct` BOOLEAN column to `groups` (DEFAULT FALSE). Filter out `is_direct = true` groups in the `useGroups` hook and show them only in a dedicated "Friends" or "Direct" section.
**Warning signs:** Users see unnamed or confusingly named groups in their main list.

### Pitfall 7: Debt Simplification Edge Function Returns Data from Wrong Group

**What goes wrong:** Edge Function computes debts using service_role and returns data for groups the user doesn't belong to if group_id validation is skipped.
**Why it happens:** Using service_role key bypasses RLS.
**How to avoid:** Use anon key + user JWT (`Authorization: Bearer <token>`) in the Edge Function, not the service_role key. RLS automatically filters to authorized groups. Pattern 4 above demonstrates the correct approach.

---

## Code Examples

### Balance Query — Per-Member Net Position

```typescript
// Source: Supabase JS client, PostgreSQL aggregation
// Computes net balance for each member in a group
// Positive = owed money; Negative = owes money

export function useGroupBalances(groupId: string) {
  return useQuery({
    queryKey: ['balances', groupId],
    queryFn: async () => {
      // Get all splits with payer info
      const { data: splits, error } = await supabase
        .from('expense_splits')
        .select(`
          member_id,
          amount_cents,
          expense:expenses!inner (
            payer_id,
            group_id,
            deleted_at
          )
        `)
        .eq('expense.group_id', groupId)
        .is('expense.deleted_at', null)

      if (error) throw error

      // Get all settlements for the group
      const { data: settlements, error: sErr } = await supabase
        .from('settlements')
        .select('payer_id, payee_id, amount_cents')
        .eq('group_id', groupId)

      if (sErr) throw sErr

      // Build net balance map
      const balances = new Map<string, number>()

      for (const split of splits ?? []) {
        const payerId = split.expense.payer_id
        const memberId = split.member_id
        balances.set(payerId, (balances.get(payerId) ?? 0) + split.amount_cents)
        balances.set(memberId, (balances.get(memberId) ?? 0) - split.amount_cents)
      }

      for (const s of settlements ?? []) {
        balances.set(s.payer_id, (balances.get(s.payer_id) ?? 0) + s.amount_cents)
        balances.set(s.payee_id, (balances.get(s.payee_id) ?? 0) - s.amount_cents)
      }

      return balances
    },
    staleTime: 30_000,
  })
}
```

### Supabase Realtime Invalidation

```typescript
// Source: supabase.com/docs/guides/realtime/postgres-changes
// Invalidates React Query balances cache when expenses change in real-time

export function useRealtimeExpenseSync(groupId: string) {
  const qc = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel(`expenses:${groupId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses', filter: `group_id=eq.${groupId}` },
        () => {
          qc.invalidateQueries({ queryKey: ['expenses', groupId] })
          qc.invalidateQueries({ queryKey: ['balances', groupId] })
        }
      )
      .subscribe()

    // Critical: cleanup prevents channel accumulation
    return () => { supabase.removeChannel(channel) }
  }, [groupId, qc])
}
```

### New Migration Tables Required

```sql
-- supabase/migrations/20260228000003_expense_loop.sql
-- ACTY-01/02: Activity feed (denormalized for query performance)
CREATE TABLE public.activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  actor_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('expense_added', 'expense_edited', 'expense_deleted', 'settlement_recorded', 'comment_added', 'reaction_added')),
  expense_id  UUID REFERENCES public.expenses(id) ON DELETE SET NULL,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_can_read_activities"
  ON public.activities FOR SELECT
  USING (group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid()));

CREATE POLICY "members_can_insert_activities"
  ON public.activities FOR INSERT
  WITH CHECK (group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid()));

-- ACTY-03: Expense comments
CREATE TABLE public.expense_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id  UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body        TEXT NOT NULL CHECK (char_length(body) >= 1 AND char_length(body) <= 1000),
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.expense_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_can_read_comments"
  ON public.expense_comments FOR SELECT
  USING (expense_id IN (
    SELECT e.id FROM public.expenses e
    WHERE e.group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  ));

CREATE POLICY "members_can_insert_comments"
  ON public.expense_comments FOR INSERT
  WITH CHECK (
    author_id = auth.uid() AND
    expense_id IN (
      SELECT e.id FROM public.expenses e
      WHERE e.group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
    )
  );

-- ACTY-04: Emoji reactions (one per user per expense)
CREATE TABLE public.expense_reactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id  UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji       TEXT NOT NULL CHECK (char_length(emoji) <= 8),
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT unique_user_reaction_per_expense UNIQUE (expense_id, user_id)
);
ALTER TABLE public.expense_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_can_read_reactions"
  ON public.expense_reactions FOR SELECT
  USING (expense_id IN (
    SELECT e.id FROM public.expenses e
    WHERE e.group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
  ));

CREATE POLICY "members_can_insert_reactions"
  ON public.expense_reactions FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    expense_id IN (
      SELECT e.id FROM public.expenses e
      WHERE e.group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "users_can_delete_own_reactions"
  ON public.expense_reactions FOR DELETE
  USING (user_id = auth.uid());

-- EXPN-09: Direct 1-on-1 expenses — add is_direct flag to groups
ALTER TABLE public.groups ADD COLUMN is_direct BOOLEAN NOT NULL DEFAULT false;

-- Indexes for new tables
CREATE INDEX idx_activities_group_id ON public.activities(group_id);
CREATE INDEX idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX idx_expense_comments_expense_id ON public.expense_comments(expense_id);
CREATE INDEX idx_expense_reactions_expense_id ON public.expense_reactions(expense_id);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Splitwise-style pairwise debt comparison (bilateral) | Greedy net-balance approach (multilateral simplification) | Widely adopted 2018+ | Reduces N*(N-1)/2 potential transactions to at most N-1 |
| React Native Animated API for swipe | ReanimatedSwipeable from react-native-gesture-handler | ~2023 (Reanimated 2+) | Runs on UI thread; no JS thread jank |
| Custom FAB expand with setState | Reanimated `useSharedValue` + `withSpring` | ~2022 (Reanimated 2) | Frame-rate independent, native animation |
| Lottie for confetti | react-native-confetti-cannon (pure JS) | ~2020 | Simpler, no native module, sufficient for single-use celebration |
| Manual AsyncStorage queue for offline | TanStack Query `networkMode + resumePausedMutations` | TanStack Query v4+ | Built-in pause/resume lifecycle; no custom queue code |

**Deprecated/outdated:**
- Old `Swipeable` component (non-Reanimated): replaced by `ReanimatedSwipeable` — use the Reanimated version; the old one does not support Reanimated 4.x
- `dinero.js v1` (`Dinero({ amount: 100 })`): project uses dinero.js v2 API if needed, but the research recommendation is pure integer math (no library)
- `expo-network` for connectivity: prefer `@react-native-community/netinfo` for TanStack Query integration per official docs

---

## Open Questions

1. **EXPN-09: Virtual Group vs. Direct Expense Model**
   - What we know: The schema has no "direct expense" concept currently. `groups` table is used for all expenses.
   - What's unclear: Should 1-on-1 expenses create a hidden group (`is_direct = true`) shared between two users, or a separate `direct_expenses` table?
   - Recommendation: Use virtual group approach — add `is_direct BOOLEAN` to `groups`, filter these out of the main groups list, and route all existing expense/balance/settlement logic through them unchanged. Zero schema divergence for Phase 2.

2. **Expense-Settlement Atomicity**
   - What we know: Expense insert and split insert are two separate Supabase operations; no client-side transaction support.
   - What's unclear: If the network drops between expense insert and split insert, the expense row is orphaned.
   - Recommendation: Create a Supabase Edge Function `create-expense` that wraps both inserts in a PostgreSQL transaction (`BEGIN; INSERT expenses; INSERT expense_splits; COMMIT`). Alternatively, use a compensating delete on split failure. The Edge Function approach is cleaner and enables future atomic operations (e.g., activity log entry in the same transaction).

3. **Activity Feed Architecture**
   - What we know: ACTY-01 requires a chronological feed. Options: (a) denormalized `activities` table populated by DB triggers, (b) client-side union query of expenses + settlements.
   - What's unclear: DB triggers require SECURITY DEFINER functions (same as the profile trigger) and add complexity; union queries are simpler but harder to filter.
   - Recommendation: Denormalized `activities` table (as in the migration above). Populate it via DB triggers on INSERT to `expenses` and `settlements`. This makes the feed query trivial and allows Realtime subscription to a single table.

4. **Balance Query Performance at Scale**
   - What we know: The current balance computation is a client-side reduction over all splits fetched from Supabase.
   - What's unclear: For groups with hundreds of expenses, fetching all splits is expensive.
   - Recommendation: For Phase 2, client-side reduction is fine (groups in MVP are small). Add a PostgreSQL materialized view or server-side balance aggregation in Phase 3 if groups grow large.

5. **`@react-native-community/netinfo` Already Installed?**
   - What we know: It is NOT in package.json currently.
   - What's unclear: Whether expo-network (already bundled with Expo SDK 55) is a sufficient substitute.
   - Recommendation: Install `@react-native-community/netinfo` — it is the officially recommended integration for TanStack Query's `onlineManager` per the React Native TanStack docs. `expo-network` is viable but less tested with TanStack Query's pause/resume lifecycle.

---

## Sources

### Primary (HIGH confidence)
- Supabase official docs (supabase.com/docs/guides/realtime/postgres-changes) — Realtime channel API, filter syntax, unsubscribe pattern
- Supabase official docs (supabase.com/docs/guides/functions) — Edge Function structure, anon key + JWT forwarding
- TanStack Query React Native docs (tanstack.com/query/latest/docs/framework/react/react-native) — onlineManager, NetInfo integration
- TanStack Query Mutations docs (tanstack.com/query/v5/docs/framework/react/guides/mutations) — mutationKey, setMutationDefaults, resumePausedMutations
- React Native Gesture Handler docs (docs.swmansion.com/react-native-gesture-handler/docs/components/reanimated_swipeable) — ReanimatedSwipeable API
- expo-haptics official docs (docs.expo.dev/versions/latest/sdk/haptics) — notificationAsync, impactAsync, platform support

### Secondary (MEDIUM confidence)
- terbium.io/2020/09/debt-simplification — Greedy debt simplification algorithm steps (cross-verified with multiple sources; algorithm is mathematically standard)
- dev.to/fedorish/react-native-offline-first-with-tanstack-query — PersistQueryClientProvider + resumePausedMutations full setup code
- github.com/AlirezaHadjar/react-native-fast-confetti — Peer dependency requirements (Skia); reason for choosing confetti-cannon instead
- dinerojs.com/module-dinero — allocate function behavior for split remainder handling (used as reference for pure integer math approach)

### Tertiary (LOW confidence)
- WebSearch results on Schulman's algorithm — multiple sources confirmed it's the standard greedy net-balance approach; no single authoritative paper found (the problem is attributed to various practitioners)

---

## Metadata

**Confidence breakdown:**
- Standard stack (existing libs): HIGH — all packages verified in package.json and official docs
- New packages (confetti-cannon, netinfo): MEDIUM — both verified on npm and GitHub but Expo SDK 55 compatibility not explicitly confirmed in changelogs
- Architecture (split functions, balance queries): HIGH — based on existing schema + standard SQL patterns
- Debt simplification algorithm: HIGH — greedy net-balance algorithm is well-documented across multiple independent sources
- Offline mutation queue: MEDIUM — core pattern verified in TanStack docs; edge cases (multiple mutations, failure ordering) may need field validation
- Pitfalls: HIGH — derived from existing project decisions in STATE.md and architecture analysis

**Research date:** 2026-02-28
**Valid until:** 2026-03-30 (stable libraries; Supabase Edge Function API is evolving but core patterns are stable)

# Phase 3: Engagement Layer - Research

**Researched:** 2026-03-01
**Domain:** Push Notifications (EAS/expo-notifications), Multi-Currency FX, Smart Reminders (pg_cron), CSV Export (expo-file-system + expo-sharing)
**Confidence:** HIGH (all critical claims verified against official docs)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| NOTF-01 | User receives push notification when someone adds an expense to a shared group | EAS Push + Supabase DB Webhook → push-notify Edge Function; token stored in profiles.push_token |
| NOTF-02 | User receives push notification when a group member records a settlement with them | Same push-notify Edge Function; settlements table webhook, filter payee's push_token |
| NOTF-03 | User can configure smart reminders — a nudge sent after configurable delay if a debt is unpaid | pg_cron scheduled Edge Function (daily); reminder_config table per group_member; check balances, emit push |
| CURR-01 | User can set a base currency for a group | groups.base_currency TEXT column already exists from Phase 1 schema — just expose UI + UPDATE |
| CURR-02 | User can add an expense in a different currency from the group base currency | expenses.currency != groups.base_currency; existing schema supports this — UI currency picker + FX lookup |
| CURR-03 | Expense amounts converted to base currency using real-time FX rates at time of creation | fx-rates-cache Edge Function (hourly pg_cron); rates stored in fx_rates table; amount_base_cents computed at INSERT |
| CURR-04 | Both original and converted amounts shown on expense cards | ExpenseCard reads expense.currency, expense.amount_cents (original) + expense.amount_base_cents + expense.base_currency |
| EXPT-01 | User can export group's expense history as CSV | expo-file-system writeAsStringAsync + expo-sharing shareAsync; CSV built in app from TanStack Query cache or Supabase query |
</phase_requirements>

---

## Summary

Phase 3 introduces four largely independent feature domains that can be planned as two focused plans matching the roadmap sketch. The push notification chain (NOTF-01, NOTF-02, NOTF-03) runs through Supabase Database Webhooks → a Deno Edge Function → Expo Push API. The multi-currency domain (CURR-01 through CURR-04) builds on existing schema columns already provisioned in Phase 1 (`groups.base_currency`, `expenses.currency`, `expenses.fx_rate_at_creation`, `expenses.amount_base_cents`) — Phase 3 just needs to wire up the FX rate fetch, expose a currency picker UI, and render both amounts on cards. Smart reminders use pg_cron (mature, verified via official Supabase docs) to call a scheduled Edge Function that checks balances and dispatches reminders. CSV export is handled entirely on the client using `expo-file-system` + `expo-sharing` with no additional native build required.

The most technically complex area is the push notification token lifecycle. The `push_token` column already exists on `profiles` in the Phase 1 schema. The key requirements are: (1) call `getExpoPushTokenAsync({ projectId })` on every app launch and upsert to `profiles.push_token`; (2) create an Android notification channel with `setNotificationChannelAsync` before calling the token API; (3) handle `DeviceNotRegistered` receipts server-side by nulling the token; (4) store the notification URL target in the `data` field of the push payload and use `useLastNotificationResponse` + `router.push()` for deep-link navigation in expo-router.

**Primary recommendation:** Use the two-plan structure from the roadmap. Plan 03-01 covers the push notification chain (NOTF-01, NOTF-02, NOTF-03). Plan 03-02 covers multi-currency + export (CURR-01 through CURR-04, EXPT-01). This keeps each plan's surface area contained and allows parallel DB migration + Edge Function work.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-notifications | ~55.0.x (bundled SDK 55) | Token registration, permission requests, notification channel, notification response listeners | Official Expo push SDK; required for EAS Push Service integration |
| expo-device | ~55.0.x | Detect physical device before requesting push token (simulators reject) | Required guard per Expo docs |
| expo-constants | ~55.0.7 (already installed) | Read `expoConfig.extra.eas.projectId` for getExpoPushTokenAsync | Already in project |
| expo-file-system | ~55.0.10 (already installed) | Write CSV string to device cache directory | Already in project |
| expo-sharing | ~55.0.x | Share CSV via native share sheet (iOS Save to Files / Android SAF) | Standard Expo export pattern |
| Supabase Edge Functions (Deno) | N/A (server) | push-notify function (NOTF-01/02), fx-rates-cache function (CURR-03), reminders function (NOTF-03) | Already established in project (simplify-debts pattern) |
| Expo Push API | `https://exp.host/--/api/v2/push/send` | Route push notifications through EAS to FCM/APNs | Expo managed delivery |
| fawazahmed0/exchange-api | CDN — daily updated | Free, no-rate-limit FX rates; 200+ currencies | No API key, no quota, served via jsDelivr CDN |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-notifications (addPushTokenListener) | bundled | Detect mid-session token rotation | Always register listener alongside getExpoPushTokenAsync |
| dinero.js | ^2.x (already installed per project decisions) | Multiply amount_cents by FX rate to compute amount_base_cents | All monetary arithmetic; project rule: never use float math |
| @supabase/supabase-js | ^2.98.0 (already installed) | Query expenses for CSV, update groups.base_currency | Already established |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| fawazahmed0/exchange-api | Open Exchange Rates free tier | OXR free tier USD-base-only, 1000 req/month soft limit; fawazahmed0 has no limits but is only daily updated (acceptable since rates are snapshotted at creation time) |
| fawazahmed0/exchange-api | exchangerate.host / ExchangeRates-API | Require registration/API keys; fawazahmed0 requires zero setup |
| Expo Push API direct | OneSignal | OneSignal adds a third-party dependency and token lifecycle management overhead; Expo Push is native to EAS stack |
| expo-sharing | react-native-share | expo-sharing is the Expo-managed module; react-native-share requires manual native linking in bare workflow |

**Installation (new packages only):**
```bash
npx expo install expo-notifications expo-device expo-sharing
```
expo-file-system and expo-constants are already installed.

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── features/
│   ├── notifications/       # NOTF-01, NOTF-02, NOTF-03
│   │   ├── hooks.ts         # usePushTokenRegistration, useNotificationDeepLink, useReminderConfig
│   │   └── types.ts
│   ├── currency/            # CURR-01 through CURR-04
│   │   ├── hooks.ts         # useGroupCurrency, useFxRate
│   │   └── types.ts
│   └── export/              # EXPT-01
│       └── hooks.ts         # useExportGroupCsv
supabase/
├── functions/
│   ├── push-notify/         # DB webhook handler → Expo Push API (NOTF-01, NOTF-02)
│   │   └── index.ts
│   ├── process-reminders/   # pg_cron daily job → check balances → push (NOTF-03)
│   │   └── index.ts
│   └── fx-rates-cache/      # pg_cron hourly job → fetch fawazahmed0 → upsert fx_rates (CURR-03)
│       └── index.ts
└── migrations/
    └── 20260301000005_engagement_layer.sql   # fx_rates table, reminder_config table, pg_cron jobs
```

### Pattern 1: Push Token Registration on App Launch
**What:** On every app launch, register for push permissions, create Android channel, get Expo push token, upsert to `profiles.push_token`.
**When to use:** Always at app startup, before any screen renders that might trigger a push.
**Example:**
```typescript
// src/features/notifications/hooks.ts
// Source: https://docs.expo.dev/versions/latest/sdk/notifications/
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { supabase } from '@/lib/supabase'

export async function registerPushToken(): Promise<void> {
  if (!Device.isDevice) return  // Simulators/emulators reject push token requests

  // Android: create channel BEFORE requesting token
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
    })
  }

  const { status: existing } = await Notifications.getPermissionsAsync()
  let finalStatus = existing
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }
  if (finalStatus !== 'granted') return  // User denied — do not block app

  const projectId = Constants.expoConfig?.extra?.eas?.projectId
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data

  // Upsert push_token — column already exists in profiles (Phase 1 schema)
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('profiles').update({ push_token: token }).eq('id', user.id)
  }

  // Listen for mid-session token rotation (rare but required)
  Notifications.addPushTokenListener(async ({ data: newToken }) => {
    if (user) {
      await supabase.from('profiles').update({ push_token: newToken }).eq('id', user.id)
    }
  })
}
```

### Pattern 2: DB Webhook → push-notify Edge Function Chain
**What:** Supabase Database Webhook fires on INSERT into `expenses` or `settlements` table → calls `push-notify` Edge Function which looks up recipient push tokens and POSTs to Expo Push API.
**When to use:** This is the server-side pattern for NOTF-01 (expense added) and NOTF-02 (settlement recorded).
**Example (Edge Function skeleton):**
```typescript
// supabase/functions/push-notify/index.ts
// Source: https://supabase.com/docs/guides/functions/examples/push-notifications
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const payload = await req.json()  // DB Webhook payload: { type, table, record, old_record }
  const { table, record } = payload

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!   // Service role OK in Edge Function — not in mobile bundle
  )

  // Collect recipient user_ids based on table type
  let recipientUserIds: string[] = []
  let title = '', body = '', dataUrl = ''

  if (table === 'expenses') {
    // Notify all group members except the expense creator
    const { data: members } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', record.group_id)
      .neq('user_id', record.created_by)
      .not('user_id', 'is', null)
    recipientUserIds = (members ?? []).map((m: any) => m.user_id)
    title = 'New expense added'
    body = record.description
    dataUrl = `/groups/${record.group_id}/expenses/${record.id}`
  } else if (table === 'settlements') {
    // Notify the payee (the person being paid)
    const { data: payeeMember } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('id', record.payee_id)
      .single()
    if (payeeMember?.user_id) recipientUserIds = [payeeMember.user_id]
    title = 'Settlement recorded'
    body = `You received a payment`
    dataUrl = `/groups/${record.group_id}/settlements`
  }

  if (recipientUserIds.length === 0) return new Response('no recipients', { status: 200 })

  // Fetch push tokens from profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('push_token')
    .in('id', recipientUserIds)
    .not('push_token', 'is', null)

  const tokens = (profiles ?? []).map((p: any) => p.push_token).filter(Boolean)
  if (tokens.length === 0) return new Response('no tokens', { status: 200 })

  // Batch up to 100 per Expo Push API limits
  const messages = tokens.map((to: string) => ({
    to,
    title,
    body,
    sound: 'default',
    data: { url: dataUrl },
  }))

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('EXPO_ACCESS_TOKEN')}`,
    },
    body: JSON.stringify(messages),
  })

  // TODO: Check receipts async to handle DeviceNotRegistered (null out stale tokens)
  return new Response(JSON.stringify(await response.json()), { status: 200 })
})
```

### Pattern 3: Deep Link from Notification Tap (expo-router)
**What:** Store a URL path in `notification.data.url`, then use `useLastNotificationResponse` + `router.push()` to navigate on tap.
**When to use:** Required for NOTF-01/NOTF-02 success criterion (notification taps deep-link to relevant screen).
**Example:**
```typescript
// app/_layout.tsx — add inside root layout component
// Source: https://docs.expo.dev/push-notifications/receiving-notifications/
import * as Notifications from 'expo-notifications'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'

export function useNotificationDeepLink() {
  const router = useRouter()

  useEffect(() => {
    // Handle tap when app is already running (foreground/background)
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = response.notification.request.content.data?.url as string | undefined
      if (url) router.push(url as any)
    })
    // Handle tap that cold-started the app
    Notifications.getLastNotificationResponse().then((response) => {
      if (response) {
        const url = response.notification.request.content.data?.url as string | undefined
        if (url) router.push(url as any)
      }
    })
    return () => sub.remove()
  }, [router])
}
```

### Pattern 4: FX Rates Cache (pg_cron + Edge Function)
**What:** Hourly pg_cron job calls `fx-rates-cache` Edge Function, which fetches from fawazahmed0 exchange-api and upserts into a `fx_rates` table. Mobile client queries this table at expense-creation time.
**When to use:** CURR-03 — rates must be server-side to be consistent and reliable across devices.
**Example SQL migration:**
```sql
-- fx_rates table: one row per currency code, updated hourly
CREATE TABLE public.fx_rates (
  currency      TEXT PRIMARY KEY,   -- e.g., 'EUR', 'GBP', 'JPY'
  rate_to_usd   NUMERIC(18, 8) NOT NULL,  -- how many USD = 1 unit of currency
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fx_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_can_read_fx_rates" ON public.fx_rates FOR SELECT USING (true);

-- pg_cron: schedule fx-rates-cache Edge Function hourly
-- (run after enabling pg_cron and pg_net extensions)
SELECT cron.schedule(
  'fx-rates-hourly',
  '0 * * * *',   -- every hour on the hour
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url')
           || '/functions/v1/fx-rates-cache',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'anon_key')
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

**Edge Function (fx-rates-cache):**
```typescript
// supabase/functions/fx-rates-cache/index.ts
// Source: https://github.com/fawazahmed0/exchange-api
Deno.serve(async (_req) => {
  // Fetch all rates relative to USD from fawazahmed0 exchange-api
  // endpoint: /v1/currencies/usd.json → { usd: { eur: 0.92, gbp: 0.79, ... } }
  const res = await fetch(
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'
  )
  const json = await res.json()
  const rates: Record<string, number> = json.usd   // { eur: 0.92, gbp: 0.79, ... }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Upsert all rates (upsert on primary key 'currency')
  const rows = Object.entries(rates).map(([currency, rate]) => ({
    currency: currency.toUpperCase(),
    rate_to_usd: 1 / rate,  // convert: how many USD per 1 unit of currency
    fetched_at: new Date().toISOString(),
  }))

  await supabase.from('fx_rates').upsert(rows, { onConflict: 'currency' })
  return new Response(JSON.stringify({ updated: rows.length }), { status: 200 })
})
```

### Pattern 5: Smart Reminders (pg_cron daily + reminder_config table)
**What:** A `reminder_config` table stores per-group-member reminder settings (enabled, delay_days). A daily pg_cron job calls `process-reminders` Edge Function, which computes current balances, filters debts older than delay_days, and dispatches push notifications.
**When to use:** NOTF-03 — configurable, opt-in, adjustable by user at any time.
**Schema:**
```sql
CREATE TABLE public.reminder_config (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id      UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  enabled       BOOLEAN NOT NULL DEFAULT true,
  delay_days    INTEGER NOT NULL DEFAULT 3 CHECK (delay_days >= 1 AND delay_days <= 30),
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, group_id)
);
ALTER TABLE public.reminder_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_manage_own_reminder_config"
  ON public.reminder_config
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### Pattern 6: CSV Export (Client-Side)
**What:** Build CSV string from TanStack Query cached expense data (or a fresh Supabase query), write to `FileSystem.cacheDirectory`, share via `Sharing.shareAsync`.
**When to use:** EXPT-01 — no server-side component needed; data already available from existing hooks.
**Example:**
```typescript
// src/features/export/hooks.ts
// Source: https://docs.expo.dev/versions/latest/sdk/filesystem/
// Source: https://docs.expo.dev/versions/latest/sdk/sharing/
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'

export async function exportGroupCsv(groupId: string, expenses: Expense[]): Promise<void> {
  const header = 'Date,Description,Amount,Currency,Base Amount,Base Currency,Split Type,Category,Payer\n'
  const rows = expenses.map(e =>
    [
      e.expense_date,
      `"${e.description.replace(/"/g, '""')}"`,  // Escape quotes per RFC 4180
      (e.amount_cents / 100).toFixed(2),
      e.currency,
      (e.amount_base_cents / 100).toFixed(2),
      e.base_currency,
      e.split_type,
      e.category ?? '',
      e.payer_id ?? '',
    ].join(',')
  ).join('\n')

  const csv = header + rows
  const fileUri = FileSystem.cacheDirectory + `expenses-${groupId}-${Date.now()}.csv`
  await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 })

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Expenses',
      UTI: 'public.comma-separated-values-text',  // iOS UTI for CSV
    })
  }
}
```

### Anti-Patterns to Avoid
- **Float arithmetic for FX conversion:** `amount_cents * fx_rate` must go through Dinero.js or integer math. Never: `(4799 * 0.92)` → loses cents precision.
- **Computing amount_base_cents client-side at query time:** Must be computed and stored at INSERT time (`fx_rate_at_creation` column already exists). Never recalculate from current rates post-creation.
- **Not checking Device.isDevice before push token request:** Simulators will throw a native error, crashing the registration flow.
- **Not creating Android notification channel before token registration:** `getExpoPushTokenAsync` on Android requires a channel to exist; calling it without a channel silently fails on some devices.
- **Sending to stale push tokens without DeviceNotRegistered handling:** Repeated sends to invalid tokens can cause Expo to rate-limit or suspend the project's push access.
- **Storing service_role key in the mobile bundle:** Edge Functions receive service_role via environment variables only. The existing CI guard (Phase 1) already blocks this.
- **Using pg_cron with fewer than 1-minute intervals for reminders:** Daily (24h) is appropriate for debt reminders; do not run reminder checks at sub-minute cadence.
- **Writing CSV to `documentDirectory` directly on Android without SAF:** Use `cacheDirectory` + `shareAsync` instead of Storage Access Framework for simpler cross-platform compatibility with small exports.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Push notification delivery | Custom FCM/APNs integration | EAS Push Service + `exp.host/--/api/v2/push/send` | Handles FCM/APNs credential rotation, delivery retries, receipt tracking |
| FX rate fetching | Scraping or caching rates yourself | fawazahmed0 exchange-api via jsDelivr CDN | No API key, no rate limit, 200+ currencies, maintained daily |
| Scheduled jobs | Custom cron container or Lambda | Supabase pg_cron + pg_net | Already in the Supabase stack; no extra infrastructure |
| CSV building | A CSV library | Plain string concatenation with RFC 4180 escaping | Expense data is simple; no binary formats, no nested structures |
| Native share sheet | Custom share UI | `expo-sharing` shareAsync | Platform-native behavior on both iOS and Android |
| Monetary FX multiplication | `amount_cents * rate` float arithmetic | `Math.round(amount_cents * fx_rate)` as INTEGER | Project rule: all amounts are INTEGER cents; round at computation time |

**Key insight:** Every problem in Phase 3 has a direct Expo/Supabase solution that fits the existing stack. No new infrastructure categories are needed.

---

## Common Pitfalls

### Pitfall 1: Token Not Available in Expo Go (SDK 55)
**What goes wrong:** Developer calls `getExpoPushTokenAsync` in Expo Go and gets an error or undefined token.
**Why it happens:** SDK 53+ removed Expo's shared credentials from Expo Go. Push tokens require a development build.
**How to avoid:** All push notification testing must use an EAS dev client build (already established in Phase 1). No code change needed — just the right build.
**Warning signs:** "Error: Project ID must be specified" or blank token response.

### Pitfall 2: Android Channel Not Created Before Token Registration
**What goes wrong:** `getExpoPushTokenAsync` returns a token on Android but notifications are never received.
**Why it happens:** Android 8.0+ requires a notification channel before any notification can be shown. The token is issued but delivery is silently dropped.
**How to avoid:** Always call `setNotificationChannelAsync('default', {...})` before calling `getExpoPushTokenAsync` on Android.
**Warning signs:** Token exists in DB, push tickets show success, no notification on device.

### Pitfall 3: DeviceNotRegistered Receipts Ignored
**What goes wrong:** Expo Push API returns `DeviceNotRegistered` in receipts; old tokens accumulate in DB; app may be suspended from push.
**Why it happens:** User uninstalled app or revoked permissions. Tokens are stale but DB is not updated.
**How to avoid:** Implement a receipt-check step in the `push-notify` Edge Function (or a separate daily cron). On `DeviceNotRegistered`: `UPDATE profiles SET push_token = NULL WHERE push_token = $token`.
**Warning signs:** Push delivery rate drops but tickets still show "ok".

### Pitfall 4: FX Rate Applied After Creation (Balance Drift)
**What goes wrong:** Balances change day over day even with no new expenses.
**Why it happens:** FX rate is re-fetched at query/display time instead of being snapshotted at INSERT.
**How to avoid:** `fx_rate_at_creation` and `amount_base_cents` are set ONCE at INSERT and NEVER updated (already enforced in Phase 1 schema and documented in decisions). The fx-rates-cache table is only read at INSERT time, never for display.
**Warning signs:** Reported balance for a past expense differs between two users checking at different times.

### Pitfall 5: pg_cron Extension Not Enabled
**What goes wrong:** `cron.schedule(...)` SQL call fails silently or with "schema cron does not exist".
**Why it happens:** pg_cron must be explicitly enabled in Supabase Dashboard (Extensions panel) before use.
**How to avoid:** Migration SQL should check for extension or document manual step: Enable pg_cron and pg_net in Supabase Dashboard > Database > Extensions.
**Warning signs:** `ERROR: schema "cron" does not exist`.

### Pitfall 6: Open Exchange Rates Free Tier Base Currency Lock
**What goes wrong:** If using Open Exchange Rates free tier, all rates are base USD only. Getting EUR-to-GBP requires a paid plan.
**Why it happens:** Free tier restriction documented in OXR FAQ.
**How to avoid:** Use fawazahmed0 exchange-api (confirmed: any currency as base, no rate limits, no key). The fx-rates-cache Edge Function fetches usd-base rates and stores them; client computes cross-rates by dividing two USD rates.
**Warning signs:** OXR returns 403 for non-USD base queries.

### Pitfall 7: CSV Quoting and Encoding
**What goes wrong:** CSV opens with garbled characters in Excel or Numbers; description fields with commas break column alignment.
**Why it happens:** Missing RFC 4180 quote escaping and UTF-8 BOM for Excel compatibility.
**How to avoid:** Wrap all text fields in double-quotes, escape internal double-quotes as `""`. Optionally prepend `\uFEFF` (UTF-8 BOM) to the CSV string if targeting Windows Excel.
**Warning signs:** CSV opens in one column or shows `?` characters.

### Pitfall 8: Reminder Cron Running When No Users Are Registered
**What goes wrong:** `process-reminders` Edge Function runs hourly/daily and throws errors when `reminder_config` is empty (new deployment).
**Why it happens:** Edge Function not guarded for empty result sets.
**How to avoid:** Guard all reminder processing with early return on empty query results. Cron timing: daily at a low-traffic hour (e.g., 08:00 UTC).

---

## Code Examples

Verified patterns from official sources:

### EAS Token Registration (Minimal Working Pattern)
```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/notifications/
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

// Set foreground handler ONCE at module level (not inside component)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

async function getAndRegisterToken(): Promise<string | null> {
  if (!Device.isDevice) return null

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default notifications',
      importance: Notifications.AndroidImportance.MAX,
    })
  }

  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') return null

  const projectId = Constants.expoConfig?.extra?.eas?.projectId
  return (await Notifications.getExpoPushTokenAsync({ projectId })).data
}
```

### Expo Push API Batch Send (from Edge Function)
```typescript
// Source: https://docs.expo.dev/push-notifications/sending-notifications/
// Rate limits: 600/sec, max 100 per request
const messages = tokens.map((to: string) => ({
  to,
  sound: 'default',
  title: 'New expense',
  body: description,
  data: { url: `/groups/${groupId}/expenses/${expenseId}` },
}))

const res = await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${Deno.env.get('EXPO_ACCESS_TOKEN')}`,
  },
  body: JSON.stringify(messages.slice(0, 100)),  // Respect 100-message limit
})
const { data: tickets } = await res.json()
// tickets: Array<{ status: 'ok', id: string } | { status: 'error', details: { error: string } }>
```

### FX Rate Cross-Rate Computation
```typescript
// Source: project decision — all amounts stored as INTEGER cents
// fawazahmed0 API stores rates relative to USD: { USD: { EUR: 0.92, GBP: 0.79, JPY: 149.5 } }
// To convert FROM any currency TO group base currency:
// rate = (rate_to_usd[expense_currency]) / (rate_to_usd[base_currency])
// amount_base_cents = Math.round(amount_cents * rate)

function computeBaseCents(
  amountCents: number,
  expenseCurrency: string,   // e.g., 'GBP'
  baseCurrency: string,       // e.g., 'EUR'
  rates: Record<string, number>  // { USD: 1, EUR: 0.92, GBP: 0.79 } (rate_to_usd values)
): { amountBaseCents: number; fxRate: number } {
  if (expenseCurrency === baseCurrency) return { amountBaseCents: amountCents, fxRate: 1.0 }
  const expenseRateToUsd = rates[expenseCurrency] ?? 1
  const baseRateToUsd = rates[baseCurrency] ?? 1
  const fxRate = expenseRateToUsd / baseRateToUsd  // GBP → EUR conversion rate
  const amountBaseCents = Math.round(amountCents * fxRate)
  return { amountBaseCents, fxRate }
}
```

### CSV Export (RFC 4180 compliant)
```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/filesystem/
// Source: https://docs.expo.dev/versions/latest/sdk/sharing/
function buildCsv(expenses: Expense[]): string {
  const BOM = '\uFEFF'  // UTF-8 BOM for Excel compatibility
  const header = 'Date,Description,Amount,Currency,Base Amount,Base Currency,Split Type,Category\n'
  const rows = expenses.map(e => {
    const desc = `"${(e.description ?? '').replace(/"/g, '""')}"`
    return [
      e.expense_date,
      desc,
      (e.amount_cents / 100).toFixed(2),
      e.currency,
      (e.amount_base_cents / 100).toFixed(2),
      e.base_currency,
      e.split_type,
      `"${(e.category ?? '').replace(/"/g, '""')}"`,
    ].join(',')
  })
  return BOM + header + rows.join('\n')
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Push tokens in Expo Go dev | Dev build required for push (SDK 53+) | SDK 53 (2024) | Must use EAS dev client — already the project standard since Phase 1 |
| Polling for receipt status in same request | Async receipt check via GET `/--/api/v2/push/getReceipts` | Always | Receipts arrive 15+ min after send; must check separately |
| Firebase direct integration for RN push | EAS Push Service as intermediary | 2022+ | EAS handles FCM V1 API, APNs token rotation automatically |
| Open Exchange Rates (free, USD-base-only) | fawazahmed0 exchange-api (free, any base, no key) | 2022+ | Zero infrastructure overhead for FX |
| pg_cron via raw SQL only | Supabase Dashboard Cron UI + SQL | 2024 (Supabase Cron module) | Both paths valid; SQL preferred for IaC / migration files |

**Deprecated/outdated:**
- Expo Push Notification Receipts via Legacy API: Use the v2 API (`/v2/push/send`, `/v2/push/getReceipts`) — the older API is no longer documented.
- Expo Go push testing: Removed in SDK 53. Dev builds only.

---

## Open Questions

1. **Receipt check async job**
   - What we know: DeviceNotRegistered errors appear in receipts (not tickets), 15+ min after send; need to null out stale tokens.
   - What's unclear: Whether to implement receipt checking inside the `push-notify` function (synchronously, polling) or as a separate daily cron job.
   - Recommendation: Implement a separate `process-push-receipts` pg_cron daily job that checks receipts from the previous day. Simpler and decoupled. Store ticket IDs in an intermediate table or skip if volume is low (this app's user base is small initially).

2. **Reminder "debt amount" computation in Edge Function**
   - What we know: The simplify-debts algorithm runs in the existing `simplify-debts` Edge Function. The `process-reminders` function needs to know who owes whom.
   - What's unclear: Whether `process-reminders` should call `simplify-debts` internally or compute simplified debts directly from the expense/settlement tables.
   - Recommendation: Compute balances directly from `expense_splits` and `settlements` with a SQL aggregate in the Edge Function. Simpler than chaining Edge Functions.

3. **Currency picker UI — which currencies to show**
   - What we know: fawazahmed0 supports 200+ currencies; showing all 200+ in a picker is impractical.
   - What's unclear: Whether to show a curated list or let users search.
   - Recommendation: Provide a hardcoded list of ~50 most common currencies (ISO 4217) with a search filter. Store the full fx_rates table but restrict the picker to common ones.

---

## Sources

### Primary (HIGH confidence)
- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/) — getExpoPushTokenAsync params, setNotificationChannelAsync, addPushTokenListener, permission patterns
- [Expo Push Notifications Setup](https://docs.expo.dev/push-notifications/push-notifications-setup/) — SDK 53+ Expo Go restriction, EAS dev client requirement
- [Expo Sending Notifications Docs](https://docs.expo.dev/push-notifications/sending-notifications/) — Expo Push API endpoint, payload format, rate limits (600/sec, 100/request), tickets vs receipts, DeviceNotRegistered handling
- [Expo Receiving Notifications Docs](https://docs.expo.dev/push-notifications/receiving-notifications/) — addNotificationResponseReceivedListener, getLastNotificationResponse patterns
- [Supabase Push Notifications Example](https://supabase.com/docs/guides/functions/examples/push-notifications) — DB webhook → Edge Function → Expo Push API full pattern
- [Supabase Database Webhooks](https://supabase.com/docs/guides/database/webhooks) — webhook payload structure (InsertPayload type), pg_net async behavior
- [Supabase Schedule Functions](https://supabase.com/docs/guides/functions/schedule-functions) — pg_cron + pg_net pattern, Vault secret storage, cron expression format
- [Supabase Cron Overview](https://supabase.com/docs/guides/cron) — job storage in cron.job, cron.job_run_details, max 8 concurrent jobs, 10-min cap
- [fawazahmed0 exchange-api README](https://github.com/fawazahmed0/exchange-api) — endpoint format, daily updates, 200+ currencies, no rate limits, jsDelivr CDN
- [Expo FileSystem Docs](https://docs.expo.dev/versions/latest/sdk/filesystem/) — writeAsStringAsync, cacheDirectory, EncodingType.UTF8
- [Expo Sharing Docs](https://docs.expo.dev/versions/latest/sdk/sharing/) — shareAsync, mimeType, UTI parameter for iOS

### Secondary (MEDIUM confidence)
- [Open Exchange Rates FAQ](https://openexchangerates.org/faq) — free tier USD-only base currency restriction confirmed; not used in this project
- [WebSearch: Android POST_NOTIFICATIONS permission](https://github.com/expo/expo/issues/19043) — Android 13+ requires channel creation before token request; corroborated by Expo docs

### Tertiary (LOW confidence)
- Various community posts on notification deep-linking with expo-router — corroborated by official Expo receiving-notifications docs pattern

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified against official Expo and Supabase docs
- Architecture: HIGH — Push/webhook pattern taken directly from Supabase official push-notifications example; FX cache pattern from Supabase cron docs
- Pitfalls: HIGH — Android channel pitfall and DeviceNotRegistered confirmed via Expo official docs and community issue reports; SDK 53 Expo Go restriction confirmed in setup docs
- FX rate source: HIGH — fawazahmed0 README verified directly; no-rate-limit and daily update confirmed

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (30 days — Expo and Supabase APIs are stable; fawazahmed0 CDN URL format could change with new releases)

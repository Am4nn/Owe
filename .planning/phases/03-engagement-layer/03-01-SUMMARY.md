---
phase: 03-engagement-layer
plan: "01"
subsystem: notifications
tags:
  - push-notifications
  - expo-notifications
  - edge-functions
  - pg-cron
  - deep-link
dependency_graph:
  requires:
    - 01-foundation (profiles.push_token column)
    - 02-core-expense-loop (expenses, settlements, group_members tables)
  provides:
    - fx_rates table (for 03-02 multi-currency)
    - reminder_config table (NOTF-03 smart reminders)
    - push-notify Edge Function (NOTF-01, NOTF-02)
    - process-reminders Edge Function (NOTF-03)
    - registerPushToken / useNotificationDeepLink / useReminderConfig hooks
  affects:
    - app/_layout.tsx (push token registration on auth, deep-link handler)
    - 03-02-PLAN (uses fx_rates table)
tech_stack:
  added:
    - expo-notifications ~55.0.10
    - expo-device ~55.0.9
    - expo-sharing ~55.0.11
  patterns:
    - Deno Edge Functions with service_role key (server-only, never in mobile bundle)
    - pg_cron guarded by extension existence check to avoid silent failure
    - DeviceNotRegistered cleanup: null out stale push_tokens on Expo push error
    - Foreground notification handler set at module-top (before component mount)
key_files:
  created:
    - supabase/migrations/20260301000005_engagement_layer.sql
    - src/features/notifications/types.ts
    - src/features/notifications/hooks.ts
    - supabase/functions/push-notify/index.ts
    - supabase/functions/process-reminders/index.ts
  modified:
    - app/_layout.tsx
    - app.json
    - package.json
decisions:
  - "expo-notifications plugin added to app.json plugins array — required for EAS build to include native push notification capabilities"
  - "registerPushToken guarded by Device.isDevice — simulators throw on getExpoPushTokenAsync; simulator users never blocked"
  - "Foreground notification handler (setNotificationHandler) placed at module-top of hooks.ts — must execute before any Notifications API call"
  - "push-notify Edge Function uses service_role key — webhook runs server-side only; anon key + RLS would not allow cross-user profile reads"
  - "pg_cron scheduling wrapped in extension check DO block — avoids migration failure on environments without pg_cron enabled"
  - "Expo push batched at 100 messages per call — Expo Push API enforces this limit per request"
metrics:
  duration: "4 minutes"
  completed_date: "2026-03-01"
  tasks_completed: 3
  files_created: 5
  files_modified: 3
---

# Phase 03 Plan 01: Push Notification Chain Summary

**One-liner:** Full Expo push notification chain — DB schema, token lifecycle hooks, push-notify DB webhook handler (expenses + settlements), deep-link navigation, and daily process-reminders pg_cron Edge Function for configurable smart debt nudges.

## What Was Built

### Task 1: DB Migration (befeecd)

`supabase/migrations/20260301000005_engagement_layer.sql`:

- **fx_rates table** — PRIMARY KEY on `currency`, `rate_to_usd NUMERIC(18,8)`, RLS with anon read policy. Consumed by Plan 03-02 multi-currency feature.
- **reminder_config table** — per-user per-group reminder settings (`enabled`, `delay_days` 1-30), UNIQUE (user_id, group_id), RLS scoped to `auth.uid()`.
- **pg_cron jobs** — guarded DO block checks for pg_cron extension before scheduling `fx-rates-hourly` (every hour) and `process-reminders-daily` (08:00 UTC). Uses `vault.decrypted_secrets` for project_url/anon_key.

### Task 2: Push Token Hooks + Layout Wiring (d91f0e3)

`src/features/notifications/types.ts`:
- `ReminderConfig` — mirrors reminder_config table row
- `UpsertReminderConfigInput` — input shape for upsert mutation

`src/features/notifications/hooks.ts`:
- `registerPushToken()` — async function (not a hook): device guard, Android channel setup before token request, permission request (non-blocking if denied), `getExpoPushTokenAsync` with EAS projectId, upserts to `profiles.push_token`, adds token rotation listener
- `useNotificationDeepLink()` — hook: handles cold-start last notification response + foreground/background tap subscriptions, navigates via `router.push(data.url)`, returns cleanup
- `useReminderConfig(groupId)` — hook: React Query query + upsert mutation for reminder_config with `onConflict: 'user_id,group_id'`

`app/_layout.tsx`:
- Added `useEffect(() => { if (session) registerPushToken() }, [session])` inside `RootNavigator`
- Added `useNotificationDeepLink()` call unconditionally (handles cold-start regardless of auth state)
- Original module-level setup preserved (onlineManager + setMutationDefaults)

`app.json`:
- Added `"expo-notifications"` to plugins array (required for EAS native build)

### Task 3: Edge Functions (22e3faa)

`supabase/functions/push-notify/index.ts` (NOTF-01, NOTF-02):
- Receives DB webhook POST `{ type, table, record }` for `expenses` and `settlements` INSERT events
- **expenses branch (NOTF-01):** queries group_members for all non-creator members, fetches push tokens, sends notification with deep-link to `/groups/{id}/expenses/{id}`
- **settlements branch (NOTF-02):** queries group_members for payee member, fetches token, sends notification with deep-link to `/groups/{id}/settlements`
- Handles `DeviceNotRegistered` Expo receipts by nulling out stale push_tokens in profiles
- Batches 100 messages per Expo API request

`supabase/functions/process-reminders/index.ts` (NOTF-03):
- Triggered by pg_cron daily at 08:00 UTC
- Iterates all `reminder_config` rows with `enabled = true`
- Resolves `group_members.id` for each (user_id, group_id) pair
- Queries `expense_splits` older than `delay_days` cutoff for that member
- Filters to splits where member is not the payer (they owe money)
- Sends push with `"You still owe $X.XX — tap to settle up"` and deep-link to group
- Sends in batches of 100

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| `registerPushToken` is an async function, not a React hook | Called inside `useEffect` in layout — does not use any hook internally, avoids Rules of Hooks violation |
| `Device.isDevice` guard first in registerPushToken | Simulators throw on `getExpoPushTokenAsync`; guard must precede Android channel setup |
| Android notification channel set before permission request | React Native docs require channel to exist before first token fetch on Android |
| Service role key in Edge Functions | DB webhook + cron context is fully server-side; anon key + RLS would block cross-user profile reads needed for push dispatch |
| pg_cron extension guard in migration DO block | Avoids migration failure in dev environments without pg_cron; scheduling silently skipped |
| Expo push batched at 100 | Expo Push API limit per request; process-reminders iterates in chunks |
| DeviceNotRegistered cleanup | Keeps profiles.push_token clean; reduces wasted Expo API calls on future sends |

## Deviations from Plan

### Auto-added items

**1. [Rule 2 - Missing Config] Added expo-notifications to app.json plugins**
- **Found during:** Task 2
- **Issue:** expo-notifications requires a config plugin entry in app.json to include native push capabilities in EAS builds. Without it, push permission requests would fail silently on EAS builds.
- **Fix:** Added `"expo-notifications"` to the plugins array in app.json
- **Files modified:** app.json

### Pre-existing TypeScript errors (out of scope, not fixed)

The following pre-existing TS errors exist in unrelated files and were NOT caused by this plan's changes:
- `app/(app)/groups/new.tsx` — Zod resolver type mismatch (pre-existing)
- `src/lib/persister.ts` — MMKV `.delete()` method type error (pre-existing)

These are logged here for awareness. Notification files (`hooks.ts`, `types.ts`, `_layout.tsx`) compile without errors.

## Manual Setup Required (post-deployment)

1. **Supabase Dashboard > Database > Extensions:** Enable `pg_cron` and `pg_net`
2. **Supabase Dashboard > Vault:** Add secrets `project_url` and `anon_key`
3. **Supabase Dashboard > Database > Webhooks:** Create two webhooks pointing to `/functions/v1/push-notify`:
   - Table: `expenses`, Events: INSERT
   - Table: `settlements`, Events: INSERT
4. **Supabase Dashboard > Edge Functions > Secrets:** Add `EXPO_ACCESS_TOKEN` (from expo.dev Account > Access Tokens)
5. **Storage bucket `avatars`** (from Phase 1) — still required for avatar uploads

## Self-Check: PASSED

All created files confirmed on disk. All task commits confirmed in git log.

| Check | Result |
|-------|--------|
| supabase/migrations/20260301000005_engagement_layer.sql | FOUND |
| src/features/notifications/types.ts | FOUND |
| src/features/notifications/hooks.ts | FOUND |
| supabase/functions/push-notify/index.ts | FOUND |
| supabase/functions/process-reminders/index.ts | FOUND |
| .planning/phases/03-engagement-layer/03-01-SUMMARY.md | FOUND |
| commit befeecd (DB migration) | FOUND |
| commit d91f0e3 (notification hooks + layout) | FOUND |
| commit 22e3faa (Edge Functions) | FOUND |

---
phase: 14
plan: 1
subsystem: email-invites
tags: [email, resend, edge-function, supabase, webhooks]
dependency_graph:
  requires: [group_invites table (Phase 1), group_members RLS (Phase 5), useInviteMember hook (Bug Fixes)]
  provides: [send-invite-email Edge Function, email_sent_at audit column]
  affects: [group_invites table]
tech_stack:
  added: [Resend API (email delivery)]
  patterns: [DB Webhook → Edge Function pipeline (identical to push-notify), service_role server-only pattern]
key_files:
  created:
    - supabase/migrations/20260303000001_invite_email_sent_flag.sql
    - supabase/functions/send-invite-email/index.ts
    - .env.example
  modified:
    - .env.example
decisions:
  - Resend API is the sole email provider — no secondary provider
  - email_sent_at column provides both audit trail and duplicate-send safety net for manual re-triggers
  - DB Webhook fires on INSERT only — primary duplicate guard is the webhook trigger scope itself
  - RESEND_FROM falls back to invites@resend.dev if unset — allows sandbox testing without dashboard config
  - SUPABASE_SERVICE_ROLE_KEY consumed server-side in Edge Function only — never in mobile bundle
metrics:
  duration: "~5 min"
  completed: "2026-03-03"
  tasks: 3
  files: 3
---

# Phase 14 Plan 1: Email Invite Delivery Summary

**One-liner:** Supabase DB Webhook → `send-invite-email` Edge Function pipeline delivering branded HTML invite emails via Resend API, with `email_sent_at` duplicate guard and full audit trail.

## What Was Built

The complete email invite delivery pipeline for the Owe app:

1. **Migration** (`20260303000001_invite_email_sent_flag.sql`) — Added nullable `email_sent_at TIMESTAMPTZ` column to `group_invites`. This column is stamped by the Edge Function after a successful send, providing an audit trail and serving as a safety net against manual re-triggers.

2. **Edge Function** (`supabase/functions/send-invite-email/index.ts`) — A `Deno.serve` webhook handler that:
   - Receives the `group_invites` row on INSERT from Supabase DB Webhook
   - Skips immediately if `email_sent_at` is already set (manual re-trigger guard)
   - Fetches group name and inviter display name from Supabase via service_role key
   - Sends a branded HTML email (dark theme, gradient CTA button, invite details card) via Resend API
   - Stamps `email_sent_at` after successful send

3. **`.env.example`** — Added `RESEND_FROM` variable alongside existing `RESEND_API_KEY`, documenting both required Resend secrets.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| A — Migration | `a103889` | chore(14-01): add email_sent_at migration for group_invites |
| B — Edge Function | `08952e1` | feat(14-01): add send-invite-email Edge Function |
| C — .env.example | `7fd6998` | chore(14-01): document RESEND_FROM in .env.example |

## Deviations from Plan

None — plan executed exactly as written.

## Verification Checklist (Manual Steps Required)

The following require live Supabase + Resend accounts and cannot be automated:

- [ ] `supabase db push` — applies migration, `email_sent_at` column appears on `group_invites`
- [ ] `supabase functions deploy send-invite-email --no-verify-jwt` — deploys Edge Function
- [ ] `supabase secrets set RESEND_API_KEY=<key> RESEND_FROM="Owe <invites@resend.dev>"` — sets Vault secrets
- [ ] Create DB Webhook in Supabase Dashboard: `group_invites → INSERT → Edge Function URL`
- [ ] App: tap **Invite Member** → enter real email → tap **Send** → email arrives with correct group name + inviter
- [ ] `group_invites.email_sent_at` is non-null after send
- [ ] `supabase functions logs send-invite-email --tail` shows `{ sent: 1 }` — no 500s

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| `supabase/migrations/20260303000001_invite_email_sent_flag.sql` exists | ✅ FOUND |
| `supabase/functions/send-invite-email/index.ts` exists | ✅ FOUND |
| `.env.example` exists and contains RESEND_FROM | ✅ FOUND |
| Commit `a103889` (migration) exists | ✅ FOUND |
| Commit `08952e1` (Edge Function) exists | ✅ FOUND |
| Commit `7fd6998` (.env.example) exists | ✅ FOUND |

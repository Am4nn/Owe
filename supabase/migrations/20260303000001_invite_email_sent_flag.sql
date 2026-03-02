-- ─────────────────────────────────────────────────────────────────────────────
-- Phase 14: Add email_sent_at to group_invites — duplicate-send guard
-- ─────────────────────────────────────────────────────────────────────────────
-- email_sent_at is NULL until the send-invite-email Edge Function sets it.
-- The DB Webhook fires only on INSERT so duplicate sends are not possible via
-- the webhook trigger. This column provides an audit trail and is checked in
-- the Edge Function as a safety net for manual re-triggers.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.group_invites
  ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;

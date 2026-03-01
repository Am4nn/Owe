-- =============================================================================
-- Migration: 20260301000005_engagement_layer.sql
-- Phase:     03 — Engagement Layer
-- Plans:     03-01 (notifications), 03-02 (multi-currency FX)
--
-- Prerequisites (must be enabled in Supabase Dashboard > Database > Extensions):
--   - pg_cron   — for scheduled jobs (fx-rates-hourly, process-reminders-daily)
--   - pg_net    — for HTTP calls from pg_cron jobs
--   - Vault     — for secret storage (project_url, anon_key)
--
-- Without pg_cron/pg_net the DO block below is a no-op (guarded by extension check).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. fx_rates table (used by Plan 03-02 multi-currency)
--    Stores latest conversion rates to USD, refreshed hourly by pg_cron.
-- ---------------------------------------------------------------------------
CREATE TABLE public.fx_rates (
  currency    TEXT PRIMARY KEY,
  rate_to_usd NUMERIC(18, 8) NOT NULL,
  fetched_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fx_rates ENABLE ROW LEVEL SECURITY;

-- All authenticated and anonymous users can read exchange rates (public data)
CREATE POLICY "anon_can_read_fx_rates" ON public.fx_rates
  FOR SELECT USING (true);

-- ---------------------------------------------------------------------------
-- 2. reminder_config table (NOTF-03 — smart debt reminders)
--    Each row configures per-user per-group push reminder behaviour.
--    enabled=true + delay_days controls when the reminder fires.
-- ---------------------------------------------------------------------------
CREATE TABLE public.reminder_config (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id   UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  enabled    BOOLEAN NOT NULL DEFAULT true,
  delay_days INTEGER NOT NULL DEFAULT 3 CHECK (delay_days >= 1 AND delay_days <= 30),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, group_id)
);

ALTER TABLE public.reminder_config ENABLE ROW LEVEL SECURITY;

-- Users may only read and write their own reminder config rows
CREATE POLICY "users_manage_own_reminder_config"
  ON public.reminder_config FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 3. pg_cron scheduled jobs
--    Guarded: only scheduled if pg_cron extension is present.
--    Both jobs use pg_net.http_post to invoke Supabase Edge Functions.
--    Secrets (project_url, anon_key) are read from vault.decrypted_secrets —
--    create these secrets in the Supabase Dashboard > Vault before first run.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN

    -- Job 1: fx-rates-cache — every hour at minute 0
    PERFORM cron.schedule(
      'fx-rates-hourly',
      '0 * * * *',
      $$SELECT net.http_post(
          url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url') || '/functions/v1/fx-rates-cache',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'anon_key')
          ),
          body := '{}'::jsonb
        ) AS request_id;$$
    );

    -- Job 2: process-reminders — daily at 08:00 UTC
    PERFORM cron.schedule(
      'process-reminders-daily',
      '0 8 * * *',
      $$SELECT net.http_post(
          url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url') || '/functions/v1/process-reminders',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'anon_key')
          ),
          body := '{}'::jsonb
        ) AS request_id;$$
    );

  END IF;
END $$;

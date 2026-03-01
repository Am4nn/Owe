-- Migration: 20260301000006_add_settlement_note.sql
-- Phase 5: Schema & Notification Fixes
-- Gap: settlements table had no note column — the note field sent by useCreateSettlement
--      was silently dropped by PostgREST on every INSERT.
-- Fix: Add nullable TEXT column. Existing rows get NULL implicitly (correct — they have no note).
--      No DEFAULT needed. No NOT NULL constraint — matches TypeScript type `note: string | null`.
--      No RLS change — existing policies cover all columns in the table automatically.
--      No index needed — note is display-only, never filtered or sorted.
--      Do NOT modify 20260227000001_foundation.sql — it is already applied; editing it would
--      cause supabase db push to skip the change (migration tracked by content hash).

ALTER TABLE public.settlements ADD COLUMN note TEXT;

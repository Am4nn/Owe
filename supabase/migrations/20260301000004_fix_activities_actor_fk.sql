-- Phase 2 gap fix: correct activities.actor_id FK target
--
-- The original migration (20260228000003_expense_loop.sql) declared:
--   actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
--
-- All hook code (activity/hooks.ts, settlements/hooks.ts) resolves the current
-- user's group_members row and stores group_members.id as actor_id. The hooks
-- also query it via:
--   actor:group_members!actor_id(display_name)
--
-- This mismatch causes a FK violation on every INSERT into activities.
-- Fix: drop the profiles FK, add group_members FK.

ALTER TABLE public.activities
  DROP CONSTRAINT IF EXISTS activities_actor_id_fkey;

ALTER TABLE public.activities
  ADD CONSTRAINT activities_actor_id_fkey
    FOREIGN KEY (actor_id)
    REFERENCES public.group_members(id)
    ON DELETE SET NULL;

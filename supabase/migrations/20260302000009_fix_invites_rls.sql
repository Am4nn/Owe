-- ─────────────────────────────────────────────────────────────────────────────
-- Fix group_invites SELECT policy — replace auth.users query with auth.email()
-- ─────────────────────────────────────────────────────────────────────────────
-- Problem:
--   The SELECT policy on group_invites contained:
--     invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
--   The `authenticated` role has no SELECT on auth.users (Supabase-internal schema).
--   This caused "permission denied for table users" when useInviteMember called
--   .insert().select().single() — the RETURNING clause triggers the SELECT policy.
--
-- Fix:
--   Replace the auth.users subquery with auth.email(), a Supabase built-in
--   that returns the current user's email without requiring table access.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "members_and_invitees_can_read_invites" ON public.group_invites;

CREATE POLICY "members_and_invitees_can_read_invites"
  ON public.group_invites FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
    OR invited_email = auth.email()
  );

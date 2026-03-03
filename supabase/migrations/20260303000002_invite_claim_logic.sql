-- =============================================================================
-- Phase 15-01: Invite Claim Logic
-- =============================================================================
-- 1a. claim_pending_invites(target_user_id, target_email) — bulk auto-claim
-- 1b. accept_single_invite(p_invite_id) — per-invite UI accept
-- 2.  UPDATE RLS policy on group_invites for invitees
-- 3.  Updated handle_new_user() to auto-claim invites on sign-up
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1a. RPC: claim_pending_invites
--     Called by handle_new_user trigger (sign-up) and by client (login).
--     SECURITY DEFINER so it can INSERT group_members regardless of caller's RLS.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.claim_pending_invites(
  target_user_id UUID,
  target_email   TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  inv RECORD;
  claimed_count INTEGER := 0;
  display TEXT;
BEGIN
  -- Get user's display_name for group_members insertion
  SELECT p.display_name INTO display
    FROM public.profiles p
    WHERE p.id = target_user_id;

  IF display IS NULL THEN
    display := split_part(target_email, '@', 1);
  END IF;

  -- Loop through all pending, non-expired invites for this email
  FOR inv IN
    SELECT gi.id, gi.group_id
      FROM public.group_invites gi
      WHERE gi.invited_email = lower(target_email)
        AND gi.accepted_at IS NULL
        AND gi.expires_at > now()
  LOOP
    -- Insert into group_members — ON CONFLICT skip if already a member
    INSERT INTO public.group_members (group_id, user_id, display_name, role)
      VALUES (inv.group_id, target_user_id, display, 'member')
      ON CONFLICT (group_id, user_id) DO NOTHING;

    -- Stamp accepted_at
    UPDATE public.group_invites
      SET accepted_at = now()
      WHERE id = inv.id;

    claimed_count := claimed_count + 1;
  END LOOP;

  RETURN claimed_count;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1b. RPC: accept_single_invite(invite_id)
--     Called by client UI for per-invite accept (industry-standard UX).
--     Validates expiry, checks caller owns invite, adds user to group,
--     stamps accepted_at.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.accept_single_invite(
  p_invite_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  inv RECORD;
  caller_id UUID;
  caller_email TEXT;
  display TEXT;
BEGIN
  -- Get caller identity
  caller_id := auth.uid();
  caller_email := auth.email();

  -- Fetch the invite and validate ownership + expiry
  SELECT gi.* INTO inv
    FROM public.group_invites gi
    WHERE gi.id = p_invite_id
      AND gi.invited_email = lower(caller_email)
      AND gi.accepted_at IS NULL
      AND gi.expires_at > now();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite not found, expired, or already accepted';
  END IF;

  -- Get caller's display name
  SELECT p.display_name INTO display
    FROM public.profiles p
    WHERE p.id = caller_id;

  IF display IS NULL THEN
    display := split_part(caller_email, '@', 1);
  END IF;

  -- Add to group — ON CONFLICT skip if already a member
  INSERT INTO public.group_members (group_id, user_id, display_name, role)
    VALUES (inv.group_id, caller_id, display, 'member')
    ON CONFLICT (group_id, user_id) DO NOTHING;

  -- Stamp accepted_at
  UPDATE public.group_invites
    SET accepted_at = now()
    WHERE id = p_invite_id;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. UPDATE RLS policy — invitee can update their own invites (to set accepted_at)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "invitees_can_update_own_invites"
  ON public.group_invites FOR UPDATE
  USING (invited_email = auth.email())
  WITH CHECK (invited_email = auth.email());

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. DELETE RLS policy — invitee can decline (delete) their own invites
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "invitees_can_delete_own_invites"
  ON public.group_invites FOR DELETE
  USING (invited_email = auth.email());

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Update handle_new_user to auto-claim invites on sign-up
--    CREATE OR REPLACE preserves the existing trigger binding.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Create profile (existing behavior)
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'display_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );

  -- Auto-claim pending invites for this email (Phase 15)
  PERFORM public.claim_pending_invites(new.id, new.email);

  RETURN new;
END;
$$;

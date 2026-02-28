-- Migration: 20260228000002_google_oauth.sql
-- Phase 1.5: Patch handle_new_user trigger for Google OAuth users
--
-- Problem: The existing trigger only reads 'display_name' from raw_user_meta_data
-- (the key set during email/password signUp). Google OAuth provides 'full_name'
-- and 'avatar_url' as the keys instead.
--
-- Fix: COALESCE across both key names for display_name; add avatar_url population.
-- CREATE OR REPLACE preserves the existing trigger binding (on_auth_user_created).
-- No DROP/RECREATE of the trigger itself is needed.
--
-- AUTH-07 note: This trigger fires ONLY on INSERT into auth.users (new user creation).
-- For linked accounts (existing email/password user signs in with Google for first time),
-- Supabase adds a row to auth.identities but does NOT INSERT into auth.users.
-- The existing profile.display_name and avatar_url are preserved for linked accounts.
-- This is correct behavior — the success criterion covers "new OAuth users" only.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data ->> 'display_name',  -- email/password signup path (useSignUp sets this)
      new.raw_user_meta_data ->> 'full_name'       -- Google OAuth path (Google provides this key)
    ),
    new.raw_user_meta_data ->> 'avatar_url'        -- Google OAuth provides this; NULL for email/password (acceptable)
  );
  RETURN new;
END;
$$;

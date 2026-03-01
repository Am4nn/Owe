-- ─────────────────────────────────────────────────────────────────────────────
-- Leave Group — RLS fix for GRUP-05
-- ─────────────────────────────────────────────────────────────────────────────
-- Problem:
--   DELETE on group_members fails with FK violation because expenses,
--   expense_splits, and settlements all reference group_members(id) without
--   ON DELETE CASCADE. Deleting the row would destroy historical data.
--
-- Solution:
--   "Leaving" a group sets user_id = NULL on the member row, converting the
--   user into a named-only (non-app) member. Historical expenses and splits
--   remain intact; the display_name is preserved.
--   The UNIQUE(group_id, user_id) constraint allows multiple NULLs in PG.
--
-- This migration adds the missing UPDATE RLS policy that permits a user to
-- set user_id = NULL on their own group_members row.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "members_can_unlink_themselves"
  ON public.group_members FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id IS NULL);  -- Can only set their own user_id to NULL (leave = become named-only)

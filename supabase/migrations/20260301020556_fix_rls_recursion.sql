-- Fix infinite recursion in group_members and groups policies by using a security definer function

CREATE OR REPLACE FUNCTION public.get_auth_user_groups()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT group_id FROM public.group_members WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_auth_user_admin_groups()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT group_id FROM public.group_members WHERE user_id = auth.uid() AND role = 'admin';
$$;

-- Update group_members
DROP POLICY IF EXISTS "members_can_read_group_members" ON public.group_members;
CREATE POLICY "members_can_read_group_members"
  ON public.group_members FOR SELECT
  USING (
    group_id IN (SELECT public.get_auth_user_groups())
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "admins_can_insert_members" ON public.group_members;
CREATE POLICY "admins_can_insert_members"
  ON public.group_members FOR INSERT
  WITH CHECK (
    group_id IN (SELECT public.get_auth_user_admin_groups())
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "admins_can_delete_members" ON public.group_members;
CREATE POLICY "admins_can_delete_members"
  ON public.group_members FOR DELETE
  USING (
    group_id IN (SELECT public.get_auth_user_admin_groups())
  );

-- Update groups
DROP POLICY IF EXISTS "members_can_read_groups" ON public.groups;
CREATE POLICY "members_can_read_groups"
  ON public.groups FOR SELECT
  USING (
    id IN (SELECT public.get_auth_user_groups())
    OR created_by = auth.uid() -- Allow creator to read immediately after creation before member record is inserted!
  );

DROP POLICY IF EXISTS "members_can_update_groups" ON public.groups;
CREATE POLICY "members_can_update_groups"
  ON public.groups FOR UPDATE
  USING (
    id IN (SELECT public.get_auth_user_groups())
  )
  WITH CHECK (
    id IN (SELECT public.get_auth_user_groups())
  );

-- Update group_members_can_read_profiles
DROP POLICY IF EXISTS "group_members_can_read_profiles" ON public.profiles;
CREATE POLICY "group_members_can_read_profiles"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT user_id FROM public.group_members
      WHERE group_id IN (SELECT public.get_auth_user_groups())
      AND user_id IS NOT NULL
    )
    OR id = auth.uid()
  );

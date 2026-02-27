-- supabase/seed.sql
-- RLS validation seed: two users in overlapping groups
-- Run with: supabase db reset (applies migration then seed)

-- NOTE: In Supabase local dev, auth.users cannot be directly INSERTed from SQL.
-- Use the service role API or Supabase auth.users helper for test user creation.
-- These UUIDs are fixed for reproducible testing.

-- Insert test profiles directly (assumes auth.users already has these IDs via auth API or test setup)
INSERT INTO public.profiles (id, display_name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Alice Test'),
  ('00000000-0000-0000-0000-000000000002', 'Bob Test')
ON CONFLICT (id) DO NOTHING;

-- Alice creates Group A (she should be admin)
INSERT INTO public.groups (id, name, base_currency, created_by) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Alice Group A', 'USD', '00000000-0000-0000-0000-000000000001');

-- Bob creates Group B (he should be admin)
INSERT INTO public.groups (id, name, base_currency, created_by) VALUES
  ('10000000-0000-0000-0000-000000000002', 'Bob Group B', 'USD', '00000000-0000-0000-0000-000000000002');

-- Alice is admin of Group A, Bob is member of Group A (shared group)
INSERT INTO public.group_members (group_id, user_id, display_name, role) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Alice Test', 'admin'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Bob Test', 'member');

-- Bob is admin of Group B (Alice has NO access to Group B)
INSERT INTO public.group_members (group_id, user_id, display_name, role) VALUES
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Bob Test', 'admin');

-- Named-only member in Group A (demonstrates GRUP-03)
INSERT INTO public.group_members (group_id, user_id, display_name, role) VALUES
  ('10000000-0000-0000-0000-000000000001', NULL, 'Charlie (non-app)', 'member');

-- ─────────────────────────────────────────────────────────────
-- RLS VALIDATION QUERIES
-- Run these manually in Supabase SQL editor as authenticated User B
-- to verify User B CANNOT read User A's exclusive group (Group B's Group A view)
--
-- Expected results when authenticated as User B (bob):
--   SELECT * FROM groups WHERE id = '10000000-0000-0000-0000-000000000001' → 1 row (Bob is member)
--   SELECT * FROM groups WHERE id = '10000000-0000-0000-0000-000000000002' → 1 row (Bob is admin)
--
-- Expected results when authenticated as User A (alice):
--   SELECT * FROM groups WHERE id = '10000000-0000-0000-0000-000000000001' → 1 row (Alice is admin)
--   SELECT * FROM groups WHERE id = '10000000-0000-0000-0000-000000000002' → 0 rows (Alice NOT a member - RLS blocks)
-- ─────────────────────────────────────────────────────────────
